import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader } from 'lucide-react';
import { apiClient } from '../services/api';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.firstname || !formData.lastname || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
        throw new Error('Please fill in all fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password length
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Call signup API
      const response = await apiClient.post('/auth/register', {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h2>
          <p className="text-slate-600 mb-8">Join Agriculture Hub to start shopping</p>

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

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent transition text-sm"
                  required
                />
              </div>
            </div>

            {/* Last Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Last Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent transition text-sm"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent transition text-sm"
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0123456789"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent transition text-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password (min. 6 characters)"
                  className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent transition text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent transition text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-700 to-amber-600 hover:from-green-800 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-slate-600">
          <p className="mb-4">
            Already have an account?{' '}
            <Link to="/login" className="text-green-700 hover:text-green-800 font-semibold">
              Sign In
            </Link>
          </p>
          <p>
            By signing up, you agree to our{' '}
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
