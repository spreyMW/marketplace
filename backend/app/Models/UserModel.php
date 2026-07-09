<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table = 'users';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $allowedFields = ['firstname', 'lastname', 'email', 'phone', 'password', 'role', 'status'];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
    protected $validationRules = [
        'firstname' => 'required|string|max_length[100]',
        'lastname' => 'required|string|max_length[100]',
        'email' => 'required|valid_email|is_unique[users.email]',
        'phone' => 'required|string|max_length[20]',
        'password' => 'required|string|min_length[6]',
        'role' => 'in_list[admin,customer]',
        'status' => 'in_list[active,inactive]',
    ];
    protected $validationMessages = [];
    protected $skipValidation = false;
    protected $cleanValidationRules = true;

    /**
     * Get user by email
     */
    public function getUserByEmail($email)
    {
        return $this->where('email', $email)->first();
    }

    /**
     * Get all customers
     */
    public function getCustomers()
    {
        return $this->where('role', 'customer')->findAll();
    }

    /**
     * Get all admins
     */
    public function getAdmins()
    {
        return $this->where('role', 'admin')->findAll();
    }
}
