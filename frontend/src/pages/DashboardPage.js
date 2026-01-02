import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard, PageHeader, LoadingSpinner } from '../components/SharedComponents';
import { api } from '../lib/api';
import { Users, Calendar, Trophy, MapPin, Activity } from 'lucide-react';
import { toast } from 'sonner';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
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
        title="Dashboard"
        description="Overview of your golf booking platform"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          colorClass="bg-primary"
        />
        <StatCard
          title="Active Bookings"
          value={stats?.totalBookings || 0}
          icon={Calendar}
          colorClass="bg-secondary"
        />
        <StatCard
          title="Golf Courses"
          value={stats?.totalCourses || 0}
          icon={MapPin}
          colorClass="bg-accent"
        />
        <StatCard
          title="Competitions"
          value={stats?.upcomingCompetitions || 0}
          icon={Trophy}
          colorClass="bg-chart-4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Quick Stats</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Total Users</span>
              <span className="font-semibold text-foreground">{stats?.totalUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Active Bookings</span>
              <span className="font-semibold text-foreground">{stats?.totalBookings || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Active Subscriptions</span>
              <span className="font-semibold text-foreground">{stats?.activeSubscriptions || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">Golf Courses</span>
              <span className="font-semibold text-foreground">{stats?.totalCourses || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="w-5 h-5 text-secondary" />
            <h3 className="text-lg font-semibold text-foreground">Platform Activity</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-primary-light rounded-lg">
              <p className="text-sm font-medium text-primary mb-1">Welcome to TeeBook Admin</p>
              <p className="text-xs text-primary/80">
                Manage your golf booking platform efficiently from this dashboard.
              </p>
            </div>
            <div className="p-4 bg-secondary-light rounded-lg">
              <p className="text-sm font-medium text-secondary mb-1">Getting Started</p>
              <p className="text-xs text-secondary/80">
                Add golf courses, create tee times, and manage user bookings.
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground mb-1">Need Help?</p>
              <p className="text-xs text-muted-foreground">
                Navigate using the sidebar to access different sections.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
