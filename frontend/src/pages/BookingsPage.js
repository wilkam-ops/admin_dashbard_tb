import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PageHeader, LoadingSpinner, EmptyState } from '../components/SharedComponents';
import { useTranslation } from '../contexts/I18nContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { api } from '../lib/api';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';

export const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState({});
  const [teeTimes, setTeeTimes] = useState({});
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsData, usersData, teeTimesData, coursesData] = await Promise.all([
        api.getBookings(),
        api.getUsers(),
        api.getTeeTimes(),
        api.getCourses(),
      ]);
      
      setBookings(bookingsData);
      
      // Créer des maps de lookup
      const usersMap = {};
      usersData.forEach(user => {
        usersMap[user.id] = `${user.firstName} ${user.lastName}`;
      });
      setUsers(usersMap);
      
      const teeTimesMap = {};
      teeTimesData.forEach(tt => {
        teeTimesMap[tt.id] = tt;
      });
      setTeeTimes(teeTimesMap);
      
      const coursesMap = {};
      coursesData.forEach(course => {
        coursesMap[course.id] = course.name;
      });
      setCourses(coursesMap);
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
        title={t.bookings.title}
        description={t.bookings.description}
      />

      {bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={t.bookings.noBookings}
          description={t.bookings.noBookingsDescription}
        />
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.bookings.user}</TableHead>
                <TableHead>{t.bookings.course}</TableHead>
                <TableHead>{t.bookings.date}</TableHead>
                <TableHead>{t.bookings.time}</TableHead>
                <TableHead>{t.bookings.players}</TableHead>
                <TableHead>{t.bookings.status}</TableHead>
                <TableHead>{t.bookings.bookedOn}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                const teeTime = teeTimes[booking.teeTimeId] || {};
                const courseName = courses[teeTime.courseId] || t.common.unknown;
                
                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {users[booking.userId] || t.common.unknown}
                    </TableCell>
                    <TableCell>{courseName}</TableCell>
                    <TableCell>{teeTime.date || '-'}</TableCell>
                    <TableCell>{teeTime.time || '-'}</TableCell>
                    <TableCell>{booking.playersCount}</TableCell>
                    <TableCell>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status === 'confirmed' ? t.bookings.confirmed : t.bookings.cancelled}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(booking.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardLayout>
  );
};
