"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import {
  Save, Loader2, UserPlus, Trash2, Shield, Activity, X,
} from 'lucide-react';
import axios from 'axios';
import ResponsiveDataList, { ColumnDef, CardFieldDef } from '../../../components/ui/ResponsiveDataList';
import PaymentSettings from '../../../components/PaymentSettings';

interface StaffUser {
  id: string;
  username: string;
  email: string | null;
  createdAt: string;
  role: {
    name: string;
  };
}

interface ActivityLogEntry {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  user: {
    username: string;
  };
}

const SettingsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'payment' | 'users' | 'audit'>('profile');
  const [profileForm, setProfileForm] = useState({ businessName: '', proprietorName: '', gstin: '', phone: '', address: '', upiId: '', invoicePrefix: 'INV', gstRate: '5' });
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', roleName: 'STAFF' });
  const [showAddUser, setShowAddUser] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  // Queries
  const { isLoading: isSettingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      const obj: Record<string, string> = {};
      res.data.forEach((s: { key: string; value: string }) => {
        obj[s.key] = s.value;
      });
      setProfileForm(f => ({ ...f, ...obj }));
      return res.data;
    },
    enabled: !!token,
  });

  const { data: usersData, isLoading: isUsersLoading } = useQuery<StaffUser[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data;
    },
    enabled: !!token && (user?.role === 'SUPER_ADMIN' || user?.role === 'OWNER'),
  });

  const { data: auditData, isLoading: isAuditLoading } = useQuery<ActivityLogEntry[]>({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const res = await api.get('/activity-log');
      return res.data;
    },
    enabled: !!token && (user?.role === 'SUPER_ADMIN' || user?.role === 'OWNER'),
  });

  // Mutations
  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      await api.post('/settings', profileForm);
    },
    onSuccess: () => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err: unknown) => {
      let msg = 'Failed to save settings';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setApiError(msg);
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      await api.post('/users', userForm);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowAddUser(false);
      setUserForm({ username: '', email: '', password: '', roleName: 'STAFF' });
      setUserError(null);
    },
    onError: (err: unknown) => {
      let msg = 'Failed to add staff';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        const m = err.response.data.message;
        msg = Array.isArray(m) ? m.join(', ') : m;
      }
      setUserError(msg);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const isStaff = user?.role === 'STAFF';

  if (!token) {
    return null;
  }

  // Define desktop user columns
  const userColumns: ColumnDef<StaffUser>[] = [
    {
      header: 'Username',
      accessor: 'username',
      className: 'font-semibold text-foreground',
    },
    {
      header: 'Email',
      accessor: (u) => u.email || <span className="text-muted-foreground">—</span>,
      className: 'text-foreground',
    },
    {
      header: 'Role',
      accessor: (u) => (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          u.role.name === 'SUPER_ADMIN'
            ? 'bg-primary/8 text-primary border-primary/20'
            : u.role.name === 'OWNER'
              ? 'bg-accent/8 text-accent border-accent/20'
              : 'bg-secondary text-muted-foreground border-border'
        }`}>
          {u.role.name}
        </span>
      ),
    },
    {
      header: 'Joined',
      accessor: (u) => new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      className: 'text-xs text-muted-foreground',
    },
  ];

  // Define mobile user card fields
  const userCardFields: CardFieldDef<StaffUser>[] = [
    {
      label: 'Email',
      accessor: (u) => u.email || '—',
    },
    {
      label: 'Joined',
      accessor: (u) => new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
  ];

  const userRowActions = (u: StaffUser) => (
    <div className="flex items-center justify-end">
      {u.username !== user?.username && (
        <button onClick={() => deleteUserMutation.mutate(u.id)} disabled={deleteUserMutation.isPending}
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-foreground font-display">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage business profile configurations and team credentials</p>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 border-b border-border pb-px">
        <button onClick={() => setActiveTab('profile')} className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer min-h-[44px] ${activeTab === 'profile' ? 'border-primary text-foreground font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Business Profile</button>
        <button onClick={() => setActiveTab('payment')} className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer min-h-[44px] ${activeTab === 'payment' ? 'border-primary text-foreground font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Payment Settings</button>
        {!isStaff && (
          <>
            <button onClick={() => setActiveTab('users')} className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer min-h-[44px] ${activeTab === 'users' ? 'border-primary text-foreground font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>User Management</button>
            <button onClick={() => setActiveTab('audit')} className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer min-h-[44px] ${activeTab === 'audit' ? 'border-primary text-foreground font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Activity Logs</button>
          </>
        )}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {isSettingsLoading ? (
            <div className="card-base p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="card-base p-6 space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2"><Shield className="h-4 w-4 text-primary" /> Business Details</div>
              
              {apiError && <p className="text-xs text-destructive font-semibold p-2 bg-destructive/10 rounded-lg">{apiError}</p>}
              {saveSuccess && <p className="text-xs text-success font-semibold p-2 bg-success/8 rounded-lg">Settings saved successfully!</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Business Name</label>
                  <input disabled={isStaff} type="text" value={profileForm.businessName} onChange={e => setProfileForm(f => ({ ...f, businessName: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Proprietor Name</label>
                  <input disabled={isStaff} type="text" value={profileForm.proprietorName} onChange={e => setProfileForm(f => ({ ...f, proprietorName: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">GSTIN Number</label>
                  <input disabled={isStaff} type="text" value={profileForm.gstin} onChange={e => setProfileForm(f => ({ ...f, gstin: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                  <input disabled={isStaff} type="text" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px]" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Business Address</label>
                  <textarea disabled={isStaff} rows={2} value={profileForm.address} onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 resize-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">UPI ID for Billing Payments</label>
                  <input disabled={isStaff} type="text" value={profileForm.upiId} onChange={e => setProfileForm(f => ({ ...f, upiId: e.target.value }))}
                    placeholder="e.g. kiransmart00-2@okicici"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-5 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Invoice Prefix</label>
                  <input disabled={isStaff} type="text" value={profileForm.invoicePrefix} onChange={e => setProfileForm(f => ({ ...f, invoicePrefix: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Default GST Rate (%)</label>
                  <input disabled={isStaff} type="number" value={profileForm.gstRate} onChange={e => setProfileForm(f => ({ ...f, gstRate: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px]" />
                </div>
              </div>

              {!isStaff && (
                <div className="flex justify-end mt-4">
                  <button onClick={() => saveSettingsMutation.mutate()} disabled={saveSettingsMutation.isPending}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-accent transition-colors shadow-sm cursor-pointer disabled:opacity-50 min-h-[44px]"
                  >
                    <Save className="h-4 w-4" /> Save Configuration
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 1.5: Payment Settings */}
      {activeTab === 'payment' && (
        <PaymentSettings isStaff={isStaff} />
      )}

      {/* Tab 2: User Management */}
      {activeTab === 'users' && !isStaff && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider font-display">Staff Users</h2>
            <button onClick={() => { setUserError(null); setShowAddUser(true); }}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-accent cursor-pointer transition-colors min-h-[44px]"
            >
              <UserPlus className="h-3.5 w-3.5" /> Add Staff Member
            </button>
          </div>

          <ResponsiveDataList
            data={usersData || []}
            columns={userColumns}
            cardTitle={(u) => u.username}
            cardSubtitle={(u) => u.role.name}
            cardFields={userCardFields}
            keyExtractor={(u) => u.id}
            actions={userRowActions}
            isLoading={isUsersLoading}
            emptyTitle="No staff registered"
          />
        </div>
      )}

      {/* Tab 3: Activity Logs */}
      {activeTab === 'audit' && !isStaff && (
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 font-display">
            <Activity className="h-4 w-4 text-primary" /> Audit Logs
          </h2>

          {isAuditLoading ? (
            <div className="card-base p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="card-base p-4 space-y-3 max-h-[500px] overflow-y-auto divide-y divide-border">
              {auditData?.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 text-sm">No activity recorded yet.</p>
              ) : (
                auditData?.map((log) => (
                  <div key={log.id} className="pt-3 first:pt-0 flex justify-between items-start gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-foreground">{log.action}</p>
                      {log.details && <p className="text-muted-foreground mt-0.5">{log.details}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary">{log.user.username}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(log.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4">
          <div className="rounded-lg border border-border bg-card p-6 max-w-sm w-full shadow-lg relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground font-display">Add Staff Member</h3>
              <button onClick={() => setShowAddUser(false)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1"><X className="h-5 w-5" /></button>
            </div>
            {userError && <p className="text-xs text-destructive font-semibold mb-3 p-2 bg-destructive/10 rounded-lg">{userError}</p>}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Username *</label>
                <input type="text" value={userForm.username} onChange={e => setUserForm(f => ({ ...f, username: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <input type="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Password (Min 6 chars) *</label>
                <input type="password" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Access Level</label>
                <select value={userForm.roleName} onChange={e => setUserForm(f => ({ ...f, roleName: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary min-h-[44px]">
                  <option value="STAFF">STAFF (Manage billing, customer register)</option>
                  <option value="OWNER">OWNER (Full CRUD, manage settings & reports)</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN (Complete root access)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddUser(false)} className="flex-1 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer min-h-[44px]">Cancel</button>
              <button onClick={() => createUserMutation.mutate()} disabled={createUserMutation.isPending || !userForm.username || userForm.password.length < 6}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]">
                {createUserMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</> : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
