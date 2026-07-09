import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, CreditCard, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState(null);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // Clear auth data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Redirect to home page
    navigate('/');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      path: '/admin/products',
      label: 'Products',
      icon: Package,
      submenu: [
        { path: '/admin/products/add', label: 'Add Products' },
        { path: '/admin/products', label: 'Manage Products' },
      ],
    },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-green-900 text-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-green-800">
          <h1 className="text-2xl font-bold">Agriculture Hub</h1>
          <p className="text-sm text-green-200">Admin Panel</p>
        </div>

        <nav className="mt-6 space-y-2 px-4 flex-1">
          {menuItems.map(({ path, label, icon: Icon, submenu }) => (
            <div key={path}>
              {submenu ? (
                <>
                  <button
                    onClick={() =>
                      setExpandedMenu(expandedMenu === path ? null : path)
                    }
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition ${
                      isActive(path) || submenu.some((item) => isActive(item.path))
                        ? 'bg-green-700 text-white'
                        : 'text-green-100 hover:bg-green-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      <span>{label}</span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${
                        expandedMenu === path ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedMenu === path && (
                    <div className="space-y-1 mt-2 ml-4">
                      {submenu.map(({ path: subPath, label: subLabel }) => (
                        <Link
                          key={subPath}
                          to={subPath}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${
                            isActive(subPath)
                              ? 'bg-green-600 text-white'
                              : 'text-green-100 hover:bg-green-800'
                          }`}
                        >
                          <span className="w-2 h-2 bg-current rounded-full"></span>
                          <span>{subLabel}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(path)
                      ? 'bg-green-700 text-white'
                      : 'text-green-100 hover:bg-green-800'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="mt-auto px-4 py-6 border-t border-green-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-green-100 hover:bg-green-800 hover:text-white transition"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
