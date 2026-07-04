"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import {
  Search, Plus, Edit2, Trash2, Loader2, X, Receipt,
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import ResponsiveDataList, { ColumnDef, CardFieldDef } from '../../../components/ui/ResponsiveDataList';

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
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({ amount: '', category: 'GROCERIES', vendor: '', date: new Date().toISOString().split('T')[0], notes: '', orderId: '' });

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

  // Define desktop table columns
  const columns: ColumnDef<Expense>[] = [
    {
      header: 'Date',
      accessor: (exp) => formatDate(exp.date),
      className: 'whitespace-nowrap text-foreground',
    },
    {
      header: 'Category',
      accessor: (exp) => (
        <span className="text-xs font-semibold text-primary bg-primary/8 border border-primary/20 rounded-full px-2.5 py-0.5">
          {EXPENSE_CATEGORIES.find(c => c.value === exp.category)?.label || exp.category}
        </span>
      ),
    },
    {
      header: 'Vendor',
      accessor: (exp) => exp.vendor || <span className="text-muted-foreground">—</span>,
      className: 'text-foreground',
    },
    {
      header: 'Order',
      accessor: (exp) => exp.order ? (
        <Link href={`/orders/${exp.order.id}`} className="text-primary hover:underline font-mono text-xs font-bold">
          {exp.order.orderNumber}
        </Link>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
    },
    {
      header: 'Amount',
      accessor: (exp) => `₹${exp.amount.toLocaleString('en-IN')}`,
      className: 'font-bold text-destructive text-right',
    },
    {
      header: 'Notes',
      accessor: (exp) => exp.notes || <span className="text-muted-foreground">—</span>,
      className: 'text-xs text-muted-foreground max-w-[160px] truncate',
    },
  ];

  // Define mobile card fields
  const cardFields: CardFieldDef<Expense>[] = [
    {
      label: 'Vendor',
      accessor: (exp) => exp.vendor || '—',
    },
    {
      label: 'Order Link',
      accessor: (exp) => exp.order ? exp.order.orderNumber : '—',
    },
    {
      label: 'Amount',
      accessor: (exp) => `₹${exp.amount.toLocaleString('en-IN')}`,
      variant: 'prominent',
    },
    {
      label: 'Notes',
      accessor: (exp) => exp.notes || '—',
    },
  ];

  const rowActions = (exp: Expense) => (
    <div className="flex items-center justify-end gap-1">
      <button onClick={(e) => { e.stopPropagation(); openEdit(exp); }} className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/5 cursor-pointer">
        <Edit2 className="h-4 w-4" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); setDeleteId(exp.id); }} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 cursor-pointer">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Expenses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track all catering business expenses</p>
        </div>
        <button onClick={() => { setEditExpense(null); resetForm(); setShowForm(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-accent text-primary-foreground text-sm font-semibold transition-colors shadow-sm cursor-pointer min-h-[44px]"
        >
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      {summaryData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-base p-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Expenses</p>
            <p className="text-2xl font-bold text-destructive font-display mt-1">₹{(summaryData.total || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="card-base p-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Records</p>
            <p className="text-2xl font-bold text-foreground font-display mt-1">{summaryData.count || 0}</p>
          </div>
          {summaryData.byCategory && Object.entries(summaryData.byCategory as Record<string, number>).slice(0, 2).map(([cat, amt]) => (
            <div key={cat} className="card-base p-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider truncate">{EXPENSE_CATEGORIES.find(c => c.value === cat)?.label || cat}</p>
              <p className="text-2xl font-bold text-primary font-display mt-1">₹{(amt as number).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by vendor or notes..."
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors min-h-[44px]"
          />
        </div>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:w-48 min-h-[44px]"
        >
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Expenses Responsive Data List */}
      <ResponsiveDataList
        data={expenses}
        columns={columns}
        cardTitle={(exp) => EXPENSE_CATEGORIES.find(c => c.value === exp.category)?.label || exp.category}
        cardSubtitle={(exp) => formatDate(exp.date)}
        cardFields={cardFields}
        keyExtractor={(exp) => exp.id}
        actions={rowActions}
        pagination={{
          total: meta.total,
          page: page,
          totalPages: meta.totalPages,
        }}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyIcon={<Receipt className="h-12 w-12 text-muted-foreground/30 stroke-[1.5]" />}
        emptyTitle="No expenses found"
        emptyDescription={search || category ? 'Try adjusting your filter search query.' : 'Add your first catering expense to start tracking records.'}
        emptyAction={
          !search && !category ? (
            <button onClick={() => { setEditExpense(null); resetForm(); setShowForm(true); }} className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent transition-all cursor-pointer">
              <Plus className="h-4 w-4" /> Add Expense
            </button>
          ) : undefined
        }
      />

      {/* Add/Edit Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4">
          <div className="rounded-lg border border-border bg-card p-6 max-w-md w-full shadow-lg relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground font-display">{editExpense ? 'Edit Expense' : 'Add Expense'}</h3>
              <button onClick={() => { setShowForm(false); setEditExpense(null); resetForm(); }} className="text-muted-foreground hover:text-foreground cursor-pointer p-1"><X className="h-5 w-5" /></button>
            </div>
            {formError && <p className="text-xs text-destructive font-semibold mb-3 p-2 bg-destructive/10 rounded-lg">{formError}</p>}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Amount (₹) *</label>
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]">
                  {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Vendor (Optional)</label>
                <input type="text" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} placeholder="e.g. Local Market"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Link to Order ID (Optional)</label>
                <input type="text" value={form.orderId} onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))} placeholder="Order UUID"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Notes (Optional)</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional details..."
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground resize-none focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowForm(false); setEditExpense(null); resetForm(); }} className="flex-1 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer min-h-[44px]">Cancel</button>
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.amount || !form.date}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]">
                {saveMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Expense'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4">
          <div className="rounded-lg border border-border bg-card p-6 max-w-sm w-full shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-foreground font-display mb-2">Delete Expense?</h3>
            <p className="text-sm text-muted-foreground mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer min-h-[44px]">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]">
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
