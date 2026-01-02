import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard, PageHeader, LoadingSpinner } from '../components/SharedComponents';
import { useTranslation } from '../contexts/I18nContext';
import { api } from '../lib/api';
import { Users, Calendar, Trophy, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      toast.error(t.messages.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={t.dashboard.title}
        description={t.dashboard.description}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t.dashboard.totalUsers}
          value={stats?.totalUsers || 0}
          icon={Users}
          colorClass="bg-primary"
        />
        <StatCard
          title={t.dashboard.activeBookings}
          value={stats?.totalBookings || 0}
          icon={Calendar}
          colorClass="bg-secondary"
        />
        <StatCard
          title={t.dashboard.golfCourses}
          value={stats?.totalCourses || 0}
          icon={MapPin}
          colorClass="bg-accent"
        />
        <StatCard
          title={t.dashboard.competitions}
          value={stats?.upcomingCompetitions || 0}
          icon={Trophy}
          colorClass="bg-chart-4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">{t.dashboard.quickStats}</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">{t.dashboard.totalUsers}</span>
              <span className="font-semibold text-foreground">{stats?.totalUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">{t.dashboard.activeBookings}</span>
              <span className="font-semibold text-foreground">{stats?.totalBookings || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">{t.dashboard.activeSubscriptions}</span>
              <span className="font-semibold text-foreground">{stats?.activeSubscriptions || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">{t.dashboard.golfCourses}</span>
              <span className="font-semibold text-foreground">{stats?.totalCourses || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="w-5 h-5 text-secondary" />
            <h3 className="text-lg font-semibold text-foreground">{t.dashboard.platformActivity}</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-primary-light rounded-lg">
              <p className="text-sm font-medium text-primary mb-1">{t.dashboard.welcomeMessage}</p>
              <p className="text-xs text-primary/80">
                {t.dashboard.welcomeDescription}
              </p>
            </div>
            <div className="p-4 bg-secondary-light rounded-lg">
              <p className="text-sm font-medium text-secondary mb-1">{t.dashboard.gettingStarted}</p>
              <p className="text-xs text-secondary/80">
                {t.dashboard.gettingStartedDescription}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground mb-1">{t.dashboard.needHelp}</p>
              <p className="text-xs text-muted-foreground">
                {t.dashboard.needHelpDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
