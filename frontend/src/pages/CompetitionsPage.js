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
import { Badge } from '../components/ui/badge';
import { api } from '../lib/api';
import { Trophy, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const CompetitionsPage = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCompetition, setCurrentCompetition] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    maxParticipants: 50,
    entryFee: 0,
  });

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      const data = await api.getCompetitions();
      setCompetitions(data);
    } catch (error) {
      toast.error('Failed to load competitions');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    const today = new Date().toISOString().split('T')[0];
    setFormData({ name: '', description: '', date: today, maxParticipants: 50, entryFee: 0 });
    setDialogOpen(true);
  };

  const handleEdit = (competition) => {
    setEditMode(true);
    setCurrentCompetition(competition);
    setFormData({
      name: competition.name,
      description: competition.description || '',
      date: competition.date,
      maxParticipants: competition.maxParticipants,
      entryFee: competition.entryFee,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        maxParticipants: parseInt(formData.maxParticipants),
        entryFee: parseFloat(formData.entryFee),
      };
      
      if (editMode) {
        await api.updateCompetition(currentCompetition.id, submitData);
        toast.success('Competition updated successfully');
      } else {
        await api.createCompetition(submitData);
        toast.success('Competition created successfully');
      }
      setDialogOpen(false);
      loadCompetitions();
    } catch (error) {
      toast.error(`Failed to ${editMode ? 'update' : 'create'} competition`);
    }
  };

  const handleDelete = async (competitionId) => {
    if (!window.confirm('Are you sure you want to delete this competition?')) return;
    
    try {
      await api.deleteCompetition(competitionId);
      toast.success('Competition deleted successfully');
      loadCompetitions();
    } catch (error) {
      toast.error('Failed to delete competition');
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'upcoming':
        return 'default';
      case 'ongoing':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'destructive';
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
        title="Competitions"
        description="Organize and manage golf competitions"
        action={
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Competition
          </Button>
        }
      />

      {competitions.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No competitions yet"
          description="Get started by creating your first golf competition."
          action={
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Competition
            </Button>
          }
        />
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Entry Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitions.map((competition) => (
                <TableRow key={competition.id}>
                  <TableCell className="font-medium">{competition.name}</TableCell>
                  <TableCell>{competition.date}</TableCell>
                  <TableCell>
                    {competition.participants.length} / {competition.maxParticipants}
                  </TableCell>
                  <TableCell>${competition.entryFee.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(competition.status)}>
                      {competition.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(competition)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(competition.id)}
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
            <DialogTitle>{editMode ? 'Edit Competition' : 'Add New Competition'}</DialogTitle>
            <DialogDescription>
              {editMode ? 'Update competition details.' : 'Create a new golf competition.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Competition Name</Label>
              <Input
                placeholder="Summer Championship 2024"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Competition details and rules..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Entry Fee ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.entryFee}
                  onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                  min="0"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editMode ? 'Save Changes' : 'Create Competition'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
