import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Pagination } from '@/components/ui/Pagination';
import {
  Landmark,
  PlusCircle,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Wallet,
  Building2,
  RefreshCw,
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface IncomeItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  source?: string;
  description?: string;
  date: string;
}

interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  branchId?: string;
  date: string;
}

interface AccountingSummary {
  recordedIncomeTotal: number;
  deliveryFeeRevenue: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
}

export const Accounts: React.FC = () => {
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Ledger Tab: 'expense' | 'income'
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  // Pagination State
  const [expensePage, setExpensePage] = useState(1);
  const [expensePageSize, setExpensePageSize] = useState(10);
  const [incomePage, setIncomePage] = useState(1);
  const [incomePageSize, setIncomePageSize] = useState(10);

  // Expense Modal State
  const [expenseDialogOpen, setExpenseDialogOpen] = useState<boolean>(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Fuel');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Income Modal State
  const [incomeDialogOpen, setIncomeDialogOpen] = useState<boolean>(false);
  const [incomeTitle, setIncomeTitle] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeCategory, setIncomeCategory] = useState('Packaging Fee');
  const [incomeSource, setIncomeSource] = useState('Corporate Client');
  const [incomeDescription, setIncomeDescription] = useState('');
  const [submittingIncome, setSubmittingIncome] = useState(false);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const [incRes, expRes, sumRes]: [any, any, any] = await Promise.all([
        api.get('/accounting/incomes'),
        api.get('/accounting/expenses'),
        api.get('/accounting/summary'),
      ]);

      if (incRes.success && Array.isArray(incRes.data)) setIncomes(incRes.data);
      if (expRes.success && Array.isArray(expRes.data)) setExpenses(expRes.data);
      if (sumRes.success && sumRes.data) setSummary(sumRes.data);
    } catch (_err) {
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) {
      toast.error('Please fill out expense title and amount.');
      return;
    }

    try {
      setSubmittingExpense(true);
      await api.post('/accounting/expenses', {
        title: expenseTitle,
        amount: parseFloat(expenseAmount),
        category: expenseCategory,
        description: expenseDescription,
      });

      toast.success(`Expense "${expenseTitle}" recorded successfully`);
      setExpenseDialogOpen(false);
      setExpenseTitle('');
      setExpenseAmount('');
      setExpenseDescription('');
      fetchFinancialData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleCreateIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeTitle || !incomeAmount) {
      toast.error('Please fill out income title and amount.');
      return;
    }

    try {
      setSubmittingIncome(true);
      await api.post('/accounting/incomes', {
        title: incomeTitle,
        amount: parseFloat(incomeAmount),
        category: incomeCategory,
        source: incomeSource,
        description: incomeDescription,
      });

      toast.success(`Income "${incomeTitle}" recorded successfully`);
      setIncomeDialogOpen(false);
      setIncomeTitle('');
      setIncomeAmount('');
      setIncomeDescription('');
      fetchFinancialData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record income');
    } finally {
      setSubmittingIncome(false);
    }
  };

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string; type: 'expense' | 'income' } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const promptDeleteExpense = (id: string, title: string) => {
    setItemToDelete({ id, title, type: 'expense' });
    setDeleteModalOpen(true);
  };

  const promptDeleteIncome = (id: string, title: string) => {
    setItemToDelete({ id, title, type: 'income' });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      if (itemToDelete.type === 'expense') {
        await api.delete(`/accounting/expenses/${itemToDelete.id}`);
      } else {
        await api.delete(`/accounting/incomes/${itemToDelete.id}`);
      }
      toast.success(`${itemToDelete.type === 'expense' ? 'Expense' : 'Income'} entry deleted successfully`);
      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetchFinancialData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete entry');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-6 h-6 text-primary" /> Accounting & Operating Ledgers
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Record office expenses, track ancillary incomes, and calculate courier net operating profit.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setExpenseDialogOpen(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold gap-1.5 shadow-sm text-xs"
          >
            <PlusCircle className="w-4 h-4" /> Record Office Expense
          </Button>
          <Button
            size="sm"
            onClick={() => setIncomeDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 shadow-sm text-xs"
          >
            <PlusCircle className="w-4 h-4" /> Record Income
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-5">
              <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Total Gross Income</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-2">
                ৳{summary.totalIncome.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                <span>Delivery Revenue: ৳{summary.deliveryFeeRevenue.toFixed(2)}</span>
                <span>Other: ৳{summary.recordedIncomeTotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardContent className="p-5">
              <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Operating Expenses</span>
                <TrendingDown className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-amber-700 font-mono mt-2">
                -৳{summary.totalExpense.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {summary.expenseCount} recorded expense entries
              </div>
            </CardContent>
          </Card>

          <Card
            className={`shadow-md text-white ${
              summary.netBalance >= 0
                ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
                : 'bg-gradient-to-br from-red-600 to-rose-700'
            }`}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-center text-white/90 text-xs font-extrabold uppercase tracking-wider">
                <span>Net Operating Profit</span>
                <Wallet className="w-5 h-5 text-white/90" />
              </div>
              <div className="text-3xl font-black font-mono mt-2">
                ৳{summary.netBalance.toFixed(2)}
              </div>
              <div className="text-[11px] text-white/90 font-medium mt-1">
                {summary.netBalance >= 0 ? 'Positive Operating Profit' : 'Operating Deficit'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ledger Navigation Tabs */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl w-fit gap-1">
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'expense'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4 text-amber-600" /> Expenses Ledger ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'income'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" /> Income Ledger ({incomes.length})
        </button>
      </div>

      {/* Expenses Table */}
      {activeTab === 'expense' && (
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Loading expenses...</div>
            ) : expenses.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No office expense entries recorded yet. Click "Record Office Expense" to add.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 border-b text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5 font-semibold">Expense Title</th>
                        <th className="px-6 py-3.5 font-semibold">Category</th>
                        <th className="px-6 py-3.5 font-semibold">Date</th>
                        <th className="px-6 py-3.5 font-semibold text-right">Amount</th>
                        <th className="px-6 py-3.5 font-semibold">Description</th>
                        <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expenses
                        .slice((expensePage - 1) * expensePageSize, expensePage * expensePageSize)
                        .map((e) => (
                          <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900 text-xs">{e.title}</td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 font-semibold text-xs">
                                {e.category}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-600">
                              {new Date(e.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-extrabold text-amber-700 text-sm">
                              -৳{e.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-600">
                              {e.description || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => promptDeleteExpense(e.id, e.title)}
                                className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={expensePage}
                  totalPages={Math.ceil(expenses.length / expensePageSize) || 1}
                  totalItems={expenses.length}
                  pageSize={expensePageSize}
                  onPageChange={setExpensePage}
                  onPageSizeChange={(size) => {
                    setExpensePageSize(size);
                    setExpensePage(1);
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Income Table */}
      {activeTab === 'income' && (
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Loading incomes...</div>
            ) : incomes.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No ancillary income entries recorded yet. Click "Record Income" to add.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 border-b text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5 font-semibold">Income Title</th>
                        <th className="px-6 py-3.5 font-semibold">Category</th>
                        <th className="px-6 py-3.5 font-semibold">Source</th>
                        <th className="px-6 py-3.5 font-semibold">Date</th>
                        <th className="px-6 py-3.5 font-semibold text-right">Amount</th>
                        <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {incomes
                        .slice((incomePage - 1) * incomePageSize, incomePage * incomePageSize)
                        .map((i) => (
                          <tr key={i.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900 text-xs">{i.title}</td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold text-xs">
                                {i.category}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                              {i.source || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-600">
                              {new Date(i.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-extrabold text-emerald-600 text-sm">
                              +৳{i.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => promptDeleteIncome(i.id, i.title)}
                                className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={incomePage}
                  totalPages={Math.ceil(incomes.length / incomePageSize) || 1}
                  totalItems={incomes.length}
                  pageSize={incomePageSize}
                  onPageChange={setIncomePage}
                  onPageSizeChange={(size) => {
                    setIncomePageSize(size);
                    setIncomePage(1);
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Record Expense Modal */}
      <Dialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        title="Record New Office Expense"
        description="Log operational costs including fuel, rider allowance, office rent, and utility bills."
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Expense Title *</label>
            <Input
              placeholder="e.g. Weekly Rider Fuel Allowance"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Amount (৳) *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="50.00"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="mt-1 font-bold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Category *</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold mt-1"
              >
                <option value="Fuel">Fuel & Gas</option>
                <option value="Rider Allowance">Rider Allowance</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Utilities">Utilities & Internet</option>
                <option value="Hub Rent">Hub / Office Rent</option>
                <option value="Maintenance">Vehicle Maintenance</option>
                <option value="Other">Other Expenses</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Description / Notes</label>
            <Input
              placeholder="e.g. Distributed cash fuel stipend to 3 riders"
              value={expenseDescription}
              onChange={(e) => setExpenseDescription(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setExpenseDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submittingExpense} className="bg-amber-600 hover:bg-amber-500 text-white font-bold">
              {submittingExpense ? 'Recording...' : 'Record Expense'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Record Income Modal */}
      <Dialog
        open={incomeDialogOpen}
        onOpenChange={setIncomeDialogOpen}
        title="Record Ancillary Income"
        description="Log additional non-parcel revenue such as custom packaging, corporate retainers, or franchise fees."
      >
        <form onSubmit={handleCreateIncome} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Income Title *</label>
            <Input
              placeholder="e.g. Custom Bubblewrap & Flyer Packaging Fee"
              value={incomeTitle}
              onChange={(e) => setIncomeTitle(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Amount (৳) *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="100.00"
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
                className="mt-1 font-bold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Category *</label>
              <select
                value={incomeCategory}
                onChange={(e) => setIncomeCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold mt-1"
              >
                <option value="Packaging Fee">Packaging & Flyers Fee</option>
                <option value="Corporate Retainer">Corporate Client Retainer</option>
                <option value="Franchise Fee">Branch Franchise Fee</option>
                <option value="Other">Other Revenue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Source / Client Name</label>
            <Input
              placeholder="e.g. Apex Tech Store"
              value={incomeSource}
              onChange={(e) => setIncomeSource(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Description / Notes</label>
            <Input
              placeholder="Details about revenue collection"
              value={incomeDescription}
              onChange={(e) => setIncomeDescription(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIncomeDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submittingIncome} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
              {submittingIncome ? 'Recording...' : 'Record Income'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={itemToDelete?.type === 'expense' ? 'Delete Expense Record' : 'Delete Income Record'}
        message={`Are you sure you want to delete ${itemToDelete?.type === 'expense' ? 'expense' : 'income'} record "${itemToDelete?.title}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
};

export default Accounts;
