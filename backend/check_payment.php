<?php
// Simple database query without CodeIgniter bootstrap
$dbHost = 'localhost';
$dbUser = 'root';
$dbPass = '';
$dbName = 'marketplace';

// Create connection
$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);

if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

// Check orders
echo "=== RECENT ORDERS ===\n";
$result = $conn->query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 3");
while ($row = $result->fetch_assoc()) {
    echo "Order #{$row['id']}: Customer {$row['customer_id']}, Amount: ${$row['total_amount']}, Status: {$row['payment_status']}\n";
}

// Check payments
echo "\n=== RECENT PAYMENTS ===\n";
$result = $conn->query("SELECT * FROM payments ORDER BY created_at DESC LIMIT 5");
if ($result->num_rows == 0) {
    echo "No payments found\n";
} else {
    while ($row = $result->fetch_assoc()) {
        echo "Payment #{$row['id']}: Order {$row['order_id']}, Ref: {$row['reference_number']}, Status: {$row['status']}, Amount: {$row['amount']}\n";
    }
}

// Check for specific reference
echo "\n=== SEARCHING FOR REFERENCE: 20260608135946133-CC00E02E ===\n";
$result = $conn->query("SELECT * FROM payments WHERE reference_number = '20260608135946133-CC00E02E'");
if ($result->num_rows == 0) {
    echo "❌ Reference NOT found in database\n";
} else {
    $payment = $result->fetch_assoc();
    echo "✅ Found: Status = {$payment['status']}, Amount = {$payment['amount']}\n";
}

$conn->close();
