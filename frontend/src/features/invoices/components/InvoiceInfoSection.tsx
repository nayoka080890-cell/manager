import React from 'react';
import type { InvoiceStatus } from '@/pages/invoices/invoiceTypes';

type TranslationMap = Record<string, string>;

type Props = {
  t: TranslationMap;
  invoiceNumber: string;
  date: string;
  status: InvoiceStatus;
  onDateChange: (value: string) => void;
  onStatusChange: (value: InvoiceStatus) => void;
};

const InvoiceInfoSection: React.FC<Props> = ({ t, invoiceNumber, date, status, onDateChange, onStatusChange }) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 p-3 lg:col-span-1">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{t.invoiceInfo}</h4>
      <div className="block">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">{t.invoiceNo}</span>
          <p className="mt-1 block w-full border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {invoiceNumber}
          </p>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">{t.date}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">{t.status}</span>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as InvoiceStatus)}
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
  );
};

export default InvoiceInfoSection;
