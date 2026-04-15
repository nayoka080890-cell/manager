import { useEffect, useMemo, useState } from 'react';
import { supplierApi, type Supplier } from '@/features/suppliers/api/supplierApi';

const emptySupplierInput = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  city: '',
};

export const useSupplierPage = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest');
  const [supplierInput, setSupplierInput] = useState(emptySupplierInput);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const data = await supplierApi.list();
        setSuppliers(data);
      } catch (error) {
        console.error('Failed to load suppliers:', error);
      }
    };

    void loadSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const list = suppliers.filter((item) => {
      if (!normalized) return true;
      return (
        item.name.toLowerCase().includes(normalized) ||
        item.contactPerson.toLowerCase().includes(normalized) ||
        item.city.toLowerCase().includes(normalized)
      );
    });

    return list.slice().sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
      if (sortBy === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });
  }, [searchTerm, sortBy, suppliers]);

  const resetForm = () => {
    setSupplierInput(emptySupplierInput);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!supplierInput.name.trim()) return;

    const payload = {
      name: supplierInput.name.trim(),
      contactPerson: supplierInput.contactPerson.trim(),
      email: supplierInput.email.trim(),
      phone: supplierInput.phone.trim(),
      address: supplierInput.address.trim(),
      city: supplierInput.city.trim(),
    };

    try {
      if (editingId) {
        const updated = await supplierApi.update(editingId, payload);
        setSuppliers((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
      } else {
        const created = await supplierApi.create(payload);
        setSuppliers((prev) => [...prev, created]);
      }

      resetForm();
    } catch (error) {
      console.error('Failed to save supplier:', error);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSupplierInput({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      city: supplier.city,
    });
    setEditingId(supplier.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await supplierApi.remove(id);
      setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
      if (editingId === id) resetForm();
    } catch (error) {
      console.error('Failed to delete supplier:', error);
    }
  };

  return {
    suppliers,
    editingId,
    searchTerm,
    sortBy,
    supplierInput,
    filteredSuppliers,
    setSearchTerm,
    setSortBy,
    setSupplierInput,
    resetForm,
    handleSubmit,
    handleEdit,
    handleDelete,
  };
};
