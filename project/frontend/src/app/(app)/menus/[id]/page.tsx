"use client";

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../../store/authStore';
import api from '../../../../lib/api';
import { MENU_CATEGORIES } from '../components/MenuItemForm';
import {
  Loader2,
  IndianRupee,
  Edit2,
  ArrowLeft,
  Info,
  CheckCircle,
  HelpCircle,
  Plus,
  Utensils
} from 'lucide-react';
import Link from 'next/link';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  isVeg: boolean;
  price: number;
  description?: string;
  available: boolean;
}

const MenuPackageDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  // Query package details
  const { data: menu, isLoading, error } = useQuery({
    queryKey: ['menuPackageDetail', id],
    queryFn: async () => {
      const response = await api.get(`/menus/${id}`);
      return response.data;
    },
    enabled: !!token && !!id,
  });

  if (!token) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm font-medium tracking-wide">Loading Package Details...</span>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground gap-4">
        <p className="text-sm text-destructive font-semibold">Failed to fetch menu package details.</p>
        <Link href="/menus" className="px-4 py-2 bg-card border border-border text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer">
          Back to Directory
        </Link>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const items = (menu.items || []) as MenuItem[];
  const vegCount = items.filter((item: MenuItem) => item.isVeg).length;
  const nonVegCount = items.length - vegCount;

  // Grouped structure
  const groupedItems: { [category: string]: MenuItem[] } = {};
  items.forEach((item: MenuItem) => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Navigation */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/menus?tab=packages"
            className="p-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-display">{menu.name}</h2>
            <span className={`inline-block px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold border uppercase ${
              menu.status
                ? "bg-success/8 border-success/20 text-success"
                : "bg-secondary border-border text-muted-foreground"
            }`}>
              {menu.status ? 'Active Template' : 'Inactive Template'}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/menus/edit/${menu.id}`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-accent text-primary-foreground font-semibold text-sm transition-colors shadow-sm cursor-pointer min-h-[44px]"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit Package</span>
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-base p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Manual Plate Charge</p>
            <p className="text-2xl font-bold text-foreground font-display">{formatCurrency(menu.pricePerPlate)}</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/8 text-primary border border-primary/20">
            <IndianRupee className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="card-base p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Items Linked</p>
            <p className="text-2xl font-bold text-foreground font-display">{items.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary border border-border text-foreground">
            <Utensils className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="card-base p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Classification</p>
            <p className="text-sm font-bold text-foreground mt-1.5 font-display flex items-center gap-2">
              <span className="text-success">{vegCount} Veg</span>
              <span className="text-border">•</span>
              <span className="text-destructive">{nonVegCount} Non-Veg</span>
            </p>
          </div>
          <div className="p-3 rounded-lg bg-success/8 text-success border border-success/20">
            <CheckCircle className="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      {/* Description card */}
      {menu.description && (
        <div className="card-base p-5 space-y-2">
          <h3 className="text-xs font-bold text-primary uppercase flex items-center gap-1.5 font-display">
            <Info className="h-3.5 w-3.5" />
            Package Description
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{menu.description}</p>
        </div>
      )}

      {/* Categorized items sections list */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-foreground font-display border-b border-border pb-3">
          Menu Package Composition
        </h3>

        {items.length === 0 ? (
          <div className="card-base p-12 text-center text-muted-foreground space-y-3">
            <HelpCircle className="h-10 w-10 text-muted-foreground/35 mx-auto stroke-[1.5]" />
            <p className="text-sm font-semibold">No dishes connected to this package template.</p>
            <Link href={`/menus/edit/${menu.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 text-primary bg-primary/5 hover:border-primary/50 text-xs font-bold transition-all cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
              Select Dishes Now
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {MENU_CATEGORIES.map(cat => {
              const catItems = groupedItems[cat.value] || [];
              if (catItems.length === 0) return null;
              return (
                <div key={cat.value} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary font-display">
                      {cat.label} ({catItems.length})
                    </h4>
                    <div className="h-[1px] bg-border flex-1" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catItems.map((item: MenuItem) => (
                      <div
                        key={item.id}
                        className="card-base p-4 space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-foreground">{item.name}</span>
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${item.isVeg ? 'bg-success' : 'bg-destructive'}`} />
                          </div>
                          {item.description && (
                            <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-[10px] pt-2 border-t border-border mt-2">
                          <span className="text-muted-foreground">Unit Price</span>
                          <span className="font-bold text-foreground">₹{item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPackageDetailPage;
