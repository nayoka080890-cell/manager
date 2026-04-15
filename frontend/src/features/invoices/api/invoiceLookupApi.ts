import apiService from '@/services/api';

export type InvoiceCustomerOption = {
  id: number;
  name: string;
  phone: string;
  address: string;
};

export type InvoiceProductOption = {
  id: number;
  name: string;
  unit: string;
  category: string;
  quantity: number;
  sellingPrice: number;
};

export type NextInvoiceResponse = {
  nextId: number;
  invoiceNumber: string;
};

export const invoiceLookupApi = {
  customers: () => apiService.get<InvoiceCustomerOption[]>('/customers'),
  products: () => apiService.get<InvoiceProductOption[]>('/products'),
  nextNumber: () => apiService.get<NextInvoiceResponse>('/invoices/next-number'),
};
