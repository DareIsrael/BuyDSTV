'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        setShowSuccessModal(true);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    window.location.href = callbackUrl;
  };

  const handleNavigateProduct = (product: string) => {
    window.location.href = `/checkout?product=${product}`;
  };

  const product = searchParams.get('product');
  const registerUrl = product
    ? `/auth/register?product=${product}&callbackUrl=${encodeURIComponent(callbackUrl)}`
    : '/auth/register';

  return (
    <div className="bg-dark-card rounded-2xl p-8 border border-gray-800 shadow-2xl relative">
      {/* Login Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-card rounded-2xl p-8 border border-gray-800 shadow-2xl max-w-md w-full text-center space-y-6 relative"
          >
            {/* Close Modal "X" Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800/80 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto text-green-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Login Successful</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                You have successfully logged in. Select a product below to continue:
              </p>
            </div>

            {/* Product Buttons with front arrow */}
            <div className="space-y-3 pt-1">
              <button
                onClick={() => handleNavigateProduct('dstv')}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-primary/10 via-dark-card to-dark-card hover:from-primary/20 border border-primary/40 hover:border-primary rounded-xl text-white font-medium text-sm transition-all group shadow-md cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-primary shrink-0 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>Buy DSTV Decoder Only</span>
                </span>
              </button>

              <button
                onClick={() => handleNavigateProduct('dstv-with-dish')}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-secondary/10 via-dark-card to-dark-card hover:from-secondary/20 border border-secondary/40 hover:border-secondary rounded-xl text-white font-medium text-sm transition-all group shadow-md cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-secondary shrink-0 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>Buy DSTV+Dish</span>
                </span>
              </button>

              <button
                onClick={() => handleNavigateProduct('gotv')}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-500/10 via-dark-card to-dark-card hover:from-blue-500/20 border border-blue-500/40 hover:border-blue-500 rounded-xl text-white font-medium text-sm transition-all group shadow-md cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-blue-400 shrink-0 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>Buy GOTV+Antenna</span>
                </span>
              </button>

              <button
                onClick={handleCloseModal}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold text-sm rounded-xl transition-all shadow-lg mt-3 cursor-pointer"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Go to Home</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome Back
          </span>
        </h1>
        <p className="text-gray-400">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl focus:outline-none focus:border-primary transition-colors text-white placeholder-gray-500"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:text-secondary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 bg-dark border border-gray-700 rounded-xl focus:outline-none focus:border-primary transition-colors text-white placeholder-gray-500"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/50 rounded-xl p-3"
          >
            <p className="text-red-400 text-sm text-center">{error}</p>
          </motion.div>
        )}

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full py-3"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Don&apos;t have an account?{' '}
          <Link
            href={registerUrl}
            className="text-primary hover:text-secondary transition-colors font-medium"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Suspense fallback={
          <div className="bg-dark-card rounded-2xl p-8 border border-gray-800 shadow-2xl text-center text-gray-400">
            Loading...
          </div>
        }>
          <LoginContent />
        </Suspense>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

