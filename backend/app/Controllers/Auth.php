<?php

namespace App\Controllers;

use App\Models\UserModel;

class Auth extends BaseController
{
    protected $userModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
    }

    /**
     * Register a new user
     */
    public function register()
    {
        $input = $this->request->getJSON();

        // Validate required fields
        $required = ['firstname', 'lastname', 'email', 'phone', 'password'];
        foreach ($required as $field) {
            if (empty($input->$field)) {
                return $this->response->setStatusCode(400)->setJSON(['error' => ucfirst($field) . ' is required']);
            }
        }

        // Check if email already exists
        $existingUser = $this->userModel->getUserByEmail($input->email);
        if ($existingUser) {
            return $this->response->setStatusCode(409)->setJSON(['error' => 'Email already registered']);
        }

        // Prepare user data
        $userData = [
            'firstname' => $input->firstname,
            'lastname' => $input->lastname,
            'email' => $input->email,
            'phone' => $input->phone,
            'password' => password_hash($input->password, PASSWORD_BCRYPT),
            'role' => 'customer',
            'status' => 'active',
        ];

        if (!$this->userModel->save($userData)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => $this->userModel->errors()]);
        }

        $userId = $this->userModel->getInsertID();

        return $this->response->setStatusCode(201)->setJSON([
            'message' => 'User registered successfully',
            'user_id' => $userId
        ]);
    }

    /**
     * User login
     */
    public function login()
    {
        $input = $this->request->getJSON();

        // Validate required fields
        if (empty($input->email) || empty($input->password)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Email and password required']);
        }

        // Find user by email
        $user = $this->userModel->getUserByEmail($input->email);
        if (!$user) {
            return $this->response->setStatusCode(401)->setJSON(['error' => 'Invalid credentials']);
        }

        // Verify password
        if (!password_verify($input->password, $user['password'])) {
            return $this->response->setStatusCode(401)->setJSON(['error' => 'Invalid credentials']);
        }

        // Check user status
        if ($user['status'] !== 'active') {
            return $this->response->setStatusCode(403)->setJSON(['error' => 'User account is inactive']);
        }

        // Generate authentication token
        $token = bin2hex(random_bytes(32));
        
        // Store user info in session for validation
        $session = session();
        $session->set([
            'user_id' => $user['id'],
            'user_email' => $user['email'],
            'user_role' => $user['role'],
            'auth_token' => $token,
        ]);
        
        unset($user['password']);

        return $this->response->setJSON([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ]);
    }

    /**
     * User logout
     */
    public function logout()
    {
        // Clear session
        $session = session();
        $session->destroy();
        
        return $this->response->setJSON(['message' => 'Logout successful']);
    }

    /**
     * Get current user
     */
    public function getUser()
    {
        // TODO: Get user from JWT token
        $userId = $this->request->getHeader('X-User-ID')->getValue();

        if (!$userId) {
            return $this->response->setStatusCode(401)->setJSON(['error' => 'Unauthorized']);
        }

        $user = $this->userModel->find($userId);
        if (!$user) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'User not found']);
        }

        unset($user['password']);
        return $this->response->setJSON($user);
    }

    /**
     * Update profile
     */
    public function updateProfile($id)
    {
        $user = $this->userModel->find($id);
        if (!$user) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'User not found']);
        }

        $input = $this->request->getJSON();

        if (!$this->userModel->update($id, $input)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => $this->userModel->errors()]);
        }

        return $this->response->setJSON(['message' => 'Profile updated successfully']);
    }

    /**
     * Change password
     */
    public function changePassword($id)
    {
        $user = $this->userModel->find($id);
        if (!$user) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'User not found']);
        }

        $input = $this->request->getJSON();

        // Validate required fields
        if (empty($input->current_password) || empty($input->new_password)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Current and new passwords required']);
        }

        // Verify current password
        if (!password_verify($input->current_password, $user['password'])) {
            return $this->response->setStatusCode(401)->setJSON(['error' => 'Current password is incorrect']);
        }

        // Hash new password
        $newPasswordHash = password_hash($input->new_password, PASSWORD_BCRYPT);

        if (!$this->userModel->update($id, ['password' => $newPasswordHash])) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Failed to change password']);
        }

        return $this->response->setJSON(['message' => 'Password changed successfully']);
    }
}
