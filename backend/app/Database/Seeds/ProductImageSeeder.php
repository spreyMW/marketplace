<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class ProductImageSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing product images
        $this->db->query('DELETE FROM product_images');
        $this->db->query('ALTER TABLE product_images AUTO_INCREMENT = 1');

        $now = date('Y-m-d H:i:s');

        $data = [
            // Images for Everyday Tote (Product 1)
            [
                'product_id' => 1,
                'image_path' => '/uploads/products/tote-1.jpg',
                'created_at' => $now,
            ],
            [
                'product_id' => 1,
                'image_path' => '/uploads/products/tote-2.jpg',
                'created_at' => $now,
            ],
            [
                'product_id' => 1,
                'image_path' => '/uploads/products/tote-3.jpg',
                'created_at' => $now,
            ],

            // Images for Ceramic Mug Set (Product 2)
            [
                'product_id' => 2,
                'image_path' => '/uploads/products/mug-1.jpg',
                'created_at' => $now,
            ],
            [
                'product_id' => 2,
                'image_path' => '/uploads/products/mug-2.jpg',
                'created_at' => $now,
            ],

            // Images for Desk Lamp (Product 3)
            [
                'product_id' => 3,
                'image_path' => '/uploads/products/lamp-1.jpg',
                'created_at' => $now,
            ],
            [
                'product_id' => 3,
                'image_path' => '/uploads/products/lamp-2.jpg',
                'created_at' => $now,
            ],
            [
                'product_id' => 3,
                'image_path' => '/uploads/products/lamp-3.jpg',
                'created_at' => $now,
            ],

            // Images for Travel Notebook (Product 4)
            [
                'product_id' => 4,
                'image_path' => '/uploads/products/notebook-1.jpg',
                'created_at' => $now,
            ],
            [
                'product_id' => 4,
                'image_path' => '/uploads/products/notebook-2.jpg',
                'created_at' => $now,
            ],
        ];

        $this->db->table('product_images')->insertBatch($data);
    }
}
