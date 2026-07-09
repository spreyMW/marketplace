import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { apiClient } from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, dispatch } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  // Check if product is already in cart
  const isInCart = cart.some(item => item.id === parseInt(id));

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    try {
      setLoading(true);
      const data = await apiClient.get(`/products/${id}`);
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart() {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        ...product,
        quantity,
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleUpdateCartQuantity() {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: {
        id: product.id,
        quantity: parseInt(quantity),
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-slate-600">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-slate-600 mb-4">Product not found</p>
        <button
          onClick={() => navigate('/products')}
          className="text-green-700 hover:text-green-800 font-semibold"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/products')}
          className="flex items-center text-green-700 hover:text-green-800 font-semibold mb-8"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Products
        </button>

        <div className="grid md:grid-cols-2 gap-12 bg-white rounded-lg shadow-lg p-8">
          {/* Image Section */}
          <div>
            <div className="h-96 bg-gradient-to-br from-green-100 to-amber-100 rounded-lg flex items-center justify-center mb-4">
              {product.featured_image ? (
                <img
                  src={product.featured_image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-green-700 text-center">
                  <p className="text-lg">No image available</p>
                </div>
              )}
            </div>
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <div key={idx} className="h-20 bg-gray-200 rounded-lg">
                    <img
                      src={img.image_path}
                      alt={`${product.name} ${idx}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{product.name}</h1>
            <p className="text-slate-600 text-lg mb-6">{product.description}</p>

            {/* Price */}
            <div className="mb-6">
              <p className="text-sm text-slate-500 mb-2">Price</p>
              <p className="text-4xl font-bold text-green-700">${product.price}</p>
            </div>

            {/* Stock */}
            <div className="mb-6">
              <p className="text-sm text-slate-500 mb-2">Stock Available</p>
              <p className={`text-lg font-semibold ${
                product.stock > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {product.stock > 0 ? `${product.stock} items` : 'Out of Stock'}
              </p>
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-2">Quantity</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-slate-300 rounded-lg hover:bg-gray-100"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                    max={product.stock}
                    className="w-16 text-center border border-slate-300 rounded-lg py-2"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 border border-slate-300 rounded-lg hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 flex-col sm:flex-row">
              {isInCart ? (
                <>
                  <button
                    onClick={handleUpdateCartQuantity}
                    className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                      added
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-700 hover:bg-blue-800 text-white'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check size={20} />
                        Updated in Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Update in Cart
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/cart')}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    View Cart
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                      product.stock === 0
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : added
                        ? 'bg-green-600 text-white'
                        : 'bg-green-700 hover:bg-green-800 text-white'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check size={20} />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Add to Cart
                      </>
                    )}
                  </button>
                  {added && (
                    <button
                      onClick={() => navigate('/cart')}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={20} />
                      View Cart
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
