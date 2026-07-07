"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import {
  Search, Plus, Edit2, Trash2, Loader2, X, Package,
  AlertTriangle, TrendingUp, TrendingDown,
} from 'lucide-react';
import axios from 'axios';
import ResponsiveDataList, { ColumnDef, CardFieldDef } from '../../../components/ui/ResponsiveDataList';

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
  const queryClient = useQueryClient();

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

  const { data, isLoading } = useQuery({
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

  // Define desktop table columns
  const columns: ColumnDef<InventoryItem>[] = [
    {
      header: 'Item',
      accessor: (item) => (
        <div className="flex items-center gap-2">
          {item.isLowStock && <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />}
          <span className="text-sm font-semibold text-foreground">{item.itemName}</span>
        </div>
      ),
    },
    {
      header: 'Stock',
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${item.isLowStock ? 'text-warning' : 'text-success'}`}>
            {item.currentStock} {item.unit}
          </span>
          <button onClick={(e) => { e.stopPropagation(); setAdjustId(item.id); setAdjustDelta(''); }}
            className="opacity-0 group-hover:opacity-100 text-[10px] text-primary border border-primary/30 rounded px-1.5 py-0.5 hover:bg-primary/10 transition-colors cursor-pointer"
          >
            Adjust
          </button>
        </div>
      ),
    },
    {
      header: 'Threshold',
      accessor: (item) => `${item.lowStockThreshold} ${item.unit}`,
      className: 'text-muted-foreground',
    },
    {
      header: 'Purchase Cost',
      accessor: (item) => `₹${item.purchaseCost.toLocaleString('en-IN')}`,
      className: 'text-foreground text-right',
    },
    {
      header: 'Stock Value',
      accessor: (item) => `₹${(item.currentStock * item.purchaseCost).toLocaleString('en-IN')}`,
      className: 'font-semibold text-foreground text-right',
    },
    {
      header: 'Supplier',
      accessor: (item) => item.supplier || <span className="text-muted-foreground">—</span>,
      className: 'text-muted-foreground',
    },
  ];

  // Define mobile card fields
  const cardFields: CardFieldDef<InventoryItem>[] = [
    {
      label: 'Stock Value',
      accessor: (item) => `₹${(item.currentStock * item.purchaseCost).toLocaleString('en-IN')}`,
      variant: 'prominent',
    },
    {
      label: 'Low Alert Threshold',
      accessor: (item) => `${item.lowStockThreshold} ${item.unit}`,
    },
    {
      label: 'Purchase Cost',
      accessor: (item) => `₹${item.purchaseCost.toLocaleString('en-IN')}`,
    },
    {
      label: 'Supplier',
      accessor: (item) => item.supplier || '—',
    },
  ];

  const rowActions = (item: InventoryItem) => (
    <div className="flex items-center justify-end gap-1">
      <button onClick={(e) => { e.stopPropagation(); setAdjustId(item.id); setAdjustDelta(''); }} className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 cursor-pointer">
        <TrendingUp className="h-4 w-4" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/5 cursor-pointer">
        <Edit2 className="h-4 w-4" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 cursor-pointer">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track stock levels for all catering ingredients & supplies</p>
        </div>
        <button onClick={() => { setEditItem(null); resetForm(); setShowForm(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-accent text-primary-foreground text-sm font-semibold transition-colors shadow-sm cursor-pointer min-h-[44px]"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/8 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <p className="text-sm text-warning font-semibold">
            <strong>{lowStockCount} item{lowStockCount > 1 ? 's' : ''}</strong> below low stock threshold.
          </p>
          <button onClick={() => setShowLowStock(!showLowStock)} className={`ml-auto text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${showLowStock ? 'bg-warning text-warning-foreground' : 'text-warning border border-warning/30 hover:bg-warning/10'}`}>
            {showLowStock ? 'Show All' : 'Show Low Stock'}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-base p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Items</p>
          <p className="text-2xl font-bold text-foreground font-display mt-1">{meta.total}</p>
        </div>
        <div className="card-base p-4 border-warning/20 bg-warning/8 text-warning">
          <p className="text-xs font-semibold uppercase tracking-wider">Low Stock Items</p>
          <p className="text-2xl font-bold font-display mt-1">{lowStockCount}</p>
        </div>
        <div className="card-base p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Stock Value</p>
          <p className="text-2xl font-bold text-success font-display mt-1">
            ₹{items.reduce((sum, i) => sum + (i.currentStock * i.purchaseCost), 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search inventory items..."
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors min-h-[44px]"
        />
      </div>

      {/* Inventory Responsive Data List */}
      <ResponsiveDataList
        data={items}
        columns={columns}
        cardTitle={(item) => item.itemName}
        cardSubtitle={(item) => item.isLowStock ? '⚠️ Low Stock' : 'In Stock'}
        cardBadge={(item) => (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${item.isLowStock ? 'bg-warning/8 text-warning border-warning/20' : 'bg-success/8 text-success border-success/20'}`}>
            {item.currentStock} {item.unit}
          </span>
        )}
        cardFields={cardFields}
        keyExtractor={(item) => item.id}
        actions={rowActions}
        pagination={{
          total: meta.total,
          page: page,
          totalPages: meta.totalPages,
        }}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyIcon={<Package className="h-12 w-12 text-muted-foreground/30 stroke-[1.5]" />}
        emptyTitle="No inventory items found"
        emptyDescription={search || showLowStock ? 'Try adjusting your filters or search query.' : 'Add your first inventory item to start tracking ingredients.'}
        emptyAction={
          !search && !showLowStock ? (
            <button onClick={() => { setEditItem(null); resetForm(); setShowForm(true); }} className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent transition-all cursor-pointer">
              <Plus className="h-4 w-4" /> Add First Item
            </button>
          ) : undefined
        }
      />

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4">
          <div className="rounded-lg border border-border bg-card p-6 max-w-md w-full shadow-lg relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground font-display">{editItem ? 'Edit Item' : 'Add Inventory Item'}</h3>
              <button onClick={() => { setShowForm(false); setEditItem(null); resetForm(); }} className="text-muted-foreground hover:text-foreground cursor-pointer p-1"><X className="h-5 w-5" /></button>
            </div>
            {formError && <p className="text-xs text-destructive font-semibold mb-3 p-2 bg-destructive/10 rounded-lg">{formError}</p>}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Item Name *</label>
                <input type="text" value={form.itemName} onChange={e => setForm(f => ({ ...f, itemName: e.target.value }))} placeholder="e.g. Rice"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Current Stock</label>
                  <input type="number" min="0" step="0.01" value={form.currentStock} onChange={e => setForm(f => ({ ...f, currentStock: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Unit *</label>
                  <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Low Alert</label>
                  <input type="number" min="0" step="0.01" value={form.lowStockThreshold} onChange={e => setForm(f => ({ ...f, lowStockThreshold: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Purchase Cost (₹)</label>
                  <input type="number" min="0" step="0.01" value={form.purchaseCost} onChange={e => setForm(f => ({ ...f, purchaseCost: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Supplier (Optional)</label>
                  <input type="text" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Vendor name"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowForm(false); setEditItem(null); resetForm(); }} className="flex-1 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer min-h-[44px]">Cancel</button>
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.itemName}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]">
                {saveMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjust Modal */}
      {adjustId && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4">
          <div className="rounded-lg border border-border bg-card p-6 max-w-xs w-full shadow-lg relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-foreground font-display mb-4">Adjust Stock</h3>
            <p className="text-xs text-muted-foreground mb-3">Enter positive value to add stock, negative to reduce.</p>
            <div className="flex gap-2 mb-5">
              <button onClick={() => setAdjustDelta(d => String(parseFloat(d || '0') - 1))} className="px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer min-h-[44px]"><TrendingDown className="h-4 w-4" /></button>
              <input type="number" value={adjustDelta} onChange={e => setAdjustDelta(e.target.value)} placeholder="e.g. +10 or -5"
                className="flex-1 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground text-center focus:outline-none focus:border-primary min-h-[44px]" />
              <button onClick={() => setAdjustDelta(d => String(parseFloat(d || '0') + 1))} className="px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer min-h-[44px]"><TrendingUp className="h-4 w-4" /></button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setAdjustId(null); setAdjustDelta(''); }} className="flex-1 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer min-h-[44px]">Cancel</button>
              <button onClick={() => adjustMutation.mutate({ id: adjustId, delta: parseFloat(adjustDelta) || 0 })} disabled={adjustMutation.isPending || !adjustDelta}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]">
                {adjustMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</> : 'Update Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4">
          <div className="rounded-lg border border-border bg-card p-6 max-w-sm w-full shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-foreground font-display mb-2">Delete Item?</h3>
            <p className="text-sm text-muted-foreground mb-5">This will permanently remove the inventory item.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer min-h-[44px]">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]">
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
