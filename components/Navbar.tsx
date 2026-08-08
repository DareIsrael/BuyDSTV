'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = session?.user as any;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-gray-800/50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              BuyDSTV
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm">
              Home
            </Link>

            {session && user?.role === 'customer' && (
              <Link href="/orders" className="text-gray-300 hover:text-white transition-colors text-sm">
                My Orders
              </Link>
            )}

            {session && user?.role === 'admin' && (
              <Link href="/admin" className="text-gray-300 hover:text-white transition-colors text-sm">
                Dashboard
              </Link>
            )}

            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  Hi, <span className="text-white font-medium">{user?.name}</span>
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-1.5 text-sm bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4 border-t border-gray-800"
          >
            <div className="flex flex-col gap-3 pt-4">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition-colors text-sm py-2"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>

              {session && user?.role === 'customer' && (
                <Link
                  href="/orders"
                  className="text-gray-300 hover:text-white transition-colors text-sm py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  My Orders
                </Link>
              )}

              {session && user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="text-gray-300 hover:text-white transition-colors text-sm py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}

              {session ? (
                <>
                  <span className="text-sm text-gray-400 py-2">
                    Signed in as <span className="text-white font-medium">{user?.name}</span>
                  </span>
                  <button
                    onClick={() => { signOut({ callbackUrl: '/' }); setMenuOpen(false); }}
                    className="text-left text-red-400 hover:text-red-300 text-sm py-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-300 hover:text-white transition-colors text-sm py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-primary hover:text-secondary transition-colors text-sm py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};
