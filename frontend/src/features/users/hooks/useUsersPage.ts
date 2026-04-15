import { useEffect, useMemo, useState } from 'react';
import { usersApi } from '@/features/users/api/usersApi';

type UseUsersPageOptions = {
  viewMode?: 'list' | 'add';
  onViewChange?: (tab: string) => void;
};

export const useUsersPage = ({ viewMode = 'list', onViewChange }: UseUsersPageOptions) => {
  const [users, setUsers] = useState<Array<{ id: number; name: string; email: string; role: string; status: string }>>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc'>('name-asc');
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'User', status: 'Active' });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await usersApi.list();
        setUsers(data);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    void loadUsers();
  }, []);

  useEffect(() => {
    if (viewMode === 'add') {
      setShowForm(true);
      return;
    }
    setShowForm(false);
  }, [viewMode]);

  const roleOptions = useMemo(() => Array.from(new Set(users.map((u) => u.role))), [users]);

  const filteredUsers = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const list = users.filter((item) => {
      const matchesSearch = !normalized || item.name.toLowerCase().includes(normalized) || item.email.toLowerCase().includes(normalized);
      const matchesRole = roleFilter === 'all' || item.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });

    return list.slice().sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });
  }, [users, searchTerm, roleFilter, statusFilter, sortBy]);

  const handleCreateUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) return;

    try {
      const created = await usersApi.create({
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        role: newUser.role,
        status: newUser.status,
      });

      setUsers((prev) => [...prev, created]);
      setNewUser({ name: '', email: '', role: 'User', status: 'Active' });
      setShowForm(false);
      onViewChange?.('users');
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return {
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
  };
};
