<?php

namespace App\Models;

use CodeIgniter\Model;

class PaymentModel extends Model
{
    protected $table = 'payments';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $allowedFields = ['order_id', 'transaction_id', 'payment_method', 'amount', 'status', 'reference_number', 'gateway_response', 'redirect_url'];
    protected $useTimestamps = false;
    protected $validationRules = [
        'order_id' => 'required|integer',
        'transaction_id' => 'required|string|is_unique[payments.transaction_id]',
        'payment_method' => 'required|in_list[airtel_money,tnm_mpamba,card]',
        'amount' => 'required|decimal',
        'status' => 'in_list[pending,completed,failed,refunded]',
    ];
    protected $validationMessages = [];
    protected $skipValidation = false;
    protected $cleanValidationRules = true;

    /**
     * Get payments by order
     */
    public function getByOrder($orderId)
    {
        return $this->where('order_id', $orderId)->findAll();
    }

    /**
     * Get payments by status
     */
    public function getByStatus($status)
    {
        return $this->where('status', $status)->findAll();
    }

    /**
     * Get payments with order details
     */
    public function getPaymentsWithOrders()
    {
        return $this->select('payments.*, orders.order_number, orders.total_amount')
                    ->join('orders', 'orders.id = payments.order_id')
                    ->findAll();
    }
}
