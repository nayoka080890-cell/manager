import apiService from '@/services/api';

export type LoginCredentials = {
  email: string;
  password: string;
};

export const authApi = {
  login: (credentials: LoginCredentials) => apiService.login(credentials),
  logout: () => apiService.logout(),
};
