"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../../store/authStore';
import api from '../../../../lib/api';
import CustomerForm, { CustomerFormValues } from '../components/CustomerForm';
import axios from 'axios';

const NewCustomerPage = () => {
  const router = useRouter();
  const { token } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const onSubmit = async (values: CustomerFormValues) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const payload = {
        ...values,
        altPhone: values.altPhone || undefined,
        email: values.email || undefined,
        gstNumber: values.gstNumber || undefined,
        notes: values.notes || undefined,
      };

      await api.post('/customers', payload);
      router.push('/customers');
    } catch (err) {
      console.error('Create customer error:', err);
      if (axios.isAxiosError(err) && err.response?.data) {
        setApiError(err.response.data.message || 'Failed to register customer.');
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

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <CustomerForm
        title="Register New Customer"
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        apiError={apiError}
      />
    </div>
  );
};

export default NewCustomerPage;
