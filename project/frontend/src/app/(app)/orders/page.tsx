"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  Calendar,
  X,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import ResponsiveDataList, { ColumnDef, CardFieldDef } from '../../../components/ui/ResponsiveDataList';

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
  PENDING: { label: 'Pending', cls: 'bg-warning/8 text-warning border-warning/20' },
  CONFIRMED: { label: 'Confirmed', cls: 'bg-primary/8 text-primary border-primary/20' },
  COMPLETED: { label: 'Completed', cls: 'bg-success/8 text-success border-success/20' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-destructive/8 text-destructive border-destructive/20' },
};

const OrdersPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  // Define table columns for desktop
  const columns: ColumnDef<Order>[] = [
    {
      header: 'Order #',
      accessor: (order) => (
        <span className="font-mono font-bold text-primary">{order.orderNumber}</span>
      ),
      className: 'font-semibold',
    },
    {
      header: 'Customer',
      accessor: (order) => (
        <div>
          <p className="font-semibold text-foreground">{order.customer.name}</p>
          <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
        </div>
      ),
    },
    {
      header: 'Event Date',
      accessor: (order) => (
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          {formatDate(order.eventDate)}
        </div>
      ),
    },
    {
      header: 'Plates',
      accessor: 'numberOfPlates',
      className: 'text-center',
    },
    {
      header: 'Grand Total',
      accessor: (order) => `₹${order.grandTotal.toLocaleString('en-IN')}`,
      className: 'text-right font-bold text-foreground',
    },
    {
      header: 'Pending',
      accessor: (order) => (
        <span className={`font-semibold ${order.pendingAmount > 0 ? 'text-warning' : 'text-success'}`}>
          ₹{order.pendingAmount.toLocaleString('en-IN')}
        </span>
      ),
      className: 'text-right',
    },
    {
      header: 'Status',
      accessor: (order) => {
        const conf = statusConfig[order.status];
        return (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${conf.cls}`}>
            {conf.label}
          </span>
        );
      },
    },
  ];

  // Define card fields for mobile view
  const cardFields: CardFieldDef<Order>[] = [
    {
      label: 'Event Date',
      accessor: (order) => formatDate(order.eventDate),
    },
    {
      label: 'Plates',
      accessor: (order) => String(order.numberOfPlates),
    },
    {
      label: 'Grand Total',
      accessor: (order) => `₹${order.grandTotal.toLocaleString('en-IN')}`,
      variant: 'prominent',
    },
    {
      label: 'Pending Balance',
      accessor: (order) => (
        <span className={`font-semibold ${order.pendingAmount > 0 ? 'text-warning' : 'text-success'}`}>
          ₹{order.pendingAmount.toLocaleString('en-IN')}
        </span>
      ),
    },
  ];

  const rowActions = (order: Order) => (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/orders/${order.id}`}
        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
        title="View Order"
      >
        <Eye className="h-4 w-4" />
      </Link>
      <Link href={`/orders/${order.id}/edit`}
        className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors cursor-pointer"
        title="Edit Order"
      >
        <Edit2 className="h-4 w-4" />
      </Link>
      <button
        onClick={(e) => { e.stopPropagation(); setDeleteId(order.id); setDeleteError(null); }}
        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
        title="Delete Order"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage all catering orders and bookings</p>
        </div>
        <Link
          href="/orders/new"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-accent text-primary-foreground text-sm font-semibold transition-colors shadow-sm cursor-pointer min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          New Order
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATUS_OPTIONS.map((s) => {
          const conf = statusConfig[s];
          const count = orders.filter(o => o.status === s).length;
          return (
            <button key={s} onClick={() => { setStatusFilter(statusFilter === s ? '' : s); setPage(1); }}
              className={`rounded-lg border p-4 text-left transition-all cursor-pointer ${statusFilter === s ? conf.cls + ' border-primary/40 bg-card' : 'border-border bg-card hover:border-primary/20'}`}
            >
              <p className="text-xs font-semibold text-muted-foreground mb-1">{conf.label}</p>
              <p className="text-2xl font-bold text-foreground font-display">{meta.total > 0 ? count : '–'}</p>
            </button>
          );
        })}
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by order# or customer name..."
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors min-h-[44px]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:w-44 min-h-[44px]"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{statusConfig[s].label}</option>
          ))}
        </select>
      </div>

      {/* Orders Responsive Data List */}
      <ResponsiveDataList
        data={orders}
        columns={columns}
        cardTitle={(order) => order.customer.name}
        cardSubtitle={(order) => order.orderNumber}
        cardFields={cardFields}
        cardBadge={(order) => {
          const conf = statusConfig[order.status];
          return (
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${conf.cls}`}>
              {conf.label}
            </span>
          );
        }}
        keyExtractor={(order) => order.id}
        onRowClick={(order) => router.push(`/orders/${order.id}`)}
        actions={rowActions}
        pagination={{
          total: meta.total,
          page: page,
          totalPages: meta.totalPages,
        }}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyIcon={<ShoppingBag className="h-12 w-12 text-muted-foreground/30 stroke-[1.5]" />}
        emptyTitle="No orders found"
        emptyDescription={search || statusFilter ? 'Try adjusting your filters or search query' : 'Create your first catering order to get started.'}
        emptyAction={
          !search && !statusFilter ? (
            <Link href="/orders/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent transition-all cursor-pointer">
              <Plus className="h-4 w-4" /> New Order
            </Link>
          ) : undefined
        }
      />

      {/* Delete Confirmation Modal/Sheet */}
      {deleteId && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4">
          <div className="rounded-lg border border-border bg-card p-6 max-w-sm w-full shadow-lg relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground font-display">Delete Order?</h3>
              <button onClick={() => { setDeleteId(null); setDeleteError(null); }} className="text-muted-foreground hover:text-foreground cursor-pointer p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Only PENDING or CANCELLED orders can be deleted. This action cannot be undone.
            </p>
            {deleteError && (
              <p className="text-xs text-destructive font-semibold mt-2 p-2 bg-destructive/10 rounded-lg">{deleteError}</p>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setDeleteId(null); setDeleteError(null); }}
                className="flex-1 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm font-semibold transition-colors cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
              <button
                disabled={deleteMutation.isPending}
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                {deleteMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
