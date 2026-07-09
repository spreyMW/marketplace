<?php

namespace App\Controllers;

use App\Models\OrderModel;
use App\Models\ProductModel;
use CodeIgniter\HTTP\ResponseInterface;

class Marketplace extends BaseController
{
    private OrderModel $orders;
    private ProductModel $products;

    public function __construct()
    {
        $this->orders = new OrderModel();
        $this->products = new ProductModel();
    }

    public function products(): ResponseInterface
    {
        // Get all products for public display
        $products = array_map(
            fn (array $product): array => $this->formatProduct($product),
            $this->products->orderBy('id', 'ASC')->findAll()
        );

        return $this->json(['products' => $products]);
    }

    public function getProduct($id): ResponseInterface
    {
        $product = $this->products->find($id);
        
        if (!$product) {
            return $this->json(['message' => 'Product not found'], 404);
        }

        return $this->json($this->formatProduct($product));
    }

    public function createProduct(): ResponseInterface
    {
        // Validate required fields
        $required = ['name', 'description', 'price', 'stock', 'category', 'status'];
        foreach ($required as $field) {
            if (empty($this->request->getPost($field))) {
                return $this->json(['message' => ucfirst($field) . ' is required.'], 422);
            }
        }

        $productData = [
            'name' => $this->request->getPost('name'),
            'description' => $this->request->getPost('description'),
            'price' => (float) $this->request->getPost('price'),
            'stock' => (int) $this->request->getPost('stock'),
            'category' => $this->request->getPost('category'),
            'status' => $this->request->getPost('status'),
            'slug' => strtolower(str_replace(' ', '-', $this->request->getPost('name'))) . '-' . bin2hex(random_bytes(4)),
        ];

        // Handle file upload
        $image = $this->request->getFile('image');
        if ($image && $image->isValid()) {
            if (!str_starts_with((string) $image->getMimeType(), 'image/')) {
                return $this->json(['message' => 'Only image files are accepted.'], 422);
            }

            $uploadDir = FCPATH . 'uploads';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0775, true);
            }

