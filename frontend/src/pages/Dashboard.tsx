import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardSummary, getTopCustomers } from '../services/api';

interface Summary {
  totalInvoices: number;
  totalRevenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
  overdueInvoices: number;
}

interface TopCustomer {
  customerId: string;
  customerName: string;
  companyName: string;
  totalInvoiceValue: number;
  invoiceCount: number;
}

function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardSummary(), getTopCustomers()])
      .then(([s, c]) => { setSummary(s.data); setTopCustomers(c.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const maxVal = topCustomers.length > 0 ? Math.max(...topCustomers.map(c => c.totalInvoiceValue)) : 0;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Summary</h1>
          <button onClick={() => navigate('/')} className="px-5 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 cursor-pointer font-medium">← Back to invoices</button>
        </div>

        {/* Summary Cards */}
        {loading ? (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="skeleton h-3 w-3/5 mb-3" />
                <div className="skeleton h-6 w-2/5" />
              </div>
            ))}
          </div>
        ) : summary && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total billed</span>
              <span className="text-xl font-bold text-gray-900">{fmt(summary.totalRevenue)}</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Paid revenue</span>
              <span className="text-xl font-bold text-gray-900">{fmt(summary.paidRevenue)}</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide"># Invoices</span>
              <span className="text-xl font-bold text-gray-900">{summary.totalInvoices.toLocaleString()}</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Overdue</span>
              <span className="text-xl font-bold text-red-600">{summary.overdueInvoices}</span>
            </div>
          </div>
        )}

        {/* Top Customers */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="skeleton h-4 w-48 mb-5" />
            <div className="flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="skeleton h-3.5 w-36" />
                  <div className="skeleton h-6 flex-1 rounded" />
                  <div className="skeleton h-3.5 w-20" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-5">Top customers by value</h3>
            <div className="flex flex-col gap-3.5">
              {topCustomers.map((c, i) => (
                <div key={c.customerId} className="flex items-center gap-4">
                  <div className="w-44 flex-shrink-0 flex items-center gap-1.5">
                    <span className="text-sm text-gray-400 w-5">{i + 1}.</span>
                    <button onClick={() => navigate(`/customers/${c.customerId}`)} className="text-sm font-medium text-gray-700 hover:text-blue-500 bg-transparent border-none cursor-pointer text-left">{c.customerName}</button>
                  </div>
                  <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                    <div className="h-full bg-indigo-200 rounded transition-all duration-500" style={{ width: `${(c.totalInvoiceValue / maxVal) * 100}%` }} />
                  </div>
                  <span className="w-32 text-right text-sm text-gray-500 flex-shrink-0">{fmt(c.totalInvoiceValue)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
