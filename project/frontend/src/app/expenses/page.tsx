"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import {
  LayoutDashboard, Users, Utensils, ShoppingBag, IndianRupee, LogOut,
  ChevronRight, Search, Plus, Edit2, Trash2, ChevronLeft,
  ChevronRight as ChevronRightIcon, Loader2, X, Receipt, Package,
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const EXPENSE_CATEGORIES = [
  { value: 'GROCERIES', label: 'Groceries' }, { value: 'VEGETABLES', label: 'Vegetables' },
  { value: 'RICE', label: 'Rice' }, { value: 'OIL', label: 'Oil' },
  { value: 'MASALA', label: 'Masala' }, { value: 'MILK', label: 'Milk' },
  { value: 'GAS', label: 'Gas' }, { value: 'TRANSPORT', label: 'Transport' },
  { value: 'STAFF_SALARY', label: 'Staff Salary' }, { value: 'COOKING_CHARGES', label: 'Cooking Charges' },
  { value: 'SERVING_STAFF', label: 'Serving Staff' }, { value: 'CLEANING', label: 'Cleaning' },
  { value: 'PAPER_PLATES', label: 'Paper Plates' }, { value: 'BANANA_LEAF', label: 'Banana Leaf' },
  { value: 'WATER_BOTTLE', label: 'Water Bottle' }, { value: 'DECORATION', label: 'Decoration' },
  { value: 'RENTAL', label: 'Rental' }, { value: 'GENERATOR', label: 'Generator' },
  { value: 'ADMIN', label: 'Admin' }, { value: 'MISC', label: 'Miscellaneous' },
];

interface Expense {
  id: string;
  amount: number;
  category: string;
  vendor?: string;
  date: string;
  notes?: string;
  order?: { id: string; orderNumber: string } | null;
}

const ExpensesPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, clearAuth } = useAuthStore();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({ amount: '', category: 'GROCERIES', vendor: '', date: new Date().toISOString().split('T')[0], notes: '', orderId: '' });

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: false },
    { label: 'Customers', href: '/customers', icon: Users, active: false },
    { label: 'Orders', href: '/orders', icon: ShoppingBag, active: false },
    { label: 'Expenses', href: '/expenses', icon: Receipt, active: true },
    { label: 'Inventory', href: '/inventory', icon: Package, active: false },
    { label: 'Billing', href: '/billing', icon: IndianRupee, active: false },
  ];

  const handleLogout = () => { clearAuth(); router.push('/login'); };

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', page, search, category],
    queryFn: async () => {
      const res = await api.get('/expenses', { params: { page, limit: 12, search: search || undefined, category: category || undefined } });
      return res.data;
    },
  });

  const { data: summaryData } = useQuery({
    queryKey: ['expensesSummary'],
    queryFn: async () => {
      const res = await api.get('/expenses/summary');
      return res.data;
    },
  });

  const expenses: Expense[] = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, totalPages: 1 };

  const resetForm = () => { setForm({ amount: '', category: 'GROCERIES', vendor: '', date: new Date().toISOString().split('T')[0], notes: '', orderId: '' }); setFormError(null); };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { amount: parseFloat(form.amount), category: form.category, vendor: form.vendor || undefined, date: form.date, notes: form.notes || undefined, orderId: form.orderId || undefined };
      if (editExpense) {
        await api.patch(`/expenses/${editExpense.id}`, payload);
      } else {
        await api.post('/expenses', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expensesSummary'] });
      setShowForm(false); setEditExpense(null); resetForm();
    },
    onError: (err: unknown) => {
      let msg = 'Failed to save expense';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        const m = err.response.data.message;
        msg = Array.isArray(m) ? m.join(', ') : m;
      }
      setFormError(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/expenses/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); queryClient.invalidateQueries({ queryKey: ['expensesSummary'] }); setDeleteId(null); },
  });

  const openEdit = (e: Expense) => {
    setEditExpense(e);
    setForm({ amount: String(e.amount), category: e.category, vendor: e.vendor || '', date: e.date?.split('T')[0] || new Date().toISOString().split('T')[0], notes: e.notes || '', orderId: e.order?.id || '' });
    setShowForm(true);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" />
      <title>Expenses – SBBMS</title>

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
              <h1 className="text-2xl font-bold text-white">Expenses</h1>
              <p className="text-sm text-slate-400 mt-0.5">Track all catering business expenses</p>
            </div>
            <button onClick={() => { setEditExpense(null); resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Expense
            </button>
          </div>

          {/* Summary Cards */}
          {summaryData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <p className="text-xs text-slate-500 font-semibold">Total Expenses</p>
                <p className="text-2xl font-bold text-rose-400 mt-1">₹{(summaryData.total || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <p className="text-xs text-slate-500 font-semibold">Total Records</p>
                <p className="text-2xl font-bold text-white mt-1">{summaryData.count || 0}</p>
              </div>
              {summaryData.byCategory && Object.entries(summaryData.byCategory as Record<string, number>).slice(0, 2).map(([cat, amt]) => (
                <div key={cat} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <p className="text-xs text-slate-500 font-semibold">{EXPENSE_CATEGORIES.find(c => c.value === cat)?.label || cat}</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">₹{(amt as number).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by vendor or notes..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 sm:w-48"
            >
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-3"><Loader2 className="h-5 w-5 animate-spin text-indigo-400" /><span className="text-sm text-slate-400">Loading...</span></div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-16">
                <Receipt className="h-12 w-12 text-slate-700 mx-auto mb-4 stroke-[1.5]" />
                <p className="text-slate-400 font-semibold">No expenses found</p>
                <button onClick={() => { setEditExpense(null); resetForm(); setShowForm(true); }} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 cursor-pointer">
                  <Plus className="h-4 w-4" /> Add First Expense
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800/60">
                        {['Date', 'Category', 'Vendor', 'Order', 'Amount', 'Notes', ''].map(h => (
                          <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-800/20 transition-colors group">
                          <td className="px-5 py-3.5 text-sm text-slate-300 whitespace-nowrap">{formatDate(exp.date)}</td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5">
                              {EXPENSE_CATEGORIES.find(c => c.value === exp.category)?.label || exp.category}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-white">{exp.vendor || <span className="text-slate-600">–</span>}</td>
                          <td className="px-5 py-3.5 text-sm text-slate-400">
                            {exp.order ? <Link href={`/orders/${exp.order.id}`} className="text-indigo-400 hover:underline font-mono text-xs">{exp.order.orderNumber}</Link> : <span className="text-slate-600">–</span>}
                          </td>
                          <td className="px-5 py-3.5 text-sm font-bold text-rose-400">₹{exp.amount.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3.5 text-xs text-slate-500 max-w-[160px] truncate">{exp.notes || '–'}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEdit(exp)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 cursor-pointer"><Edit2 className="h-4 w-4" /></button>
                              <button onClick={() => setDeleteId(exp.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800/60">
                    <p className="text-xs text-slate-500">Total: {meta.total} expenses</p>
                    <div className="flex items-center gap-2">
                      <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
                      <span className="text-xs text-slate-400 font-semibold">{page}/{meta.totalPages}</span>
                      <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"><ChevronRightIcon className="h-4 w-4" /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white">{editExpense ? 'Edit Expense' : 'Add Expense'}</h3>
              <button onClick={() => { setShowForm(false); setEditExpense(null); resetForm(); }} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            {formError && <p className="text-xs text-rose-400 font-semibold mb-3 p-2 bg-rose-500/10 rounded-lg">{formError}</p>}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Amount (₹) *</label>
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                  {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Vendor (Optional)</label>
                <input type="text" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} placeholder="e.g. Local Market"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Link to Order ID (Optional)</label>
                <input type="text" value={form.orderId} onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))} placeholder="Order UUID"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Notes (Optional)</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional details..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white resize-none focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowForm(false); setEditExpense(null); resetForm(); }} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-semibold cursor-pointer">Cancel</button>
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.amount || !form.date}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                {saveMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Expense'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-white mb-2">Delete Expense?</h3>
            <p className="text-sm text-slate-400 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-semibold cursor-pointer">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                {deleteMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
