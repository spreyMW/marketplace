import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Check if user is authenticated
  const token = localStorage.getItem('auth_token');
  const userString = localStorage.getItem('user');
  
  let user = null;
  try {
    user = userString ? JSON.parse(userString) : null;
  } catch (e) {
    console.error('Error parsing user data:', e);
  }

  // If no token or no user, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If user is not admin, redirect to home
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and is admin, render the protected content
  return children;
}
