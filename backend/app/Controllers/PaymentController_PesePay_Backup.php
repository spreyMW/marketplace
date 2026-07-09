<?php

namespace App\Controllers;

use App\Models\PaymentModel;
use App\Models\OrderModel;

class PaymentController extends BaseController
{
    protected $paymentModel;
    protected $orderModel;

    public function __construct()
    {
        $this->paymentModel = new PaymentModel();
        $this->orderModel = new OrderModel();
    }

    /**
     * ==============================
     * INITIATE PESAPAY PAYMENT
     * ==============================
     */
    public function process()
    {
        try {
            // Try getJSON() first with proper error handling
            try {
                $input = $this->request->getJSON(true);
            } catch (\Throwable $e) {
                // Fallback to getRawInput
                $input = $this->request->getRawInput();
                if (is_string($input)) {
                    $input = json_decode($input, true);
                }
            }
            
            if (!is_array($input)) {
                return $this->response->setStatusCode(400)
                    ->setJSON(['error' => 'Invalid JSON format']);
            }

            // Validate required fields
            if (empty($input['order_id']) || empty($input['amount'])) {
                return $this->response->setStatusCode(400)
                    ->setJSON(['error' => 'Missing required fields']);
            }

            // Check if order exists
            $order = $this->orderModel->find($input['order_id']);
            if (!$order) {
                return $this->response->setStatusCode(404)
                    ->setJSON(['error' => 'Order not found']);
            }

            // Route ALL payments through PESEPAY
            return $this->processPesepayPayment($input, $order);

        } catch (\Exception $e) {
            return $this->response->setStatusCode(400)->setJSON([
                'error' => 'Invalid request',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Process all payments through PESEPAY gateway
     */
    private function processPesepayPayment($input, $order)
    {
        $paymentMethod = $input['payment_method'] ?? 'card';

        // 1. Create local payment record first
        $paymentData = [
            'order_id' => $input['order_id'],
            'transaction_id' => 'TXN-' . time() . '-' . mt_rand(1000, 9999),
            'payment_method' => $paymentMethod,
            'amount' => $input['amount'],
            'status' => 'pending',
        ];

        if (!$this->paymentModel->save($paymentData)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => $this->paymentModel->errors()]);
        }

        $paymentId = $this->paymentModel->getInsertID();

        // 2. Build Pesepay payload
        // Convert amount to integer (cents) - PESEPAY requires integer format
        $amountInCents = (int)round($input['amount'] * 100);
        
        $pesepayPayload = [
            "amountDetails" => [
                "amount" => $amountInCents,
                "currencyCode" => "USD"
            ],
            "reasonForPayment" => "Order #" . $input['order_id'],
            "resultUrl" => base_url('api/payments/result'),
            "returnUrl" => "http://localhost:5174/payment-success"
        ];

        // 3. Encrypt payload
        $encryptedPayload = $this->encryptPayload($pesepayPayload);

        // 4. Call Pesepay API
        $client = \Config\Services::curlrequest();

        try {
            $response = $client->post(
                env('PESEPAY_URL'),
                [
                    'headers' => [
                        'authorization' => env('PESEPAY_INTEGRATION_KEY'),
                        'Content-Type' => 'application/json'
                    ],
                    'json' => [
                        'payload' => $encryptedPayload
                    ]
                ]
            );

            $responseData = json_decode($response->getBody(), true);

            // 5. Decrypt response
            $transaction = $this->decryptPayload($responseData['payload']);

            // 6. Update payment with gateway info
            $this->paymentModel->update($paymentId, [
                'reference_number' => $transaction['referenceNumber'],
                'gateway_response' => json_encode($transaction),
                'redirect_url' => $transaction['redirectUrl'],
                'status' => 'initiated',
            ]);

            // 7. Return redirect URL to frontend
            return $this->response->setStatusCode(201)->setJSON([
                'message' => 'Payment initiated successfully',
                'payment_id' => $paymentId,
                'reference_number' => $transaction['referenceNumber'],
                'redirect_url' => $transaction['redirectUrl']
            ]);
        } catch (\Exception $e) {
            return $this->response->setStatusCode(400)->setJSON([
                'error' => 'Failed to initiate PESEPAY payment',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * ==============================
     * PESEPAY CALLBACK (RESULT URL)
     * ==============================
     */
    public function result()
    {
        try {
            // Get raw input first for logging
            $rawInput = $this->request->getRawInput();
            log_message('info', 'PESEPAY Callback raw input: ' . $rawInput);

            // Try to get JSON
            try {
                $data = $this->request->getJSON(true);
            } catch (\Throwable $e) {
                $data = json_decode($rawInput, true) ?? [];
            }

            log_message('info', 'PESEPAY Callback parsed data: ' . json_encode($data));

            // Check if payload is encrypted
            if (isset($data['payload']) && is_string($data['payload'])) {
                try {
                    // Decrypt the payload
                    $decrypted = $this->decryptPayload($data['payload']);
                    $transactionData = $decrypted;
                    log_message('info', 'PESEPAY Callback decrypted payload: ' . json_encode($transactionData));
                } catch (\Throwable $e) {
                    log_message('error', 'Failed to decrypt PESEPAY payload: ' . $e->getMessage());
                    $transactionData = $data;
                }
            } else {
                $transactionData = $data;
            }

            // Look for reference number in various possible field names
            $referenceNumber = $transactionData['referenceNumber'] 
                            ?? $transactionData['reference_number']
                            ?? $transactionData['transactionRef']
                            ?? $transactionData['transaction_ref']
                            ?? $data['referenceNumber']
                            ?? $data['reference_number']
                            ?? null;

            log_message('info', 'PESEPAY Callback reference number: ' . ($referenceNumber ?? 'NOT FOUND'));

            if (!$referenceNumber) {
                log_message('error', 'PESEPAY Callback missing reference number. Full data: ' . json_encode($data));
                return $this->response->setStatusCode(400)->setJSON(['error' => 'Invalid payment callback - missing reference number']);
            }

            // Find payment by reference number
            $payment = $this->paymentModel
                ->where('reference_number', $referenceNumber)
                ->first();

            if (!$payment) {
                log_message('error', 'Payment not found for reference: ' . $referenceNumber);
                // Don't fail - PESEPAY should get success response even if payment record not found
                return $this->response->setJSON(['received' => true]);
            }

            // Determine transaction status
            $status = ($transactionData['transactionStatus'] ?? $transactionData['status'] ?? null) === 'SUCCESS' 
                   ? 'completed' : 'failed';

            log_message('info', 'Updating payment ' . $payment['id'] . ' to status: ' . $status);

            // Update payment status
            $this->paymentModel->update($payment['id'], [
                'status' => $status,
                'gateway_response' => json_encode($transactionData)
            ]);

            // Update order if payment successful
            if ($status === 'completed') {
                $this->orderModel->update($payment['order_id'], [
                    'payment_status' => 'paid',
                    'order_status' => 'processing'
                ]);
                log_message('info', 'Order ' . $payment['order_id'] . ' marked as paid');
            }

            log_message('info', 'PESEPAY Callback processed successfully for reference: ' . $referenceNumber);
            return $this->response->setJSON(['received' => true]);
        } catch (\Exception $e) {
            log_message('error', 'PESEPAY Callback error: ' . $e->getMessage());
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Callback processing failed']);
        }
    }

    /**
     * ==============================
     * ENCRYPT PAYLOAD
     * ==============================
     */
    private function encryptPayload($data)
    {
        $key = env('PESEPAY_ENCRYPTION_KEY');
        $iv = substr($key, 0, 16);

        return openssl_encrypt(
            json_encode($data),
            'AES-256-CBC',
            $key,
            0,
            $iv
        );
    }

    /**
     * ==============================
     * DECRYPT PAYLOAD
     * ==============================
     */
    private function decryptPayload($payload)
    {
        $key = env('PESEPAY_ENCRYPTION_KEY');
        $iv = substr($key, 0, 16);

        $decrypted = openssl_decrypt(
            $payload,
            'AES-256-CBC',
            $key,
            0,
            $iv
        );

        return json_decode($decrypted, true);
    }

    /**
     * Get payment details
     */
    public function show($id)
    {
        $payment = $this->paymentModel->find($id);
        if (!$payment) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Payment not found']);
        }
        return $this->response->setJSON($payment);
    }

    /**
     * Get all payments
     */
    public function index()
    {
        $payments = $this->paymentModel->getPaymentsWithOrders();
        return $this->response->setJSON($payments);
    }

    /**
     * Verify payment by transaction_id or reference_number
     */
    public function verify()
    {
        $input = $this->request->getJSON();

        $payment = null;

        // Check by reference_number first (PESEPAY)
        if (!empty($input->reference_number)) {
            $payment = $this->paymentModel->where('reference_number', $input->reference_number)->first();
        }
        // Fallback to transaction_id
        elseif (!empty($input->transaction_id)) {
            $payment = $this->paymentModel->where('transaction_id', $input->transaction_id)->first();
        }

        if (!$payment) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Payment not found']);
        }

        return $this->response->setJSON($payment);
    }

    /**
     * Verify payment by order_id (more reliable for callback verification)
     * Returns the latest payment record for the order
     */
    public function verifyByOrder()
    {
        $input = $this->request->getJSON();

        if (empty($input->order_id)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Order ID required']);
        }

        // Get the most recent payment for this order (usually only one, but use latest just in case)
        $payment = $this->paymentModel
            ->where('order_id', $input->order_id)
            ->orderBy('created_at', 'DESC')
            ->first();

        if (!$payment) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Payment not found for this order']);
        }

        return $this->response->setJSON($payment);
    }

    /**
     * Update payment status
     */
    public function updateStatus($id)
    {
        $payment = $this->paymentModel->find($id);
        if (!$payment) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Payment not found']);
        }

        $input = $this->request->getJSON();

        if (empty($input->status)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Status required']);
        }

        // Update payment status
        $this->paymentModel->update($id, ['status' => $input->status]);

        // If payment is completed, update order status
        if ($input->status === 'completed') {
            $this->orderModel->update($payment['order_id'], ['payment_status' => 'paid']);
        }

        return $this->response->setJSON(['message' => 'Payment status updated']);
    }

    /**
     * ==============================
     * REFUND (LOGIC + PESEPAY)
     * ==============================
     */
    public function refund($id)
    {
        $payment = $this->paymentModel->find($id);
        if (!$payment) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Payment not found']);
        }

        // Update payment status to refunded
        $this->paymentModel->update($id, ['status' => 'refunded']);

        // Update order payment status
        $this->orderModel->update($payment['order_id'], ['payment_status' => 'refunded']);

        // TODO: Process refund with PESEPAY gateway if payment_method is pesepay

        return $this->response->setJSON(['message' => 'Refund processed']);
    }

    /**
     * Get payments by date range (for admin)
     */
    public function getByDateRange()
    {
        $startDate = $this->request->getGet('start_date');
        $endDate = $this->request->getGet('end_date');

        if (!$startDate || !$endDate) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Start and end dates required']);
        }

        $payments = $this->paymentModel
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->findAll();

        return $this->response->setJSON($payments);
    }

