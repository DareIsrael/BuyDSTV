'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button';
import { VideoBackground } from '@/components/VideoBackground';
import { getContinuePaymentPath } from '@/lib/order-payment';

type PayState =
  | { kind: 'loading' }
  | { kind: 'redirecting' }
  | { kind: 'error'; code: string; message: string };

/**
 * Continue Payment page. Target of the "Continue Payment" buttons and of the
 * abandoned-payment reminder email. Resumes payment for the existing order.
 */
export default function ContinuePaymentPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;
  const router = useRouter();
  const { status } = useSession();
  const [state, setState] = useState<PayState>({ kind: 'loading' });
  const startedRef = useRef(false);

  const startPayment = useCallback(async () => {
    if (!orderId) return;
    setState({ kind: 'loading' });
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/retry-payment`, {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.status && data.data?.authorization_url) {
        setState({ kind: 'redirecting' });
        window.location.replace(data.data.authorization_url);
        return;
      }

      setState({
        kind: 'error',
        code: data?.code || (res.status === 429 ? 'rate_limited' : 'error'),
        message: data?.error || 'Unable to start payment. Please try again.',
      });
    } catch {
      setState({
        kind: 'error',
        code: 'network',
        message: 'Network error. Please check your connection and try again.',
      });
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    if (status === 'unauthenticated') {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(getContinuePaymentPath(orderId))}`);
      return;
    }
    // Guard against double invocation (React Strict Mode / re-renders).
    if (status === 'authenticated' && !startedRef.current) {
      startedRef.current = true;
      startPayment();
    }
  }, [status, orderId, router, startPayment]);

  const canRetry = state.kind === 'error' && ['busy', 'error', 'network', 'rate_limited'].includes(state.code);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-24">
      <VideoBackground />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-dark-card/90 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-gray-800/80 max-w-md w-full text-center relative z-10 shadow-2xl"
      >
        {state.kind !== 'error' ? (
          <>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2 text-white">
              {state.kind === 'redirecting' ? 'Redirecting to Payment' : 'Preparing Your Payment'}
            </h1>
            <p className="text-gray-400">
              {state.kind === 'redirecting'
                ? 'Taking you to our secure payment page...'
                : 'Please wait while we retrieve your order...'}
            </p>
          </>
        ) : (
          <>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                state.code === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
              }`}
            >
              {state.code === 'paid' ? (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-bold mb-2 text-white">
              {state.code === 'paid' ? 'Order Already Paid' : 'Unable to Continue Payment'}
            </h1>
            <p className="text-gray-400 mb-8">{state.message}</p>
            <div className="space-y-3">
              {canRetry && (
                <Button onClick={startPayment} className="w-full">
                  Try Again
                </Button>
              )}
              <Button
                variant={canRetry ? 'outline' : 'primary'}
                onClick={() => router.push('/orders')}
                className="w-full"
              >
                View My Orders
              </Button>
              {(state.code === 'expired' || state.code === 'cancelled') && (
                <Button variant="outline" onClick={() => router.push('/')} className="w-full">
                  Place a New Order
                </Button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

