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
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const product = searchParams.get('product');
  const registerUrl = product
    ? `/auth/register?product=${product}&callbackUrl=${encodeURIComponent(callbackUrl)}`
    : '/auth/register';

  return (
    <div className="bg-dark-card rounded-2xl p-8 border border-gray-800 shadow-2xl">
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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl focus:outline-none focus:border-primary transition-colors text-white placeholder-gray-500"
            placeholder="••••••••"
            required
          />
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

