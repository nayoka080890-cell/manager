import React, { useMemo, useState } from 'react';
import InvoiceCustomerSection from '@/features/invoices/components/InvoiceCustomerSection';
import InvoiceItemsSection from '@/features/invoices/components/InvoiceItemsSection';
import InvoiceSummarySection from '@/features/invoices/components/InvoiceSummarySection';
import { useInvoiceForm } from '@/features/invoices/hooks/useInvoiceForm';
import { invoiceFormTranslations, type Language } from '@/i18n/translations';
import type { Invoice, InvoiceInput, InvoiceStatus } from '@/pages/invoices/invoiceTypes';
import { formatVnd } from '@/utils/formatCurrency';

const formatDateDMY = (dateString: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
};

type Props = {
  language: Language;
  editingInvoice: Invoice | null;
  isLoading?: boolean;
  onBack: () => void;
  onSubmit: (input: InvoiceInput) => Promise<boolean>;
};

const AddNewInvoicePage: React.FC<Props> = ({ language, editingInvoice, isLoading = false, onBack, onSubmit }) => {
  const t = invoiceFormTranslations[language];
  const [productSearch, setProductSearch] = useState('');
  const form = useInvoiceForm({
    editingInvoice,
    searchChooseCustomerLabel: t.searchChooseCustomer,
    searchChooseProductLabel: t.searchChooseProduct,
    customerFoundByPhoneLabel: t.customerFoundByPhone,
    customerNotFoundByPhoneLabel: t.customerNotFoundByPhone,
  });

  const searchFilteredProducts = useMemo(() => {
    const normalized = productSearch.trim().toLowerCase();
    if (!normalized) {
      return form.filteredProducts;
    }

    return form.filteredProducts.filter((product) => {
      const name = product.name.toLowerCase();
      const category = (product.category ?? '').toLowerCase();
      return name.includes(normalized) || category.includes(normalized);
    });
  }, [form.filteredProducts, productSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = await form.buildPayloadForSubmit();
    if (!payload) {
      return;
    }

    await onSubmit(payload);
  };

  if (isLoading || form.isLoadingFormData) {
    return (
      <div className="bg-white shadow-sm border border-gray-200 p-6 text-sm text-gray-500">
        Loading invoice data...
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-800">
          ← {t.backToList}
        </button>
        <span className="text-gray-300">|</span>
        <h3 className="text-lg font-semibold text-gray-900">
          {editingInvoice ? t.editInvoice : t.createNewInvoice}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="bg-white shadow-sm border border-gray-200 p-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t.invoiceNo}</span>
              <p className="mt-1 block w-full border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {form.invoiceNumber || '...'}
              </p>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t.date}</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => form.setDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t.status}</span>
              <select
                value={form.status as InvoiceStatus}
                onChange={(e) => form.setStatus(e.target.value as InvoiceStatus)}
                className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="Draft">{t.draft}</option>
                <option value="Sent">{t.sent}</option>
                <option value="Paid">{t.paid}</option>
                <option value="Overdue">{t.overdue}</option>
              </select>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2.5 items-start">
          <div className="bg-white shadow-sm border border-gray-200 p-3 lg:col-span-1 lg:sticky lg:top-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t.selectProduct}</h4>
            <div className="space-y-2">
              <select
                value={form.selectedCategory}
                onChange={(e) => form.setSelectedCategory(e.target.value)}
                className="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">{t.allCategories}</option>
                {form.productCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder={t.searchChooseProduct}
                className="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />

              <div className="overflow-y-auto max-h-[calc(100vh-260px)] border border-gray-200 divide-y divide-gray-100">
                {form.isLoadingFormData ? (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">Loading products...</div>
                ) : searchFilteredProducts.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">{t.noProducts}</div>
                ) : (
                  searchFilteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => form.addProductById(product.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50"
                    >
                      <div className="font-medium text-gray-900 truncate">{product.name}</div>
                      {product.category && <div className="text-xs text-gray-400">{product.category}</div>}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2.5 lg:col-span-3">
            <InvoiceCustomerSection
              t={t}
              customers={form.customers}
              customer={form.customer}
              customerSelectRef={form.customerSelectRef}
              customerLookupNotice={form.customerLookupNotice}
              onStartAddNewCustomer={form.startAddNewCustomer}
              onCustomerChange={form.handleCustomerSelectChange}
              onCustomerNameChange={form.handleCustomerNameChange}
              onCustomerPhoneChange={form.handleCustomerPhoneChange}
              onCustomerAddressChange={form.handleCustomerAddressChange}
            />

            <InvoiceItemsSection
              t={t}
              selectedCategory={form.selectedCategory}
              productCategories={form.productCategories}
              filteredProducts={form.filteredProducts}
              items={form.items}
              productSelectRef={form.productSelectRef}
              hidePicker
              onCategoryChange={form.setSelectedCategory}
              onProductChange={() => undefined}
              onAddProduct={form.addSelectedProduct}
              onQtyChange={(id, value) => form.updateItem(id, { qty: value })}
              onUnitPriceChange={(id, value) => form.updateItem(id, { unitPrice: value })}
              onRemoveItem={form.removeItem}
            />

            <InvoiceSummarySection
              t={t}
              discount={form.discount}
              paymentReceived={form.paymentReceived}
              subtotal={form.subtotal}
              discountAmount={form.discountAmount}
              paymentAmount={form.paymentAmount}
              total={form.total}
              change={form.change}
              onDiscountChange={form.setDiscount}
              onPaymentReceivedChange={form.setPaymentReceived}
            />

            {editingInvoice && (
              <div className="bg-white shadow-sm border border-gray-200 p-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t.paymentHistory}</h4>
                <div className="overflow-x-auto border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.date}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.amount}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.paymentMethod}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.reference}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.notes}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {editingInvoice.payments && editingInvoice.payments.length > 0 ? (
                        editingInvoice.payments.map((payment) => (
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
                          <td className="px-3 py-3 text-sm text-gray-500" colSpan={5}>{t.noPayments}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex gap-3 pb-6">
              <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700">
                {editingInvoice ? t.saveChanges : t.createInvoice}
              </button>
              <button type="button" onClick={onBack} className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200">
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddNewInvoicePage;
