"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../../store/authStore';
import api from '../../../../lib/api';
import QRCode from 'qrcode';
import {
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
  CheckSquare,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { MENU_CATEGORIES } from '../../menus/components/MenuItemForm';

const statusConfig: Record<string, { label: string; icon: React.ElementType; cls: string; bgCls: string }> = {
  PENDING:   { label: 'Pending',   icon: Clock,         cls: 'text-warning',   bgCls: 'bg-warning/8 border-warning/20' },
  CONFIRMED: { label: 'Confirmed', icon: AlertCircle,   cls: 'text-primary',  bgCls: 'bg-primary/8 border-primary/20' },
  COMPLETED: { label: 'Completed', icon: CheckCircle,   cls: 'text-success', bgCls: 'bg-success/8 border-success/20' },
  CANCELLED: { label: 'Cancelled', icon: XCircle,       cls: 'text-destructive',    bgCls: 'bg-destructive/8 border-destructive/20' },
};

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'COMPLETED'];

const OrderDetailPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<'invoice' | 'quotation' | null>(null);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      const obj: Record<string, string> = {};
      res.data.forEach((s: { key: string; value: string }) => {
        obj[s.key] = s.value;
      });
      return obj;
    },
    enabled: !!token,
  });

  const bizUpiId = settingsData?.upiId || 'kiransmart00-2@okicici';
  const bizName = settingsData?.businessName || 'Seisuvai Catering';

  const { data: checklist, refetch: refetchChecklist } = useQuery({
    queryKey: ['orderChecklist', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}/checklist`);
      return res.data as { id: string; label: string; checked: boolean }[];
    },
    enabled: !!id && !!token,
  });

  const { data: templates } = useQuery({
    queryKey: ['checklistTemplates'],
    queryFn: async () => {
      const res = await api.get('/checklist-templates');
      return res.data as { id: string; name: string; items: { id: string; label: string; orderIndex: number }[] }[];
    },
    enabled: !!token,
  });

  const toggleChecklistMutation = useMutation({
    mutationFn: async ({ itemId, checked }: { itemId: string; checked: boolean }) => {
      await api.patch(`/orders/${id}/checklist/${itemId}`, { checked });
    },
    onSuccess: () => {
      refetchChecklist();
    },
  });

  const addChecklistItemMutation = useMutation({
    mutationFn: async (label: string) => {
      await api.post(`/orders/${id}/checklist`, { label });
    },
    onSuccess: () => {
      refetchChecklist();
    },
  });

  const deleteChecklistItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(`/orders/${id}/checklist/${itemId}`);
    },
    onSuccess: () => {
      refetchChecklist();
    },
  });

  const loadTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      await api.post(`/orders/${id}/checklist/from-template/${templateId}`);
    },
    onSuccess: () => {
      refetchChecklist();
    },
  });


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
      const amount = order.pendingAmount > 0 ? order.pendingAmount : order.grandTotal;
      const upiLink = `upi://pay?pa=${bizUpiId}&pn=${encodeURIComponent(bizName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(order.orderNumber)}`;
      QRCode.toDataURL(upiLink, { width: 200, margin: 1 })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Failed to generate QR:', err));
    }
  }, [bizUpiId, bizName, order]);

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

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <div className="text-center space-y-3">
          <p className="text-xl font-bold font-display">Order not found</p>
          <Link href="/orders" className="text-primary text-sm font-semibold hover:underline block">← Back to Orders</Link>
        </div>
      </div>
    );
  }

  const conf = statusConfig[order.status] || statusConfig.PENDING;
  const StatusIcon = conf.icon;
  const currentStatusIdx = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-4">
          <Link href="/orders" className="p-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-h-[44px] flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground font-mono">{order.orderNumber}</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${conf.cls} ${conf.bgCls}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {conf.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Created {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {order.status !== 'CANCELLED' && (
            <Link href={`/orders/${id}/edit`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/50 text-sm font-semibold transition-colors cursor-pointer min-h-[44px]"
            >
              <Edit2 className="h-4 w-4" /> Edit
            </Link>
          )}
        </div>
      </div>

      {/* Status Tracker (for non-cancelled orders) */}
      {order.status !== 'CANCELLED' && (
        <div className="card-base p-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Order Progress</p>
          <div className="flex items-center">
            {STATUS_FLOW.map((s, idx) => {
              const isDone = currentStatusIdx > idx;
              const isCurrent = currentStatusIdx === idx;
              const sConf = statusConfig[s];
              return (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${isDone ? 'bg-success border-success text-success-foreground' : isCurrent ? 'border-primary bg-primary/8 text-primary' : 'border-border'}`}>
                      {isDone ? <CheckCircle className="h-4 w-4" /> : <span className={`text-xs font-bold ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>{idx + 1}</span>}
                    </div>
                    <span className={`text-[10px] font-semibold ${isCurrent ? sConf.cls : isDone ? 'text-success' : 'text-muted-foreground'}`}>{sConf.label}</span>
                  </div>
                  {idx < STATUS_FLOW.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${isDone ? 'bg-success/30' : 'bg-border'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* Status Action Buttons */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {order.status === 'PENDING' && (
              <button onClick={() => setConfirmStatus('CONFIRMED')}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-accent text-primary-foreground text-xs font-semibold transition-colors cursor-pointer min-h-[44px]"
              >
                Mark as Confirmed
              </button>
            )}
            {order.status === 'CONFIRMED' && (
              <button onClick={() => setConfirmStatus('COMPLETED')}
                className="px-4 py-2 rounded-lg bg-success hover:bg-success/90 text-success-foreground text-xs font-semibold transition-colors cursor-pointer min-h-[44px]"
              >
                Mark as Completed
              </button>
            )}
            {order.status !== 'COMPLETED' && (
              <button onClick={() => setConfirmStatus('CANCELLED')}
                className="px-4 py-2 rounded-lg border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/5 transition-colors cursor-pointer min-h-[44px]"
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
          <div className="card-base p-5">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <User className="h-3.5 w-3.5" /> Customer
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {order.customer.name[0]?.toUpperCase()}
              </div>
              <div>
                <Link href={`/customers/${order.customer.id}`} className="text-sm font-bold text-primary hover:underline">
                  {order.customer.name}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">{order.customer.phone}</p>
                {order.customer.email && <p className="text-xs text-muted-foreground">{order.customer.email}</p>}
              </div>
            </div>
          </div>

          {/* Event + Order Info */}
          <div className="card-base p-5">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5" /> Event Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Event Date</p>
                <p className="font-semibold text-foreground mt-0.5">{formatDate(order.eventDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Event Type</p>
                <p className="font-semibold text-foreground mt-0.5">{order.eventType || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Number of Plates</p>
                <p className="font-semibold text-foreground mt-0.5">{order.numberOfPlates}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Price Per Plate</p>
                <p className="font-semibold text-foreground mt-0.5">₹{order.pricePerPlate}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Menu Package</p>
                <p className="font-semibold text-foreground mt-0.5">{order.menu?.name || '(Custom Menu)'}</p>
              </div>
              {order.venue && (
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Venue</p>
                  <p className="font-semibold text-foreground mt-0.5">{order.venue}</p>
                </div>
              )}
              {order.notes && (
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-sm text-foreground/80 mt-0.5 leading-relaxed">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items (Custom or Package items) */}
          {order.items && order.items.length > 0 && (
            <div className="card-base p-5">
              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <Package className="h-3.5 w-3.5" /> Order Items ({order.items.length})
              </div>
              <div className="space-y-2">
                {order.items.map((oi: { id: string; quantity: number; rate: number; item: { name: string; category: string; isVeg: boolean } }) => (
                  <div key={oi.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${oi.item.isVeg ? 'bg-success' : 'bg-destructive'}`} />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{oi.item.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                          {MENU_CATEGORIES.find(c => c.value === oi.item.category)?.label || oi.item.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-muted-foreground">Qty: {oi.quantity}</p>
                      <p className="text-foreground font-semibold">₹{oi.rate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments */}
          {order.payments && order.payments.length > 0 && (
            <div className="card-base p-5">
              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <CreditCard className="h-3.5 w-3.5" /> Payment History
              </div>
              {order.payments.map((p: { id: string; paymentDate: string; amount: number; paymentMethod: string; transactionId?: string; notes?: string }) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-bold text-foreground">₹{p.amount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(p.paymentDate)} · {p.paymentMethod}</p>
                    {p.transactionId && <p className="text-[10px] text-muted-foreground font-mono mt-0.5">TxID: {p.transactionId}</p>}
                  </div>
                  <span className="text-xs font-semibold text-success bg-success/8 border border-success/20 rounded-full px-2.5 py-0.5">Paid</span>
                </div>
              ))}
            </div>
          )}

          {/* Event Preparation Checklist */}
          <div className="card-base p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5 text-primary" /> Event Preparation Checklist
              </p>
              
              {templates && templates.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground focus:outline-none focus:border-primary min-h-[32px] cursor-pointer"
                  >
                    <option value="">Load Template...</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (selectedTemplateId) {
                        loadTemplateMutation.mutate(selectedTemplateId);
                        setSelectedTemplateId('');
                      }
                    }}
                    disabled={!selectedTemplateId || loadTemplateMutation.isPending}
                    className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-accent disabled:opacity-50 transition-colors cursor-pointer min-h-[32px] flex items-center justify-center gap-1"
                  >
                    {loadTemplateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Load'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {checklist && checklist.length > 0 ? (
                checklist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 group border-b border-border/40 last:border-0">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => toggleChecklistMutation.mutate({ itemId: item.id, checked: e.target.checked })}
                        className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary focus:ring-offset-background cursor-pointer"
                      />
                      <span className={`text-xs transition-colors duration-100 ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground font-semibold'}`}>
                        {item.label}
                      </span>
                    </label>
                    <button
                      onClick={() => deleteChecklistItemMutation.mutate(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded transition-all cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
                      title="Delete task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No checklist items yet. Add custom tasks or load a template above.</p>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newChecklistItem.trim()) {
                  addChecklistItemMutation.mutate(newChecklistItem.trim());
                  setNewChecklistItem('');
                }
              }}
              className="flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="Add custom task..."
                className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary min-h-[36px]"
              />
              <button
                type="submit"
                disabled={addChecklistItemMutation.isPending || !newChecklistItem.trim()}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-accent disabled:opacity-50 transition-colors cursor-pointer min-h-[36px]"
              >
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Bill Summary */}
        <div className="space-y-5">
          <div className="card-base p-5">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <FileText className="h-3.5 w-3.5" /> Bill Summary
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-semibold">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Discount ({order.discount}%)</span>
                  <span>−{formatCurrency((order.subtotal * order.discount) / 100)}</span>
                </div>
              )}
              {order.gst > 0 && (
                <div className="flex justify-between text-primary">
                  <span>GST ({order.gst}%)</span>
                  <span>+{formatCurrency(((order.subtotal - (order.subtotal * order.discount / 100)) * order.gst) / 100)}</span>
                </div>
              )}
              {order.additionalCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Additional Costs</span>
                  <span className="text-foreground font-semibold">+{formatCurrency(order.additionalCost)}</span>
                </div>
              )}
              {order.deliveryCharges > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Charges</span>
                  <span className="text-foreground font-semibold">+{formatCurrency(order.deliveryCharges)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2.5 flex justify-between font-bold text-base">
                <span className="text-foreground font-display">Grand Total</span>
                <span className="text-foreground font-display">{formatCurrency(order.grandTotal)}</span>
              </div>
              {order.advancePaid > 0 && (
                <div className="flex justify-between text-success">
                  <span>Advance Paid</span>
                  <span>−{formatCurrency(order.advancePaid)}</span>
                </div>
              )}
              <div className={`flex justify-between font-bold border-t border-border pt-2.5 ${order.pendingAmount > 0 ? 'text-warning' : 'text-success'}`}>
                <span>{order.pendingAmount > 0 ? 'Pending' : '✓ Fully Paid'}</span>
                <span className="font-display">{formatCurrency(order.pendingAmount)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-base p-5 space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Invoice & Statement</p>
            <button
              onClick={() => downloadPdf('invoice')}
              disabled={downloading !== null}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary hover:bg-accent text-primary-foreground text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              {downloading === 'invoice' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download Invoice
            </button>
            <button
              onClick={() => downloadPdf('quotation')}
              disabled={downloading !== null}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-sm font-semibold cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              {downloading === 'quotation' ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <FileText className="h-4 w-4" />}
              Download Quotation
            </button>
          </div>

          {/* UPI QR Payment Card */}
          {qrCodeUrl && (
            <div className="card-base p-5 flex flex-col items-center text-center space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider self-start flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-primary" /> UPI Payment QR
              </p>
              <img src={qrCodeUrl} alt="UPI Payment QR" className="h-32 w-32 border border-border rounded-lg bg-white p-1" />
              <div>
                <p className="text-xs font-bold text-foreground font-display">Scan to Pay via UPI</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{bizUpiId}</p>
                <p className="text-[11px] text-primary font-bold mt-1">
                  Amount: {formatCurrency(order.pendingAmount > 0 ? order.pendingAmount : order.grandTotal)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Confirmation Modal */}
      {confirmStatus && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4">
          <div className="rounded-lg border border-border bg-card p-6 max-w-sm w-full shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-foreground font-display mb-2">Confirm Status Change</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Change order status to <strong className={statusConfig[confirmStatus]?.cls}>{statusConfig[confirmStatus]?.label}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmStatus(null)} className="flex-1 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer min-h-[44px]">Cancel</button>
              <button
                onClick={() => statusMutation.mutate(confirmStatus)}
                disabled={statusMutation.isPending}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
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
