import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PageHeader, LoadingSpinner, EmptyState } from '../components/SharedComponents';
import { useTranslation } from '../contexts/I18nContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { api } from '../lib/api';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    holesCount: 18,
  });
  const { t } = useTranslation();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await api.getCourses();
      setCourses(data);
    } catch (error) {
      toast.error(t.messages.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setFormData({ name: '', description: '', holesCount: 18 });
    setDialogOpen(true);
  };

  const handleEdit = (course) => {
    setEditMode(true);
    setCurrentCourse(course);
    setFormData({
      name: course.name,
      description: course.description || '',
      holesCount: course.holesCount,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await api.updateCourse(currentCourse.id, formData);
        toast.success(t.messages.courseUpdated);
      } else {
        await api.createCourse(formData);
        toast.success(t.messages.courseCreated);
      }
      setDialogOpen(false);
      loadCourses();
    } catch (error) {
      toast.error(editMode ? t.messages.courseUpdateFailed : t.messages.courseCreatedFailed);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm(t.messages.confirmDelete + ' ce parcours ?')) return;
    
    try {
      await api.deleteCourse(courseId);
      toast.success(t.messages.courseDeleted);
      loadCourses();
    } catch (error) {
      toast.error(t.messages.courseDeleteFailed);
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
        title={t.courses.title}
        description={t.courses.description}
        action={
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            {t.courses.addCourse}
          </Button>
        }
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title={t.courses.noCourses}
          description={t.courses.noCoursesDescription}
          action={
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              {t.courses.addCourse}
            </Button>
          }
        />
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.courses.courseName}</TableHead>
                <TableHead>{t.courses.description}</TableHead>
                <TableHead>{t.courses.holesCount}</TableHead>
                <TableHead className="text-right">{t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {course.description || '-'}
                  </TableCell>
                  <TableCell>{course.holesCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(course)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialogue Ajouter/Modifier */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? t.courses.editCourse : t.courses.addNewCourse}</DialogTitle>
            <DialogDescription>
              {editMode ? t.courses.updateCourseInfo : t.courses.createNewCourse}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t.courses.courseName}</Label>
              <Input
                placeholder={t.courses.courseNamePlaceholder}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.courses.description}</Label>
              <Textarea
                placeholder={t.courses.descriptionPlaceholder}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.courses.holesCount}</Label>
              <Input
                type="number"
                value={formData.holesCount}
                onChange={(e) => setFormData({ ...formData, holesCount: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSubmit}>
              {editMode ? t.common.saveChanges : t.courses.createCourse}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
