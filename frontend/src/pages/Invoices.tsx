import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices, getCustomers } from '../services/api';
import InvoiceForm from './InvoiceForm';

interface Invoice {
  _id: string;
  invoiceId: string;
  customerId: {
    _id: string;
    name: string;
    companyId: { _id: string; name: string };
  };
  amount: number;
  taxRate: number;
  tax: number;
  total: number;
  status: string;
  issueDate: string;
  dueDate: string;
}

interface Customer {
  _id: string;
  name: string;
}

const STATUS_STYLES: Record<string, string> = {
  Paid: 'bg-green-100 text-green-800',
  Unpaid: 'bg-yellow-100 text-yellow-800',
  Overdue: 'bg-red-100 text-red-800',
  Draft: 'bg-slate-100 text-slate-600',
  Sent: 'bg-blue-100 text-blue-800',
  Void: 'bg-gray-100 text-gray-500',
};

function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sortBy, setSortBy] = useState('issueDate');
  const [order, setOrder] = useState('desc');
  const [status, setStatus] = useState('');
  const [customer, setCustomer] = useState('');
  const [issueDateFrom, setIssueDateFrom] = useState('');
  const [issueDateTo, setIssueDateTo] = useState('');
  const [dueDateFrom, setDueDateFrom] = useState('');
  const [dueDateTo, setDueDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setFetching(true);
    try {
      const params: Record<string, string | number> = { page, limit, sortBy, order };
      if (status) params.status = status;
      if (customer) params.customer = customer;
      if (issueDateFrom) params.issueDateFrom = issueDateFrom;
      if (issueDateTo) params.issueDateTo = issueDateTo;
      if (dueDateFrom) params.dueDateFrom = dueDateFrom;
      if (dueDateTo) params.dueDateTo = dueDateTo;

      const res = await getInvoices(params);
      let filtered = res.data.invoices;
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter((inv: Invoice) =>
          inv.invoiceId.toLowerCase().includes(q) ||
          inv.customerId.name.toLowerCase().includes(q)
        );
      }
      setInvoices(filtered);
      setTotalRecords(res.data.totalRecords);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setInitialLoad(false);
      setFetching(false);
    }
  }, [page, limit, sortBy, order, status, customer, issueDateFrom, issueDateTo, dueDateFrom, dueDateTo, search]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);
  useEffect(() => { getCustomers().then(res => setCustomers(res.data)).catch(console.error); }, []);

  const handleSort = (field: string) => {
    if (sortBy === field) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setOrder('desc'); }
    setPage(1);
  };

  const getSortIcon = (field: string) => sortBy !== field ? '↕' : order === 'asc' ? '↑' : '↓';
  const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, totalRecords);

  const getPageNumbers = () => {
    const pages: number[] = [];
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pages.push(i);
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <div className="flex gap-2.5">
            <button onClick={() => navigate('/summary')} className="px-5 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 cursor-pointer font-medium">Summary</button>
            <button onClick={() => { setEditInvoiceId(null); setShowModal(true); }} className="px-5 py-2 border border-blue-500 rounded-lg bg-white text-sm text-blue-500 font-semibold hover:bg-blue-500 hover:text-white cursor-pointer transition-colors">New invoice</button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-3 mb-5">
          <input type="text" placeholder="Search invoice / customer" value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:border-gray-400 placeholder:text-gray-400" />
          <div className="flex gap-2">
            {/* Status pill */}
            <div className="relative">
              <button onClick={() => setShowStatusFilter(!showStatusFilter)}
                className={`px-4 py-2.5 border rounded-xl text-sm cursor-pointer whitespace-nowrap transition-colors ${status ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'}`}>
                Status {status && `· ${status}`}
              </button>
              {showStatusFilter && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[140px] overflow-hidden">
                  {['', 'Paid', 'Unpaid', 'Overdue', 'Sent', 'Draft', 'Void'].map(s => (
                    <button key={s} onClick={() => { setStatus(s); setShowStatusFilter(false); setPage(1); }}
                      className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 cursor-pointer ${status === s ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700'}`}>
                      {s || 'All'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Customer pill */}
            <div className="relative">
              <button className={`px-4 py-2.5 border rounded-xl text-sm cursor-pointer ${customer ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-gray-300 bg-white text-gray-500'}`}>Customer</button>
              <select value={customer} onChange={e => { setCustomer(e.target.value); setPage(1); }}
                className="absolute inset-0 opacity-0 cursor-pointer">
                <option value="">All customers</option>
                {customers.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {/* Date pill */}
            <div className="relative">
              <button onClick={() => setShowDateFilter(!showDateFilter)}
                className={`px-4 py-2.5 border rounded-xl text-sm cursor-pointer ${issueDateFrom || dueDateFrom ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'}`}>
                Date
              </button>
              {showDateFilter && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 min-w-[220px] flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase mt-1">Issue from</label>
                  <input type="date" value={issueDateFrom} onChange={e => { setIssueDateFrom(e.target.value); setPage(1); }} className="px-2.5 py-2 border border-gray-200 rounded-md text-sm" />
                  <label className="text-xs font-semibold text-gray-400 uppercase mt-1">Issue to</label>
                  <input type="date" value={issueDateTo} onChange={e => { setIssueDateTo(e.target.value); setPage(1); }} className="px-2.5 py-2 border border-gray-200 rounded-md text-sm" />
                  <label className="text-xs font-semibold text-gray-400 uppercase mt-1">Due from</label>
                  <input type="date" value={dueDateFrom} onChange={e => { setDueDateFrom(e.target.value); setPage(1); }} className="px-2.5 py-2 border border-gray-200 rounded-md text-sm" />
                  <label className="text-xs font-semibold text-gray-400 uppercase mt-1">Due to</label>
                  <input type="date" value={dueDateTo} onChange={e => { setDueDateTo(e.target.value); setPage(1); }} className="px-2.5 py-2 border border-gray-200 rounded-md text-sm" />
                  <button onClick={() => { setIssueDateFrom(''); setIssueDateTo(''); setDueDateFrom(''); setDueDateTo(''); setShowDateFilter(false); setPage(1); }}
                    className="mt-2 py-2 bg-gray-100 rounded-md text-sm cursor-pointer hover:bg-gray-200">Clear dates</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide cursor-pointer select-none hover:text-gray-600" onClick={() => handleSort('invoiceId')}>Invoice {getSortIcon('invoiceId')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide cursor-pointer select-none hover:text-gray-600" onClick={() => handleSort('issueDate')}>Customer {getSortIcon('issueDate')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide cursor-pointer select-none hover:text-gray-600" onClick={() => handleSort('amount')}>Amount {getSortIcon('amount')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Tax%</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide cursor-pointer select-none hover:text-gray-600" onClick={() => handleSort('total')}>Total {getSortIcon('total')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            {initialLoad ? (
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4"><div className="skeleton h-3.5 w-24" /></td>
                    <td className="px-4 py-4"><div className="skeleton h-3.5 w-32" /></td>
                    <td className="px-4 py-4"><div className="skeleton h-3.5 w-20" /></td>
                    <td className="px-4 py-4"><div className="skeleton h-3.5 w-10" /></td>
                    <td className="px-4 py-4"><div className="skeleton h-3.5 w-20" /></td>
                    <td className="px-4 py-4"><div className="skeleton h-6 w-16 rounded-md" /></td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody className={`transition-opacity duration-150 ${fetching ? 'opacity-50' : 'opacity-100'}`}>
                {invoices.map(inv => (
                  <tr key={inv._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-4 py-3.5 font-mono text-sm text-gray-500">{inv.invoiceId}</td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => navigate(`/customers/${inv.customerId._id}`)} className="text-blue-500 hover:underline bg-transparent border-none cursor-pointer text-sm">{inv.customerId.name}</button>
                    </td>
                    <td className="px-4 py-3.5 text-sm">{formatCurrency(inv.amount)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-400">{inv.taxRate}%</td>
                    <td className="px-4 py-3.5 text-sm font-semibold">{formatCurrency(inv.total)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${STATUS_STYLES[inv.status] || ''}`}>{inv.status}</span>
                      <button onClick={() => { setEditInvoiceId(inv._id); setShowModal(true); }} className="ml-3 text-gray-300 hover:text-gray-600 bg-transparent border-none cursor-pointer text-base">✎</button>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && <tr><td colSpan={6} className="text-center text-gray-400 py-12">No invoices found</td></tr>}
              </tbody>
            )}
          </table>

          {!initialLoad && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
              <span className="text-sm text-gray-400">Showing {startIdx}–{endIdx} of {totalRecords.toLocaleString()}</span>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 text-lg">‹</button>
                {getPageNumbers().map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 flex items-center justify-center border rounded-lg text-sm cursor-pointer ${p === page ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-semibold' : 'border-gray-200 hover:bg-gray-50 text-gray-500'}`}>{p}</button>
                ))}
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 text-lg">›</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && <InvoiceForm invoiceId={editInvoiceId} onClose={() => { setShowModal(false); setEditInvoiceId(null); fetchInvoices(); }} />}
    </div>
  );
}

export default Invoices;
