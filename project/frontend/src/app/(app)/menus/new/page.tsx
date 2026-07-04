"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../../store/authStore';
import api from '../../../../lib/api';
import MenuPackageForm, { MenuFormValues } from '../components/MenuPackageForm';
import axios from 'axios';

const NewMenuPackagePage = () => {
  const router = useRouter();
  const { token } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const onSubmit = async (values: MenuFormValues) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const payload = {
        ...values,
        description: values.description || undefined,
      };

      await api.post('/menus', payload);
      router.push('/menus?tab=packages');
    } catch (err) {
      console.error('Create package error:', err);
      if (axios.isAxiosError(err) && err.response?.data) {
        setApiError(err.response.data.message || 'Failed to create menu package.');
      } else {
        setApiError('Unable to connect to database server.');
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
      <MenuPackageForm
        title="Create Predefined Menu Package"
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        apiError={apiError}
      />
    </div>
  );
};

export default NewMenuPackagePage;
