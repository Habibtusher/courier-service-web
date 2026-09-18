import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Pagination } from '@/components/ui/Pagination';
import { Building2, PlusCircle, Search, Edit2, Trash2, MapPin, Phone, UserCheck, RefreshCw } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface Branch {
  id: string;
  code: string;
  name: string;
  district: string;
  address: string;
  managerName: string;
  mobile: string;
  status: 'ACTIVE' | 'INACTIVE';
  _count?: { users: number; originParcels: number };
}

export const Branches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal State
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [managerName, setManagerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await api.get('/branches');
      if (res.success && Array.isArray(res.data)) {
        setBranches(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingBranch(null);
    setCode('');
    setName('');
    setDistrict('');
    setAddress('');
    setManagerName('');
    setMobile('');
    setStatus('ACTIVE');
    setDialogOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setCode(branch.code);
    setName(branch.name);
    setDistrict(branch.district);
    setAddress(branch.address);
    setManagerName(branch.managerName);
    setMobile(branch.mobile);
    setStatus(branch.status);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !district || !address || !managerName || !mobile) {
      toast.error('Please complete all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingBranch) {
        await api.put(`/branches/${editingBranch.id}`, {
          code,
          name,
          district,
          address,
          managerName,
          mobile,
          status,
        });
        toast.success(`Branch "${name}" updated successfully`);
      } else {
        await api.post('/branches', {
          code,
          name,
          district,
          address,
          managerName,
          mobile,
          status,
        });
        toast.success(`Branch "${name}" created successfully`);
      }
      setDialogOpen(false);
      fetchBranches();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save branch');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const promptDelete = (id: string, branchName: string) => {
    setBranchToDelete({ id, name: branchName });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!branchToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/branches/${branchToDelete.id}`);
      toast.success(`Branch "${branchToDelete.name}" deleted successfully`);
      setDeleteModalOpen(false);
      setBranchToDelete(null);
      fetchBranches();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete branch');
    } finally {
      setDeleting(false);
    }
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.managerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" /> Branch Management
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Configure regional dispatch hubs, assign managers, and update operational statuses.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchBranches} className="gap-1 border-slate-300">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" onClick={openAddModal} className="bg-sky-600 hover:bg-sky-500 text-white font-medium gap-1.5 shadow-sm">
            <PlusCircle className="w-4 h-4" /> Add New Branch
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="bg-white border p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search code, branch name, district, or manager..."
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
            <div className="p-12 text-center text-slate-400">Loading branch network...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600 text-sm">{error}</div>
          ) : filteredBranches.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">No branches registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Code</th>
                    <th className="px-6 py-3.5 font-semibold">Branch Name</th>
                    <th className="px-6 py-3.5 font-semibold">District</th>
                    <th className="px-6 py-3.5 font-semibold">Address</th>
                    <th className="px-6 py-3.5 font-semibold">Manager & Contact</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBranches
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-primary">{b.code}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">{b.name}</td>
                        <td className="px-6 py-4 text-slate-600">{b.district}</td>
                        <td className="px-6 py-4 text-slate-600 text-xs max-w-xs truncate">{b.address}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-primary" /> {b.managerName}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" /> {b.mobile}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={b.status === 'ACTIVE' ? 'success' : 'secondary'}>
                            {b.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => openEditModal(b)} className="h-8 w-8 p-0 text-slate-600 hover:text-primary">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => promptDelete(b.id, b.name)} className="h-8 w-8 p-0 text-slate-600 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredBranches.length / pageSize)}
                totalItems={filteredBranches.length}
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

      {/* Add / Edit Branch Dialog Modal */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingBranch ? 'Edit Branch Details' : 'Add New Branch Hub'}
        description="Configure regional hub identity, location address, and manager credentials."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Branch Code *</label>
              <Input
                placeholder="e.g. SF-01"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 font-mono uppercase"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">District / Region *</label>
              <Input
                placeholder="e.g. San Francisco"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Branch Name *</label>
            <Input
              placeholder="e.g. San Francisco Central Hub"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Street Address *</label>
            <Input
              placeholder="Full physical hub address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Hub Manager Name *</label>
              <Input
                placeholder="e.g. Robert Vance"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Mobile Phone *</label>
              <Input
                placeholder="+1 415-555-0100"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Operational Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold"
            >
              <option value="ACTIVE">ACTIVE (Operational)</option>
              <option value="INACTIVE">INACTIVE (Disabled)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-primary text-white font-semibold">
              {submitting ? 'Saving...' : editingBranch ? 'Update Branch' : 'Create Branch'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Branch Hub"
        message={`Are you sure you want to delete branch "${branchToDelete?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
};
