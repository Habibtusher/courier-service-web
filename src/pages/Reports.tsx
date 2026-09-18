import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Package,
  DollarSign,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import api from '@/lib/axios';
import * as XLSX from 'xlsx';
import { Pagination } from '@/components/ui/Pagination';
import { toast } from 'sonner';

interface MerchantOption {
  id: string;
  businessName: string;
}

interface BranchOption {
  id: string;
  name: string;
  code: string;
}

interface ReportRow {
  id: string;
  cnNumber: string;
  bookingDate: string;
  merchantName: string;
  senderName: string;
  recipientName: string;
  recipientPhone: string;
  district: string;
  weight: number;
  qty: number;
  deliveryFee: number;
  codAmount: number;
  status: string;
  reason: string;
  riderName: string;
  originBranch: string;
  destinationBranch: string;
}

interface ReportSummary {
  totalBookings: number;
  totalCodAmount: number;
  totalDeliveryFee: number;
  deliveredCount: number;
  undeliveredCount: number;
  returnedCount: number;
  inTransitCount: number;
  fulfillmentRate: number;
}

interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  userName?: string;
  details?: string;
  createdAt: string;
}

export const Reports: React.FC = () => {
  const [merchants, setMerchants] = useState<MerchantOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);

  // Filter state
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('ALL');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'report' | 'audit'>('report');

  // Pagination State
  const [reportPage, setReportPage] = useState(1);
  const [reportPageSize, setReportPageSize] = useState(10);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(10);

  useEffect(() => {
    fetchFilterOptions();
    fetchReportData();
    fetchAuditLogs();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const [mRes, bRes]: [any, any] = await Promise.all([
        api.get('/merchants'),
        api.get('/branches'),
      ]);
      if (mRes.success && Array.isArray(mRes.data)) setMerchants(mRes.data);
      if (bRes.success && Array.isArray(bRes.data)) setBranches(bRes.data);
    } catch (_err) {}
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const queryParams: string[] = [];
      if (startDate) queryParams.push(`startDate=${startDate}`);
      if (endDate) queryParams.push(`endDate=${endDate}`);
      if (selectedMerchantId && selectedMerchantId !== 'ALL') queryParams.push(`merchantId=${selectedMerchantId}`);
      if (selectedBranchId && selectedBranchId !== 'ALL') queryParams.push(`branchId=${selectedBranchId}`);
      if (selectedStatus && selectedStatus !== 'ALL') queryParams.push(`status=${selectedStatus}`);

      let url = '/reports/bookings';
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const res: any = await api.get(url);
      if (res.success && res.data) {
        setSummary(res.data.summary);
        setRows(res.data.rows);
      }
    } catch (_err) {
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res: any = await api.get('/reports/audit-logs');
      if (res.success && Array.isArray(res.data)) {
        setAuditLogs(res.data);
      }
    } catch (_err) {}
  };

  const handleExportExcel = () => {
    if (rows.length === 0) {
      toast.error('No report data available to export.');
      return;
    }

    const exportData = rows.map((r) => ({
      'CN Number': r.cnNumber,
      'Booking Date': r.bookingDate,
      'Merchant / Business': r.merchantName,
      'Recipient Name': r.recipientName,
      'Recipient Phone': r.recipientPhone,
      'District / Hub': r.district,
      'Weight (kg)': r.weight,
      'Delivery Fee (৳)': r.deliveryFee,
      'COD Amount (৳)': r.codAmount,
      'Shipment Status': r.status,
      'Rider': r.riderName,
      'Exception Reason': r.reason,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Consignment Report');

    const todayStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Courier_Report_${todayStr}.xlsx`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'SETTLED':
        return <Badge variant="success" className="bg-emerald-600 text-white font-bold">{status}</Badge>;
      case 'UNDELIVERED':
        return <Badge variant="warning" className="bg-amber-600 text-white font-bold">UNDELIVERED</Badge>;
      case 'RETURNED':
        return <Badge variant="destructive" className="bg-red-600 text-white font-bold">RETURNED</Badge>;
      default:
        return <Badge variant="info" className="bg-sky-600 text-white font-bold">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-primary" /> Reports & Audit Trails
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Operational analytics, filterable consignment reports, Excel export, and system mutation audit logs.
          </p>
        </div>

        <div className="flex bg-slate-200/80 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'report'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-primary" /> Booking Analytics
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" /> Audit Log History
          </button>
        </div>
      </div>

      {/* Multi-Select Filter Bar */}
      <Card className="bg-white border p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 items-end">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Merchant</label>
            <select
              value={selectedMerchantId}
              onChange={(e) => setSelectedMerchantId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-white px-2.5 text-xs font-medium"
            >
              <option value="ALL">All Merchants</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.businessName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Branch / Hub</label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-white px-2.5 text-xs font-medium"
            >
              <option value="ALL">All Hubs</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-white px-2.5 text-xs font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="BOOKED">BOOKED</option>
              <option value="DISPATCHED">DISPATCHED</option>
              <option value="IN_TRANSIT">IN TRANSIT</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="UNDELIVERED">UNDELIVERED</option>
              <option value="RETURNED">RETURNED</option>
              <option value="SETTLED">SETTLED</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => fetchReportData()}
              disabled={loading}
              className="flex-1 bg-primary text-white font-bold text-xs h-9 gap-1"
            >
              <Filter className="w-3.5 h-3.5" /> Filter
            </Button>
            <Button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Export Excel
            </Button>
          </div>
        </div>
      </Card>

      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* Summary Aggregation Cards */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border shadow-sm">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span>Total Bookings</span>
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
                    {summary.totalBookings} parcels
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex gap-2">
                    <span className="text-emerald-700 font-semibold">{summary.deliveredCount} Delivered</span>
                    <span className="text-amber-700 font-semibold">{summary.undeliveredCount} Undelivered</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border shadow-sm">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span>Gross COD Volume</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-2">
                    ৳{summary.totalCodAmount.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Collectible cash volume
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border shadow-sm">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span>Delivery Charges</span>
                    <DollarSign className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-sky-700 font-mono mt-2">
                    ৳{summary.totalDeliveryFee.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Total courier revenue
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900 to-slate-900 text-white shadow-md">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center text-sky-300 text-xs font-extrabold uppercase tracking-wider">
                    <span>Fulfillment Rate</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black font-mono mt-2 text-white">
                    {summary.fulfillmentRate}%
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium mt-1">
                    Successful delivery ratio
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Operational Consignment Report Table */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="border-b pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-primary" /> Filtered Consignment Report
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportExcel}
                  className="h-8 text-xs gap-1.5 border-emerald-300 bg-emerald-50 text-emerald-800 font-bold"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" /> Download Excel (.xlsx)
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-slate-400 text-sm">Generating report...</div>
              ) : rows.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">No consignment records match the selected filters.</div>
              ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 border-b text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-semibold">CN Number</th>
                        <th className="px-4 py-3 font-semibold">Booking Date</th>
                        <th className="px-4 py-3 font-semibold">Merchant / Sender</th>
                        <th className="px-4 py-3 font-semibold">Recipient Info</th>
                        <th className="px-4 py-3 font-semibold">District</th>
                        <th className="px-4 py-3 font-semibold text-right">Delivery Fee</th>
                        <th className="px-4 py-3 font-semibold text-right">COD Amount</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Rider / Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows
                        .slice((reportPage - 1) * reportPageSize, reportPage * reportPageSize)
                        .map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-slate-900 text-xs">
                              {r.cnNumber}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600 font-medium">
                              {r.bookingDate}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-800 text-xs">
                              {r.merchantName}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-800 text-xs">{r.recipientName}</div>
                              <div className="text-[11px] text-slate-500">{r.recipientPhone}</div>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-700 font-medium">{r.district}</td>
                            <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-sky-700">
                              ৳{r.deliveryFee.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs font-bold text-emerald-700">
                              ৳{r.codAmount.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              {getStatusBadge(r.status)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-xs text-slate-800 font-medium">{r.riderName}</div>
                              {r.reason && (
                                <div className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5 inline-block">
                                  Reason: {r.reason}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={reportPage}
                  totalPages={Math.ceil(rows.length / reportPageSize) || 1}
                  totalItems={rows.length}
                  pageSize={reportPageSize}
                  onPageChange={setReportPage}
                  onPageSizeChange={(size) => {
                    setReportPageSize(size);
                    setReportPage(1);
                  }}
                />
              </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Audit Log Tab */}
      {activeTab === 'audit' && (
        <Card className="bg-white border shadow-sm">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" /> System Mutation Audit Trails
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Automatic audit logging of crucial database mutations (Bookings, Status changes, Settlements, Expense entries).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {auditLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No audit trail records found.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 border-b text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5 font-semibold">Timestamp</th>
                        <th className="px-6 py-3.5 font-semibold">Action</th>
                        <th className="px-6 py-3.5 font-semibold">Entity Type</th>
                        <th className="px-6 py-3.5 font-semibold">Operator / User</th>
                        <th className="px-6 py-3.5 font-semibold">Mutation Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs
                        .slice((auditPage - 1) * auditPageSize, auditPage * auditPageSize)
                        .map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-slate-500">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className="bg-slate-900 text-white font-mono text-xs">
                                {log.action}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                              {log.entity}
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-800">
                              {log.userName || 'System Operator'}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-700">
                              {log.details || 'N/A'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={auditPage}
                  totalPages={Math.ceil(auditLogs.length / auditPageSize) || 1}
                  totalItems={auditLogs.length}
                  pageSize={auditPageSize}
                  onPageChange={setAuditPage}
                  onPageSizeChange={(size) => {
                    setAuditPageSize(size);
                    setAuditPage(1);
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
