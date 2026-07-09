<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        // Skip if payments table doesn't exist
        if (!$this->db->tableExists('payments')) {
            echo "⚠ Payments table does not exist, skipping payments seeding\n";
            return;
        }

        // Clear existing payments
        try {
            $this->db->query('DELETE FROM payments');
            $this->db->query('ALTER TABLE payments AUTO_INCREMENT = 1');
        } catch (\Exception $e) {
            echo "Warning: Could not clear payments table: " . $e->getMessage() . "\n";
        }

        $now = date('Y-m-d H:i:s');
        $daysAgo = function($days) {
            return date('Y-m-d H:i:s', strtotime("-$days days"));
        };

        $data = [
            // Payment for Order 1 (ORD-001)
            [
                'order_id' => 1,
                'transaction_id' => 'TXN-20250508-001',
                'payment_method' => 'card',
                'amount' => 86.00,
                'status' => 'completed',
                'created_at' => $daysAgo(30),
            ],
            // Payment for Order 2 (ORD-002)
            [
                'order_id' => 2,
                'transaction_id' => 'TXN-20250523-001',
                'payment_method' => 'airtel_money',
                'amount' => 52.00,
                'status' => 'completed',
                'created_at' => $daysAgo(15),
            ],
            // Payment for Order 3 (ORD-003)
            [
                'order_id' => 3,
                'transaction_id' => 'TXN-20250519-001',
                'payment_method' => 'tnm_mpamba',
                'amount' => 114.00,
                'status' => 'completed',
                'created_at' => $daysAgo(20),
            ],
            // Payment for Order 4 (ORD-004) - Pending
            [
                'order_id' => 4,
                'transaction_id' => 'TXN-20250603-001',
                'payment_method' => 'card',
                'amount' => 130.00,
                'status' => 'pending',
                'created_at' => $daysAgo(5),
            ],
            // Payment for Order 5 (ORD-005)
            [
                'order_id' => 5,
                'transaction_id' => 'TXN-20250605-001',
                'payment_method' => 'airtel_money',
                'amount' => 38.00,
                'status' => 'completed',
                'created_at' => $daysAgo(3),
            ],
            // Payment for Order 6 (ORD-006) - Failed
            [
                'order_id' => 6,
                'transaction_id' => 'TXN-20250601-001',
                'payment_method' => 'card',
                'amount' => 40.00,
                'status' => 'failed',
                'created_at' => $daysAgo(7),
            ],
        ];

        $this->db->table('payments')->insertBatch($data);
    }
}
