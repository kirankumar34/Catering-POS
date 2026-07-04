"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import {
  Search, Plus, Loader2, IndianRupee, Download, FileText,
} from 'lucide-react';
import Link from 'next/link';
import ResponsiveDataList, { ColumnDef, CardFieldDef } from '../../../components/ui/ResponsiveDataList';

interface BillingOrder {
  id: string;
  orderNumber: string;
  eventDate: string;
  numberOfPlates: number;
  pricePerPlate: number;
  grandTotal: number;
  advancePaid: number;
  pendingAmount: number;
  status: string;
  customer: { name: string; phone: string };
  bills: { invoiceNumber: string; billDate: string }[];
}

const BillingPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Fetch orders that are active/completed for billing logs
  const { data, isLoading } = useQuery({
    queryKey: ['billingOrders', page, search],
    queryFn: async () => {
      const res = await api.get('/orders', { params: { page, limit: 15, search: search || undefined } });
      return res.data;
    },
  });

  const orders: BillingOrder[] = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, totalPages: 1 };

  const downloadPdf = async (id: string, type: 'invoice' | 'quotation', orderNum: string) => {
    setDownloading(`${id}_${type}`);
    try {
      const response = await api.get(`/bills/${id}/${type}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${orderNum}_${type}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Define desktop table columns
  const columns: ColumnDef<BillingOrder>[] = [
    {
      header: 'Order No',
      accessor: (order) => (
        <Link href={`/orders/${order.id}`} className="text-sm font-semibold text-primary hover:underline font-mono font-bold">
          {order.orderNumber}
        </Link>
      ),
    },
    {
      header: 'Invoice No',
      accessor: (order) => order.bills?.[0]?.invoiceNumber || <span className="text-muted-foreground">—</span>,
      className: 'text-sm text-foreground font-mono',
    },
    {
      header: 'Customer',
      accessor: (order) => (
        <div>
          <p className="font-semibold text-foreground">{order.customer.name}</p>
          <p className="text-[10px] text-muted-foreground">{order.customer.phone}</p>
        </div>
      ),
    },
    {
      header: 'Event Date',
      accessor: (order) => formatDate(order.eventDate),
      className: 'text-sm text-muted-foreground',
    },
    {
      header: 'Grand Total',
      accessor: (order) => `₹${order.grandTotal.toLocaleString('en-IN')}`,
      className: 'text-sm font-bold text-foreground text-right',
    },
    {
      header: 'Paid',
      accessor: (order) => `₹${order.advancePaid.toLocaleString('en-IN')}`,
      className: 'text-sm text-success font-semibold text-right',
    },
    {
      header: 'Pending',
      accessor: (order) => `₹${order.pendingAmount.toLocaleString('en-IN')}`,
      className: 'text-sm text-warning font-semibold text-right',
    },
  ];

  // Define mobile card fields
  const cardFields: CardFieldDef<BillingOrder>[] = [
    {
      label: 'Grand Total',
      accessor: (order) => `₹${order.grandTotal.toLocaleString('en-IN')}`,
      variant: 'prominent',
    },
    {
      label: 'Paid / Pending',
      accessor: (order) => `₹${order.advancePaid.toLocaleString('en-IN')} / ₹${order.pendingAmount.toLocaleString('en-IN')}`,
    },
    {
      label: 'Event Date',
      accessor: (order) => formatDate(order.eventDate),
    },
  ];

  const rowActions = (order: BillingOrder) => (
    <div className="flex items-center gap-2">
      <button onClick={() => downloadPdf(order.id, 'invoice', order.orderNumber)} disabled={downloading !== null}
        className="inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-primary border border-primary/30 rounded px-2.5 py-1.5 hover:bg-primary/5 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
      >
        {downloading === `${order.id}_invoice` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        Invoice
      </button>
      <button onClick={() => downloadPdf(order.id, 'quotation', order.orderNumber)} disabled={downloading !== null}
        className="inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-accent border border-accent/30 rounded px-2.5 py-1.5 hover:bg-accent/5 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
      >
        {downloading === `${order.id}_quotation` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
        Quotation
      </button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Billing Logs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Generate and download customer invoices and quotations</p>
        </div>
        <Link href="/orders/new"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-accent text-primary-foreground text-sm font-semibold transition-colors shadow-sm cursor-pointer min-h-[44px]"
        >
          <Plus className="h-4 w-4" /> Create New Bill
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search bills by order number or customer name..."
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors min-h-[44px]"
        />
      </div>

      {/* Billing Responsive Data List */}
      <ResponsiveDataList
        data={orders}
        columns={columns}
        cardTitle={(order) => order.customer.name}
        cardSubtitle={(order) => order.orderNumber}
        cardBadge={(order) => (
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold bg-secondary border-border text-foreground font-mono">
            {order.bills?.[0]?.invoiceNumber || 'No Invoice'}
          </span>
        )}
        cardFields={cardFields}
        keyExtractor={(order) => order.id}
        actions={rowActions}
        pagination={{
          total: meta.total,
          page: page,
          totalPages: meta.totalPages,
        }}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyIcon={<IndianRupee className="h-12 w-12 text-muted-foreground/30 stroke-[1.5]" />}
        emptyTitle="No invoices generated yet"
        emptyDescription={search ? 'No orders found matching your search. Try adjusting your query.' : 'Create a catering order first to generate a bill.'}
        emptyAction={
          !search ? (
            <Link href="/orders/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent transition-all cursor-pointer">
              <Plus className="h-4 w-4" /> Create First Bill
            </Link>
          ) : undefined
        }
      />
    </div>
  );
};

export default BillingPage;
