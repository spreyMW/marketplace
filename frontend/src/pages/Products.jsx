import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Check } from 'lucide-react';
import { apiClient } from '../services/api';
import { useCart } from '../context/CartContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addedToCart, setAddedToCart] = useState({});
  const { dispatch } = useCart();

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

  function handleQuickAdd(product) {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        ...product,
        quantity: 1,
      },
    });
    setAddedToCart(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
  }

  const filteredProducts = Array.isArray(products) ? products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Our Products</h1>
          <p className="text-lg text-slate-600">Browse our selection of fresh agricultural products</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-700 focus:border-transparent"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading products...</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                    {/* Product Image */}
                    <div className="h-48 bg-gradient-to-br from-green-100 to-amber-100 flex items-center justify-center">
                      {product.featured_image ? (
                        <img
                          src={product.featured_image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-green-700 text-center">
                          <p className="text-sm">No image</p>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{product.name}</h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                      {/* Price and Stock */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold text-green-700">${product.price}</span>
                        <span className="text-sm text-slate-500">
                          Stock: {product.stock}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          to={`/products/${product.id}`}
                          className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg text-center transition font-medium"
                        >
                          View Details
                        </Link>
                        <button 
                          onClick={() => handleQuickAdd(product)}
                          disabled={product.stock === 0}
                          className={`flex-1 py-2 rounded-lg transition font-medium flex items-center justify-center ${
                            product.stock === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : addedToCart[product.id]
                              ? 'bg-green-600 text-white'
                              : 'border border-green-700 text-green-700 hover:bg-green-50'
                          }`}
                        >
                          {addedToCart[product.id] ? (
                            <Check size={18} />
                          ) : (
                            <ShoppingCart size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 text-lg">No products found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
