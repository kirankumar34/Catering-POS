"use client";

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits.'),
  altPhone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  gstNumber: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  addresses: z.array(
    z.object({
      id: z.string().optional(),
      address: z.string().min(5, 'Address details must be at least 5 characters.'),
      location: z.string().optional().or(z.literal('')),
      isDefault: z.boolean(),
    })
  ).min(1, 'Please register at least one contact address.'),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialValues?: Partial<CustomerFormValues>;
  onSubmit: (values: CustomerFormValues) => void;
  isSubmitting: boolean;
  apiError?: string | null;
  title: string;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  apiError,
  title,
}) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialValues?.name || '',
      phone: initialValues?.phone || '',
      altPhone: initialValues?.altPhone || '',
      email: initialValues?.email || '',
      gstNumber: initialValues?.gstNumber || '',
      notes: initialValues?.notes || '',
      addresses: initialValues?.addresses && initialValues.addresses.length > 0
        ? initialValues.addresses
        : [{ address: '', location: '', isDefault: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'addresses',
  });

  const handleSetDefaultAddress = (index: number) => {
    fields.forEach((_, i) => {
      setValue(`addresses.${i}.isDefault`, i === index);
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customers"
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-white font-outfit">{title}</h2>
          <p className="text-xs text-slate-400">Specify details for the customer database profile.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error message */}
        {apiError && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-semibold text-rose-400">
            {apiError}
          </div>
        )}

        {/* Customer Profile Details Card */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-xl space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-outfit border-b border-slate-800 pb-3">
            Primary Profile Info
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-semibold text-slate-300">Customer Name *</label>
              <input
                id="name"
                type="text"
                {...register('name')}
                placeholder="e.g. Anand Sharma"
                className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  errors.name ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-xs font-semibold text-slate-300">Primary Phone Number *</label>
              <input
                id="phone"
                type="text"
                {...register('phone')}
                placeholder="e.g. 9876543210"
                className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  errors.phone ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800'
                }`}
              />
              {errors.phone && <p className="text-xs text-rose-500">{errors.phone.message}</p>}
            </div>

            {/* Alternate Phone Number */}
            <div className="space-y-2">
              <label htmlFor="altPhone" className="text-xs font-semibold text-slate-300">Alternate Phone Number</label>
              <input
                id="altPhone"
                type="text"
                {...register('altPhone')}
                placeholder="e.g. 9876543211"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-slate-300">Email Address</label>
              <input
                id="email"
                type="text"
                {...register('email')}
                placeholder="e.g. customer@domain.com"
                className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800'
                }`}
              />
              {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
            </div>

            {/* GST Number */}
            <div className="space-y-2">
              <label htmlFor="gstNumber" className="text-xs font-semibold text-slate-300">GST Number</label>
              <input
                id="gstNumber"
                type="text"
                {...register('gstNumber')}
                placeholder="e.g. 33AAAAA1111A1Z1"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-xs font-semibold text-slate-300">Special Notes / Preferences</label>
            <textarea
              id="notes"
              rows={3}
              {...register('notes')}
              placeholder="e.g. Prefers spicy starters, vegetarian food guidelines, VIP decoration expectations..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Addresses Section */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-outfit">
              Addresses & Locations
            </h3>
            <button
              type="button"
              onClick={() => append({ address: '', location: '', isDefault: fields.length === 0 })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/20 text-indigo-400 bg-indigo-500/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Address
            </button>
          </div>

          {errors.addresses && typeof errors.addresses.message === 'string' && (
            <p className="text-xs text-rose-500">{errors.addresses.message}</p>
          )}

          <div className="space-y-6">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-400 uppercase">Address #{index + 1}</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={watch(`addresses.${index}.isDefault`)}
                        onChange={() => handleSetDefaultAddress(index)}
                        className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                      />
                      Set Default
                    </label>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Address Details *</label>
                    <input
                      type="text"
                      {...register(`addresses.${index}.address` as const)}
                      placeholder="e.g. Flat 301, Lakeview Residency, Anna Nagar"
                      className={`w-full rounded-xl border bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none ${
                        errors.addresses?.[index]?.address ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {errors.addresses?.[index]?.address && (
                      <p className="text-[10px] text-rose-500">{errors.addresses[index].address.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Location / GPS (Optional)</label>
                    <input
                      type="text"
                      {...register(`addresses.${index}.location` as const)}
                      placeholder="e.g. 13.0827, 80.2707"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/customers"
            className="flex-1 text-center py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-all font-semibold text-sm cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-650 text-white hover:bg-indigo-600 font-semibold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                Saving Profile...
              </>
            ) : (
              'Save Customer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
