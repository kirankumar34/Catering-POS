"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import {
  Search, Plus, Loader2, X, IndianRupee,
  CreditCard, Banknote, Wallet, Calendar,
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import ResponsiveDataList, { ColumnDef, CardFieldDef } from '../../../components/ui/ResponsiveDataList';

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
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({ orderId: '', amount: '', paymentMethod: 'UPI', transactionId: '', notes: '' });
  const [orderSearch, setOrderSearch] = useState('');

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

  // Define desktop table columns
  const columns: ColumnDef<Payment>[] = [
    {
      header: 'Date',
      accessor: (payment) => (
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{formatDate(payment.paymentDate)}</span>
        </div>
      ),
    },
    {
      header: 'Order',
      accessor: (payment) => (
        <Link href={`/orders/${payment.orderId}`} className="text-sm font-semibold text-primary hover:underline font-mono font-bold">
          {payment.order?.orderNumber || payment.orderId.slice(0, 8)}
        </Link>
      ),
    },
    {
      header: 'Customer',
      accessor: (payment) => payment.order?.customer?.name || <span className="text-muted-foreground">—</span>,
      className: 'text-foreground',
    },
    {
      header: 'Method',
      accessor: (payment) => {
        const MethodIcon = methodIcon[payment.paymentMethod] || CreditCard;
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground bg-secondary border border-border rounded-full px-2.5 py-1">
            <MethodIcon className="h-3 w-3" />{payment.paymentMethod}
          </span>
        );
      },
    },
    {
      header: 'Amount',
      accessor: (payment) => `₹${payment.amount.toLocaleString('en-IN')}`,
      className: 'font-bold text-success text-right',
    },
    {
      header: 'Transaction ID',
      accessor: (payment) => payment.transactionId || <span className="text-muted-foreground">—</span>,
      className: 'font-mono text-xs text-muted-foreground',
    },
    {
      header: 'Notes',
      accessor: (payment) => payment.notes || <span className="text-muted-foreground">—</span>,
      className: 'text-xs text-muted-foreground',
    },
  ];

  // Define mobile card fields
  const cardFields: CardFieldDef<Payment>[] = [
    {
      label: 'Order',
      accessor: (payment) => payment.order?.orderNumber || payment.orderId.slice(0, 8),
    },
    {
      label: 'Method',
      accessor: (payment) => payment.paymentMethod,
    },
    {
      label: 'Amount',
      accessor: (payment) => `₹${payment.amount.toLocaleString('en-IN')}`,
      variant: 'prominent',
    },
    {
      label: 'Txn ID',
      accessor: (payment) => payment.transactionId || '—',
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Payments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Record and track all order payments</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-accent text-primary-foreground text-sm font-semibold transition-colors shadow-sm cursor-pointer min-h-[44px]"
        >
          <Plus className="h-4 w-4" /> Record Payment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-base p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Payments (this page)</p>
          <p className="text-2xl font-bold text-foreground font-display mt-1">{meta.total}</p>
        </div>
        <div className="card-base p-4 border-success-foreground/20 bg-success/8 text-success">
          <p className="text-xs font-semibold uppercase tracking-wider">Page Total Received</p>
          <p className="text-2xl font-bold font-display mt-1">₹{totalReceived.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by order number, customer..."
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors min-h-[44px]"
        />
      </div>

      {/* Payments Responsive Data List */}
      <ResponsiveDataList
        data={payments}
        columns={columns}
        cardTitle={(payment) => payment.order?.customer?.name || 'Walk-in Customer'}
        cardSubtitle={(payment) => formatDate(payment.paymentDate)}
        cardFields={cardFields}
        keyExtractor={(payment) => payment.id}
        pagination={{
          total: meta.total,
          page: page,
          totalPages: meta.totalPages,
        }}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyIcon={<IndianRupee className="h-12 w-12 text-muted-foreground/30 stroke-[1.5]" />}
        emptyTitle="No payments recorded yet"
        emptyDescription={search ? 'No payments found matching your search term. Try adjusting your query.' : 'Record your first catering payment to track customer transactions.'}
        emptyAction={
          !search ? (
            <button onClick={() => { resetForm(); setShowForm(true); }} className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent transition-all cursor-pointer">
              <Plus className="h-4 w-4" /> Record Payment
            </button>
          ) : undefined
        }
      />

      {/* Record Payment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4">
          <div className="rounded-lg border border-border bg-card p-6 max-w-md w-full shadow-lg relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground font-display">Record Payment</h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-muted-foreground hover:text-foreground cursor-pointer p-1"><X className="h-5 w-5" /></button>
            </div>
            {formError && <p className="text-xs text-destructive font-semibold mb-3 p-2 bg-destructive/10 rounded-lg">{formError}</p>}
            <div className="space-y-4">
              {/* Order Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Order *</label>
                {selectedOrder ? (
                  <div className="flex items-center justify-between rounded-lg border border-success-foreground/20 bg-success/8 p-3">
                    <div>
                      <p className="text-sm font-bold text-success font-mono">{selectedOrder.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{selectedOrder.customer?.name} — Pending: ₹{selectedOrder.pendingAmount?.toLocaleString('en-IN')}</p>
                    </div>
                    <button onClick={() => setForm(f => ({ ...f, orderId: '' }))} className="text-xs text-destructive font-semibold cursor-pointer">Change</button>
                  </div>
                ) : (
                  <div>
                    <input type="text" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="Search order by number or customer..."
                      className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]" />
                    {orders.length > 0 && (
                      <div className="mt-1 rounded-lg border border-border bg-card max-h-40 overflow-y-auto divide-y divide-border shadow-md">
                        {orders.map((o: { id: string; orderNumber: string; customer?: { name: string }; pendingAmount: number; grandTotal: number }) => (
                          <button key={o.id} onClick={() => { setForm(f => ({ ...f, orderId: o.id })); setOrderSearch(''); }}
                            className="w-full px-3 py-2.5 text-left hover:bg-secondary/50 cursor-pointer text-sm flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-foreground font-mono">{o.orderNumber}</span>
                              <span className="text-xs text-muted-foreground ml-2">{o.customer?.name}</span>
                            </div>
                            <span className="text-xs text-warning">Pending: ₹{o.pendingAmount?.toLocaleString('en-IN')}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Amount (₹) *</label>
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="e.g. 10000"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Method</label>
                  <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]">
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Transaction ID (Optional)</label>
                <input type="text" value={form.transactionId} onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))} placeholder="e.g. UPI ref number"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Notes (Optional)</label>
                <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any remarks"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowForm(false); resetForm(); }} className="flex-1 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer min-h-[44px]">Cancel</button>
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.orderId || !form.amount}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]">
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
