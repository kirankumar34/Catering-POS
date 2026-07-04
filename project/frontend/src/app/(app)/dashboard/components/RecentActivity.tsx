import React from 'react';
import { Calendar, User, ShoppingBag, PlusCircle, CreditCard } from 'lucide-react';

interface Event {
  id: string;
  orderNumber: string;
  numberOfPlates: number;
  eventDate: string;
  grandTotal: number;
  status: string;
  customer: {
    name: string;
    phone: string;
  };
}

interface Activity {
  id: string;
  action: string;
  details?: string;
  createdAt: string;
  user: {
    username: string;
    role: {
      name: string;
    };
  };
}

interface RecentActivityProps {
  upcomingEvents: Event[];
  recentActivity?: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ upcomingEvents, recentActivity = [] }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Fallback activity logs
  const displayActivities = recentActivity.length > 0 ? recentActivity : [
    {
      id: '1',
      action: 'USER_LOGIN',
      details: 'Super Admin logged in from local environment',
      createdAt: new Date().toISOString(),
      user: { username: 'admin', role: { name: 'SUPER_ADMIN' } },
    },
    {
      id: '2',
      action: 'ROLE_UPSERT',
      details: 'Upserted core roles (SUPER_ADMIN, OWNER, STAFF)',
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      user: { username: 'admin', role: { name: 'SUPER_ADMIN' } },
    },
    {
      id: '3',
      action: 'DATABASE_SEED',
      details: 'Populated initial system seed and default user credentials',
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      user: { username: 'admin', role: { name: 'SUPER_ADMIN' } },
    },
  ];

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'USER_LOGIN':
        return <User className="h-4 w-4 text-info" />;
      case 'DATABASE_SEED':
      case 'ROLE_UPSERT':
        return <PlusCircle className="h-4 w-4 text-success" />;
      case 'ORDER_CREATE':
        return <ShoppingBag className="h-4 w-4 text-accent" />;
      case 'PAYMENT_RECEIVE':
        return <CreditCard className="h-4 w-4 text-primary" />;
      default:
        return <PlusCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upcoming Events Column */}
      <div className="card-base p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground font-display">Upcoming Catering Events</h3>
            <p className="text-xs text-muted-foreground">Next scheduled bookings and menu selections</p>
          </div>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/40 mb-3 stroke-[1.5]" />
            <p className="text-sm font-medium text-muted-foreground">No upcoming events scheduled</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Create a catering order to see it listed here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30 hover:border-primary/20 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/8 text-primary border border-primary/10">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground text-sm">{evt.customer.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span>{evt.orderNumber}</span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span>{evt.numberOfPlates} Plates</span>
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="font-bold text-foreground text-sm">{formatCurrency(evt.grandTotal)}</p>
                  <p className="text-xs text-primary font-semibold">{formatDate(evt.eventDate)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activities Audit Logs */}
      <div className="card-base p-6">
        <div>
          <h3 className="text-lg font-bold text-foreground font-display">Audit & Activity Log</h3>
          <p className="text-xs text-muted-foreground">Live feed of user actions and record edits</p>
        </div>

        <div className="relative pl-6 mt-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
          {displayActivities.map((act) => (
            <div key={act.id} className="relative flex items-start gap-4 group">
              <div className="absolute -left-[21px] p-1.5 rounded-full bg-card border border-border group-hover:border-primary/30 transition-colors duration-200 z-10">
                {getActivityIcon(act.action)}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-baseline gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {act.action.replace(/_/g, ' ')}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(act.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{act.details}</p>
                <p className="text-[10px] text-muted-foreground/75 font-medium">
                  By {act.user.username} ({act.user.role.name})
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
