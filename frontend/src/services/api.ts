import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import toastr from 'toastr';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

type ToastOptions = {
  toastSuccess?: boolean;
  successMessage?: string;
  toastError?: boolean;
  errorMessage?: string;
};

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    toastr.options = {
      closeButton: true,
      progressBar: true,
      newestOnTop: true,
      timeOut: 2200,
      extendedTimeOut: 1000,
      positionClass: 'toast-top-right',
    };
  }

  private resolveMessageFromResponse(data: any): string | null {
    const message = data?.message;
    return typeof message === 'string' && message.trim() ? message : null;
  }

  private resolveMessageFromError(error: any): string {
    const backendMessage = error?.response?.data?.message;
    if (typeof backendMessage === 'string' && backendMessage.trim()) {
      return backendMessage;
    }

    return 'Operation failed. Please try again.';
  }

  // Generic CRUD methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any, options?: ToastOptions): Promise<T> {
    const toastSuccess = options?.toastSuccess ?? true;
    const toastError = options?.toastError ?? true;

    try {
      const requestConfig = data instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined;
      const response = await this.api.post(url, data, requestConfig);
      if (toastSuccess) {
        toastr.success(options?.successMessage ?? this.resolveMessageFromResponse(response.data) ?? 'Created successfully.');
      }
      return response.data;
    } catch (error) {
      if (toastError) {
        toastr.error(options?.errorMessage ?? this.resolveMessageFromError(error));
      }
      return Promise.reject(error);
    }
  }

  async put<T>(url: string, data?: any, options?: ToastOptions): Promise<T> {
    const toastSuccess = options?.toastSuccess ?? true;
    const toastError = options?.toastError ?? true;

    try {
      const response = await this.api.put(url, data);
      if (toastSuccess) {
        toastr.success(options?.successMessage ?? this.resolveMessageFromResponse(response.data) ?? 'Updated successfully.');
      }
      return response.data;
    } catch (error) {
      if (toastError) {
        toastr.error(options?.errorMessage ?? this.resolveMessageFromError(error));
      }
      return Promise.reject(error);
    }
  }

  async patch<T>(url: string, data?: any, options?: ToastOptions): Promise<T> {
    const toastSuccess = options?.toastSuccess ?? true;
    const toastError = options?.toastError ?? true;

    try {
      const response = await this.api.patch(url, data);
      if (toastSuccess) {
        toastr.success(options?.successMessage ?? this.resolveMessageFromResponse(response.data) ?? 'Updated successfully.');
      }
      return response.data;
    } catch (error) {
      if (toastError) {
        toastr.error(options?.errorMessage ?? this.resolveMessageFromError(error));
      }
      return Promise.reject(error);
    }
  }

  async delete<T>(url: string, options?: ToastOptions): Promise<T> {
    const toastSuccess = options?.toastSuccess ?? true;
    const toastError = options?.toastError ?? true;

    try {
      const response = await this.api.delete(url);
      if (toastSuccess) {
        toastr.success(options?.successMessage ?? this.resolveMessageFromResponse(response.data) ?? 'Deleted successfully.');
      }
      return response.data;
    } catch (error) {
      if (toastError) {
        toastr.error(options?.errorMessage ?? this.resolveMessageFromError(error));
      }
      return Promise.reject(error);
    }
  }

  // Auth methods
  async login(credentials: { email: string; password: string }) {
    const response = await this.api.post('/login', credentials);
    const { token, user } = response.data;
    localStorage.setItem('auth_token', token);
    return { token, user };
  }

  async logout() {
    await this.api.post('/logout');
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser() {
    const response = await this.api.get('/user');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;