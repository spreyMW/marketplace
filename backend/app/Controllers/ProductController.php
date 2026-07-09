<?php

namespace App\Controllers;

use App\Models\ProductModel;
use App\Models\ProductImageModel;

class ProductController extends BaseController
{
    protected $productModel;
    protected $productImageModel;

    public function __construct()
    {
        $this->productModel = new ProductModel();
        $this->productImageModel = new ProductImageModel();
    }

    /**
     * Get all products
     */
    public function index()
    {
        $products = $this->productModel->getActive();
        
        // Add images to each product
        foreach ($products as &$product) {
            $product['images'] = $this->productImageModel->getByProduct($product['id']);
        }

        return $this->response->setJSON($products);
    }

    /**
     * Get a single product
     */
    public function show($id)
    {
        $product = $this->productModel->getWithImages($id);
        if (!$product) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Product not found']);
        }
        return $this->response->setJSON($product);
    }

    /**
     * Create a new product
     */
    public function create()
    {
        $input = $this->request->getJSON();
        
        if (!$this->productModel->save($input)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => $this->productModel->errors()]);
        }

        $productId = $this->productModel->getInsertID();

        // Handle product images
        if (isset($input->images) && is_array($input->images)) {
            foreach ($input->images as $imagePath) {
                $this->productImageModel->save([
                    'product_id' => $productId,
                    'image_path' => $imagePath,
                ]);
            }
        }

        return $this->response->setStatusCode(201)->setJSON([
            'message' => 'Product created successfully',
            'product_id' => $productId
        ]);
    }

    /**
     * Update a product
     */
    public function update($id)
    {
        $product = $this->productModel->find($id);
        if (!$product) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Product not found']);
        }

        $input = $this->request->getJSON();

        // Update product
        if (!$this->productModel->update($id, $input)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => $this->productModel->errors()]);
        }

        // Handle product images
        if (isset($input->images) && is_array($input->images)) {
            // Delete old images
            $this->productImageModel->deleteByProduct($id);

            // Add new images
            foreach ($input->images as $imagePath) {
                $this->productImageModel->save([
                    'product_id' => $id,
                    'image_path' => $imagePath,
                ]);
            }
        }

        return $this->response->setJSON(['message' => 'Product updated successfully']);
    }

    /**
     * Delete a product
     */
    public function delete($id)
    {
        $product = $this->productModel->find($id);
        if (!$product) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Product not found']);
        }

        // Delete product images
        $this->productImageModel->deleteByProduct($id);

        // Delete product
        $this->productModel->delete($id);

        return $this->response->setJSON(['message' => 'Product deleted successfully']);
    }

    /**
     * Search products
     */
    public function search()
    {
        $keyword = $this->request->getGet('q');
        
        if (!$keyword) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Search keyword required']);
        }

        $products = $this->productModel->search($keyword);
        
        foreach ($products as &$product) {
            $product['images'] = $this->productImageModel->getByProduct($product['id']);
        }

        return $this->response->setJSON($products);
    }
}
