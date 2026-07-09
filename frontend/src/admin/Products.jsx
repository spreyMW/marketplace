import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { apiClient } from '../services/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Products</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-700 hover:bg-green-800 text-white py-3 px-6 rounded-lg font-semibold flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="text-slate-600">Loading products...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Product</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-600 mt-1">{product.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-green-700 font-semibold">${product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      product.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
