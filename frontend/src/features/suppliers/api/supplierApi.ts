import { apiService } from '@/services/api';

export type Supplier = {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  createdAt: string;
};

export type SupplierInput = {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

export const supplierApi = {
  list: () => apiService.get<Supplier[]>('/suppliers'),
  create: (payload: SupplierInput) =>
    apiService.post<Supplier>('/suppliers', payload, {
      successMessage: 'Supplier created successfully.',
    }),
  update: (id: number, payload: SupplierInput) =>
    apiService.put<Supplier>(`/suppliers/${id}`, payload, {
      successMessage: 'Supplier updated successfully.',
    }),
  remove: (id: number) =>
    apiService.delete(`/suppliers/${id}`, {
      successMessage: 'Supplier deleted successfully.',
    }),
};
