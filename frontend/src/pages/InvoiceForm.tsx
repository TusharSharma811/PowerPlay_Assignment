import { useState, useEffect } from 'react';
import { getCustomers, getCustomerById, createInvoice, updateInvoice } from '../services/api';
import axios from 'axios';

interface Customer {
  _id: string;
  name: string;
  companyId: { _id: string; name: string };
}

interface Props {
  invoiceId: string | null;
  onClose: () => void;
}

function InvoiceForm({ invoiceId, onClose }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [customerId, setCustomerId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [amount, setAmount] = useState('');
  const [taxRate, setTaxRate] = useState('0');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Draft');
  const [invoiceCode, setInvoiceCode] = useState('');
  const [error, setError] = useState('');

  const isEdit = !!invoiceId;
  const computedTax = amount && taxRate ? Math.round(parseFloat(amount) * (parseFloat(taxRate) / 100) * 100) / 100 : 0;
  const computedTotal = amount ? Math.round((parseFloat(amount) + computedTax) * 100) / 100 : 0;

  useEffect(() => { getCustomers().then(res => setCustomers(res.data)).catch(console.error); }, []);

  useEffect(() => {
    if (isEdit && invoiceId) {
      setLoading(true);
      axios.get(`http://localhost:5000/api/invoices?limit=2000`).then(res => {
        const inv = res.data.invoices.find((i: any) => i._id === invoiceId);
        if (inv) {
          setCustomerId(inv.customerId._id);
          setCompanyName(inv.customerId.companyId?.name || '');
          setAmount(inv.amount.toString());
          setTaxRate(inv.taxRate.toString());
          setIssueDate(inv.issueDate.split('T')[0]);
          setDueDate(inv.dueDate.split('T')[0]);
          setStatus(inv.status);
          setInvoiceCode(inv.invoiceId);
        }
      }).finally(() => setLoading(false));
    }
  }, [invoiceId, isEdit]);

  useEffect(() => {
    if (customerId) {
      const cust = customers.find(c => c._id === customerId);
      if (cust) setCompanyName(cust.companyId?.name || '');
      else getCustomerById(customerId).then(res => setCompanyName(res.data.customer?.companyId?.name || '')).catch(() => {});
    } else setCompanyName('');
  }, [customerId, customers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!customerId || !amount || !taxRate || !issueDate || !dueDate) { setError('Please fill all required fields'); return; }

    setSaving(true);
    try {
      const data: any = { customerId, amount: parseFloat(amount), taxRate: parseFloat(taxRate), status, issueDate, dueDate };
      if (isEdit) await updateInvoice(invoiceId!, data);
      else { data.invoiceId = `INV-${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`; await createInvoice(data); }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 w-[480px] max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 mb-1">{isEdit ? 'Edit invoice' : 'New invoice'}</h2>
        {isEdit && <p className="text-sm text-gray-400 font-mono mb-5">{invoiceCode}</p>}

        {loading ? (
          <div className="flex flex-col gap-4 py-5">
            <div className="skeleton h-10 w-full rounded-lg" />
            <div className="skeleton h-10 w-full rounded-lg" />
            <div className="flex gap-3">
              <div className="skeleton h-10 w-1/2 rounded-lg" />
              <div className="skeleton h-10 w-1/2 rounded-lg" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Customer</label>
              <select value={customerId} onChange={e => setCustomerId(e.target.value)} required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white">
                <option value="">Select customer</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name}{c.companyId?.name ? ` (${c.companyId.name})` : ''}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Company (auto-filled)</label>
              <input type="text" value={companyName} disabled className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400" />
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Amount</label>
                <input type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tax rate</label>
                <select value={taxRate} onChange={e => setTaxRate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white">
                  <option value="0">0%</option>
                  <option value="3">3%</option>
                  <option value="5">5%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Issue date</label>
                <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Due date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white">
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Overdue">Overdue</option>
                <option value="Void">Void</option>
              </select>
            </div>

            <div className="bg-gray-50 px-4 py-3 rounded-lg text-sm text-gray-500 mb-4">
              Tax <strong className="text-gray-700">₹{computedTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              {' · '}
              Total <strong className="text-gray-700">₹{computedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              <span className="text-gray-400 text-xs ml-1">(computed)</span>
            </div>

            {error && <div className="text-red-600 text-sm mb-3 px-3 py-2 bg-red-50 rounded-lg">{error}</div>}

            <div className="flex justify-end gap-2.5 mt-2">
              <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-500 hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button type="submit" disabled={saving} className="px-5 py-2.5 border border-blue-500 rounded-lg bg-white text-sm text-blue-500 font-semibold hover:bg-blue-500 hover:text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? 'Saving...' : 'Save invoice'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default InvoiceForm;
