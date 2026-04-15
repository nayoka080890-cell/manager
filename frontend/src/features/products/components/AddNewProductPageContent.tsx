import React from 'react';
import { useAddNewProductPage } from '@/features/products/hooks/useAddNewProductPage';
import type { Product } from '@/features/products/api/productApi';
import { addNewProductTranslations, type Language } from '@/i18n/translations';

type AddNewProductPageContentProps = {
  language: Language;
  onViewChange?: (tab: string) => void;
  editingProduct?: Product | null;
};

const AddNewProductPageContent: React.FC<AddNewProductPageContentProps> = ({ language, onViewChange, editingProduct }) => {
  const t = addNewProductTranslations[language];
  const { productInput, availableCategories, setProductInput, handleSubmit } = useAddNewProductPage({
    editingProduct,
    onViewChange,
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmit();
  };

  return (
    <div className="space-y-3">
      <div className="bg-white shadow-sm border border-gray-200 p-4">
        <h4 className="text-base font-medium text-gray-900 mb-4">
          {editingProduct ? t.editProduct : t.addNewProduct}
        </h4>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="block lg:col-span-4">
            <span className="text-sm font-medium text-gray-700">{t.category}</span>
            <select
              value={productInput.category}
              onChange={(e) => setProductInput((prev) => ({ ...prev, category: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">{t.selectCategory}</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.name}</span>
            <input
              type="text"
              value={productInput.name}
              onChange={(e) => setProductInput((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.displayName}</span>
            <input
              type="text"
              value={productInput.displayName}
              onChange={(e) => setProductInput((prev) => ({ ...prev, displayName: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.sku}</span>
            <input
              type="text"
              value={productInput.sku}
              onChange={(e) => setProductInput((prev) => ({ ...prev, sku: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>
          
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.specifications}</span>
            <input
              type="text"
              value={productInput.specifications}
              onChange={(e) => setProductInput((prev) => ({ ...prev, specifications: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.thinkness}</span>
            <input
              type="text"
              value={productInput.thinkness}
              onChange={(e) => setProductInput((prev) => ({ ...prev, thinkness: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.weight}</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={productInput.weight}
              onChange={(e) => setProductInput((prev) => ({ ...prev, weight: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="block lg:col-span-4">
            <span className="text-sm font-medium text-gray-700">{t.description}</span>
            <textarea
              rows={3}
              value={productInput.description}
              onChange={(e) => setProductInput((prev) => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.unit}</span>
            <input
              type="text"
              value={productInput.unit}
              onChange={(e) => setProductInput((prev) => ({ ...prev, unit: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.packagingUnit}</span>
            <input
              type="text"
              value={productInput.packagingUnit}
              onChange={(e) => setProductInput((prev) => ({ ...prev, packagingUnit: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{(t as Record<string, string>).unitsPerPack}</span>
            <input
              type="number"
              min="0"
              step="1"
              value={productInput.unitsPerPack}
              onChange={(e) => setProductInput((prev) => ({ ...prev, unitsPerPack: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.billableUnit}</span>
            <input
              type="text"
              value={productInput.billableUnit}
              onChange={(e) => setProductInput((prev) => ({ ...prev, billableUnit: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.purchasePrice}</span>
            <input
              type="number"
              step="0.01"
              value={productInput.purchasePrice}
              onChange={(e) => setProductInput((prev) => ({ ...prev, purchasePrice: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.sellingPrice}</span>
            <input
              type="number"
              step="0.01"
              value={productInput.sellingPrice}
              onChange={(e) => setProductInput((prev) => ({ ...prev, sellingPrice: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </label>

          <div className="md:col-span-2 lg:col-span-4 flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {editingProduct ? t.updateProduct : t.addProduct}
            </button>
            <button
              type="button"
              onClick={() => onViewChange?.('products')}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewProductPageContent;
