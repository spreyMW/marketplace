<?php
$json = json_encode([
    'test' => 'response'
]);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Output raw orders
$env = parse_ini_file(__DIR__ . '/.env');

$db = new mysqli(
    $env['database.default.hostname'] ?? 'localhost',
    $env['database.default.username'] ?? 'root',
    $env['database.default.password'] ?? '',
    $env['database.default.database'] ?? 'marketplace'
);

$sql = "SELECT o.id, o.order_number, o.customer_id, o.total_amount, o.order_status, 
        o.payment_status, o.shipping_address, o.created_at, o.updated_at,
        u.firstname, u.lastname, u.email, u.phone
        FROM orders as o
        LEFT JOIN users as u ON o.customer_id = u.id
        ORDER BY o.created_at DESC";

$result = $db->query($sql);
$orders = $result->fetch_all(MYSQLI_ASSOC);

// Add payments
foreach ($orders as &$order) {
    $payment_result = $db->query("SELECT * FROM payments WHERE order_id = " . intval($order['id']) . " LIMIT 1");
    if ($payment_result && $payment_result->num_rows > 0) {
        $order['payment'] = $payment_result->fetch_assoc();
    } else {
        $order['payment'] = null;
    }
}

echo json_encode($orders);
?>
