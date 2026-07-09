<?php
require_once __DIR__ . '/vendor/autoload.php';

$db = \Config\Database::connect();

echo "=== ORDERS TABLE ===\n";
$orders = $db->table('orders')->select('*')->limit(5)->get()->getResultArray();
print_r($orders);

echo "\n=== USERS TABLE ===\n";
$users = $db->table('users')->select('*')->limit(3)->get()->getResultArray();
print_r($users);

echo "\n=== ORDER_ITEMS TABLE ===\n";
$items = $db->table('order_items')->select('*')->limit(5)->get()->getResultArray();
print_r($items);

echo "\n=== PAYMENTS TABLE ===\n";
$payments = $db->table('payments')->select('*')->limit(5)->get()->getResultArray();
print_r($payments);
