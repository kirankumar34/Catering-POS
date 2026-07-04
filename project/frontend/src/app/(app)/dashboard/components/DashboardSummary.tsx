import React from 'react';
import { Calendar, DollarSign, Clock, CheckCircle, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface Kpis {
  todayOrders: number;
  todayRevenue: number;
  pendingPayments: number;
  completedOrders: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
}

interface DashboardSummaryProps {
  kpis: Kpis;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ kpis }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const cards = [
    {
      title: "Today's Orders",
      value: kpis.todayOrders,
      subtitle: "Scheduled events today",
      icon: Calendar,
      color: "bg-info/8 text-info border-info/20",
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(kpis.todayRevenue),
      subtitle: "Payments received today",
      icon: DollarSign,
      color: "bg-success/8 text-success border-success/20",
    },
    {
      title: "Pending Payments",
      value: formatCurrency(kpis.pendingPayments),
      subtitle: "Outstanding invoice balance",
      icon: Clock,
      color: "bg-warning/8 text-warning border-warning/20",
    },
    {
      title: "Completed Orders",
      value: kpis.completedOrders,
      subtitle: "Total successfully delivered",
      icon: CheckCircle,
      color: "bg-primary/8 text-primary border-primary/20",
    },
  ];

  const subCards = [
    {
      title: "Monthly Revenue",
      value: formatCurrency(kpis.monthlyRevenue),
      icon: Wallet,
      color: "text-success",
      change: "This month",
      trend: ArrowUpRight,
      trendColor: "text-success",
    },
    {
      title: "Monthly Expenses",
      value: formatCurrency(kpis.monthlyExpenses),
      icon: ArrowDownRight,
      color: "text-destructive",
      change: "This month",
      trend: ArrowDownRight,
      trendColor: "text-destructive",
    },
    {
      title: "Monthly Profit",
      value: formatCurrency(kpis.monthlyProfit),
      icon: TrendingUpIcon,
      color: "text-primary",
      change: "Estimated",
      trend: ArrowUpRight,
      trendColor: "text-primary",
    },
  ];

  function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary KPI Grid: 1 col on mobile, 2 on md, 4 on lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`relative overflow-hidden rounded-xl border p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 bg-card ${card.color}`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold tracking-tight font-display text-foreground">{card.value}</p>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Monthly Metrics Row: 1 col on mobile, 3 on md */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subCards.map((card, i) => {
          const Icon = card.icon;
          const Trend = card.trend;
          return (
            <div
              key={i}
              className="card-base p-6 transition-all duration-200 hover:border-primary/20"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{card.title}</span>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold text-foreground font-display">{card.value}</span>
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${card.trendColor}`}>
                  <Trend className="h-3 w-3" />
                  {card.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardSummary;
