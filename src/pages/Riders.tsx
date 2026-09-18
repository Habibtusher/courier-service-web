import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Pagination } from '@/components/ui/Pagination';
import { Bike, PlusCircle, Search, Edit2, Trash2, Phone, Building2, RefreshCw } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface BranchOption {
  id: string;
  name: string;
  code: string;
}

interface Rider {
  id: string;
  name: string;
  mobile: string;
  vehicleType: string;
  status: 'ACTIVE' | 'INACTIVE';
  branchId?: string;
  branch?: BranchOption;
}

export const Riders: React.FC = () => {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal State
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingRider, setEditingRider] = useState<Rider | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [vehicleType, setVehicleType] = useState('Bike');
  const [branchId, setBranchId] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  useEffect(() => {
    fetchRiders();
    fetchBranches();
  }, []);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await api.get('/riders');
      if (res.success && Array.isArray(res.data)) {
        setRiders(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load riders');
    } finally {
      setLoading(false);
    }
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
    setEditingRider(null);
    setName('');
    setMobile('');
    setVehicleType('Bike');
    setBranchId(branches[0]?.id || '');
    setStatus('ACTIVE');
    setDialogOpen(true);
  };

  const openEditModal = (r: Rider) => {
    setEditingRider(r);
    setName(r.name);
    setMobile(r.mobile);
    setVehicleType(r.vehicleType);
    setBranchId(r.branchId || '');
    setStatus(r.status);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !vehicleType) {
      toast.error('Please fill out all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name,
        mobile,
        vehicleType,
        branchId: branchId || undefined,
        status,
      };

      if (editingRider) {
        await api.put(`/riders/${editingRider.id}`, payload);
        toast.success(`Rider "${name}" updated successfully`);
      } else {
        await api.post('/riders', payload);
        toast.success(`Rider "${name}" created successfully`);
      }

      setDialogOpen(false);
      fetchRiders();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save rider');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [riderToDelete, setRiderToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const promptDelete = (id: string, riderName: string) => {
    setRiderToDelete({ id, name: riderName });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!riderToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/riders/${riderToDelete.id}`);
      toast.success(`Rider "${riderToDelete.name}" deleted successfully`);
      setDeleteModalOpen(false);
      setRiderToDelete(null);
      fetchRiders();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete rider');
    } finally {
      setDeleting(false);
    }
  };

  const filteredRiders = riders.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.mobile.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicleType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bike className="w-6 h-6 text-primary" /> Delivery Rider Management
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Manage last-mile courier personnel, assign home branches, and track vehicle types.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchRiders} className="gap-1 border-slate-300">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" onClick={openAddModal} className="bg-sky-600 hover:bg-sky-500 text-white font-medium gap-1.5 shadow-sm">
            <PlusCircle className="w-4 h-4" /> Add Delivery Rider
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <Card className="bg-white border p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by rider name, phone, or vehicle type..."
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
            <div className="p-12 text-center text-slate-400">Loading delivery riders...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600 text-sm">{error}</div>
          ) : filteredRiders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">No riders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Rider Name</th>
                    <th className="px-6 py-3.5 font-semibold">Mobile Number</th>
                    <th className="px-6 py-3.5 font-semibold">Vehicle Type</th>
                    <th className="px-6 py-3.5 font-semibold">Assigned Branch</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRiders
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{r.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-700 flex items-center gap-1 font-medium">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {r.mobile}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300">
                            {r.vehicleType}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {r.branch ? (
                            <div className="text-xs text-slate-800 flex items-center gap-1 font-medium">
                              <Building2 className="w-3.5 h-3.5 text-primary" /> {r.branch.name} ({r.branch.code})
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={r.status === 'ACTIVE' ? 'success' : 'secondary'}>
                            {r.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => openEditModal(r)} className="h-8 w-8 p-0 text-slate-600 hover:text-primary">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => promptDelete(r.id, r.name)} className="h-8 w-8 p-0 text-slate-600 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredRiders.length / pageSize)}
                totalItems={filteredRiders.length}
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

      {/* Add / Edit Rider Dialog Modal */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingRider ? 'Edit Delivery Rider' : 'Add New Delivery Rider'}
        description="Register last-mile personnel and assign vehicle type and home operational hub."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Full Name *</label>
            <Input
              placeholder="e.g. John McClane"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Mobile Phone Number *</label>
            <Input
              placeholder="+1 555-0199"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Vehicle Type *</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              >
                <option value="Bike">Motorcycle / Bike</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Pickup Truck">Pickup Truck</option>
                <option value="Cargo Van">Cargo Van</option>
                <option value="Foot Courier">Foot Courier</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Assigned Branch / Hub</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              >
                <option value="">No Hub Assigned</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Status</label>
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
              {submitting ? 'Saving...' : editingRider ? 'Update Rider' : 'Save Rider'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Delivery Rider"
        message={`Are you sure you want to remove rider "${riderToDelete?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
};

export default Riders;
