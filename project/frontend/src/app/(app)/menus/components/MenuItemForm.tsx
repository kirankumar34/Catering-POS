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
          className="p-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-foreground font-display">{title}</h2>
          <p className="text-xs text-muted-foreground">Configure parameters for this item in the catering directory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error message */}
        {apiError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
            {apiError}
          </div>
        )}

        {/* Form Container */}
        <div className="card-base p-6 space-y-6">
          {/* Dish Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-semibold text-muted-foreground">Item Name *</label>
            <input
              id="name"
              type="text"
              {...register('name')}
              placeholder="e.g. Gobi Manchurian Dry"
              className={`w-full rounded-lg border bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary min-h-[44px] ${
                errors.name ? 'border-destructive focus:border-destructive' : 'border-border'
              }`}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Grid fields: Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category Select */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-xs font-semibold text-muted-foreground">Category *</label>
              <select
                id="category"
                {...register('category')}
                className={`w-full rounded-lg border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px] ${
                  errors.category ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="">Select Category</option>
                {MENU_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>

            {/* Price Per Plate/Item */}
            <div className="space-y-2">
              <label htmlFor="price" className="text-xs font-semibold text-muted-foreground">Unit Price (₹) *</label>
              <input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="0"
                className={`w-full rounded-lg border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px] ${
                  errors.price ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
          </div>

          {/* Switch fields: Veg/Non-Veg & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border pt-5">
            {/* Veg / Non-Veg Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-muted-foreground">Vegetarian Dish</span>
                <p className="text-[10px] text-muted-foreground">Toggle off for non-veg ingredients</p>
              </div>
              <button
                type="button"
                onClick={() => setValue('isVeg', !isVegWatch)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isVegWatch ? 'bg-success' : 'bg-secondary'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow ring-0 transition duration-200 ease-in-out ${
                    isVegWatch ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
              </button>
            </div>

            {/* Available Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-muted-foreground">In Stock / Available</span>
                <p className="text-[10px] text-muted-foreground">Unlist temporarily if out of stock</p>
              </div>
              <button
                type="button"
                onClick={() => setValue('available', !availableWatch)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  availableWatch ? 'bg-primary' : 'bg-secondary'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow ring-0 transition duration-200 ease-in-out ${
                    availableWatch ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 border-t border-border pt-5">
            <label htmlFor="description" className="text-xs font-semibold text-muted-foreground">Description (Optional)</label>
            <textarea
              id="description"
              rows={3}
              {...register('description')}
              placeholder="e.g. Crisp fried paneer cubes tossed in spicy and sweet chili garlic sauce..."
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/menus?tab=dishes"
            className="flex-1 text-center py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-semibold text-sm cursor-pointer min-h-[44px] flex items-center justify-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-accent font-semibold text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
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
