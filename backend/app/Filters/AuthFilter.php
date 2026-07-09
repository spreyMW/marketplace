<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class AuthFilter implements FilterInterface
{
    /**
     * Do whatever processing this filter needs to do.
     * By default it should not change the request or response.
     *
     * @param RequestInterface $request
     * @param array|null   $arguments
     *
     * @return RequestInterface|ResponseInterface|string|void
     */
    public function before(RequestInterface $request, $arguments = null)
    {
        // Check if user is authenticated
        $token = $request->getHeaderLine('Authorization');
        
        if (!$token) {
            return service('response')
                ->setStatusCode(401)
                ->setJSON(['error' => 'Unauthorized: Missing token']);
        }

        // TODO: Validate token
        // Example: Verify JWT token or session
    }

    /**
     * Allows After filters to inspect and modify the response
     * object as needed. This method does not need to return anything.
     *
     * @param RequestInterface  $request
     * @param ResponseInterface $response
     * @param array|null        $arguments
     *
     * @return void
     */
    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Do something with the response
    }
}
