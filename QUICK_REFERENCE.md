# Quick Reference Guide - Agricultural Marketplace

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

**Backend:**
```powershell
cd backend
composer install
```

**Frontend:**
```powershell
cd frontend
npm install
```

### 2. Start Development Servers

**Terminal 1 - Backend (PHP):**
```powershell
cd backend
php spark serve
# Runs on http://localhost:8080
```

**Terminal 2 - Frontend (React):**
```powershell
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### 3. Access the Application

- **User Site:** http://localhost:5173
- **Admin Panel:** http://localhost:5173/admin
- **API Documentation:** See README.md

---

## 📂 File Structure Overview

```
frontend/src/
├── pages/               # Public pages
│   ├── Home.jsx        # Landing page
│   ├── Products.jsx    # Product catalog
│   ├── ProductDetails.jsx
│   ├── Cart.jsx        # Shopping cart
│   ├── Checkout.jsx    # Order confirmation
│   ├── Payment.jsx     # Payment selection
│   └── TrackOrder.jsx  # Order tracking
├── admin/              # Admin pages
│   ├── Dashboard.jsx   # Stats & charts
│   ├── Products.jsx    # Product management
│   ├── Orders.jsx      # Order management
│   ├── Customers.jsx   # Customer list
│   └── Payments.jsx    # Payment history
├── components/         # Reusable components
├── layouts/           # Page wrappers
├── context/           # React Context (Cart)
└── services/          # API client

backend/app/
├── Controllers/       # API endpoints
├── Models/           # Database models
├── Database/         # Migrations & seeds
└── Filters/          # Auth middleware
```

---

## 🔌 API Integration Checklist

### Pages That Need API Calls

- [ ] Home.jsx - (No API calls, static page)
- [ ] Products.jsx - GET `/products`
- [ ] ProductDetails.jsx - GET `/products/{id}`
- [ ] Checkout.jsx - POST `/orders`
- [ ] Payment.jsx - POST `/payments`
- [ ] TrackOrder.jsx - GET `/orders/number/{orderNumber}`
- [ ] Admin Dashboard - GET `/dashboard/stats`
- [ ] Admin Products - GET/POST/PUT/DELETE `/products`
- [ ] Admin Orders - GET `/orders`, PUT `/orders/{id}`
- [ ] Admin Customers - GET `/customers`
- [ ] Admin Payments - GET `/payments`

---

## 🎨 Theme Colors (Tailwind)

| Element | Color | Class |
|---------|-------|-------|
| Primary | Emerald-600 | `bg-emerald-600`, `text-emerald-600` |
| Dark | Emerald-900 | `bg-emerald-900`, `text-emerald-900` |
| Accent | Orange-500 | `bg-orange-500`, `text-orange-500` |
| Text | Slate-900 | `text-slate-900` |
| Border | Slate-300 | `border-slate-300` |
| Background | Gray-50 | `bg-gray-50` |

---

## 💳 Payment Methods

### Card Payment
- Form-based
- Fields: Cardholder Name, Card Number, Expiry, CVV
- Status: **UI Complete**, Gateway integration needed

### Airtel Money
- Redirect-based
- Status: **UI Complete**, API integration needed

### TNM Mpamba
- Redirect-based
- Status: **UI Complete**, API integration needed

---

## 🗄️ Database Tables Quick Reference

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| users | User auth | id, email, password, role (admin/customer) |
| products | Catalog | id, name, price, stock, status |
| product_images | Images | id, product_id, image_path |
| orders | Orders | id, order_number, customer_id, total_amount |
| order_items | Line items | id, order_id, product_id, quantity, price |
| payments | Transactions | id, order_id, transaction_id, payment_method |

---

## 🐛 Common Issues & Solutions

### Issue: API calls return 404
**Solution:** 
- Verify backend is running: `php spark serve`
- Check API_URL in frontend `.env`: Should be `http://localhost:8080/api`

### Issue: CORS errors
**Solution:**
- Backend already has CORS filter in `app/Filters/Cors.php`
- Register it in `app/Config/Filters.php`

### Issue: Cart not persisting
**Solution:**
- CartContext stores in memory only
- To persist: Add localStorage sync in CartContext

### Issue: Admin routes not accessible
**Solution:**
- Admin pages don't have auth protection yet
- Add auth check in AdminLayout.jsx before rendering

---

## ⚙️ Environment Configuration

### Backend (.env)
```
CI_ENVIRONMENT=development
app.baseURL=http://127.0.0.1:8080/
database.default.hostname=localhost
database.default.database=marketplace
database.default.username=root
database.default.password=
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080/api
```

---

## 📝 Available NPM Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 🔐 Authentication Flow (TODO)

Currently: No authentication implemented

Future flow:
1. User registers at `/auth/register` endpoint
2. Receives JWT token from `/auth/login`
3. Token stored in localStorage
4. API calls include token in Authorization header
5. Admin routes check for token

---

## 📊 Admin Dashboard Metrics

- **Total Products**: Count from products table
- **Total Orders**: Count from orders table
- **Total Revenue**: Sum of order totals
- **Pending Orders**: Count where order_status = 'pending'
- **Monthly Sales**: Sum by month for last 12 months
- **Orders Per Month**: Count by month for last 12 months

---

## 🎯 Next Steps (Step 9)

1. Install Axios (optional, fetch already configured)
2. Test API calls from frontend
3. Handle loading & error states
4. Implement retry logic for failed requests
5. Add token refresh for expired sessions

---

## 📞 Support

For detailed information, see:
- `/README.md` - Full project documentation
- `backend/README.md` - Backend setup guide
- `frontend/README.md` - Frontend setup guide

Last Updated: 2024
