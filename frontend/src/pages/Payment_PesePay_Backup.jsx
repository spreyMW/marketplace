import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Loader } from 'lucide-react';
import { apiClient } from '../services/api';
import { useCart } from '../context/CartContext';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch: cartDispatch } = useCart();
  const order = location.state?.order;
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [pesepayLoading, setPesepayLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!order) {
        throw new Error('Order information missing');
      }

      // Handle EcoCash and Innbucks with Make Payment endpoint
      if (['ecocash', 'innbucks'].includes(paymentMethod)) {
        setPesepayLoading(true);

        if (!formData.phoneNumber) {
          throw new Error('Phone number is required');
        }

        const paymentData = {
          order_id: order.order_id,
          payment_method: paymentMethod,
          amount: order.total_amount || order.amount,
          phone_number: formData.phoneNumber,
          email: order.email || '',
        };

        // Call the make-payment endpoint for direct processing
        const paymentResponse = await apiClient.post('/payments/make-payment', paymentData);

        // Check if payment was successful
        if (paymentResponse.status === 'SUCCESS' || paymentResponse.transaction?.transactionStatus === 'SUCCESS') {
          setPaymentRef(paymentResponse.reference_number || paymentResponse.transaction?.referenceNumber);
          setPaymentSuccess(true);
          cartDispatch({ type: 'CLEAR_CART' });
        } else {
          // Payment might still be pending, show success screen
          setPaymentRef(paymentResponse.reference_number || '');
          setPaymentSuccess(true);
          cartDispatch({ type: 'CLEAR_CART' });
        }
      } 
      // Handle PESEPAY, Airtel Money, TNM Mpamba with redirect
      else if (['airtel_money', 'tnm_mpamba', 'pesepay'].includes(paymentMethod)) {
        setPesepayLoading(true);

        const paymentData = {
          order_id: order.order_id,
          payment_method: paymentMethod,
          amount: order.total_amount || order.amount,
        };

        // Call the process endpoint which will return redirect_url
        const paymentResponse = await apiClient.post('/payments/process', paymentData);

        // Store payment info in localStorage for callback verification
        if (paymentResponse.reference_number) {
          localStorage.setItem('current_payment_ref', paymentResponse.reference_number);
          localStorage.setItem('current_order_id', order.order_id.toString());
        }

        // Redirect to PESEPAY payment page
        if (paymentResponse.redirect_url) {
          window.location.href = paymentResponse.redirect_url;
        } else {
          throw new Error('No payment redirect URL received');
        }
      } 
      // Card payment - now routed through PESEPAY
      else {
        setPesepayLoading(true);

        const paymentData = {
          order_id: order.order_id,
          payment_method: paymentMethod,
          amount: order.total_amount || order.amount,
        };

        const paymentResponse = await apiClient.post('/payments/process', paymentData);
        
        // Store payment info in localStorage for callback verification
        if (paymentResponse.reference_number) {
          localStorage.setItem('current_payment_ref', paymentResponse.reference_number);
          localStorage.setItem('current_order_id', order.order_id.toString());
        }
        
        // If a redirect URL is returned, go through PESEPAY
        if (paymentResponse.redirect_url) {
          window.location.href = paymentResponse.redirect_url;
        } else {
          // Fallback - show success (shouldn't happen with PESEPAY)
          cartDispatch({ type: 'CLEAR_CART' });
          setPaymentRef(paymentResponse.transaction_id);
          setPaymentSuccess(true);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setPesepayLoading(false);
    }
  }

  if (pesepayLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader className="mx-auto mb-4 text-green-700 animate-spin" size={48} />
          <p className="text-slate-600 text-lg">Redirecting to payment gateway...</p>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
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

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Select Payment Method</h2>

          <div className="space-y-3 mb-8">
            {[
              { id: 'ecocash', label: 'EcoCash (Direct)', value: 'ecocash' },
              { id: 'innbucks', label: 'Innbucks (Direct)', value: 'innbucks' },
              { id: 'pesepay', label: 'PESEPAY (Recommended)', value: 'pesepay' },
              { id: 'airtel', label: 'Airtel Money', value: 'airtel_money' },
              { id: 'tnm', label: 'TNM Mpamba', value: 'tnm_mpamba' },
              { id: 'card', label: 'Card Payment', value: 'card' },
            ].map(method => (
              <label key={method.id} className="flex items-center p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-green-700 transition">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-4"
                />
                <span className="font-semibold text-slate-900">{method.label}</span>
              </label>
            ))}
          </div>

          {(['ecocash', 'innbucks'].includes(paymentMethod)) && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-slate-700">
                  {paymentMethod === 'ecocash' 
                    ? 'Direct EcoCash payment - enter your phone number to complete the transaction.'
                    : 'Direct Innbucks payment - enter your phone number to complete the transaction.'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder={paymentMethod === 'ecocash' ? '0771234567' : '0771234567'}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  'Complete Payment'
                )}
              </button>
            </form>
          )}

          {(['airtel_money', 'tnm_mpamba', 'pesepay', 'card'].includes(paymentMethod)) && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-slate-700">
                  You will be redirected to {
                    paymentMethod === 'airtel_money' ? 'Airtel Money' :
                    paymentMethod === 'tnm_mpamba' ? 'TNM Mpamba' :
                    paymentMethod === 'card' ? 'PESEPAY' :
                    'PESEPAY'
                  } to complete the payment securely.
                </p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
