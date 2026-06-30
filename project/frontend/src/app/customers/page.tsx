"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import {
  LogOut,
  Users,
  ShoppingBag,
  Utensils,
  LayoutDashboard,
  ChevronRight,
  Loader2,
  IndianRupee,
  Search,
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  X
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface CustomerListAddress {
  id: string;
  address: string;
  location?: string;
  isDefault: boolean;
}

interface CustomerListEntry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gstNumber?: string;
  addresses: CustomerListAddress[];
  _count?: {
    orders: number;
  };
}

const CustomersPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, token, clearAuth } = useAuthStore();

  // State filters
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  // Query customers
  const { data: customerData, isLoading } = useQuery({
    queryKey: ['customers', searchTerm, currentPage],
    queryFn: async () => {
      const response = await api.get('/customers', {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: 10,
        },
      });
      return response.data;
    },
    enabled: !!token,
  });

  // Mutation to delete a customer
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeleteId(null);
      setDeleteError(null);
    },
    onError: (err) => {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.data) {
        setDeleteError(err.response.data.message || 'Failed to delete customer.');
      } else {
        setDeleteError('Failed to connect to server.');
      }
    },
  });

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  if (!token) {
    return null;
  }

  const sidebarLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, active: false },
    { label: "Customers", href: "/customers", icon: Users, active: true },
    { label: "Catering Menus", href: "/menus", icon: Utensils, active: false },
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
            <h2 className="text-2xl font-bold tracking-tight text-white font-outfit">Customer Database</h2>
            <p className="text-sm text-slate-400">Search customer records, view profiles, and access history logs.</p>
          </div>
          <Link
            href="/customers/new"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Register Customer</span>
          </Link>
        </header>

        {/* Filters and Search Bar */}
        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, phone, email, GST, or address details..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Customer list data table */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
              <span className="text-xs text-slate-400">Fetching customer profiles...</span>
            </div>
          ) : !customerData?.data || customerData.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <Users className="h-12 w-12 text-slate-600 stroke-[1.2]" />
              <p className="text-sm font-semibold text-slate-400">No customers registered</p>
              <p className="text-xs text-slate-500 max-w-sm">
                No matching profile records were found. Click the button above to add your first customer.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-xs font-semibold text-slate-400">
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Contact</th>
                      <th className="pb-3 text-center">Orders</th>
                      <th className="pb-3">Default Address</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-sm font-medium">
                    {customerData.data.map((cust: CustomerListEntry) => {
                      const defaultAddress = cust.addresses.find((addr: CustomerListAddress) => addr.isDefault) || cust.addresses[0];
                      return (
                        <tr key={cust.id} className="text-slate-300 hover:text-white transition-colors group">
                          <td className="py-4">
                            <Link href={`/customers/${cust.id}`} className="font-semibold text-white hover:text-indigo-400 transition-colors">
                              {cust.name}
                            </Link>
                            <p className="text-[10px] text-slate-500 mt-0.5">ID: {cust.id.slice(0, 8)}</p>
                          </td>
                          <td className="py-4">
                            <p className="text-slate-300">{cust.phone}</p>
                            {cust.email && <p className="text-xs text-slate-500 mt-0.5">{cust.email}</p>}
                          </td>
                          <td className="py-4 text-center">{cust._count?.orders || 0}</td>
                          <td className="py-4 text-xs text-slate-400 max-w-xs truncate">
                            {defaultAddress ? defaultAddress.address : <span className="text-slate-600">No address logged</span>}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/customers/${cust.id}`}
                                className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white transition-all"
                                title="View Profile"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/customers/edit/${cust.id}`}
                                className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white transition-all"
                                title="Edit Customer"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Link>
                              {(user?.role === 'SUPER_ADMIN' || user?.role === 'OWNER') && (
                                <button
                                  onClick={() => {
                                    setDeleteId(cust.id);
                                    setDeleteError(null);
                                  }}
                                  className="p-1.5 rounded-lg border border-slate-800 hover:border-rose-900/40 bg-slate-900/60 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                                  title="Delete Profile"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {customerData.meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-850 pt-4">
                  <span className="text-xs text-slate-400">
                    Showing Page {currentPage} of {customerData.meta.totalPages} ({customerData.meta.total} Customers)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Prev
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(customerData.meta.totalPages, prev + 1))}
                      disabled={currentPage === customerData.meta.totalPages}
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
      </main>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-850 bg-slate-900 p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white font-outfit">Delete Customer Profile</h3>
                <p className="text-xs text-slate-400 mt-1">This action cannot be undone.</p>
              </div>
              <button
                onClick={() => setDeleteId(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {deleteError && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-semibold text-rose-400">
                {deleteError}
              </div>
            )}

            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to delete this customer record? Note that you can only delete profiles that have no active or completed order transactions in the database.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/30 transition-all font-semibold text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-650 hover:bg-rose-600 text-white font-semibold text-sm transition-all shadow-md shadow-rose-600/10 cursor-pointer disabled:opacity-50"
              >
                {deleteMutation.isPending ? (
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

export default CustomersPage;
