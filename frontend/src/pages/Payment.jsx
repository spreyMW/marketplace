import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { CheckCircle2, ArrowLeft, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const stripe = useStripe();
  const elements = useElements();
  const { dispatch: cartDispatch } = useCart();
  const order = location.state?.order;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Confirm payment with Stripe
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
      } else if (result.paymentIntent.status === 'succeeded') {
        setPaymentRef(result.paymentIntent.id);
        setPaymentSuccess(true);
        cartDispatch({ type: 'CLEAR_CART' });
      }
    } catch (err) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <CheckCircle2 className="mx-auto text-green-600 mb-6" size={64} />
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Payment Successful!</h1>
          <p className="text-slate-600 mb-6">Thank you for your order</p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-slate-600 mb-2">Payment Reference</p>
            <p className="text-lg font-semibold text-green-700 break-all">{paymentRef}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-slate-600 mb-2">Order Number</p>
            <p className="text-lg font-semibold text-amber-700">{order?.order_number}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/track-order')}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold transition"
            >
              Track Your Order
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full border-2 border-slate-300 text-slate-900 hover:bg-slate-50 py-3 rounded-lg font-semibold transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wait for Stripe to load
  if (!stripe || !elements) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader className="mx-auto mb-4 text-green-700 animate-spin" size={48} />
          <p className="text-slate-600 text-lg">Loading payment form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/checkout')}
          className="flex items-center text-green-700 hover:text-green-800 font-semibold mb-8"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Checkout
        </button>

        <h1 className="text-4xl font-bold text-slate-900 mb-8">Payment</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Complete Your Payment</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Stripe Payment Element */}
              <div className="stripe-payment-element">
                <PaymentElement
                  options={{
                    layout: 'tabs',
                    defaultValues: {
                      billingDetails: {
                        email: order?.email || '',
                      },
                    },
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !stripe || !elements}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay $${(order?.total_amount || 0).toFixed(2)}`
                )}
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                Your payment information is secure and encrypted.
              </p>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h3>

            <div className="space-y-3 border-b border-slate-200 pb-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Order ID:</span>
                <span className="font-semibold text-slate-900">#{order?.order_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-semibold text-slate-900">${(order?.subtotal || 0).toFixed(2)}</span>
              </div>
              {order?.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax:</span>
                  <span className="font-semibold text-slate-900">${(order?.tax || 0).toFixed(2)}</span>
                </div>
              )}
              {order?.shipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping:</span>
                  <span className="font-semibold text-slate-900">${(order?.shipping || 0).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-lg font-bold text-slate-900">Total:</span>
              <span className="text-lg font-bold text-green-700">${(order?.total_amount || 0).toFixed(2)}</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900">
                ✓ Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
