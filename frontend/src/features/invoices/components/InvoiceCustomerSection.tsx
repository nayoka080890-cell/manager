import React from 'react';
import type { InvoiceCustomerOption } from '@/features/invoices/api/invoiceLookupApi';

type TranslationMap = Record<string, string>;

type Props = {
  t: TranslationMap;
  customers: InvoiceCustomerOption[];
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  customerSelectRef: React.RefObject<HTMLSelectElement | null>;
  customerLookupNotice?: string;
  onStartAddNewCustomer: () => void;
  onCustomerChange: (value: string) => void;
  onCustomerNameChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
  onCustomerAddressChange: (value: string) => void;
};

const InvoiceCustomerSection: React.FC<Props> = ({
  t,
  customers,
  customer,
  customerSelectRef,
  customerLookupNotice,
  onStartAddNewCustomer,
  onCustomerChange,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onCustomerAddressChange,
}) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 p-3 lg:col-span-2">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{t.customerInfo}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-gray-700">{t.selectCustomer}</span>
            <button
              type="button"
              onClick={onStartAddNewCustomer}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {t.addNewCustomer ?? 'Add New Customer'}
            </button>
          </div>
          <select
            ref={customerSelectRef}
            defaultValue=""
            onChange={(e) => onCustomerChange(e.target.value)}
            className="invoice-customer-select w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">{t.searchChooseCustomer}</option>
            {customers.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">{t.customerName}</span>
          <input
            type="text"
            value={customer.name}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">{t.phone}</span>
          <input
            type="text"
            value={customer.phone}
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
            className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Phone number"
          />
          {customerLookupNotice ? (
            <p className="mt-1 text-xs text-indigo-600">{customerLookupNotice}</p>
          ) : null}
        </label>
      </div>
      <div className="block mt-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">{t.address}</span>
          <input
            type="text"
            value={customer.address}
            onChange={(e) => onCustomerAddressChange(e.target.value)}
            className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Address"
          />
        </label>
      </div>
    </div>
  );
};

export default InvoiceCustomerSection;
