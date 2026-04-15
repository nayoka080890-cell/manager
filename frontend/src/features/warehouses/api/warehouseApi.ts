import { apiService } from '@/services/api';

export type BranchOption = {
  id: number;
  code: string;
  name: string;
};

export type Warehouse = {
  id: number;
  branchId: number | null;
  branchName: string | null;
  code: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
};

export type WarehouseInput = {
  branchId: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  city: string;
};

type WarehousePayload = {
  branchId: number | null;
  code: string;
  name: string;
  phone: string;
  address: string;
  city: string;
};

export const warehouseApi = {
  list: () => apiService.get<Warehouse[]>('/warehouses'),
  listBranches: () => apiService.get<BranchOption[]>('/branches'),
  create: (payload: WarehousePayload) =>
    apiService.post<Warehouse>('/warehouses', payload, {
      successMessage: 'Warehouse created successfully.',
    }),
  update: (id: number, payload: WarehousePayload) =>
    apiService.put<Warehouse>(`/warehouses/${id}`, payload, {
      successMessage: 'Warehouse updated successfully.',
    }),
  remove: (id: number) =>
    apiService.delete(`/warehouses/${id}`, {
      successMessage: 'Warehouse deleted successfully.',
    }),
};
