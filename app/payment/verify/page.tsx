'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button';

type VerifyStatus = 'loading' | 'success' | 'failed';

function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference');
  const [status, setStatus] = useState<VerifyStatus>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!reference) return;

    let isSubscribed = true;

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/paystack/verify?reference=${reference}`);
        const data = await response.json();

        if (!isSubscribed) return;

        if (data.status) {
          setStatus('success');
          setMessage('Your payment was successful! Your order is being processed.');
        } else {
          setStatus('failed');
          setMessage(data.error || 'Payment verification failed. Please contact support.');
        }
      } catch {
        if (!isSubscribed) return;
        setStatus('failed');
        setMessage('An error occurred while verifying your payment. Please contact support.');
      }
    };

    verifyPayment();

    return () => {
      isSubscribed = false;
    };
  }, [reference]);

  const activeStatus = !reference ? 'failed' : status;
  const activeMessage = !reference ? 'No payment reference found.' : message;

  return (
    <>
      {activeStatus === 'loading' && (
        <>
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">Verifying Payment</h1>
          <p className="text-gray-400">Please wait while we confirm your payment...</p>
        </>
      )}

      {activeStatus === 'success' && (
        <>
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-500 mb-2">Payment Successful!</h1>
          <p className="text-gray-400 mb-8">{activeMessage}</p>
          <Button onClick={() => router.push('/orders')} className="w-full">
            View My Orders
          </Button>
        </>
      )}

      {activeStatus === 'failed' && (
        <>
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-500 mb-2">Payment Failed</h1>
          <p className="text-gray-400 mb-8">{activeMessage}</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => router.push('/checkout')} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push('/')} className="w-full">
              Back to Home
            </Button>
          </div>
        </>
      )}
    </>
  );
}

export default function PaymentVerifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-dark-card rounded-2xl p-8 md:p-12 border border-gray-800 max-w-md w-full text-center"
      >
        <Suspense fallback={
          <>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">Loading...</h1>
          </>
        }>
          <PaymentVerifyContent />
        </Suspense>
      </motion.div>
    </div>
  );
}

