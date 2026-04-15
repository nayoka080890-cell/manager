import React from 'react';
import { useCategoriesPage } from '@/features/categories/hooks/useCategoriesPage';

const CategoriesPageContent: React.FC = () => {
  const {
    categories,
    searchTerm,
    sortBy,
    categoryInput,
    editingId,
    filteredCategories,
    setSearchTerm,
    setSortBy,
    setCategoryInput,
    resetForm,
    handleSubmit,
    handleEdit,
    handleDelete,
  } = useCategoriesPage();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmit();
  };

  return (
    <div className="flex gap-4 items-start">
      <div className="w-[30%] shrink-0 bg-white shadow-sm border border-gray-200 p-4">
        <h4 className="text-base font-medium text-gray-900 mb-4">
          {editingId ? 'Edit Category' : 'Add New Category'}
        </h4>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Category Name</span>
            <input
              type="text"
              value={categoryInput.name}
              onChange={(e) => setCategoryInput((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Description</span>
            <input
              type="text"
              value={categoryInput.description}
              onChange={(e) => setCategoryInput((prev) => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <div className="block">
            <button type="submit" className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700">
              {editingId ? 'Save Changes' : 'Add Category'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="w-[70%] min-w-0 bg-white shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Categories List</h3>
          <p className="text-xs text-gray-500">({categories.length})</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name or description"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name-asc' | 'name-desc')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="newest">Sort by: Date (Newest)</option>
            <option value="oldest">Sort by: Date (Oldest)</option>
            <option value="name-asc">Sort by: Name (A-Z)</option>
            <option value="name-desc">Sort by: Name (Z-A)</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category.id} className={editingId === category.id ? 'bg-indigo-50' : ''}>
                  <td className="px-3 py-2 text-sm text-gray-700">{category.id}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{category.name}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{category.description}</td>
                  <td className="px-3 py-2 text-sm text-right text-gray-700">{category.createdAt}</td>
                  <td className="px-3 py-2 text-sm text-right text-gray-700">
                    <button
                      onClick={() => handleEdit(category)}
                      aria-label="Edit"
                      title="Edit"
                      className="inline-flex h-8 w-8 items-center justify-center text-white bg-blue-600 rounded hover:bg-blue-700 mr-2"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => void handleDelete(category.id)}
                      aria-label="Delete"
                      title="Delete"
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
              {filteredCategories.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-sm text-gray-500" colSpan={5}>No categories match current filters.</td>
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

export default CategoriesPageContent;
