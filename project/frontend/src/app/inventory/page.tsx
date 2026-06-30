"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import {
  LayoutDashboard, Users, Utensils, ShoppingBag, IndianRupee, LogOut,
  ChevronRight, Search, Plus, Edit2, Trash2, ChevronLeft,
  ChevronRight as ChevronRightIcon, Loader2, X, Receipt, Package,
  AlertTriangle, TrendingUp, TrendingDown,
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const UNITS = ['KG', 'LITER', 'PACKET', 'PCS', 'BUNCH', 'DOZEN', 'BAG', 'BOX'];

interface InventoryItem {
  id: string;
  itemName: string;
  currentStock: number;
  unit: string;
  lowStockThreshold: number;
  purchaseCost: number;
  supplier?: string;
  updatedAt: string;
  isLowStock: boolean;
}

const InventoryPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, clearAuth } = useAuthStore();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [adjustDelta, setAdjustDelta] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({ itemName: '', currentStock: '0', unit: 'KG', lowStockThreshold: '5', purchaseCost: '0', supplier: '' });

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: false },
    { label: 'Customers', href: '/customers', icon: Users, active: false },
    { label: 'Orders', href: '/orders', icon: ShoppingBag, active: false },
    { label: 'Expenses', href: '/expenses', icon: Receipt, active: false },
    { label: 'Inventory', href: '/inventory', icon: Package, active: true },
    { label: 'Billing', href: '/billing', icon: IndianRupee, active: false },
  ];

  const handleLogout = () => { clearAuth(); router.push('/login'); };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['inventory', page, search, showLowStock],
    queryFn: async () => {
      const res = await api.get('/inventory', { params: { page, limit: 15, search: search || undefined, lowStock: showLowStock || undefined } });
      return res.data;
    },
  });

  const items: InventoryItem[] = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, totalPages: 1 };
  const lowStockCount = data?.lowStockCount || 0;

  const resetForm = () => { setForm({ itemName: '', currentStock: '0', unit: 'KG', lowStockThreshold: '5', purchaseCost: '0', supplier: '' }); setFormError(null); };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        itemName: form.itemName,
        currentStock: parseFloat(form.currentStock) || 0,
        unit: form.unit,
        lowStockThreshold: parseFloat(form.lowStockThreshold) || 5,
        purchaseCost: parseFloat(form.purchaseCost) || 0,
        supplier: form.supplier || undefined,
      };
      if (editItem) await api.patch(`/inventory/${editItem.id}`, payload);
      else await api.post('/inventory', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setShowForm(false); setEditItem(null); resetForm();
    },
    onError: (err: unknown) => {
      let msg = 'Failed to save item';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        const m = err.response.data.message;
        msg = Array.isArray(m) ? m.join(', ') : m;
      }
      setFormError(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/inventory/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventory'] }); setDeleteId(null); },
  });

  const adjustMutation = useMutation({
    mutationFn: async ({ id, delta }: { id: string; delta: number }) => {
      await api.patch(`/inventory/${id}/adjust`, { delta });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventory'] }); setAdjustId(null); setAdjustDelta(''); },
  });

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setForm({ itemName: item.itemName, currentStock: String(item.currentStock), unit: item.unit, lowStockThreshold: String(item.lowStockThreshold), purchaseCost: String(item.purchaseCost), supplier: item.supplier || '' });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" />
      <title>Inventory – SBBMS</title>

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
              {link.label === 'Inventory' && lowStockCount > 0 && <span className="ml-auto text-[10px] font-bold bg-amber-500 text-white rounded-full px-1.5 py-0.5">{lowStockCount}</span>}
              {link.active && lowStockCount === 0 && <ChevronRight className="h-3.5 w-3.5 ml-auto text-indigo-400" />}
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
              <h1 className="text-2xl font-bold text-white">Inventory</h1>
              <p className="text-sm text-slate-400 mt-0.5">Track stock levels for all catering ingredients & supplies</p>
            </div>
            <button onClick={() => { setEditItem(null); resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Item
            </button>
          </div>

          {/* Low Stock Alert Banner */}
          {lowStockCount > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3 mb-5">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
              <p className="text-sm text-amber-300 font-semibold">
                <strong>{lowStockCount} item{lowStockCount > 1 ? 's' : ''}</strong> below low stock threshold.
              </p>
              <button onClick={() => setShowLowStock(!showLowStock)} className={`ml-auto text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${showLowStock ? 'bg-amber-500 text-white' : 'text-amber-400 border border-amber-500/30 hover:bg-amber-500/10'}`}>
                {showLowStock ? 'Show All' : 'Show Low Stock'}
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xs text-slate-500 font-semibold">Total Items</p>
              <p className="text-2xl font-bold text-white mt-1">{meta.total}</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-xs text-amber-500 font-semibold">Low Stock Items</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{lowStockCount}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xs text-slate-500 font-semibold">Total Stock Value</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                ₹{items.reduce((sum, i) => sum + (i.currentStock * i.purchaseCost), 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search inventory items..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-3"><Loader2 className="h-5 w-5 animate-spin text-indigo-400" /><span className="text-sm text-slate-400">Loading inventory...</span></div>
            ) : items.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-12 w-12 text-slate-700 mx-auto mb-4 stroke-[1.5]" />
                <p className="text-slate-400 font-semibold">No inventory items</p>
                <button onClick={() => { setEditItem(null); resetForm(); setShowForm(true); }} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 cursor-pointer">
                  <Plus className="h-4 w-4" /> Add First Item
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800/60">
                        {['Item', 'Stock', 'Unit', 'Threshold', 'Purchase Cost', 'Stock Value', 'Supplier', ''].map(h => (
                          <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {items.map((item) => (
                        <tr key={item.id} className={`hover:bg-slate-800/20 transition-colors group ${item.isLowStock ? 'bg-amber-500/3' : ''}`}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              {item.isLowStock && <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                              <span className="text-sm font-semibold text-white">{item.itemName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${item.isLowStock ? 'text-amber-400' : 'text-emerald-400'}`}>{item.currentStock}</span>
                              <button onClick={() => { setAdjustId(item.id); setAdjustDelta(''); }}
                                className="opacity-0 group-hover:opacity-100 text-[10px] text-indigo-400 border border-indigo-500/30 rounded px-1.5 py-0.5 hover:bg-indigo-500/10 transition-all cursor-pointer"
                              >±</button>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-400">{item.unit}</td>
                          <td className="px-5 py-3.5 text-sm text-slate-400">{item.lowStockThreshold} {item.unit}</td>
                          <td className="px-5 py-3.5 text-sm text-slate-300">₹{item.purchaseCost}</td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-white">₹{(item.currentStock * item.purchaseCost).toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3.5 text-sm text-slate-400">{item.supplier || '–'}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 cursor-pointer"><Edit2 className="h-4 w-4" /></button>
                              <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800/60">
                    <p className="text-xs text-slate-500">Total: {meta.total} items</p>
                    <div className="flex items-center gap-2">
                      <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
                      <span className="text-xs text-slate-400 font-semibold">{page}/{meta.totalPages}</span>
                      <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"><ChevronRightIcon className="h-4 w-4" /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white">{editItem ? 'Edit Item' : 'Add Inventory Item'}</h3>
              <button onClick={() => { setShowForm(false); setEditItem(null); resetForm(); }} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            {formError && <p className="text-xs text-rose-400 font-semibold mb-3 p-2 bg-rose-500/10 rounded-lg">{formError}</p>}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Item Name *</label>
                <input type="text" value={form.itemName} onChange={e => setForm(f => ({ ...f, itemName: e.target.value }))} placeholder="e.g. Rice"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Current Stock</label>
                  <input type="number" min="0" step="0.01" value={form.currentStock} onChange={e => setForm(f => ({ ...f, currentStock: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Unit *</label>
                  <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Low Alert</label>
                  <input type="number" min="0" step="0.01" value={form.lowStockThreshold} onChange={e => setForm(f => ({ ...f, lowStockThreshold: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Purchase Cost (₹)</label>
                  <input type="number" min="0" step="0.01" value={form.purchaseCost} onChange={e => setForm(f => ({ ...f, purchaseCost: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Supplier (Optional)</label>
                  <input type="text" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Vendor name"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowForm(false); setEditItem(null); resetForm(); }} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-semibold cursor-pointer">Cancel</button>
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.itemName}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                {saveMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjust Modal */}
      {adjustId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 max-w-xs w-full shadow-2xl">
            <h3 className="font-bold text-white mb-4">Adjust Stock</h3>
            <p className="text-xs text-slate-400 mb-3">Enter positive value to add stock, negative to reduce.</p>
            <div className="flex gap-2 mb-5">
              <button onClick={() => setAdjustDelta(d => String(parseFloat(d || '0') - 1))} className="px-3 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"><TrendingDown className="h-4 w-4" /></button>
              <input type="number" value={adjustDelta} onChange={e => setAdjustDelta(e.target.value)} placeholder="e.g. +10 or -5"
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white text-center focus:outline-none focus:border-indigo-500" />
              <button onClick={() => setAdjustDelta(d => String(parseFloat(d || '0') + 1))} className="px-3 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"><TrendingUp className="h-4 w-4" /></button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setAdjustId(null); setAdjustDelta(''); }} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-semibold cursor-pointer">Cancel</button>
              <button onClick={() => adjustMutation.mutate({ id: adjustId, delta: parseFloat(adjustDelta) || 0 })} disabled={adjustMutation.isPending || !adjustDelta}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                {adjustMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</> : 'Update Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-white mb-2">Delete Item?</h3>
            <p className="text-sm text-slate-400 mb-5">This will permanently remove the inventory item.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-semibold cursor-pointer">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                {deleteMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
