<?php

namespace App\Models;

use CodeIgniter\Model;
use App\Models\PaymentModel;
use App\Models\OrderItemModel;

class OrderModel extends Model
{
    protected $table = 'orders';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $allowedFields = ['order_number', 'customer_id', 'total_amount', 'payment_status', 'order_status', 'shipping_address'];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
    protected $validationRules = [
        'order_number' => 'required|string|is_unique[orders.order_number]',
        'customer_id' => 'required|integer',
        'total_amount' => 'required|decimal',
        'payment_status' => 'in_list[pending,paid,failed]',
        'order_status' => 'in_list[pending,processing,shipped,delivered,cancelled]',
        'shipping_address' => 'required|string',
    ];
    protected $validationMessages = [];
    protected $skipValidation = false;
    protected $cleanValidationRules = true;

    /**
     * Get orders by user
     */
    public function getByUser($userId)
    {
        return $this->where('customer_id', $userId)->findAll();
    }

    /**
     * Get orders by status
     */
    public function getByStatus($status)
    {
        return $this->where('order_status', $status)->findAll();
    }

    /**
     * Get orders with customer details
     */
    public function getWithCustomer()
    {
        $orders = $this->select('orders.*, users.firstname, users.lastname, users.email, users.phone')
                    ->join('users', 'users.id = orders.customer_id')
                    ->findAll();
        
        // Add payment information for each order
        $paymentModel = new PaymentModel();
        foreach ($orders as &$order) {
            $order['payment'] = $paymentModel->where('order_id', $order['id'])->first();
        }
        
        return $orders;
    }

    /**
     * Get order with items and payments
     */
    public function getWithItems($orderId)
    {
        $order = $this->find($orderId);
        if ($order) {
            $orderItemModel = new OrderItemModel();
            $paymentModel = new PaymentModel();
            $order['items'] = $orderItemModel->getItemsWithProducts($orderId);
            $order['payment'] = $paymentModel->where('order_id', $orderId)->first();
        }
        return $order;
    }

    /**
     * Get orders with customer and payment details (with sorting)
     */
    public function getWithCustomerAndPayments($orderBy = 'created_at', $direction = 'DESC')
    {
        $orders = $this->select('orders.*, users.firstname, users.lastname, users.email, users.phone')
                    ->join('users', 'users.id = orders.customer_id')
                    ->orderBy("orders.{$orderBy}", $direction)
                    ->findAll();
        
        // Add payment information for each order
        $paymentModel = new PaymentModel();
        foreach ($orders as &$order) {
            $order['payment'] = $paymentModel->where('order_id', $order['id'])->first();
        }
        
        return $orders;
    }

    /**
     * Generate order number
     */
    public function generateOrderNumber()
    {
        return 'ORD-' . time() . '-' . mt_rand(1000, 9999);
    }
}

