"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { MENU_CATEGORIES } from './components/MenuItemForm';
import {
  LayoutDashboard,
  Users,
  Utensils,
  ShoppingBag,
  IndianRupee,
  LogOut,
  ChevronRight,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  X,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface MenuPackageListEntry {
  id: string;
  name: string;
  description?: string;
  pricePerPlate: number;
  status: boolean;
  _count: {
    items: number;
    orders: number;
  };
}

interface MenuItemListEntry {
  id: string;
  name: string;
  category: string;
  isVeg: boolean;
  price: number;
  description?: string;
  available: boolean;
}

const MenusPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user, token, clearAuth } = useAuthStore();

  // Tab State: 'packages' or 'dishes'
  const [activeTab, setActiveTab] = useState<'packages' | 'dishes'>('packages');

  // Search & Filters State
  const [pkgSearch, setPkgSearch] = useState('');
  const [pkgStatusFilter, setPkgStatusFilter] = useState('');
  const [pkgPage, setPkgPage] = useState(1);

  const [dishSearch, setDishSearch] = useState('');
  const [dishCategoryFilter, setDishCategoryFilter] = useState('');
  const [dishPage, setDishPage] = useState(1);

  // Deletion modals state
  const [deletePkgId, setDeletePkgId] = useState<string | null>(null);
  const [deletePkgError, setDeletePkgError] = useState<string | null>(null);
  
  const [deleteDishId, setDeleteDishId] = useState<string | null>(null);
  const [deleteDishError, setDeleteDishError] = useState<string | null>(null);

  // Read initial tab from query param ?tab=dishes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'dishes' || tabParam === 'packages') {
      setActiveTab(tabParam as 'packages' | 'dishes');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  // Query predefined menu packages
  const { data: packagesData, isLoading: isLoadingPkgs } = useQuery({
    queryKey: ['menuPackagesList', pkgSearch, pkgStatusFilter, pkgPage],
    queryFn: async () => {
      const response = await api.get('/menus', {
        params: {
          search: pkgSearch,
          status: pkgStatusFilter,
          page: pkgPage,
          limit: 8,
        },
      });
      return response.data;
    },
    enabled: !!token && activeTab === 'packages',
  });

  // Query individual dishes (menu items)
  const { data: dishesData, isLoading: isLoadingDishes } = useQuery({
    queryKey: ['menuItemsList', dishSearch, dishCategoryFilter, dishPage],
    queryFn: async () => {
      const response = await api.get('/menu-items', {
        params: {
          search: dishSearch,
          category: dishCategoryFilter,
          page: dishPage,
          limit: 10,
        },
      });
      return response.data;
    },
    enabled: !!token && activeTab === 'dishes',
  });

  // Mutation to delete a package
  const deletePkgMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/menus/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuPackagesList'] });
      setDeletePkgId(null);
      setDeletePkgError(null);
    },
    onError: (err) => {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.data) {
        setDeletePkgError(err.response.data.message || 'Failed to delete package.');
      } else {
        setDeletePkgError('Failed to connect to server.');
      }
    },
  });

  // Mutation to delete a dish
  const deleteDishMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/menu-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItemsList'] });
      setDeleteDishId(null);
      setDeleteDishError(null);
    },
    onError: (err) => {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.data) {
        setDeleteDishError(err.response.data.message || 'Failed to delete dish.');
      } else {
        setDeleteDishError('Failed to connect to server.');
      }
    },
  });

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!token) {
    return null;
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
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800/40 pb-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white font-outfit">Catering Menu Management</h2>
            <p className="text-sm text-slate-400">Configure predefined packages and maintain the individual dishes repository.</p>
          </div>
          <div className="flex gap-3">
            {activeTab === 'packages' ? (
              <Link
                href="/menus/new"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer animate-fade-in"
              >
                <Plus className="h-4 w-4" />
                <span>Create Package</span>
              </Link>
            ) : (
              <Link
                href="/menus/items/new"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer animate-fade-in"
              >
                <Plus className="h-4 w-4" />
                <span>Register Dish</span>
              </Link>
            )}
          </div>
        </header>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'packages'
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Menu Packages
          </button>
          <button
            onClick={() => setActiveTab('dishes')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'dishes'
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Dish Directory
          </button>
        </div>

        {/* Dynamic Tab Contents */}
        {activeTab === 'packages' ? (
          <div className="space-y-6">
            {/* Packages Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/40 border border-slate-850 p-4 rounded-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  value={pkgSearch}
                  onChange={(e) => {
                    setPkgSearch(e.target.value);
                    setPkgPage(1);
                  }}
                  placeholder="Search packages by name or description..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/60 pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-655 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2 sm:w-48">
                <Filter className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                <select
                  value={pkgStatusFilter}
                  onChange={(e) => {
                    setPkgStatusFilter(e.target.value);
                    setPkgPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active Packages</option>
                  <option value="inactive">Inactive Packages</option>
                </select>
              </div>
            </div>

            {/* Packages Table/Grid */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg">
              {isLoadingPkgs ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
                  <span className="text-xs text-slate-400">Loading menu packages...</span>
                </div>
              ) : !packagesData?.data || packagesData.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <Utensils className="h-12 w-12 text-slate-600 stroke-[1.2]" />
                  <p className="text-sm font-semibold text-slate-400">No Packages Registered</p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Predefined packages act as billing templates. Create one to link dishes and set pricing.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {packagesData.data.map((pkg: MenuPackageListEntry) => (
                      <div
                        key={pkg.id}
                        className={`rounded-2xl border p-5 space-y-4 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden bg-slate-900/10 hover:border-slate-700/60 group ${
                          !pkg.status ? 'opacity-60 border-slate-900/60' : 'border-slate-850'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors font-outfit text-base leading-tight">
                              {pkg.name}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 ${
                              pkg.status
                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                : "bg-slate-800 border border-slate-700 text-slate-400"
                            }`}>
                              {pkg.status ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px] leading-relaxed">
                            {pkg.description || <span className="italic text-slate-655">No description</span>}
                          </p>
                        </div>

                        <div className="space-y-4 pt-3 border-t border-slate-850/60">
                          <div className="flex justify-between items-center text-xs">
                            <div className="space-y-0.5">
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Plate Price</p>
                              <p className="text-sm font-bold text-white font-outfit">{formatCurrency(pkg.pricePerPlate)}</p>
                            </div>
                            <div className="space-y-0.5 text-right">
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Dishes Linked</p>
                              <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300">
                                {pkg._count.items} Items
                              </span>
                            </div>
                          </div>

                          {/* Package Card Actions */}
                          <div className="flex gap-2 pt-1.5 border-t border-slate-850/40">
                            <Link
                              href={`/menus/${pkg.id}`}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white transition-all text-xs font-semibold"
                              title="View Package Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>View</span>
                            </Link>
                            <Link
                              href={`/menus/edit/${pkg.id}`}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white transition-all text-xs font-semibold"
                              title="Edit Package"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </Link>
                            {(user?.role === 'SUPER_ADMIN' || user?.role === 'OWNER') && (
                              <button
                                onClick={() => {
                                  setDeletePkgId(pkg.id);
                                  setDeletePkgError(null);
                                }}
                                className="p-2 rounded-lg border border-slate-800 hover:border-rose-900/40 bg-slate-900/60 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                                title="Delete Package"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {packagesData.meta.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-850 pt-4">
                      <span className="text-xs text-slate-400">
                        Showing Page {pkgPage} of {packagesData.meta.totalPages} ({packagesData.meta.total} Packages)
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPkgPage(prev => Math.max(1, prev - 1))}
                          disabled={pkgPage === 1}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          Prev
                        </button>
                        <button
                          onClick={() => setPkgPage(prev => Math.min(packagesData.meta.totalPages, prev + 1))}
                          disabled={pkgPage === packagesData.meta.totalPages}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer"
                        >
                          Next
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Dishes (Menu Items) Tab Content
          <div className="space-y-6 animate-fade-in">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/40 border border-slate-850 p-4 rounded-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  value={dishSearch}
                  onChange={(e) => {
                    setDishSearch(e.target.value);
                    setDishPage(1);
                  }}
                  placeholder="Search dishes by name or description..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/60 pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-655 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2 sm:w-60">
                <Filter className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                <select
                  value={dishCategoryFilter}
                  onChange={(e) => {
                    setDishCategoryFilter(e.target.value);
                    setDishPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {MENU_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dishes Directory Table */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg">
              {isLoadingDishes ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
                  <span className="text-xs text-slate-400">Loading dishes directory...</span>
                </div>
              ) : !dishesData?.data || dishesData.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <Utensils className="h-12 w-12 text-slate-600 stroke-[1.2]" />
                  <p className="text-sm font-semibold text-slate-400">No Dishes Registered</p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    No matching dishes were found. Add items to catalog them for use in predefined packages or custom orders.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-850 text-xs font-semibold text-slate-400">
                          <th className="pb-3">Dish Name</th>
                          <th className="pb-3">Category</th>
                          <th className="pb-3">Type</th>
                          <th className="pb-3">Availability</th>
                          <th className="pb-3 text-right">Price</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-sm font-medium">
                        {dishesData.data.map((dish: MenuItemListEntry) => (
                          <tr key={dish.id} className="text-slate-300 hover:text-white transition-colors group">
                            <td className="py-4">
                              <span className="font-semibold text-white">{dish.name}</span>
                              {dish.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-xs">{dish.description}</p>}
                            </td>
                            <td className="py-4">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {MENU_CATEGORIES.find(c => c.value === dish.category)?.label || dish.category}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                                dish.isVeg
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                              }`}>
                                {dish.isVeg ? 'Veg' : 'Non-Veg'}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className="flex items-center gap-1.5 text-xs font-semibold">
                                {dish.available ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                                    <span className="text-emerald-400">Available</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                                    <span className="text-rose-455 text-rose-400">Unavailable</span>
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="py-4 text-right font-bold text-white">{formatCurrency(dish.price)}</td>
                            <td className="py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Link
                                  href={`/menus/items/edit/${dish.id}`}
                                  className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white transition-all"
                                  title="Edit Dish"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Link>
                                {(user?.role === 'SUPER_ADMIN' || user?.role === 'OWNER') && (
                                  <button
                                    onClick={() => {
                                      setDeleteDishId(dish.id);
                                      setDeleteDishError(null);
                                    }}
                                    className="p-1.5 rounded-lg border border-slate-800 hover:border-rose-900/40 bg-slate-900/60 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                                    title="Delete Dish"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {dishesData.meta.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-850 pt-4">
                      <span className="text-xs text-slate-400">
                        Showing Page {dishPage} of {dishesData.meta.totalPages} ({dishesData.meta.total} Dishes)
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDishPage(prev => Math.max(1, prev - 1))}
                          disabled={dishPage === 1}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          Prev
                        </button>
                        <button
                          onClick={() => setDishPage(prev => Math.min(dishesData.meta.totalPages, prev + 1))}
                          disabled={dishPage === dishesData.meta.totalPages}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer"
                        >
                          Next
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Package Deletion Confirmation Modal */}
      {deletePkgId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-850 bg-slate-900 p-6 shadow-2xl space-y-6 animate-zoom-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white font-outfit">Delete Predefined Package</h3>
                <p className="text-xs text-slate-400 mt-1">This action cannot be undone.</p>
              </div>
              <button
                onClick={() => setDeletePkgId(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {deletePkgError && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-semibold text-rose-400">
                {deletePkgError}
              </div>
            )}

            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to delete this catering package? It will unlink all associated dishes. You cannot delete packages that are linked to historical billing bookings.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setDeletePkgId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/30 transition-all font-semibold text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => deletePkgMutation.mutate(deletePkgId)}
                disabled={deletePkgMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-650 hover:bg-rose-600 text-white font-semibold text-sm transition-all shadow-md shadow-rose-600/10 cursor-pointer disabled:opacity-50"
              >
                {deletePkgMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Deleting...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dish Deletion Confirmation Modal */}
      {deleteDishId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-850 bg-slate-900 p-6 shadow-2xl space-y-6 animate-zoom-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white font-outfit">Delete Dish Record</h3>
                <p className="text-xs text-slate-400 mt-1">This action cannot be undone.</p>
              </div>
              <button
                onClick={() => setDeleteDishId(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {deleteDishError && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-semibold text-rose-400">
                {deleteDishError}
              </div>
            )}

            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete this dish from the menu directory? Note that dishes used in orders cannot be deleted. If you only want to stop listing this item, consider toggling it as unavailable.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setDeleteDishId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/30 transition-all font-semibold text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteDishMutation.mutate(deleteDishId)}
                disabled={deleteDishMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-650 hover:bg-rose-600 text-white font-semibold text-sm transition-all shadow-md shadow-rose-600/10 cursor-pointer disabled:opacity-50"
              >
                {deleteDishMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Deleting...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function MenusPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        <span className="text-sm font-medium tracking-wide">Loading Menus...</span>
      </div>
    }>
      <MenusPageContent />
    </Suspense>
  );
}
