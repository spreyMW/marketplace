<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateOrdersTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'order_number' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
                'unique' => true,
            ],
            'customer_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
            ],
            'total_amount' => [
                'type' => 'DECIMAL',
                'constraint' => '10,2',
            ],
            'payment_status' => [
                'type' => 'ENUM',
                'constraint' => ['pending', 'paid', 'failed'],
                'default' => 'pending',
            ],
            'order_status' => [
                'type' => 'ENUM',
                'constraint' => ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
                'default' => 'pending',
            ],
            'shipping_address' => [
                'type' => 'TEXT',
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('customer_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('orders');
    }

    public function down()
    {
        $this->forge->dropTable('orders');
    }
}
