"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  category: z.string().min(1, 'Please select a category.'),
  isVeg: z.boolean(),
  price: z.number().min(0, 'Price must be 0 or greater.'),
  description: z.string().optional().or(z.literal('')),
  available: z.boolean(),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;

export const MENU_CATEGORIES = [
  { value: 'WELCOME_DRINK', label: 'Welcome Drink' },
  { value: 'SOUP', label: 'Soup' },
  { value: 'STARTER', label: 'Starter' },
  { value: 'SWEET', label: 'Sweet' },
  { value: 'MAIN_COURSE', label: 'Main Course' },
  { value: 'RICE', label: 'Rice / Biryani' },
  { value: 'BREAD', label: 'Bread / Roti' },
  { value: 'GRAVY', label: 'Gravy / Curry' },
  { value: 'SIDE_DISH', label: 'Side Dish' },
  { value: 'DESSERT', label: 'Dessert' },
  { value: 'ICE_CREAM', label: 'Ice Cream' },
  { value: 'FRUIT', label: 'Fruit' },
  { value: 'BEVERAGE', label: 'Beverage' },
  { value: 'EXTRAS', label: 'Extras' },
  { value: 'LIVE_COUNTER', label: 'Live Counter' },
  { value: 'SPECIAL_ITEMS', label: 'Special Items' },
];

interface MenuItemFormProps {
  initialValues?: Partial<MenuItemFormValues>;
  onSubmit: (values: MenuItemFormValues) => void;
  isSubmitting: boolean;
  apiError?: string | null;
  title: string;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({
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
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: initialValues?.name || '',
      category: initialValues?.category || '',
      isVeg: initialValues?.isVeg !== undefined ? initialValues.isVeg : true,
      price: initialValues?.price || 0,
      description: initialValues?.description || '',
      available: initialValues?.available !== undefined ? initialValues.available : true,
    },
  });

  const isVegWatch = watch('isVeg');
  const availableWatch = watch('available');

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/menus?tab=dishes"
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-white font-outfit">{title}</h2>
          <p className="text-xs text-slate-400">Configure parameters for this item in the catering directory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error message */}
        {apiError && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-semibold text-rose-400">
            {apiError}
          </div>
        )}

        {/* Form Container */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-xl space-y-6">
          {/* Dish Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-semibold text-slate-300">Item Name *</label>
            <input
              id="name"
              type="text"
              {...register('name')}
              placeholder="e.g. Gobi Manchurian Dry"
              className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                errors.name ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
          </div>

          {/* Grid fields: Category & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Select */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-xs font-semibold text-slate-300">Category *</label>
              <select
                id="category"
                {...register('category')}
                className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  errors.category ? 'border-rose-500' : 'border-slate-800'
                }`}
              >
                <option value="">Select Category</option>
                {MENU_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-rose-500">{errors.category.message}</p>}
            </div>

            {/* Price Per Plate/Item */}
            <div className="space-y-2">
              <label htmlFor="price" className="text-xs font-semibold text-slate-300">Unit Price (₹) *</label>
              <input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="0"
                className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  errors.price ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {errors.price && <p className="text-xs text-rose-500">{errors.price.message}</p>}
            </div>
          </div>

          {/* Switch fields: Veg/Non-Veg & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-800/80 pt-5">
            {/* Veg / Non-Veg Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800/60 bg-slate-950/20">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-300">Vegetarian Dish</span>
                <p className="text-[10px] text-slate-500">Toggle off for non-veg ingredients</p>
              </div>
              <button
                type="button"
                onClick={() => setValue('isVeg', !isVegWatch)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isVegWatch ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isVegWatch ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Available Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800/60 bg-slate-950/20">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-300">In Stock / Available</span>
                <p className="text-[10px] text-slate-500">Unlist temporarily if out of stock</p>
              </div>
              <button
                type="button"
                onClick={() => setValue('available', !availableWatch)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  availableWatch ? 'bg-indigo-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    availableWatch ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 border-t border-slate-800/80 pt-5">
            <label htmlFor="description" className="text-xs font-semibold text-slate-300">Description (Optional)</label>
            <textarea
              id="description"
              rows={3}
              {...register('description')}
              placeholder="e.g. Crisp fried paneer cubes tossed in spicy and sweet chili garlic sauce..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/menus?tab=dishes"
            className="flex-1 text-center py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-all font-semibold text-sm cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-650 text-white hover:bg-indigo-600 font-semibold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                Saving Dish...
              </>
            ) : (
              'Save Dish'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuItemForm;
