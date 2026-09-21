'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { IOrder } from '@/types/order';
import { getVisiblePageNumbers } from '@/lib/pagination';
import Link from 'next/link';

export default function CustomerOrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/orders');
      return;
    }

    if (status === 'authenticated') {
      fetchOrders(1);
    }
  }, [status, router]);

  const fetchOrders = async (requestedPage: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders?page=${requestedPage}&limit=${ordersPerPage}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setPage(data.page || 1);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-500/10';
      case 'pending': return 'text-yellow-400 bg-yellow-500/10';
      case 'failed': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-400 bg-green-500/10';
      case 'On the way': return 'text-blue-400 bg-blue-500/10';
      case 'processing': return 'text-yellow-400 bg-yellow-500/10';
      case 'cancelled': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="bg-dark-card rounded-2xl p-12 border border-gray-800 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No orders yet</h2>
              <p className="text-gray-400 mb-6">Start shopping to see your orders here.</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Browse Decoders
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-dark-card rounded-xl p-6 border border-gray-800"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-white">
                        {order.product} — {order.package}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Ref: {order.reference}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-NG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">{formatPrice(order.totalPrice)}</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getOrderStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
              <button
                type="button"
                onClick={() => fetchOrders(page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 bg-dark-card border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>
              <div className="flex items-center gap-1" aria-label="Order pages">
                {getVisiblePageNumbers(page, totalPages).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => fetchOrders(pageNumber)}
                    aria-current={pageNumber === page ? 'page' : undefined}
                    className={`min-w-9 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      pageNumber === page
                        ? 'bg-primary border-primary text-white'
                        : 'bg-dark-card border-gray-700 text-gray-300 hover:border-primary hover:text-white'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-400">Page {page} of {totalPages} ({total} orders)</span>
              <button
                type="button"
                onClick={() => fetchOrders(page + 1)}
                disabled={page >= totalPages}
                className="px-4 py-2 bg-dark-card border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
