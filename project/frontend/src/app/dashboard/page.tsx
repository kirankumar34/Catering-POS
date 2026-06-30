"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import DashboardSummary from './components/DashboardSummary';
import DashboardCharts from './components/DashboardCharts';
import QuickActions from './components/QuickActions';
import RecentActivity from './components/RecentActivity';
import { LogOut, Users, ShoppingBag, Utensils, LayoutDashboard, ChevronRight, Loader2, IndianRupee, Receipt, Package, BarChart3 } from 'lucide-react';
import Link from 'next/link';
interface TopCustomerEntry {
  id: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
}

const DashboardHome = () => {
  const router = useRouter();
  const { user, token, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  // Query summary details
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const response = await api.get('/dashboard/summary');
      return response.data;
    },
    enabled: !!token,
  });

  // Query chart details
  const { data: chartsData, isLoading: isChartsLoading } = useQuery({
    queryKey: ['dashboardCharts'],
    queryFn: async () => {
      const response = await api.get('/dashboard/charts');
      return response.data;
    },
    enabled: !!token,
  });

  // Query top customers
  const { data: topCustomers, isLoading: isCustomersLoading } = useQuery({
    queryKey: ['dashboardTopCustomers'],
    queryFn: async () => {
      const response = await api.get('/dashboard/top-customers');
      return response.data;
    },
    enabled: !!token,
  });

  // Query recent activities
  const { data: recentActivity, isLoading: isActivityLoading } = useQuery({
    queryKey: ['dashboardActivity'],
    queryFn: async () => {
      const response = await api.get('/dashboard/recent-activity');
      return response.data;
    },
    enabled: !!token,
  });

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const isLoading = isSummaryLoading || isChartsLoading || isCustomersLoading || isActivityLoading;

  if (!token) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        <span className="text-sm font-medium tracking-wide">Loading Seisuvai Analytics...</span>
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
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, active: true },
    { label: "Customers", href: "/customers", icon: Users, active: false },
    { label: "Orders", href: "/orders", icon: ShoppingBag, active: false },
    { label: "Expenses", href: "/expenses", icon: Receipt, active: false },
    { label: "Inventory", href: "/inventory", icon: Package, active: false },
    { label: "Payments", href: "/payments", icon: IndianRupee, active: false },
    { label: "Reports", href: "/reports", icon: BarChart3, active: false },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Left Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col shrink-0">
        {/* Logo Branding */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 font-outfit text-lg">
            S
          </div>
          <div className="space-y-0.5">
            <h1 className="font-bold text-sm tracking-tight text-white font-outfit uppercase">Seisuvai</h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Catering Billing</p>
          </div>
        </div>

        {/* Sidebar Nav links */}
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

        {/* User Session profile */}
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

      {/* Main Dashboard Panel */}
      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
        {/* Top Header Row */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800/40 pb-5">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white font-outfit">Welcome back, {user?.username}!</h2>
            <p className="text-sm text-slate-400">Here is the business dashboard overview for today.</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800/80 text-xs font-semibold text-slate-300 ml-auto sm:ml-0">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </header>

        {/* Dashboard Widgets */}
        <DashboardSummary kpis={summaryData?.kpis || {
          todayOrders: 0,
          todayRevenue: 0,
          pendingPayments: 0,
          completedOrders: 0,
          monthlyRevenue: 0,
          monthlyExpenses: 0,
          monthlyProfit: 0
        }} />

        {/* Quick actions shortcut buttons */}
        <QuickActions />

        {/* Recharts Analytics Panel */}
        <DashboardCharts data={chartsData || []} />

        {/* Row for Schedules & Activity Feed */}
        <RecentActivity
          upcomingEvents={summaryData?.upcomingEvents || []}
          recentActivity={recentActivity || []}
        />

        {/* Top Spent Customers Table */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white font-outfit">Top Customer Accounts</h3>
            <p className="text-xs text-slate-400">Sorted by total aggregated spending volume</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400">
                  <th className="pb-3">Customer Name</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3 text-center">Orders</th>
                  <th className="pb-3 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm font-medium">
                {topCustomers?.map((cust: TopCustomerEntry) => (
                  <tr key={cust.id} className="text-slate-300 hover:text-white transition-colors">
                    <td className="py-3.5 font-semibold text-white">{cust.name}</td>
                     <td className="py-3.5 text-slate-400">{cust.phone}</td>
                    <td className="py-3.5 text-center">{cust.orderCount}</td>
                    <td className="py-3.5 text-right font-bold text-white">{formatCurrency(cust.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardHome;
