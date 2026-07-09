import { useState, useEffect } from 'react';
import { Eye, ChevronDown, Calendar, User, DollarSign } from 'lucide-react';
import { apiClient } from '../services/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [error, setError] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get('/orders');
      const ordersArray = Array.isArray(data) ? data : (data?.data || data?.orders || []);
      setOrders(ordersArray);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = Array.isArray(orders)
    ? (statusFilter === 'all' 
      ? orders 
      : orders.filter(o => o.order_status === statusFilter))
    : [];

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  async function updateOrderStatus(orderId, statusType, newStatus) {
    try {
      setUpdatingOrder(orderId);
      setUpdateMessage({ type: '', text: '' });
      
      const response = await apiClient.patch(`/orders/${orderId}/status`, {
        [statusType]: newStatus
      });
      
      // Update the local orders state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, [statusType]: newStatus }
          : order
      ));
      
      setUpdateMessage({ type: 'success', text: `${statusType.replace('_', ' ')} updated to ${newStatus}` });
      setTimeout(() => setUpdateMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setUpdateMessage({ type: 'error', text: 'Failed to update status' });
      setTimeout(() => setUpdateMessage({ type: '', text: '' }), 3000);
    } finally {
      setUpdatingOrder(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-slate-900">Orders Management</h1>
        <button 
          onClick={fetchOrders} 
          className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-medium"
        >
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {updateMessage.text && (
        <div className={`px-4 py-3 rounded-lg border ${
          updateMessage.type === 'success' 
            ? 'bg-green-100 border-green-300 text-green-800'
            : 'bg-red-100 border-red-300 text-red-800'
        }`}>
          {updateMessage.text}
        </div>
      )}

      {/* Status Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition border ${
              statusFilter === status
                ? 'bg-green-700 text-white border-green-700'
                : 'bg-white border-slate-300 text-slate-900 hover:border-green-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 text-xs">
              ({status === 'all' ? orders.length : orders.filter(o => o.order_status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          <p className="text-slate-600 mt-4">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-slate-600">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order Number</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Total Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Payment Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{order.order_number || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">{order.firstname || ''} {order.lastname || ''}</p>
                        <p className="text-sm text-slate-600">{order.email || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar size={16} />
                      {formatDate(order.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-green-700" />
                      <p className="font-semibold text-green-700">{formatCurrency(order.total_amount)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status?.toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.order_status)}`}>
                      {order.order_status?.toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        <Eye size={16} />
                        Details
                        <ChevronDown size={16} className={`transition ${openDropdown === order.id ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdown === order.id && (
                        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                          <div className="p-4 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-900 mb-3">Order Details</h3>
                          </div>

                          {/* Order Status Section */}
                          <div className="p-4 border-b border-slate-200">
                            <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Order Status</p>
                            <p className="text-sm text-slate-700 mb-2 capitalize">Current: <span className="font-semibold">{order.order_status || 'pending'}</span></p>
                            <div className="grid grid-cols-2 gap-2">
                              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                                <button
                                  key={status}
                                  disabled={updatingOrder === order.id}
                                  onClick={() => updateOrderStatus(order.id, 'order_status', status)}
                                  className={`px-3 py-2 rounded text-xs font-medium transition disabled:opacity-50 ${
                                    order.order_status === status
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                >
                                  {updatingOrder === order.id ? 'Updating...' : (status.charAt(0).toUpperCase() + status.slice(1))}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Payment Status Section */}
                          <div className="p-4 border-b border-slate-200">
                            <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Payment Status</p>
                            <p className="text-sm text-slate-700 mb-2 capitalize">Current: <span className="font-semibold">{order.payment_status || 'pending'}</span></p>
                            <div className="grid grid-cols-2 gap-2">
                              {['pending', 'paid', 'failed', 'refunded'].map(status => (
                                <button
                                  key={status}
                                  disabled={updatingOrder === order.id}
                                  onClick={() => updateOrderStatus(order.id, 'payment_status', status)}
                                  className={`px-3 py-2 rounded text-xs font-medium transition disabled:opacity-50 ${
                                    order.payment_status === status
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                >
                                  {updatingOrder === order.id ? 'Updating...' : (status.charAt(0).toUpperCase() + status.slice(1))}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Payment Method Section */}
                          {order.payment && (
                            <div className="p-4 bg-slate-50 border-t border-slate-200">
                              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Payment Method</p>
                              <div className="space-y-1 text-sm text-slate-700">
                                <p><span className="font-medium">Method:</span> {order.payment?.payment_method?.replace(/_/g, ' ') || 'N/A'}</p>
                                <p><span className="font-medium">Transaction ID:</span> {order.payment?.transaction_id || 'N/A'}</p>
                                <p><span className="font-medium">Amount:</span> {formatCurrency(order.payment?.amount)}</p>
                              </div>
                            </div>
                          )}

                          {/* Customer Info Section */}
                          <div className="p-4 bg-slate-50">
                            <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Customer Info</p>
                            <div className="space-y-1 text-sm text-slate-700">
                              <p><span className="font-medium">Name:</span> {order.firstname} {order.lastname}</p>
                              <p><span className="font-medium">Email:</span> {order.email}</p>
                              <p><span className="font-medium">Phone:</span> {order.phone || 'N/A'}</p>
                              <p><span className="font-medium">Address:</span> {order.shipping_address || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      )}
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
