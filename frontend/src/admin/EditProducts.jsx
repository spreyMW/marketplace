import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Loader } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../services/api';

export default function EditProducts() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    status: 'active',
    image: null,
    currentImage: null,
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    try {
      setLoading(true);
      setError('');
      const data = await apiClient.get(`/products/${id}`);
      const product = Array.isArray(data) ? data[0] : data;
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        category: product.category || '',
        status: product.status || 'active',
        image: null,
        currentImage: product.image || null,
      });
    } catch (err) {
      setError('Failed to load product');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('category', formData.category);
      data.append('status', formData.status);
      if (formData.image) {
        data.append('image', formData.image);
      }

      const response = await apiClient.post(`/products/${id}`, data, true);

      // Success - redirect to manage products
      navigate('/admin/products');
    } catch (err) {
      const errorMessage = err.message || 'Failed to update product';
      setError(errorMessage);
      console.error('Error updating product:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-green-700 mx-auto mb-4" />
          <p className="text-slate-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h1 className="text-4xl font-bold text-slate-900">Edit Product</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Enter product name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Enter product description"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="0"
              />
            </div>
          </div>

          {/* Category and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Category *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="e.g., Vegetables"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Product Image
            </label>
            {formData.currentImage && !formData.image && (
              <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Current Image:</p>
                <img
                  src={`http://localhost:8080${formData.currentImage}`}
                  alt="Current product"
                  className="h-32 w-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-green-600 transition">
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
                id="image-input"
              />
              <label htmlFor="image-input" className="cursor-pointer block">
                <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-slate-600">
                  {formData.image ? formData.image.name : 'Click to upload new image'}
                </p>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              {saving && <Loader size={18} className="animate-spin" />}
              {saving ? 'Updating...' : 'Update Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 py-3 px-6 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
