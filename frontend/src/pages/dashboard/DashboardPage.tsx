import React from 'react';
import { formatVnd } from '@/utils/formatCurrency';

type InvoiceRow = {
  id: number;
  invoiceNo: string;
  customer: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  date: string;
};

type ProductRow = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
};

const dailyInvoices: InvoiceRow[] = [
  { id: 1, invoiceNo: 'INV-2201', customer: 'Acme Co.', amount: 540, status: 'Draft', date: '2026-03-28' },
  { id: 2, invoiceNo: 'INV-2202', customer: 'Beta Stores', amount: 780, status: 'Paid', date: '2026-03-28' },
  { id: 3, invoiceNo: 'INV-2203', customer: 'North Traders', amount: 1120, status: 'Sent', date: '2026-03-28' },
  { id: 4, invoiceNo: 'INV-2204', customer: 'Galaxy Retail', amount: 450, status: 'Overdue', date: '2026-03-28' },
  { id: 5, invoiceNo: 'INV-2205', customer: 'Sunrise Mart', amount: 300, status: 'Paid', date: '2026-03-27' },
];

const products: ProductRow[] = [
  { id: 1, name: 'Stainless Bolt', quantity: 500, unit: 'PCS' },
  { id: 2, name: 'A4 Paper', quantity: 42, unit: 'Ream' },
  { id: 3, name: 'Mobile Charger', quantity: 18, unit: 'PCS' },
  { id: 4, name: 'HDMI Cable', quantity: 95, unit: 'PCS' },
  { id: 5, name: 'PVC Pipe 1/2 inch', quantity: 12, unit: 'Meter' },
];

const dailyDebts = [120, 320, 260];
const dailyRents = ['RENT-901', 'RENT-902', 'RENT-903', 'RENT-904'];
const today = new Date().toISOString().split('T')[0];

const DashboardPanel: React.FC = () => {
  const todayInvoices = dailyInvoices.filter((inv) => inv.date === today);
  const incompleteTodayInvoices = todayInvoices.filter((inv) => inv.status !== 'Paid');
  const lowStockProducts = products.filter((p) => p.quantity <= 100);

  const dailyRevenue = todayInvoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const dailyDebt = incompleteTodayInvoices.reduce((sum, inv) => sum + inv.amount, 0) + dailyDebts.reduce((s, d) => s + d, 0);

  const stats = [
    { name: 'Revenue', value: formatVnd(dailyRevenue), isMoney: true, color: 'text-green-600' },
    { name: 'Invoices', value: String(todayInvoices.length), isMoney: false, color: 'text-green-600' },
    { name: 'Debt', value: formatVnd(dailyDebt), isMoney: true, color: 'text-red-600' },
    { name: 'Rent', value: String(dailyRents.length), isMoney: false, color: 'text-gray-900' },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white shadow-sm border border-gray-200 p-3">
            <p className="text-sm font-medium text-gray-600">{stat.name}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Invoices Not Complete</h3>
          {incompleteTodayInvoices.length === 0 ? (
            <p className="text-sm text-gray-500">No incomplete invoices today.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {incompleteTodayInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="px-3 py-2 text-sm text-gray-700">{inv.invoiceNo}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{inv.customer}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">
                        <span>{formatVnd(inv.amount)}</span>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700">{inv.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Products Low Quantity</h3>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-500">No low-stock products.</p>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between border border-gray-100 rounded-md px-3 py-2">
                  <p className="text-sm font-medium text-gray-800">{product.name}</p>
                  <p className="text-sm text-red-600 font-semibold">{product.quantity} {product.unit}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPanel;
