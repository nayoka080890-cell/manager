import React from 'react';
import { invoiceFormTranslations, invoiceTranslations, type Language } from '@/i18n/translations';
import type { Invoice } from '@/pages/invoices/invoiceTypes';
import { formatVnd } from '@/utils/formatCurrency';

type Props = {
  language: Language;
  invoice: Invoice | null;
  isLoading?: boolean;
  onBack: () => void;
};

const formatDateDMY = (dateString: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
};

const statusBadgeClass = (status: Invoice['status']) => {
  if (status === 'Paid') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (status === 'Sent') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (status === 'Overdue') return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

const ViewInvoicePage: React.FC<Props> = ({ language, invoice, isLoading = false, onBack }) => {
  const t = invoiceTranslations[language];
  const formT = invoiceFormTranslations[language];

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow-sm border border-gray-200 p-6 text-sm text-gray-500">
        Loading invoice data...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="bg-white shadow-sm border border-gray-200 p-6 text-sm text-gray-500">
        Invoice not found.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 print:hidden">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white border border-slate-700 shadow-sm p-4 md:p-5 print:bg-white print:text-black print:border-gray-300">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <button onClick={onBack} className="text-sm text-slate-200 hover:text-white print:hidden">
              ← {formT.backToList}
            </button>
            <h3 className="text-xl font-semibold">{(t as Record<string, string>).view}</h3>
            <p className="text-sm text-slate-200 print:text-gray-700">{invoice.invoiceNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="print:hidden px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
            >
              {(t as Record<string, string>).print}
            </button>
            <span className="text-xs uppercase tracking-wider text-slate-200">{t.status}</span>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start invoice-print-area">
        <div className="lg:col-span-2 bg-white shadow-sm border border-gray-200 p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-500">{t.invoiceNo}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{invoice.invoiceNumber}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-500">{t.customer}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{invoice.customerName}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-500">{t.date}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDateDMY(invoice.date)}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{formT.product}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{formT.unit}</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">{formT.qty}</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">{formT.unitPrice}</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">{(formT as Record<string, string>).lineTotal}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm text-gray-800 font-medium">{item.productName}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-600">{item.unit}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700 text-right">{item.qty}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700 text-right">{formatVnd(item.unitPrice)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-900 font-semibold text-right">{formatVnd(item.lineTotal)}</td>
                  </tr>
                ))}
                {invoice.items.length === 0 && (
                  <tr>
                    <td className="px-3 py-4 text-sm text-gray-500" colSpan={5}>-</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-gray-200">
            <div className="border-b border-gray-200 bg-gray-50 px-3 py-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600">{(t as Record<string, string>).paymentHistory}</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">{t.date}</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">{t.amount}</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">{(t as Record<string, string>).paymentMethod}</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">{(t as Record<string, string>).reference}</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">{(t as Record<string, string>).notes}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {invoice.payments && invoice.payments.length > 0 ? (
                    invoice.payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm text-gray-700">{formatDateDMY(payment.date)}</td>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">{formatVnd(payment.amount)}</td>
                        <td className="px-3 py-2 text-sm text-gray-700">{payment.method || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-700">{payment.reference || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-700">{payment.notes || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-3 py-3 text-sm text-gray-500" colSpan={5}>{(t as Record<string, string>).noPayments}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 p-4 space-y-3 lg:sticky lg:top-3">
          <h4 className="text-sm font-semibold text-gray-900">{formT.summary}</h4>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{formT.subtotal}</span>
            <span className="font-medium text-gray-900">{formatVnd(invoice.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{formT.discount}</span>
            <span className="font-medium text-gray-900">{formatVnd(invoice.discount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{formT.paymentReceived}</span>
            <span className="font-medium text-gray-900">{formatVnd(invoice.paymentReceived)}</span>
          </div>

          <div className="border-t border-dashed border-gray-300 pt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">{formT.total}</span>
            <span className="text-base font-bold text-gray-900">{formatVnd(invoice.total)}</span>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
            <p className="text-xs text-amber-700">{formT.balanceDue}</p>
            <p className="text-sm font-semibold text-amber-800">{formatVnd(invoice.balanceDue)}</p>
          </div>
        </div>
      </div>
      </div>

      <div className="hidden print:block invoice-print-document">
        <div className="invoice-print-top">
          <div className="invoice-print-company">
            <h1>QH Manage Construction Co., Ltd.</h1>
            <p>Branch: Main Branch - 120 Nguyen Van Linh, Da Nang</p>
            <p>Branch: Warehouse Branch - 88 Le Trong Tan, Da Nang</p>
            <p>Phone: 0901 234 567 | Email: contact@qhmanage-demo.vn</p>
          </div>

          <div className="invoice-print-services">
            <h2>Products & Services</h2>
            <p>- Box steel, reinforcing steel, roofing sheets</p>
            <p>- Cement, bricks, finishing materials</p>
            <p>- Delivery, installation, on-site consultation</p>
          </div>
        </div>

        <div className="invoice-print-number">{t.invoiceNo}: {invoice.invoiceNumber}</div>

        <div className="invoice-print-customer">
          <div className="invoice-print-info-grid">
            <div className="invoice-print-info-row invoice-print-info-row-full">
              <span className="label">{formT.customerName}</span>
              <span className="value">{invoice.customerName} ({invoice.customerPhone || '-'})</span>
            </div>
            <div className="invoice-print-info-row invoice-print-info-row-full">
              <span className="label">{formT.address}</span>
              <span className="value">{invoice.customerAddress || '-'}</span>
            </div>
          </div>
        </div>

        <table className="invoice-print-table">
          <thead>
            <tr>
              <th>{formT.product}</th>
              <th>{formT.unit}</th>
              <th className="num">{formT.qty}</th>
              <th className="num">{formT.unitPrice}</th>
              <th className="num">{(formT as Record<string, string>).lineTotal}</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td>{item.productName}</td>
                <td>{item.unit}</td>
                <td className="num">{item.qty}</td>
                <td className="num">{formatVnd(item.unitPrice)}</td>
                <td className="num">{formatVnd(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-print-totals">
          <div><span>{formT.subtotal}</span><strong>{formatVnd(invoice.subtotal)}</strong></div>
          <div><span>{formT.discount}</span><strong>{formatVnd(invoice.discount)}</strong></div>
          <div><span>{formT.paymentReceived}</span><strong>{formatVnd(invoice.paymentReceived)}</strong></div>
          <div className="grand"><span>{formT.total}</span><strong>{formatVnd(invoice.total)}</strong></div>
          <div><span>{formT.balanceDue}</span><strong>{formatVnd(invoice.balanceDue)}</strong></div>
        </div>
      </div>
    </>
  );
};

export default ViewInvoicePage;
