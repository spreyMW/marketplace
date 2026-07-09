import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useCart();
  
  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const userData = userString ? JSON.parse(userString) : null;
  const user = userData ? userData.firstname : null;
  const userEmail = userData ? userData.email : null;
  const isAdmin = userData && userData.role === 'admin';

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleUserMenu = () => setIsUserOpen(!isUserOpen);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setIsUserOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'text-green-700 font-semibold' : 'text-slate-700 hover:text-green-700';

  // Count unique products in cart (not total quantities)
  const cartCount = cart.length;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b-4 border-green-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-green-700 to-amber-600 text-white px-3 py-2 rounded-lg font-bold text-lg">🌾</div>
            <span className="text-xl font-bold text-slate-900">Agriculture Hub</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`transition ${isActive('/')}`}>Home</Link>
            <Link to="/products" className={`transition ${isActive('/products')}`}>Products</Link>
            <Link to="/track-order" className={`transition ${isActive('/track-order')}`}>Track Order</Link>
            <a href="#contact" className="text-slate-700 hover:text-green-700 transition">Contact</a>
          </div>

          {/* Right Icons & Menu */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link to="/cart" className="relative text-slate-700 hover:text-green-700 transition">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 text-slate-700 hover:text-green-700 transition"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-700 to-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {user.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{user}</span>
                </button>

                {/* User Dropdown */}
                {isUserOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserOpen(false)}
                        className="flex items-center space-x-2 px-4 py-3 text-slate-700 hover:bg-green-50 transition"
                      >
                        <LayoutDashboard size={18} />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 transition border-t border-slate-200"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/signup"
                  className="px-4 py-2 border-2 border-green-700 text-green-700 rounded-lg hover:bg-green-50 transition font-semibold"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-gradient-to-r from-green-700 to-amber-600 text-white rounded-lg hover:from-green-800 hover:to-amber-700 transition font-semibold"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button onClick={toggleMenu} className="md:hidden text-slate-700">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2 rounded-lg transition ${isActive('/')}`}
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2 rounded-lg transition ${isActive('/products')}`}
            >
              Products
            </Link>
            <Link
              to="/track-order"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2 rounded-lg transition ${isActive('/track-order')}`}
            >
              Track Order
            </Link>
            <a href="#contact" className="block px-4 py-2 text-slate-700 hover:text-green-700 transition">Contact</a>
            {!user && (
              <>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 border-2 border-green-700 text-green-700 rounded-lg hover:bg-green-50 transition font-semibold text-center"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-semibold"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
