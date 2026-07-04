"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import { MENU_CATEGORIES } from './components/MenuItemForm';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Utensils
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import ResponsiveDataList, { ColumnDef, CardFieldDef } from '../../../components/ui/ResponsiveDataList';

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
  const { user, token } = useAuthStore();

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
    enabled: !!token,
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
    enabled: !!token,
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

  // Define desktop table columns for individual dishes
  const dishColumns: ColumnDef<MenuItemListEntry>[] = [
    {
      header: 'Dish Name',
      accessor: (dish) => (
        <div>
          <span className="font-semibold text-foreground">{dish.name}</span>
          {dish.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-xs">{dish.description}</p>}
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: (dish) => (
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {MENU_CATEGORIES.find(c => c.value === dish.category)?.label || dish.category}
        </span>
      ),
    },
    {
      header: 'Type',
      accessor: (dish) => (
        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
          dish.isVeg
            ? "bg-success/8 border-success/20 text-success"
            : "bg-destructive/8 border-destructive/20 text-destructive"
        }`}>
          {dish.isVeg ? 'Veg' : 'Non-Veg'}
        </span>
      ),
    },
    {
      header: 'Availability',
      accessor: (dish) => (
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          {dish.available ? (
            <>
              <CheckCircle className="h-4 w-4 text-success shrink-0" />
              <span className="text-success">Available</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-destructive shrink-0" />
              <span className="text-destructive">Unavailable</span>
            </>
          )}
        </span>
      ),
    },
    {
      header: 'Price',
      accessor: (dish) => formatCurrency(dish.price),
      className: 'text-right font-bold text-foreground',
    },
  ];

  // Define card fields for mobile view of individual dishes
  const dishCardFields: CardFieldDef<MenuItemListEntry>[] = [
    {
      label: 'Category',
      accessor: (dish) => MENU_CATEGORIES.find(c => c.value === dish.category)?.label || dish.category,
    },
    {
      label: 'Price',
      accessor: (dish) => formatCurrency(dish.price),
      variant: 'prominent',
    },
  ];

  const dishRowActions = (dish: MenuItemListEntry) => (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/menus/items/edit/${dish.id}`}
        className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors"
        title="Edit Dish"
      >
        <Edit2 className="h-4 w-4" />
      </Link>
      {(user?.role === 'SUPER_ADMIN' || user?.role === 'OWNER') && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteDishId(dish.id);
            setDeleteDishError(null);
          }}
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
          title="Delete Dish"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-display">Catering Menu Management</h2>
          <p className="text-sm text-muted-foreground">Configure predefined packages and maintain the individual dishes repository.</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'packages' ? (
            <Link
              href="/menus/new"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-accent text-primary-foreground font-semibold text-sm transition-colors shadow-sm cursor-pointer min-h-[44px]"
            >
              <Plus className="h-4 w-4" />
              <span>Create Package</span>
            </Link>
          ) : (
            <Link
              href="/menus/items/new"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-accent text-primary-foreground font-semibold text-sm transition-colors shadow-sm cursor-pointer min-h-[44px]"
            >
              <Plus className="h-4 w-4" />
              <span>Register Dish</span>
            </Link>
          )}
        </div>
      </header>

      {/* Tab Headers */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer min-h-[44px] ${
            activeTab === 'packages'
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Menu Packages
        </button>
        <button
          onClick={() => setActiveTab('dishes')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer min-h-[44px] ${
            activeTab === 'dishes'
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Dish Directory
        </button>
      </div>

      {/* Dynamic Tab Contents */}
      {activeTab === 'packages' ? (
        <div className="space-y-6">
          {/* Packages Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 bg-card border border-border p-4 rounded-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={pkgSearch}
                onChange={(e) => {
                  setPkgSearch(e.target.value);
                  setPkgPage(1);
                }}
                placeholder="Search packages by name..."
                className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary min-h-[44px]"
              />
            </div>
            <div className="flex items-center gap-2 sm:w-48">
              <Filter className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              <select
                value={pkgStatusFilter}
                onChange={(e) => {
                  setPkgStatusFilter(e.target.value);
                  setPkgPage(1);
                }}
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none min-h-[44px]"
              >
                <option value="">All Statuses</option>
                <option value="active">Active Packages</option>
                <option value="inactive">Inactive Packages</option>
              </select>
            </div>
          </div>

          {/* Packages Grid */}
          {isLoadingPkgs ? (
            <div className="card-base p-8">
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Loading menu packages...</span>
              </div>
            </div>
          ) : !packagesData?.data || packagesData.data.length === 0 ? (
            <div className="card-base p-8">
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <Utensils className="h-12 w-12 text-muted-foreground/30 stroke-[1.2]" />
                <p className="text-sm font-semibold text-muted-foreground">No Packages Registered</p>
                <p className="text-xs text-muted-foreground/75 max-w-sm">
                  Predefined packages act as billing templates. Create one to link dishes and set pricing.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {packagesData.data.map((pkg: MenuPackageListEntry) => (
                  <div
                    key={pkg.id}
                    className={`card-base p-5 space-y-4 flex flex-col justify-between transition-all duration-200 group relative ${
                      !pkg.status ? 'opacity-65' : ''
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-foreground tracking-tight group-hover:text-primary transition-colors font-display text-base leading-tight">
                          {pkg.name}
                        </h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 border ${
                          pkg.status
                            ? "bg-success/8 border-success/20 text-success"
                            : "bg-secondary border-border text-muted-foreground"
                        }`}>
                          {pkg.status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] leading-relaxed">
                        {pkg.description || <span className="italic text-muted-foreground/70">No description provided</span>}
                      </p>
                    </div>

                    <div className="space-y-4 pt-3 border-t border-border">
                      <div className="flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Plate Price</p>
                          <p className="text-sm font-bold text-foreground font-display">{formatCurrency(pkg.pricePerPlate)}</p>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Dishes Linked</p>
                          <span className="inline-block px-2 py-0.5 rounded bg-secondary text-[10px] font-bold text-foreground">
                            {pkg._count.items} Items
                          </span>
                        </div>
                      </div>

                      {/* Package Card Actions */}
                      <div className="flex gap-2 pt-1.5 border-t border-border">
                        <Link
                          href={`/menus/${pkg.id}`}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold min-h-[44px]"
                          title="View Package Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Link>
                        <Link
                          href={`/menus/edit/${pkg.id}`}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold min-h-[44px]"
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
                            className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
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
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground">
                    Page {pkgPage} of {packagesData.meta.totalPages} ({packagesData.meta.total} Packages)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPkgPage(prev => Math.max(1, prev - 1))}
                      disabled={pkgPage === 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer min-h-[44px]"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setPkgPage(prev => Math.min(packagesData.meta.totalPages, prev + 1))}
                      disabled={pkgPage === packagesData.meta.totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer min-h-[44px]"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Dishes (Menu Items) Tab Content
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 bg-card border border-border p-4 rounded-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={dishSearch}
                onChange={(e) => {
                  setDishSearch(e.target.value);
                  setDishPage(1);
                }}
                placeholder="Search dishes by name or description..."
                className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary min-h-[44px]"
              />
            </div>
            <div className="flex items-center gap-2 sm:w-60">
              <Filter className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              <select
                value={dishCategoryFilter}
                onChange={(e) => {
                  setDishCategoryFilter(e.target.value);
                  setDishPage(1);
                }}
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none min-h-[44px]"
              >
                <option value="">All Categories</option>
                {MENU_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dishes Directory Responsive List */}
          <ResponsiveDataList
            data={dishesData?.data || []}
            columns={dishColumns}
            cardTitle={(dish) => dish.name}
            cardSubtitle={(dish) => dish.isVeg ? '🟢 Vegetarian' : '🔴 Non-Vegetarian'}
            cardBadge={(dish) => (
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${dish.available ? 'bg-success/8 text-success border-success/20' : 'bg-destructive/8 text-destructive border-destructive/20'}`}>
                {dish.available ? 'Available' : 'Unavailable'}
              </span>
            )}
            cardFields={dishCardFields}
            keyExtractor={(dish) => dish.id}
            actions={dishRowActions}
            pagination={{
              total: dishesData?.meta?.total || 0,
              page: dishPage,
              totalPages: dishesData?.meta?.totalPages || 1,
            }}
            onPageChange={setDishPage}
            isLoading={isLoadingDishes}
            emptyIcon={<Utensils className="h-12 w-12 text-muted-foreground/30 stroke-[1.2]" />}
            emptyTitle="No dishes registered"
            emptyDescription={dishSearch ? 'No matching dish profile was found. Try adjusting your search query.' : 'Add your first dish to building menu catalog.'}
            emptyAction={
              !dishSearch ? (
                <Link href="/menus/items/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent transition-all cursor-pointer">
                  <Plus className="h-4 w-4" /> Register Dish
                </Link>
              ) : undefined
            }
          />
        </div>
      )}

      {/* Package Deletion Confirmation Modal */}
      {deletePkgId && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-foreground font-display">Delete Predefined Package</h3>
                <p className="text-xs text-muted-foreground mt-1">This action cannot be undone.</p>
              </div>
              <button
                onClick={() => setDeletePkgId(null)}
                className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {deletePkgError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
                {deletePkgError}
              </div>
            )}

            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to delete this catering package? It will unlink all associated dishes. You cannot delete packages that are linked to historical billing bookings.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setDeletePkgId(null)}
                className="flex-1 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-all font-semibold text-sm cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={() => deletePkgMutation.mutate(deletePkgId)}
                disabled={deletePkgMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-destructive text-destructive-foreground font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
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
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-foreground font-display">Delete Dish Record</h3>
                <p className="text-xs text-muted-foreground mt-1">This action cannot be undone.</p>
              </div>
              <button
                onClick={() => setDeleteDishId(null)}
                className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {deleteDishError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
                {deleteDishError}
              </div>
            )}

            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete this dish from the menu directory? Note that dishes used in orders cannot be deleted. If you only want to stop listing this item, consider toggling it as unavailable.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setDeleteDishId(null)}
                className="flex-1 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-all font-semibold text-sm cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteDishMutation.mutate(deleteDishId)}
                disabled={deleteDishMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-destructive text-destructive-foreground font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
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
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm font-medium tracking-wide">Loading Menus...</span>
      </div>
    }>
      <MenusPageContent />
    </Suspense>
  );
}
