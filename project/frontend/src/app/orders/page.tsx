"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import {
  LayoutDashboard,
  Users,
  Utensils,
  ShoppingBag,
  IndianRupee,
  LogOut,
  ChevronRight,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Loader2,
  Calendar,
  X,
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface Order {
  id: string;
  orderNumber: string;
  eventDate: string;
  numberOfPlates: number;
  grandTotal: number;
  pendingAmount: number;
  advancePaid: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  customer: { id: string; name: string; phone: string };
  menu?: { id: string; name: string } | null;
  _count: { items: number; payments: number };
}

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const statusConfig: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'Pending', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  CONFIRMED: { label: 'Confirmed', cls: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  COMPLETED: { label: 'Completed', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
};

const OrdersPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, clearAuth } = useAuthStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: false },
    { label: 'Customers', href: '/customers', icon: Users, active: false },
    { label: 'Menus', href: '/menus', icon: Utensils, active: false },
    { label: 'Orders', href: '/orders', icon: ShoppingBag, active: true },
    { label: 'Billing', href: '/billing', icon: IndianRupee, active: false },
  ];

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, search, statusFilter],
    queryFn: async () => {
      const response = await api.get('/orders', {
        params: { page, limit: 12, search: search || undefined, status: statusFilter || undefined },
      });
      return response.data;
    },
  });

  const orders: Order[] = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, totalPages: 1 };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setDeleteId(null);
      setDeleteError(null);
    },
    onError: (err: unknown) => {
      let msg = 'Failed to delete order';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setDeleteError(msg);
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" />
      <title>Orders – SBBMS</title>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-800/60 bg-slate-900/60 backdrop-blur-xl z-30 flex flex-col">
        <div className="p-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">S</div>
            <div>
              <p className="font-bold text-white text-sm">SBBMS</p>
              <p className="text-[10px] text-slate-400">Seisuvai Catering</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${link.active ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
              {link.active && <ChevronRight className="h-3.5 w-3.5 ml-auto text-indigo-400" />}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/60">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.username || 'User'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.role || ''}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Orders</h1>
              <p className="text-sm text-slate-400 mt-0.5">Manage all catering orders and bookings</p>
            </div>
            <Link
              href="/orders/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Order
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {STATUS_OPTIONS.map((s) => {
              const conf = statusConfig[s];
              const count = orders.filter(o => o.status === s).length;
              return (
                <button key={s} onClick={() => { setStatusFilter(statusFilter === s ? '' : s); setPage(1); }}
                  className={`rounded-xl border p-4 text-left transition-all cursor-pointer ${statusFilter === s ? conf.cls + ' shadow-sm' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'}`}
                >
                  <p className="text-xs font-semibold text-slate-400 mb-1">{conf.label}</p>
                  <p className="text-2xl font-bold text-white">{meta.total > 0 ? count : '–'}</p>
                </button>
              );
            })}
          </div>

          {/* Search + Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by order# or customer name..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 sm:w-44"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{statusConfig[s].label}</option>
              ))}
            </select>
          </div>

          {/* Orders Table */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                <span className="text-sm text-slate-400">Loading orders...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="h-12 w-12 text-slate-700 mx-auto mb-4 stroke-[1.5]" />
                <p className="text-slate-400 font-semibold">No orders found</p>
                <p className="text-xs text-slate-600 mt-1">
                  {search || statusFilter ? 'Try adjusting your filters' : 'Create your first catering order'}
                </p>
                {!search && !statusFilter && (
                  <Link href="/orders/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-all cursor-pointer">
                    <Plus className="h-4 w-4" /> New Order
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800/60">
                        <th className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3.5">Order #</th>
                        <th className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3.5">Customer</th>
                        <th className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3.5">Event Date</th>
                        <th className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3.5">Plates</th>
                        <th className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3.5">Grand Total</th>
                        <th className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3.5">Pending</th>
                        <th className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3.5">Status</th>
                        <th className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3.5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {orders.map((order) => {
                        const conf = statusConfig[order.status];
                        return (
                          <tr key={order.id} className="hover:bg-slate-800/20 transition-colors group">
                            <td className="px-5 py-4">
                              <span className="text-sm font-mono font-bold text-indigo-400">{order.orderNumber}</span>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-sm font-semibold text-white">{order.customer.name}</p>
                              <p className="text-xs text-slate-500">{order.customer.phone}</p>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 text-sm text-slate-300">
                                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                {formatDate(order.eventDate)}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-300">{order.numberOfPlates}</td>
                            <td className="px-5 py-4 text-right">
                              <span className="text-sm font-bold text-white">₹{order.grandTotal.toLocaleString('en-IN')}</span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className={`text-sm font-semibold ${order.pendingAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                ₹{order.pendingAmount.toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${conf.cls}`}>
                                {conf.label}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link href={`/orders/${order.id}`}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer"
                                  title="View Order"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                                <Link href={`/orders/${order.id}/edit`}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                                  title="Edit Order"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={() => { setDeleteId(order.id); setDeleteError(null); }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                                  title="Delete Order"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800/60">
                    <p className="text-xs text-slate-500">
                      Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, meta.total)} of {meta.total} orders
                    </p>
                    <div className="flex items-center gap-2">
                      <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                        className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-xs text-slate-400 font-semibold">{page} / {meta.totalPages}</span>
                      <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}
                        className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Delete Order?</h3>
              <button onClick={() => { setDeleteId(null); setDeleteError(null); }} className="text-slate-500 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-1">
              Only PENDING or CANCELLED orders can be deleted. This action cannot be undone.
            </p>
            {deleteError && (
              <p className="text-xs text-rose-400 font-semibold mt-2 p-2 bg-rose-500/10 rounded-lg">{deleteError}</p>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setDeleteId(null); setDeleteError(null); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={deleteMutation.isPending}
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {deleteMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</> : 'Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
