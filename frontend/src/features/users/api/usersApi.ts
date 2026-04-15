import { apiService } from '@/services/api';

export type UserItem = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

export type UserInput = {
  name: string;
  email: string;
  role: string;
  status: string;
};

export const usersApi = {
  list: () => apiService.get<UserItem[]>('/users'),
  create: (payload: UserInput) =>
    apiService.post<UserItem>('/users', payload, {
      successMessage: 'User created successfully.',
    }),
};
