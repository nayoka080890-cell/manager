import { useEffect, useMemo, useState } from 'react';
import { branchApi, type Branch } from '@/features/branches/api/branchApi';

const emptyBranchInput = {
  code: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
};

export const useBranchPage = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest');
  const [branchInput, setBranchInput] = useState(emptyBranchInput);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const data = await branchApi.list();
        setBranches(data);
      } catch (error) {
        console.error('Failed to load branches:', error);
      }
    };

    void loadBranches();
  }, []);

  const filteredBranches = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const list = branches.filter((item) => {
      if (!normalized) return true;
      return (
        item.code.toLowerCase().includes(normalized) ||
        item.name.toLowerCase().includes(normalized) ||
        item.city.toLowerCase().includes(normalized)
      );
    });

    return list.slice().sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
      if (sortBy === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });
  }, [branches, searchTerm, sortBy]);

  const resetForm = () => {
    setBranchInput(emptyBranchInput);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!branchInput.code.trim() || !branchInput.name.trim()) return;

    const payload = {
      code: branchInput.code.trim(),
      name: branchInput.name.trim(),
      phone: branchInput.phone.trim(),
      email: branchInput.email.trim(),
      address: branchInput.address.trim(),
      city: branchInput.city.trim(),
    };

    try {
      if (editingId) {
        const updated = await branchApi.update(editingId, payload);
        setBranches((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
      } else {
        const created = await branchApi.create(payload);
        setBranches((prev) => [...prev, created]);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save branch:', error);
    }
  };

  const handleEdit = (branch: Branch) => {
    setBranchInput({
      code: branch.code,
      name: branch.name,
      phone: branch.phone ?? '',
      email: branch.email ?? '',
      address: branch.address ?? '',
      city: branch.city ?? '',
    });
    setEditingId(branch.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await branchApi.remove(id);
      setBranches((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
    } catch (error) {
      console.error('Failed to delete branch:', error);
    }
  };

  return {
    branches,
    editingId,
    searchTerm,
    sortBy,
    branchInput,
    filteredBranches,
    setSearchTerm,
    setSortBy,
    setBranchInput,
    resetForm,
    handleSubmit,
    handleEdit,
    handleDelete,
  };
};
