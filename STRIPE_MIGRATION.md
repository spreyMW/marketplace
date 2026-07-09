# PesePay to Stripe Migration Guide

## Summary of Changes

Your marketplace has been successfully migrated from **PesePay** to **Stripe** payment gateway. This guide explains what has changed and how to configure it.

## What Changed

### Backend Changes

1. **Stripe PHP SDK Installed**
   - Added `stripe/stripe-php` v20.2.1 to `composer.json`
   - Run `composer install` if not already done

2. **New Stripe Service Class**
   - Location: `backend/app/Libraries/StripeService.php`
   - Handles all Stripe API interactions:
     - Creating Payment Intents
     - Retrieving payment status
     - Processing refunds
     - Webhook verification

3. **Updated PaymentController**
   - Location: `backend/app/Controllers/PaymentController.php`
   - Backup of old PesePay version: `PaymentController_PesePay_Backup.php`
   - **Key Endpoints:**
     - `POST /api/payments/process` - Creates a Stripe Payment Intent
     - `POST /api/payments/result` - Handles Stripe webhooks
     - `GET /api/payments/publishable-key` - Returns Stripe public key for frontend
     - `POST /api/payments/verify` - Verifies payment by Stripe Payment Intent ID
     - `POST /api/payments/(:num)/refund` - Processes refunds

4. **Removed PesePay Methods**
   - Deprecated: `makePayment()` (returns 410 Gone)
   - Deprecated: `makePaymentResult()` (returns 410 Gone)
   - Removed PesePay encryption/decryption methods
   - No more PesePay configuration needed

### Frontend Changes

1. **Stripe React Libraries**
   - Installed `@stripe/react-stripe-js` and `@stripe/stripe-js`
   - Provides Payment Element and Stripe hooks

2. **New Payment Components**
   - `frontend/src/pages/StripePaymentPage.jsx` - Stripe provider wrapper
   - Updated `Payment.jsx` - Uses Stripe Payment Element
   - Backup of old PesePay version: `Payment_PesePay_Backup.jsx`

3. **Updated App.jsx**
   - Payment route now uses `StripePaymentPage` (wraps with Stripe provider)
   - Automatically loads publishable key from backend

4. **Updated PaymentSuccess.jsx**
   - Supports both `payment_intent` (Stripe) and `referenceNumber` (PesePay) query params
   - Handles Stripe statuses: `succeeded`, `completed`, `failed`, etc.

### Environment Variables

**Old (PesePay):**
```
PESEPAY_INTEGRATION_KEY=...
PESEPAY_ENCRYPTION_KEY=...
PESEPAY_URL=...
PESEPAY_MAKE_PAYMENT_URL=...
```

**New (Stripe):**
```
STRIPE_PUBLIC_KEY=pk_test_xxx or pk_live_xxx
STRIPE_SECRET_KEY=sk_test_xxx or sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Setup Instructions

### 1. Create Stripe Account

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Sign up or log in to your account
3. Navigate to **Developers → API Keys**

### 2. Get Your Keys

1. **Publishable Key** (starts with `pk_test_` or `pk_live_`)
2. **Secret Key** (starts with `sk_test_` or `sk_live_`)
3. **Webhook Secret** (see Webhook Setup below)

### 3. Update Environment Variables

Edit `backend/.env`:

```bash
# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4. Set Up Webhooks (Important!)

Webhooks are how Stripe notifies your server when payments succeed or fail.

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add an endpoint**
3. Enter your endpoint URL:
   ```
   https://yourdomain.com/api/payments/result
   ```
   *(For testing: use ngrok or a tunneling service)*

4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

5. Click **Add endpoint**
6. Click on the endpoint to view the **Signing secret**
7. Copy the signing secret and add it to `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxx
   ```

### 5. Test Mode vs Live Mode

**Testing:**
- Use test keys: `pk_test_...` and `sk_test_...`
- Use test card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

**Production:**
- Switch to live keys: `pk_live_...` and `sk_live_...`
- Use real credit cards
- Webhooks must be configured with your production domain

