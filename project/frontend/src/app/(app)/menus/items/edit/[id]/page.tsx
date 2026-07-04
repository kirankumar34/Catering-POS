"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../../../../store/authStore';
import api from '../../../../../../lib/api';
import MenuItemForm, { MenuItemFormValues } from '../../../components/MenuItemForm';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const EditMenuItemPage = () => {
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

  // Query dish details
  const { data: itemData, isLoading, error } = useQuery({
    queryKey: ['menuItemDetail', id],
    queryFn: async () => {
      const response = await api.get(`/menu-items/${id}`);
      return response.data;
    },
    enabled: !!token && !!id,
  });

  const onSubmit = async (values: MenuItemFormValues) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const payload = {
        ...values,
        description: values.description || null,
      };

      await api.put(`/menu-items/${id}`, payload);
      router.push('/menus?tab=dishes');
    } catch (err) {
      console.error('Update item error:', err);
      if (axios.isAxiosError(err) && err.response?.data) {
        setApiError(err.response.data.message || 'Failed to update dish details.');
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

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm font-medium tracking-wide">Loading Dish Parameters...</span>
      </div>
    );
  }

  if (error || !itemData) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground gap-4">
        <p className="text-sm text-destructive font-semibold">Failed to fetch dish details.</p>
        <Link href="/menus?tab=dishes" className="px-4 py-2 bg-card border border-border text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer">
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-xl mx-auto">
      <MenuItemForm
        title={`Edit Dish: ${itemData.name}`}
        initialValues={itemData}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        apiError={apiError}
      />
    </div>
  );
};

export default EditMenuItemPage;
