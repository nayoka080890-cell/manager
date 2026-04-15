import React from 'react';
import { useInvoicesPage } from '@/features/invoices/hooks/useInvoicesPage';
import { invoiceTranslations, type Language } from '@/i18n/translations';
import AddNewInvoicePage from '@/pages/invoices/AddNewInvoicePage';
import ViewInvoicePage from '@/pages/invoices/ViewInvoicePage';
import type { Invoice } from '@/pages/invoices/invoiceTypes';
import { formatVnd } from '@/utils/formatCurrency';

const formatDateDMY = (dateString: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
};

const statusBadge = (status: Invoice['status'], label: string) => {
  const styles: Record<Invoice['status'], string> = {
    Draft: 'bg-gray-100 text-gray-700',
    Sent: 'bg-blue-100 text-blue-700',
    Paid: 'bg-green-100 text-green-700',
    Overdue: 'bg-red-100 text-red-700',
  };

  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>{label}</span>;
};

type InvoicesPageProps = {
  language: Language;
  viewMode?: 'list' | 'add';
  onViewChange?: (tab: string) => void;
};

const InvoicesPage: React.FC<InvoicesPageProps> = ({ language, viewMode = 'list', onViewChange }) => {
  const t = invoiceTranslations[language];
  const {
    invoices,
    filteredInvoices,
    showForm,
    showDetail,
    editingInvoice,
    viewingInvoice,
    isLoadingInvoiceDetail,
    searchTerm,
    statusFilter,
    createdDateFrom,
    createdDateTo,
    sortBy,
    paymentTarget,
    paymentDate,
    paymentAmount,
    paymentMethod,
    paymentReference,
    paymentNotes,
    paymentError,
    isSavingPayment,
    setSearchTerm,
    setStatusFilter,
    setCreatedDateFrom,
    setCreatedDateTo,
    setSortBy,
    setPaymentDate,
    setPaymentAmount,
    setPaymentMethod,
    setPaymentReference,
    setPaymentNotes,
    goToList,
    openCreateForm,
    handleView,
    handleEdit,
    handleDelete,
    openPaymentModal,
    closePaymentModal,
    handleSavePayment,
    handleFormSubmit,
  } = useInvoicesPage({ viewMode, onViewChange });

  if (showForm) {
    return (
      <AddNewInvoicePage
        language={language}
        editingInvoice={editingInvoice}
        isLoading={isLoadingInvoiceDetail}
        onBack={goToList}
        onSubmit={handleFormSubmit}
      />
    );
  }

  if (showDetail) {
    return (
      <ViewInvoicePage
        language={language}
        invoice={viewingInvoice}
        isLoading={isLoadingInvoiceDetail}
        onBack={goToList}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <button onClick={openCreateForm} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700">
          + {t.createNewInvoice}
        </button>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{t.invoices}</h3>
          <p className="text-xs text-gray-500">({invoices.length} {t.invoice}{invoices.length !== 1 ? 's' : ''})</p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200">
        {invoices.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            {t.noInvoicesYet}{' '}
            <button onClick={openCreateForm} className="text-indigo-600 hover:underline">
              {t.createFirstOne}
            </button>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchInvoices}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="date"
                value={createdDateFrom}
                onChange={(e) => setCreatedDateFrom(e.target.value)}
                aria-label={`${t.createdDate} from`}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="date"
                value={createdDateTo}
                onChange={(e) => setCreatedDateTo(e.target.value)}
                aria-label={`${t.createdDate} to`}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | Invoice['status'])}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">{t.allStatuses}</option>
                <option value="Draft">{t.draft}</option>
                <option value="Sent">{t.sent}</option>
                <option value="Paid">{t.paid}</option>
                <option value="Overdue">{t.overdue}</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'customer-asc' | 'customer-desc' | 'amount-asc' | 'amount-desc')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="newest">{t.sortBy}: {t.newest}</option>
                <option value="oldest">{t.sortBy}: {t.oldest}</option>
                <option value="customer-asc">{t.sortBy}: {t.customerAZ}</option>
                <option value="customer-desc">{t.sortBy}: {t.customerZA}</option>
                <option value="amount-asc">{t.sortBy}: {t.amountLowHigh}</option>
                <option value="amount-desc">{t.sortBy}: {t.amountHighLow}</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[t.no, t.invoiceNo, t.customer, t.amount, t.paymentHistory, t.balanceDue, t.date, t.status, t.actions].map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.map((invoice, index) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{invoice.customerName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatVnd(invoice.amount)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {invoice.payments && invoice.payments.length > 0 ? (
                          <div className="space-y-1">
                            {invoice.payments.map((payment) => (
                              <div key={payment.id} className="text-xs bg-blue-50 px-2 py-1 rounded">
                                <span className="font-medium">{formatVnd(payment.amount)}</span>
                                <span className="text-gray-500 ml-1">({formatDateDMY(payment.date)})</span>
                                {payment.isInitial && <span className="ml-1 text-gray-400">•</span>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">{t.noPayments}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-red-600">{formatVnd(invoice.balanceDue ?? 0)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDateDMY(invoice.date)}</td>
                      <td className="px-4 py-3 text-sm">
                        {statusBadge(invoice.status, invoice.status === 'Draft' ? t.draft : invoice.status === 'Sent' ? t.sent : invoice.status === 'Paid' ? t.paid : t.overdue)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => {
                            void openPaymentModal(invoice);
                          }}
                          disabled={invoice.balanceDue <= 0}
                          aria-label={t.payment}
                          title={invoice.balanceDue <= 0 ? t.invoiceAlreadyPaid : t.payment}
                          className={`inline-flex h-8 w-8 items-center justify-center text-white rounded mr-2 ${
                            invoice.balanceDue > 0
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : 'bg-gray-400 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                            <path d="M3 10h18" />
                            <path d="M7 15h1" />
                            <path d="M11 15h4" />
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                          </svg>
                        </button>
                        <button
                          onClick={() => void handleView(invoice)}
                          aria-label={t.view}
                          title={t.view}
                          className="inline-flex h-8 w-8 items-center justify-center text-emerald-600 bg-emerald-100 rounded hover:bg-emerald-200 mr-2"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          onClick={() => void handleEdit(invoice)}
                          aria-label={t.edit}
                          title={t.edit}
                          className="inline-flex h-8 w-8 items-center justify-center text-blue-600 bg-blue-100 rounded hover:bg-blue-200 mr-2"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          aria-label={t.delete}
                          title={t.delete}
                          className="inline-flex h-8 w-8 items-center justify-center text-red-600 bg-red-100 rounded hover:bg-red-200"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td className="px-4 py-4 text-sm text-gray-500" colSpan={9}>{t.noInvoicesFound}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 px-3 py-3 border-t border-gray-200">
          <button className="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200">
            Import Excel
          </button>
          <button className="px-3 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700">
            Export Excel
          </button>
        </div>
      </div>

      {paymentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-5 py-4">
              <h4 className="text-lg font-semibold text-gray-900">{t.addPayment}</h4>
              <p className="mt-1 text-sm text-gray-600">
                {paymentTarget.invoiceNumber} - {paymentTarget.customerName}
              </p>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t.paymentDate}</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t.paymentAmount}</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t.paymentMethod}</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t.reference}</label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t.notes}</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span>{t.total}:</span>
                  <span className="font-medium">{formatVnd(paymentTarget.total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t.paymentReceived}:</span>
                  <span className="font-medium">{formatVnd(paymentTarget.paymentReceived)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t.balanceDue}:</span>
                  <span className="font-semibold text-rose-700">{formatVnd(paymentTarget.balanceDue)}</span>
                </div>
              </div>

              {paymentError && <p className="text-sm text-red-600">{paymentError}</p>}
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button
                onClick={closePaymentModal}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                {t.close}
              </button>
              <button
                onClick={() => {
                  void handleSavePayment();
                }}
                disabled={isSavingPayment || paymentTarget.balanceDue <= 0}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingPayment ? t.saving : t.savePayment}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
