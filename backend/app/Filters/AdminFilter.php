<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class AdminFilter implements FilterInterface
{
    /**
     * Ensure only admin users can access protected routes
     */
    public function before(RequestInterface $request, $arguments = null)
    {
        // Check Authorization header
        $authHeader = $request->getHeaderLine('Authorization');
        
        if (!$authHeader) {
            return service('response')
                ->setStatusCode(401)
                ->setJSON(['error' => 'Unauthorized: Missing token']);
        }

        // Extract token from "Bearer TOKEN" format
        $token = str_replace('Bearer ', '', $authHeader);

        // Try to get user from session first
        $session = session();
        $userId = $session->get('user_id');
        $userRole = $session->get('user_role');

        // If session data exists, check role
        if ($userId && $userRole === 'admin') {
            return; // Allow access
        }

        // If session doesn't have data, we can't verify without JWT or a token validation system
        // For now, return 401 to indicate need for re-authentication
        if (!$userId) {
            return service('response')
                ->setStatusCode(401)
                ->setJSON(['error' => 'Unauthorized: Session expired, please login again']);
        }

        // Check if user is admin
        if ($userRole !== 'admin') {
            return service('response')
                ->setStatusCode(403)
                ->setJSON(['error' => 'Forbidden: Admin access required']);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Do nothing
    }
}
