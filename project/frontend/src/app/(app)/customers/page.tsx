"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import {
  Users,
  Search,
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  X
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import ResponsiveDataList, { ColumnDef, CardFieldDef } from '../../../components/ui/ResponsiveDataList';

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
  const { user, token } = useAuthStore();

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

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  if (!token) {
    return null;
  }

  // Table columns for desktop
  const columns: ColumnDef<CustomerListEntry>[] = [
    {
      header: 'Name',
      accessor: (cust) => (
        <div>
          <Link href={`/customers/${cust.id}`} className="font-semibold text-primary hover:underline">
            {cust.name}
          </Link>
          <p className="text-[10px] text-muted-foreground mt-0.5">ID: {cust.id.slice(0, 8)}</p>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: (cust) => (
        <div>
          <p className="text-foreground">{cust.phone}</p>
          {cust.email && <p className="text-xs text-muted-foreground mt-0.5">{cust.email}</p>}
        </div>
      ),
    },
    {
      header: 'Orders',
      accessor: (cust) => cust._count?.orders || 0,
      className: 'text-center',
    },
    {
      header: 'Default Address',
      accessor: (cust) => {
        const defaultAddress = cust.addresses.find((addr: CustomerListAddress) => addr.isDefault) || cust.addresses[0];
        return defaultAddress ? defaultAddress.address : <span className="text-muted-foreground">No address logged</span>;
      },
      className: 'max-w-xs truncate text-muted-foreground',
    },
  ];

  // Card fields for mobile
  const cardFields: CardFieldDef<CustomerListEntry>[] = [
    {
      label: 'Contact',
      accessor: (cust) => cust.phone,
    },
    {
      label: 'Orders',
      accessor: (cust) => String(cust._count?.orders || 0),
    },
    {
      label: 'Default Address',
      accessor: (cust) => {
        const defaultAddress = cust.addresses.find((addr: CustomerListAddress) => addr.isDefault) || cust.addresses[0];
        return defaultAddress ? defaultAddress.address : 'No address logged';
      },
    },
  ];

  const rowActions = (cust: CustomerListEntry) => (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/customers/${cust.id}`}
        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
        title="View Profile"
      >
        <Eye className="h-4 w-4" />
      </Link>
      <Link
        href={`/customers/edit/${cust.id}`}
        className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors cursor-pointer"
        title="Edit Customer"
      >
        <Edit2 className="h-4 w-4" />
      </Link>
      {(user?.role === 'SUPER_ADMIN' || user?.role === 'OWNER') && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteId(cust.id);
            setDeleteError(null);
          }}
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
          title="Delete Profile"
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
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-display">Customer Database</h2>
          <p className="text-sm text-muted-foreground">Search customer records, view profiles, and access history logs.</p>
        </div>
        <Link
          href="/customers/new"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-accent text-primary-foreground font-semibold text-sm transition-colors shadow-sm cursor-pointer min-h-[44px]"
        >
          <UserPlus className="h-4 w-4" />
          <span>Register Customer</span>
        </Link>
      </header>

      {/* Filters and Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by name, phone, email, GST, or address details..."
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[44px]"
        />
      </div>

      {/* Customer list responsive data list */}
      <ResponsiveDataList
        data={customerData?.data || []}
        columns={columns}
        cardTitle={(cust) => cust.name}
        cardSubtitle={(cust) => `ID: ${cust.id.slice(0, 8)}`}
        cardFields={cardFields}
        keyExtractor={(cust) => cust.id}
        onRowClick={(cust) => router.push(`/customers/${cust.id}`)}
        actions={rowActions}
        pagination={{
          total: customerData?.meta?.total || 0,
          page: currentPage,
          totalPages: customerData?.meta?.totalPages || 1,
        }}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
        emptyIcon={<Users className="h-12 w-12 text-muted-foreground/30 stroke-[1.5]" />}
        emptyTitle="No customers registered"
        emptyDescription={searchTerm ? 'No matching profile records were found. Try adjusting your search query.' : 'Add your first customer to get started.'}
        emptyAction={
          !searchTerm ? (
            <Link href="/customers/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent transition-all cursor-pointer">
              <UserPlus className="h-4 w-4" /> Register Customer
            </Link>
          ) : undefined
        }
      />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-foreground font-display">Delete Customer Profile</h3>
                <p className="text-xs text-muted-foreground mt-1">This action cannot be undone.</p>
              </div>
              <button
                onClick={() => setDeleteId(null)}
                className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {deleteError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
                {deleteError}
              </div>
            )}

            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to delete this customer record? Note that you can only delete profiles that have no active or completed order transactions in the database.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-all font-semibold text-sm cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-destructive text-destructive-foreground font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
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
