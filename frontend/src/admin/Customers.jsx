import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { apiClient } from '../services/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);
      const data = await apiClient.get('/customers');
      // Handle different response formats
      const customersArray = Array.isArray(data) ? data : (data?.data || data?.customers || []);
      setCustomers(customersArray);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Customers</h1>

      {loading ? (
        <div className="text-slate-600">Loading customers...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Total Orders</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Array.isArray(customers) && customers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">{customer.firstname} {customer.lastname}</td>
                  <td className="px-6 py-4 text-slate-600">{customer.email}</td>
                  <td className="px-6 py-4 text-slate-600">{customer.phone}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-800">
                      {customer.total_orders || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {!Array.isArray(customers) || customers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-600">No customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
