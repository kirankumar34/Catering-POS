"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { MENU_CATEGORIES } from './MenuItemForm';
import { ArrowLeft, Loader2, Search, Filter, CheckSquare, Square, Info } from 'lucide-react';
import Link from 'next/link';

interface Dish {
  id: string;
  name: string;
  category: string;
  isVeg: boolean;
  price: number;
  description?: string;
  available: boolean;
}

const menuSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().optional().or(z.literal('')),
  pricePerPlate: z.number().min(0, 'Price must be 0 or greater.'),
  status: z.boolean(),
  itemIds: z.array(z.string()),
});

export type MenuFormValues = z.infer<typeof menuSchema>;

interface MenuPackageFormProps {
  initialValues?: Partial<MenuFormValues>;
  onSubmit: (values: MenuFormValues) => void;
  isSubmitting: boolean;
  apiError?: string | null;
  title: string;
}

const MenuPackageForm: React.FC<MenuPackageFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  apiError,
  title,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
      pricePerPlate: initialValues?.pricePerPlate || 0,
      status: initialValues?.status !== undefined ? initialValues.status : true,
      itemIds: initialValues?.itemIds || [],
    },
  });

  const statusWatch = watch('status');
  const selectedItemIds = watch('itemIds') || [];

  // Local state for searching & filtering dishes in the checklist
  const [dishSearch, setDishSearch] = useState('');
  const [dishCategoryFilter, setDishCategoryFilter] = useState('');

  // Fetch all available dishes for the selection checklist
  const { data: dishesResponse, isLoading: isLoadingDishes } = useQuery({
    queryKey: ['allMenuItemsList'],
    queryFn: async () => {
      const response = await api.get('/menu-items', {
        params: { limit: 1000 }, // Fetch all items
      });
      return response.data;
    },
  });

  const dishes = (dishesResponse?.data || []) as Dish[];

  const handleToggleItem = (itemId: string) => {
    if (selectedItemIds.includes(itemId)) {
      setValue(
        'itemIds',
        selectedItemIds.filter(id => id !== itemId)
      );
    } else {
      setValue('itemIds', [...selectedItemIds, itemId]);
    }
  };

  // Filter dishes based on search & category select filters
  const filteredDishes = dishes.filter((dish: Dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(dishSearch.toLowerCase()) || 
                          (dish.description && dish.description.toLowerCase().includes(dishSearch.toLowerCase()));
    const matchesCategory = dishCategoryFilter ? dish.category === dishCategoryFilter : true;
    return matchesSearch && matchesCategory && dish.available;
  });

  // Calculate sum of selected item prices
  const selectedDishesSum = dishes
    .filter((dish: Dish) => selectedItemIds.includes(dish.id))
    .reduce((sum: number, dish: Dish) => sum + dish.price, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/menus?tab=packages"
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-white font-outfit">{title}</h2>
          <p className="text-xs text-slate-400">Configure parameters and associate individual dishes to this package.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error message */}
        {apiError && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-semibold text-rose-400">
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Info Columns (Left 2 columns on lg screens) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-xl space-y-5">
              {/* Package Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-semibold text-slate-300">Package Name *</label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  placeholder="e.g. Premium Wedding Menu"
                  className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    errors.name ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800'
                  }`}
                />
                {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-xs font-semibold text-slate-300">Description (Optional)</label>
                <textarea
                  id="description"
                  rows={3}
                  {...register('description')}
                  placeholder="e.g. Standard vegetarian wedding menu package with South Indian specials..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-850">
                {/* Price Per Plate */}
                <div className="space-y-2">
                  <label htmlFor="pricePerPlate" className="text-xs font-semibold text-slate-300">Plate Charge (₹) *</label>
                  <input
                    id="pricePerPlate"
                    type="number"
                    {...register('pricePerPlate', { valueAsNumber: true })}
                    placeholder="e.g. 350"
                    className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      errors.pricePerPlate ? 'border-rose-500' : 'border-slate-800'
                    }`}
                  />
                  {errors.pricePerPlate && <p className="text-xs text-rose-500">{errors.pricePerPlate.message}</p>}
                </div>

                {/* Status toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/20 h-[50px] mt-8">
                  <span className="text-xs font-bold text-slate-300">Status Active</span>
                  <button
                    type="button"
                    onClick={() => setValue('status', !statusWatch)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      statusWatch ? 'bg-indigo-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        statusWatch ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Checklist Container */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-outfit">
                  Link Dishes ({selectedItemIds.length} Selected)
                </h3>
                <span className="text-xs text-slate-500 font-semibold">
                  A-Z Dishes Directory
                </span>
              </div>

              {/* Checklist Search & Filtering */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={dishSearch}
                    onChange={(e) => setDishSearch(e.target.value)}
                    placeholder="Search dishes..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-655 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2 sm:w-48">
                  <Filter className="h-4 w-4 text-slate-500 shrink-0" />
                  <select
                    value={dishCategoryFilter}
                    onChange={(e) => setDishCategoryFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    {MENU_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dishes Checklist Scroll Box */}
              <div className="border border-slate-800 bg-slate-950/40 rounded-xl max-h-[300px] overflow-y-auto divide-y divide-slate-850">
                {isLoadingDishes ? (
                  <div className="flex items-center justify-center py-10 gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    <span className="text-xs text-slate-500">Loading dishes directory...</span>
                  </div>
                ) : filteredDishes.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">
                    No available dishes match your filter criteria.
                  </div>
                ) : (
                  filteredDishes.map((dish: Dish) => {
                    const isSelected = selectedItemIds.includes(dish.id);
                    return (
                      <div
                        key={dish.id}
                        onClick={() => handleToggleItem(dish.id)}
                        className={`flex items-center justify-between p-3 transition-colors cursor-pointer select-none ${
                          isSelected ? 'bg-indigo-500/5 text-white' : 'hover:bg-slate-900/30 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-indigo-500" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-655" />
                          )}
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold">{dish.name}</span>
                              <span className={`h-1.5 w-1.5 rounded-full ${dish.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} title={dish.isVeg ? 'Veg' : 'Non-Veg'} />
                            </div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                              {MENU_CATEGORIES.find(c => c.value === dish.category)?.label || dish.category}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-400">₹{dish.price}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Pricing Info Card (Right Column) */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-outfit border-b border-slate-800 pb-2">
                Cost Summary
              </h3>
              <div className="space-y-3 text-xs font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Items:</span>
                  <span className="text-white font-bold">{selectedItemIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sum of Dish Prices:</span>
                  <span className="text-indigo-400 font-bold">₹{selectedDishesSum}</span>
                </div>
                <div className="flex justify-between border-t border-slate-850 pt-2 text-sm">
                  <span className="text-slate-300 font-bold">Manual Plate Price:</span>
                  <span className="text-white font-bold">₹{watch('pricePerPlate') || 0}</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex gap-2.5 text-[10px] leading-relaxed text-slate-400">
                <Info className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  Connecting dishes to a package establishes a standard menu template. The manual plate price acts as the default charge per person during booking invoices.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-650 text-white hover:bg-indigo-600 font-semibold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Saving Package...
                  </>
                ) : (
                  'Save Package'
                )}
              </button>
              <Link
                href="/menus?tab=packages"
                className="w-full text-center py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-all font-semibold text-sm cursor-pointer"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MenuPackageForm;
