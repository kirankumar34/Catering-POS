"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import {
  LayoutDashboard,
  Users,
  Utensils,
  ShoppingBag,
  LogOut,
  ChevronRight,
  Loader2,
  IndianRupee,
  Edit2,
  ArrowLeft,
  DollarSign,
  Briefcase,
  MapPin,
  FileText,
  CreditCard,
  Notebook
} from 'lucide-react';
import Link from 'next/link';

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

interface PageProps {
  params: Promise<{ id: string }>;
}

const CustomerDetailPage: React.FC<PageProps> = ({ params }) => {
  const router = useRouter();
  const { user, token, clearAuth } = useAuthStore();
  const { id } = React.use(params);
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

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!token) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        <span className="text-sm font-medium tracking-wide">Loading Customer File...</span>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-white gap-4">
        <p className="text-sm text-rose-500 font-semibold">Failed to fetch customer profile records.</p>
        <Link href="/customers" className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-850">
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

  const sidebarLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, active: false },
    { label: "Customers", href: "/customers", icon: Users, active: true },
    { label: "Catering Menus", href: "/menus", icon: Utensils, active: false },
    { label: "Orders", href: "/orders", icon: ShoppingBag, active: false },
    { label: "Expenses", href: "/expenses", icon: IndianRupee, active: false },
  ];

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Left Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 font-outfit text-lg">
            S
          </div>
          <div className="space-y-0.5">
            <h1 className="font-bold text-sm tracking-tight text-white font-outfit uppercase">Seisuvai</h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Catering Billing</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          {sidebarLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <Link
                key={i}
                href={link.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  link.active
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 ${link.active ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                  <span>{link.label}</span>
                </div>
                {!link.active && <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-indigo-400 font-outfit">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="space-y-0.5 overflow-hidden">
              <p className="font-bold text-sm text-white truncate">{user?.username}</p>
              <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 uppercase">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800/30 transition-all duration-200 text-sm font-semibold cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
        {/* Header Navigation */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800/40 pb-5">
          <div className="flex items-center gap-4">
            <Link
              href="/customers"
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-outfit">{customer.name}</h2>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/billing?customerId=${customer.id}`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-sm font-semibold cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>Create Order</span>
            </Link>
            <Link
              href={`/customers/edit/${customer.id}`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </header>

        {/* Customer KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400">Total Bookings</p>
              <p className="text-2xl font-bold text-white font-outfit">{customer.stats.totalOrders}</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
              <Briefcase className="h-5.5 w-5.5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400">Total Spent</p>
              <p className="text-2xl font-bold text-white font-outfit">{formatCurrency(customer.stats.totalSpending)}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
              <DollarSign className="h-5.5 w-5.5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400">Pending Balance</p>
              <p className="text-2xl font-bold text-white font-outfit">{formatCurrency(customer.stats.pendingBalance)}</p>
            </div>
            <div className={`p-3 rounded-xl border ${
              customer.stats.pendingBalance > 0
                ? "bg-amber-500/10 border-amber-500/10 text-amber-400"
                : "bg-slate-800/40 border-slate-800/60 text-slate-500"
            }`}>
              <IndianRupee className="h-5.5 w-5.5" />
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-xl space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-outfit border-b border-slate-800 pb-3 flex items-center gap-2">
            <UserIcon className="h-4.5 w-4.5 text-indigo-400" />
            Customer Contact Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-medium">
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-400">Primary Phone:</span>
              <span className="text-white font-semibold">{customer.phone}</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-400">Alternate Phone:</span>
              <span className="text-white font-semibold">{customer.altPhone || <span className="text-slate-600">None</span>}</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-400">Email Address:</span>
              <span className="text-white font-semibold">{customer.email || <span className="text-slate-600">None</span>}</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-400">GST Registration:</span>
              <span className="text-white font-semibold">{customer.gstNumber || <span className="text-slate-600">None</span>}</span>
            </div>
          </div>

          {customer.notes && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
              <p className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-1.5">
                <Notebook className="h-3.5 w-3.5" />
                Notes & Catering Preferences
              </p>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Transaction and History Tabs */}
        <div className="space-y-4">
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Catering Orders ({customer.orders?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === 'addresses'
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Secondary Addresses ({customer.addresses?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === 'payments'
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Payment History ({allPayments.length})
            </button>
          </div>

          {/* Tab Contents */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                {!customer.orders || customer.orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                    <ShoppingBag className="h-10 w-10 text-slate-700 mb-3 stroke-[1.5]" />
                    <p className="text-sm font-semibold">No catering orders registered</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-850 text-xs font-semibold text-slate-400">
                          <th className="pb-3">Order Number</th>
                          <th className="pb-3">Event Date</th>
                          <th className="pb-3 text-center">Plates</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Grand Total</th>
                          <th className="pb-3 text-right">Pending Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-sm font-medium">
                        {customer.orders.map((ord: OrderHistoryEntry) => (
                          <tr key={ord.id} className="text-slate-300 hover:text-white transition-colors">
                            <td className="py-3.5 font-semibold text-white">{ord.orderNumber}</td>
                            <td className="py-3.5 text-slate-400">{formatDate(ord.eventDate)}</td>
                            <td className="py-3.5 text-center">{ord.numberOfPlates}</td>
                            <td className="py-3.5">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                                ord.status === 'COMPLETED' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                ord.status === 'CONFIRMED' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                                ord.status === 'CANCELLED' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                                "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              }`}>
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-3.5 text-right font-bold text-white">{formatCurrency(ord.grandTotal)}</td>
                            <td className={`py-3.5 text-right font-bold ${ord.pendingAmount > 0 ? "text-amber-400" : "text-slate-500"}`}>
                              {formatCurrency(ord.pendingAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div>
                {!customer.addresses || customer.addresses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                    <MapPin className="h-10 w-10 text-slate-700 mb-3 stroke-[1.5]" />
                    <p className="text-sm font-semibold">No address records logged</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customer.addresses.map((addr: AddressHistoryEntry, index: number) => (
                      <div
                        key={addr.id}
                        className={`rounded-xl border p-4 space-y-2 relative overflow-hidden bg-slate-900/20 ${
                          addr.isDefault
                            ? "border-indigo-500/40 shadow-md shadow-indigo-600/5"
                            : "border-slate-850"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-indigo-400 uppercase">Address #{index + 1}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/10 uppercase">
                              Default Shipping
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed font-semibold">{addr.address}</p>
                        {addr.location && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-655" />
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
              <div>
                {allPayments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                    <CreditCard className="h-10 w-10 text-slate-700 mb-3 stroke-[1.5]" />
                    <p className="text-sm font-semibold">No payment history logged</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-850 text-xs font-semibold text-slate-400">
                          <th className="pb-3">Transaction Date</th>
                          <th className="pb-3">Reference Order</th>
                          <th className="pb-3">Payment Method</th>
                          <th className="pb-3">Transaction Reference</th>
                          <th className="pb-3">Notes</th>
                          <th className="pb-3 text-right">Amount Paid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-sm font-medium">
                        {allPayments.map((pmt: PaymentHistoryEntry) => (
                          <tr key={pmt.id} className="text-slate-300 hover:text-white transition-colors">
                            <td className="py-3.5 text-slate-400">{formatDate(pmt.paymentDate)}</td>
                            <td className="py-3.5 font-semibold text-white">{pmt.orderNumber}</td>
                            <td className="py-3.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase">
                                {pmt.paymentMethod}
                              </span>
                            </td>
                            <td className="py-3.5 text-xs text-slate-400 font-mono">
                              {pmt.transactionId || <span className="text-slate-600">N/A</span>}
                            </td>
                            <td className="py-3.5 text-xs text-slate-400 italic">
                              {pmt.notes || <span className="text-slate-600">No notes</span>}
                            </td>
                            <td className="py-3.5 text-right font-bold text-emerald-400">{formatCurrency(pmt.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// SVG Profile Icon helper
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default CustomerDetailPage;
