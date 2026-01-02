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
  const { t } = useTranslation();

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      const data = await api.getCompetitions();
      setCompetitions(data);
    } catch (error) {
      toast.error(t.messages.loadFailed);
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
        toast.success(t.messages.competitionUpdated);
      } else {
        await api.createCompetition(submitData);
        toast.success(t.messages.competitionCreated);
      }
      setDialogOpen(false);
      loadCompetitions();
    } catch (error) {
      toast.error(editMode ? t.messages.competitionUpdateFailed : t.messages.competitionCreatedFailed);
    }
  };

  const handleDelete = async (competitionId) => {
    if (!window.confirm(t.messages.confirmDelete + ' cette compétition ?')) return;
    
    try {
      await api.deleteCompetition(competitionId);
      toast.success(t.messages.competitionDeleted);
      loadCompetitions();
    } catch (error) {
      toast.error(t.messages.competitionDeleteFailed);
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'upcoming':
        return t.competitions.upcoming;
      case 'ongoing':
        return t.competitions.ongoing;
      case 'completed':
        return t.competitions.completed;
      default:
        return status;
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
        title={t.competitions.title}
        description={t.competitions.description}
        action={
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            {t.competitions.addCompetition}
          </Button>
        }
      />

      {competitions.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={t.competitions.noCompetitions}
          description={t.competitions.noCompetitionsDescription}
          action={
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              {t.competitions.addCompetition}
            </Button>
          }
        />
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.competitions.name}</TableHead>
                <TableHead>{t.competitions.date}</TableHead>
                <TableHead>{t.competitions.participants}</TableHead>
                <TableHead>{t.competitions.entryFee}</TableHead>
                <TableHead>{t.competitions.status}</TableHead>
                <TableHead className="text-right">{t.common.actions}</TableHead>
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
                  <TableCell>{competition.entryFee.toFixed(2)} €</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(competition.status)}>
                      {getStatusLabel(competition.status)}
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

      {/* Dialogue Ajouter/Modifier */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? t.competitions.editCompetition : t.competitions.addNewCompetition}</DialogTitle>
            <DialogDescription>
              {editMode ? t.competitions.updateCompetitionInfo : t.competitions.createNewCompetition}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t.competitions.competitionName}</Label>
              <Input
                placeholder={t.competitions.competitionNamePlaceholder}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.competitions.description}</Label>
              <Textarea
                placeholder={t.competitions.descriptionPlaceholder}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.competitions.date}</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.competitions.maxParticipants}</Label>
                <Input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.competitions.entryFee} (€)</Label>
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
              {t.common.cancel}
            </Button>
            <Button onClick={handleSubmit}>
              {editMode ? t.common.saveChanges : t.common.create}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
