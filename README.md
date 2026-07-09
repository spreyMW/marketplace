# Modern Agricultural Marketplace

A full-stack agricultural marketplace web application built with React.js, CodeIgniter 4, and MySQL.

## 🌾 Project Overview

A single-company online store selling agricultural products (4 products). Features customer shopping experience and admin management dashboard.

**Tech Stack:**
- **Frontend:** React 18+ with Vite, Tailwind CSS, React Router v6
- **Backend:** PHP CodeIgniter 4 REST API
- **Database:** MySQL 8.0+
- **Payment Methods:** Card, Airtel Money, TNM Mpamba (integrations available)

## 📋 Project Structure

```
marketplace/
├── backend/                 # CodeIgniter 4 PHP Backend
│   ├── app/
│   │   ├── Config/         # Configuration files
│   │   ├── Controllers/    # API controllers
│   │   ├── Models/         # Database models
│   │   ├── Database/       # Migrations & seeds
│   │   └── Filters/        # Auth middleware
│   ├── public/             # Web root
│   ├── writable/           # Cache, logs, uploads
│   └── .env                # Environment config
│
└── frontend/               # React + Vite
    ├── src/
    │   ├── pages/         # Route pages (Home, Products, Cart, etc.)
    │   ├── admin/         # Admin panel pages
    │   ├── components/    # Reusable components
    │   ├── layouts/       # PublicLayout, AdminLayout
    │   ├── context/       # React Context (CartContext)
    │   ├── services/      # API client
    │   └── App.jsx        # Main routing
    ├── public/            # Static files
    ├── .env               # Environment config
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- **Backend:** PHP 8.1+, Composer, MySQL 8.0+
- **Frontend:** Node.js 18+, npm/yarn

### Backend Setup

1. **Configure Database**
   ```bash
   cd backend
   # Update .env with your MySQL credentials
   cp .env.example .env  # If needed
   ```

2. **Install Dependencies**
   ```bash
   composer install
   ```

3. **Run Migrations**
   ```bash
   php spark migrate
   ```

4. **Seed Sample Data (Optional)**
   ```bash
   php spark db:seed ProductSeeder
   ```

5. **Start Development Server**
   ```bash
   php spark serve
   ```
   API runs at: `http://localhost:8080`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   ```bash
   # .env file with API URL
   VITE_API_URL=http://localhost:8080/api
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Frontend runs at: `http://localhost:5173`

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login (returns JWT token)
- `POST /auth/logout` - User logout
- `GET /auth/user` - Get current user

### Products
- `GET /products` - Get all active products
- `GET /products/{id}` - Get single product
- `POST /products` - Create product (Admin)
- `PUT /products/{id}` - Update product (Admin)
- `DELETE /products/{id}` - Delete product (Admin)

### Orders
- `GET /orders` - Get all orders (Admin/Customer)
- `GET /orders/{id}` - Get order details
- `POST /orders` - Create new order
- `GET /orders/number/{orderNumber}` - Track order by number
- `PUT /orders/{id}` - Update order status

### Payments
- `POST /payments` - Create payment
- `GET /payments` - Get all payments
- `GET /payments/{id}` - Get payment details
- `POST /payments/{id}/verify` - Verify payment
- `POST /payments/{id}/status` - Update payment status

### Admin
- `GET /dashboard/stats` - Dashboard statistics
- `GET /customers` - Get all customers

## 🎨 Frontend Features

### Public Pages
- **Home** - Landing page with company info and CTA
- **Products** - Product catalog with search
- **Product Details** - Single product view with Add to Cart
- **Cart** - Shopping cart management
- **Checkout** - Customer information and order summary
- **Payment** - Multiple payment method selection
- **Track Order** - Order status tracking with timeline

### Admin Panel
- **Dashboard** - Statistics and monthly sales charts
- **Products** - Product CRUD management
- **Orders** - Order list with status filters
- **Customers** - Customer list and order history
- **Payments** - Payment transaction history

## 🔐 Authentication

- JWT token-based authentication
- Auth tokens stored in localStorage
- Protected admin routes require authentication
- Authorization middleware on backend

## 🛒 Shopping Flow

1. User browses products on home/products page
2. Adds items to cart (stored in CartContext)
3. Reviews cart, updates quantities, removes items
4. Proceeds to checkout
5. Enters shipping address
6. Selects payment method
7. Completes payment
8. Can track order status

## 💳 Payment Methods

- **Card Payment** - Form-based with cardholder details
- **Airtel Money** - Mobile money redirect integration
- **TNM Mpamba** - Mobile money redirect integration

Payment integration placeholders in `PaymentController.php` and `Payment.jsx`

## 📁 Database Schema

### Tables
- `users` - User accounts (admin, customer)
- `products` - Product catalog
- `product_images` - Product images (one-to-many)
- `orders` - Customer orders
- `order_items` - Order line items
- `payments` - Payment transactions

## 🎯 Key Features

✅ Responsive design (mobile, tablet, desktop)
✅ Shopping cart with quantity management
✅ Order tracking with status timeline
✅ Multiple payment options
✅ Admin dashboard with statistics
✅ Product management interface
✅ Customer management
✅ Payment history tracking
✅ Clean, modern UI with Tailwind CSS

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
vendor/bin/phpunit

# Frontend tests (to be configured)
cd frontend
npm run test
```

### Building for Production

**Backend:**
```bash
cd backend
# Adjust .env for production
CI_ENVIRONMENT=production
```

**Frontend:**
```bash
cd frontend
npm run build
# Output in dist/
```

## 🌐 Deployment

Backend: Deploy to PHP hosting (requires PHP 8.1+, MySQL)
Frontend: Deploy to static hosting (Vercel, Netlify, GitHub Pages) or use same server

## 📝 Environment Variables

### Backend (.env)
```
CI_ENVIRONMENT=development
app.baseURL=http://localhost:8080/
database.default.hostname=localhost
database.default.database=marketplace
database.default.username=root
database.default.password=
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080/api
```

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

Proprietary - All rights reserved

## 📞 Support

For issues or questions, please contact the development team.

---

**Last Updated:** 2024
**Version:** 1.0.0
