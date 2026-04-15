import { useEffect, useMemo, useState } from 'react';
import { warehouseApi, type BranchOption, type Warehouse } from '@/features/warehouses/api/warehouseApi';

const emptyWarehouseInput = {
  branchId: '',
  code: '',
  name: '',
  phone: '',
  address: '',
  city: '',
};

export const useWarehousePage = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest');
  const [warehouseInput, setWarehouseInput] = useState(emptyWarehouseInput);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [warehouseData, branchData] = await Promise.all([
          warehouseApi.list(),
          warehouseApi.listBranches(),
        ]);
        setWarehouses(warehouseData);
        setBranches(branchData);
      } catch (error) {
        console.error('Failed to load warehouses/branches:', error);
      }
    };

    void loadData();
  }, []);

  const filteredWarehouses = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const list = warehouses.filter((item) => {
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
  }, [warehouses, searchTerm, sortBy]);

  const resetForm = () => {
    setWarehouseInput(emptyWarehouseInput);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!warehouseInput.code.trim() || !warehouseInput.name.trim()) return;

    const payload = {
      branchId: warehouseInput.branchId ? Number(warehouseInput.branchId) : null,
      code: warehouseInput.code.trim(),
      name: warehouseInput.name.trim(),
      phone: warehouseInput.phone.trim(),
      address: warehouseInput.address.trim(),
      city: warehouseInput.city.trim(),
    };

    try {
      if (editingId) {
        const updated = await warehouseApi.update(editingId, payload);
        setWarehouses((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
      } else {
        const created = await warehouseApi.create(payload);
        setWarehouses((prev) => [...prev, created]);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save warehouse:', error);
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setWarehouseInput({
      branchId: warehouse.branchId ? String(warehouse.branchId) : '',
      code: warehouse.code,
      name: warehouse.name,
      phone: warehouse.phone ?? '',
      address: warehouse.address ?? '',
      city: warehouse.city ?? '',
    });
    setEditingId(warehouse.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await warehouseApi.remove(id);
      setWarehouses((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
    } catch (error) {
      console.error('Failed to delete warehouse:', error);
    }
  };

  return {
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
  };
};
