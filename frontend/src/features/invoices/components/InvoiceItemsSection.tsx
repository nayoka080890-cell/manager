import React from 'react';
import type { InvoiceProductOption } from '@/features/invoices/api/invoiceLookupApi';
import { formatVnd } from '@/utils/formatCurrency';

type TranslationMap = Record<string, string>;

type LineItem = {
  id: number;
  productId: number | null;
  productName: string;
  unit: string;
  qty: number;
  unitPrice: number;
};

type Props = {
  t: TranslationMap;
  selectedCategory: string;
  productCategories: string[];
  filteredProducts: InvoiceProductOption[];
  items: LineItem[];
  productSelectRef: React.RefObject<HTMLSelectElement | null>;
  hidePicker?: boolean;
  onCategoryChange: (value: string) => void;
  onProductChange: (value: string) => void;
  onAddProduct: () => void;
  onQtyChange: (id: number, value: number) => void;
  onUnitPriceChange: (id: number, value: number) => void;
  onRemoveItem: (id: number) => void;
};

const InvoiceItemsSection: React.FC<Props> = ({
  t,
  selectedCategory,
  productCategories,
  filteredProducts,
  items,
  productSelectRef,
  hidePicker = false,
  onCategoryChange,
  onProductChange,
  onAddProduct,
  onQtyChange,
  onUnitPriceChange,
  onRemoveItem,
}) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 p-3">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{t.products}</h4>

      {!hidePicker && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
          <div className="lg:col-span-1">
            <label className="text-xs font-medium text-gray-600 block mb-1">{t.selectCategory}</label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">{t.allCategories}</option>
              {productCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <label className="text-xs font-medium text-gray-600 block mb-1">{t.selectProduct}</label>
            <select
              ref={productSelectRef}
              defaultValue=""
              onChange={(e) => onProductChange(e.target.value)}
              className="invoice-product-select w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">{t.searchChooseProduct}</option>
              {filteredProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.category} - {product.quantity} {product.unit}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="button" onClick={onAddProduct} className="w-full px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700">
              + {t.addProduct}
            </button>
          </div>
        </div>
      )}

      <div className="border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['#', t.product, t.unit, t.qty, t.unitPrice, t.total, ''].map((heading) => (
                <th key={heading} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-400">
                  {t.noItems}
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">{item.productName}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{item.unit}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={item.qty}
                      onChange={(e) => onQtyChange(item.id, Math.max(0.01, Number(e.target.value) || 1))}
                      className="w-20 border border-gray-300 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => onUnitPriceChange(item.id, Math.max(0, Number(e.target.value) || 0))}
                      className="w-28 border border-gray-300 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 text-sm font-semibold text-gray-900">{formatVnd(item.qty * item.unitPrice)}</td>
                  <td className="px-3 py-2">
                    <button type="button" onClick={() => onRemoveItem(item.id)} className="text-xs text-red-500 hover:text-red-700">
                      {t.remove}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceItemsSection;
