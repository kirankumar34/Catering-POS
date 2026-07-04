"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../../../store/authStore';
import api from '../../../../../lib/api';
import {
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
  const { token } = useAuthStore();

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

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data;
    },
    enabled: !!id && !!token,
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

  if (!token) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const fmt = (v: number) => `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-border pb-5">
        <Link href={`/orders/${id}`} className="p-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-h-[44px] flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Edit Order</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{order?.orderNumber}</p>
        </div>
      </div>

      {apiError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive font-semibold">{apiError}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card-base p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Event Date *</label>
              <input type="date" value={form.eventDate}
                onChange={e => handleChange('eventDate', e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Status</label>
              <select value={form.status} onChange={e => handleChange('status', e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
              >
                {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Event Type</label>
              <select value={form.eventType} onChange={e => handleChange('eventType', e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]">
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
              <label className="text-xs font-semibold text-muted-foreground">Venue</label>
              <input type="text" value={form.venue}
                onChange={e => handleChange('venue', e.target.value)}
                placeholder="e.g. Rajaa Mahal, Chennai"
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">No. of Plates *</label>
              <input type="number" min="1" value={form.numberOfPlates || ''}
                onChange={e => handleChange('numberOfPlates', parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Price Per Plate (₹) *</label>
              <input type="number" min="0" step="0.01" value={form.pricePerPlate || ''}
                onChange={e => handleChange('pricePerPlate', parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Discount (%)</label>
              <input type="number" min="0" max="100" value={form.discount || ''}
                onChange={e => handleChange('discount', parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">GST (%)</label>
              <input type="number" min="0" max="100" value={form.gst || ''}
                onChange={e => handleChange('gst', parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Extra (₹)</label>
              <input type="number" min="0" value={form.additionalCost || ''}
                onChange={e => handleChange('additionalCost', parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Delivery (₹)</label>
              <input type="number" min="0" value={form.deliveryCharges || ''}
                onChange={e => handleChange('deliveryCharges', parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Advance Paid (₹)</label>
            <input type="number" min="0" value={form.advancePaid || ''}
              onChange={e => handleChange('advancePaid', parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Notes</label>
            <textarea rows={2} value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="Special instructions..."
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground resize-none focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Live Preview */}
        <div className="rounded-lg border border-border bg-card p-6 h-fit space-y-3">
          <h2 className="text-sm font-bold text-foreground border-b border-border pb-3 uppercase tracking-wider font-display">Live Bill Preview</h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{form.numberOfPlates} × ₹{form.pricePerPlate}</span>
              <span className="text-foreground font-semibold">{fmt(subtotal)}</span>
            </div>
            {form.discount > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Discount ({form.discount}%)</span>
                <span>−{fmt(discountAmt)}</span>
              </div>
            )}
            {form.gst > 0 && (
              <div className="flex justify-between text-primary">
                <span>GST ({form.gst}%)</span>
                <span>+{fmt(gstAmt)}</span>
              </div>
            )}
            {form.additionalCost > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Additional</span>
                <span className="text-foreground font-semibold">+{fmt(form.additionalCost)}</span>
              </div>
            )}
            {form.deliveryCharges > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span className="text-foreground font-semibold">+{fmt(form.deliveryCharges)}</span>
              </div>
            )}
            <div className="border-t border-border pt-2.5 flex justify-between font-bold text-base">
              <span className="text-foreground font-display">Grand Total</span>
              <span className="text-primary font-display">{fmt(grandTotal)}</span>
            </div>
            {form.advancePaid > 0 && (
              <>
                <div className="flex justify-between text-success">
                  <span>Advance Paid</span>
                  <span>−{fmt(form.advancePaid)}</span>
                </div>
                <div className={`flex justify-between font-bold border-t border-border pt-2.5 ${pendingAmount > 0 ? 'text-warning font-display' : 'text-success font-display'}`}>
                  <span>{pendingAmount > 0 ? 'Pending' : '✓ Fully Paid'}</span>
                  <span>{fmt(pendingAmount)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <Link href={`/orders/${id}`}
          className="flex-1 text-center py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary text-sm font-semibold transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
        >
          Cancel
        </Link>
        <button
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending || !form.eventDate || form.numberOfPlates < 1}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer min-h-[44px]"
        >
          {updateMutation.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="h-4 w-4" /> Save Changes</>
          )}
        </button>
      </div>
    </div>
  );
};

export default EditOrderPage;
