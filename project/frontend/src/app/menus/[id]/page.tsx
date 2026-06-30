"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import { MENU_CATEGORIES } from '../components/MenuItemForm';
import {
  LayoutDashboard,
  Users,
  Utensils,
  ShoppingBag,
  LogOut,
  ChevronRight,
  Loader2,
  IndianRupee,
  Edit2,
  ArrowLeft,
  Info,
  CheckCircle,
  HelpCircle,
  Plus
} from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

const MenuPackageDetailPage: React.FC<PageProps> = ({ params }) => {
  const router = useRouter();
  const { id } = React.use(params);
  const { user, token, clearAuth } = useAuthStore();

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

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!token) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        <span className="text-sm font-medium tracking-wide">Loading Package Details...</span>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-white gap-4">
        <p className="text-sm text-rose-500 font-semibold">Failed to fetch menu package details.</p>
        <Link href="/menus" className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-850">
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

  const sidebarLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, active: false },
    { label: "Customers", href: "/customers", icon: Users, active: false },
    { label: "Catering Menus", href: "/menus", icon: Utensils, active: true },
    { label: "Orders", href: "/orders", icon: ShoppingBag, active: false },
    { label: "Expenses", href: "/expenses", icon: IndianRupee, active: false },
  ];

  interface MenuItem {
    id: string;
    name: string;
    category: string;
    isVeg: boolean;
    price: number;
    description?: string;
    available: boolean;
  }

  // Group items by category
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
        {/* Header Navigation */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800/40 pb-5">
          <div className="flex items-center gap-4">
            <Link
              href="/menus?tab=packages"
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-outfit">{menu.name}</h2>
              <span className={`inline-block px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold border uppercase ${
                menu.status
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-slate-800 border-slate-700 text-slate-400"
              }`}>
                {menu.status ? 'Active Template' : 'Inactive Template'}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/menus/edit/${menu.id}`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit Package</span>
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400">Manual Plate Charge</p>
              <p className="text-2xl font-bold text-white font-outfit">{formatCurrency(menu.pricePerPlate)}</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
              <IndianRupee className="h-5.5 w-5.5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400">Total Items Linked</p>
              <p className="text-2xl font-bold text-white font-outfit">{items.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-slate-300">
              <Utensils className="h-5.5 w-5.5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400">Classification</p>
              <p className="text-sm font-bold text-white mt-1.5 font-outfit flex items-center gap-2">
                <span className="text-emerald-400">{vegCount} Veg</span>
                <span className="text-slate-655">•</span>
                <span className="text-rose-400">{nonVegCount} Non-Veg</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
              <CheckCircle className="h-5.5 w-5.5" />
            </div>
          </div>
        </div>

        {/* Description card */}
        {menu.description && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5 space-y-2">
            <h3 className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Package Description
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{menu.description}</p>
          </div>
        )}

        {/* Categorized items sections list */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white font-outfit border-b border-slate-800 pb-3">
            Menu Package Composition
          </h3>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-slate-850 bg-slate-950/40 p-12 text-center text-slate-500 space-y-3">
              <HelpCircle className="h-10 w-10 text-slate-700 mx-auto stroke-[1.5]" />
              <p className="text-sm font-semibold">No dishes connected to this package template.</p>
              <Link href={`/menus/edit/${menu.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/20 text-indigo-400 bg-indigo-500/5 hover:border-indigo-500/50 text-xs font-bold transition-all">
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
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-outfit">
                        {cat.label} ({catItems.length})
                      </h4>
                      <div className="h-[1px] bg-slate-850 flex-1" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {catItems.map((item: MenuItem) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-slate-850 bg-slate-900/30 p-4 space-y-2 flex flex-col justify-between"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-slate-200">{item.name}</span>
                              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            </div>
                            {item.description && (
                              <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-[10px] pt-2 border-t border-slate-850/60 mt-2">
                            <span className="text-slate-500">Unit Price</span>
                            <span className="font-bold text-slate-300">₹{item.price}</span>
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
      </main>
    </div>
  );
};

export default MenuPackageDetailPage;
