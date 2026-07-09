import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, dispatch } = useCart();

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function handleRemove(id) {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }

  function handleUpdateQuantity(id, quantity) {
    if (quantity > 0) {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id, quantity: parseInt(quantity) },
      });
    }
  }

  function handleIncrement(item) {
    handleUpdateQuantity(item.id, item.quantity + 1);
  }

  function handleDecrement(item) {
    if (item.quantity > 1) {
      handleUpdateQuantity(item.id, item.quantity - 1);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Shopping Cart</h1>
          <p className="text-slate-600 mt-2">{itemCount} item{itemCount !== 1 ? 's' : ''} in cart</p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-slate-600 text-lg mb-6">Your cart is empty</p>
            <Link
              to="/products"
              className="inline-block bg-green-700 hover:bg-green-800 text-white py-3 px-8 rounded-lg font-semibold transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {cart.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`border-b border-slate-200 p-6 hover:bg-gray-50 transition ${
                      index === cart.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <Link
                        to={`/products/${item.id}`}
                        className="w-24 h-24 bg-gradient-to-br from-green-100 to-amber-100 rounded-lg flex-shrink-0 overflow-hidden hover:shadow-md transition"
                      >
                        {item.featured_image ? (
                          <img
                            src={item.featured_image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-green-700 text-xs">No img</div>
                        )}
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1">
                        <Link 
                          to={`/products/${item.id}`}
                          className="text-lg font-semibold text-slate-900 mb-2 hover:text-green-700 transition"
                        >
                          {item.name}
                        </Link>
                        <p className="text-slate-600 text-sm mb-4">{item.description?.substring(0, 60)}...</p>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-green-700">${item.price}</span>
                          <div className="flex items-center gap-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-slate-300 rounded-lg">
                              <button
                                onClick={() => handleDecrement(item)}
                                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-gray-100 transition"
                              >
                                <Minus size={16} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                                className="w-12 text-center border-0 bg-transparent py-1 px-2"
                              />
                              <button
                                onClick={() => handleIncrement(item)}
                                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-gray-100 transition"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition"
                              title="Remove from cart"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="text-sm text-slate-500 mb-2">Subtotal</p>
                        <p className="text-xl font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>

                {/* Item Count */}
                <div className="flex justify-between mb-3 pb-3 border-b border-slate-200 text-sm">
                  <span className="text-slate-600">Items ({itemCount})</span>
                  <span className="font-semibold text-slate-900">${total.toFixed(2)}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between mb-3 pb-3 border-b border-slate-200 text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-semibold text-slate-900">Free</span>
                </div>

                {/* Tax */}
                <div className="flex justify-between mb-6 pb-6 border-b border-slate-200 text-sm">
                  <span className="text-slate-600">Tax (10%)</span>
                  <span className="font-semibold text-slate-900">${(total * 0.1).toFixed(2)}</span>
                </div>

                {/* Total */}
                <div className="flex justify-between mb-6">
                  <span className="text-xl font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-green-700">${(total * 1.1).toFixed(2)}</span>
                </div>

                {/* Checkout Button */}
                <Link
                  to="/checkout"
                  className="block w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold text-center transition flex items-center justify-center gap-2 mb-3"
                >
                  Proceed to Checkout
                  <ArrowRight size={20} />
                </Link>

                {/* Continue Shopping */}
                <Link
                  to="/products"
                  className="block w-full border-2 border-slate-300 text-slate-900 hover:bg-slate-50 py-3 rounded-lg font-semibold text-center transition"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
