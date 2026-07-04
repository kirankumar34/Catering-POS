'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from 'next-themes';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  IndianRupee,
  Receipt,
  Package,
  BarChart3,
  Settings,
  Utensils,
  FileText,
  LogOut,
  MoreHorizontal,
  X,
  Sun,
  Moon,
  Bell,
  Check,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** If true, shown in mobile bottom bar. Otherwise in "More" overflow. */
  primary?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, primary: true },
  { label: 'Orders', href: '/orders', icon: ShoppingBag, primary: true },
  { label: 'Customers', href: '/customers', icon: Users, primary: true },
  { label: 'Payments', href: '/payments', icon: IndianRupee, primary: true },
  { label: 'Menus', href: '/menus', icon: Utensils },
  { label: 'Expenses', href: '/expenses', icon: Receipt },
  { label: 'Inventory', href: '/inventory', icon: Package },
  { label: 'Billing', href: '/billing', icon: FileText },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const PRIMARY_ITEMS = NAV_ITEMS.filter((item) => item.primary);
const OVERFLOW_ITEMS = NAV_ITEMS.filter((item) => !item.primary);

interface NotificationItem {
  id: string;
  orderId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, clearAuth } = useAuthStore();
  const [moreOpen, setMoreOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const { data: notifications, refetch: refetchNotifications } = useQuery<NotificationItem[]>({
    queryKey: ['unreadNotifications'],
    queryFn: async () => {
      const res = await api.get('/notifications/unread');
      return res.data;
    },
    enabled: !!token,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      refetchNotifications();
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/read-all');
    },
    onSuccess: () => {
      refetchNotifications();
    },
  });

  // Auth guard
  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const isOverflowActive = OVERFLOW_ITEMS.some((item) => isActive(item.href));

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* ================================================================
          DESKTOP SIDEBAR (≥ 768px)
          ================================================================ */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r border-border z-30">
        {/* Brand Mark */}
        <div className="p-5 border-b border-border flex items-center gap-3">
          <img src="/images/logo.png" alt="Seisuvai Catering logo" className="h-9 w-9 rounded-lg object-cover" />
          <div className="space-y-0.5">
            <h1 className="font-display font-bold text-sm tracking-tight text-foreground uppercase">
              Seisuvai
            </h1>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              Catering Billing
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                  active
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${active ? 'text-primary' : ''}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile + Logout */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="h-9 w-9 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-primary font-display text-sm">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="space-y-0.5 overflow-hidden flex-1">
              <p className="font-semibold text-sm text-foreground truncate">
                {user?.username || 'User'}
              </p>
              <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider bg-primary/10 text-primary border border-primary/10 uppercase">
                {user?.role || ''}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center border border-transparent hover:border-border"
                title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {resolvedTheme === 'dark' ? <Sun className="h-4.5 w-4.5 text-primary" /> : <Moon className="h-4.5 w-4.5 text-muted-foreground" />}
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setBellOpen(!bellOpen)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer relative min-h-[40px] min-w-[40px] flex items-center justify-center border border-transparent hover:border-border"
                title="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                {notifications && notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 bg-destructive text-[8px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {/* Notification Popover Panel */}
              {bellOpen && (
                <div className="absolute left-0 bottom-12 w-80 max-h-96 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="p-3 border-b border-border flex items-center justify-between bg-secondary/35">
                    <span className="text-xs font-bold text-foreground font-display">Event Reminders</span>
                    {notifications && notifications.length > 0 && (
                      <button
                        onClick={() => markAllReadMutation.mutate()}
                        className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto divide-y divide-border flex-1 max-h-64">
                    {notifications && notifications.length > 0 ? (
                      notifications.map((n: NotificationItem) => (
                        <div key={n.id} className="p-3 hover:bg-secondary/20 transition-colors flex items-start gap-2.5">
                          <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground font-medium leading-normal">{n.message}</p>
                            <p className="text-[9px] text-muted-foreground mt-1">
                              {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <button
                            onClick={() => markReadMutation.mutate(n.id)}
                            className="p-1 rounded-md text-muted-foreground hover:text-success hover:bg-success/10 cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
                            title="Dismiss"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-muted-foreground">
                        No unread notifications.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-colors duration-150 text-sm font-semibold cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================================================================
          MOBILE TOP HEADER (< 768px)
          ================================================================ */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="Seisuvai Catering logo" className="h-8 w-8 rounded-lg object-cover" />
          <span className="font-display font-bold text-sm tracking-tight text-foreground uppercase">
            Seisuvai
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Theme Toggle Mobile */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer min-h-[40px] flex items-center justify-center border border-transparent"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-4.5 w-4.5 text-primary" /> : <Moon className="h-4.5 w-4.5 text-muted-foreground" />}
            </button>
          )}

          {/* Notifications Bell Mobile */}
          <div className="relative">
            <button
              onClick={() => setBellOpen(!bellOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer relative min-h-[40px] flex items-center justify-center border border-transparent"
            >
              <Bell className="h-4.5 w-4.5" />
              {notifications && notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-3 w-3 bg-destructive text-[8px] font-bold text-white rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {/* Mobile Notification Dropdown */}
            {bellOpen && (
              <div className="absolute right-0 top-10 w-80 max-h-96 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 border-b border-border flex items-center justify-between bg-secondary/35">
                  <span className="text-xs font-bold text-foreground font-display">Event Reminders</span>
                  {notifications && notifications.length > 0 && (
                    <button
                      onClick={() => {
                        markAllReadMutation.mutate();
                        setBellOpen(false);
                      }}
                      className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto divide-y divide-border flex-1 max-h-64">
                  {notifications && notifications.length > 0 ? (
                    notifications.map((n: NotificationItem) => (
                      <div key={n.id} className="p-3 hover:bg-secondary/20 transition-colors flex items-start gap-2.5">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground font-medium leading-normal">{n.message}</p>
                          <p className="text-[9px] text-muted-foreground mt-1">
                            {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <button
                          onClick={() => markReadMutation.mutate(n.id)}
                          className="p-1 rounded-md text-muted-foreground hover:text-success hover:bg-success/10 cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
                          title="Dismiss"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      No unread notifications.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-7 w-7 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-primary font-display text-xs shrink-0">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </header>

      {/* ================================================================
          MAIN CONTENT
          ================================================================ */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {children}
      </main>

      {/* ================================================================
          MOBILE BOTTOM TAB BAR (< 768px)
          ================================================================ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1">
          {PRIMARY_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1.5 rounded-lg transition-colors duration-150 ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-semibold mt-0.5 leading-none">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More overflow trigger */}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1.5 rounded-lg transition-colors duration-150 cursor-pointer ${
              isOverflowActive
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-semibold mt-0.5 leading-none">More</span>
          </button>
        </div>
      </nav>

      {/* ================================================================
          MOBILE "MORE" OVERFLOW SHEET
          ================================================================ */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMoreOpen(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl border-t border-border p-4 pb-8 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-lg text-foreground">More</h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {OVERFLOW_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-colors duration-150 min-h-[80px] ${
                      active
                        ? 'border-primary/30 bg-primary/5 text-primary'
                        : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Logout in overflow */}
            <button
              onClick={() => {
                setMoreOpen(false);
                handleLogout();
              }}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/5 transition-colors font-semibold text-sm cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.25s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-up {
            animation: none;
          }
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
      `}</style>
    </div>
  );
}
