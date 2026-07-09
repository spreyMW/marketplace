<?php

namespace App\Controllers;

use App\Models\OrderModel;
use App\Models\OrderItemModel;

class OrderController extends BaseController
{
    protected $orderModel;
    protected $orderItemModel;

    public function __construct()
    {
        $this->orderModel = new OrderModel();
        $this->orderItemModel = new OrderItemModel();
    }

    /**
     * Get all orders
     */
    public function index()
    {
        $db = \Config\Database::connect();
        
        // Get orders with complete data from database joins
        $orders = $db->table('orders as o')
            ->select('o.id, o.order_number, o.customer_id, o.total_amount, o.order_status, o.payment_status, o.shipping_address, o.created_at, o.updated_at,
                      u.firstname, u.lastname, u.email, u.phone')
            ->join('users as u', 'o.customer_id = u.id', 'left')
            ->orderBy('o.created_at', 'DESC')
            ->get()
            ->getResultArray();
        
        // Add payment information for each order
        $paymentModel = new \App\Models\PaymentModel();
        foreach ($orders as &$order) {
            $order['payment'] = $paymentModel->where('order_id', $order['id'])->first();
        }
        
        return $this->response->setJSON($orders);
    }

    /**
     * Get a single order
     */
    public function show($id)
    {
        $order = $this->orderModel->getWithItems($id);
        if (!$order) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Order not found']);
        }
        return $this->response->setJSON($order);
    }

    /**
     * Create a new order
     */
    public function create()
    {
        $input = $this->request->getJSON();

        // Validate required fields
        if (empty($input->customer_id) || empty($input->items)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Missing required fields']);
        }

        // Generate order number
        $orderNumber = $this->orderModel->generateOrderNumber();

        // Calculate total amount
        $totalAmount = 0;
        foreach ($input->items as $item) {
            $totalAmount += $item->subtotal;
        }
        
        // Add 10% tax
        $totalAmount = $totalAmount * 1.1;

        // Create order
        $orderData = [
            'order_number' => $orderNumber,
            'customer_id' => $input->customer_id,
            'total_amount' => $totalAmount,
            'payment_status' => 'pending',
            'order_status' => 'pending',
            'shipping_address' => $input->shipping_address ?? '',
        ];

        if (!$this->orderModel->save($orderData)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => $this->orderModel->errors()]);
        }

        $orderId = $this->orderModel->getInsertID();

        // Create order items
        foreach ($input->items as $item) {
            $itemData = [
                'order_id' => $orderId,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'price' => $item->price,
                'subtotal' => $item->subtotal,
            ];

            if (!$this->orderItemModel->save($itemData)) {
                // Rollback if item creation fails
                $this->orderModel->delete($orderId);
                return $this->response->setStatusCode(400)->setJSON(['error' => 'Failed to create order items']);
            }
        }

        return $this->response->setStatusCode(201)->setJSON([
            'message' => 'Order created successfully',
            'order_id' => $orderId,
            'order_number' => $orderNumber,
            'total_amount' => $totalAmount
        ]);
    }

    /**
     * Update an order
     */
    public function update($id)
    {
        $order = $this->orderModel->find($id);
        if (!$order) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Order not found']);
        }

        $input = $this->request->getJSON();

        if (!$this->orderModel->update($id, $input)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => $this->orderModel->errors()]);
        }

        return $this->response->setJSON(['message' => 'Order updated successfully']);
    }

    /**
     * Get order by order number
     */
    public function getByOrderNumber($orderNumber)
    {
        $order = $this->orderModel->where('order_number', $orderNumber)->first();
        if (!$order) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Order not found']);
        }

        $order['items'] = $this->orderItemModel->getItemsWithProducts($order['id']);
        return $this->response->setJSON($order);
    }
}

