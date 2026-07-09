<?php

namespace App\Controllers\Api;

use App\Models\PaymentModel;
use App\Models\OrderModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class PaymentController extends ResourceController
{
    protected $paymentModel;
    protected $orderModel;

    public function __construct()
    {
        $this->paymentModel = new PaymentModel();
        $this->orderModel = new OrderModel();
    }

    /**
     * Get all payments with order details
     */
    public function index(): ResponseInterface
    {
        $db = \Config\Database::connect();

        // Get payments with order and customer information
        $payments = $db->table('payments as p')
            ->select('p.id, p.order_id, p.transaction_id, p.payment_method, p.amount, 
                      p.status, p.created_at,
                      o.order_number, o.customer_id, o.total_amount as order_amount,
                      u.firstname, u.lastname, u.email')
            ->join('orders as o', 'p.order_id = o.id', 'left')
            ->join('users as u', 'o.customer_id = u.id', 'left')
            ->orderBy('p.created_at', 'DESC')
            ->get()
            ->getResultArray();

        return $this->response->setJSON($payments);
    }

    /**
     * Get single payment details
     */
    public function show($id = null): ResponseInterface
    {
        if ($id === null) {
            return $this->response->setStatusCode(404)
                ->setJSON(['message' => 'Payment ID is required']);
        }

        $payment = $this->paymentModel->find($id);

        if (!$payment) {
            return $this->response->setStatusCode(404)
                ->setJSON(['message' => 'Payment not found']);
        }

        // Get related order and customer info
        $order = $this->orderModel->find($payment['order_id']);
        if ($order) {
            $payment['order'] = $order;
            // Get customer info
            $db = \Config\Database::connect();
            $customer = $db->table('users')
                ->select('id, firstname, lastname, email, phone')
                ->where('id', $order['customer_id'])
                ->get()
                ->getRowArray();
            $payment['customer'] = $customer;
        }

        return $this->response->setJSON($payment);
    }

    /**
     * Update payment status
     */
    public function update($id = null): ResponseInterface
    {
        if ($id === null) {
            return $this->response->setStatusCode(400)
                ->setJSON(['message' => 'Payment ID is required']);
        }

        $payment = $this->paymentModel->find($id);
        if (!$payment) {
            return $this->response->setStatusCode(404)
                ->setJSON(['message' => 'Payment not found']);
        }

        $payload = $this->request->getJSON(true) ?? [];
        $allowedStatuses = ['pending', 'completed', 'failed', 'refunded'];

        if (!isset($payload['status']) || !in_array($payload['status'], $allowedStatuses)) {
            return $this->response->setStatusCode(422)
                ->setJSON(['message' => 'Invalid status value']);
        }

        $updates = ['status' => $payload['status']];

        if ($this->paymentModel->update($id, $updates)) {
            $updatedPayment = $this->paymentModel->find($id);
            return $this->response->setJSON([
                'message' => 'Payment status updated successfully',
                'payment' => $updatedPayment
            ]);
        }

        return $this->response->setStatusCode(500)
            ->setJSON(['message' => 'Failed to update payment status']);
    }

    /**
     * Get payments by order
     */
    public function getByOrder($orderId = null): ResponseInterface
    {
        if ($orderId === null) {
            return $this->response->setStatusCode(400)
                ->setJSON(['message' => 'Order ID is required']);
        }

        $payments = $this->paymentModel->where('order_id', $orderId)->findAll();

        return $this->response->setJSON($payments);
    }

    /**
     * Get payment statistics
     */
    public function stats(): ResponseInterface
    {
        $db = \Config\Database::connect();

        $totalPayments = $db->table('payments')
            ->selectCount('id', 'total_payments')
            ->selectSum('amount', 'total_amount')
            ->get()
            ->getRowArray();

        $paymentsByStatus = $db->table('payments')
            ->select('status, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('status')
            ->get()
            ->getResultArray();

        return $this->response->setJSON([
            'total_payments' => $totalPayments['total_payments'] ?? 0,
            'total_amount' => $totalPayments['total_amount'] ?? 0,
            'by_status' => $paymentsByStatus
        ]);
    }
}
