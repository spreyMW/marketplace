<?php
// Load CodeIgniter autoload
require_once __DIR__ . '/backend/vendor/autoload.php';

// Initialize CodeIgniter
$app = require_once __DIR__ . '/backend/app/Config/Services.php';

$db = \Config\Database::connect();

echo "=== DATABASE CHECK ===\n\n";

// Check if orders exist
$orders = $db->query('SELECT id, order_number, customer_id, total_amount, order_status, payment_status, created_at FROM orders LIMIT 3')->getResultArray();

echo "Raw Orders from DB:\n";
foreach ($orders as $order) {
    echo json_encode($order, JSON_PRETTY_PRINT) . "\n\n";
}

// Test the query the OrderController will use
echo "\n=== TESTING ORDERCONTROLLER QUERY ===\n\n";
$result = $db->table('orders as o')
    ->select('o.id, o.order_number, o.customer_id, o.total_amount, o.order_status, o.payment_status, o.shipping_address, o.created_at, o.updated_at,
              u.firstname, u.lastname, u.email, u.phone')
    ->join('users as u', 'o.customer_id = u.id', 'left')
    ->orderBy('o.created_at', 'DESC')
    ->limit(3)
    ->get()
    ->getResultArray();

echo "Orders with User Join (first 3):\n";
foreach ($result as $row) {
    echo json_encode($row, JSON_PRETTY_PRINT) . "\n\n";
}
