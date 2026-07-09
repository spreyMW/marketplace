<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        // Skip if orders table doesn't exist
        if (!$this->db->tableExists('orders')) {
            echo "⚠ Orders table does not exist, skipping order seeding\n";
            return;
        }

        // Clear existing orders
        try {
            $this->db->query('SET FOREIGN_KEY_CHECKS=0');
            $this->db->query('DELETE FROM orders');
            $this->db->query('ALTER TABLE orders AUTO_INCREMENT = 1');
            $this->db->query('SET FOREIGN_KEY_CHECKS=1');
        } catch (\Exception $e) {
            echo "Warning: Could not clear orders table: " . $e->getMessage() . "\n";
        }

        $now = date('Y-m-d H:i:s');
        $daysAgo = function($days) {
            return date('Y-m-d H:i:s', strtotime("-$days days"));
        };

        $data = [
            // Order 1 - Customer 1 (John Doe)
            [
                'order_number' => 'ORD-001',
                'customer_id' => 2,
                'total_amount' => 86.00,
                'payment_status' => 'paid',
                'order_status' => 'delivered',
                'shipping_address' => '123 Main St, Apartment 4B, New York, NY 10001',
                'created_at' => $daysAgo(30),
                'updated_at' => $daysAgo(25),
            ],
            // Order 2 - Customer 1 (John Doe)
            [
                'order_number' => 'ORD-002',
                'customer_id' => 2,
                'total_amount' => 52.00,
                'payment_status' => 'paid',
                'order_status' => 'shipped',
                'shipping_address' => '123 Main St, Apartment 4B, New York, NY 10001',
                'created_at' => $daysAgo(15),
                'updated_at' => $daysAgo(10),
            ],
            // Order 3 - Customer 2 (Jane Smith)
            [
                'order_number' => 'ORD-003',
                'customer_id' => 3,
                'total_amount' => 114.00,
                'payment_status' => 'paid',
                'order_status' => 'delivered',
                'shipping_address' => '456 Oak Avenue, Suite 200, Los Angeles, CA 90001',
                'created_at' => $daysAgo(20),
                'updated_at' => $daysAgo(14),
            ],
            // Order 4 - Customer 1 (John Doe)
            [
                'order_number' => 'ORD-004',
                'customer_id' => 2,
                'total_amount' => 130.00,
                'payment_status' => 'pending',
                'order_status' => 'processing',
                'shipping_address' => '123 Main St, Apartment 4B, New York, NY 10001',
                'created_at' => $daysAgo(5),
                'updated_at' => $daysAgo(3),
            ],
            // Order 5 - Customer 2 (Jane Smith)
            [
                'order_number' => 'ORD-005',
                'customer_id' => 3,
                'total_amount' => 38.00,
                'payment_status' => 'paid',
                'order_status' => 'processing',
                'shipping_address' => '456 Oak Avenue, Suite 200, Los Angeles, CA 90001',
                'created_at' => $daysAgo(3),
                'updated_at' => $now,
            ],
            // Order 6 - Customer 1 (John Doe)
            [
                'order_number' => 'ORD-006',
                'customer_id' => 2,
                'total_amount' => 40.00,
                'payment_status' => 'failed',
                'order_status' => 'cancelled',
                'shipping_address' => '123 Main St, Apartment 4B, New York, NY 10001',
                'created_at' => $daysAgo(7),
                'updated_at' => $daysAgo(6),
            ],
        ];

        $this->db->table('orders')->insertBatch($data);
    }
}
