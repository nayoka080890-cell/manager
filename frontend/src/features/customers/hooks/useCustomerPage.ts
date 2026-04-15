import { useEffect, useMemo, useState } from 'react';
import { customerApi, type Customer } from '@/features/customers/api/customerApi';

const emptyCustomerInput = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  status: 'Active' as Customer['status'],
};

type UseCustomerPageOptions = {
  viewMode?: 'list' | 'add';
  onViewChange?: (tab: string) => void;
};

export const useCustomerPage = ({ viewMode = 'list', onViewChange }: UseCustomerPageOptions) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest');
  const [customerInput, setCustomerInput] = useState(emptyCustomerInput);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data = await customerApi.list();
        setCustomers(data);
      } catch (error) {
        console.error('Failed to load customers:', error);
      }
    };

    void loadCustomers();
  }, []);

  useEffect(() => {
    if (viewMode === 'add') {
      setCustomerInput(emptyCustomerInput);
      setEditingId(null);
      return;
    }

    if (viewMode === 'list' && editingId === null) {
      setCustomerInput(emptyCustomerInput);
    }
  }, [editingId, viewMode]);

  const filteredCustomers = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const list = customers.filter((item) => {
      if (!normalized) return true;
      return (
        item.name.toLowerCase().includes(normalized) ||
        item.email.toLowerCase().includes(normalized) ||
        item.city.toLowerCase().includes(normalized)
      );
    });

    return list.slice().sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
      if (sortBy === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });
  }, [customers, searchTerm, sortBy]);

  const resetForm = () => {
    setCustomerInput(emptyCustomerInput);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!customerInput.name.trim() || !customerInput.email.trim()) return;

    const payload = {
      name: customerInput.name.trim(),
      email: customerInput.email.trim(),
      phone: customerInput.phone.trim(),
      address: customerInput.address.trim(),
      city: customerInput.city.trim(),
      status: customerInput.status,
    };

    try {
      if (editingId) {
        const updated = await customerApi.update(editingId, payload);
        setCustomers((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
      } else {
        const created = await customerApi.create(payload);
        setCustomers((prev) => [...prev, created]);
      }

      resetForm();
      onViewChange?.('customers');
    } catch (error) {
      console.error('Failed to save customer:', error);
    }
  };

  const handleEdit = (customer: Customer) => {
    setCustomerInput({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      status: customer.status,
    });
    setEditingId(customer.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await customerApi.remove(id);
      setCustomers((prev) => prev.filter((customer) => customer.id !== id));
      if (editingId === id) resetForm();
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  return {
    customers,
    editingId,
    searchTerm,
    sortBy,
    customerInput,
    filteredCustomers,
    setSearchTerm,
    setSortBy,
    setCustomerInput,
    resetForm,
    handleSubmit,
    handleEdit,
    handleDelete,
  };
};
