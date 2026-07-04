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
      color: "border-primary/20 text-primary bg-primary/5 hover:border-primary/50 hover:bg-primary/10",
    },
    {
      label: "Add Customer",
      desc: "Register a VIP/Regular profile",
      href: "/customers/new",
      icon: PlusCircle,
      color: "border-success/20 text-success bg-success/5 hover:border-success/50 hover:bg-success/10",
    },
    {
      label: "Catering Menus",
      desc: "Customize packages & rates",
      href: "/menus",
      icon: Utensils,
      color: "border-accent/20 text-accent bg-accent/5 hover:border-accent/50 hover:bg-accent/10",
    },
    {
      label: "Record Expense",
      desc: "Log logistics & groceries",
      href: "/expenses",
      icon: IndianRupee,
      color: "border-destructive/20 text-destructive bg-destructive/5 hover:border-destructive/50 hover:bg-destructive/10",
    },
  ];

  return (
    <div className="card-base p-6">
      <h3 className="text-lg font-bold text-foreground mb-4 font-display">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <Link
              key={i}
              href={act.href}
              className={`flex items-start gap-4 rounded-xl border p-4 transition-all duration-200 group hover:-translate-y-0.5 min-h-[44px] ${act.color}`}
            >
              <div className="p-3 rounded-lg bg-card border border-border group-hover:scale-105 transition-transform duration-200">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground text-sm">{act.label}</p>
                <p className="text-xs text-muted-foreground">{act.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
