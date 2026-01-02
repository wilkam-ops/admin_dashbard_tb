import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PageHeader, LoadingSpinner, EmptyState } from '../components/SharedComponents';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
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
import { Clock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const TeeTimesPage = () => {
  const [teeTimes, setTeeTimes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    date: '',
    time: '',
    maxSlots: 4,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [teeTimesData, coursesData] = await Promise.all([
        api.getTeeTimes(),
        api.getCourses(),
      ]);
      setTeeTimes(teeTimesData);
      setCourses(coursesData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({ courseId: '', date: today, time: '09:00', maxSlots: 4 });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      await api.createTeeTime({
        ...formData,
        maxSlots: parseInt(formData.maxSlots),
      });
      toast.success('Tee time created successfully');
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create tee time');
    }
  };

  const handleDelete = async (teeTimeId) => {
    if (!window.confirm('Are you sure you want to delete this tee time?')) return;
    
    try {
      await api.deleteTeeTime(teeTimeId);
      toast.success('Tee time deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete tee time');
    }
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown Course';
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
        title="Tee Times"
        description="Manage available tee times for bookings"
        action={
          <Button onClick={handleAdd} disabled={courses.length === 0}>
            <Plus className="w-4 h-4 mr-2" />
            Add Tee Time
          </Button>
        }
      />

      {courses.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-muted-foreground text-center">
            Please add golf courses first before creating tee times.
          </p>
        </div>
      ) : teeTimes.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No tee times yet"
          description="Get started by adding available tee times for your courses."
          action={
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Tee Time
            </Button>
          }
        />
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Available Slots</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teeTimes.map((teeTime) => (
                <TableRow key={teeTime.id}>
                  <TableCell className="font-medium">
                    {getCourseName(teeTime.courseId)}
                  </TableCell>
                  <TableCell>{teeTime.date}</TableCell>
                  <TableCell>{teeTime.time}</TableCell>
                  <TableCell>
                    {teeTime.availableSlots} / {teeTime.maxSlots}
                  </TableCell>
                  <TableCell>
                    <Badge variant={teeTime.availableSlots > 0 ? 'default' : 'secondary'}>
                      {teeTime.availableSlots > 0 ? 'Available' : 'Full'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(teeTime.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Tee Time</DialogTitle>
            <DialogDescription>
              Create a new available tee time slot.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Golf Course</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) => setFormData({ ...formData, courseId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Slots</Label>
              <Input
                type="number"
                value={formData.maxSlots}
                onChange={(e) => setFormData({ ...formData, maxSlots: e.target.value })}
                min="1"
                max="8"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.courseId}>
              Create Tee Time
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
