"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../../store/authStore';
import api from '../../../../lib/api';
import {
  LayoutDashboard,
  Users,
  Utensils,
  ShoppingBag,
  IndianRupee,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const EditOrderPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user, clearAuth } = useAuthStore();

  const [apiError, setApiError] = useState<string | null>(null);
  const [form, setForm] = useState({
    eventDate: '',
    eventType: '',
    venue: '',
    numberOfPlates: 0,
    pricePerPlate: 0,
    discount: 0,
    gst: 0,
    additionalCost: 0,
    deliveryCharges: 0,
    advancePaid: 0,
    notes: '',
    status: 'PENDING',
  });

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: false },
    { label: 'Customers', href: '/customers', icon: Users, active: false },
    { label: 'Menus', href: '/menus', icon: Utensils, active: false },
    { label: 'Orders', href: '/orders', icon: ShoppingBag, active: true },
    { label: 'Billing', href: '/billing', icon: IndianRupee, active: false },
  ];

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (order) {
      setForm({
        eventDate: order.eventDate?.split('T')[0] || '',
        eventType: order.eventType || '',
        venue: order.venue || '',
        numberOfPlates: order.numberOfPlates || 0,
        pricePerPlate: order.pricePerPlate || 0,
        discount: order.discount || 0,
        gst: order.gst || 0,
        additionalCost: order.additionalCost || 0,
        deliveryCharges: order.deliveryCharges || 0,
        advancePaid: order.advancePaid || 0,
        notes: order.notes || '',
        status: order.status || 'PENDING',
      });
    }
  }, [order]);

  const handleLogout = () => { clearAuth(); router.push('/login'); };

  const handleChange = (key: string, value: string | number) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  // Live calculation preview
  const subtotal = form.numberOfPlates * form.pricePerPlate;
  const discountAmt = (subtotal * form.discount) / 100;
  const afterDiscount = subtotal - discountAmt;
  const gstAmt = (afterDiscount * form.gst) / 100;
  const grandTotal = afterDiscount + gstAmt + form.additionalCost + form.deliveryCharges;
  const pendingAmount = grandTotal - form.advancePaid;

  const updateMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/orders/${id}`, {
        eventDate: form.eventDate,
        eventType: form.eventType || undefined,
        venue: form.venue || undefined,
        numberOfPlates: form.numberOfPlates,
        pricePerPlate: form.pricePerPlate,
        discount: form.discount,
        gst: form.gst,
        additionalCost: form.additionalCost,
        deliveryCharges: form.deliveryCharges,
        advancePaid: form.advancePaid,
        notes: form.notes || undefined,
        status: form.status,
      });
    },
    onSuccess: () => {
      router.push(`/orders/${id}`);
    },
    onError: (err: unknown) => {
      let msg = 'Failed to update order';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        const m = err.response.data.message;
        msg = Array.isArray(m) ? m.join(', ') : m;
      }
      setApiError(msg);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" />
      <title>Edit {order?.orderNumber} – SBBMS</title>

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
        <nav className="flex-1 p-4 space-y-1">
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

      {/* Content */}
      <div className="pl-64">
        <div className="p-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href={`/orders/${id}`} className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Order</h1>
              <p className="text-xs text-slate-400 font-mono">{order?.orderNumber}</p>
            </div>
          </div>

          {apiError && (
            <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400 font-semibold">{apiError}</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-xl space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Event Date *</label>
                  <input type="date" value={form.eventDate}
                    onChange={e => handleChange('eventDate', e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Status</label>
                  <select value={form.status} onChange={e => handleChange('status', e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Event Type</label>
                  <select value={form.eventType} onChange={e => handleChange('eventType', e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                    <option value="">Select type</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Corporate">Corporate</option>
                    <option value="House Warming">House Warming</option>
                    <option value="Pooja">Pooja/Function</option>
                    <option value="Get Together">Get Together</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Venue</label>
                  <input type="text" value={form.venue}
                    onChange={e => handleChange('venue', e.target.value)}
                    placeholder="e.g. Rajaa Mahal, Chennai"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">No. of Plates *</label>
                  <input type="number" min="1" value={form.numberOfPlates || ''}
                    onChange={e => handleChange('numberOfPlates', parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Price Per Plate (₹) *</label>
                  <input type="number" min="0" step="0.01" value={form.pricePerPlate || ''}
                    onChange={e => handleChange('pricePerPlate', parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Discount (%)</label>
                  <input type="number" min="0" max="100" value={form.discount || ''}
                    onChange={e => handleChange('discount', parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">GST (%)</label>
                  <input type="number" min="0" max="100" value={form.gst || ''}
                    onChange={e => handleChange('gst', parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Extra Charges (₹)</label>
                  <input type="number" min="0" value={form.additionalCost || ''}
                    onChange={e => handleChange('additionalCost', parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Delivery Charges (₹)</label>
                  <input type="number" min="0" value={form.deliveryCharges || ''}
                    onChange={e => handleChange('deliveryCharges', parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Advance Paid (₹)</label>
                <input type="number" min="0" value={form.advancePaid || ''}
                  onChange={e => handleChange('advancePaid', parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Notes</label>
                <textarea rows={2} value={form.notes}
                  onChange={e => handleChange('notes', e.target.value)}
                  placeholder="Special instructions..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white resize-none focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Live Preview */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-xl h-fit space-y-3">
              <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Live Bill Preview</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>{form.numberOfPlates} × ₹{form.pricePerPlate}</span>
                  <span className="text-white font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                {form.discount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Discount ({form.discount}%)</span>
                    <span>−₹{discountAmt.toFixed(2)}</span>
                  </div>
                )}
                {form.gst > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>GST ({form.gst}%)</span>
                    <span>+₹{gstAmt.toFixed(2)}</span>
                  </div>
                )}
                {form.additionalCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Additional</span>
                    <span className="text-white font-semibold">+₹{form.additionalCost.toFixed(2)}</span>
                  </div>
                )}
                {form.deliveryCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivery</span>
                    <span className="text-white font-semibold">+₹{form.deliveryCharges.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-slate-700 pt-2.5 flex justify-between font-bold text-base">
                  <span className="text-white">Grand Total</span>
                  <span className="text-indigo-400">₹{grandTotal.toFixed(2)}</span>
                </div>
                {form.advancePaid > 0 && (
                  <>
                    <div className="flex justify-between text-emerald-400">
                      <span>Advance Paid</span>
                      <span>−₹{form.advancePaid.toFixed(2)}</span>
                    </div>
                    <div className={`flex justify-between font-bold border-t border-slate-700 pt-2.5 ${pendingAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      <span>{pendingAmount > 0 ? 'Pending' : '✓ Fully Paid'}</span>
                      <span>₹{pendingAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <Link href={`/orders/${id}`}
              className="flex-1 text-center py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-all cursor-pointer"
            >
              Cancel
            </Link>
            <button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending || !form.eventDate || form.numberOfPlates < 1}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {updateMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4" /> Save Changes</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOrderPage;
