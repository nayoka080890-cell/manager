import React from 'react';
import { useProductsPage } from '@/features/products/hooks/useProductsPage';
import { productTranslations, type Language } from '@/i18n/translations';
import type { Product } from '@/features/products/api/productApi';
import { formatVnd } from '@/utils/formatCurrency';

type ProductsPageContentProps = {
  language: Language;
  onViewChange?: (tab: string) => void;
  onEdit?: (product: Product | null) => void;
};

const ProductsPageContent: React.FC<ProductsPageContentProps> = ({ language, onViewChange, onEdit }) => {
  const t = productTranslations[language];
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const {
    products,
    nameFilter,
    categoryFilter,
    sortBy,
    isImporting,
    availableCategories,
    filteredProducts,
    setNameFilter,
    setCategoryFilter,
    setSortBy,
    handleDelete,
    handleImport,
  } = useProductsPage();

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <button
          onClick={() => {
            onEdit?.(null);
            onViewChange?.('products-add');
          }}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {t.addNewProduct}
        </button>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{t.productInventory}</h3>
          <p className="text-xs text-gray-500">({products.length} products)</p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder={t.searchByName}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">{t.allCategories}</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="newest">{t.sortBy}: {t.newest}</option>
            <option value="oldest">{t.sortBy}: {t.oldest}</option>
            <option value="name-asc">{t.sortBy}: {t.nameAZ}</option>
            <option value="name-desc">{t.sortBy}: {t.nameZA}</option>
            <option value="price-asc">{t.sortBy}: {t.priceLowHigh}</option>
            <option value="price-desc">{t.sortBy}: {t.priceHighLow}</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">No</th>
                {[
                  { label: t.name, key: 'name' },
                  // { label: t.displayName, key: 'displayName' },
                  { label: t.sku, key: 'sku' },
                  { label: t.specifications, key: 'specifications' },
                  // { label: t.thinkness, key: 'thinkness' },
                  // { label: t.weight, key: 'weight' },
                  { label: t.description, key: 'description' },
                  { label: t.unit, key: 'unit' },
                  // { label: t.packagingUnit, key: 'packagingUnit' },
                  // { label: t.billableUnit, key: 'billableUnit' },
                  { label: t.quantity, key: 'quantity', class: 'text-right' },
                  // { label: t.purchase, key: 'purchase' },
                  { label: t.selling, key: 'selling', class: 'text-right' },
                  // { label: t.category, key: 'category' },
                  { label: t.actions, key: 'actions', class: 'text-right'},
                ].map((col) => (
                  <th key={col.key} className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.class || ''}`}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((p, idx) => (
                <tr key={p.id}>
                  <td className="px-3 py-2 text-sm text-gray-500 text-center">{idx + 1}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{p.name}</td>
                  {/* <td className="px-3 py-2 text-sm text-gray-700">{p.displayName || '-'}</td> */}
                  <td className="px-3 py-2 text-sm text-gray-700">{p.sku || '-'}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{p.specifications}</td>
                  {/* <td className="px-3 py-2 text-sm text-gray-700">{p.thinkness || '-'}</td> */}
                  {/* <td className="px-3 py-2 text-sm text-gray-700">{p.weight ?? '-'}</td> */}
                  <td className="px-3 py-2 text-sm text-gray-700 max-w-[240px] truncate" title={p.description || '-'}>{p.description || '-'}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{p.unit}</td>
                  {/* <td className="px-3 py-2 text-sm text-gray-700">{p.packagingUnit || '-'}</td> */}
                  {/* <td className="px-3 py-2 text-sm text-gray-700">{p.billableUnit || '-'}</td> */}
                  <td className="px-3 py-2 text-sm text-gray-700 text-right">{p.quantity}</td>
                  {/* <td className="px-3 py-2 text-sm text-gray-700">{formatVnd(p.purchasePrice)}</td> */}
                  <td className="px-3 py-2 text-sm text-gray-700 text-right">{formatVnd(p.sellingPrice)}</td>
                  {/* <td className="px-3 py-2 text-sm text-gray-700">{p.category}</td> */}
                  <td className="px-3 py-2 text-sm text-gray-700 text-right">
                    <button
                      onClick={() => {
                        onEdit?.(p);
                        onViewChange?.('products-add');
                      }}
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
                      onClick={() => void handleDelete(p.id)}
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
              {filteredProducts.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-sm text-gray-500" colSpan={16}>{t.noProductsFound}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-200">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                void handleImport(file);
              }
              e.currentTarget.value = '';
            }}
          />
          <button
            type="button"
            disabled={isImporting}
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isImporting ? 'Importing...' : 'Import Excel'}
          </button>
          <button className="px-3 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700">
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPageContent;
