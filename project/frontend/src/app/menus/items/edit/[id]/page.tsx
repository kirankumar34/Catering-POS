"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../../../store/authStore';
import api from '../../../../../lib/api';
import MenuItemForm, { MenuItemFormValues } from '../../../components/MenuItemForm';
import { LayoutDashboard, Users, Utensils, ShoppingBag, LogOut, ChevronRight, Loader2, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface PageProps {
  params: Promise<{ id: string }>;
}

const EditMenuItemPage: React.FC<PageProps> = ({ params }) => {
  const router = useRouter();
  const { id } = React.use(params);
  const { user, token, clearAuth } = useAuthStore();
  
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

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

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
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        <span className="text-sm font-medium tracking-wide">Loading Dish Parameters...</span>
      </div>
    );
  }

  if (error || !itemData) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-white gap-4">
        <p className="text-sm text-rose-500 font-semibold">Failed to fetch dish details.</p>
        <Link href="/menus?tab=dishes" className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-850">
          Back to Directory
        </Link>
      </div>
    );
  }

  const sidebarLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, active: false },
    { label: "Customers", href: "/customers", icon: Users, active: false },
    { label: "Catering Menus", href: "/menus", icon: Utensils, active: true },
    { label: "Orders", href: "/orders", icon: ShoppingBag, active: false },
    { label: "Expenses", href: "/expenses", icon: IndianRupee, active: false },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Left Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 font-outfit text-lg">
            S
          </div>
          <div className="space-y-0.5">
            <h1 className="font-bold text-sm tracking-tight text-white font-outfit uppercase">Seisuvai</h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Catering Billing</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          {sidebarLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <Link
                key={i}
                href={link.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  link.active
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 ${link.active ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                  <span>{link.label}</span>
                </div>
                {!link.active && <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-indigo-400 font-outfit">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="space-y-0.5 overflow-hidden">
              <p className="font-bold text-sm text-white truncate">{user?.username}</p>
              <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 uppercase">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800/30 transition-all duration-200 text-sm font-semibold cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
        <MenuItemForm
          title={`Edit Dish: ${itemData.name}`}
          initialValues={itemData}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          apiError={apiError}
        />
      </main>
    </div>
  );
};

export default EditMenuItemPage;
