<?php
require_once 'vendor/autoload.php';

use CodeIgniter\Database\Config;
use CodeIgniter\CLI\CLI;

$db = Config::connect();

// Check for the test user
$user = $db->table('users')->where('email', 'johndoe@example.com')->get()->getRow();

if ($user) {
    echo "✅ USER FOUND IN DATABASE:\n";
    echo "ID: " . $user->id . "\n";
    echo "Name: " . $user->firstname . " " . $user->lastname . "\n";
    echo "Email: " . $user->email . "\n";
    echo "Phone: " . $user->phone . "\n";
    echo "Role: " . $user->role . "\n";
    echo "Status: " . $user->status . "\n";
    echo "Created: " . $user->created_at . "\n";
} else {
    echo "❌ USER NOT FOUND in database\n";
    
    // Show all users
    echo "\nAll users in database:\n";
    $users = $db->table('users')->get()->getResult();
    foreach ($users as $u) {
        echo "- {$u->firstname} {$u->lastname} ({$u->email}) - Role: {$u->role}\n";
    }
}