## Payment Flow

### New Stripe Flow

```
1. Customer clicks "Proceed to Payment"
   ↓
2. Backend creates Payment Intent → returns client_secret
   ↓
3. Frontend loads Stripe Payment Element with client_secret
   ↓
4. Customer enters card details in Stripe Payment Element
   ↓
5. Frontend calls confirmPayment()
   ↓
6. Stripe processes payment
   ↓
7. Webhook notification → Backend updates payment status
   ↓
8. Redirect to /payment-success with payment_intent ID
   ↓
9. PaymentSuccess page verifies payment status
```

## Database

No changes to database schema needed. The existing `payments` table works with Stripe:
- `reference_number` → Stores Stripe Payment Intent ID
- `gateway_response` → Stores Stripe Payment Intent object (JSON)
- `redirect_url` → Not used with Stripe (null)

## API Changes

### Old Endpoints (PesePay) - DEPRECATED
- `POST /api/payments/make-payment` → Returns 410 Gone
- `POST /api/payments/make-payment-result` → Returns 410 Gone

### New Endpoints (Stripe)
- `POST /api/payments/process` → Create Payment Intent
  ```json
  Request: { "order_id": 1, "amount": 99.99, "payment_method": "card" }
  Response: { "client_secret": "pi_...", "payment_intent_id": "pi_...", "publishable_key": "pk_..." }
  ```

- `GET /api/payments/publishable-key` → Get public key
  ```json
  Response: { "publishable_key": "pk_..." }
  ```

- `POST /api/payments/result` → Webhook handler (no changes needed)

- `POST /api/payments/verify` → Verify by payment intent ID
  ```json
  Request: { "reference_number": "pi_..." }
  Response: { payment record }
  ```

## Refunds

Refunds are now processed directly through Stripe:

```php
POST /api/payments/{id}/refund
Response: { "success": true, "refund_id": "re_...", "status": "succeeded" }
```

## Testing Checklist

- [ ] Update `.env` with Stripe keys
- [ ] Test payment flow in Stripe test mode
- [ ] Configure webhooks and test webhook delivery
- [ ] Verify payment status updates in database
- [ ] Test PaymentSuccess page
- [ ] Test refund process
- [ ] Switch to live keys for production
- [ ] Update production webhook URL

## Troubleshooting

### Payment Element not loading
- Check `STRIPE_PUBLIC_KEY` is correct in `.env`
- Verify `StripePaymentPage.jsx` is fetching publishable key
- Check browser console for errors

### Webhooks not working
- Verify `STRIPE_WEBHOOK_SECRET` is correct in `.env`
- Check webhook endpoint URL is publicly accessible
- Test webhook delivery in Stripe Dashboard
- Check server logs for errors

### Payments not updating status
- Verify webhook is configured and tested
- Check `STRIPE_WEBHOOK_SECRET` matches the signing secret
- Review server logs in `writable/logs/`

## Differences from PesePay

| Feature | PesePay | Stripe |
|---------|---------|--------|
| Payment Methods | Card, EcoCash, Airtel, TNM | Card, Apple Pay, Google Pay, ACH, etc. |
| Redirect | Redirects to PesePay portal | Embedded Payment Element |
| Webhooks | Via callback URL | Webhook signing |
| Encryption | AES-256-CBC | Built-in (Stripe handles) |
| SDK | No official PHP SDK | Official Stripe PHP SDK |
| Testing | Limited test cards | Full test mode with dedicated test cards |

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe PHP SDK](https://github.com/stripe/stripe-php)
- [Stripe React SDK](https://github.com/stripe/react-stripe-js)
- [Payment Element Guide](https://stripe.com/docs/payments/payment-element)
- [Webhook Signing](https://stripe.com/docs/webhooks/signatures)

## Support

If you encounter issues:

1. Check the [Stripe Status Page](https://status.stripe.com)
2. Review server logs: `backend/writable/logs/`
3. Test webhooks in Stripe Dashboard
4. Verify all environment variables are set correctly
