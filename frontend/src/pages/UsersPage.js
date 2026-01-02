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
import { Users as UsersIcon, Edit, Search } from 'lucide-react';
import { toast } from 'sonner';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error(t.messages.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      handicapIndex: user.handicapIndex || '',
      role: user.role,
      isActive: user.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const updateData = {
        ...formData,
        handicapIndex: formData.handicapIndex ? parseFloat(formData.handicapIndex) : null,
      };
      await api.updateUser(editUser.id, updateData);
      toast.success(t.messages.userUpdated);
      setEditDialogOpen(false);
      loadUsers();
    } catch (error) {
      toast.error(t.messages.userUpdateFailed);
    }
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

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
        title={t.users.title}
        description={t.users.description}
      />

      {/* Recherche */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t.users.searchUsers}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table utilisateurs */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={t.users.noUsersFound}
          description={t.users.noUsersDescription}
        />
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.users.name}</TableHead>
                <TableHead>{t.users.email}</TableHead>
                <TableHead>{t.users.role}</TableHead>
                <TableHead>{t.users.handicap}</TableHead>
                <TableHead>{t.users.status}</TableHead>
                <TableHead>{t.users.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? t.auth.admin : t.auth.user}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.handicapIndex || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'destructive'}>
                      {user.isActive ? t.users.active : t.users.inactive}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialogue de modification */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.users.editUser}</DialogTitle>
            <DialogDescription>
              {t.users.updateUserInfo}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.auth.firstName}</Label>
                <Input
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.auth.lastName}</Label>
                <Input
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.auth.handicapIndex}</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.handicapIndex || ''}
                onChange={(e) => setFormData({ ...formData, handicapIndex: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.auth.role}</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t.auth.admin}</SelectItem>
                  <SelectItem value="user">{t.auth.user}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.users.status}</Label>
              <Select
                value={formData.isActive ? 'active' : 'inactive'}
                onValueChange={(value) => setFormData({ ...formData, isActive: value === 'active' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t.users.active}</SelectItem>
                  <SelectItem value="inactive">{t.users.inactive}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleUpdate}>{t.common.saveChanges}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
