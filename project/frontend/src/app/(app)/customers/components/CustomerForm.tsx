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
          className="p-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-foreground font-display">{title}</h2>
          <p className="text-xs text-muted-foreground">Specify details for the customer database profile.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error message */}
        {apiError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
            {apiError}
          </div>
        )}

        {/* Customer Profile Details Card */}
        <div className="card-base p-6 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-display border-b border-border pb-3">
            Primary Profile Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-semibold text-muted-foreground">Customer Name *</label>
              <input
                id="name"
                type="text"
                {...register('name')}
                placeholder="e.g. Anand Sharma"
                className={`w-full rounded-lg border bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary min-h-[44px] ${
                  errors.name ? 'border-destructive focus:border-destructive' : 'border-border'
                }`}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-xs font-semibold text-muted-foreground">Primary Phone Number *</label>
              <input
                id="phone"
                type="text"
                {...register('phone')}
                placeholder="e.g. 9876543210"
                className={`w-full rounded-lg border bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary min-h-[44px] ${
                  errors.phone ? 'border-destructive focus:border-destructive' : 'border-border'
                }`}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            {/* Alternate Phone Number */}
            <div className="space-y-2">
              <label htmlFor="altPhone" className="text-xs font-semibold text-muted-foreground">Alternate Phone Number</label>
              <input
                id="altPhone"
                type="text"
                {...register('altPhone')}
                placeholder="e.g. 9876543211"
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary min-h-[44px]"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <input
                id="email"
                type="text"
                {...register('email')}
                placeholder="e.g. customer@domain.com"
                className={`w-full rounded-lg border bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary min-h-[44px] ${
                  errors.email ? 'border-destructive focus:border-destructive' : 'border-border'
                }`}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {/* GST Number */}
            <div className="space-y-2">
              <label htmlFor="gstNumber" className="text-xs font-semibold text-muted-foreground">GST Number</label>
              <input
                id="gstNumber"
                type="text"
                {...register('gstNumber')}
                placeholder="e.g. 33AAAAA1111A1Z1"
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary min-h-[44px]"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-xs font-semibold text-muted-foreground">Special Notes / Preferences</label>
            <textarea
              id="notes"
              rows={3}
              {...register('notes')}
              placeholder="e.g. Prefers spicy starters, vegetarian food guidelines, VIP decoration expectations..."
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Addresses Section */}
        <div className="card-base p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-display">
              Addresses & Locations
            </h3>
            <button
              type="button"
              onClick={() => append({ address: '', location: '', isDefault: fields.length === 0 })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 text-primary bg-primary/5 hover:border-primary/50 hover:bg-primary/10 text-xs font-bold transition-all cursor-pointer min-h-[44px]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Address
            </button>
          </div>

          {errors.addresses && typeof errors.addresses.message === 'string' && (
            <p className="text-xs text-destructive">{errors.addresses.message}</p>
          )}

          <div className="space-y-6">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative rounded-lg border border-border bg-secondary/20 p-4 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-primary uppercase">Address #{index + 1}</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={watch(`addresses.${index}.isDefault`)}
                        onChange={() => handleSetDefaultAddress(index)}
                        className="rounded border-border bg-card text-primary focus:ring-0 focus:ring-offset-0 h-4.5 w-4.5 cursor-pointer"
                      />
                      Set Default
                    </label>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-destructive/90 p-1.5 cursor-pointer min-h-[44px] flex items-center justify-center"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Address Details *</label>
                    <input
                      type="text"
                      {...register(`addresses.${index}.address` as const)}
                      placeholder="e.g. Flat 301, Lakeview Residency, Anna Nagar"
                      className={`w-full rounded-lg border bg-card px-4 py-2.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary min-h-[44px] ${
                        errors.addresses?.[index]?.address ? 'border-destructive' : 'border-border'
                      }`}
                    />
                    {errors.addresses?.[index]?.address && (
                      <p className="text-[10px] text-destructive">{errors.addresses[index].address.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Location / GPS (Optional)</label>
                    <input
                      type="text"
                      {...register(`addresses.${index}.location` as const)}
                      placeholder="e.g. 13.0827, 80.2707"
                      className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary min-h-[44px]"
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
            className="flex-1 text-center py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-semibold text-sm cursor-pointer min-h-[44px] flex items-center justify-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-accent font-semibold text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
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
