import { useState } from 'react';
import { Search, Package, Truck, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../services/api';

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSearched(true);

    try {
      if (!orderNumber.trim()) {
        throw new Error('Please enter an order number');
      }
      const data = await apiClient.get(`/orders/number/${orderNumber}`);
      setOrder(data);
    } catch (err) {
      setError('Order not found. Please check your order number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  const statusSteps = [
    { status: 'pending', label: 'Pending', icon: Package },
    { status: 'processing', label: 'Processing', icon: Package },
    { status: 'shipped', label: 'Shipped', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  function getStatusIndex(status) {
    return statusSteps.findIndex(step => step.status === status);
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8 text-center">Track Your Order</h1>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Enter your order number (e.g., ORD-xxxxx-xxxx)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {searched && !order && !error && !loading && (
          <div className="text-center py-8">
            <p className="text-slate-600">Start by entering your order number</p>
          </div>
        )}

        {order && (
          <div className="space-y-8">
            {/* Order Info */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Order Number</p>
                  <p className="text-lg font-semibold text-slate-900">{order.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Order Date</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                  <p className="text-lg font-semibold text-green-700">${order.total_amount}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Payment Status</p>
                  <p className={`text-lg font-semibold ${
                    order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Order Status</h2>
              
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-200"></div>

                {/* Status Items */}
                <div className="space-y-8">
                  {statusSteps.map((step, index) => {
                    const currentIndex = getStatusIndex(order.order_status);
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    const Icon = step.icon;

                    return (
                      <div key={step.status} className="relative pl-20">
                        {/* Status Circle */}
                        <div className={`absolute -left-3 top-0 w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                          isCompleted
                            ? 'bg-green-700 border-green-700'
                            : 'bg-white border-gray-300'
                        }`}>
                          <Icon className={isCompleted ? 'text-white' : 'text-gray-400'} size={24} />
                        </div>

                        {/* Status Content */}
                        <div>
                          <h3 className={`text-lg font-semibold ${
                            isCompleted ? 'text-slate-900' : 'text-slate-500'
                          }`}>
                            {step.label}
                          </h3>
                          <p className={`text-sm ${
                            isCompleted ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                            {isCurrent ? 'Current status' : isCompleted ? 'Completed' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Shipping Address</h2>
              <p className="text-slate-600">{order.shipping_address}</p>
            </div>

            {/* Order Items Table */}
            {order.items && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Items</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-300">
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Product</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-900">Quantity</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-900">Price</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-900">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map(item => (
                        <tr key={item.id} className="border-b border-slate-200 hover:bg-gray-50 transition">
                          <td className="py-4 px-4">
                            <p className="font-semibold text-slate-900">{item.name || 'Product'}</p>
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full font-semibold">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="text-right py-4 px-4">
                            <p className="text-slate-900 font-semibold">${parseFloat(item.price).toFixed(2)}</p>
                          </td>
                          <td className="text-right py-4 px-4">
                            <p className="text-green-700 font-bold text-lg">${parseFloat(item.subtotal).toFixed(2)}</p>
                          </td>
                        </tr>
                      ))}
                      {/* Total Row */}
                      <tr className="bg-green-50 border-t-2 border-green-300">
                        <td colSpan="3" className="py-4 px-4 text-right font-bold text-slate-900">
                          Total Amount:
                        </td>
                        <td className="text-right py-4 px-4">
                          <p className="text-green-700 font-bold text-lg">${parseFloat(order.total_amount).toFixed(2)}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
