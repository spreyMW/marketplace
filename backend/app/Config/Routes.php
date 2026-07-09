<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Home::index');

// Auth routes
$routes->post('api/auth/login', 'Auth::login');
$routes->post('api/auth/register', 'Auth::register');
$routes->post('api/auth/logout', 'Auth::logout');
$routes->get('api/auth/user', 'Auth::getUser');

// Marketplace routes
$routes->options('api/(:any)', 'Marketplace::options');
$routes->get('api/products', 'Marketplace::products');
$routes->get('api/products/(:num)', 'Marketplace::getProduct/$1');
$routes->post('api/products', 'Marketplace::createProduct');
$routes->post('api/products/(:num)', 'Marketplace::updateProduct/$1');  // POST for file upload
$routes->patch('api/products/(:num)', 'Marketplace::updateProduct/$1');
$routes->post('api/products/(:num)/image', 'Marketplace::uploadImage/$1');
$routes->post('api/checkout', 'Marketplace::checkout');
$routes->get('api/orders', 'Marketplace::orders');
$routes->post('api/orders', 'OrderController::create');
$routes->get('api/orders/(:num)', 'OrderController::show/$1');
$routes->get('api/orders/number/(:segment)', 'OrderController::getByOrderNumber/$1');
$routes->patch('api/orders/(:segment)/status', 'Marketplace::updateOrderStatus/$1');

// Dashboard routes
$routes->get('api/dashboard/stats', 'DashboardController::stats');
$routes->get('api/dashboard/monthly-sales', 'DashboardController::monthlySales');
$routes->get('api/dashboard/recent-orders', 'DashboardController::recentOrders');
$routes->get('api/dashboard/orders-per-month', 'DashboardController::ordersPerMonth');

// Customer routes
$routes->get('api/customers', 'CustomerController::index');
$routes->get('api/customers/(:num)', 'CustomerController::show/$1');

// Payment Processing routes (PaymentController)
$routes->post('api/payments/process', 'PaymentController::process');
$routes->post('api/payments/result', 'PaymentController::result');
$routes->get('api/payments/publishable-key', 'PaymentController::getPublishableKey');
$routes->post('api/payments/make-payment', 'PaymentController::makePayment');
$routes->post('api/payments/make-payment-result', 'PaymentController::makePaymentResult');
$routes->post('api/payments/verify', 'PaymentController::verify');
$routes->post('api/payments/verify-by-order', 'PaymentController::verifyByOrder');
$routes->post('api/payments/(:num)/refund', 'PaymentController::refund/$1');
$routes->get('api/payments/(:num)/show', 'PaymentController::show/$1');
$routes->get('api/payments/date-range', 'PaymentController::getByDateRange');

// ===================================
// ADMIN ROUTES (organization purposes)
// ===================================

// Admin Product Management
$routes->group('api/admin', function($routes) {
    // Dashboard
    $routes->get('dashboard/stats', 'DashboardController::stats');
    $routes->get('dashboard/monthly-sales', 'DashboardController::monthlySales');
    $routes->get('dashboard/recent-orders', 'DashboardController::recentOrders');
    $routes->get('dashboard/orders-per-month', 'DashboardController::ordersPerMonth');
    
    // Products
    $routes->post('products', 'Marketplace::createProduct');
    $routes->post('products/(:num)', 'Marketplace::updateProduct/$1');
    $routes->patch('products/(:num)', 'Marketplace::updateProduct/$1');
    $routes->post('products/(:num)/image', 'Marketplace::uploadImage/$1');
    $routes->delete('products/(:num)', 'Marketplace::deleteProduct/$1');
    
    // Orders
    $routes->patch('orders/(:segment)/status', 'Marketplace::updateOrderStatus/$1');
    
    // Customers
    $routes->get('customers', 'CustomerController::index');
    $routes->get('customers/(:num)', 'CustomerController::show/$1');
    
    // Payments (Admin panel)
    $routes->get('payments', 'Api\PaymentController::index');
    $routes->get('payments/(:num)', 'Api\PaymentController::show/$1');
    $routes->patch('payments/(:num)', 'Api\PaymentController::update/$1');
    $routes->get('payments/order/(:num)', 'Api\PaymentController::getByOrder/$1');
    $routes->get('payments/stats', 'Api\PaymentController::stats');
});

// Public Payment API routes (Api\PaymentController - Admin panel)
$routes->get('api/payments', 'Api\PaymentController::index');
$routes->get('api/payments/(:num)', 'Api\PaymentController::show/$1');
$routes->patch('api/payments/(:num)', 'Api\PaymentController::update/$1');
$routes->get('api/payments/order/(:num)', 'Api\PaymentController::getByOrder/$1');
$routes->get('api/payments/stats', 'Api\PaymentController::stats');
