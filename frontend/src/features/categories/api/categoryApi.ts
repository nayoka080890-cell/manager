import { apiService } from '@/services/api';

export type Category = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
};

export type CategoryInput = {
  name: string;
  description: string;
};

export const categoryApi = {
  list: () => apiService.get<Category[]>('/categories'),
  create: (payload: CategoryInput) =>
    apiService.post<Category>('/categories', payload, {
      successMessage: 'Category created successfully.',
    }),
  update: (id: number, payload: CategoryInput) =>
    apiService.put<Category>(`/categories/${id}`, payload, {
      successMessage: 'Category updated successfully.',
    }),
  remove: (id: number) =>
    apiService.delete(`/categories/${id}`, {
      successMessage: 'Category deleted successfully.',
    }),
};
