import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import StripePaymentPage from './pages/StripePaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import TrackOrder from './pages/TrackOrder';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Admin Pages
import AdminDashboard from './admin/Dashboard';
import ManageProducts from './admin/ManageProducts';
import AddProducts from './admin/AddProducts';
import EditProducts from './admin/EditProducts';
import AdminOrders from './admin/Orders';
import AdminCustomers from './admin/Customers';
import AdminPayments from './admin/Payments';

import './App.css';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<StripePaymentPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/track-order" element={<TrackOrder />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Routes - Protected */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="products/add" element={<AddProducts />} />
            <Route path="products/edit/:id" element={<EditProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}
