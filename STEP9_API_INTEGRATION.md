# Step 9: API Integration Checklist

**Status:** Ready for implementation
**Estimated Time:** 2-3 days
**Priority:** HIGH - Core functionality

---

## 📋 Overview

All backend API endpoints are complete. This step focuses on connecting the frontend pages to these endpoints and testing the full request-response cycle.

## ✅ Frontend Pages Ready for Integration

### 🔴 Public Pages (7 pages)

#### 1. ❌ Products.jsx
**Currently:** Shows placeholder data
**Integration Needed:** 
```javascript
// Already in code:
const data = await apiClient.get('/products');
```
**Test Cases:**
- [ ] Load product list on mount
- [ ] Handle empty results
- [ ] Handle API errors
- [ ] Verify search functionality
- [ ] Check responsive grid layout

**Expected Data Structure:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Product Name",
      "slug": "product-slug",
      "description": "...",
      "price": 100.00,
      "stock": 50,
      "featured_image": "path/to/image.jpg",
      "status": "active"
    }
  ]
}
```

---

#### 2. ❌ ProductDetails.jsx
**Currently:** Loads product by ID
**Integration Needed:**
```javascript
const response = await apiClient.get(`/products/${id}`);
```
**Test Cases:**
- [ ] Load product on mount by route ID
- [ ] Display product images gallery
- [ ] Handle 404 error (product not found)
- [ ] Add to cart saves correct product
- [ ] Quantity selector works with stock

**Expected Data Structure:**
```json
{
  "id": 1,
  "name": "Tomatoes",
  "description": "Fresh red tomatoes",
  "price": 50.00,
  "stock": 200,
  "featured_image": "...",
  "images": [
    {"id": 1, "image_path": "..."},
    {"id": 2, "image_path": "..."}
  ]
}
```

---

#### 3. ❌ Checkout.jsx
**Currently:** Has form ready
**Integration Needed:**
```javascript
const response = await apiClient.post('/orders', {
  customer_id: userId,
  items: cart.map(item => ({
    product_id: item.productData.id,
    quantity: item.quantity,
    price: item.productData.price
  })),
  shipping_address: formData.address
});
```
**Test Cases:**
- [ ] Form validation works
- [ ] Order created successfully
- [ ] Returns order_id and order_number
- [ ] Cart clears after success
- [ ] Error message displays on failure
- [ ] Redirect to payment page

**Request Format:**
```json
{
  "customer_id": 1,
  "items": [
    {"product_id": 1, "quantity": 2, "price": 50.00},
    {"product_id": 3, "quantity": 1, "price": 100.00}
  ],
  "shipping_address": "123 Main Street, City"
}
```

**Expected Response:**
```json
{
  "id": 1,
  "order_number": "ORD-1686124800-5432",
  "customer_id": 1,
  "total_amount": 200.00,
  "payment_status": "pending",
  "order_status": "pending",
  "created_at": "2024-06-07 12:00:00"
}
```

---

#### 4. ❌ Payment.jsx
**Currently:** Form ready, no API calls
**Integration Needed:**
```javascript
const payment = await apiClient.post('/payments', {
  order_id: order.id,
  payment_method: paymentMethod,
  amount: totalAmount
});
```
**Test Cases:**
- [ ] Payment created with correct method
- [ ] Handles all 3 payment methods
- [ ] Updates payment status to completed
- [ ] Shows payment reference/transaction ID
- [ ] Clears cart on success
- [ ] Error handling works

**Request Format:**
```json
{
  "order_id": 1,
  "payment_method": "card",  // or "airtel_money", "tnm_mpamba"
  "amount": 220.00           // Including tax
}
```

**Expected Response:**
```json
{
  "id": 1,
  "order_id": 1,
  "transaction_id": "TXN-1686124800-5432",
  "payment_method": "card",
  "amount": 220.00,
  "status": "pending"
}
```

---

#### 5. ❌ TrackOrder.jsx
**Currently:** Has search form
**Integration Needed:**
```javascript
const order = await apiClient.get(`/orders/number/${orderNumber}`);
```
**Test Cases:**
- [ ] Search by order number works
- [ ] Displays order details correctly
- [ ] Shows items with product info
- [ ] Timeline updates with order status
- [ ] Handles invalid order number
- [ ] Shows shipping address

**Expected Data Structure:**
```json
{
  "id": 1,
  "order_number": "ORD-1686124800-5432",
  "customer_id": 1,
  "total_amount": 220.00,
  "payment_status": "paid",
  "order_status": "processing",
  "shipping_address": "123 Main Street",
  "created_at": "2024-06-07",
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "quantity": 2,
      "price": 50.00,
      "product": {
        "name": "Tomatoes",
        "featured_image": "..."
      }
    }
  ]
}
```

---

### 🟠 Admin Pages (5 pages)

#### 6. ❌ Dashboard.jsx
**Currently:** Placeholder stats
**Integration Needed:**
```javascript
const stats = await apiClient.get('/dashboard/stats');
```
**Test Cases:**
- [ ] Load stats on mount
- [ ] Display correct metrics
- [ ] Handle missing data gracefully
- [ ] Loading state shows
- [ ] Error state shows

**Expected Response:**
```json
{
  "total_products": 4,
  "total_orders": 15,
  "total_revenue": 3500.00,
  "pending_orders": 2,
  "delivered_orders": 13,
  "monthly_sales": [...],  // Array of 12 months
  "orders_per_month": [...]  // Array of 12 months
}
```

---

#### 7. ❌ Products.jsx (Admin)
**Currently:** Has table, no data
**Integration Needed:**
```javascript
// Get products
const products = await apiClient.get('/products?admin=true');

