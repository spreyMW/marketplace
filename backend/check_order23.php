<?php
$conn = new mysqli('localhost', 'root', '', 'marketplace');

echo "=== ORDER #23 DETAILS ===\n";
$result = $conn->query('SELECT * FROM orders WHERE id = 23');
if ($result->num_rows > 0) {
    $order = $result->fetch_assoc();
    foreach ($order as $key => $value) {
        echo "$key: $value\n";
    }
} else {
    echo "Order not found\n";
}

echo "\n=== PAYMENTS FOR ORDER 23 ===\n";
$result = $conn->query('SELECT * FROM payments WHERE order_id = 23');
if ($result->num_rows == 0) {
    echo "NO PAYMENT RECORDS\n";
} else {
    while ($payment = $result->fetch_assoc()) {
        echo "Payment #{$payment['id']}: Status={$payment['status']}, Ref={$payment['reference_number']}, Amount={$payment['amount']}\n";
    }
}

$conn->close();
