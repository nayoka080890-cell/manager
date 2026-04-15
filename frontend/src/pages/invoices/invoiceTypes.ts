export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export type InvoiceItem = {
  id: number;
  productId: number | null;
  productName: string;
  unit: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type InvoicePayment = {
  id: number;
  date: string;
  amount: number;
  method: string;
  reference: string | null;
  notes: string | null;
  isInitial: boolean;
};

export type Invoice = {
  id: number;
  invoiceNumber: string;
  customerId: number | null;
  customerName: string;
  customerPhone?: string | null;
  customerAddress?: string | null;
  date: string;
  createdAt: string;
  subtotal: number;
  discount: number;
  paymentReceived: number;
  balanceDue: number;
  total: number;
  amount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  payments: InvoicePayment[];
};

export type InvoiceInputItem = {
  productId: number | null;
  productName: string;
  unit: string;
  qty: number;
  unitPrice: number;
};

export type InvoiceInput = {
  invoiceNumber: string;
  customerId: number | null;
  customerName: string;
  date: string;
  discount: string;
  paymentReceived: string;
  status: InvoiceStatus;
  items: InvoiceInputItem[];
};
