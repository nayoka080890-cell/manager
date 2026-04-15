import { apiService } from '@/services/api';

export type Branch = {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
};

export type BranchInput = {
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
};

export const branchApi = {
  list: () => apiService.get<Branch[]>('/branches'),
  create: (payload: BranchInput) =>
    apiService.post<Branch>('/branches', payload, {
      successMessage: 'Branch created successfully.',
    }),
  update: (id: number, payload: BranchInput) =>
    apiService.put<Branch>(`/branches/${id}`, payload, {
      successMessage: 'Branch updated successfully.',
    }),
  remove: (id: number) =>
    apiService.delete(`/branches/${id}`, {
      successMessage: 'Branch deleted successfully.',
    }),
};
