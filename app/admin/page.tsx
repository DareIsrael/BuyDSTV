'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button';
import { IProduct } from '@/types/product';
import { IPackage } from '@/types/package';
import { IOrder } from '@/types/order';
import { formatPrice } from '@/lib/utils';

type Tab = 'orders' | 'products' | 'packages';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [_products, setProducts] = useState<IProduct[]>([]);
  const [packages, setPackages] = useState<IPackage[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pagination state
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderTotal, setOrderTotal] = useState(0);
  const ORDERS_PER_PAGE = 20;

  // Product form
  const [dstvPrice, setDstvPrice] = useState('');
  const [dstvWithDishPrice, setDstvWithDishPrice] = useState('');
  const [gotvPrice, setGotvPrice] = useState('');

  // Package form
  const [pkgName, setPkgName] = useState('');
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgType, setPkgType] = useState<'dstv' | 'gotv' | 'dstv-with-dish'>('dstv');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    //   callbackUrl=/admin
      return;
    }
    if (status === 'authenticated') {
      const user = session?.user as { role?: string };
      if (user?.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchData();
    }
  }, [status, session, router]);

  const fetchData = async (page: number = 1) => {
    try {
      const [productsRes, packagesRes, ordersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/packages'),
        fetch(`/api/orders?page=${page}&limit=${ORDERS_PER_PAGE}`),
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        if (Array.isArray(productsData)) {
          setProducts(productsData);
          const dstv = productsData.find((p: IProduct) => p.type === 'dstv');
          const dstvWithDish = productsData.find((p: IProduct) => p.type === 'dstv-with-dish');
          const gotv = productsData.find((p: IProduct) => p.type === 'gotv');
          setDstvPrice(dstv?.price ? String(dstv.price / 100) : '0');
          setDstvWithDishPrice(dstvWithDish?.price ? String(dstvWithDish.price / 100) : '0');
          setGotvPrice(gotv?.price ? String(gotv.price / 100) : '0');
        }
      }

      if (packagesRes.ok) {
        const packagesData = await packagesRes.json();
        if (Array.isArray(packagesData)) {
          setPackages(packagesData);
        }
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData && ordersData.orders) {
          // Paginated response from admin API
          setOrders(ordersData.orders);
          setOrderTotal(ordersData.total || 0);
          setOrderTotalPages(ordersData.totalPages || 1);
          setOrderPage(ordersData.page || 1);
        } else if (Array.isArray(ordersData)) {
          // Fallback for non-paginated response
          setOrders(ordersData);
          setOrderTotal(ordersData.length);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateProducts = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dstvPrice: Number(dstvPrice),
          dstvWithDishPrice: Number(dstvWithDishPrice),
          gotvPrice: Number(gotvPrice),
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Prices updated!' });
        fetchData();
      } else {
        setMessage({ type: 'error', text: 'Failed to update prices.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  const addPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName || !pkgPrice) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pkgName,
          price: Number(pkgPrice),
          productType: pkgType,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Package added!' });
        setPkgName('');
        setPkgPrice('');
        fetchData();
      } else {
        setMessage({ type: 'error', text: 'Failed to add package.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePackage = async (id: string) => {
    if (!confirm('Delete this package?')) return;

    try {
      const response = await fetch(`/api/packages?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Package deleted!' });
        fetchData();
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete.' });
    }
  };

  const updateOrderStatus = async (reference: string, orderStatus: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, orderStatus }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Order status updated!' });
        fetchData();
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update order.' });
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-500/10';
      case 'pending': return 'text-yellow-400 bg-yellow-500/10';
      case 'failed': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getOrderColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-400 bg-green-500/10';
      case 'shipped': return 'text-blue-400 bg-blue-500/10';
      case 'processing': return 'text-yellow-400 bg-yellow-500/10';
      case 'cancelled': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleOrderPageChange = (newPage: number) => {
    setOrderPage(newPage);
    fetchData(newPage);
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'orders', label: 'Orders', count: orderTotal },
    { key: 'products', label: 'Products' },
    { key: 'packages', label: 'Packages', count: packages.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold mb-2 text-white"
        >
          Admin Dashboard
        </motion.h1>
        <p className="text-gray-400 mb-8">Manage orders, products, and packages</p>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                : 'bg-red-500/10 border border-red-500/50 text-red-400'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-dark-card rounded-xl p-1 mb-8 border border-gray-800 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-primary to-secondary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                  activeTab === tab.key ? 'bg-white/20' : 'bg-gray-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {orders.length === 0 ? (
              <div className="bg-dark-card rounded-xl p-12 border border-gray-800 text-center">
                <p className="text-gray-400">No orders yet.</p>
              </div>
            ) : (
              orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-dark-card rounded-xl p-6 border border-gray-800"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {order.product} — {order.package}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPaymentColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getOrderColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
                        <p className="text-gray-400">
                          <span className="text-gray-500">Customer:</span> {order.customerName}
                        </p>
                        <p className="text-gray-400">
                          <span className="text-gray-500">Email:</span> {order.email}
                        </p>
                        <p className="text-gray-400">
                          <span className="text-gray-500">Phone:</span> {order.phone}
                        </p>
                        <p className="text-gray-400">
                          <span className="text-gray-500">Address:</span> {order.address}
                        </p>
                        <p className="text-gray-400">
                          <span className="text-gray-500">Ref:</span> {order.reference}
                        </p>
                        <p className="text-gray-400">
                          <span className="text-gray-500">Date:</span>{' '}
                          {new Date(order.createdAt).toLocaleDateString('en-NG', {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold text-primary">{formatPrice(order.totalPrice)}</p>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order.reference, e.target.value)}
                        className="px-3 py-1.5 bg-dark border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-primary"
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {/* Pagination Controls */}
            {orderTotalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6">
                <button
                  onClick={() => handleOrderPageChange(orderPage - 1)}
                  disabled={orderPage <= 1}
                  className="px-4 py-2 bg-dark-card border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Previous
                </button>
                <span className="text-sm text-gray-400">
                  Page {orderPage} of {orderTotalPages} ({orderTotal} orders)
                </span>
                <button
                  onClick={() => handleOrderPageChange(orderPage + 1)}
                  disabled={orderPage >= orderTotalPages}
                  className="px-4 py-2 bg-dark-card border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-lg"
          >
            <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-6 text-white">Update Decoder Prices</h2>
              <form onSubmit={updateProducts} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">DSTV Decoder Only Price (₦)</label>
                  <input
                    type="number"
                    value={dstvPrice}
                    onChange={(e) => setDstvPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl focus:outline-none focus:border-primary text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">DSTV + Dish Price (₦)</label>
                  <input
                    type="number"
                    value={dstvWithDishPrice}
                    onChange={(e) => setDstvWithDishPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl focus:outline-none focus:border-primary text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">GOTV Decoder Price (₦)</label>
                  <input
                    type="number"
                    value={gotvPrice}
                    onChange={(e) => setGotvPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl focus:outline-none focus:border-primary text-white"
                  />
                </div>
                <Button type="submit" isLoading={isLoading} className="w-full">
                  Update Prices
                </Button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="max-w-lg bg-dark-card rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-6 text-white">Add Subscription Package</h2>
              <form onSubmit={addPackage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Package Name</label>
                  <input
                    type="text"
                    value={pkgName}
                    onChange={(e) => setPkgName(e.target.value)}
                    className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl focus:outline-none focus:border-primary text-white"
                    placeholder="e.g., Premium Package"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price (₦)</label>
                  <input
                    type="number"
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl focus:outline-none focus:border-primary text-white"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Type</label>
                  <select
                    value={pkgType}
                    onChange={(e) => setPkgType(e.target.value as 'dstv' | 'gotv' | 'dstv-with-dish')}
                    className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl focus:outline-none focus:border-primary text-white"
                  >
                    <option value="dstv">DSTV only</option>
                    <option value="dstv-with-dish">DSTV + Dish</option>
                    <option value="gotv">GOTV</option>
                  </select>
                </div>
                <Button type="submit" isLoading={isLoading} className="w-full">
                  Add Package
                </Button>
              </form>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 text-white">Existing Packages</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg._id}
                    className="bg-dark-card rounded-xl p-4 border border-gray-800 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-white">{pkg.name}</h3>
                      <p className="text-sm text-gray-400">
                        {formatPrice(pkg.price)} • {pkg.productType.toUpperCase()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePackage(pkg._id)}
                      className="text-red-400 border-red-400/50 hover:bg-red-500/10 hover:text-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                ))}
                {packages.length === 0 && (
                  <p className="text-gray-500 col-span-2 text-center py-8">No packages yet. Add one above.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}