// Update product
await apiClient.put(`/products/${id}`, updates);

// Delete product
await apiClient.delete(`/products/${id}`);
```
**Test Cases:**
- [ ] Load all products (including inactive)
- [ ] Edit functionality works
- [ ] Delete functionality works
- [ ] Add new product works
- [ ] Image upload works

---

#### 8. ❌ Orders.jsx (Admin)
**Currently:** Has filter and table
**Integration Needed:**
```javascript
const orders = await apiClient.get('/orders');
await apiClient.put(`/orders/${id}`, { order_status: newStatus });
```
**Test Cases:**
- [ ] Load all orders
- [ ] Filter by status works
- [ ] Update order status works
- [ ] Status changes reflect immediately
- [ ] Pagination works (if applicable)

---

#### 9. ❌ Customers.jsx (Admin)
**Currently:** Has table, no data
**Integration Needed:**
```javascript
const customers = await apiClient.get('/customers');
```
**Test Cases:**
- [ ] Load customer list
- [ ] Display correct fields
- [ ] Total orders count accurate
- [ ] View order history works

---

#### 10. ❌ Payments.jsx (Admin)
**Currently:** Has table and filters
**Integration Needed:**
```javascript
const payments = await apiClient.get('/payments');
```
**Test Cases:**
- [ ] Load payment transactions
- [ ] Filter by date works
- [ ] Payment methods display correctly
- [ ] Status badges accurate
- [ ] Transaction IDs truncate properly

---

## 🛠️ Implementation Steps

### Phase 1: Setup & Testing (Day 1)

#### 1.1 Test Backend API
```bash
# Start backend
cd backend
php spark serve

# Test with Postman/Insomnia:
GET http://localhost:8080/api/products
GET http://localhost:8080/api/orders
GET http://localhost:8080/api/dashboard/stats
```

**Checklist:**
- [ ] All endpoints return proper data
- [ ] Error responses include error messages
- [ ] CORS headers are correct
- [ ] Status codes are 200/201/400/404/500

#### 1.2 Verify Frontend Setup
```bash
# Start frontend
cd frontend
npm install  # If not done
npm run dev
```

**Checklist:**
- [ ] No console errors
- [ ] Components render without errors
- [ ] API service is initialized
- [ ] .env file has correct API_URL

#### 1.3 Test Single API Call
Create a simple test component:
```jsx
import { useEffect, useState } from 'react';
import { apiClient } from '../services/api';

export function ApiTest() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    apiClient.get('/products')
      .then(setData)
      .catch(err => console.error(err));
  }, []);
  
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

- [ ] Test component mounts
- [ ] API call succeeds
- [ ] Data displays in console
- [ ] Error handling works

---

### Phase 2: Page-by-Page Integration (Days 2-3)

#### Products.jsx
```jsx
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  apiClient.get('/products')
    .then(data => {
      setProducts(data.data || data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
}, []);
```

- [ ] Replace placeholder data
- [ ] Add loading spinner
- [ ] Add error message
- [ ] Test search functionality

