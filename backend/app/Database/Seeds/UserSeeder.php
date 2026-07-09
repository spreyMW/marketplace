<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Clear existing users
        $this->db->query('DELETE FROM users');
        $this->db->query('ALTER TABLE users AUTO_INCREMENT = 1');

        $data = [
            // Admin user
            [
                'firstname' => 'Admin',
                'lastname' => 'User',
                'email' => 'admin@example.com',
                'phone' => '0987654321',
                'password' => password_hash('password', PASSWORD_BCRYPT),
                'role' => 'admin',
                'status' => 'active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            // Customer user 1
            [
                'firstname' => 'John',
                'lastname' => 'Doe',
                'email' => 'customer@example.com',
                'phone' => '0123456789',
                'password' => password_hash('password', PASSWORD_BCRYPT),
                'role' => 'customer',
                'status' => 'active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            // Customer user 2
            [
                'firstname' => 'Jane',
                'lastname' => 'Smith',
                'email' => 'jane@example.com',
                'phone' => '1111111111',
                'password' => password_hash('password', PASSWORD_BCRYPT),
                'role' => 'customer',
                'status' => 'active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];

        // Using Query Builder
        $this->db->table('users')->insertBatch($data);
    }
}
