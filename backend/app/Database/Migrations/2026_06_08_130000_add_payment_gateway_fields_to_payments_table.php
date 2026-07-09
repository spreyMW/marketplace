<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddPaymentGatewayFieldsToPaymentsTable extends Migration
{
    public function up()
    {
        $this->forge->addColumn('payments', [
            'reference_number' => [
                'type' => 'VARCHAR',
                'constraint' => 255,
                'null' => true,
            ],
            'gateway_response' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'redirect_url' => [
                'type' => 'TEXT',
                'null' => true,
            ],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('payments', ['reference_number', 'gateway_response', 'redirect_url']);
    }
}
