<?php
$conn = new mysqli('localhost', 'root', '', 'marketplace');

// Update Payment #21 with the reference number from PESEPAY
$referenceNumber = '20260608135946133-CC00E02E';
$stmt = $conn->prepare("UPDATE payments SET reference_number = ?, status = 'completed' WHERE id = 21");
$stmt->bind_param("s", $referenceNumber);
$stmt->execute();

echo "Updated Payment #21:\n";
echo "- Reference Number: $referenceNumber\n";
echo "- Status: completed\n";

// Also update the order status
$conn->query("UPDATE orders SET payment_status = 'paid' WHERE id = 23");
echo "\nUpdated Order #23:\n";
echo "- Payment Status: paid\n";

// Verify the update
echo "\n=== VERIFICATION ===\n";
$result = $conn->query("SELECT id, status, reference_number FROM payments WHERE id = 21");
$payment = $result->fetch_assoc();
echo "Payment #21 - Status: {$payment['status']}, Reference: {$payment['reference_number']}\n";

$result = $conn->query("SELECT id, payment_status FROM orders WHERE id = 23");
$order = $result->fetch_assoc();
echo "Order #23 - Payment Status: {$order['payment_status']}\n";

$conn->close();