#### ProductDetails.jsx
```jsx
const { id } = useParams();
const [product, setProduct] = useState(null);

useEffect(() => {
  if (!id) return;
  
  apiClient.get(`/products/${id}`)
    .then(setProduct)
    .catch(() => setNotFound(true));
}, [id]);
```

- [ ] Load by route parameter
- [ ] Show 404 if not found
- [ ] Display all product data
- [ ] Test Add to Cart

#### Checkout.jsx
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await apiClient.post('/orders', {
      customer_id: 1,  // TODO: Get from auth
      items: cart.map(item => ({
        product_id: item.productData.id,
        quantity: item.quantity,
        price: item.productData.price
      })),
      shipping_address: formData.address
    });
    navigate('/payment', { state: { order: response } });
  } catch (err) {
    setError(err.message);
  }
};
```

- [ ] Create order in database
- [ ] Receive order_id and order_number
- [ ] Navigate to payment page
- [ ] Pass order data to Payment page

#### Payment.jsx
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payment = await apiClient.post('/payments', {
      order_id: order.id,
      payment_method: paymentMethod,
      amount: getTotalWithTax()
    });
    
    // Update payment status
    await apiClient.post(`/payments/${payment.id}/status`, {
      status: 'completed'
    });
    
    setPaymentRef(payment.transaction_id);
    setPaymentSuccess(true);
    cartDispatch({ type: 'CLEAR_CART' });
  } catch (err) {
    setError(err.message);
  }
};
```

- [ ] Create payment record
- [ ] Update payment status
- [ ] Clear cart on success
- [ ] Show confirmation with reference

#### TrackOrder.jsx
```jsx
const handleSearch = async () => {
  try {
    const data = await apiClient.get(`/orders/number/${orderNumber}`);
    setOrder(data);
  } catch (err) {
    setError('Order not found');
  }
};
```

- [ ] Search by order number
- [ ] Display order timeline
- [ ] Show all order details
- [ ] Handle not found error

---

### Phase 3: Admin Integration

Similar pattern for admin pages:
1. Get endpoint data
2. Add loading states
3. Add error handling
4. Test CRUD operations
5. Verify data binding

---

## 🧪 Testing Checklist

### Functional Tests
- [ ] All GET requests return data
- [ ] All POST requests create records
- [ ] All PUT requests update records
- [ ] All DELETE requests remove records
- [ ] Validation rules work
- [ ] Error messages display

### Integration Tests
- [ ] Create order → Create payment flow
- [ ] Search order tracking works
- [ ] Admin dashboard shows real data
- [ ] Admin filters work correctly
- [ ] Pagination works (if applicable)

### Error Handling
- [ ] 404 handled (product not found)
- [ ] 500 handled (server error)
- [ ] Network error handled
- [ ] Validation errors display
- [ ] User feedback is clear

### Performance
- [ ] Data loads within 2 seconds
- [ ] UI responsive during loading
- [ ] No memory leaks
- [ ] Pagination if 100+ items

---

## 🐛 Common Issues & Fixes

### Issue: CORS Error
**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`
**Fix:**
```php
// backend/app/Config/Filters.php
public array $filters = [
    'cors' => ['before' => '*'],
];
```

### Issue: API returns undefined
**Error:** `data.data is undefined`
**Fix:**
```javascript
// api.js - Check actual response format
const response = await response.json();
return response.data || response;
```

### Issue: Cart not persisting to order
**Error:** Cart items don't show in checkout
**Fix:**
```javascript
// Check cart in useEffect
console.log('Current cart:', cart);
// Verify cart structure matches API expected format
```

---

## 📊 Integration Success Metrics

✅ Complete when:
- [ ] All 10 pages integrate with API
- [ ] No console errors
- [ ] All CRUD operations work
- [ ] Error states display properly
- [ ] Loading states show during requests
- [ ] Response time < 2 seconds
- [ ] 100+ API calls tested and working

---

## 📝 Commit Strategy

```bash
# After each page integration:
git add src/pages/ProductsPage.jsx
git commit -m "Integrate Products page API calls - GET /products"

# After full phase:
git add .
git commit -m "Step 9 Complete: API integration for all pages"
```

---

## Next Steps After Step 9

Once all API integrations are complete:
1. **Step 10:** Payment gateway integration
2. **Step 11:** Authentication & security
3. **Step 12:** Testing & deployment

---

**Ready to Begin?**
Start with Testing Phase 1 (Day 1) to ensure backend is working properly.

Last Updated: Ready for Implementation
