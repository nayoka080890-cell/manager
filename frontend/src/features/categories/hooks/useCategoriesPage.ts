import { useEffect, useMemo, useState } from 'react';
import { categoryApi, type Category } from '@/features/categories/api/categoryApi';

export const useCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest');
  const [categoryInput, setCategoryInput] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryApi.list();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    void loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const list = categories.filter((item) => {
      if (!normalized) return true;
      return item.name.toLowerCase().includes(normalized) || item.description.toLowerCase().includes(normalized);
    });

    return list.slice().sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
      if (sortBy === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });
  }, [categories, searchTerm, sortBy]);

  const resetForm = () => {
    setCategoryInput({ name: '', description: '' });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!categoryInput.name.trim()) return;

    const payload = {
      name: categoryInput.name.trim(),
      description: categoryInput.description.trim(),
    };

    try {
      if (editingId) {
        const updated = await categoryApi.update(editingId, payload);
        setCategories((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
      } else {
        const created = await categoryApi.create(payload);
        setCategories((prev) => [...prev, created]);
      }

      resetForm();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setCategoryInput({
      name: category.name,
      description: category.description,
    });
    setEditingId(category.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await categoryApi.remove(id);
      setCategories((prev) => prev.filter((category) => category.id !== id));
      if (editingId === id) resetForm();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  return {
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
  };
};
