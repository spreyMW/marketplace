import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader } from 'lucide-react';
import Payment from './Payment';
import { apiClient } from '../services/api';

// Use your Stripe public key directly - LIVE MODE
const STRIPE_PUBLIC_KEY = 'pk_live_51ToDyTFOoAst6skyvp59v0u9bwFxVNMLZrsQXQZt5Qu7tejDdWg8jS6QkWMClT4JQuPVmgcTXIZuCLPwY9gCGyrg00HopP5fha';

let stripePromise;

export default function StripePaymentPage() {
  const location = useLocation();
  const order = location.state?.order;
  
  const [stripe, setStripe] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load Stripe and create payment intent
    async function initialize() {
      try {
        // Load Stripe
        if (!stripePromise) {
          stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
        }
        const stripeInstance = await stripePromise;
        
        if (!stripeInstance) {
          throw new Error('Failed to load Stripe');
        }
        
        setStripe(stripeInstance);

        // Create payment intent
        if (!order) {
          throw new Error('Order information not found');
        }

        const response = await apiClient.post('/payments/process', {
          order_id: order.order_id,
          amount: order.total_amount || order.amount,
          payment_method: 'card',
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to create payment intent');
        }

        setClientSecret(response.client_secret);
        setPaymentIntentId(response.payment_intent_id);

        // Store for verification
        localStorage.setItem('current_payment_intent', response.payment_intent_id);
        localStorage.setItem('current_order_id', order.order_id.toString());

        setLoading(false);
      } catch (err) {
        setError('Failed to initialize payment: ' + err.message);
        console.error('Payment initialization error:', err);
        setLoading(false);
      }
    }

    initialize();
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader className="mx-auto mb-4 text-green-700 animate-spin" size={48} />
          <p className="text-slate-600 text-lg">Preparing payment...</p>
        </div>
      </div>
    );
  }

  if (error || !stripe || !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <p className="text-red-600 font-semibold mb-4">❌ Payment Error</p>
          <p className="text-slate-600 mb-6">{error || 'Failed to initialize payment'}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <Payment />
    </Elements>
  );
}
