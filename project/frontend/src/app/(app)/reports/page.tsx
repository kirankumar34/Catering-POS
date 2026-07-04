"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import {
  Loader2, Download, TrendingUp, TrendingDown, Percent, Award, ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import DashboardCharts from '../dashboard/components/DashboardCharts';
import ResponsiveDataList, { ColumnDef, CardFieldDef } from '../../../components/ui/ResponsiveDataList';

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
  const { token } = useAuthStore();
  const [exporting, setExporting] = useState(false);

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

  if (!token) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
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

  // Define table columns for monthly statement
  const statementColumns: ColumnDef<MonthlyData>[] = [
    {
      header: 'Month',
      accessor: 'month',
      className: 'font-semibold text-foreground',
    },
    {
      header: 'Revenue',
      accessor: (d) => formatCurrency(d.revenue),
      className: 'text-success font-medium',
    },
    {
      header: 'Expenses',
      accessor: (d) => formatCurrency(d.expenses),
      className: 'text-destructive font-medium',
    },
    {
      header: 'Profit',
      accessor: (d) => formatCurrency(d.profit),
      className: 'text-primary font-semibold',
    },
    {
      header: 'Orders',
      accessor: (d) => String(d.orders),
      className: 'text-foreground font-semibold text-center',
    },
  ];

  // Define card fields for mobile view of statement
  const statementCardFields: CardFieldDef<MonthlyData>[] = [
    {
      label: 'Revenue',
      accessor: (d) => formatCurrency(d.revenue),
    },
    {
      label: 'Expenses',
      accessor: (d) => formatCurrency(d.expenses),
    },
    {
      label: 'Profit',
      accessor: (d) => formatCurrency(d.profit),
      variant: 'prominent',
    },
    {
      label: 'Orders',
      accessor: (d) => String(d.orders),
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Comprehensive analytics, revenue growth & expense statements</p>
        </div>
        <button onClick={exportToCSV} disabled={exporting}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-accent text-primary-foreground text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm cursor-pointer min-h-[44px]"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export Statement
        </button>
      </div>

      {/* Business KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-5">
          <div className="flex justify-between items-start">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Overall Revenue</p>
            <span className="p-1 bg-success/8 rounded text-success"><TrendingUp className="h-4 w-4" /></span>
          </div>
          <p className="text-2xl font-bold text-foreground font-display mt-2">{formatCurrency(totalRevenueVal)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Based on rolling transaction data</p>
        </div>

        <div className="card-base p-5">
          <div className="flex justify-between items-start">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Expenses</p>
            <span className="p-1 bg-destructive/8 rounded text-destructive"><TrendingDown className="h-4 w-4" /></span>
          </div>
          <p className="text-2xl font-bold text-foreground font-display mt-2">{formatCurrency(totalExpensesVal)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Grocery, labor & logistics costs</p>
        </div>

        <div className="card-base p-5">
          <div className="flex justify-between items-start">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Net Profit</p>
            <span className="p-1 bg-primary/8 rounded text-primary"><TrendingUp className="h-4 w-4" /></span>
          </div>
          <p className="text-2xl font-bold text-primary font-display mt-2">{formatCurrency(totalProfitVal)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Margin after expenses</p>
        </div>

        <div className="card-base p-5">
          <div className="flex justify-between items-start">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Profit Margin</p>
            <span className="p-1 bg-accent/8 rounded text-accent"><Percent className="h-4 w-4" /></span>
          </div>
          <p className="text-2xl font-bold text-foreground font-display mt-2">{overallProfitMargin.toFixed(1)}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">Catering benchmark: 15-25%</p>
        </div>
      </div>

      {/* Interactive Charts */}
      <div>
        <DashboardCharts data={chartData} />
      </div>

      {/* Bottom Grid: Statement breakdown & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Breakdowns Statement */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-1">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-display">Monthly Statement</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Detailed monthly breakdown of transactional analytics</p>
          </div>

          <ResponsiveDataList
            data={chartData}
            columns={statementColumns}
            cardTitle={(d) => d.month}
            cardSubtitle={(d) => `Orders: ${d.orders}`}
            cardFields={statementCardFields}
            keyExtractor={(d) => d.month}
            isLoading={false}
            emptyTitle="No statement data"
          />
        </div>

        {/* Top Customers Leaderboard */}
        <div className="card-base p-6 h-fit">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-display">Top Customers</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Highest spending clients & organizers</p>
            </div>
          </div>

          <div className="space-y-4">
            {topCustomers.map((c, idx) => (
              <div key={c.id} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary border border-border text-foreground flex items-center justify-center font-bold text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground truncate max-w-[120px]">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.orderCount} orders booked</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-success">{formatCurrency(c.totalSpent)}</p>
                  <Link href={`/customers/${c.id}`} className="text-[9px] text-primary hover:underline flex items-center justify-end gap-0.5 mt-0.5">
                    Details <ArrowUpRight className="h-2 w-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
