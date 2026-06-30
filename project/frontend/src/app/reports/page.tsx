"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import {
  LayoutDashboard, Users, ShoppingBag, IndianRupee, LogOut,
  ChevronRight, Loader2, Receipt, Package, BarChart3, Download,
  TrendingUp, TrendingDown, Percent, Award, ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import DashboardCharts from '../dashboard/components/DashboardCharts';

interface TopCustomer {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  orderCount: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  orders: number;
}

const ReportsPage = () => {
  const router = useRouter();
  const { user, token, clearAuth } = useAuthStore();
  const [exporting, setExporting] = useState(false);

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: false },
    { label: 'Customers', href: '/customers', icon: Users, active: false },
    { label: 'Orders', href: '/orders', icon: ShoppingBag, active: false },
    { label: 'Expenses', href: '/expenses', icon: Receipt, active: false },
    { label: 'Inventory', href: '/inventory', icon: Package, active: false },
    { label: 'Payments', href: '/payments', icon: IndianRupee, active: false },
    { label: 'Reports', href: '/reports', icon: BarChart3, active: true },
  ];

  const handleLogout = () => { clearAuth(); router.push('/login'); };

  // Fetch charts/financial trend data
  const { data: trendData, isLoading: isTrendLoading } = useQuery<MonthlyData[]>({
    queryKey: ['reportTrend'],
    queryFn: async () => {
      const res = await api.get('/dashboard/charts');
      return res.data;
    },
    enabled: !!token,
  });

  // Fetch top customers
  const { data: customersData, isLoading: isCustomersLoading } = useQuery<TopCustomer[]>({
    queryKey: ['reportCustomers'],
    queryFn: async () => {
      const res = await api.get('/dashboard/top-customers');
      return res.data;
    },
    enabled: !!token,
  });

  const isLoading = isTrendLoading || isCustomersLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        <span className="text-sm font-medium tracking-wide">Generating business reports...</span>
      </div>
    );
  }

  const chartData = trendData || [];
  const topCustomers = customersData || [];

  // Calculations for overall report totals
  const totalRevenueVal = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpensesVal = chartData.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfitVal = Math.max(0, totalRevenueVal - totalExpensesVal);
  const overallProfitMargin = totalRevenueVal > 0 ? (totalProfitVal / totalRevenueVal) * 100 : 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // CSV Export utility
  const exportToCSV = () => {
    setExporting(true);
    try {
      const headers = ['Month', 'Revenue (INR)', 'Expenses (INR)', 'Net Profit (INR)', 'Order Volume'];
      const rows = chartData.map(d => [
        d.month,
        d.revenue,
        d.expenses,
        d.profit,
        d.orders,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Seisuvai_Business_Report_${new Date().getFullYear()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" />
      <title>Reports & Analytics – SBBMS</title>

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
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
              <p className="text-sm text-slate-400 mt-0.5">Comprehensive analytics, revenue growth & expense statements</p>
            </div>
            <button onClick={exportToCSV} disabled={exporting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export Statement
            </button>
          </div>

          {/* Business KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-xl">
              <div className="flex justify-between items-start">
                <p className="text-xs text-slate-500 font-semibold">Overall Revenue</p>
                <span className="p-1 bg-emerald-500/10 rounded-lg text-emerald-400"><TrendingUp className="h-4 w-4" /></span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">{formatCurrency(totalRevenueVal)}</p>
              <p className="text-[10px] text-slate-500 mt-1">Based on standard rolling transaction data</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-xl">
              <div className="flex justify-between items-start">
                <p className="text-xs text-slate-500 font-semibold">Total Expenses</p>
                <span className="p-1 bg-rose-500/10 rounded-lg text-rose-400"><TrendingDown className="h-4 w-4" /></span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">{formatCurrency(totalExpensesVal)}</p>
              <p className="text-[10px] text-slate-500 mt-1">Sum of all grocery, labor & logistics costs</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-xl">
              <div className="flex justify-between items-start">
                <p className="text-xs text-slate-500 font-semibold">Net Profit</p>
                <span className="p-1 bg-indigo-500/10 rounded-lg text-indigo-400"><TrendingUp className="h-4 w-4" /></span>
              </div>
              <p className="text-2xl font-bold text-indigo-400 mt-2">{formatCurrency(totalProfitVal)}</p>
              <p className="text-[10px] text-indigo-500/80 mt-1">Clear business margin after expenses</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-xl">
              <div className="flex justify-between items-start">
                <p className="text-xs text-slate-500 font-semibold">Profit Margin</p>
                <span className="p-1 bg-amber-500/10 rounded-lg text-amber-400"><Percent className="h-4 w-4" /></span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">{overallProfitMargin.toFixed(1)}%</p>
              <p className="text-[10px] text-slate-500 mt-1">Catering industry benchmark: 15-25%</p>
            </div>
          </div>

          {/* Interactive Charts */}
          <div className="mb-8">
            <DashboardCharts data={chartData} />
          </div>

          {/* Bottom Grid: Statement breakdown & Top Customers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Breakdowns Statement */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Monthly Statement Statement</h3>
                <p className="text-xs text-slate-400 mt-0.5">Detailed monthly breakdown of transactional analytics</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800/60 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-2">Month</th>
                      <th className="py-3 px-2">Revenue</th>
                      <th className="py-3 px-2">Expenses</th>
                      <th className="py-3 px-2">Profit</th>
                      <th className="py-3 px-2">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-sm">
                    {chartData.map((d, index) => (
                      <tr key={index} className="hover:bg-slate-800/10 transition-colors">
                        <td className="py-3 px-2 font-semibold text-slate-300">{d.month}</td>
                        <td className="py-3 px-2 text-emerald-400 font-medium">₹{d.revenue.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-2 text-rose-400 font-medium">₹{d.expenses.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-2 text-indigo-400 font-semibold">₹{d.profit.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-2 text-slate-300 font-semibold">{d.orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Customers Leaderboard */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Customers</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Highest spending clients & organizers</p>
                </div>
              </div>

              <div className="space-y-4">
                {topCustomers.map((c, idx) => (
                  <div key={c.id} className="flex items-center justify-between py-1 border-b border-slate-800/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white truncate max-w-[120px]">{c.name}</p>
                        <p className="text-[10px] text-slate-500">{c.orderCount} orders booked</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-400">₹{c.totalSpent.toLocaleString('en-IN')}</p>
                      <Link href={`/customers/${c.id}`} className="text-[9px] text-indigo-400 hover:underline flex items-center justify-end gap-0.5 mt-0.5">
                        Details <ArrowUpRight className="h-2 w-2" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
