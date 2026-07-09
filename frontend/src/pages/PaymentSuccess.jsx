import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { apiClient } from '../services/api';
import { useCart } from '../context/CartContext';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dispatch: cartDispatch } = useCart();

  const [status, setStatus] = useState('loading'); // loading, success, failed
  const [paymentData, setPaymentData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const referenceNumber = searchParams.get('payment_intent');
        const redirectStatus = searchParams.get('redirect_status');
        const transactionStatus = searchParams.get('transactionStatus');

        // Get stored payment info from localStorage
        const storedOrderId = localStorage.getItem('current_order_id');
        const storedRefNumber = localStorage.getItem('current_payment_ref') || localStorage.getItem('current_payment_intent');

        // If Stripe redirected with succeeded status, treat as success
        if (redirectStatus === 'succeeded' || transactionStatus === 'SUCCESS') {
          // Clear cart on successful payment
          cartDispatch({ type: 'CLEAR_CART' });
          // Clear the stored payment info from localStorage
          localStorage.removeItem('current_payment_ref');
          localStorage.removeItem('current_order_id');
          localStorage.removeItem('current_payment_intent');
          setStatus('success');
          setPaymentData({ reference_number: referenceNumber, status: 'succeeded' });

          // Fetch order details if we have order_id
          if (storedOrderId) {
            try {
              const orderResponse = await apiClient.get(`/orders/${parseInt(storedOrderId)}`);
              setOrderData(orderResponse);
            } catch (e) {
              console.error('Error fetching order:', e);
            }
          }
          return;
        }

        // If redirect_status is processing, show loading
        if (redirectStatus === 'processing') {
          setStatus('loading');
          return;
        }

        // If we're here without a success redirect, try to verify from backend
        let verifyResponse = null;
        if (storedOrderId) {
          try {
            // Query by order_id to get payment info from database
            verifyResponse = await apiClient.post('/payments/verify-by-order', {
              order_id: parseInt(storedOrderId),
            });
          } catch (e) {
            console.error('Error verifying by order_id:', e);
            // Fall back to reference number verification
          }
        }

        // If order_id lookup failed, use reference number
        if (!verifyResponse && referenceNumber) {
          verifyResponse = await apiClient.post('/payments/verify', {
            reference_number: referenceNumber,
          });
        }

        // If we have verification data, set it
        if (verifyResponse) {
          setPaymentData(verifyResponse);

          // Check if payment is completed
          const isPaymentCompleted = verifyResponse && (verifyResponse.status === 'completed' || verifyResponse.status === 'succeeded');
          
          if (isPaymentCompleted) {
            // Clear cart on successful payment
            cartDispatch({ type: 'CLEAR_CART' });
            localStorage.removeItem('current_payment_ref');
            localStorage.removeItem('current_order_id');
            localStorage.removeItem('current_payment_intent');
            setStatus('success');

            if (verifyResponse.order_id) {
              try {
                const orderResponse = await apiClient.get(`/orders/${verifyResponse.order_id}`);
                setOrderData(orderResponse);
              } catch (e) {
                console.error('Error fetching order:', e);
              }
            }
          } else {
            setStatus('failed');
            setError('Payment was not completed successfully');
          }
        } else {
          setStatus('failed');
          setError('Invalid payment callback - missing reference number');
        }
      } catch (err) {
        setStatus('failed');
        setError(err.message || 'Error verifying payment');
      }
    };

    verifyPayment();
  }, [searchParams, cartDispatch]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader className="mx-auto mb-4 text-green-700 animate-spin" size={48} />
          <p className="text-slate-600 text-lg">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle2 className="mx-auto text-green-600 mb-6" size={64} />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
          <p className="text-slate-600 mb-6">Thank you for your order</p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-slate-600 mb-1">Payment Reference</p>
            <p className="text-lg font-semibold text-green-700 break-all font-mono">{paymentData?.reference_number}</p>
          </div>

          {orderData && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-slate-600 mb-1">Order Number</p>
              <p className="text-lg font-semibold text-amber-700">{orderData.order_number}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-slate-600 mb-1">Amount Paid</p>
            <p className="text-lg font-semibold text-blue-700">${(parseFloat(orderData?.total_amount || paymentData?.amount) || 0).toFixed(2)}</p>
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

          <p className="text-xs text-slate-500 mt-6">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <AlertCircle className="mx-auto text-red-600 mb-6" size={64} />
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Failed</h1>
        <p className="text-slate-600 mb-6">{error || 'Unable to process your payment'}</p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm">
            Please contact our support team if you have been charged for this failed transaction.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/payment', { state: { retry: true } })}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold transition"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full border-2 border-slate-300 text-slate-900 hover:bg-slate-50 py-3 rounded-lg font-semibold transition"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
}
