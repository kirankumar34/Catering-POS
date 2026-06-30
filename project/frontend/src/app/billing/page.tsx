"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import {
  LayoutDashboard, Users, ShoppingBag, IndianRupee, LogOut,
  ChevronRight, Search, Plus, Loader2, Receipt, Package,
  BarChart3, Settings, Download, FileText,
} from 'lucide-react';
import Link from 'next/link';

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
  const router = useRouter();
  const { user, token, clearAuth } = useAuthStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState<string | null>(null);

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: false },
    { label: 'Customers', href: '/customers', icon: Users, active: false },
    { label: 'Orders', href: '/orders', icon: ShoppingBag, active: false },
    { label: 'Expenses', href: '/expenses', icon: Receipt, active: false },
    { label: 'Inventory', href: '/inventory', icon: Package, active: false },
    { label: 'Payments', href: '/payments', icon: IndianRupee, active: true },
    { label: 'Reports', href: '/reports', icon: BarChart3, active: false },
    { label: 'Settings', href: '/settings', icon: Settings, active: false },
  ];

  const handleLogout = () => { clearAuth(); router.push('/login'); };

  // Fetch orders that are active/completed for billing logs
  const { data, isLoading } = useQuery({
    queryKey: ['billingOrders', page, search],
    queryFn: async () => {
      const res = await api.get('/orders', { params: { page, limit: 15, search: search || undefined } });
      return res.data;
    },
    enabled: !!token,
  });

  const orders: BillingOrder[] = data?.data || [];

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

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" />
      <title>Billing Logs – SBBMS</title>

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
              <h1 className="text-2xl font-bold text-white">Billing</h1>
              <p className="text-sm text-slate-400 mt-0.5">Generate and download customer invoices and quotations</p>
            </div>
            <Link href="/orders/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Create New Bill
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search bills by order number or customer name..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-3"><Loader2 className="h-5 w-5 animate-spin text-indigo-400" /><span className="text-sm text-slate-400">Loading bills...</span></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <IndianRupee className="h-12 w-12 text-slate-700 mx-auto mb-4 stroke-[1.5]" />
                <p className="text-slate-400 font-semibold">No invoices generated yet</p>
                <Link href="/orders/new" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 cursor-pointer">
                  <Plus className="h-4 w-4" /> Create First Bill
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800/60">
                      {['Order No', 'Invoice No', 'Customer', 'Event Date', 'Grand Total', 'Paid', 'Pending', 'Actions'].map(h => (
                        <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {orders.map((order) => {
                      const invoiceNo = order.bills?.[0]?.invoiceNumber || '–';
                      return (
                        <tr key={order.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-5 py-3.5">
                            <Link href={`/orders/${order.id}`} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-300 font-mono">{invoiceNo}</td>
                          <td className="px-5 py-3.5">
                            <p className="text-sm font-semibold text-white">{order.customer.name}</p>
                            <p className="text-[10px] text-slate-500">{order.customer.phone}</p>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-400">{formatDate(order.eventDate)}</td>
                          <td className="px-5 py-3.5 text-sm font-bold text-white">₹{order.grandTotal.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3.5 text-sm text-emerald-400 font-semibold">₹{order.advancePaid.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3.5 text-sm text-amber-400 font-semibold">₹{order.pendingAmount.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <button onClick={() => downloadPdf(order.id, 'invoice', order.orderNumber)} disabled={downloading !== null}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 border border-amber-500/30 rounded px-2 py-1 hover:bg-amber-500/10 transition-all cursor-pointer disabled:opacity-50"
                              >
                                {downloading === `${order.id}_invoice` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                                Invoice
                              </button>
                              <button onClick={() => downloadPdf(order.id, 'quotation', order.orderNumber)} disabled={downloading !== null}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 border border-indigo-500/30 rounded px-2 py-1 hover:bg-indigo-500/10 transition-all cursor-pointer disabled:opacity-50"
                              >
                                {downloading === `${order.id}_quotation` ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                                Quotation
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