    /**
     * ==============================
     * MAKE PAYMENT (DIRECT EcoCash/Innbucks)
     * ==============================
     * Direct payment processing without redirecting to PESEPAY page
     * Supports: EcoCash (PZW211), Innbucks (PZW212)
     */
    public function makePayment()
    {
        try {
            // Try getJSON() first with proper error handling
            try {
                $input = $this->request->getJSON(true);
            } catch (\Throwable $e) {
                // Fallback to getRawInput
                $input = $this->request->getRawInput();
                if (is_string($input)) {
                    $input = json_decode($input, true);
                }
            }
            
            if (!is_array($input)) {
                return $this->response->setStatusCode(400)
                    ->setJSON(['error' => 'Invalid JSON format', 'debug' => 'Input is not an array: ' . gettype($input)]);
            }
            
            // Validate required fields
            if (empty($input['order_id']) || empty($input['amount']) || empty($input['payment_method'])) {
                return $this->response->setStatusCode(400)
                    ->setJSON(['error' => 'Missing required fields: order_id, amount, payment_method', 'received' => $input]);
            }

            // Validate payment method (only EcoCash and Innbucks allowed)
            $validMethods = ['ecocash', 'innbucks'];
            if (!in_array(strtolower($input['payment_method']), $validMethods)) {
                return $this->response->setStatusCode(400)
                    ->setJSON(['error' => 'Payment method not supported. Use: ecocash or innbucks']);
            }

            // For EcoCash, phone number is required
            if (strtolower($input['payment_method']) === 'ecocash' && empty($input['phone_number'])) {
                return $this->response->setStatusCode(400)
                    ->setJSON(['error' => 'Phone number required for EcoCash']);
            }

            // Check if order exists
            $order = $this->orderModel->find($input['order_id']);
            if (!$order) {
                return $this->response->setStatusCode(404)
                    ->setJSON(['error' => 'Order not found']);
            }

            // 1. Create local payment record first
            $paymentData = [
                'order_id' => $input['order_id'],
                'transaction_id' => 'TXN-' . time() . '-' . mt_rand(1000, 9999),
                'payment_method' => $input['payment_method'],
                'amount' => $input['amount'],
                'status' => 'pending',
            ];

            if (!$this->paymentModel->save($paymentData)) {
                return $this->response->setStatusCode(400)->setJSON(['error' => $this->paymentModel->errors()]);
            }

            $paymentId = $this->paymentModel->getInsertID();

            // 2. Map payment method to PESEPAY code
            $paymentMethodCode = strtolower($input['payment_method']) === 'ecocash' ? 'PZW211' : 'PZW212';

            // 3. Build Make Payment payload
            $makePaymentPayload = [
                "amountDetails" => [
                    "amount" => (int)$input['amount'],
                    "currencyCode" => "ZWL"
                ],
                "merchantReference" => "ORD-" . $input['order_id'] . "-" . time(),
                "reasonForPayment" => "Order #" . $input['order_id'],
                "resultUrl" => base_url('api/payments/make-payment-result'),
                "returnUrl" => "http://localhost:5174/payment-success",
                "paymentMethodCode" => $paymentMethodCode,
                "customer" => [
                    "email" => $order['email'] ?? $input['email'] ?? "",
                    "phoneNumber" => $input['phone_number'] ?? "",
                    "name" => ($order['firstname'] ?? '') . ' ' . ($order['lastname'] ?? '')
                ],
                "paymentMethodRequiredFields" => [
                    "customerPhoneNumber" => $input['phone_number'] ?? ""
                ]
            ];

            // 4. Encrypt payload
            $encryptedPayload = $this->encryptPayload($makePaymentPayload);

            // 5. Call PESEPAY Make Payment API
            $client = \Config\Services::curlrequest();

            try {
                $pesepayUrl = env('PESEPAY_MAKE_PAYMENT_URL') ?? 'https://api.test.sandbox.pesepay.com/payments-engine/v1/payments/make-payment';

                $response = $client->post(
                    $pesepayUrl,
                    [
                        'headers' => [
                            'authorization' => env('PESEPAY_INTEGRATION_KEY'),
                            'Content-Type' => 'application/json'
                        ],
                        'json' => [
                            'payload' => $encryptedPayload
                        ]
                    ]
                );

                $responseData = json_decode($response->getBody(), true);

                // 6. Decrypt response
                $transaction = $this->decryptPayload($responseData['payload']);

                // 7. Update payment with gateway info
                $this->paymentModel->update($paymentId, [
                    'reference_number' => $transaction['referenceNumber'] ?? null,
                    'gateway_response' => json_encode($transaction),
                    'status' => isset($transaction['transactionStatus']) ? 
                        (strpos($transaction['transactionStatus'], 'SUCCESS') !== false ? 'completed' : 'pending') : 
                        'pending',
                ]);

                // 8. Update order if payment successful
                if (isset($transaction['transactionStatus']) && strpos($transaction['transactionStatus'], 'SUCCESS') !== false) {
                    $this->orderModel->update($input['order_id'], [
                        'payment_status' => 'paid',
                        'order_status' => 'processing'
                    ]);
                }

                // 9. Return response to frontend
                return $this->response->setStatusCode(201)->setJSON([
                    'message' => 'Payment processed',
                    'payment_id' => $paymentId,
                    'reference_number' => $transaction['referenceNumber'] ?? null,
                    'status' => $transaction['transactionStatus'] ?? 'INITIATED',
                    'transaction' => $transaction
                ]);

            } catch (\Exception $e) {
                // Update payment as failed
                $this->paymentModel->update($paymentId, [
                    'status' => 'failed',
                    'gateway_response' => json_encode(['error' => $e->getMessage()])
                ]);

                return $this->response->setStatusCode(400)->setJSON([
                    'error' => 'Payment processing failed',
                    'message' => $e->getMessage(),
                    'payment_id' => $paymentId
                ]);
            }
        } catch (\Exception $e) {
            return $this->response->setStatusCode(400)->setJSON([
                'error' => 'Invalid request',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * ==============================
     * MAKE PAYMENT RESULT (CALLBACK)
     * ==============================
     */
    public function makePaymentResult()
    {
        $data = $this->request->getJSON(true);

        if (!isset($data['referenceNumber'])) {
            return $this->response->setJSON(['error' => 'Invalid callback']);
        }

        $payment = $this->paymentModel
            ->where('reference_number', $data['referenceNumber'])
            ->first();

        if (!$payment) {
            return $this->response->setJSON(['error' => 'Payment not found']);
        }

        // Update payment status
        $isSuccess = strpos($data['transactionStatus'], 'SUCCESS') !== false;
        $this->paymentModel->update($payment['id'], [
            'status' => $isSuccess ? 'completed' : 'failed',
            'gateway_response' => json_encode($data)
        ]);

        // Update order if payment successful
        if ($isSuccess) {
            $this->orderModel->update($payment['order_id'], [
                'payment_status' => 'paid',
                'order_status' => 'processing'
            ]);
        }

        return $this->response->setJSON([
            'received' => true,
            'status' => $isSuccess ? 'success' : 'failed'
        ]);
    }
}
