import React from 'react';
import { formatVnd } from '@/utils/formatCurrency';

type TranslationMap = Record<string, string>;

type Props = {
  t: TranslationMap;
  discount: string;
  paymentReceived: string;
  subtotal: number;
  discountAmount: number;
  paymentAmount: number;
  total: number;
  change: number;
  onDiscountChange: (value: string) => void;
  onPaymentReceivedChange: (value: string) => void;
};

const InvoiceSummarySection: React.FC<Props> = ({
  t,
  discount,
  paymentReceived,
  subtotal,
  discountAmount,
  paymentAmount,
  total,
  change,
  onDiscountChange,
  onPaymentReceivedChange,
}) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 p-3">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{t.summary}</h4>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.discount}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={discount}
              onChange={(e) => onDiscountChange(e.target.value)}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.paymentReceived}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={paymentReceived}
              onChange={(e) => onPaymentReceivedChange(e.target.value)}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </label>
        </div>

        <div className="flex-1 space-y-1 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">{t.subtotal}</span>
            <span className="font-medium text-gray-900">{formatVnd(subtotal)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">{t.discount}</span>
            <span className="font-medium text-red-500">- {formatVnd(discountAmount)}</span>
          </div>
          <div className="flex justify-between py-3 border-b-2 border-gray-300">
            <span className="font-semibold text-gray-800 text-base">{t.total}</span>
            <span className="font-bold text-gray-900 text-base">{formatVnd(total)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">{t.payment}</span>
            <span className="font-medium text-green-600">{formatVnd(paymentAmount)}</span>
          </div>
          <div className={`flex justify-between py-2 px-3 mt-1 ${change >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <span className={`font-semibold ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {change >= 0 ? t.change : t.balanceDue}
            </span>
            <span className={`font-bold text-base ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatVnd(Math.abs(change))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummarySection;
