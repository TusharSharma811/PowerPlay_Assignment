import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomerById } from '../services/api';

interface Customer {
  _id: string;
  name: string;
  companyId: { _id: string; name: string };
}

interface Invoice {
  _id: string;
  invoiceId: string;
  total: number;
  status: string;
  issueDate: string;
}

interface Metrics {
  totalInvoices: number;
  totalBilledAmount: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
}

const STATUS_STYLES: Record<string, string> = {
  Paid: 'bg-green-100 text-green-800',
  Unpaid: 'bg-yellow-100 text-yellow-800',
  Overdue: 'bg-red-100 text-red-800',
  Draft: 'bg-slate-100 text-slate-600',
  Sent: 'bg-blue-100 text-blue-800',
  Void: 'bg-gray-100 text-gray-500',
};

function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCustomerById(id)
      .then(res => {
        setCustomer(res.data.customer);
        setInvoices(res.data.invoices);
        setMetrics(res.data.metrics);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Compute totals for extra cards
  const totalTax = invoices.reduce((sum, inv: any) => sum + (inv.tax || 0), 0);
  const outstanding = invoices.filter((inv: any) => ['Unpaid', 'Overdue', 'Sent'].includes(inv.status)).reduce((sum, inv: any) => sum + inv.total, 0);
  const draftCount = invoices.filter(inv => inv.status === 'Draft').length;

  // Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="skeleton h-3 w-32 mb-6" />
            <div className="flex items-center gap-4 mb-8">
              <div className="skeleton w-14 h-14 rounded-full" />
              <div>
                <div className="skeleton h-5 w-40 mb-2" />
                <div className="skeleton h-3 w-28" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4">
                  <div className="skeleton h-3 w-20 mb-2" />
                  <div className="skeleton h-5 w-24" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mb-8">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-8 w-24 rounded-full" />)}
            </div>
            <div className="skeleton h-3 w-28 mb-4" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="skeleton h-3.5 w-28" />
                  <div className="skeleton h-3.5 w-24" />
                  <div className="skeleton h-5 w-16 rounded-md" />
                  <div className="skeleton h-3.5 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Customer not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <button onClick={() => navigate('/')} className="hover:text-blue-500 bg-transparent border-none cursor-pointer text-sm text-gray-400">Invoices</button>
            <span>/</span>
            <span className="text-gray-600">Customer</span>
          </div>

          {/* Customer Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
              {customer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{customer.name}</h1>
              <p className="text-sm text-gray-400">{customer.companyId?.name}</p>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <span className="text-xs font-semibold text-gray-400 uppercase">Total billed</span>
              <p className="text-lg font-bold text-gray-900 mt-1">{metrics ? fmt(metrics.totalBilledAmount) : '–'}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <span className="text-xs font-semibold text-gray-400 uppercase">Total tax</span>
              <p className="text-lg font-bold text-gray-900 mt-1">{fmt(Math.round(totalTax * 100) / 100)}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <span className="text-xs font-semibold text-gray-400 uppercase">Outstanding</span>
              <p className="text-lg font-bold text-gray-900 mt-1">{fmt(Math.round(outstanding * 100) / 100)}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <span className="text-xs font-semibold text-gray-400 uppercase"># Invoices</span>
              <p className="text-lg font-bold text-gray-900 mt-1">{metrics?.totalInvoices || 0}</p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex gap-3 mb-8">
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">Paid {metrics?.paidInvoices || 0}</span>
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Unpaid {metrics?.unpaidInvoices || 0}</span>
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800">Overdue {metrics?.overdueInvoices || 0}</span>
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600">Draft {draftCount}</span>
          </div>

          {/* Invoice History */}
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Invoice history</h3>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Issued</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-sm text-gray-500">{inv.invoiceId}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{fmt(inv.total)}</td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${STATUS_STYLES[inv.status] || ''}`}>{inv.status}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(inv.issueDate)}</td>
                  </tr>
                ))}
                {invoices.length === 0 && <tr><td colSpan={4} className="text-center text-gray-400 py-10">No invoices</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerProfile;
