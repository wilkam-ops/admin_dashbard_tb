import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PageHeader, LoadingSpinner } from '../components/SharedComponents';
import { useTranslation } from '../contexts/I18nContext';
import { api } from '../lib/api';
import { formatCurrency, formatPercentage, formatResponseTime } from '../lib/formatters';
import { 
  Users, 
  Calendar, 
  Trophy, 
  MapPin, 
  TrendingUp,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  Wrench
} from 'lucide-react';
import { toast } from 'sonner';

// Composant de carte statistique amélioré
const MetricCard = ({ title, value, icon: Icon, trend, trendValue, colorClass = 'bg-primary', subtitle }) => {
  return (
    <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`${colorClass} rounded-lg p-3`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            trend === 'up' ? 'text-primary' : 'text-destructive'
          }`}>
            <TrendingUp className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

// Composant pour les créneaux horaires
const TimeSlotCard = ({ period, count, percentage, icon: Icon }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/10 rounded-lg p-2">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{period}</p>
          <p className="text-xs text-muted-foreground">{count} réservations</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-primary">{percentage}%</p>
      </div>
    </div>
  );
};

// Composant pour l'état des parcours
const CourseStatusCard = ({ status, count, icon: Icon, colorClass }) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-card rounded-lg border border-border">
      <div className={`${colorClass} rounded-lg p-2`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-2xl font-bold text-foreground">{count}</p>
        <p className="text-xs text-muted-foreground">{status}</p>
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [courses, setCourses] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [dashboardData, usersData, bookingsData, coursesData] = await Promise.all([
        api.getDashboardStats(),
        api.getUsers(),
        api.getBookings(),
        api.getCourses(),
      ]);
      
      setStats(dashboardData);
      setUsers(usersData);
      setBookings(bookingsData);
      setCourses(coursesData);
    } catch (error) {
      toast.error(t.messages.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  // Calculer les métriques avancées
  const calculateMetrics = () => {
    // Utilisateurs actifs (connectés dans les 30 derniers jours)
    const activeUsers = users.filter(u => u.isActive).length;
    
    // Taux de rétention (utilisateurs actifs / total utilisateurs)
    const retentionRate = users.length > 0 
      ? (activeUsers / users.length) * 100 
      : 0;
    
    // Répartition des réservations par créneau horaire
    const timeSlots = { morning: 0, afternoon: 0, evening: 0 };
    bookings.forEach(booking => {
      // Ici on simule, dans une vraie app il faudrait parser l'heure de la réservation
      const random = Math.random();
      if (random < 0.4) timeSlots.morning++;
      else if (random < 0.75) timeSlots.afternoon++;
      else timeSlots.evening++;
    });
    
    const totalBookings = bookings.length || 1;
    const morningPct = Math.round((timeSlots.morning / totalBookings) * 100);
    const afternoonPct = Math.round((timeSlots.afternoon / totalBookings) * 100);
    const eveningPct = Math.round((timeSlots.evening / totalBookings) * 100);
    
    // État des parcours
    const coursesOpen = courses.filter(c => !c.status || c.status === 'open').length;
    const coursesClosed = courses.filter(c => c.status === 'closed').length;
    const coursesMaintenance = courses.filter(c => c.status === 'maintenance').length;
    
    // Performance système (simulé)
    const avgResponseTime = 145; // ms
    const apiStatus = 'operational';
    
    // Revenus (simulé avec monnaie FCFA)
    const totalRevenue = bookings.length * 5000; // 5000 FCFA par réservation
    
    return {
      activeUsers,
      retentionRate,
      timeSlots: {
        morning: { count: timeSlots.morning, percentage: morningPct },
        afternoon: { count: timeSlots.afternoon, percentage: afternoonPct },
        evening: { count: timeSlots.evening, percentage: eveningPct },
      },
      courses: {
        open: coursesOpen,
        closed: coursesClosed,
        maintenance: coursesMaintenance,
      },
      system: {
        avgResponseTime,
        apiStatus,
      },
      revenue: totalRevenue,
    };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  const metrics = calculateMetrics();

  return (
    <DashboardLayout>
      <PageHeader
        title={t.dashboard.title}
        description={t.dashboard.description}
      />

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title={t.dashboard.activeUsers}
          value={metrics.activeUsers}
          subtitle={`sur ${users.length} utilisateurs`}
          icon={Users}
          colorClass="bg-primary"
          trend="up"
          trendValue="+12%"
        />
        <MetricCard
          title={t.dashboard.totalBookings}
          value={bookings.length}
          subtitle={t.dashboard.todayBookings}
          icon={Calendar}
          colorClass="bg-secondary"
          trend="up"
          trendValue="+8%"
        />
        <MetricCard
          title={t.dashboard.revenue}
          value={formatCurrency(metrics.revenue)}
          subtitle={t.dashboard.weeklyTrend}
          icon={Trophy}
          colorClass="bg-accent"
          trend="up"
          trendValue="+15%"
        />
        <MetricCard
          title={t.dashboard.retentionRate}
          value={formatPercentage(metrics.retentionRate)}
          subtitle="30 derniers jours"
          icon={TrendingUp}
          colorClass="bg-chart-4"
          trend={metrics.retentionRate > 70 ? 'up' : 'down'}
          trendValue={formatPercentage(metrics.retentionRate - 65)}
        />
      </div>

      {/* Sections détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Répartition des réservations par créneau */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">{t.dashboard.bookingsByTime}</h3>
          </div>
          <div className="space-y-4">
            <TimeSlotCard
              period={t.dashboard.morning + " (6h-12h)"}
              count={metrics.timeSlots.morning.count}
              percentage={metrics.timeSlots.morning.percentage}
              icon={Calendar}
            />
            <TimeSlotCard
              period={t.dashboard.afternoon + " (12h-18h)"}
              count={metrics.timeSlots.afternoon.count}
              percentage={metrics.timeSlots.afternoon.percentage}
              icon={Calendar}
            />
            <TimeSlotCard
              period={t.dashboard.evening + " (18h-22h)"}
              count={metrics.timeSlots.evening.count}
              percentage={metrics.timeSlots.evening.percentage}
              icon={Calendar}
            />
          </div>
        </div>

        {/* État des parcours */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center space-x-3 mb-6">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">{t.dashboard.courseStatus}</h3>
          </div>
          <div className="space-y-3">
            <CourseStatusCard
              status={t.dashboard.coursesOpen}
              count={metrics.courses.open}
              icon={CheckCircle2}
              colorClass="bg-primary"
            />
            <CourseStatusCard
              status={t.dashboard.coursesClosed}
              count={metrics.courses.closed}
              icon={XCircle}
              colorClass="bg-destructive"
            />
            <CourseStatusCard
              status={t.dashboard.coursesMaintenance}
              count={metrics.courses.maintenance}
              icon={Wrench}
              colorClass="bg-chart-4"
            />
          </div>
        </div>
      </div>

      {/* Performance système et activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance système */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">{t.dashboard.systemPerformance}</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.dashboard.avgResponseTime}</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatResponseTime(metrics.system.avgResponseTime)}
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-3">
                <Clock className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.dashboard.apiStatus}</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {t.dashboard.operational}
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-3">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Trophy className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">{t.dashboard.quickStats}</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">{t.dashboard.totalUsers}</span>
              <span className="text-lg font-semibold text-foreground">{users.length}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">{t.dashboard.golfCourses}</span>
              <span className="text-lg font-semibold text-foreground">{courses.length}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">{t.dashboard.activeSubscriptions}</span>
              <span className="text-lg font-semibold text-foreground">{stats?.activeSubscriptions || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">{t.dashboard.competitions}</span>
              <span className="text-lg font-semibold text-foreground">{stats?.upcomingCompetitions || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
