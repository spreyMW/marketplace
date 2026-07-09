<?php

namespace App\Models;

use CodeIgniter\Model;

class OrderItemModel extends Model
{
    protected $table = 'order_items';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $allowedFields = ['order_id', 'product_id', 'quantity', 'price', 'subtotal'];
    protected $useTimestamps = false;
    protected $validationRules = [
        'order_id' => 'required|integer',
        'product_id' => 'required|integer',
        'quantity' => 'required|integer|greater_than[0]',
        'price' => 'required|decimal',
        'subtotal' => 'required|decimal',
    ];
    protected $validationMessages = [];
    protected $skipValidation = false;
    protected $cleanValidationRules = true;

    /**
     * Get items by order
     */
    public function getByOrder($orderId)
    {
        return $this->where('order_id', $orderId)->findAll();
    }

    /**
     * Get items with product details
     */
    public function getItemsWithProducts($orderId)
    {
        return $this->select('order_items.*, products.name, products.price')
                    ->join('products', 'products.id = order_items.product_id')
                    ->where('order_items.order_id', $orderId)
                    ->findAll();
    }
}
