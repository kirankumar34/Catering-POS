"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import {
  LayoutDashboard, Users, ShoppingBag, IndianRupee, LogOut,
  ChevronRight, Search, Plus, Loader2, X, Receipt, Package,
  CreditCard, Banknote, Wallet, ChevronLeft,
  ChevronRight as ChevronRightIcon, Calendar,
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const PAYMENT_METHODS = ['UPI', 'CASH', 'BANK', 'CARD'];

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
  order?: { orderNumber: string; customer?: { name: string } };
}

const methodIcon: Record<string, React.ElementType> = {
  UPI: Wallet,
  CASH: Banknote,
  BANK: CreditCard,
  CARD: CreditCard,
};

const PaymentsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, clearAuth } = useAuthStore();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({ orderId: '', amount: '', paymentMethod: 'UPI', transactionId: '', notes: '' });
  const [orderSearch, setOrderSearch] = useState('');

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: false },
    { label: 'Customers', href: '/customers', icon: Users, active: false },
    { label: 'Orders', href: '/orders', icon: ShoppingBag, active: false },
    { label: 'Expenses', href: '/expenses', icon: Receipt, active: false },
    { label: 'Inventory', href: '/inventory', icon: Package, active: false },
    { label: 'Payments', href: '/payments', icon: IndianRupee, active: true },
  ];

  const handleLogout = () => { clearAuth(); router.push('/login'); };

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page, search],
    queryFn: async () => {
      const res = await api.get('/payments', { params: { page, limit: 15, search: search || undefined } });
      return res.data;
    },
  });

  const { data: ordersData } = useQuery({
    queryKey: ['ordersForPayment', orderSearch],
    queryFn: async () => {
      const res = await api.get('/orders', { params: { search: orderSearch || undefined, limit: 8 } });
      return res.data.data;
    },
    enabled: showForm,
  });

  const payments: Payment[] = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, totalPages: 1 };

  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);

  const resetForm = () => { setForm({ orderId: '', amount: '', paymentMethod: 'UPI', transactionId: '', notes: '' }); setFormError(null); setOrderSearch(''); };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        orderId: form.orderId,
        amount: parseFloat(form.amount) || 0,
        paymentMethod: form.paymentMethod,
        transactionId: form.transactionId || undefined,
        notes: form.notes || undefined,
      };
      await api.post('/payments', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setShowForm(false); resetForm();
    },
    onError: (err: unknown) => {
      let msg = 'Failed to record payment';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        const m = err.response.data.message;
        msg = Array.isArray(m) ? m.join(', ') : m;
      }
      setFormError(msg);
    },
  });

  const orders = ordersData || [];
  const selectedOrder = orders.find((o: { id: string }) => o.id === form.orderId);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" />
      <title>Payments – SBBMS</title>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-800/60 bg-slate-900/60 backdrop-blur-xl z-30 flex flex-col">
        <div className="p-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">S</div>
            <div><p className="font-bold text-white text-sm">SBBMS</p><p className="text-[10px] text-slate-400">Seisuvai Catering</p></div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${link.active ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
              <link.icon className="h-4 w-4" />{link.label}
              {link.active && <ChevronRight className="h-3.5 w-3.5 ml-auto text-indigo-400" />}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800/60">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
            <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-white truncate">{user?.username}</p><p className="text-[10px] text-slate-500 truncate">{user?.role}</p></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"><LogOut className="h-4 w-4" />Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="pl-64">
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Payments</h1>
              <p className="text-sm text-slate-400 mt-0.5">Record and track all order payments</p>
            </div>
            <button onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Record Payment
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xs text-slate-500 font-semibold">Total Payments (this page)</p>
              <p className="text-2xl font-bold text-white mt-1">{meta.total}</p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-xs text-emerald-500 font-semibold">Page Total Received</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">₹{totalReceived.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by order number, customer..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-3"><Loader2 className="h-5 w-5 animate-spin text-indigo-400" /><span className="text-sm text-slate-400">Loading payments...</span></div>
            ) : payments.length === 0 ? (
              <div className="text-center py-16">
                <IndianRupee className="h-12 w-12 text-slate-700 mx-auto mb-4 stroke-[1.5]" />
                <p className="text-slate-400 font-semibold">No payments recorded yet</p>
                <button onClick={() => { resetForm(); setShowForm(true); }} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 cursor-pointer">
                  <Plus className="h-4 w-4" /> Record First Payment
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800/60">
                        {['Date', 'Order', 'Customer', 'Method', 'Amount', 'Transaction ID', 'Notes'].map(h => (
                          <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {payments.map((payment) => {
                        const MethodIcon = methodIcon[payment.paymentMethod] || CreditCard;
                        return (
                          <tr key={payment.id} className="hover:bg-slate-800/20 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                <span className="text-slate-300">{formatDate(payment.paymentDate)}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <Link href={`/orders/${payment.orderId}`} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                                {payment.order?.orderNumber || payment.orderId.slice(0, 8)}
                              </Link>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-300">
                              {payment.order?.customer?.name || '—'}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-800 rounded-full px-2.5 py-1">
                                <MethodIcon className="h-3 w-3" />{payment.paymentMethod}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-sm font-bold text-emerald-400">₹{payment.amount.toLocaleString('en-IN')}</td>
                            <td className="px-5 py-3.5 text-xs text-slate-500 font-mono">{payment.transactionId || '—'}</td>
                            <td className="px-5 py-3.5 text-xs text-slate-500">{payment.notes || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800/60">
                    <p className="text-xs text-slate-500">Total: {meta.total} payments</p>
                    <div className="flex items-center gap-2">
                      <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
                      <span className="text-xs text-slate-400 font-semibold">{page}/{meta.totalPages}</span>
                      <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"><ChevronRightIcon className="h-4 w-4" /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white">Record Payment</h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            {formError && <p className="text-xs text-rose-400 font-semibold mb-3 p-2 bg-rose-500/10 rounded-lg">{formError}</p>}
            <div className="space-y-4">
              {/* Order Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Order *</label>
                {selectedOrder ? (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-bold text-white">{selectedOrder.orderNumber}</p>
                      <p className="text-xs text-slate-400">{selectedOrder.customer?.name} · Pending: ₹{selectedOrder.pendingAmount?.toLocaleString('en-IN')}</p>
                    </div>
                    <button onClick={() => setForm(f => ({ ...f, orderId: '' }))} className="text-xs text-rose-400 font-semibold cursor-pointer">Change</button>
                  </div>
                ) : (
                  <div>
                    <input type="text" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="Search order by number or customer..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                    {orders.length > 0 && (
                      <div className="mt-1 rounded-xl border border-slate-800 bg-slate-900 max-h-40 overflow-y-auto divide-y divide-slate-800/50">
                        {orders.map((o: { id: string; orderNumber: string; customer?: { name: string }; pendingAmount: number; grandTotal: number }) => (
                          <button key={o.id} onClick={() => { setForm(f => ({ ...f, orderId: o.id })); setOrderSearch(''); }}
                            className="w-full px-3 py-2.5 text-left hover:bg-slate-800/50 cursor-pointer text-sm">
                            <span className="font-semibold text-white">{o.orderNumber}</span>
                            <span className="text-xs text-slate-400 ml-2">{o.customer?.name}</span>
                            <span className="float-right text-xs text-amber-400">Pending: ₹{o.pendingAmount?.toLocaleString('en-IN')}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Amount (₹) *</label>
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="e.g. 10000"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Method</label>
                  <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Transaction ID (Optional)</label>
                <input type="text" value={form.transactionId} onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))} placeholder="e.g. UPI ref number"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Notes (Optional)</label>
                <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any remarks"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowForm(false); resetForm(); }} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-semibold cursor-pointer">Cancel</button>
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.orderId || !form.amount}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                {saveMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
