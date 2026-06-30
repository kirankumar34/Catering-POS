"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import {
  LayoutDashboard, Users, ShoppingBag, IndianRupee, LogOut,
  ChevronRight, Loader2, Receipt, Package, BarChart3, Settings,
  Save, Shield, Trash2, X, Activity, UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface StaffUser {
  id: string;
  username: string;
  email?: string;
  createdAt: string;
  role: { id: string; name: string };
}

interface ActivityLogEntry {
  id: string;
  action: string;
  details?: string;
  createdAt: string;
  user: { username: string; role: { name: string } };
}

const SettingsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, token, clearAuth } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'audit'>('profile');

  // Forms state
  const [profileForm, setProfileForm] = useState({
    businessName: 'Seisuvai Catering',
    proprietorName: 'S. Vignesh',
    phone: '+91 98765 43210',
    gstin: '33ABCDE1234F1Z5',
    invoicePrefix: 'INV',
    gstRate: '18',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // User Management state
  const [showAddUser, setShowAddUser] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', roleName: 'STAFF' });
  const [userError, setUserError] = useState<string | null>(null);

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: false },
    { label: 'Customers', href: '/customers', icon: Users, active: false },
    { label: 'Orders', href: '/orders', icon: ShoppingBag, active: false },
    { label: 'Expenses', href: '/expenses', icon: Receipt, active: false },
    { label: 'Inventory', href: '/inventory', icon: Package, active: false },
    { label: 'Payments', href: '/payments', icon: IndianRupee, active: false },
    { label: 'Reports', href: '/reports', icon: BarChart3, active: false },
    { label: 'Settings', href: '/settings', icon: Settings, active: true },
  ];

  const handleLogout = () => { clearAuth(); router.push('/login'); };

  // Queries
  const { isLoading: isSettingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      // Convert array of key-value to object
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
    enabled: !!token && activeTab === 'users' && (user?.role === 'SUPER_ADMIN' || user?.role === 'OWNER'),
  });

  const { data: auditData, isLoading: isAuditLoading } = useQuery<ActivityLogEntry[]>({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const res = await api.get('/activity-log');
      return res.data;
    },
    enabled: !!token && activeTab === 'audit' && (user?.role === 'SUPER_ADMIN' || user?.role === 'OWNER'),
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

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" />
      <title>Settings – SBBMS</title>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-800/60 bg-slate-900/60 backdrop-blur-xl z-30 flex flex-col">
        <div className="p-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">S</div>
            <div><p className="font-bold text-white text-sm">SBBMS</p><p className="text-[10px] text-slate-400">Seisuvai Catering</p></div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${link.active ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
              <link.icon className="h-4 w-4" />{link.label}
              {link.active && <ChevronRight className="h-3.5 w-3.5 ml-auto text-indigo-400" />}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800/60">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
            <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-white truncate">{user?.username}</p><p className="text-[10px] text-slate-500 truncate">{user?.role}</p></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"><LogOut className="h-4 w-4" />Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="pl-64">
        <div className="p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage business profile configurations and team credentials</p>
          </div>

          {/* Navigation tabs */}
          <div className="flex gap-2 border-b border-slate-850 pb-px mb-6">
            <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'profile' ? 'border-indigo-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>Business Profile</button>
            {!isStaff && (
              <>
                <button onClick={() => setActiveTab('users')} className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'users' ? 'border-indigo-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>User Management</button>
                <button onClick={() => setActiveTab('audit')} className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'audit' ? 'border-indigo-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>Activity Logs</button>
              </>
            )}
          </div>

          {/* Tab 1: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {isSettingsLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-5 backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"><Shield className="h-4 w-4 text-indigo-400" /> Business Details</div>
                  
                  {apiError && <p className="text-xs text-rose-400 font-semibold p-2 bg-rose-500/10 rounded-lg">{apiError}</p>}
                  {saveSuccess && <p className="text-xs text-emerald-400 font-semibold p-2 bg-emerald-500/10 rounded-lg">Settings saved successfully!</p>}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Business Name</label>
                      <input disabled={isStaff} type="text" value={profileForm.businessName} onChange={e => setProfileForm(f => ({ ...f, businessName: e.target.value }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Proprietor Name</label>
                      <input disabled={isStaff} type="text" value={profileForm.proprietorName} onChange={e => setProfileForm(f => ({ ...f, proprietorName: e.target.value }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">GSTIN Number</label>
                      <input disabled={isStaff} type="text" value={profileForm.gstin} onChange={e => setProfileForm(f => ({ ...f, gstin: e.target.value }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Phone</label>
                      <input disabled={isStaff} type="text" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-5 mt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Invoice Prefix</label>
                      <input disabled={isStaff} type="text" value={profileForm.invoicePrefix} onChange={e => setProfileForm(f => ({ ...f, invoicePrefix: e.target.value }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Default GST Rate (%)</label>
                      <input disabled={isStaff} type="number" value={profileForm.gstRate} onChange={e => setProfileForm(f => ({ ...f, gstRate: e.target.value }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50" />
                    </div>
                  </div>

                  {!isStaff && (
                    <div className="flex justify-end mt-4">
                      <button onClick={() => saveSettingsMutation.mutate()} disabled={saveSettingsMutation.isPending}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" /> Save Configuration
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: User Management */}
          {activeTab === 'users' && !isStaff && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Staff Users</h2>
                <button onClick={() => { setUserError(null); setShowAddUser(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 cursor-pointer transition-all"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Add Staff Member
                </button>
              </div>

              {isUsersLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">Username</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Joined</th>
                        <th className="py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-sm">
                      {usersData?.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/10">
                          <td className="py-3 px-4 font-semibold text-slate-200">{u.username}</td>
                          <td className="py-3 px-4 text-slate-400">{u.email || '—'}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role.name === 'SUPER_ADMIN' ? 'bg-indigo-500/10 text-indigo-400' : u.role.name === 'OWNER' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                              {u.role.name}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                          <td className="py-3 px-4 text-right">
                            {u.username !== user?.username && (
                              <button onClick={() => deleteUserMutation.mutate(u.id)} disabled={deleteUserMutation.isPending}
                                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Activity Logs */}
          {activeTab === 'audit' && !isStaff && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-400" /> Audit Log Statement
              </h2>

              {isAuditLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3 max-h-[500px] overflow-y-auto divide-y divide-slate-800/40">
                  {auditData?.length === 0 ? (
                    <p className="text-center text-slate-500 py-6 text-sm">No activity recorded yet.</p>
                  ) : (
                    auditData?.map((log) => (
                      <div key={log.id} className="pt-3 first:pt-0 flex justify-between items-start gap-4 text-xs">
                        <div>
                          <p className="font-semibold text-slate-200">{log.action}</p>
                          {log.details && <p className="text-slate-500 mt-0.5">{log.details}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-indigo-400">{log.user.username}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{new Date(log.createdAt).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white">Add Staff Member</h3>
              <button onClick={() => setShowAddUser(false)} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            {userError && <p className="text-xs text-rose-400 font-semibold mb-3 p-2 bg-rose-500/10 rounded-lg">{userError}</p>}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Username *</label>
                <input type="text" value={userForm.username} onChange={e => setUserForm(f => ({ ...f, username: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <input type="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Password (Min 6 chars) *</label>
                <input type="password" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Access Level</label>
                <select value={userForm.roleName} onChange={e => setUserForm(f => ({ ...f, roleName: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                  <option value="STAFF">STAFF (Manage billing, customer register)</option>
                  <option value="OWNER">OWNER (Full CRUD, manage settings & reports)</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN (Complete root access)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddUser(false)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-semibold cursor-pointer">Cancel</button>
              <button onClick={() => createUserMutation.mutate()} disabled={createUserMutation.isPending || !userForm.username || userForm.password.length < 6}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
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
