import { useEffect, useMemo, useState } from 'react';
import { invoiceApi } from '@/features/invoices/api/invoiceApi';
import type { Invoice, InvoiceInput } from '@/pages/invoices/invoiceTypes';

const initialInvoices: Invoice[] = [];

type UseInvoicesPageOptions = {
  viewMode?: 'list' | 'add';
  onViewChange?: (tab: string) => void;
};

type PaymentTarget = {
  invoiceId: number;
  invoiceNumber: string;
  customerName: string;
  total: number;
  paymentReceived: number;
  balanceDue: number;
  payments: Invoice['payments'];
};

export const useInvoicesPage = ({ viewMode = 'list', onViewChange }: UseInvoicesPageOptions) => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isLoadingInvoiceDetail, setIsLoadingInvoiceDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Invoice['status']>('all');
  const [createdDateFrom, setCreatedDateFrom] = useState(monthStart);
  const [createdDateTo, setCreatedDateTo] = useState(monthEnd);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'customer-asc' | 'customer-desc' | 'amount-asc' | 'amount-desc'>('newest');
  const [paymentTarget, setPaymentTarget] = useState<PaymentTarget | null>(null);
  const [paymentDate, setPaymentDate] = useState(today);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  const loadInvoices = async () => {
    try {
      const data = await invoiceApi.list();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    }
  };

  useEffect(() => {
    void loadInvoices();
  }, []);

  useEffect(() => {
    if (viewMode === 'add') {
      setEditingInvoice(null);
      setViewingInvoice(null);
      setShowForm(true);
      setShowDetail(false);
      return;
    }

    setEditingInvoice(null);
    setViewingInvoice(null);
    setShowForm(false);
    setShowDetail(false);
  }, [viewMode]);

  const filteredInvoices = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const list = invoices.filter((item) => {
      const matchesSearch =
        !normalized ||
        item.invoiceNumber.toLowerCase().includes(normalized) ||
        item.customerName.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCreatedFrom = !createdDateFrom || item.createdAt >= createdDateFrom;
      const matchesCreatedTo = !createdDateTo || item.createdAt <= createdDateTo;
      return matchesSearch && matchesStatus && matchesCreatedFrom && matchesCreatedTo;
    });

    const sorted = list.slice().sort((a, b) => {
      if (sortBy === 'newest') return b.date.localeCompare(a.date);
      if (sortBy === 'oldest') return a.date.localeCompare(b.date);
      if (sortBy === 'customer-asc') return a.customerName.localeCompare(b.customerName);
      if (sortBy === 'customer-desc') return b.customerName.localeCompare(a.customerName);
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return b.amount - a.amount;
    });

    return sorted.slice(0, 30);
  }, [createdDateFrom, createdDateTo, invoices, searchTerm, sortBy, statusFilter]);

  const goToList = () => {
    setShowForm(false);
    setShowDetail(false);
    setEditingInvoice(null);
    setViewingInvoice(null);
    setIsLoadingInvoiceDetail(false);
    onViewChange?.('invoices');
  };

  const openCreateForm = () => {
    setEditingInvoice(null);
    setViewingInvoice(null);
    setShowDetail(false);
    setShowForm(true);
    onViewChange?.('invoices-add');
  };

  const handleView = async (invoice: Invoice) => {
    try {
      setIsLoadingInvoiceDetail(true);
      const detail = await invoiceApi.detail(invoice.id);
      setViewingInvoice(detail);
      setEditingInvoice(null);
      setShowDetail(true);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to load invoice detail:', error);
    } finally {
      setIsLoadingInvoiceDetail(false);
    }
  };

  const handleEdit = async (invoice: Invoice) => {
    try {
      setIsLoadingInvoiceDetail(true);
      const detail = await invoiceApi.detail(invoice.id);
      setEditingInvoice(detail);
      setViewingInvoice(null);
      setShowDetail(false);
      setShowForm(true);
    } catch (error) {
      console.error('Failed to load invoice detail:', error);
    } finally {
      setIsLoadingInvoiceDetail(false);
    }
  };

  const handleDelete = async (invoiceId: number) => {
    try {
      await invoiceApi.remove(invoiceId);
      setInvoices((prev) => prev.filter((invoice) => invoice.id !== invoiceId));
    } catch (error) {
      console.error('Failed to delete invoice:', error);
    }
  };

  const closePaymentModal = () => {
    setPaymentTarget(null);
    setPaymentDate(today);
    setPaymentAmount('');
    setPaymentMethod('Cash');
    setPaymentReference('');
    setPaymentNotes('');
    setPaymentError('');
    setIsSavingPayment(false);
  };

  const openPaymentModal = async (invoice: Invoice) => {
    try {
      const detail = await invoiceApi.detail(invoice.id);

      setPaymentTarget({
        invoiceId: detail.id,
        invoiceNumber: detail.invoiceNumber,
        customerName: detail.customerName,
        total: Number(detail.total) || 0,
        paymentReceived: Number(detail.paymentReceived) || 0,
        balanceDue: Number(detail.balanceDue) || 0,
        payments: detail.payments ?? [],
      });
      setPaymentDate(today);
      setPaymentAmount('');
      setPaymentMethod('Cash');
      setPaymentReference('');
      setPaymentNotes('');
      setPaymentError('');
    } catch (error) {
      console.error('Failed to load invoice payment info:', error);
      setPaymentError('Failed to load invoice payment info.');
    }
  };

  const handleSavePayment = async () => {
    if (!paymentTarget) return;

    const amountValue = Number(paymentAmount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setPaymentError('Please enter a valid amount greater than 0.');
      return;
    }

    if (amountValue > paymentTarget.balanceDue) {
      setPaymentError('Payment amount cannot be greater than balance due.');
      return;
    }

    try {
      setIsSavingPayment(true);
      setPaymentError('');

      const response = await invoiceApi.addPayment(paymentTarget.invoiceId, {
        date: paymentDate,
        amount: amountValue,
        method: paymentMethod,
        reference: paymentReference.trim() || null,
        notes: paymentNotes.trim() || null,
      });

      const detail = await invoiceApi.detail(paymentTarget.invoiceId);
      setInvoices((prev) => prev.map((invoice) => (invoice.id === detail.id ? detail : invoice)));

      if ((Number(response.invoice.balanceDue) || 0) <= 0) {
        closePaymentModal();
        return;
      }

      setPaymentTarget((prev) =>
        prev
          ? {
              ...prev,
              paymentReceived: Number(response.invoice.paymentReceived) || prev.paymentReceived,
              balanceDue: Number(response.invoice.balanceDue) || prev.balanceDue,
              total: Number(response.invoice.total) || prev.total,
              payments: detail.payments ?? prev.payments,
            }
          : prev
      );
      setPaymentAmount('');
      setPaymentReference('');
      setPaymentNotes('');
    } catch (error: any) {
      const message = error?.response?.data?.message ?? 'Failed to save payment.';
      setPaymentError(message);
      console.error('Failed to save invoice payment:', error);
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleFormSubmit = async (payload: InvoiceInput): Promise<boolean> => {
    try {
      if (editingInvoice) {
        const updated = await invoiceApi.update(editingInvoice.id, payload);
        setInvoices((prev) => prev.map((invoice) => (invoice.id === editingInvoice.id ? updated : invoice)));
      } else {
        const created = await invoiceApi.create(payload);
        setInvoices((prev) => [created, ...prev]);
      }

      await loadInvoices();
      goToList();
      return true;
    } catch (error) {
      console.error('Failed to save invoice:', error);
      return false;
    }
  };

  return {
    invoices,
    filteredInvoices,
    showForm,
    showDetail,
    editingInvoice,
    viewingInvoice,
    isLoadingInvoiceDetail,
    searchTerm,
    statusFilter,
    createdDateFrom,
    createdDateTo,
    sortBy,
    paymentTarget,
    paymentDate,
    paymentAmount,
    paymentMethod,
    paymentReference,
    paymentNotes,
    paymentError,
    isSavingPayment,
    setSearchTerm,
    setStatusFilter,
    setCreatedDateFrom,
    setCreatedDateTo,
    setSortBy,
    setPaymentDate,
    setPaymentAmount,
    setPaymentMethod,
    setPaymentReference,
    setPaymentNotes,
    goToList,
    openCreateForm,
    handleView,
    handleEdit,
    handleDelete,
    openPaymentModal,
    closePaymentModal,
    handleSavePayment,
    handleFormSubmit,
  };
};
