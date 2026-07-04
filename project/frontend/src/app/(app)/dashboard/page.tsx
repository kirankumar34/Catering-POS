"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import DashboardSummary from './components/DashboardSummary';
import DashboardCharts from './components/DashboardCharts';
import QuickActions from './components/QuickActions';
import RecentActivity from './components/RecentActivity';
import { Loader2 } from 'lucide-react';
import GoldCornerAccent from '../../../components/ui/GoldCornerAccent';

interface TopCustomerEntry {
  id: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
}

const DashboardHome = () => {
  const router = useRouter();
  const { token } = useAuthStore();

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

  const isLoading = isSummaryLoading || isChartsLoading || isCustomersLoading || isActivityLoading;

  if (!token) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
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

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header Row */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-5 relative">
        <GoldCornerAccent position="top-right" size={40} className="-mr-4 -mt-4 opacity-50" />
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-display">Welcome back!</h2>
          <p className="text-sm text-muted-foreground">Here is the business dashboard overview for today.</p>
        </div>
        <div className="px-4 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-foreground ml-auto sm:ml-0">
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
      <div className="card-base p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-foreground font-display">Top Customer Accounts</h3>
          <p className="text-xs text-muted-foreground">Sorted by total aggregated spending volume</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs font-semibold text-muted-foreground">
                <th className="pb-3 px-2">Customer Name</th>
                <th className="pb-3 px-2">Phone</th>
                <th className="pb-3 px-2 text-center">Orders</th>
                <th className="pb-3 px-2 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm font-medium">
              {topCustomers?.map((cust: TopCustomerEntry) => (
                <tr key={cust.id} className="text-foreground hover:bg-secondary/30 transition-colors">
                  <td className="py-3.5 px-2 font-semibold">{cust.name}</td>
                  <td className="py-3.5 px-2 text-muted-foreground">{cust.phone}</td>
                  <td className="py-3.5 px-2 text-center">{cust.orderCount}</td>
                  <td className="py-3.5 px-2 text-right font-bold text-primary">{formatCurrency(cust.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