            $fileName = $image->getRandomName();
            $image->move($uploadDir, $fileName);
            $productData['image'] = '/uploads/' . $fileName;
        }

        // Save product
        if (!$this->products->save($productData)) {
            $errors = $this->products->errors();
            \log_message('error', 'Product save failed: ' . json_encode($errors));
            return $this->json(['message' => 'Failed to create product', 'errors' => $errors], 400);
        }

        $productId = $this->products->getInsertID();
        $product = $this->products->find($productId);

        return $this->json(['message' => 'Product created successfully', 'product' => $this->formatProduct($product)], 201);
    }

    public function updateProduct($id): ResponseInterface
    {
        $product = $this->products->find($id);

        if (!$product) {
            return $this->json(['message' => 'Product not found'], 404);
        }

        $name = $this->request->getPost('name');
        $description = $this->request->getPost('description');
        $price = $this->request->getPost('price');
        $stock = $this->request->getPost('stock');
        $category = $this->request->getPost('category');
        $status = $this->request->getPost('status');

        // Validate required fields
        if (empty($name) || empty($description) || empty($price) || empty($stock) || empty($category) || empty($status)) {
            return $this->json(['message' => 'All fields are required.'], 422);
        }

        $productData = [
            'name' => $name,
            'description' => $description,
            'price' => (float) $price,
            'stock' => (int) $stock,
            'category' => $category,
            'status' => $status,
        ];

        // Handle file upload
        $image = $this->request->getFile('image');
        if ($image && $image->isValid()) {
            if (!str_starts_with((string) $image->getMimeType(), 'image/')) {
                return $this->json(['message' => 'Only image files are accepted.'], 422);
            }

            $uploadDir = FCPATH . 'uploads';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0775, true);
            }

            $fileName = $image->getRandomName();
            $image->move($uploadDir, $fileName);
            $productData['image'] = '/uploads/' . $fileName;
        }

        // Update product
        if (!$this->products->update($id, $productData)) {
            $errors = $this->products->errors();
            \log_message('error', 'Product update failed: ' . json_encode($errors));
            return $this->json(['message' => 'Failed to update product', 'errors' => $errors], 400);
        }

        $updatedProduct = $this->products->find($id);

        return $this->json(['message' => 'Product updated successfully', 'product' => $this->formatProduct($updatedProduct)], 200);
    }

    public function orders(): ResponseInterface
    {
        $db = \Config\Database::connect();
        
        // Get orders with customer and payment info
        $orders = $db->table('orders as o')
            ->select('o.id, o.order_number, o.customer_id, o.total_amount, o.order_status, 
                      o.payment_status, o.shipping_address, o.created_at, o.updated_at,
                      u.firstname, u.lastname, u.email, u.phone')
            ->join('users as u', 'o.customer_id = u.id', 'left')
            ->orderBy('o.created_at', 'DESC')
            ->get()
            ->getResultArray();
        
        // Add payment information for each order
        $paymentModel = new \App\Models\PaymentModel();
        foreach ($orders as &$order) {
            $order['payment'] = $paymentModel->where('order_id', $order['id'])->first();
        }

        return $this->json($orders);
    }

    public function checkout(): ResponseInterface
    {
        $payload = $this->request->getJSON(true) ?? [];
        $productId = (int) ($payload['productId'] ?? 0);
        $quantity = max(1, (int) ($payload['quantity'] ?? 1));
        $product = $this->products->find($productId);

        if (! $product) {
            return $this->json(['message' => 'Choose a valid product.'], 422);
        }

        foreach (['customerName', 'email', 'phone'] as $field) {
            if (empty(trim((string) ($payload[$field] ?? '')))) {
                return $this->json(['message' => 'Customer name, email, and phone are required.'], 422);
            }
        }

        $order = [
            'id' => bin2hex(random_bytes(8)),
            'order_number' => 'ORD-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8)),
            'product_id' => (int) $product['id'],
            'product_name' => $product['name'],
            'quantity' => $quantity,
            'unit_price' => (float) $product['price'],
            'total' => round(((float) $product['price']) * $quantity, 2),
            'customer_name' => trim((string) $payload['customerName']),
            'email' => trim((string) $payload['email']),
            'phone' => trim((string) $payload['phone']),
            'payment_method' => trim((string) ($payload['paymentMethod'] ?? 'Mobile Money')),
            'payment_status' => 'pending',
            'fulfillment_status' => 'new',
        ];

        $this->orders->insert($order);
        $savedOrder = $this->orders->find($order['id']);

        return $this->json(['order' => $this->formatOrder($savedOrder)], 201);
    }

    public function uploadImage(int $id): ResponseInterface
    {
        $product = $this->products->find($id);

        if (! $product) {
            return $this->json(['message' => 'Product not found.'], 404);
        }

        $image = $this->request->getFile('image');

        if (! $image || ! $image->isValid()) {
            return $this->json(['message' => 'Upload a valid image.'], 422);
        }

        if (! str_starts_with((string) $image->getMimeType(), 'image/')) {
            return $this->json(['message' => 'Only image files are accepted.'], 422);
        }

        $uploadDir = FCPATH . 'uploads';

        if (! is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }

        $fileName = $image->getRandomName();
        $image->move($uploadDir, $fileName);

        $this->products->update($id, ['image' => '/uploads/' . $fileName]);
        $updatedProduct = $this->products->find($id);

        return $this->json(['product' => $this->formatProduct($updatedProduct)]);
    }

    public function updateOrderStatus(string $id): ResponseInterface
    {
        $payload = $this->request->getJSON(true) ?? [];
        $order = $this->orders->find($id);

        if (! $order) {
            return $this->json(['message' => 'Order not found.'], 404);
        }

        $allowedOrderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        $allowedPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

        $updates = [];

        // Handle order_status updates
        if (isset($payload['order_status']) && in_array($payload['order_status'], $allowedOrderStatuses, true)) {
            $updates['order_status'] = $payload['order_status'];
        }

        // Handle payment_status updates
        if (isset($payload['payment_status']) && in_array($payload['payment_status'], $allowedPaymentStatuses, true)) {
            $updates['payment_status'] = $payload['payment_status'];
        }

        if (empty($updates)) {
            return $this->json(['message' => 'No valid status updates provided.'], 422);
        }

        // Update the order
        if ($this->orders->update($id, $updates)) {
            $updatedOrder = $this->orders->find($id);
            return $this->json([
                'message' => 'Order status updated successfully',
                'order' => $updatedOrder
            ]);
        }

        return $this->json(['message' => 'Failed to update order status.'], 500);
    }

    public function options(): ResponseInterface
    {
        return $this->withCors($this->response)->setStatusCode(204);
    }

    private function formatProduct(array $product): array
    {
        $imageUrl = $product['image'] ?? '';
        // Convert relative paths to absolute URLs pointing to backend
        if ($imageUrl && !str_starts_with($imageUrl, 'http')) {
            $imageUrl = 'http://localhost:8080' . $imageUrl;
        }

        return [
            'id' => (int) $product['id'],
            'name' => $product['name'],
            'category' => $product['category'] ?? '',
            'price' => (float) $product['price'],
            'stock' => (int) ($product['stock'] ?? 0),
            'description' => $product['description'],
            'status' => $product['status'] ?? 'active',
            'featured_image' => $imageUrl,
            'image' => $imageUrl,
            'slug' => $product['slug'] ?? '',
        ];
    }

    private function formatOrder(array $order): array
    {
        return [
            'id' => $order['id'],
            'orderNumber' => $order['order_number'],
            'productId' => (int) $order['product_id'],
            'productName' => $order['product_name'],
            'quantity' => (int) $order['quantity'],
            'unitPrice' => (float) $order['unit_price'],
            'total' => (float) $order['total'],
            'customerName' => $order['customer_name'],
            'email' => $order['email'],
            'phone' => $order['phone'],
            'paymentMethod' => $order['payment_method'],
            'paymentStatus' => $order['payment_status'],
            'fulfillmentStatus' => $order['fulfillment_status'],
            'createdAt' => $order['created_at'],
            'updatedAt' => $order['updated_at'],
        ];
    }

    private function json(array $payload, int $status = 200): ResponseInterface
    {
        return $this->withCors($this->response)
            ->setStatusCode($status)
            ->setJSON($payload);
    }

    private function withCors(ResponseInterface $response): ResponseInterface
    {
        return $response
            ->setHeader('Access-Control-Allow-Origin', '*')
            ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
            ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    }
}
