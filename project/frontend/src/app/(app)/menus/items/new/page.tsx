"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../../../store/authStore';
import api from '../../../../../lib/api';
import MenuItemForm, { MenuItemFormValues } from '../../components/MenuItemForm';
import axios from 'axios';

const NewMenuItemPage = () => {
  const router = useRouter();
  const { token } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const onSubmit = async (values: MenuItemFormValues) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const payload = {
        ...values,
        description: values.description || undefined,
      };

      await api.post('/menu-items', payload);
      router.push('/menus?tab=dishes');
    } catch (err) {
      console.error('Create item error:', err);
      if (axios.isAxiosError(err) && err.response?.data) {
        setApiError(err.response.data.message || 'Failed to register menu item.');
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
    <div className="p-6 md:p-8 max-w-xl mx-auto">
      <MenuItemForm
        title="Register New Menu Dish"
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        apiError={apiError}
      />
    </div>
  );
};

export default NewMenuItemPage;
