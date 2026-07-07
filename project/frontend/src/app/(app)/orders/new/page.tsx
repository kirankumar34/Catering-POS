"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../../../lib/api';
import { MENU_CATEGORIES } from '../../menus/components/MenuItemForm';
import {
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

const steps = [
  { id: 1, label: 'Customer', icon: User },
  { id: 2, label: 'Menu', icon: Package },
  { id: 3, label: 'Billing', icon: ClipboardList },
];

const StepIndicator = ({ current }: { current: number }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    {steps.map((step, idx) => (
      <React.Fragment key={step.id}>
        <div className={`flex items-center gap-2.5 px-4 py-2 rounded-lg transition-all ${current === step.id ? 'bg-primary/8 border border-primary/20' : current > step.id ? 'opacity-70' : 'opacity-40'}`}>
          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${current > step.id ? 'bg-success border-success text-success-foreground' : current === step.id ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}>
            {current > step.id ? <Check className="h-3.5 w-3.5" /> : step.id}
          </div>
          <span className={`text-sm font-semibold ${current === step.id ? 'text-foreground font-display' : 'text-muted-foreground'}`}>{step.label}</span>
        </div>
        {idx < steps.length - 1 && (
          <div className={`hidden sm:block flex-1 h-[2px] ${current > step.id ? 'bg-success/30' : 'bg-border'} mx-2`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

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
        <h2 className="text-lg font-bold text-foreground font-display">Select Customer</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Search for an existing customer or create a new one.</p>
      </div>

      {selectedCustomer && (
        <div className="rounded-lg border border-success/20 bg-success/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-success/20 flex items-center justify-center text-success font-bold">
              {selectedCustomer.name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{selectedCustomer.name}</p>
              <p className="text-xs text-muted-foreground">{selectedCustomer.phone}</p>
            </div>
          </div>
          <button onClick={() => { onSelect(null!); setSearch(''); }} className="text-xs text-destructive hover:text-destructive/90 font-semibold cursor-pointer min-h-[44px]">
            Change
          </button>
        </div>
      )}

      {!selectedCustomer && (
        <div ref={dropdownRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search customer by name or phone..."
              className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary min-h-[44px]"
            />
          </div>

          {showDropdown && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card shadow-lg overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-6 gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Searching...</span>
                </div>
              ) : customers.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  {search ? `No customers found for "${search}"` : 'Start typing to search customers'}
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto divide-y divide-border">
                  {customers.map((c) => (
                    <button key={c.id} onClick={() => { onSelect(c); setShowDropdown(false); setSearch(''); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/35 transition-colors text-left cursor-pointer min-h-[44px]"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {c.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="border-t border-border p-2">
                <Link href="/customers/new" target="_blank"
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-primary hover:bg-primary/5 font-semibold transition-all min-h-[44px]"
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
        <h2 className="text-lg font-bold text-foreground font-display">Select Menu</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Choose a pre-defined package or build a custom menu.</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden p-1 bg-secondary/30">
        <button
          onClick={() => onModeChange('package')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${menuMode === 'package' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Package className="h-4 w-4" /> Package Menu
        </button>
        <button
          onClick={() => onModeChange('custom')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${menuMode === 'custom' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <ClipboardList className="h-4 w-4" /> Custom Builder
        </button>
      </div>

      {/* Package Selection */}
      {menuMode === 'package' && (
        <div className="space-y-3">
          {packages.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No active menu packages. <Link href="/menus/new" className="text-primary hover:underline">Create one</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
              {packages.map(pkg => (
                <button
                  key={pkg.id}
                  onClick={() => onSelectPackage(selectedPackage?.id === pkg.id ? null : pkg)}
                  className={`rounded-lg border p-4 text-left transition-all cursor-pointer min-h-[44px] ${selectedPackage?.id === pkg.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-muted-foreground'}`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-bold text-foreground">{pkg.name}</p>
                    {selectedPackage?.id === pkg.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </div>
                  {pkg.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{pkg.description}</p>}
                  <p className="text-lg font-bold text-primary mt-2">₹{pkg.pricePerPlate}<span className="text-xs text-muted-foreground font-normal">/plate</span></p>
                </button>
              ))}
            </div>
          )}
          {selectedPackage && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Selected: {selectedPackage.name}</p>
              <p className="text-xs text-muted-foreground">Price per plate: <span className="text-foreground font-bold">₹{selectedPackage.pricePerPlate}</span></p>
            </div>
          )}
        </div>
      )}

      {/* Custom Builder */}
      {menuMode === 'custom' && (
        <div className="space-y-4">
          {/* Price Input */}
          <div className="rounded-lg border border-border bg-secondary/10 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-primary">
              <Info className="h-4 w-4" />
              <span className="font-semibold">Custom Menu Builder</span>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Custom Price Per Plate (₹) *</label>
              <input
                type="number"
                value={customPricePerPlate || ''}
                onChange={e => onCustomPriceChange(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 350"
                className="w-full sm:w-48 rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
              />
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Selected dishes: <strong className="text-foreground">{selectedDishIds.length}</strong></span>
              <span>Sum of dish prices: <strong className="text-primary">₹{totalCustomPrice}</strong></span>
            </div>
          </div>

          {/* Search + Category Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={dishSearch}
                onChange={e => setDishSearch(e.target.value)}
                placeholder="Search dishes..."
                className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary min-h-[44px]"
              />
            </div>
            <div className="flex items-center gap-1.5 sm:w-44">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <select
                value={dishCategory}
                onChange={e => setDishCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-2 py-2 text-xs text-foreground focus:outline-none min-h-[44px]"
              >
                <option value="">All Categories</option>
                {MENU_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Dish Checklist */}
          <div className="border border-border rounded-lg bg-card max-h-[320px] overflow-y-auto divide-y divide-border">
            {filteredDishes.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">No available dishes match your filter.</div>
            ) : filteredDishes.map(dish => {
              const isSelected = selectedDishIds.includes(dish.id);
              return (
                <div
                  key={dish.id}
                  onClick={() => toggleCustomItem(dish)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors select-none min-h-[44px] ${isSelected ? 'bg-primary/5' : 'hover:bg-secondary/35'}`}
                >
                  <div className="flex items-center gap-3">
                    {isSelected ? <CheckSquare className="h-4 w-4 text-primary shrink-0" /> : <Square className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{dish.name}</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${dish.isVeg ? 'bg-success' : 'bg-destructive'}`} />
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {MENU_CATEGORIES.find(c => c.value === dish.category)?.label || dish.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">₹{dish.price}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

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

  const fmt = (v: number) => `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Fields */}
      <div className="space-y-5 rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-bold text-foreground border-b border-border pb-3 uppercase tracking-wider font-display">Order Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Event Date *</label>
            <input type="date" value={values.eventDate}
              onChange={e => onChange('eventDate', e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">No. of Plates *</label>
            <input type="number" min="1" value={values.numberOfPlates || ''}
              onChange={e => onChange('numberOfPlates', parseInt(e.target.value) || 0)}
              placeholder="100"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Event Type</label>
            <select value={values.eventType}
              onChange={e => onChange('eventType', e.target.value)}
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
            <input type="text" value={values.venue}
              onChange={e => onChange('venue', e.target.value)}
              placeholder="e.g. Rajaa Mahal, Chennai"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Price Per Plate (₹) *</label>
          <input type="number" min="0" step="0.01" value={values.pricePerPlate || ''}
            onChange={e => onChange('pricePerPlate', parseFloat(e.target.value) || 0)}
            placeholder="350"
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Discount (%)</label>
            <input type="number" min="0" max="100" value={values.discount || ''}
              onChange={e => onChange('discount', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">GST (%)</label>
            <input type="number" min="0" max="100" value={values.gst || ''}
              onChange={e => onChange('gst', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Extra (₹)</label>
            <input type="number" min="0" value={values.additionalCost || ''}
              onChange={e => onChange('additionalCost', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Delivery (₹)</label>
            <input type="number" min="0" value={values.deliveryCharges || ''}
              onChange={e => onChange('deliveryCharges', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Advance Paid (₹)</label>
          <input type="number" min="0" value={values.advancePaid || ''}
            onChange={e => onChange('advancePaid', parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Notes (Optional)</label>
          <textarea rows={2} value={values.notes}
            onChange={e => onChange('notes', e.target.value)}
            placeholder="Special instructions, event details..."
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground resize-none focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Live Bill Summary */}
      <div className="rounded-lg border border-border bg-card p-6 h-fit space-y-4">
        <h2 className="text-sm font-bold text-foreground border-b border-border pb-3 uppercase tracking-wider font-display">Live Bill Preview</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>{values.numberOfPlates} plates × ₹{values.pricePerPlate}</span>
            <span className="text-foreground font-semibold">{fmt(subtotal)}</span>
          </div>
          {values.discount > 0 && (
            <div className="flex justify-between text-destructive">
              <span>Discount ({values.discount}%)</span>
              <span>−{fmt(discountAmt)}</span>
            </div>
          )}
          {values.gst > 0 && (
            <div className="flex justify-between text-primary">
              <span>GST ({values.gst}%)</span>
              <span>+{fmt(gstAmt)}</span>
            </div>
          )}
          {values.additionalCost > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Additional Charges</span>
              <span className="text-foreground font-semibold">+{fmt(values.additionalCost)}</span>
            </div>
          )}
          {values.deliveryCharges > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Charges</span>
              <span className="text-foreground font-semibold">+{fmt(values.deliveryCharges)}</span>
            </div>
          )}
          <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
            <span className="text-foreground font-display">Grand Total</span>
            <span className="text-primary text-xl font-display">{fmt(grandTotal)}</span>
          </div>
          {values.advancePaid > 0 && (
            <>
              <div className="flex justify-between text-success text-sm">
                <span>Advance Paid</span>
                <span>−{fmt(values.advancePaid)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-border pt-2">
                <span className={pendingAmount > 0 ? 'text-warning font-display' : 'text-success font-display'}>
                  {pendingAmount > 0 ? 'Pending Amount' : '✓ Fully Paid'}
                </span>
                <span className={pendingAmount > 0 ? 'text-warning font-display' : 'text-success font-display'}>{fmt(pendingAmount)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const NewOrderPage = () => {
  const router = useRouter();
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
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-4 border-b border-border pb-5">
        <Link href="/orders" className="p-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-h-[44px] flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">New Order</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Create a new catering order booking</p>
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator current={step} />

      {/* Step Content */}
      <div className="card-base p-6 min-h-[360px]">
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
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive font-semibold">
          {apiError}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => { setStep(s => s - 1); setApiError(null); }}
          disabled={step === 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary font-semibold text-sm transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canNext() || createMutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer min-h-[44px]"
        >
          {createMutation.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin animate-spin" /> Creating...</>
          ) : step === 3 ? (
            <><Check className="h-4 w-4" /> Create Order</>
          ) : (
            <>Next <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default NewOrderPage;
