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
      color: "from-blue-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/20",
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(kpis.todayRevenue),
      subtitle: "Payments received today",
      icon: DollarSign,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Pending Payments",
      value: formatCurrency(kpis.pendingPayments),
      subtitle: "Outstanding invoice balance",
      icon: Clock,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/20",
    },
    {
      title: "Completed Orders",
      value: kpis.completedOrders,
      subtitle: "Total successfully delivered",
      icon: CheckCircle,
      color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/20",
    },
  ];

  const subCards = [
    {
      title: "Monthly Revenue",
      value: formatCurrency(kpis.monthlyRevenue),
      icon: Wallet,
      color: "text-emerald-400",
      change: "This month",
      trend: ArrowUpRight,
      trendColor: "text-emerald-500",
    },
    {
      title: "Monthly Expenses",
      value: formatCurrency(kpis.monthlyExpenses),
      icon: ArrowDownRight,
      color: "text-rose-400",
      change: "This month",
      trend: ArrowDownRight,
      trendColor: "text-rose-500",
    },
    {
      title: "Monthly Profit",
      value: formatCurrency(kpis.monthlyProfit),
      icon: TrendingUpIcon,
      color: "text-indigo-400",
      change: "Estimated",
      trend: ArrowUpRight,
      trendColor: "text-indigo-500",
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
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl/20 ${card.color}`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium opacity-80">{card.title}</p>
                  <p className="text-3xl font-bold tracking-tight font-outfit">{card.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-4 text-xs opacity-60 flex items-center gap-1">
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Monthly Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subCards.map((card, i) => {
          const Icon = card.icon;
          const Trend = card.trend;
          return (
            <div
              key={i}
              className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg hover:border-slate-700/60 transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-slate-400">{card.title}</span>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold text-white font-outfit">{card.value}</span>
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
