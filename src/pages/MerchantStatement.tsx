import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Pagination } from '@/components/ui/Pagination';
import { toast } from 'sonner';
import {
  DollarSign,
  Search,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileSpreadsheet,
  History,
  Send,
  RefreshCw,
  Wallet,
  Receipt,
  ArrowUpRight,
} from 'lucide-react';
import api from '@/lib/axios';

interface MerchantOption {
  id: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  email: string;
  deliveryCharge: number;
  codCharge: number;
  bankInfo?: string;
}

interface CodTxnItem {
  id: string;
  parcelId: string;
  cnNumber: string;
  recipientName: string;
  recipientPhone: string;
  parcelStatus: string;
  codAmount: number;
  deliveryCharge: number;
  codFee: number;
  netAmount: number;
  status: 'PENDING' | 'SETTLED' | 'CANCELLED';
  riderName: string;
  settlementId?: string | null;
  createdAt: string;
}

interface SettlementRecord {
  id: string;
  settlementNumber: string;
  totalBookings: number;
  totalCodAmount: number;
  totalDeliveryCharge: number;
  totalCodCharge: number;
  adjustments: number;
  netPayable: number;
  paidAmount: number;
  paymentMethod: string;
  transactionRef?: string;
  notes?: string;
  createdAt: string;
}

interface StatementData {
  merchant: {
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
    branchName: string;
  };
  summary: {
    totalBookings: number;
    deliveredCount: number;
    undeliveredCount: number;
    returnedCount: number;
    totalCodAmount: number;
    totalDeliveryCharge: number;
    totalCodCharge: number;
    netPayable: number;
    pendingCodAmount: number;
    settledCodAmount: number;
    unsettledCount: number;
  };
  transactions: CodTxnItem[];
  settlements: SettlementRecord[];
}

