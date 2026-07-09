<?php
// Create database connection directly
$db = new mysqli('localhost', 'root', '', 'marketplace');

if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

// Create orders table if it doesn't exist
$ordersSQL = "CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `order_number` varchar(100) NOT NULL UNIQUE,
  `customer_id` int(11) unsigned NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','paid','failed') DEFAULT 'pending',
  `order_status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `shipping_address` text,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `orders_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if ($db->query($ordersSQL)) {
    echo "✓ Orders table created or already exists\n";
} else {
    echo "✗ Error with orders table: " . $db->error . "\n";
}

$db->close();
echo "Done!\n";
