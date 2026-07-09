import { useState, useEffect } from 'react';
import { BarChart3, ShoppingCart, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import Chart from 'react-apexcharts';
import { apiClient } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [ordersPerMonth, setOrdersPerMonth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const [statsData, ordersData, salesData, ordersMonthData] = await Promise.all([
        apiClient.get('/dashboard/stats'),
        apiClient.get('/dashboard/recent-orders'),
        apiClient.get('/dashboard/monthly-sales'),
        apiClient.get('/dashboard/orders-per-month')
      ]);
      setStats(statsData);
      setRecentOrders(ordersData || []);
      setMonthlySales(salesData || []);
      setOrdersPerMonth(ordersMonthData || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !stats) {
    return <div className="text-slate-600 p-6">Loading dashboard...</div>;
  }

  const statCards = [
    { label: 'Total Products', value: stats?.total_products || 0, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Orders', value: stats?.total_orders || 0, icon: ShoppingCart, color: 'bg-green-50 text-green-600' },
    { label: 'Total Revenue', value: '$' + (typeof stats?.total_revenue === 'number' ? stats.total_revenue : 0).toFixed(2), icon: DollarSign, color: 'bg-emerald-50 text-emerald-700' },
  ];

  const revenueBreakdown = [
    { label: 'Paid Revenue', value: '$' + (typeof stats?.paid_revenue === 'number' ? stats.paid_revenue : 0).toFixed(2), color: 'bg-green-50 text-green-700', count: stats?.paid_orders || 0 },
    { label: 'Pending Revenue', value: '$' + (typeof stats?.pending_revenue === 'number' ? stats.pending_revenue : 0).toFixed(2), color: 'bg-yellow-50 text-yellow-700', count: stats?.pending_orders || 0 },
    { label: 'Rejected Revenue', value: '$' + (typeof stats?.rejected_revenue === 'number' ? stats.rejected_revenue : 0).toFixed(2), color: 'bg-red-50 text-red-700', count: stats?.rejected_orders || 0 },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {lastUpdated && <p className="text-xs text-slate-500 mb-4">Last updated: {lastUpdated}</p>}
      
      {/* All Statistics Cards in One Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {/* Main Stat Cards */}
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={`stat-${idx}`} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-4`}>
                <Icon size={24} />
              </div>
              <p className="text-sm text-slate-600 mb-2">{card.label}</p>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          );
        })}

        {/* Revenue Breakdown Cards */}
        {revenueBreakdown.map((item, idx) => (
          <div key={`revenue-${idx}`} className={`${item.color} rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 ${
            idx === 0 ? 'border-green-600' : idx === 1 ? 'border-yellow-600' : 'border-red-600'
          }`}>
            <p className="text-sm font-semibold mb-2">{item.label}</p>
            <p className="text-2xl font-bold mb-2">{item.value}</p>
            <p className="text-xs text-slate-600">({item.count} orders)</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 size={24} />
            Monthly Sales
          </h2>
          {monthlySales.length > 0 ? (
            <Chart
              options={{
                chart: {
                  type: 'area',
                  toolbar: { show: true },
                  sparkline: { enabled: false }
                },
                colors: ['#3b82f6'],
                stroke: { curve: 'smooth', width: 2 },
                fill: {
                  type: 'gradient',
                  gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.45,
                    opacityTo: 0.05,
                    stops: [20, 100, 100, 100]
                  }
                },
                dataLabels: { enabled: false },
                xaxis: {
                  categories: monthlySales.map(item => item.month || 'N/A'),
                  labels: { style: { colors: '#64748b' } }
                },
                yaxis: {
                  labels: { style: { colors: '#64748b' } }
                },
                grid: {
                  borderColor: '#e2e8f0',
                  strokeDashArray: 3
                },
                tooltip: {
                  theme: 'light',
                  y: {
                    formatter: (value) => `$${(typeof value === 'number' ? value : parseFloat(value) || 0).toFixed(2)}`
                  }
                }
              }}
              series={[{
                name: 'Sales',
                data: monthlySales.map(item => parseFloat(item.total_amount) || 0)
              }]}
              type="area"
              height={300}
            />
          ) : (
            <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center text-slate-600">
              No sales data available
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 size={24} />
            Orders Per Month
          </h2>
          {ordersPerMonth.length > 0 ? (
            <Chart
              options={{
                chart: {
                  type: 'bar',
                  toolbar: { show: true },
                  sparkline: { enabled: false }
                },
                colors: ['#10b981'],
                dataLabels: { enabled: false },
                xaxis: {
                  categories: ordersPerMonth.map(item => item.month || 'N/A'),
                  labels: { style: { colors: '#64748b' } }
                },
                yaxis: {
                  labels: { style: { colors: '#64748b' } }
                },
                grid: {
                  borderColor: '#e2e8f0',
                  strokeDashArray: 3
                },
                tooltip: {
                  theme: 'light',
                  y: {
                    formatter: (value) => `${value} orders`
                  }
                }
              }}
              series={[{
                name: 'Orders',
                data: ordersPerMonth.map(item => item.order_count || 0)
              }]}
              type="bar"
              height={300}
            />
          ) : (
            <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center text-slate-600">
              No order data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Orders</h2>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Order ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">#{order.id}</td>
                    <td className="px-4 py-3 text-slate-700">{order.firstname} {order.lastname}</td>
                    <td className="px-4 py-3 text-slate-700">${(typeof order.total_amount === 'number' ? order.total_amount : parseFloat(order.total_amount) || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.order_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-600 text-center py-8">No recent orders</p>
        )}
      </div>
    </div>
  );
}
