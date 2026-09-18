import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Pagination } from '@/components/ui/Pagination';
import { Store, PlusCircle, Search, Edit2, Trash2, Phone, Mail, CreditCard, RefreshCw, Building2 } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface BranchOption {
  id: string;
  name: string;
  code: string;
}

interface Merchant {
  id: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  email: string;
  address: string;
  district: string;
  deliveryCharge: number;
  codCharge: number;
  bankInfo?: string;
  status: 'ACTIVE' | 'INACTIVE';
  branchId?: string;
  branch?: BranchOption;
}

export const Merchants: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modal State
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState('10.00');
  const [codCharge, setCodCharge] = useState('1.5');
  const [bankInfo, setBankInfo] = useState('');
  const [branchId, setBranchId] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  useEffect(() => {
    fetchMerchants();
  }, [currentPage, pageSize, searchQuery]);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", pageSize.toString());
      if (searchQuery) params.append("search", searchQuery);

      const res: any = await api.get(`/merchants?${params.toString()}`);
      if (res.success && res.data) {
        if (res.data.items && Array.isArray(res.data.items)) {
          setMerchants(res.data.items);
          setTotalItems(res.data.pagination.total);
          setTotalPages(res.data.pagination.totalPages);
        } else if (Array.isArray(res.data)) {
          setMerchants(res.data);
          setTotalItems(res.data.length);
          setTotalPages(Math.ceil(res.data.length / pageSize) || 1);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load merchants');
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
    setEditingMerchant(null);
    setBusinessName('');
    setOwnerName('');
    setMobile('');
    setEmail('');
    setAddress('');
    setDistrict('');
    setDeliveryCharge('10.00');
    setCodCharge('1.5');
    setBankInfo('');
    setBranchId(branches[0]?.id || '');
    setStatus('ACTIVE');
    setDialogOpen(true);
  };

  const openEditModal = (m: Merchant) => {
    setEditingMerchant(m);
    setBusinessName(m.businessName);
    setOwnerName(m.ownerName);
    setMobile(m.mobile);
    setEmail(m.email);
    setAddress(m.address);
    setDistrict(m.district);
    setDeliveryCharge(m.deliveryCharge.toString());
    setCodCharge(m.codCharge.toString());
    setBankInfo(m.bankInfo || '');
    setBranchId(m.branchId || '');
    setStatus(m.status);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !ownerName || !mobile || !email || !address || !district) {
      toast.error('Please complete all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        businessName,
        ownerName,
        mobile,
        email,
        address,
        district,
        deliveryCharge: parseFloat(deliveryCharge),
        codCharge: parseFloat(codCharge),
        bankInfo,
        branchId: branchId || undefined,
        status,
      };

      if (editingMerchant) {
        await api.put(`/merchants/${editingMerchant.id}`, payload);
        toast.success(`Merchant "${businessName}" updated successfully`);
      } else {
        await api.post('/merchants', payload);
        toast.success(`Merchant "${businessName}" created successfully`);
      }

      setDialogOpen(false);
      fetchMerchants();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save merchant');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [merchantToDelete, setMerchantToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const promptDelete = (id: string, business: string) => {
    setMerchantToDelete({ id, name: business });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!merchantToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/merchants/${merchantToDelete.id}`);
      toast.success(`Merchant "${merchantToDelete.name}" deleted successfully`);
      setDeleteModalOpen(false);
      setMerchantToDelete(null);
      fetchMerchants();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete merchant');
    } finally {
      setDeleting(false);
    }
  };

  const filteredMerchants = merchants.filter(
    (m) =>
      m.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" /> Merchant Management
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Register e-commerce merchants, set custom delivery and COD pricing, and manage settlement bank details.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchMerchants} className="gap-1 border-slate-300">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" onClick={openAddModal} className="bg-sky-600 hover:bg-sky-500 text-white font-medium gap-1.5 shadow-sm">
            <PlusCircle className="w-4 h-4" /> Add New Merchant
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="bg-white border p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search business name, owner, email, district..."
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
            <div className="p-12 text-center text-slate-400">Loading merchant records...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600 text-sm">{error}</div>
          ) : merchants.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">No merchants registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Business Name</th>
                    <th className="px-6 py-3.5 font-semibold">Owner & Contact</th>
                    <th className="px-6 py-3.5 font-semibold">District</th>
                    <th className="px-6 py-3.5 font-semibold">Rates (Delivery / COD)</th>
                    <th className="px-6 py-3.5 font-semibold">Bank Settlement Info</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {merchants.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-xs">{m.businessName}</div>
                        <div className="text-[11px] text-slate-500">{m.ownerName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-800 flex items-center gap-1 font-medium">
                          <Phone className="w-3 h-3 text-slate-400" /> {m.mobile}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {m.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-primary" /> {m.branch?.name || 'Unassigned'}
                        </div>
                        <div className="text-[11px] text-slate-500">{m.district}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold text-slate-800">
                          Fee: ৳{m.deliveryCharge.toFixed(2)} | COD: {m.codCharge}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-700 flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[180px]">{m.bankInfo || 'Not Provided'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={m.status === 'ACTIVE' ? 'success' : 'secondary'}>
                          {m.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(m)} className="h-8 w-8 p-0 text-slate-600 hover:text-primary">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => promptDelete(m.id, m.businessName)} className="h-8 w-8 p-0 text-slate-600 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
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

      {/* Add / Edit Merchant Dialog Modal */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingMerchant ? 'Edit Merchant Account' : 'Register New E-Commerce Merchant'}
        description="Set up business details, custom delivery rates, and settlement bank information."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Business Name *</label>
              <Input
                placeholder="e.g. Apex Electronics Store"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Owner Name *</label>
              <Input
                placeholder="e.g. Michael Scott"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Contact Email *</label>
              <Input
                type="email"
                placeholder="merchant@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Mobile Phone *</label>
              <Input
                placeholder="+1 555-9011"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">District *</label>
              <Input
                placeholder="e.g. Lackawanna"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Assigned Hub/Branch</label>
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
            <label className="text-xs font-semibold text-slate-700">Business Address *</label>
            <Input
              placeholder="Full shop or warehouse address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border">
            <div>
              <label className="text-xs font-semibold text-slate-700">Delivery Charge (৳)</label>
              <Input
                type="number"
                step="0.5"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">COD Fee (%)</label>
              <Input
                type="number"
                step="0.1"
                value={codCharge}
                onChange={(e) => setCodCharge(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Settlement Bank Information</label>
            <Input
              placeholder="Bank Name, Account Number, Routing Code"
              value={bankInfo}
              onChange={(e) => setBankInfo(e.target.value)}
              className="mt-1"
            />
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
              {submitting ? 'Saving...' : editingMerchant ? 'Update Merchant' : 'Create Merchant'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Merchant Account"
        message={`Are you sure you want to delete merchant account "${merchantToDelete?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
};
