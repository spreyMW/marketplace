import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { apiClient } from '../services/api';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    district: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get user data from localStorage (including phone from database)
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        setFormData(prev => ({
          ...prev,
          firstname: userData.firstname || '',
          lastname: userData.lastname || '',
          email: userData.email || '',
          phone: userData.phone || '',
        }));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.1;

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.firstname || !formData.email || !formData.phone || !formData.address) {
        throw new Error('Please fill in all required fields');
      }

      // Get user ID from localStorage
      const userString = localStorage.getItem('user');
      const userData = userString ? JSON.parse(userString) : null;
      const customerId = userData?.id || 1;

      // Create order
      const orderData = {
        customer_id: customerId,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
        shipping_address: `${formData.address}, ${formData.district}`,
      };

      const response = await apiClient.post('/orders', orderData);
      navigate('/payment', { state: { order: response } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/products')}
            className="text-green-700 hover:text-green-800 font-semibold"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center text-green-700 hover:text-green-800 font-semibold mb-8"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Cart
        </button>

        <h1 className="text-4xl font-bold text-slate-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              <h2 className="text-2xl font-bold text-slate-900 mb-6">Delivery Information</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">District *</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  >
                    <option value="">Select District</option>
                    <option value="Lilongwe">Lilongwe</option>
                    <option value="Blantyre">Blantyre</option>
                    <option value="Zomba">Zomba</option>
                    <option value="Mzuzu">Mzuzu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition"
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>

              {/* Items */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between mb-2 text-sm">
                    <span className="text-slate-600">{item.name} x {item.quantity}</span>
                    <span className="font-semibold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6 pb-6 border-b border-slate-200 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${(total / 1.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (10%)</span>
                  <span>${(total / 1.1 * 0.1).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-2xl font-bold text-green-700">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
