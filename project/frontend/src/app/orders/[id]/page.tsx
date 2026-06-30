"use client";

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import {
  LayoutDashboard,
  Users,
  Utensils,
  ShoppingBag,
  IndianRupee,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Edit2,
  Calendar,
  User,
  Package,
  CreditCard,
  FileText,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Download,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { MENU_CATEGORIES } from '../../menus/components/MenuItemForm';

const statusConfig: Record<string, { label: string; icon: React.ElementType; cls: string; bgCls: string }> = {
  PENDING:   { label: 'Pending',   icon: Clock,         cls: 'text-amber-400',   bgCls: 'bg-amber-500/10 border-amber-500/20' },
  CONFIRMED: { label: 'Confirmed', icon: AlertCircle,   cls: 'text-indigo-400',  bgCls: 'bg-indigo-500/10 border-indigo-500/20' },
  COMPLETED: { label: 'Completed', icon: CheckCircle,   cls: 'text-emerald-400', bgCls: 'bg-emerald-500/10 border-emerald-500/20' },
  CANCELLED: { label: 'Cancelled', icon: XCircle,       cls: 'text-rose-400',    bgCls: 'bg-rose-500/10 border-rose-500/20' },
};

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'COMPLETED'];

const OrderDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const queryClient = useQueryClient();
  const { user, clearAuth } = useAuthStore();
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<'invoice' | 'quotation' | null>(null);

  const downloadPdf = async (type: 'invoice' | 'quotation') => {
    setDownloading(type);
    try {
      const response = await api.get(`/bills/${id}/${type}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${order?.orderNumber || 'Document'}_${type}.pdf`);
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

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: false },
    { label: 'Customers', href: '/customers', icon: Users, active: false },
    { label: 'Menus', href: '/menus', icon: Utensils, active: false },
    { label: 'Orders', href: '/orders', icon: ShoppingBag, active: true },
    { label: 'Billing', href: '/billing', icon: IndianRupee, active: false },
  ];

  const handleLogout = () => { clearAuth(); router.push('/login'); };

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setConfirmStatus(null);
    },
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const formatCurrency = (v: number) => `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl font-bold">Order not found</p>
          <Link href="/orders" className="text-indigo-400 text-sm mt-2 hover:underline">← Back to Orders</Link>
        </div>
      </div>
    );
  }

  const conf = statusConfig[order.status] || statusConfig.PENDING;
  const StatusIcon = conf.icon;
  const currentStatusIdx = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" />
      <title>{order.orderNumber} – SBBMS</title>

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
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="pl-64">
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/orders" className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white font-mono">{order.orderNumber}</h1>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${conf.cls} ${conf.bgCls}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {conf.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Created {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {order.status !== 'CANCELLED' && (
                <Link href={`/orders/${id}/edit`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-all cursor-pointer"
                >
                  <Edit2 className="h-4 w-4" /> Edit
                </Link>
              )}
            </div>
          </div>

          {/* Status Tracker (for non-cancelled orders) */}
          {order.status !== 'CANCELLED' && (
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 mb-6 backdrop-blur-xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Order Progress</p>
              <div className="flex items-center">
                {STATUS_FLOW.map((s, idx) => {
                  const isDone = currentStatusIdx > idx;
                  const isCurrent = currentStatusIdx === idx;
                  const sConf = statusConfig[s];
                  return (
                    <React.Fragment key={s}>
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${isDone ? 'bg-emerald-500 border-emerald-500' : isCurrent ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700'}`}>
                          {isDone ? <CheckCircle className="h-4 w-4 text-white" /> : <span className={`text-xs font-bold ${isCurrent ? 'text-indigo-400' : 'text-slate-500'}`}>{idx + 1}</span>}
                        </div>
                        <span className={`text-[10px] font-semibold ${isCurrent ? sConf.cls : isDone ? 'text-emerald-400' : 'text-slate-600'}`}>{sConf.label}</span>
                      </div>
                      {idx < STATUS_FLOW.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 ${isDone ? 'bg-emerald-500/40' : 'bg-slate-700'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              {/* Status Action Buttons */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {order.status === 'PENDING' && (
                  <button onClick={() => setConfirmStatus('CONFIRMED')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-all cursor-pointer"
                  >
                    Mark as Confirmed
                  </button>
                )}
                {order.status === 'CONFIRMED' && (
                  <button onClick={() => setConfirmStatus('COMPLETED')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-all cursor-pointer"
                  >
                    Mark as Completed
                  </button>
                )}
                {order.status !== 'COMPLETED' && (
                  <button onClick={() => setConfirmStatus('CANCELLED')}
                    className="px-4 py-2 rounded-xl border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/10 transition-all cursor-pointer"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-5">
              {/* Customer Info */}
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <User className="h-3.5 w-3.5" /> Customer
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                    {order.customer.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <Link href={`/customers/${order.customer.id}`} className="text-sm font-bold text-white hover:text-indigo-400 transition-colors">
                      {order.customer.name}
                    </Link>
                    <p className="text-xs text-slate-400">{order.customer.phone}</p>
                    {order.customer.email && <p className="text-xs text-slate-500">{order.customer.email}</p>}
                  </div>
                </div>
              </div>

              {/* Event + Order Info */}
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Calendar className="h-3.5 w-3.5" /> Event Details
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Event Date</p>
                    <p className="font-semibold text-white mt-0.5">{formatDate(order.eventDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Event Type</p>
                    <p className="font-semibold text-white mt-0.5">{order.eventType || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Number of Plates</p>
                    <p className="font-semibold text-white mt-0.5">{order.numberOfPlates}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Price Per Plate</p>
                    <p className="font-semibold text-white mt-0.5">₹{order.pricePerPlate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Menu Package</p>
                    <p className="font-semibold text-white mt-0.5">{order.menu?.name || '(Custom Menu)'}</p>
                  </div>
                  {order.venue && (
                    <div>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> Venue</p>
                      <p className="font-semibold text-white mt-0.5">{order.venue}</p>
                    </div>
                  )}
                  {order.notes && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500">Notes</p>
                      <p className="text-sm text-slate-300 mt-0.5">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items (Custom or Package items) */}
              {order.items && order.items.length > 0 && (
                <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 backdrop-blur-xl">
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Package className="h-3.5 w-3.5" /> Order Items ({order.items.length})
                  </div>
                  <div className="space-y-2">
                    {order.items.map((oi: { id: string; quantity: number; rate: number; item: { name: string; category: string; isVeg: boolean } }) => (
                      <div key={oi.id} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                        <div className="flex items-center gap-2.5">
                          <span className={`h-2 w-2 rounded-full ${oi.item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <div>
                            <p className="text-sm font-semibold text-white">{oi.item.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                              {MENU_CATEGORIES.find(c => c.value === oi.item.category)?.label || oi.item.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <p className="text-slate-400">Qty: {oi.quantity}</p>
                          <p className="text-white font-semibold">₹{oi.rate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payments */}
              {order.payments && order.payments.length > 0 && (
                <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 backdrop-blur-xl">
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <CreditCard className="h-3.5 w-3.5" /> Payment History
                  </div>
                  {order.payments.map((p: { id: string; paymentDate: string; amount: number; paymentMethod: string; transactionId?: string; notes?: string }) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-white">₹{p.amount.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-slate-500">{formatDate(p.paymentDate)} · {p.paymentMethod}</p>
                        {p.transactionId && <p className="text-xs text-slate-600">TxID: {p.transactionId}</p>}
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">Paid</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Bill Summary */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <FileText className="h-3.5 w-3.5" /> Bill Summary
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-white font-semibold">{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-rose-400">Discount ({order.discount}%)</span>
                      <span className="text-rose-400">−{formatCurrency((order.subtotal * order.discount) / 100)}</span>
                    </div>
                  )}
                  {order.gst > 0 && (
                    <div className="flex justify-between">
                      <span className="text-amber-400">GST ({order.gst}%)</span>
                      <span className="text-amber-400">+{formatCurrency(((order.subtotal - (order.subtotal * order.discount / 100)) * order.gst) / 100)}</span>
                    </div>
                  )}
                  {order.additionalCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Additional Costs</span>
                      <span className="text-white font-semibold">+{formatCurrency(order.additionalCost)}</span>
                    </div>
                  )}
                  {order.deliveryCharges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Delivery Charges</span>
                      <span className="text-white font-semibold">+{formatCurrency(order.deliveryCharges)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-700 pt-2.5 flex justify-between font-bold text-base">
                    <span className="text-white">Grand Total</span>
                    <span className="text-indigo-400">{formatCurrency(order.grandTotal)}</span>
                  </div>
                  {order.advancePaid > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Advance Paid</span>
                      <span>−{formatCurrency(order.advancePaid)}</span>
                    </div>
                  )}
                  <div className={`flex justify-between font-bold border-t border-slate-700 pt-2.5 ${order.pendingAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    <span>{order.pendingAmount > 0 ? 'Pending' : '✓ Fully Paid'}</span>
                    <span>{formatCurrency(order.pendingAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 backdrop-blur-xl space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</p>
                <Link href={`/orders/${id}/edit`}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-all cursor-pointer"
                >
                  <Edit2 className="h-4 w-4" /> Edit Order
                </Link>
                <button
                  onClick={() => downloadPdf('invoice')}
                  disabled={downloading !== null}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-amber-600/80 border border-amber-500/30 text-white text-sm font-semibold hover:bg-amber-600 transition-all cursor-pointer disabled:opacity-50"
                >
                  {downloading === 'invoice' ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Download className="h-4 w-4" />}
                  Download Invoice
                </button>
                <button
                  onClick={() => downloadPdf('quotation')}
                  disabled={downloading !== null}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-indigo-500/30 text-indigo-400 text-sm font-semibold hover:bg-indigo-500/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  {downloading === 'quotation' ? <Loader2 className="h-4 w-4 animate-spin text-indigo-400" /> : <FileText className="h-4 w-4" />}
                  Download Quotation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Confirmation Modal */}
      {confirmStatus && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-white mb-2">Confirm Status Change</h3>
            <p className="text-sm text-slate-400 mb-5">
              Change order status to <strong className={statusConfig[confirmStatus]?.cls}>{statusConfig[confirmStatus]?.label}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmStatus(null)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-semibold cursor-pointer">Cancel</button>
              <button
                onClick={() => statusMutation.mutate(confirmStatus)}
                disabled={statusMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {statusMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
