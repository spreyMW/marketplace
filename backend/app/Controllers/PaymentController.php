<?php

namespace App\Controllers;

use App\Models\PaymentModel;
use App\Models\OrderModel;
use App\Libraries\StripeService;

class PaymentController extends BaseController
{
    protected $paymentModel;
    protected $orderModel;
    protected $stripeService;

    public function __construct()
    {
        $this->paymentModel = new PaymentModel();
        $this->orderModel = new OrderModel();
        $this->stripeService = new StripeService();
    }

    /**
     * ==============================
     * CREATE PAYMENT INTENT
     * ==============================
     * Creates a Stripe Payment Intent for the order
     */
    public function process()
    {
        try {
            // Get JSON input
            try {
                $input = $this->request->getJSON(true);
            } catch (\Throwable $e) {
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
                    ->setJSON(['error' => 'Missing required fields: order_id, amount']);
            }

            // Check if order exists
            $order = $this->orderModel->find($input['order_id']);
            if (!$order) {
                return $this->response->setStatusCode(404)
                    ->setJSON(['error' => 'Order not found']);
            }

            // Create local payment record first
            $paymentData = [
                'order_id' => $input['order_id'],
                'transaction_id' => 'TXN-' . time() . '-' . mt_rand(1000, 9999),
                'payment_method' => $input['payment_method'] ?? 'card',
                'amount' => $input['amount'],
                'status' => 'pending',
            ];

            if (!$this->paymentModel->save($paymentData)) {
                return $this->response->setStatusCode(400)->setJSON(['error' => $this->paymentModel->errors()]);
            }

            $paymentId = $this->paymentModel->getInsertID();

            // Create Stripe Payment Intent
            $metadata = [
                'order_id' => $input['order_id'],
                'payment_id' => $paymentId,
                'customer_email' => $order['email'] ?? '',
            ];

            $result = $this->stripeService->createPaymentIntent(
                $input['amount'],
                'usd',
                $metadata
            );

            if (!$result['success']) {
                return $this->response->setStatusCode(400)->setJSON([
                    'error' => 'Failed to create payment intent',
                    'message' => $result['error']
                ]);
            }

            // Update payment with Stripe details
            $this->paymentModel->update($paymentId, [
                'reference_number' => $result['payment_intent_id'],
                'gateway_response' => json_encode($result),
                'status' => 'initiated',
            ]);

            // Return client secret and payment intent ID
            return $this->response->setStatusCode(201)->setJSON([
                'success' => true,
                'message' => 'Payment intent created successfully',
                'payment_id' => $paymentId,
                'client_secret' => $result['client_secret'],
                'payment_intent_id' => $result['payment_intent_id'],
                'publishable_key' => $this->stripeService->getPublishableKey(),
            ]);

        } catch (\Exception $e) {
            return $this->response->setStatusCode(400)->setJSON([
                'error' => 'Invalid request',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * ==============================
     * STRIPE WEBHOOK HANDLER
     * ==============================
     * Handles payment.intent.succeeded and payment.intent.payment_failed webhooks
     */
    public function result()
    {
        try {
            // Get raw input for webhook verification
            $payload = $this->request->getRawInput();
            $signature = $this->request->getHeader('Stripe-Signature')->getValue();

            log_message('info', 'Stripe Webhook received with signature: ' . $signature);

            // Verify webhook signature
            $event = $this->stripeService->verifyWebhook($payload, $signature);

            if (!$event) {
                log_message('error', 'Invalid Stripe webhook signature');
                return $this->response->setStatusCode(403)->setJSON(['error' => 'Invalid signature']);
            }

            log_message('info', 'Webhook verified. Event type: ' . $event->type);

            // Handle different event types
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    return $this->handlePaymentSucceeded($event->data->object);
                    
                case 'payment_intent.payment_failed':
                    return $this->handlePaymentFailed($event->data->object);
                    
                default:
                    log_message('info', 'Unhandled event type: ' . $event->type);
                    return $this->response->setJSON(['received' => true]);
            }

        } catch (\Exception $e) {
            log_message('error', 'Stripe Webhook error: ' . $e->getMessage());
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Webhook processing failed']);
        }
    }

    /**
     * Handle successful payment
     */
    private function handlePaymentSucceeded($paymentIntent)
    {
        try {
            $stripePaymentId = $paymentIntent->id;
            $orderId = $paymentIntent->metadata->order_id ?? null;
            $paymentId = $paymentIntent->metadata->payment_id ?? null;

            log_message('info', 'Processing successful payment for Stripe ID: ' . $stripePaymentId);

            if (!$paymentId) {
                log_message('error', 'Payment ID not found in metadata');
                return $this->response->setJSON(['received' => true]);
            }

            $payment = $this->paymentModel->find($paymentId);

            if (!$payment) {
                log_message('error', 'Payment record not found for ID: ' . $paymentId);
                return $this->response->setJSON(['received' => true]);
            }

            // Update payment status
            $this->paymentModel->update($paymentId, [
                'status' => 'completed',
                'gateway_response' => json_encode($paymentIntent),
            ]);

            // Update order status
            if ($orderId) {
                $this->orderModel->update($orderId, [
                    'payment_status' => 'paid',
                    'order_status' => 'processing'
                ]);
                log_message('info', 'Order ' . $orderId . ' marked as paid');
            }

            log_message('info', 'Payment ' . $paymentId . ' successfully processed');
            return $this->response->setJSON(['received' => true]);

        } catch (\Exception $e) {
            log_message('error', 'Error handling payment success: ' . $e->getMessage());
            return $this->response->setJSON(['received' => true]);
        }
    }

    /**
     * Handle failed payment
     */
    private function handlePaymentFailed($paymentIntent)
    {
        try {
            $stripePaymentId = $paymentIntent->id;
            $paymentId = $paymentIntent->metadata->payment_id ?? null;

            log_message('info', 'Processing failed payment for Stripe ID: ' . $stripePaymentId);

            if ($paymentId) {
                $payment = $this->paymentModel->find($paymentId);

                if ($payment) {
                    // Update payment status to failed
                    $this->paymentModel->update($paymentId, [
                        'status' => 'failed',
                        'gateway_response' => json_encode($paymentIntent),
                    ]);

                    log_message('info', 'Payment ' . $paymentId . ' marked as failed');
                }
            }

            return $this->response->setJSON(['received' => true]);

        } catch (\Exception $e) {
            log_message('error', 'Error handling payment failure: ' . $e->getMessage());
            return $this->response->setJSON(['received' => true]);
        }
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
     * Verify payment by transaction_id or reference_number (Stripe payment intent ID)
     */
    public function verify()
    {
        $input = $this->request->getJSON();

        $payment = null;

        // Check by reference_number first (Stripe Payment Intent ID)
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
     * Verify payment by order_id
     * Returns the latest payment record for the order
     */
    public function verifyByOrder()
    {
        $input = $this->request->getJSON();

        if (empty($input->order_id)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Order ID required']);
        }

        // Get the most recent payment for this order
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
     * REFUND
     * ==============================
     * Process refund via Stripe
     */
    public function refund($id)
    {
        try {
            $payment = $this->paymentModel->find($id);
            if (!$payment) {
                return $this->response->setStatusCode(404)->setJSON(['error' => 'Payment not found']);
            }

            if ($payment['status'] !== 'completed') {
                return $this->response->setStatusCode(400)
                    ->setJSON(['error' => 'Only completed payments can be refunded']);
            }

            // Process refund through Stripe
            $stripePaymentId = $payment['reference_number'];
            if (!$stripePaymentId) {
                return $this->response->setStatusCode(400)
                    ->setJSON(['error' => 'Stripe payment ID not found']);
            }

            $result = $this->stripeService->refundPayment($stripePaymentId);

            if (!$result['success']) {
                return $this->response->setStatusCode(400)->setJSON([
                    'error' => 'Refund failed',
                    'message' => $result['error']
                ]);
            }

            // Update payment status to refunded
            $this->paymentModel->update($id, [
                'status' => 'refunded',
                'gateway_response' => json_encode($result),
            ]);

            // Update order payment status
            $this->orderModel->update($payment['order_id'], ['payment_status' => 'refunded']);

            return $this->response->setJSON([
                'success' => true,
                'message' => 'Refund processed successfully',
                'refund_id' => $result['refund_id'],
            ]);

        } catch (\Exception $e) {
            return $this->response->setStatusCode(400)->setJSON([
                'error' => 'Refund processing failed',
                'message' => $e->getMessage()
            ]);
        }
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
     * Get publishable key for frontend
     */
    public function getPublishableKey()
    {
        return $this->response->setJSON([
            'publishable_key' => $this->stripeService->getPublishableKey(),
        ]);
    }

    /**
     * Deprecated: PesePay methods removed
     * These methods were used for PesePay and are no longer needed
     */
    public function makePayment()
    {
        return $this->response->setStatusCode(410)->setJSON([
            'error' => 'PesePay integration has been replaced with Stripe',
            'message' => 'Please use the /api/payments/process endpoint'
        ]);
    }

    public function makePaymentResult()
    {
        return $this->response->setStatusCode(410)->setJSON([
            'error' => 'PesePay integration has been replaced with Stripe',
        ]);
    }
}
