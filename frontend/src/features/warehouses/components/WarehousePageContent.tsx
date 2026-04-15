import React from 'react';
import { useWarehousePage } from '@/features/warehouses/hooks/useWarehousePage';
import { warehouseTranslations, type Language } from '@/i18n/translations';

type WarehousePageContentProps = {
  language: Language;
};

const WarehousePageContent: React.FC<WarehousePageContentProps> = ({ language }) => {
  const t = warehouseTranslations[language];
  const {
    warehouses,
    branches,
    editingId,
    searchTerm,
    sortBy,
    warehouseInput,
    filteredWarehouses,
    setSearchTerm,
    setSortBy,
    setWarehouseInput,
    resetForm,
    handleSubmit,
    handleEdit,
    handleDelete,
  } = useWarehousePage();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmit();
  };

  return (
    <div className="flex gap-4 items-start">
      <div className="w-[30%] shrink-0 bg-white shadow-sm border border-gray-200 p-4">
        <h4 className="text-base font-medium text-gray-900 mb-4">{editingId ? t.editWarehouse : t.createWarehouse}</h4>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.branch}</span>
            <select
              value={warehouseInput.branchId}
              onChange={(e) => setWarehouseInput((prev) => ({ ...prev, branchId: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">{t.selectBranch}</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.code} - {branch.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.code}</span>
            <input
              type="text"
              value={warehouseInput.code}
              onChange={(e) => setWarehouseInput((prev) => ({ ...prev, code: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.name}</span>
            <input
              type="text"
              value={warehouseInput.name}
              onChange={(e) => setWarehouseInput((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.phone}</span>
            <input
              type="text"
              value={warehouseInput.phone}
              onChange={(e) => setWarehouseInput((prev) => ({ ...prev, phone: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.address}</span>
            <input
              type="text"
              value={warehouseInput.address}
              onChange={(e) => setWarehouseInput((prev) => ({ ...prev, address: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.city}</span>
            <input
              type="text"
              value={warehouseInput.city}
              onChange={(e) => setWarehouseInput((prev) => ({ ...prev, city: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700">
              {editingId ? t.saveChanges : t.createWarehouse}
            </button>
            {editingId ? (
              <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200">
                {t.cancel}
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="w-[70%] min-w-0 bg-white shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{t.warehouses}</h3>
          <p className="text-xs text-gray-500">({warehouses.length} {t.warehouse}{warehouses.length !== 1 ? 's' : ''})</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchWarehouses}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name-asc' | 'name-desc')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t.code}</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t.name}</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t.branch}</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t.city}</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWarehouses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-sm text-gray-500 text-center">{t.noWarehousesFound}</td>
                </tr>
              ) : (
                filteredWarehouses.map((warehouse) => (
                  <tr key={warehouse.id}>
                    <td className="px-3 py-2 text-sm text-gray-900">{warehouse.code}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{warehouse.name}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{warehouse.branchName || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{warehouse.city || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-700 text-right">
                      <button
                        type="button"
                        onClick={() => handleEdit(warehouse)}
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
                        type="button"
                        onClick={() => void handleDelete(warehouse.id)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WarehousePageContent;
