import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PageHeader, LoadingSpinner, EmptyState } from '../components/SharedComponents';
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
      
      // Create lookup maps
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
      toast.error('Failed to load bookings');
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
        title="Bookings"
        description="View all tee time bookings"
      />

      {bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings yet"
          description="Bookings will appear here once users start making reservations."
        />
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Players</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Booked On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                const teeTime = teeTimes[booking.teeTimeId] || {};
                const courseName = courses[teeTime.courseId] || 'Unknown';
                
                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {users[booking.userId] || 'Unknown User'}
                    </TableCell>
                    <TableCell>{courseName}</TableCell>
                    <TableCell>{teeTime.date || '-'}</TableCell>
                    <TableCell>{teeTime.time || '-'}</TableCell>
                    <TableCell>{booking.playersCount}</TableCell>
                    <TableCell>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(booking.createdAt).toLocaleDateString()}
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
