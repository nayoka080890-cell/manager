import { apiService } from '@/services/api';
import type { Purchase, PurchaseInput } from '@/features/purchases/components/PurchaseFormPageContent';

type PurchaseDetailItem = {
  id: number;
  productId: number;
  productName: string;
  unit: string;
  qty: number;
  packagingUnitsQty?: number | null;
  unitsPerPack?: number | null;
  totalUnits?: number | null;
  billableQty?: number | null;
  unitPrice?: number | null;
  unitCost: number;
};

export type PurchaseDetailResponse = {
  warehouseId?: number | null;
  warehouseName?: string | null;
  items: PurchaseDetailItem[];
  discount: number;
  paymentMade: number;
  payments?: Array<{ id: number; date: string; amount: number; method: string; reference: string | null; notes: string | null; isInitial: boolean }>;
};

export type PurchaseBalanceResponse = {
  id: number;
  total: number;
  paymentMade: number;
  balanceDue: number;
};

export type PurchasePaymentResponse = {
  purchase: {
    id: number;
    total: number;
    paymentMade: number;
    balanceDue: number;
  };
};

export type ProductCategoryMap = { id: number; category?: string | null };

export type WarehouseOption = { id: number; code: string; name: string };
export type SupplierOption = { id: number; name: string; phone: string; address: string };
export type ProductOption = { id: number; name: string; unit: string; packagingUnit?: string; purchasePrice: number; category: string };
export type CategoryOption = { id: number; name: string };
export type PurchaseNextNumberResponse = { nextId: number; purchaseNumber: string };

export const purchaseApi = {
  list: () => apiService.get<Purchase[]>('/purchases'),
  detail: (id: number) => apiService.get<PurchaseDetailResponse>(`/purchases/${id}`),
  create: (payload: Omit<PurchaseInput, 'purchaseNumber'>) =>
    apiService.post<Purchase>('/purchases', payload, { successMessage: 'Purchase created successfully.' }),
  update: (id: number, payload: Omit<PurchaseInput, 'purchaseNumber'>) =>
    apiService.put<Purchase>(`/purchases/${id}`, payload, { successMessage: 'Purchase updated successfully.' }),
  remove: (id: number) => apiService.delete(`/purchases/${id}`, { successMessage: 'Purchase deleted successfully.' }),
  getBalance: (id: number) => apiService.get<PurchaseBalanceResponse>(`/purchases/${id}`),
  addPayment: (id: number, payload: { date: string; amount: number; method: string; reference: string | null; notes: string | null }) =>
    apiService.post<PurchasePaymentResponse>(`/purchases/${id}/payments`, payload, { successMessage: 'Payment added successfully.' }),
  products: () => apiService.get<ProductCategoryMap[]>('/products'),
  listWarehouses: () => apiService.get<WarehouseOption[]>('/warehouses'),
  listSuppliers: () => apiService.get<SupplierOption[]>('/suppliers'),
  listProducts: () => apiService.get<ProductOption[]>('/products'),
  listCategories: () => apiService.get<CategoryOption[]>('/categories'),
  nextNumber: () => apiService.get<PurchaseNextNumberResponse>('/purchases/next-number'),
};
