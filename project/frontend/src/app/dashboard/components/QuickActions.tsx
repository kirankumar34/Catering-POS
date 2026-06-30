import React from 'react';
import Link from 'next/link';
import { PlusCircle, FileText, Utensils, IndianRupee } from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    {
      label: "Create Bill",
      desc: "New invoice & order builder",
      href: "/billing",
      icon: FileText,
      color: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5 hover:border-indigo-500/50 hover:bg-indigo-500/10",
    },
    {
      label: "Add Customer",
      desc: "Register a VIP/Regular profile",
      href: "/customers/new",
      icon: PlusCircle,
      color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:border-emerald-500/50 hover:bg-emerald-500/10",
    },
    {
      label: "Catering Menus",
      desc: "Customize packages & rates",
      href: "/menus",
      icon: Utensils,
      color: "border-amber-500/20 text-amber-400 bg-amber-500/5 hover:border-amber-500/50 hover:bg-amber-500/10",
    },
    {
      label: "Record Expense",
      desc: "Log logistics & groceries",
      href: "/expenses",
      icon: IndianRupee,
      color: "border-rose-500/20 text-rose-400 bg-rose-500/5 hover:border-rose-500/50 hover:bg-rose-500/10",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg">
      <h3 className="text-lg font-bold text-white mb-4 font-outfit">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <Link
              key={i}
              href={act.href}
              className={`flex items-start gap-4 rounded-xl border p-4 transition-all duration-300 group hover:-translate-y-0.5 ${act.color}`}
            >
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 group-hover:scale-105 transition-all duration-300">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-white group-hover:text-white/90 text-sm">{act.label}</p>
                <p className="text-xs text-slate-400 opacity-80">{act.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
