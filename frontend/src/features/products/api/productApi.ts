import { apiService } from '@/services/api';

export type Product = {
  id: number;
  name: string;
  displayName?: string;
  sku?: string;
  specifications: string;
  thinkness?: string | null;
  weight?: number | null;
  description?: string | null;
  unit: string;
  packagingUnit?: string;
  unitsPerPack?: number | null;
  billableUnit?: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  category: string;
  createdAt: string;
};

export type Category = {
  id: number;
  name: string;
};

export type ProductPayload = {
  name: string;
  displayName?: string;
  sku?: string;
  specifications: string;
  thinkness?: string;
  weight?: number;
  description?: string;
  unit: string;
  packagingUnit?: string;
  unitsPerPack?: number;
  billableUnit?: string;
  purchasePrice: number;
  sellingPrice: number;
  category: string;
};

export type ProductImportResult = {
  message: string;
  summary: {
    created: number;
    updated: number;
    skipped: number;
  };
  errors: string[];
};

export const productApi = {
  list: () => apiService.get<Product[]>('/products'),
  listCategories: () => apiService.get<Category[]>('/categories'),
  create: (payload: ProductPayload) =>
    apiService.post<Product>('/products', payload, {
      successMessage: 'Product created successfully.',
    }),
  importExcel: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post<ProductImportResult>('/products/import', formData, {
      successMessage: 'Products imported successfully.',
    });
  },
  update: (id: number, payload: ProductPayload) =>
    apiService.put<Product>(`/products/${id}`, payload, {
      successMessage: 'Product updated successfully.',
    }),
  remove: (id: number) =>
    apiService.delete(`/products/${id}`, {
      successMessage: 'Product deleted successfully.',
    }),
};
