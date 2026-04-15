import apiService from '@/services/api';
import type { Invoice, InvoiceInput } from '@/pages/invoices/invoiceTypes';

type AddInvoicePaymentPayload = {
  date: string;
  amount: number;
  method?: string;
  reference?: string | null;
  notes?: string | null;
};

type AddInvoicePaymentResponse = {
  message: string;
  payment: {
    id: number;
    date: string;
    amount: number;
    method: string;
    reference: string | null;
    notes: string | null;
    isInitial: boolean;
  };
  invoice: {
    id: number;
    total: number;
    paymentReceived: number;
    balanceDue: number;
    status: Invoice['status'];
  };
};

export const invoiceApi = {
  list: () => apiService.get<Invoice[]>('/invoices'),
  detail: (invoiceId: number) => apiService.get<Invoice>(`/invoices/${invoiceId}`),
  create: (payload: InvoiceInput) => apiService.post<Invoice>('/invoices', payload, {
    successMessage: 'Invoice created successfully.',
  }),
  update: (invoiceId: number, payload: InvoiceInput) => apiService.put<Invoice>(`/invoices/${invoiceId}`, payload, {
    successMessage: 'Invoice updated successfully.',
  }),
  addPayment: (invoiceId: number, payload: AddInvoicePaymentPayload) =>
    apiService.post<AddInvoicePaymentResponse>(`/invoices/${invoiceId}/payments`, payload, {
      successMessage: 'Invoice payment added successfully.',
    }),
  removePayment: (invoiceId: number, paymentId: number) =>
    apiService.delete<{ message: string; invoice: AddInvoicePaymentResponse['invoice'] }>(`/invoices/${invoiceId}/payments/${paymentId}`, {
      successMessage: 'Invoice payment deleted successfully.',
    }),
  remove: (invoiceId: number) => apiService.delete(`/invoices/${invoiceId}`, {
    successMessage: 'Invoice deleted successfully.',
  }),
};
