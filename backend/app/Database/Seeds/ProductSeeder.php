<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing products
        $this->db->query('DELETE FROM products');
        $this->db->query('ALTER TABLE products AUTO_INCREMENT = 1');

        $now = date('Y-m-d H:i:s');

        $this->db->table('products')->insertBatch([
            [
                'name' => 'Everyday Tote',
                'category' => 'Bags',
                'price' => 38.00,
                'description' => 'A sturdy carryall for errands, work, and weekend trips.',
                'image' => '',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Ceramic Mug Set',
                'category' => 'Home',
                'price' => 24.00,
                'description' => 'Two handmade mugs with a smooth matte finish.',
                'image' => '',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Desk Lamp',
                'category' => 'Lighting',
                'price' => 52.00,
                'description' => 'Compact task lighting with a warm focused glow.',
                'image' => '',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Travel Notebook',
                'category' => 'Stationery',
                'price' => 16.00,
                'description' => 'A pocket notebook for plans, lists, and quick ideas.',
                'image' => '',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
