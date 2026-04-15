import React from 'react';
import { useCustomerPage } from '@/features/customers/hooks/useCustomerPage';
import { customerTranslations, type Language } from '@/i18n/translations';
import type { Customer } from '@/features/customers/api/customerApi';

type CustomerPageContentProps = {
  language: Language;
  viewMode?: 'list' | 'add';
  onViewChange?: (tab: string) => void;
};

const CustomerPageContent: React.FC<CustomerPageContentProps> = ({ language, viewMode = 'list', onViewChange }) => {
  const t = customerTranslations[language];
  const {
    customers,
    editingId,
    searchTerm,
    sortBy,
    customerInput,
    filteredCustomers,
    setSearchTerm,
    setSortBy,
    setCustomerInput,
    resetForm,
    handleSubmit,
    handleEdit,
    handleDelete,
  } = useCustomerPage({ viewMode, onViewChange });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmit();
  };

  return (
    <div className="flex gap-4 items-start">
      <div className="w-[30%] shrink-0 bg-white shadow-sm border border-gray-200 p-4">
        <h4 className="text-base font-medium text-gray-900 mb-4">
          {editingId ? t.editCustomer : t.createCustomer}
        </h4>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.name}</span>
            <input
              type="text"
              value={customerInput.name}
              onChange={(e) => setCustomerInput((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.email}</span>
            <input
              type="email"
              value={customerInput.email}
              onChange={(e) => setCustomerInput((prev) => ({ ...prev, email: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.phone}</span>
            <input
              type="text"
              value={customerInput.phone}
              onChange={(e) => setCustomerInput((prev) => ({ ...prev, phone: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.address}</span>
            <input
              type="text"
              value={customerInput.address}
              onChange={(e) => setCustomerInput((prev) => ({ ...prev, address: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.city}</span>
            <input
              type="text"
              value={customerInput.city}
              onChange={(e) => setCustomerInput((prev) => ({ ...prev, city: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.status}</span>
            <select
              value={customerInput.status}
              onChange={(e) => setCustomerInput((prev) => ({ ...prev, status: e.target.value as Customer['status'] }))}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="Active">{t.active}</option>
              <option value="Inactive">{t.inactive}</option>
            </select>
          </label>

          <div className="flex gap-2 pt-1">
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700">
              {editingId ? 'Save Changes' : t.createCustomer}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onViewChange?.('customers');
                }}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                {t.cancel}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="w-[70%] min-w-0 bg-white shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{t.customers}</h3>
          <p className="text-xs text-gray-500">({customers.length} {t.customer}{customers.length !== 1 ? 's' : ''})</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchCustomers}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name-asc' | 'name-desc')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="newest">{t.sortBy}: {t.newest}</option>
            <option value="oldest">{t.sortBy}: {t.oldest}</option>
            <option value="name-asc">{t.sortBy}: {t.nameAZ}</option>
            <option value="name-desc">{t.sortBy}: {t.nameZA}</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.name}</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.email}</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.phone}</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.city}</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.status}</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className={editingId === customer.id ? 'bg-indigo-50' : ''}>
                  <td className="px-3 py-2 text-sm text-gray-700">{customer.name}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{customer.email}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{customer.phone}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{customer.city}</td>
                  <td className="px-3 py-2 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status === 'Active' ? t.active : t.inactive}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700 text-right">
                    <button
                      onClick={() => handleEdit(customer)}
                      aria-label={t.edit}
                      title={t.edit}
                      className="inline-flex h-8 w-8 items-center justify-center text-white bg-blue-600 rounded hover:bg-blue-700 mr-2"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => void handleDelete(customer.id)}
                      aria-label={t.delete}
                      title={t.delete}
                      className="inline-flex h-8 w-8 items-center justify-center text-white bg-red-600 rounded hover:bg-red-700"
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
              {filteredCustomers.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-sm text-gray-500" colSpan={6}>{t.noCustomersFound}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-200">
          <button className="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200">
            Import Excel
          </button>
          <button className="px-3 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700">
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerPageContent;