export const MerchantStatement: React.FC = () => {
  const [merchants, setMerchants] = useState<MerchantOption[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [statement, setStatement] = useState<StatementData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Selection for Batch Settlement
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);

  // Settlement Execution Modal State
  const [settlementModalOpen, setSettlementModalOpen] = useState<boolean>(false);
  const [adjustments, setAdjustments] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submittingSettlement, setSubmittingSettlement] = useState<boolean>(false);
  const [settlementSuccess, setSettlementSuccess] = useState<string | null>(null);

  // Active Tab: 'ledger' | 'history'
  const [activeTab, setActiveTab] = useState<'ledger' | 'history'>('ledger');

  // Pagination State
  const [txPage, setTxPage] = useState<number>(1);
  const [txPageSize, setTxPageSize] = useState<number>(10);
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [historyPageSize, setHistoryPageSize] = useState<number>(10);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const res: any = await api.get('/merchants');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setMerchants(res.data);
        setSelectedMerchantId(res.data[0].id);
        fetchStatement(res.data[0].id);
      }
    } catch (_err) {}
  };

  const fetchStatement = async (mId?: string) => {
    const idToUse = mId || selectedMerchantId;
    if (!idToUse) return;

    try {
      setLoading(true);
      setError(null);
      setSettlementSuccess(null);

      let url = `/merchants/${idToUse}/statement`;
      const queryParams: string[] = [];
      if (startDate) queryParams.push(`startDate=${startDate}`);
      if (endDate) queryParams.push(`endDate=${endDate}`);
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const res: any = await api.get(url);
      if (res.success && res.data) {
        setStatement(res.data);
        // Pre-select pending transactions by default
        const pendingIds = res.data.transactions
          .filter((t: CodTxnItem) => t.status === 'PENDING')
          .map((t: CodTxnItem) => t.id);
        setSelectedTxIds(pendingIds);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch merchant statement');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!statement) return;
    if (checked) {
      const pendingIds = statement.transactions
        .filter((t) => t.status === 'PENDING')
        .map((t) => t.id);
      setSelectedTxIds(pendingIds);
    } else {
      setSelectedTxIds([]);
    }
  };

  const handleToggleTx = (id: string) => {
    setSelectedTxIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Financial Calculations for Selected Items
  const selectedTxObjects =
    statement?.transactions.filter((t) => selectedTxIds.includes(t.id)) || [];
  const selectedCodTotal = selectedTxObjects.reduce((acc, t) => acc + t.codAmount, 0);
  const selectedDelTotal = selectedTxObjects.reduce((acc, t) => acc + t.deliveryCharge, 0);
  const selectedCodFeeTotal = selectedTxObjects.reduce((acc, t) => acc + t.codFee, 0);
  const selectedBaseNetPayable = selectedCodTotal - selectedDelTotal - selectedCodFeeTotal;
  const finalPayoutAmount = selectedBaseNetPayable + adjustments;

  const handleExecuteSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement || selectedTxIds.length === 0) return;

    try {
      setSubmittingSettlement(true);
      const payload = {
        merchantId: statement.merchant.id,
        transactionIds: selectedTxIds,
        adjustments,
        paidAmount: finalPayoutAmount,
        paymentMethod,
        transactionRef,
        notes,
      };

      const res: any = await api.post('/settlements', payload);
      if (res.success) {
        toast.success(`Settlement ${res.data.settlementNumber} executed successfully for ৳${res.data.paidAmount.toFixed(2)}!`);
        setSettlementModalOpen(false);
        setSettlementSuccess(
          `Settlement ${res.data.settlementNumber} executed successfully for ৳${res.data.paidAmount.toFixed(
            2
          )}!`
        );
        fetchStatement();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to process settlement');
    } finally {
      setSubmittingSettlement(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" /> Merchant Financials & Settlements
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Generate itemized COD settlement statements, calculate courier commission fees, and process payouts.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ledger'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-primary" /> Financial Statement
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-emerald-600" /> Settlement History
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="bg-white border p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Select Merchant *</label>
            <select
              value={selectedMerchantId}
              onChange={(e) => {
                setSelectedMerchantId(e.target.value);
                fetchStatement(e.target.value);
              }}
              className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-xs font-bold text-slate-900"
            >
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.businessName} ({m.ownerName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 text-xs"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => fetchStatement()}
              disabled={loading}
              className="flex-1 bg-primary text-white font-bold text-xs h-10 gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Generate Ledger
            </Button>
          </div>
        </div>
      </Card>

      {/* Success Notification */}
      {settlementSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{settlementSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Statement Content */}
      {statement && activeTab === 'ledger' && (
        <div className="space-y-6">
          {/* Merchant Profile Banner */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">
                MERCHANT FINANCIAL PROFILE
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
                {statement.merchant.businessName}
              </h2>
              <div className="text-xs text-slate-300 mt-1 flex flex-wrap gap-4">
                <span>Owner: <strong>{statement.merchant.ownerName}</strong> ({statement.merchant.mobile})</span>
                <span>Preset Delivery Fee: <strong>৳{statement.merchant.deliveryCharge.toFixed(2)}</strong></span>
                <span>COD Commission: <strong>{statement.merchant.codCharge}%</strong></span>
              </div>
            </div>

            {statement.merchant.bankInfo && (
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-xs">
                <div className="text-[10px] uppercase font-bold text-sky-300 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" /> Settlement Bank Information
                </div>
                <div className="font-semibold text-slate-100 mt-0.5">{statement.merchant.bankInfo}</div>
              </div>
            )}
          </div>

          {/* Key Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border shadow-sm">
              <CardContent className="p-5">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <span>Gross COD Collected</span>
                  <Wallet className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
                  ৳{statement.summary.totalCodAmount.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  From {statement.summary.deliveredCount} delivered consignments
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border shadow-sm">
              <CardContent className="p-5">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <span>Delivery Charges</span>
                  <Building2 className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-extrabold text-amber-700 font-mono mt-2">
                  -৳{statement.summary.totalDeliveryCharge.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Courier logistics fee
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border shadow-sm">
              <CardContent className="p-5">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <span>COD Commission Fee</span>
                  <Receipt className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-extrabold text-purple-700 font-mono mt-2">
                  -৳{statement.summary.totalCodCharge.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {statement.merchant.codCharge}% COD processing fee
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
              <CardContent className="p-5">
                <div className="flex justify-between items-center text-emerald-100 text-xs font-extrabold uppercase tracking-wider">
                  <span>Net Payable Payout</span>
                  <DollarSign className="w-5 h-5 text-emerald-200" />
                </div>
                <div className="text-3xl font-black font-mono mt-2">
                  ৳{statement.summary.netPayable.toFixed(2)}
                </div>
                <div className="text-[11px] text-emerald-100 font-medium mt-1">
                  Ready for merchant payout
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Ledger Table Card */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-primary" /> Itemized Financial Ledger
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Select pending transactions to process a batch settlement payment.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-semibold text-slate-600">
                    Selected: <strong className="text-primary">{selectedTxIds.length}</strong> txns (৳
                    {selectedBaseNetPayable.toFixed(2)})
                  </div>
                  <Button
                    size="sm"
                    disabled={selectedTxIds.length === 0}
                    onClick={() => {
                      setAdjustments(0);
                      setSettlementModalOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" /> Execute Settlement
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {statement.transactions.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  No COD transaction records found for this merchant in the selected range.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100/80 text-slate-600 border-b text-xs uppercase tracking-wider">
                      <tr>
                        <th className="p-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={
                              selectedTxIds.length > 0 &&
                              selectedTxIds.length ===
                                statement.transactions.filter((t) => t.status === 'PENDING').length
                            }
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                          />
                        </th>
                        <th className="px-4 py-3.5 font-semibold">CN Number</th>
                        <th className="px-4 py-3.5 font-semibold">Recipient Info</th>
                        <th className="px-4 py-3.5 font-semibold">Parcel Status</th>
                        <th className="px-4 py-3.5 font-semibold text-right">COD Amount</th>
                        <th className="px-4 py-3.5 font-semibold text-right">Delivery Fee</th>
                        <th className="px-4 py-3.5 font-semibold text-right">COD Fee</th>
                        <th className="px-4 py-3.5 font-semibold text-right">Net Amount</th>
                        <th className="px-4 py-3.5 text-center font-semibold">Settlement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {statement.transactions
                        .slice((txPage - 1) * txPageSize, txPage * txPageSize)
                        .map((tx) => {
                          const isSelected = selectedTxIds.includes(tx.id);
                          const isPending = tx.status === 'PENDING';

                          return (
                            <tr
                              key={tx.id}
                              className={`transition-colors ${
                                isSelected ? 'bg-sky-50/60' : 'hover:bg-slate-50/80'
                              }`}
                            >
                              <td className="p-4 text-center">
                                <input
                                  type="checkbox"
                                  disabled={!isPending}
                                  checked={isSelected}
                                  onChange={() => handleToggleTx(tx.id)}
                                  className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 disabled:opacity-40"
                                />
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="font-mono font-bold text-slate-900 text-xs">
                                  {tx.cnNumber}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {new Date(tx.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="font-semibold text-slate-800 text-xs">{tx.recipientName}</div>
                                <div className="text-[11px] text-slate-500">{tx.recipientPhone}</div>
                              </td>
                              <td className="px-4 py-3.5">
                                <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700">
                                  {tx.parcelStatus}
                                </Badge>
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                                ৳{tx.codAmount.toFixed(2)}
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono text-amber-700 font-semibold">
                                -৳{tx.deliveryCharge.toFixed(2)}
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono text-purple-700 font-semibold">
                                -৳{tx.codFee.toFixed(2)}
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono font-extrabold text-emerald-700">
                                ৳{tx.netAmount.toFixed(2)}
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                {tx.status === 'SETTLED' ? (
                                  <Badge variant="success" className="text-[10px] bg-emerald-600 text-white">
                                    SETTLED
                                  </Badge>
                                ) : (
                                  <Badge variant="warning" className="text-[10px] bg-amber-500 text-white">
                                    UNSETTLED
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  <Pagination
                    currentPage={txPage}
                    totalPages={Math.ceil(statement.transactions.length / txPageSize)}
                    totalItems={statement.transactions.length}
                    pageSize={txPageSize}
                    onPageChange={(page) => setTxPage(page)}
                    onPageSizeChange={(size) => {
                      setTxPageSize(size);
                      setTxPage(1);
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Historical Settlements Tab */}
      {statement && activeTab === 'history' && (
        <Card className="bg-white border shadow-sm">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" /> Historical Merchant Payout Statements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {statement.settlements.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No past settlement payout records found for this merchant.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 border-b text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5 font-semibold">Settlement #</th>
                      <th className="px-6 py-3.5 font-semibold">Date</th>
                      <th className="px-6 py-3.5 font-semibold">Orders Settled</th>
                      <th className="px-6 py-3.5 font-semibold text-right">Gross COD</th>
                      <th className="px-6 py-3.5 font-semibold text-right">Courier Charges</th>
                      <th className="px-6 py-3.5 font-semibold text-right">Paid Amount</th>
                      <th className="px-6 py-3.5 font-semibold">Payment Method</th>
                      <th className="px-6 py-3.5 font-semibold">TRX Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {statement.settlements
                      .slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize)
                      .map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                            {s.settlementNumber}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                            {s.totalBookings} parcels
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-xs font-bold text-slate-900">
                            ৳{s.totalCodAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-xs text-amber-700 font-medium">
                            -৳{(s.totalDeliveryCharge + s.totalCodCharge).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-xs font-extrabold text-emerald-600">
                            ৳{s.paidAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="bg-slate-50 text-slate-800 font-semibold text-xs">
                              {s.paymentMethod}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 font-mono">
                            {s.transactionRef || 'N/A'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <Pagination
                  currentPage={historyPage}
                  totalPages={Math.ceil(statement.settlements.length / historyPageSize)}
                  totalItems={statement.settlements.length}
                  pageSize={historyPageSize}
                  onPageChange={(page) => setHistoryPage(page)}
                  onPageSizeChange={(size) => {
                    setHistoryPageSize(size);
                    setHistoryPage(1);
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Execute Settlement Dialog Modal */}
      <Dialog
        open={settlementModalOpen}
        onOpenChange={setSettlementModalOpen}
        title="Execute Merchant Settlement Payout"
        description={`Confirm payout for ${selectedTxIds.length} selected COD transactions for ${statement?.merchant.businessName}`}
      >
        <form onSubmit={handleExecuteSettlement} className="space-y-4">
          {/* Summary Breakdown Box */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Gross COD Collected:</span>
              <span className="font-mono font-bold">৳{selectedCodTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-amber-300">
              <span>Delivery Charges:</span>
              <span className="font-mono font-bold">-৳{selectedDelTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-purple-300">
              <span>COD Commission ({statement?.merchant.codCharge}%):</span>
              <span className="font-mono font-bold">-৳{selectedCodFeeTotal.toFixed(2)}</span>
            </div>
            {adjustments !== 0 && (
              <div className="flex justify-between text-xs text-sky-300">
                <span>Manual Adjustment:</span>
                <span className="font-mono font-bold">
                  {adjustments > 0 ? '+' : ''}৳{adjustments.toFixed(2)}
                </span>
              </div>
            )}
            <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-emerald-400">
              <span>Final Net Payout:</span>
              <span className="font-mono text-lg">৳{finalPayoutAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Adjustments (৳)</label>
              <Input
                type="number"
                step="0.01"
                value={adjustments}
                onChange={(e) => setAdjustments(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Payment Method *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs font-bold text-slate-900 mt-1"
                required
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="bKash">bKash Mobile Wallet</option>
                <option value="Nagad">Nagad Mobile Wallet</option>
                <option value="Cash">Cash in Hand</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Transaction Reference / TRX ID</label>
            <Input
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. TRX-90823419 or Cheque #8812"
              className="mt-1 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Accountant Notes / Remarks</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Add settlement processing notes..."
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs mt-1"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setSettlementModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submittingSettlement}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4" />
              {submittingSettlement ? 'Processing...' : `Confirm & Pay ৳${finalPayoutAmount.toFixed(2)}`}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default MerchantStatement;
