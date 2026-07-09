import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { apiClient } from '../services/api';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      setLoading(true);
      const data = await apiClient.get('/payments');
      // Handle different response formats
      const paymentsArray = Array.isArray(data) ? data : (data?.data || data?.payments || []);
      setPayments(paymentsArray);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Payments</h1>

      <div className="mb-6 flex gap-2">
        {['all', 'today', 'week', 'month'].map(filter => (
          <button
            key={filter}
            onClick={() => setDateFilter(filter)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              dateFilter === filter
                ? 'bg-green-700 text-white'
                : 'bg-white border border-slate-300 text-slate-900 hover:border-green-700'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-600">Loading payments...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Order</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Transaction ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Payment Method</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Array.isArray(payments) && payments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">{payment.order_number}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{payment.transaction_id.substring(0, 20)}...</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-lg text-sm font-medium bg-purple-100 text-purple-800">
                      {payment.payment_method.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-700">${payment.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition">
                      <Eye size={18} />
                    </button>
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
