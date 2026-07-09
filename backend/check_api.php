<?php
// Direct MySQL connection
$env = parse_ini_file(__DIR__ . '/.env');

$db = new mysqli(
    $env['database.default.hostname'] ?? 'localhost',
    $env['database.default.username'] ?? 'root',
    $env['database.default.password'] ?? '',
    $env['database.default.database'] ?? 'marketplace'
);

if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}
echo "=== Checking ORDERS Table ===\n";
$result = $db->query("SELECT * FROM orders LIMIT 1");
$orders = $result->fetch_all(MYSQLI_ASSOC);
echo "Total orders: " . $db->query("SELECT COUNT(*) as cnt FROM orders")->fetch_assoc()['cnt'] . "\n";
if (!empty($orders)) {
    print_r($orders[0]);
    echo "\n\n";
}

echo "=== Checking USERS Table ===\n";
$result = $db->query("SELECT * FROM users LIMIT 1");
$users = $result->fetch_all(MYSQLI_ASSOC);
echo "Total users: " . $db->query("SELECT COUNT(*) as cnt FROM users")->fetch_assoc()['cnt'] . "\n";
if (!empty($users)) {
    print_r($users[0]);
    echo "\n\n";
}

echo "=== Checking PAYMENTS Table ===\n";
$result = $db->query("SELECT * FROM payments LIMIT 1");
$payments = $result->fetch_all(MYSQLI_ASSOC);
echo "Total payments: " . $db->query("SELECT COUNT(*) as cnt FROM payments")->fetch_assoc()['cnt'] . "\n";
if (!empty($payments)) {
    print_r($payments[0]);
    echo "\n\n";
}

echo "=== Full Order Query (like API) ===\n";
$sql = "SELECT o.id, o.order_number, o.customer_id, o.total_amount, o.order_status, 
        o.payment_status, o.shipping_address, o.created_at, o.updated_at,
        u.firstname, u.lastname, u.email, u.phone
        FROM orders as o
        LEFT JOIN users as u ON o.customer_id = u.id
        ORDER BY o.created_at DESC LIMIT 1";

$result = $db->query($sql);
$apiOrders = $result->fetch_all(MYSQLI_ASSOC);
echo "Sample API order:\n";
if (!empty($apiOrders)) {
    print_r($apiOrders[0]);
}

$db->close();
