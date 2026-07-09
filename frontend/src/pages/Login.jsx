import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader } from 'lucide-react';
import { apiClient } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      // Call login API
      const response = await apiClient.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      // Store authentication data
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }
      
      // Store user data
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        // Redirect based on user role
        if (response.user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-600 mb-8">Sign in to your account to continue</p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-700 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-green-700 cursor-pointer"
                />
                <span className="ml-2 text-sm text-slate-700">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-green-700 hover:text-green-800 font-medium transition"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-700 to-amber-600 hover:from-green-800 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>


        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-slate-600">
          <p className="mb-4">
            Don't have an account?{' '}
            <Link to="/signup" className="text-green-700 hover:text-green-800 font-semibold">
              Create one
            </Link>
          </p>
          <p>
            By signing in, you agree to our{' '}
            <Link to="#" className="text-green-700 hover:text-green-800 font-medium">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link to="#" className="text-green-700 hover:text-green-800 font-medium">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
