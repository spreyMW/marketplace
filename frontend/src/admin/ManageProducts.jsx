import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';

export default function ManageProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const data = await apiClient.get('/products');
      // Handle different response formats
      const productsArray = Array.isArray(data) ? data : (data?.data || data?.products || []);
      setProducts(productsArray);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await apiClient.delete(`/products/${productId}`);
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: '✕' };
    if (stock < 20) return { label: `Low Stock (${stock})`, color: 'bg-yellow-100 text-yellow-800', icon: '⚠' };
    return { label: `In Stock (${stock})`, color: 'bg-green-100 text-green-800', icon: '✓' };
  };

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? { color: 'bg-blue-100 text-blue-800', label: 'Active' }
      : { color: 'bg-gray-100 text-gray-800', label: 'Inactive' };
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Manage Products</h1>
          <p className="text-slate-600 mt-1">{products.length} product{products.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => navigate('/admin/products/add')}
          className="bg-green-700 hover:bg-green-800 text-white py-3 px-6 rounded-lg font-semibold flex items-center gap-2 transition w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* View Mode Toggle */}
      {!loading && products.length > 0 && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'table'
                ? 'bg-green-700 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'card'
                ? 'bg-green-700 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Card View
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-slate-600">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 mb-4 text-lg">No products found</p>
          <button
            onClick={() => navigate('/admin/products/add')}
            className="bg-green-700 hover:bg-green-800 text-white py-2 px-6 rounded-lg font-semibold transition inline-block"
          >
            Add Your First Product
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-slate-900">Product</th>
                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-slate-900 hidden sm:table-cell">Category</th>
                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-slate-900">Price</th>
                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-slate-900">Stock</th>
                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-4 sm:px-6 py-3 text-center text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.map(product => {
                const stockStatus = getStockStatus(product.stock);
                const statusBadge = getStatusBadge(product.status);
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 sm:px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-1">{product.description?.substring(0, 40)}...</p>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-slate-600 hidden sm:table-cell text-sm">
                      {product.category}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-green-700 font-semibold">
                      ${parseFloat(product.price).toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium inline-flex items-center gap-1 ${stockStatus.color}`}>
                        <span>{stockStatus.icon}</span>
                        <span className="hidden sm:inline">{stockStatus.label}</span>
                        <span className="sm:hidden">{product.stock}</span>
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"
                          title="Edit product"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                          title="Delete product"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        // Card View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const stockStatus = getStockStatus(product.stock);
            const statusBadge = getStatusBadge(product.status);
            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                {product.image && (
                  <img 
                    src={`http://localhost:8080${product.image}`} 
                    alt={product.name}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900 line-clamp-2 flex-1">{product.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{product.category}</p>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{product.description?.substring(0, 60)}...</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 rounded p-2">
                      <p className="text-xs text-slate-600">Price</p>
                      <p className="font-semibold text-green-700">${parseFloat(product.price).toFixed(2)}</p>
                    </div>
                    <div className={`rounded p-2 ${stockStatus.color}`}>
                      <p className="text-xs">Stock</p>
                      <p className="font-semibold">{product.stock}</p>
                    </div>
                  </div>

                  {product.stock < 20 && product.stock > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-4 flex items-center gap-2">
                      <AlertCircle size={14} className="text-yellow-600 flex-shrink-0" />
                      <p className="text-xs text-yellow-700">Low stock warning</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 transition text-sm font-medium"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 flex items-center justify-center gap-2 p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
