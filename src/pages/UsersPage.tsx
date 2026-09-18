import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Pagination } from '@/components/ui/Pagination';
import { UserRole } from '@/context/AuthContext';
import { Users, PlusCircle, Search, Edit2, Trash2, ShieldCheck, Building2, Mail, Lock, RefreshCw, Phone } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: UserRole;
  description?: string;
}

interface BranchOption {
  id: string;
  name: string;
  code: string;
  district?: string;
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  role: Role;
  branch?: BranchOption;
}

const getRoleBadgeStyle = (roleName: UserRole) => {
  switch (roleName) {
    case 'ADMIN':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'OPERATOR':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'BRANCH_USER':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'ACCOUNTS_USER':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal State
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');
  const [selectedRoleName, setSelectedRoleName] = useState<string>('');
  const [branchId, setBranchId] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchBranches();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await api.get('/users');
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load system users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res: any = await api.get('/users/roles');
      if (res.success && Array.isArray(res.data)) {
        setRoles(res.data);
      }
    } catch (_err) {}
  };

  const fetchBranches = async () => {
    try {
      const res: any = await api.get('/branches');
      if (res.success && Array.isArray(res.data)) {
        setBranches(res.data);
      }
    } catch (_err) {}
  };

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('password');
    setPhone('');
    const defaultRoleId = roles[0]?.id || 'ADMIN';
    setRoleId(defaultRoleId);
    setSelectedRoleName(roles[0]?.name || 'ADMIN');
    setBranchId(branches[0]?.id || '');
    setStatus('ACTIVE');
    setDialogOpen(true);
  };

  const openEditModal = (u: UserAccount) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setPhone(u.phone || '');
    setRoleId(u.role.id);
    setSelectedRoleName(u.role.name);
    setBranchId(u.branch?.id || '');
    setStatus(u.status);
    setDialogOpen(true);
  };

  const handleRoleChange = (selectedId: string) => {
    setRoleId(selectedId);
    const r = roles.find((r) => r.id === selectedId || r.name === selectedId);
    if (r) {
      setSelectedRoleName(r.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !roleId) {
      toast.error('Name, Email, and Role are required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name,
        email,
        password: password || undefined,
        phone,
        roleId,
        branchId: selectedRoleName === 'BRANCH_USER' ? branchId || undefined : undefined,
        status,
      };

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
        toast.success(`User "${name}" updated successfully`);
      } else {
        await api.post('/users', payload);
        toast.success(`User "${name}" created successfully`);
      }

      setDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save user account');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const promptDelete = (id: string, userName: string) => {
    setUserToDelete({ id, name: userName });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/users/${userToDelete.id}`);
      toast.success(`User "${userToDelete.name}" deleted successfully`);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user account');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> System User Management
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Admin access control portal: Create user accounts, assign roles, and bind Branch Users to regional hubs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-1 border-slate-300">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" onClick={openAddModal} className="bg-sky-600 hover:bg-sky-500 text-white font-medium gap-1.5 shadow-sm">
            <PlusCircle className="w-4 h-4" /> Create New User
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="bg-white border p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search user name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </Card>

      {/* Master Data Table */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading user directory...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600 text-sm">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">No user accounts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">User Name</th>
                    <th className="px-6 py-3.5 font-semibold">Email & Phone</th>
                    <th className="px-6 py-3.5 font-semibold">Role</th>
                    <th className="px-6 py-3.5 font-semibold">Assigned Branch Hub</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{u.name}</td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" /> {u.email}
                          </div>
                          {u.phone && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" /> {u.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${getRoleBadgeStyle(u.role.name)}`}>
                            <ShieldCheck className="w-3.5 h-3.5" /> {u.role.name.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.branch ? (
                            <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-primary" /> {u.branch.name} ({u.branch.code})
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Global / All Hubs</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={u.status === 'ACTIVE' ? 'success' : 'secondary'}>
                            {u.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => openEditModal(u)} className="h-8 w-8 p-0 text-slate-600 hover:text-primary">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => promptDelete(u.id, u.name)} className="h-8 w-8 p-0 text-slate-600 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredUsers.length / pageSize)}
                totalItems={filteredUsers.length}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit User Dialog Modal */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingUser ? 'Edit User Account & Role' : 'Create System User Account'}
        description="Assign user roles (Admin, Operator, Branch User, Accounts User) and bind branch assignments."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Full Name *</label>
            <Input
              placeholder="e.g. Sarah Connor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Email Address *</label>
              <Input
                type="email"
                placeholder="user@courier.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Mobile Phone</label>
              <Input
                placeholder="+1 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Password {editingUser ? '(Leave blank to keep unchanged)' : '*'}</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              required={!editingUser}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Assigned System Role *</label>
            <select
              value={roleId}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold"
              required
            >
              {roles.length > 0 ? (
                roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name.replace('_', ' ')} - {r.description}
                  </option>
                ))
              ) : (
                <>
                  <option value="ADMIN">ADMIN - System Administrator</option>
                  <option value="OPERATOR">OPERATOR - Dispatch Operator</option>
                  <option value="BRANCH_USER">BRANCH_USER - Branch Hub Staff</option>
                  <option value="ACCOUNTS_USER">ACCOUNTS_USER - Finance Officer</option>
                </>
              )}
            </select>
          </div>

          {/* Conditional Branch Selector: Shown ONLY when selected role is BRANCH_USER */}
          {selectedRoleName === 'BRANCH_USER' && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 animate-fadeIn space-y-1">
              <label className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <Building2 className="w-4 h-4 text-amber-700" /> Assign Local Branch Hub *
              </label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full h-10 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-medium focus:ring-amber-500"
                required
              >
                <option value="">Select Target Branch Hub...</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code}) - {b.district}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-primary text-white font-semibold">
              {submitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User Account"
        message={`Are you sure you want to delete user account "${userToDelete?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
};
