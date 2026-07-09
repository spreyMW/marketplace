<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Call all seeders
        $this->call(UserSeeder::class);
        $this->call(ProductSeeder::class);
        $this->call(ProductImageSeeder::class);
        $this->call(OrderSeeder::class);
        $this->call(OrderItemSeeder::class);
        $this->call(PaymentSeeder::class);
    }
}
