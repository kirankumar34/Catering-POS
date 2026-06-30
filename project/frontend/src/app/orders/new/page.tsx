"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import { MENU_CATEGORIES } from '../../menus/components/MenuItemForm';
import {
  LayoutDashboard,
  Users,
  Utensils,
  ShoppingBag,
  IndianRupee,
  LogOut,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Search,
  Check,
  Loader2,
  User,
  Package,
  ClipboardList,
  CheckSquare,
  Square,
  Filter,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gstNumber?: string;
}

interface MenuPackage {
  id: string;
  name: string;
  description?: string;
  pricePerPlate: number;
  status: boolean;
  items: { id: string; name: string; category: string; isVeg: boolean }[];
}

interface Dish {
  id: string;
  name: string;
  category: string;
  isVeg: boolean;
  price: number;
  available: boolean;
}

interface OrderItemInput {
  itemId: string;
  quantity: number;
  rate: number;
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

const steps = [
  { id: 1, label: 'Customer', icon: User },
  { id: 2, label: 'Menu', icon: Package },
  { id: 3, label: 'Billing', icon: ClipboardList },
];

const StepIndicator = ({ current }: { current: number }) => (
  <div className="flex items-center gap-0 mb-8">
    {steps.map((step, idx) => (
      <React.Fragment key={step.id}>
        <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all ${current === step.id ? 'bg-indigo-500/10 border border-indigo-500/20' : current > step.id ? 'opacity-60' : 'opacity-30'}`}>
          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${current > step.id ? 'bg-emerald-500 border-emerald-500 text-white' : current === step.id ? 'border-indigo-500 text-indigo-400' : 'border-slate-600 text-slate-500'}`}>
            {current > step.id ? <Check className="h-3.5 w-3.5" /> : step.id}
          </div>
          <span className={`text-sm font-semibold ${current === step.id ? 'text-white' : 'text-slate-400'}`}>{step.label}</span>
        </div>
        {idx < steps.length - 1 && (
          <div className={`flex-1 h-px ${current > step.id ? 'bg-emerald-500/40' : 'bg-slate-700'} mx-2`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Step 1: Customer Selection ───────────────────────────────────────────────

const CustomerStep = ({
  selectedCustomer,
  onSelect,
}: {
  selectedCustomer: Customer | null;
  onSelect: (c: Customer) => void;
}) => {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customersSearch', search],
    queryFn: async () => {
      const res = await api.get('/customers', { params: { search: search || undefined, limit: 8 } });
      return res.data.data as Customer[];
    },
    enabled: search.length >= 1 || showDropdown,
  });

  const customers = data || [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Select Customer</h2>
        <p className="text-xs text-slate-400 mt-0.5">Search for an existing customer or create a new one.</p>
      </div>

      {selectedCustomer && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              {selectedCustomer.name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{selectedCustomer.name}</p>
              <p className="text-xs text-slate-400">{selectedCustomer.phone}</p>
            </div>
          </div>
          <button onClick={() => { onSelect(null!); setSearch(''); }} className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer">
            Change
          </button>
        </div>
      )}

      {!selectedCustomer && (
        <div ref={dropdownRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search customer by name or phone..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {showDropdown && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-6 gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  <span className="text-xs text-slate-400">Searching...</span>
                </div>
              ) : customers.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  {search ? `No customers found for "${search}"` : 'Start typing to search customers'}
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/60">
                  {customers.map((c) => (
                    <button key={c.id} onClick={() => { onSelect(c); setShowDropdown(false); setSearch(''); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors text-left cursor-pointer"
                    >
                      <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
                        {c.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="border-t border-slate-800 p-2">
                <Link href="/customers/new" target="_blank"
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-indigo-400 hover:bg-indigo-500/10 font-semibold transition-all"
                >
                  + Create New Customer (opens new tab)
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Step 2: Menu Selection (+ Custom Builder) ────────────────────────────────

const MenuStep = ({
  menuMode,
  onModeChange,
  selectedPackage,
  onSelectPackage,
  customItems,
  onCustomItemsChange,
  customPricePerPlate,
  onCustomPriceChange,
}: {
  menuMode: 'package' | 'custom';
  onModeChange: (m: 'package' | 'custom') => void;
  selectedPackage: MenuPackage | null;
  onSelectPackage: (pkg: MenuPackage | null) => void;
  customItems: OrderItemInput[];
  onCustomItemsChange: (items: OrderItemInput[]) => void;
  customPricePerPlate: number;
  onCustomPriceChange: (v: number) => void;
}) => {
  const [dishSearch, setDishSearch] = useState('');
  const [dishCategory, setDishCategory] = useState('');

  const { data: packagesData } = useQuery({
    queryKey: ['menuPackages'],
    queryFn: async () => {
      const res = await api.get('/menus', { params: { limit: 100 } });
      return res.data.data as MenuPackage[];
    },
  });

  const { data: dishesData } = useQuery({
    queryKey: ['allDishes'],
    queryFn: async () => {
      const res = await api.get('/menu-items', { params: { limit: 1000 } });
      return res.data.data as Dish[];
    },
  });

  const packages = (packagesData || []).filter(p => p.status);
  const dishes = dishesData || [];

  const filteredDishes = dishes.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(dishSearch.toLowerCase());
    const matchCat = dishCategory ? d.category === dishCategory : true;
    return matchSearch && matchCat && d.available;
  });

  const toggleCustomItem = (dish: Dish) => {
    const existing = customItems.find(i => i.itemId === dish.id);
    if (existing) {
      onCustomItemsChange(customItems.filter(i => i.itemId !== dish.id));
    } else {
      onCustomItemsChange([...customItems, { itemId: dish.id, quantity: 1, rate: dish.price }]);
    }
  };

  const selectedDishIds = customItems.map(i => i.itemId);
  const totalCustomPrice = dishes
    .filter(d => selectedDishIds.includes(d.id))
    .reduce((sum, d) => sum + d.price, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Select Menu</h2>
        <p className="text-xs text-slate-400 mt-0.5">Choose a pre-defined package or build a custom menu.</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex rounded-xl border border-slate-800 overflow-hidden p-1 bg-slate-950">
        <button
          onClick={() => onModeChange('package')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${menuMode === 'package' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <Package className="h-4 w-4" /> Package Menu
        </button>
        <button
          onClick={() => onModeChange('custom')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${menuMode === 'custom' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <ClipboardList className="h-4 w-4" /> Custom Builder
        </button>
      </div>

      {/* Package Selection */}
      {menuMode === 'package' && (
        <div className="space-y-3">
          {packages.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              No active menu packages. <Link href="/menus/new" className="text-indigo-400 hover:underline">Create one</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
              {packages.map(pkg => (
                <button
                  key={pkg.id}
                  onClick={() => onSelectPackage(selectedPackage?.id === pkg.id ? null : pkg)}
                  className={`rounded-xl border p-4 text-left transition-all cursor-pointer ${selectedPackage?.id === pkg.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'}`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-bold text-white">{pkg.name}</p>
                    {selectedPackage?.id === pkg.id && <Check className="h-4 w-4 text-indigo-400 shrink-0" />}
                  </div>
                  {pkg.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{pkg.description}</p>}
                  <p className="text-lg font-bold text-indigo-400 mt-2">₹{pkg.pricePerPlate}<span className="text-xs text-slate-500 font-normal">/plate</span></p>
                </button>
              ))}
            </div>
          )}
          {selectedPackage && (
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Selected: {selectedPackage.name}</p>
              <p className="text-xs text-slate-400">Price per plate: <span className="text-white font-bold">₹{selectedPackage.pricePerPlate}</span></p>
            </div>
          )}
        </div>
      )}

      {/* Custom Builder */}
      {menuMode === 'custom' && (
        <div className="space-y-4">
          {/* Price Input */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-indigo-400">
              <Info className="h-4 w-4" />
              <span className="font-semibold">Custom Menu Builder — Module 5</span>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Custom Price Per Plate (₹) *</label>
              <input
                type="number"
                value={customPricePerPlate || ''}
                onChange={e => onCustomPriceChange(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 350"
                className="w-full sm:w-48 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-4 text-xs text-slate-400">
              <span>Selected dishes: <strong className="text-white">{selectedDishIds.length}</strong></span>
              <span>Sum of dish prices: <strong className="text-indigo-400">₹{totalCustomPrice}</strong></span>
            </div>
          </div>

          {/* Search + Category Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={dishSearch}
                onChange={e => setDishSearch(e.target.value)}
                placeholder="Search dishes..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-1.5 sm:w-44">
              <Filter className="h-4 w-4 text-slate-500 shrink-0" />
              <select
                value={dishCategory}
                onChange={e => setDishCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-2 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">All Categories</option>
                {MENU_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Dish Checklist */}
          <div className="border border-slate-800 rounded-xl bg-slate-950/40 max-h-[320px] overflow-y-auto divide-y divide-slate-800/50">
            {filteredDishes.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No available dishes match your filter.</div>
            ) : filteredDishes.map(dish => {
              const isSelected = selectedDishIds.includes(dish.id);
              return (
                <div
                  key={dish.id}
                  onClick={() => toggleCustomItem(dish)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors select-none ${isSelected ? 'bg-indigo-500/5' : 'hover:bg-slate-800/30'}`}
                >
                  <div className="flex items-center gap-3">
                    {isSelected ? <CheckSquare className="h-4 w-4 text-indigo-500 shrink-0" /> : <Square className="h-4 w-4 text-slate-600 shrink-0" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{dish.name}</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${dish.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {MENU_CATEGORIES.find(c => c.value === dish.category)?.label || dish.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">₹{dish.price}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Step 3: Billing Details ──────────────────────────────────────────────────

const BillingStep = ({
  values,
  onChange,
}: {
  values: {
    eventDate: string;
    eventType: string;
    venue: string;
    numberOfPlates: number;
    pricePerPlate: number;
    discount: number;
    gst: number;
    additionalCost: number;
    deliveryCharges: number;
    advancePaid: number;
    notes: string;
  };
  onChange: (key: string, value: string | number) => void;
}) => {
  const subtotal = values.numberOfPlates * values.pricePerPlate;
  const discountAmt = (subtotal * values.discount) / 100;
  const afterDiscount = subtotal - discountAmt;
  const gstAmt = (afterDiscount * values.gst) / 100;
  const grandTotal = afterDiscount + gstAmt + values.additionalCost + values.deliveryCharges;
  const pendingAmount = grandTotal - values.advancePaid;

  const fmt = (v: number) => `₹${v.toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Fields */}
      <div className="space-y-5 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-xl">
        <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Order Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Event Date *</label>
            <input type="date" value={values.eventDate}
              onChange={e => onChange('eventDate', e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">No. of Plates *</label>
            <input type="number" min="1" value={values.numberOfPlates || ''}
              onChange={e => onChange('numberOfPlates', parseInt(e.target.value) || 0)}
              placeholder="100"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Event Type</label>
            <select value={values.eventType}
              onChange={e => onChange('eventType', e.target.value)}
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
            <input type="text" value={values.venue}
              onChange={e => onChange('venue', e.target.value)}
              placeholder="e.g. Rajaa Mahal, Chennai"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Price Per Plate (₹) *</label>
          <input type="number" min="0" step="0.01" value={values.pricePerPlate || ''}
            onChange={e => onChange('pricePerPlate', parseFloat(e.target.value) || 0)}
            placeholder="350"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Discount (%)</label>
            <input type="number" min="0" max="100" value={values.discount || ''}
              onChange={e => onChange('discount', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">GST (%)</label>
            <input type="number" min="0" max="100" value={values.gst || ''}
              onChange={e => onChange('gst', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Extra Charges (₹)</label>
            <input type="number" min="0" value={values.additionalCost || ''}
              onChange={e => onChange('additionalCost', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Delivery Charges (₹)</label>
            <input type="number" min="0" value={values.deliveryCharges || ''}
              onChange={e => onChange('deliveryCharges', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Advance Paid (₹)</label>
          <input type="number" min="0" value={values.advancePaid || ''}
            onChange={e => onChange('advancePaid', parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Notes (Optional)</label>
          <textarea rows={2} value={values.notes}
            onChange={e => onChange('notes', e.target.value)}
            placeholder="Special instructions, event details..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white resize-none focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Live Bill Summary */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-xl h-fit space-y-4">
        <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Live Bill Preview</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>{values.numberOfPlates} plates × ₹{values.pricePerPlate}</span>
            <span className="text-white font-semibold">{fmt(subtotal)}</span>
          </div>
          {values.discount > 0 && (
            <div className="flex justify-between text-rose-400">
              <span>Discount ({values.discount}%)</span>
              <span>−{fmt(discountAmt)}</span>
            </div>
          )}
          {values.gst > 0 && (
            <div className="flex justify-between text-amber-400">
              <span>GST ({values.gst}%)</span>
              <span>+{fmt(gstAmt)}</span>
            </div>
          )}
          {values.additionalCost > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Additional Charges</span>
              <span className="text-white font-semibold">+{fmt(values.additionalCost)}</span>
            </div>
          )}
          {values.deliveryCharges > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Delivery Charges</span>
              <span className="text-white font-semibold">+{fmt(values.deliveryCharges)}</span>
            </div>
          )}
          <div className="border-t border-slate-700 pt-3 flex justify-between font-bold text-base">
            <span className="text-white">Grand Total</span>
            <span className="text-indigo-400 text-xl">{fmt(grandTotal)}</span>
          </div>
          {values.advancePaid > 0 && (
            <>
              <div className="flex justify-between text-emerald-400 text-sm">
                <span>Advance Paid</span>
                <span>−{fmt(values.advancePaid)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-700 pt-2">
                <span className={pendingAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                  {pendingAmount > 0 ? 'Pending Amount' : 'Fully Paid ✓'}
                </span>
                <span className={pendingAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}>{fmt(pendingAmount)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const NewOrderPage = () => {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [step, setStep] = useState(1);

  // State for each step
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [menuMode, setMenuMode] = useState<'package' | 'custom'>('package');
  const [selectedPackage, setSelectedPackage] = useState<MenuPackage | null>(null);
  const [customItems, setCustomItems] = useState<OrderItemInput[]>([]);
  const [customPricePerPlate, setCustomPricePerPlate] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  const [billing, setBilling] = useState({
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
  });

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: false },
    { label: 'Customers', href: '/customers', icon: Users, active: false },
    { label: 'Menus', href: '/menus', icon: Utensils, active: false },
    { label: 'Orders', href: '/orders', icon: ShoppingBag, active: true },
    { label: 'Billing', href: '/billing', icon: IndianRupee, active: false },
  ];

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  // Sync pricePerPlate from selected package
  useEffect(() => {
    if (menuMode === 'package' && selectedPackage) {
      setBilling(b => ({ ...b, pricePerPlate: selectedPackage.pricePerPlate }));
    }
  }, [selectedPackage, menuMode]);

  useEffect(() => {
    if (menuMode === 'custom') {
      setBilling(b => ({ ...b, pricePerPlate: customPricePerPlate }));
    }
  }, [customPricePerPlate, menuMode]);

  const handleBillingChange = (key: string, value: string | number) => {
    setBilling(b => ({ ...b, [key]: value }));
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        customerId: selectedCustomer!.id,
        menuId: menuMode === 'package' ? selectedPackage?.id : undefined,
        eventDate: billing.eventDate,
        eventType: billing.eventType || undefined,
        venue: billing.venue || undefined,
        numberOfPlates: billing.numberOfPlates,
        pricePerPlate: billing.pricePerPlate,
        discount: billing.discount,
        gst: billing.gst,
        additionalCost: billing.additionalCost,
        deliveryCharges: billing.deliveryCharges,
        advancePaid: billing.advancePaid,
        notes: billing.notes || undefined,
        items: menuMode === 'custom' ? customItems : undefined,
      };
      const res = await api.post('/orders', payload);
      return res.data;
    },
    onSuccess: (data) => {
      router.push(`/orders/${data.id}`);
    },
    onError: (err: unknown) => {
      let msg = 'Failed to create order';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        const m = err.response.data.message;
        msg = Array.isArray(m) ? m.join(', ') : m;
      }
      setApiError(msg);
    },
  });

  const canNext = () => {
    if (step === 1) return !!selectedCustomer;
    if (step === 2) {
      if (menuMode === 'package') return !!selectedPackage;
      return customItems.length > 0 && customPricePerPlate > 0;
    }
    return billing.eventDate && billing.numberOfPlates > 0 && billing.pricePerPlate > 0;
  };

  const handleNext = () => {
    if (step < 3) setStep(s => s + 1);
    else createMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" />
      <title>New Order – SBBMS</title>

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
          {/* Page Title */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/orders" className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">New Order</h1>
              <p className="text-xs text-slate-400">Create a new catering order booking</p>
            </div>
          </div>

          {/* Step Indicator */}
          <StepIndicator current={step} />

          {/* Step Content */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-xl min-h-[360px]">
            {step === 1 && (
              <CustomerStep selectedCustomer={selectedCustomer} onSelect={setSelectedCustomer} />
            )}
            {step === 2 && (
              <MenuStep
                menuMode={menuMode}
                onModeChange={setMenuMode}
                selectedPackage={selectedPackage}
                onSelectPackage={setSelectedPackage}
                customItems={customItems}
                onCustomItemsChange={setCustomItems}
                customPricePerPlate={customPricePerPlate}
                onCustomPriceChange={setCustomPricePerPlate}
              />
            )}
            {step === 3 && (
              <BillingStep values={billing} onChange={handleBillingChange} />
            )}
          </div>

          {/* API Error */}
          {apiError && (
            <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400 font-semibold">
              {apiError}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => { setStep(s => s - 1); setApiError(null); }}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold text-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canNext() || createMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {createMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
              ) : step === 3 ? (
                <><Check className="h-4 w-4" /> Create Order</>
              ) : (
                <>Next <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrderPage;
