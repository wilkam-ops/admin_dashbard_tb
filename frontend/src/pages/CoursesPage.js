import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PageHeader, LoadingSpinner, EmptyState } from '../components/SharedComponents';
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

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await api.getCourses();
      setCourses(data);
    } catch (error) {
      toast.error('Failed to load courses');
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
        toast.success('Course updated successfully');
      } else {
        await api.createCourse(formData);
        toast.success('Course created successfully');
      }
      setDialogOpen(false);
      loadCourses();
    } catch (error) {
      toast.error(`Failed to ${editMode ? 'update' : 'create'} course`);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await api.deleteCourse(courseId);
      toast.success('Course deleted successfully');
      loadCourses();
    } catch (error) {
      toast.error('Failed to delete course');
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
        title="Golf Courses"
        description="Manage golf courses available for booking"
        action={
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </Button>
        }
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No courses yet"
          description="Get started by adding your first golf course."
          action={
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          }
        />
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Holes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Course' : 'Add New Course'}</DialogTitle>
            <DialogDescription>
              {editMode ? 'Update course information.' : 'Create a new golf course.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Course Name</Label>
              <Input
                placeholder="Pebble Beach Golf Links"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="A brief description of the golf course..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Number of Holes</Label>
              <Input
                type="number"
                value={formData.holesCount}
                onChange={(e) => setFormData({ ...formData, holesCount: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editMode ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
