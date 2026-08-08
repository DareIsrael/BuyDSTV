'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to request password reset');
      }

      setMessage({ type: 'success', text: data.message || 'Check your email for a reset link.' });
      setEmail('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark pt-24 pb-12">
      <div className="container mx-auto px-4 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-dark-card rounded-2xl p-8 border border-gray-800"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
            <p className="text-gray-400">Enter your email to receive a password reset link.</p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm ${
                message.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   {/* Fallback Icon if md is missing */}
                   <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-gray-700 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Send Reset Link
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-primary hover:text-primary-light font-medium">
              Back to Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
