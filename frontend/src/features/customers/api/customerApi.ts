import { apiService } from '@/services/api';

export type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
};

export type CustomerInput = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  status: Customer['status'];
};

export const customerApi = {
  list: () => apiService.get<Customer[]>('/customers'),
  create: (payload: CustomerInput) =>
    apiService.post<Customer>('/customers', payload, {
      successMessage: 'Customer created successfully.',
    }),
  update: (id: number, payload: CustomerInput) =>
    apiService.put<Customer>(`/customers/${id}`, payload, {
      successMessage: 'Customer updated successfully.',
    }),
  remove: (id: number) =>
    apiService.delete(`/customers/${id}`, {
      successMessage: 'Customer deleted successfully.',
    }),
};
