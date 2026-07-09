# Stripe Setup Checklist

## Quick Start (5 minutes)

- [ ] Create Stripe account at https://stripe.com
- [ ] Get API keys from Stripe Dashboard
- [ ] Update `.env` file with keys:
  ```bash
  STRIPE_PUBLIC_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...
  ```
- [ ] Test with a card payment
- [ ] Configure webhooks in Stripe Dashboard
- [ ] Add webhook secret to `.env`:
  ```bash
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```

## Stripe Dashboard Navigation

1. **API Keys**: https://dashboard.stripe.com/apikeys
2. **Webhooks**: https://dashboard.stripe.com/webhooks
3. **Test Data**: https://stripe.com/docs/testing

## Test Credit Card Numbers

| Card | Number | Status |
|------|--------|--------|
| Visa | 4242 4242 4242 4242 | Success |
| Visa (decline) | 4000 0000 0000 0002 | Declined |
| Amex | 3782 822463 10005 | Success |

**Expiry**: Any future date  
**CVC**: Any 3 digits

## Test Payment Flow

1. Start development server
2. Go to http://localhost:5174/checkout
3. Complete checkout
4. Go to payment page
5. Use test card number above
6. Complete payment
7. Check PaymentSuccess page

## Webhook Testing

```bash
# Using Stripe CLI (recommended)
stripe login
stripe listen --forward-to localhost:8000/api/payments/result

# In another terminal
stripe trigger payment_intent.succeeded
```

## Environment Variables

```bash
# File: backend/.env

# Test Keys (for development)
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

## Common Issues

**Issue**: "Payment gateway not available"
- [ ] Check STRIPE_PUBLIC_KEY is set
- [ ] Verify StripePaymentPage is fetching key correctly
- [ ] Check browser console for errors

**Issue**: "Payment successful but status not updating"
- [ ] Check STRIPE_WEBHOOK_SECRET is correct
- [ ] Verify webhook endpoint is configured
- [ ] Test webhook in Stripe Dashboard
- [ ] Check server logs

**Issue**: "Payment Element not showing"
- [ ] Verify Stripe packages installed: `npm list @stripe/react-stripe-js`
- [ ] Check console errors
- [ ] Clear browser cache

## Files Changed

### Backend
- `app/Controllers/PaymentController.php` (replaced)
- `app/Libraries/StripeService.php` (new)
- `app/Config/Routes.php` (updated)
- `.env` (updated)

### Frontend
- `src/pages/Payment.jsx` (replaced)
- `src/pages/StripePaymentPage.jsx` (new)
- `src/pages/PaymentSuccess.jsx` (updated)
- `src/App.jsx` (updated)
- `package.json` (updated - Stripe packages added)

### Backups
- `app/Controllers/PaymentController_PesePay_Backup.php`
- `src/pages/Payment_PesePay_Backup.jsx`

## Next Steps

1. ✅ Environment variables configured
2. ✅ Test payment flow works
3. ✅ Webhooks configured and tested
4. ⬜ Deploy to production
5. ⬜ Switch to live keys
6. ⬜ Update webhook endpoint to production URL
7. ⬜ Monitor for issues

## Production Deployment

1. Generate live keys from Stripe
2. Update `.env` on production server
3. Update webhook endpoint URL to production domain
4. Test payment flow on production
5. Monitor payment logs
