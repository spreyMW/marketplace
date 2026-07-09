# PESEPAY Payment Integration Guide

## Overview
The marketplace now has full PESEPAY payment gateway integration with support for:
- Card payments
- Airtel Money
- TNM Mpamba

## Payment Flow

### 1. Customer Checkout
- User selects items, proceeds to Checkout page
- Fills shipping information
- Order is created via `POST /api/checkout`

### 2. Payment Selection
- User is redirected to `/payment` page with order data
- User selects payment method:
  - **PESEPAY** (Recommended - handles all methods)
  - **Card Payment** (Local processing)
  - **Airtel Money** (via PESEPAY)
  - **TNM Mpamba** (via PESEPAY)

### 3. Payment Processing

#### For PESEPAY Methods:
1. Frontend calls `POST /api/payments/process` with:
   ```json
   {
     "order_id": 1,
     "payment_method": "pesepay|airtel_money|tnm_mpamba",
     "amount": 123.45
   }
   ```

2. Backend encrypts payload with AES-256-CBC using `PESEPAY_ENCRYPTION_KEY`

3. Calls PESEPAY API at `PESEPAY_URL` with integration key

4. PESEPAY returns encrypted response with:
   - `referenceNumber` - Transaction reference
   - `redirectUrl` - Payment page URL

5. Backend stores in database:
   - `reference_number`
   - `gateway_response` (JSON)
   - `redirect_url`
   - Status set to "initiated"

6. Frontend redirects user to PESEPAY payment page

### 4. Payment Completion
- Customer completes payment on PESEPAY platform
- PESEPAY sends callback to `POST /api/payments/result` with:
  ```json
  {
    "referenceNumber": "xxx",
    "transactionStatus": "SUCCESS|FAILED"
  }
  ```

- Backend updates payment status
- Backend redirects customer to `/payment-success?referenceNumber=xxx&transactionStatus=SUCCESS`

### 5. Payment Verification
- PaymentSuccess page calls `POST /api/payments/verify` with reference number
- Backend looks up payment and returns details
- If successful, displays confirmation with order tracking option

## Database Fields Added

```sql
ALTER TABLE payments ADD COLUMN reference_number VARCHAR(255) NULL;
ALTER TABLE payments ADD COLUMN gateway_response TEXT NULL;
ALTER TABLE payments ADD COLUMN redirect_url TEXT NULL;
```

## Environment Variables Required

```bash
PESEPAY_INTEGRATION_KEY=919c3937-223c-4774-8614-edb17f0bb9fd
PESEPAY_ENCRYPTION_KEY=b246d6c2c8fe422ba57964124c0327c7
PESEPAY_URL=https://api.test.sandbox.pesepay.com/payments-engine/v1/payments/initiate
```

## API Endpoints

### Payment Processing
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/payments/process` | Initiate PESEPAY payment |
| POST | `/api/payments/result` | PESEPAY callback handler |
| POST | `/api/payments/verify` | Verify payment by reference |
| POST | `/api/payments/:id/refund` | Process refund |

### Admin
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/payments` | List all payments |
| GET | `/api/payments/:id` | Get payment details |
| PATCH | `/api/payments/:id` | Update payment status |
| GET | `/api/payments/stats` | Get payment statistics |

## Frontend Components

### Payment.jsx
- Payment method selection
- Local card processing option
- PESEPAY redirect handling with loading state
- Form validation

### PaymentSuccess.jsx
- Handles PESEPAY callback with reference number
- Verifies payment with backend
- Displays success/failure message
- Provides order tracking option

## Testing

### Test with Sandbox PESEPAY
1. Use sandbox credentials already configured in .env
2. PESEPAY will redirect to payment page for testing
3. After completing payment on PESEPAY, you'll be redirected back

### Manual Payment Verification
```bash
# Verify a payment by reference number
curl -X POST http://localhost:8080/api/payments/verify \
  -H "Content-Type: application/json" \
  -d '{"reference_number":"xxx"}'
```

## Security Notes

1. **Encryption**: All PESEPAY payloads encrypted with AES-256-CBC
2. **Integration Key**: Protected in .env, never exposed to frontend
3. **Reference Numbers**: Used instead of raw transaction data
4. **HTTPS**: Recommended for production (use HTTPS for PESEPAY_URL)
5. **CORS**: Ensure PESEPAY URLs are whitelisted if needed

## Troubleshooting

### Payment not redirecting
- Check browser console for errors
- Verify `PESEPAY_INTEGRATION_KEY` in .env
- Check `PESEPAY_URL` is accessible

### Callback not received
- Verify `resultUrl` in PaymentController points to `/api/payments/result`
- Check backend logs for callback errors
- Ensure PESEPAY can reach your backend URL

### Payment stuck on loading
- Check network tab in browser DevTools
- Verify API response includes `redirect_url`
- Check if PESEPAY API is responding (may be down during testing)

## Future Enhancements

- [ ] Automatic payment reconciliation
- [ ] Webhook notifications
- [ ] Partial refunds
- [ ] Payment retry logic
- [ ] Recurring payments
- [ ] Admin payment dashboard with real-time updates
- [ ] Email receipts for completed payments
