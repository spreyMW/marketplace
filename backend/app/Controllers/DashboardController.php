<?php

namespace App\Controllers;

use App\Models\ProductModel;

class DashboardController extends BaseController
{
    protected $productModel;

    public function __construct()
    {
        $this->productModel = new ProductModel();
    }

    /**
     * Get dashboard statistics
     */
    public function stats()
    {
        $db = \Config\Database::connect();

        // Get revenue from completed payments
        $completedRevenueResult = $db->table('payments')
            ->selectSum('amount')
            ->where('status', 'completed')
            ->get()
            ->getRow();

        $completedRevenueInCents = (float) ($completedRevenueResult->amount ?? 0);
        $completedRevenue = $completedRevenueInCents / 100;

        // Get pending revenue from orders
        $pendingRevenueResult = $db->table('orders')
            ->selectSum('total_amount')
            ->where('payment_status', 'pending')
            ->get()
            ->getRow();
        $pendingRevenue = (float) ($pendingRevenueResult->total_amount ?? 0);

        // Get paid revenue from orders
        $paidRevenueResult = $db->table('orders')
            ->selectSum('total_amount')
            ->where('payment_status', 'paid')
            ->get()
            ->getRow();
        $paidRevenue = (float) ($paidRevenueResult->total_amount ?? 0);

        // Get rejected revenue from payments
        $rejectedRevenueResult = $db->table('payments')
            ->selectSum('amount')
            ->where('status', 'failed')
            ->get()
            ->getRow();
        $rejectedRevenueInCents = (float) ($rejectedRevenueResult->amount ?? 0);
        $rejectedRevenue = $rejectedRevenueInCents / 100;

        // Total revenue is paid + pending (since pending orders have value even if not paid yet)
        $totalRevenue = $paidRevenue + $pendingRevenue;

        $stats = [
            'total_products' => (int) $this->productModel->countAll(),
            'total_orders' => (int) $db->table('orders')->countAllResults(),
            'total_revenue' => $totalRevenue,
            'paid_revenue' => $paidRevenue,
            'pending_revenue' => $pendingRevenue,
            'rejected_revenue' => $rejectedRevenue,
            'paid_orders' => (int) $db->table('orders')
                ->where('payment_status', 'paid')
                ->countAllResults(),
            'pending_orders' => (int) $db->table('orders')
                ->where('payment_status', 'pending')
                ->countAllResults(),
            'rejected_orders' => (int) $db->table('orders')
                ->where('payment_status', 'rejected')
                ->countAllResults(),
            'delivered_orders' => (int) $db->table('orders')
                ->where('order_status', 'delivered')
                ->countAllResults(),
        ];

        return $this->response->setJSON($stats);
    }

    /**
     * Get monthly sales data
     */
    public function monthlySales()
    {
        $db = \Config\Database::connect();
        
        $sales = $db->table('payments')
            ->select("DATE_FORMAT(created_at, '%Y-%m') as month, SUM(amount) / 100 as total_amount")
            ->where('status', 'completed')
            ->groupBy("DATE_FORMAT(created_at, '%Y-%m')")
            ->orderBy('month', 'DESC')
            ->limit(12)
            ->get()
            ->getResultArray();

        return $this->response->setJSON($sales);
    }

    /**
     * Get orders per month
     */
    public function ordersPerMonth()
    {
        $db = \Config\Database::connect();
        
        $orders = $db->table('orders')
            ->select("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as order_count")
            ->groupBy("DATE_FORMAT(created_at, '%Y-%m')")
            ->orderBy('month', 'DESC')
            ->limit(12)
            ->get()
            ->getResultArray();

        return $this->response->setJSON($orders);
    }

    /**
     * Get recent orders
     */
    public function recentOrders()
    {
        $db = \Config\Database::connect();
        
        $orders = $db->table('orders as o')
            ->select('o.*, u.firstname, u.lastname, u.email, COALESCE(SUM(oi.quantity * p.price), 0) as total_amount')
            ->join('users as u', 'o.customer_id = u.id', 'left')
            ->join('order_items as oi', 'o.id = oi.order_id', 'left')
            ->join('products as p', 'oi.product_id = p.id', 'left')
            ->groupBy('o.id')
            ->orderBy('o.created_at', 'DESC')
            ->limit(10)
            ->get()
            ->getResultArray();

        return $this->response->setJSON($orders);
    }
}
