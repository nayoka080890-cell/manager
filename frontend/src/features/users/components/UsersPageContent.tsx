import React from 'react';
import { useUsersPage } from '@/features/users/hooks/useUsersPage';
import { userTranslations, type Language } from '@/i18n/translations';

type UsersPageContentProps = {
  language: Language;
  viewMode?: 'list' | 'add';
  onViewChange?: (tab: string) => void;
};

const UsersPageContent: React.FC<UsersPageContentProps> = ({ language, viewMode = 'list', onViewChange }) => {
  const t = userTranslations[language];
  const {
    users,
    showForm,
    searchTerm,
    roleFilter,
    statusFilter,
    sortBy,
    newUser,
    roleOptions,
    filteredUsers,
    setShowForm,
    setSearchTerm,
    setRoleFilter,
    setStatusFilter,
    setSortBy,
    setNewUser,
    handleCreateUser,
  } = useUsersPage({ viewMode, onViewChange });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleCreateUser();
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <button
          onClick={() => {
            const newFormState = !showForm;
            setShowForm(newFormState);
            if (newFormState) {
              onViewChange?.('users-add');
            } else {
              onViewChange?.('users');
            }
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium transition-colors"
        >
          {showForm ? t.hideAddUser : t.addNewUser}
        </button>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{t.allUsers}</h3>
          <p className="text-xs text-gray-500">({users.length} {t.user.toLowerCase()}{users.length !== 1 ? 's' : ''})</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white shadow-sm border border-gray-200 p-4">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={t.user}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
              placeholder={t.email}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="Admin">Admin</option>
              <option value="Moderator">Moderator</option>
              <option value="User">User</option>
            </select>
            <div className="flex gap-2">
              <select
                value={newUser.status}
                onChange={(e) => setNewUser((prev) => ({ ...prev, status: e.target.value }))}
                className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="Active">{t.active}</option>
                <option value="Inactive">{t.inactive}</option>
              </select>
              <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700">
                {t.createUser}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchUsers}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">{t.allRoles}</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">{t.allStatuses}</option>
            <option value="Active">{t.active}</option>
            <option value="Inactive">{t.inactive}</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name-asc' | 'name-desc')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="name-asc">{t.sortBy}: {t.nameAZ}</option>
            <option value="name-desc">{t.sortBy}: {t.nameZA}</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.user}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.role}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.status}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{user.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>{user.status === 'Active' ? t.active : t.inactive}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      aria-label={t.edit}
                      title={t.edit}
                      className="inline-flex h-8 w-8 items-center justify-center text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button
                      aria-label={t.delete}
                      title={t.delete}
                      className="inline-flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-900"
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
              {filteredUsers.length === 0 && (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>{t.noUsersFound}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-gray-200 flex justify-end gap-2">
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

export default UsersPageContent;
