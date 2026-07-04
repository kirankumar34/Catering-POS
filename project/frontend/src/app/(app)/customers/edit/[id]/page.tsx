"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../../../store/authStore';
import api from '../../../../../lib/api';
import CustomerForm, { CustomerFormValues } from '../../components/CustomerForm';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const EditCustomerPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { token } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  // Query customer details
  const { data: customerData, isLoading, error } = useQuery({
    queryKey: ['customerDetail', id],
    queryFn: async () => {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    },
    enabled: !!token && !!id,
  });

  const onSubmit = async (values: CustomerFormValues) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const payload = {
        ...values,
        altPhone: values.altPhone || null,
        email: values.email || null,
        gstNumber: values.gstNumber || null,
        notes: values.notes || null,
      };

      await api.put(`/customers/${id}`, payload);
      router.push(`/customers/${id}`);
    } catch (err) {
      console.error('Update customer error:', err);
      if (axios.isAxiosError(err) && err.response?.data) {
        setApiError(err.response.data.message || 'Failed to update customer.');
      } else {
        setApiError('Unable to connect to database server. Is the backend running?');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm font-medium tracking-wide">Loading Customer Details...</span>
      </div>
    );
  }

  if (error || !customerData) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground gap-4">
        <p className="text-sm text-destructive font-semibold">Failed to fetch customer profile records.</p>
        <Link href="/customers" className="px-4 py-2 bg-card border border-border text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer">
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <CustomerForm
        title={`Edit Profile: ${customerData.name}`}
        initialValues={customerData}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        apiError={apiError}
      />
    </div>
  );
};

export default EditCustomerPage;
