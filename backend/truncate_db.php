<?php
// Bootstrap CodeIgniter
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/app/Config/Constants.php';

$bootstrap = \Config\Services::codeigniter();
$bootstrap->initialize();

$db = \Config\Database::connect();

// Disable foreign key checks
$db->query('SET FOREIGN_KEY_CHECKS=0');

// Truncate all tables
$tables = ['payments', 'order_items', 'orders', 'product_images', 'products', 'users'];
foreach ($tables as $table) {
    try {
        $db->query("TRUNCATE TABLE $table");
        echo "✓ Truncated $table\n";
    } catch (\Exception $e) {
        echo "✗ Error truncating $table: " . $e->getMessage() . "\n";
    }
}

// Re-enable foreign key checks
$db->query('SET FOREIGN_KEY_CHECKS=1');

echo "\nAll tables truncated successfully!\n";
