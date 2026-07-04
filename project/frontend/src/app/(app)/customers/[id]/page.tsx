"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../../store/authStore';
import api from '../../../../lib/api';
import {
  Loader2,
  Edit2,
  ArrowLeft,
  Briefcase,
  MapPin,
  FileText,
  CreditCard,
  Notebook,
  User as UserIcon,
  ShoppingBag,
  IndianRupee,
} from 'lucide-react';
import Link from 'next/link';
import ResponsiveDataList, { ColumnDef, CardFieldDef } from '../../../../components/ui/ResponsiveDataList';

interface AddressHistoryEntry {
  id: string;
  address: string;
  location?: string;
  isDefault: boolean;
}

interface PaymentHistoryEntry {
  id: string;
  paymentDate: string;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
  amount: number;
  orderNumber?: string;
}

interface OrderHistoryEntry {
  id: string;
  orderNumber: string;
  eventDate: string;
  numberOfPlates: number;
  status: string;
  grandTotal: number;
  pendingAmount: number;
  payments?: PaymentHistoryEntry[];
}

const statusConfig: Record<string, string> = {
  COMPLETED: "bg-success/8 border-success/20 text-success",
  CONFIRMED: "bg-primary/8 border-primary/20 text-primary",
  CANCELLED: "bg-destructive/8 border-destructive/20 text-destructive",
  PENDING: "bg-warning/8 border-warning/20 text-warning",
};

const CustomerDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'payments'>('orders');

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  // Query customer detail + history
  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customerDetail', id],
    queryFn: async () => {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    },
    enabled: !!token && !!id,
  });

  if (!token) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm font-medium tracking-wide">Loading Customer File...</span>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground gap-4">
        <p className="text-sm text-destructive font-semibold">Failed to fetch customer profile records.</p>
        <Link href="/customers" className="px-4 py-2 bg-card border border-border text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer">
          Back to Directory
        </Link>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Extract payment history aggregated across all orders
  const allPayments: PaymentHistoryEntry[] = [];
  customer.orders?.forEach((order: OrderHistoryEntry) => {
    if (order.payments) {
      order.payments.forEach((pmt: PaymentHistoryEntry) => {
        allPayments.push({
          ...pmt,
          orderNumber: order.orderNumber,
        });
      });
    }
  });
  // Sort payments by date descending
  allPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  // Define columns for orders
  const orderColumns: ColumnDef<OrderHistoryEntry>[] = [
    {
      header: 'Order Number',
      accessor: (ord) => <span className="font-bold font-mono text-primary">{ord.orderNumber}</span>,
    },
    {
      header: 'Event Date',
      accessor: (ord) => formatDate(ord.eventDate),
      className: 'text-foreground',
    },
    {
      header: 'Plates',
      accessor: 'numberOfPlates',
      className: 'text-center text-foreground',
    },
    {
      header: 'Status',
      accessor: (ord) => (
        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${statusConfig[ord.status] || 'bg-secondary border-border text-muted-foreground'}`}>
          {ord.status}
        </span>
      ),
    },
    {
      header: 'Grand Total',
      accessor: (ord) => formatCurrency(ord.grandTotal),
      className: 'text-right font-bold text-foreground',
    },
    {
      header: 'Pending Balance',
      accessor: (ord) => (
        <span className={ord.pendingAmount > 0 ? "text-warning font-semibold" : "text-success font-semibold"}>
          {formatCurrency(ord.pendingAmount)}
        </span>
      ),
      className: 'text-right',
    },
  ];

  const orderCardFields: CardFieldDef<OrderHistoryEntry>[] = [
    {
      label: 'Event Date',
      accessor: (ord) => formatDate(ord.eventDate),
    },
    {
      label: 'Plates',
      accessor: (ord) => String(ord.numberOfPlates),
    },
    {
      label: 'Grand Total',
      accessor: (ord) => formatCurrency(ord.grandTotal),
      variant: 'prominent',
    },
    {
      label: 'Pending Balance',
      accessor: (ord) => (
        <span className={ord.pendingAmount > 0 ? "text-warning font-semibold" : "text-success font-semibold"}>
          {formatCurrency(ord.pendingAmount)}
        </span>
      ),
    },
  ];

  // Define columns for payments
  const paymentColumns: ColumnDef<PaymentHistoryEntry>[] = [
    {
      header: 'Transaction Date',
      accessor: (pmt) => formatDate(pmt.paymentDate),
      className: 'text-muted-foreground',
    },
    {
      header: 'Reference Order',
      accessor: (pmt) => pmt.orderNumber || '—',
      className: 'font-semibold text-foreground font-mono',
    },
    {
      header: 'Method',
      accessor: (pmt) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/8 border border-success/20 text-success uppercase">
          {pmt.paymentMethod}
        </span>
      ),
    },
    {
      header: 'Transaction Reference',
      accessor: (pmt) => pmt.transactionId || <span className="text-muted-foreground">—</span>,
      className: 'font-mono text-xs text-muted-foreground',
    },
    {
      header: 'Notes',
      accessor: (pmt) => pmt.notes || <span className="text-muted-foreground">—</span>,
      className: 'text-xs text-muted-foreground italic',
    },
    {
      header: 'Amount Paid',
      accessor: (pmt) => formatCurrency(pmt.amount),
      className: 'text-right font-bold text-success',
    },
  ];

  const paymentCardFields: CardFieldDef<PaymentHistoryEntry>[] = [
    {
      label: 'Reference Order',
      accessor: (pmt) => pmt.orderNumber || '—',
    },
    {
      label: 'Method',
      accessor: (pmt) => pmt.paymentMethod,
    },
    {
      label: 'Txn Ref',
      accessor: (pmt) => pmt.transactionId || '—',
    },
    {
      label: 'Amount Paid',
      accessor: (pmt) => formatCurrency(pmt.amount),
      variant: 'prominent',
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Navigation */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/customers"
            className="p-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-display">{customer.name}</h2>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/orders/new?customerId=${customer.id}`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-sm font-semibold cursor-pointer min-h-[44px]"
          >
            <FileText className="h-4 w-4" />
            <span>Create Order</span>
          </Link>
          <Link
            href={`/customers/edit/${customer.id}`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-accent text-primary-foreground font-semibold text-sm transition-colors shadow-sm cursor-pointer min-h-[44px]"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </header>

      {/* Customer KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-base p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Bookings</p>
            <p className="text-2xl font-bold text-foreground font-display">{customer.stats.totalOrders}</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/8 text-primary border border-primary/20">
            <Briefcase className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="card-base p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Spent</p>
            <p className="text-2xl font-bold text-success font-display">{formatCurrency(customer.stats.totalSpending)}</p>
          </div>
          <div className="p-3 rounded-lg bg-success/8 text-success border border-success/20">
            <IndianRupee className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="card-base p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Balance</p>
            <p className="text-2xl font-bold text-foreground font-display">{formatCurrency(customer.stats.pendingBalance)}</p>
          </div>
          <div className={`p-3 rounded-lg border ${
            customer.stats.pendingBalance > 0
              ? "bg-warning/8 border-warning/20 text-warning"
              : "bg-secondary border-border text-muted-foreground"
          }`}>
            <IndianRupee className="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="card-base p-6 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-display border-b border-border pb-3 flex items-center gap-2">
          <UserIcon className="h-4.5 w-4.5 text-primary" />
          Customer Contact Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-medium">
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">Primary Phone:</span>
            <span className="text-foreground font-semibold">{customer.phone}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">Alternate Phone:</span>
            <span className="text-foreground font-semibold">{customer.altPhone || <span className="text-muted-foreground/60">—</span>}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">Email Address:</span>
            <span className="text-foreground font-semibold">{customer.email || <span className="text-muted-foreground/60">—</span>}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">GST Registration:</span>
            <span className="text-foreground font-semibold">{customer.gstNumber || <span className="text-muted-foreground/60">—</span>}</span>
          </div>
        </div>

        {customer.notes && (
          <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-2">
            <p className="text-xs font-bold text-primary uppercase flex items-center gap-1.5 font-display">
              <Notebook className="h-3.5 w-3.5" />
              Notes & Preferences
            </p>
            <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">{customer.notes}</p>
          </div>
        )}
      </div>

      {/* Transaction and History Tabs */}
      <div className="space-y-4">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer min-h-[44px] ${
              activeTab === 'orders'
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Catering Orders ({customer.orders?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer min-h-[44px] ${
              activeTab === 'addresses'
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Secondary Addresses ({customer.addresses?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer min-h-[44px] ${
              activeTab === 'payments'
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Payment History ({allPayments.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div>
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <ResponsiveDataList
              data={customer.orders || []}
              columns={orderColumns}
              cardTitle={(ord) => ord.orderNumber}
              cardSubtitle={(ord) => formatDate(ord.eventDate)}
              cardBadge={(ord) => (
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase ${statusConfig[ord.status] || 'bg-secondary border-border text-muted-foreground'}`}>
                  {ord.status}
                </span>
              )}
              cardFields={orderCardFields}
              keyExtractor={(ord) => ord.id}
              onRowClick={(ord) => router.push(`/orders/${ord.id}`)}
              isLoading={false}
              emptyIcon={<ShoppingBag className="h-10 w-10 text-muted-foreground/30 mb-3 stroke-[1.5]" />}
              emptyTitle="No catering orders registered"
            />
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div>
              {!customer.addresses || customer.addresses.length === 0 ? (
                <div className="card-base p-8 flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <MapPin className="h-10 w-10 text-muted-foreground/30 mb-3 stroke-[1.5]" />
                  <p className="text-sm font-semibold">No address records logged</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.addresses.map((addr: AddressHistoryEntry, index: number) => (
                    <div
                      key={addr.id}
                      className={`card-base p-4 space-y-2 relative overflow-hidden bg-card ${
                        addr.isDefault
                          ? "border-primary/40 shadow-sm"
                          : "border-border"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-primary uppercase">Address #{index + 1}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
                            Default Shipping
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed font-semibold">{addr.address}</p>
                      {addr.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          GPS Coords: {addr.location}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <ResponsiveDataList
              data={allPayments}
              columns={paymentColumns}
              cardTitle={(pmt) => pmt.orderNumber || '—'}
              cardSubtitle={(pmt) => formatDate(pmt.paymentDate)}
              cardFields={paymentCardFields}
              keyExtractor={(pmt) => pmt.id}
              isLoading={false}
              emptyIcon={<CreditCard className="h-10 w-10 text-muted-foreground/30 mb-3 stroke-[1.5]" />}
              emptyTitle="No payment history logged"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
