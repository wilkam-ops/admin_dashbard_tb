import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PageHeader, LoadingSpinner, EmptyState } from '../components/SharedComponents';
import { useTranslation } from '../contexts/I18nContext';
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
  const { t } = useTranslation();

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
      toast.error(t.messages.loadFailed);
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
      toast.success(t.messages.teeTimeCreated);
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error(t.messages.teeTimeCreatedFailed);
    }
  };

  const handleDelete = async (teeTimeId) => {
    if (!window.confirm(t.messages.confirmDelete + ' cet horaire ?')) return;
    
    try {
      await api.deleteTeeTime(teeTimeId);
      toast.success(t.messages.teeTimeDeleted);
      loadData();
    } catch (error) {
      toast.error(t.messages.teeTimeDeleteFailed);
    }
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : t.common.unknown;
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
        title={t.teeTimes.title}
        description={t.teeTimes.description}
        action={
          <Button onClick={handleAdd} disabled={courses.length === 0}>
            <Plus className="w-4 h-4 mr-2" />
            {t.teeTimes.addTeeTime}
          </Button>
        }
      />

      {courses.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-muted-foreground text-center">
            {t.teeTimes.addCoursesFirst}
          </p>
        </div>
      ) : teeTimes.length === 0 ? (
        <EmptyState
          icon={Clock}
          title={t.teeTimes.noTeeTimes}
          description={t.teeTimes.noTeeTimesDescription}
          action={
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              {t.teeTimes.addTeeTime}
            </Button>
          }
        />
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.teeTimes.course}</TableHead>
                <TableHead>{t.teeTimes.date}</TableHead>
                <TableHead>{t.teeTimes.time}</TableHead>
                <TableHead>{t.teeTimes.availableSlots}</TableHead>
                <TableHead>{t.users.status}</TableHead>
                <TableHead className="text-right">{t.common.actions}</TableHead>
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
                      {teeTime.availableSlots > 0 ? t.teeTimes.available : t.teeTimes.full}
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

      {/* Dialogue Ajouter */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.teeTimes.addNewTeeTime}</DialogTitle>
            <DialogDescription>
              {t.teeTimes.createTeeTimeSlot}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t.teeTimes.course}</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) => setFormData({ ...formData, courseId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.teeTimes.selectCourse} />
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
              <Label>{t.teeTimes.date}</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.teeTimes.time}</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.teeTimes.maxSlots}</Label>
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
              {t.common.cancel}
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.courseId}>
              {t.common.create}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
