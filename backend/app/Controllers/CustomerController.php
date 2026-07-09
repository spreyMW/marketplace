<?php

namespace App\Controllers;

use App\Models\UserModel;
use App\Models\OrderModel;

class CustomerController extends BaseController
{
    protected $userModel;
    protected $orderModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
        $this->orderModel = new OrderModel();
    }

    /**
     * Get all customers
     */
    public function index()
    {
        $customers = $this->userModel->getCustomers();
        
        // Add order count for each customer
        foreach ($customers as &$customer) {
            $orderCount = $this->orderModel->where('customer_id', $customer['id'])->countAllResults();
            $customer['total_orders'] = $orderCount;
        }
        
        return $this->response->setJSON($customers);
    }

    /**
     * Get single customer
     */
    public function show($id)
    {
        $customer = $this->userModel->find($id);
        if (!$customer) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Customer not found']);
        }

        // Get customer order history
        $customer['orders'] = $this->orderModel->getByUser($id);
        $customer['total_orders'] = count($customer['orders']);

        return $this->response->setJSON($customer);
    }

    /**
     * Get customer order history
     */
    public function orderHistory($id)
    {
        $customer = $this->userModel->find($id);
        if (!$customer) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Customer not found']);
        }

        $orders = $this->orderModel->getByUser($id);
        return $this->response->setJSON($orders);
    }
}
