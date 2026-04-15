import { useCallback, useEffect, useMemo, useState } from 'react';
import { customerApi } from '@/features/customers/api/customerApi';
import { invoiceLookupApi, type InvoiceCustomerOption, type InvoiceProductOption } from '@/features/invoices/api/invoiceLookupApi';
import { useSelect2 } from '@/hooks/useSelect2';
import type { Invoice, InvoiceInput, InvoiceItem, InvoiceStatus } from '@/pages/invoices/invoiceTypes';

type LineItem = {
  id: number;
  productId: number | null;
  productName: string;
  unit: string;
  qty: number;
  unitPrice: number;
};

type UseInvoiceFormOptions = {
  editingInvoice: Invoice | null;
  searchChooseCustomerLabel: string;
  searchChooseProductLabel: string;
  customerFoundByPhoneLabel: string;
  customerNotFoundByPhoneLabel: string;
};

const fallbackInvoiceNumber = () => `INV-${Date.now().toString().slice(-6)}`;

const normalizePhone = (value: string) => value.replace(/\D/g, '');

const mapInvoiceItemsToForm = (items: InvoiceItem[] | undefined): LineItem[] => {
  return (items ?? []).map((item, index) => ({
    id: item.id ?? index + 1,
    productId: item.productId,
    productName: item.productName,
    unit: item.unit,
    qty: item.qty,
    unitPrice: item.unitPrice,
  }));
};

export const useInvoiceForm = ({
  editingInvoice,
  searchChooseCustomerLabel,
  searchChooseProductLabel,
  customerFoundByPhoneLabel,
  customerNotFoundByPhoneLabel,
}: UseInvoiceFormOptions) => {
  const today = new Date().toISOString().split('T')[0];
  const [invoiceNumber, setInvoiceNumber] = useState(editingInvoice?.invoiceNumber ?? '');
  const [date, setDate] = useState(editingInvoice?.date ?? today);
  const [status, setStatus] = useState<InvoiceStatus>(editingInvoice?.status ?? 'Draft');
  const [customer, setCustomer] = useState({
    name: editingInvoice?.customerName ?? '',
    phone: editingInvoice?.customerPhone ?? '',
    address: editingInvoice?.customerAddress ?? '',
  });
  const [items, setItems] = useState<LineItem[]>(() => mapInvoiceItemsToForm(editingInvoice?.items));
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(editingInvoice?.customerId ? String(editingInvoice.customerId) : '');
  const [discount, setDiscount] = useState(editingInvoice ? String(editingInvoice.discount || '') : '');
  const [paymentReceived, setPaymentReceived] = useState(editingInvoice ? String(editingInvoice.paymentReceived || '') : '');
  const [customers, setCustomers] = useState<InvoiceCustomerOption[]>([]);
  const [products, setProducts] = useState<InvoiceProductOption[]>([]);
  const [isLoadingFormData, setIsLoadingFormData] = useState(true);
  const [customerLookupNotice, setCustomerLookupNotice] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadFormData = async () => {
      setIsLoadingFormData(true);

      try {
        const [customerData, productData] = await Promise.all([
          invoiceLookupApi.customers(),
          invoiceLookupApi.products(),
        ]);

        if (isCancelled) {
          return;
        }

        setCustomers(customerData);
        setProducts(productData);

        if (!editingInvoice) {
          try {
            const nextInvoice = await invoiceLookupApi.nextNumber();
            if (!isCancelled) {
              setInvoiceNumber(nextInvoice.invoiceNumber || fallbackInvoiceNumber());
            }
          } catch (error) {
            console.error('Failed to load next invoice number:', error);
            if (!isCancelled) {
              setInvoiceNumber((prev) => prev || fallbackInvoiceNumber());
            }
          }
        }
      } catch (error) {
        console.error('Failed to load invoice form data:', error);
      } finally {
        if (!isCancelled) {
          setIsLoadingFormData(false);
        }
      }
    };

    void loadFormData();

    return () => {
      isCancelled = true;
    };
  }, [editingInvoice]);

  useEffect(() => {
    setDate(editingInvoice?.date ?? today);
    setStatus(editingInvoice?.status ?? 'Draft');
    setCustomer({
      name: editingInvoice?.customerName ?? '',
      phone: editingInvoice?.customerPhone ?? '',
      address: editingInvoice?.customerAddress ?? '',
    });
    setItems(mapInvoiceItemsToForm(editingInvoice?.items));
    setSelectedCustomerId(editingInvoice?.customerId ? String(editingInvoice.customerId) : '');
    setDiscount(editingInvoice ? String(editingInvoice.discount || '') : '');
    setPaymentReceived(editingInvoice ? String(editingInvoice.paymentReceived || '') : '');
    setInvoiceNumber(editingInvoice?.invoiceNumber ?? '');
    setCustomerLookupNotice('');
  }, [editingInvoice, today]);

  useEffect(() => {
    if (!selectedCustomerId) {
      return;
    }

    const selectedCustomer = customers.find((entry) => entry.id === Number(selectedCustomerId));
    if (!selectedCustomer) {
      return;
    }

    setCustomer({
      name: selectedCustomer.name,
      phone: selectedCustomer.phone ?? '',
      address: selectedCustomer.address ?? '',
    });
    setCustomerLookupNotice('');
  }, [customers, selectedCustomerId]);

  const handleCustomerSelectChange = useCallback((value: string) => {
    setSelectedCustomerId(value);

    if (!value) {
      setCustomerLookupNotice('');
      return;
    }

    const matchedCustomer = customers.find((entry) => entry.id === Number(value));
    if (!matchedCustomer) {
      return;
    }

    setCustomer({
      name: matchedCustomer.name,
      phone: matchedCustomer.phone ?? '',
      address: matchedCustomer.address ?? '',
    });
    setCustomerLookupNotice('');
  }, [customers]);

  const handleCustomerNameChange = (value: string) => {
    setSelectedCustomerId('');
    setCustomerLookupNotice('');
    setCustomer((prev) => ({ ...prev, name: value }));
  };

  const handleCustomerAddressChange = (value: string) => {
    setSelectedCustomerId('');
    setCustomerLookupNotice('');
    setCustomer((prev) => ({ ...prev, address: value }));
  };

  const handleCustomerPhoneChange = (value: string) => {
    const normalized = normalizePhone(value);

    setCustomer((prev) => ({ ...prev, phone: value }));

    if (!normalized) {
      setSelectedCustomerId('');
      setCustomerLookupNotice('');
      return;
    }

    const matchedCustomer = customers.find((entry) => normalizePhone(entry.phone ?? '') === normalized);

    if (matchedCustomer) {
      setSelectedCustomerId(String(matchedCustomer.id));
      setCustomer({
        name: matchedCustomer.name,
        phone: matchedCustomer.phone ?? value,
        address: matchedCustomer.address ?? '',
      });
      setCustomerLookupNotice(customerFoundByPhoneLabel);
      return;
    }

    setSelectedCustomerId('');
    setCustomerLookupNotice(customerNotFoundByPhoneLabel);
  };

  const startAddNewCustomer = () => {
    setSelectedCustomerId('');
    setCustomer({ name: '', phone: '', address: '' });
    setCustomerLookupNotice('');
  };

  const customerSelectRef = useSelect2({
    placeholder: searchChooseCustomerLabel,
    value: selectedCustomerId,
    onValueChange: handleCustomerSelectChange,
    syncDeps: [customers.length],
  });

  const productCategories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category).filter(Boolean))),
    [products]
  );

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return products;
    }

    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  const productSelectRef = useSelect2({
    placeholder: searchChooseProductLabel,
    value: selectedProductId,
    onValueChange: setSelectedProductId,
    syncDeps: [filteredProducts.length],
  });

  useEffect(() => {
    if (!selectedProductId) {
      return;
    }

    const existsInFilter = filteredProducts.some((product) => String(product.id) === selectedProductId);
    if (!existsInFilter) {
      setSelectedProductId('');
    }
  }, [filteredProducts, selectedProductId]);

  const discountAmount = Math.max(0, Number(discount) || 0);
  const paymentAmount = Math.max(0, Number(paymentReceived) || 0);
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const total = Math.max(0, subtotal - discountAmount);
  const change = paymentAmount - total;

  const addProductById = (productId: number) => {
    if (!productId || !Number.isFinite(productId)) {
      return;
    }

    setItems((prev) => {
      if (prev.some((item) => item.productId === productId)) {
        return prev;
      }

      const product = products.find((entry) => entry.id === productId);
      if (!product) {
        return prev;
      }

      const nextId = prev.length > 0 ? Math.max(...prev.map((item) => item.id)) + 1 : 1;

      return [
        ...prev,
        {
          id: nextId,
          productId: product.id,
          productName: product.name,
          unit: product.unit,
          qty: 1,
          unitPrice: product.sellingPrice,
        },
      ];
    });
  };

  const addSelectedProduct = () => {
    const productId = Number(selectedProductId);
    if (!productId) {
      return;
    }

    addProductById(productId);

    setSelectedProductId('');
  };

  const updateItem = (id: number, updates: Partial<Pick<LineItem, 'qty' | 'unitPrice'>>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const buildPayload = (): InvoiceInput | null => {
    if (!invoiceNumber.trim() || !customer.name.trim() || !date) {
      return null;
    }

    return {
      invoiceNumber: invoiceNumber.trim(),
      customerId: selectedCustomerId ? Number(selectedCustomerId) : null,
      customerName: customer.name.trim(),
      date,
      discount: discountAmount.toFixed(2),
      paymentReceived: paymentAmount.toFixed(2),
      status,
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        unit: item.unit,
        qty: item.qty,
        unitPrice: item.unitPrice,
      })),
    };
  };

  const buildPayloadForSubmit = async (): Promise<InvoiceInput | null> => {
    const payload = buildPayload();
    if (!payload) {
      return null;
    }

    if (payload.customerId) {
      return payload;
    }

    const normalizedPhone = normalizePhone(customer.phone);
    if (normalizedPhone) {
      const matchedCustomer = customers.find((entry) => normalizePhone(entry.phone ?? '') === normalizedPhone);
      if (matchedCustomer) {
        return {
          ...payload,
          customerId: matchedCustomer.id,
          customerName: matchedCustomer.name,
        };
      }
    }

    try {
      const safeName = payload.customerName.trim();
      const safePhone = customer.phone.trim();
      const safeAddress = customer.address.trim();
      const emailSeed = normalizePhone(safePhone) || Date.now().toString();

      const createdCustomer = await customerApi.create({
        name: safeName,
        email: `customer${emailSeed}@qh.local`,
        phone: safePhone,
        address: safeAddress,
        city: '',
        status: 'Active',
      });

      setCustomers((prev) => [
        {
          id: createdCustomer.id,
          name: createdCustomer.name,
          phone: createdCustomer.phone,
          address: createdCustomer.address,
        },
        ...prev,
      ]);
      setSelectedCustomerId(String(createdCustomer.id));

      return {
        ...payload,
        customerId: createdCustomer.id,
        customerName: createdCustomer.name,
      };
    } catch (error: any) {
      const isPhoneDuplicate = Boolean(error?.response?.status === 422 && error?.response?.data?.errors?.phone);

      if (isPhoneDuplicate) {
        try {
          const refreshedCustomers = await invoiceLookupApi.customers();
          setCustomers(refreshedCustomers);

          const matchedCustomer = refreshedCustomers.find((entry) => normalizePhone(entry.phone ?? '') === normalizedPhone);
          if (matchedCustomer) {
            setSelectedCustomerId(String(matchedCustomer.id));
            setCustomer({
              name: matchedCustomer.name,
              phone: matchedCustomer.phone ?? safePhone,
              address: matchedCustomer.address ?? '',
            });
            setCustomerLookupNotice(customerFoundByPhoneLabel);

            return {
              ...payload,
              customerId: matchedCustomer.id,
              customerName: matchedCustomer.name,
            };
          }
        } catch (refreshError) {
          console.error('Failed to refresh customers after duplicate phone response:', refreshError);
        }
      }

      console.error('Failed to create customer from invoice form:', error);
      return null;
    }
  };

  return {
    invoiceNumber,
    date,
    status,
    customer,
    customerLookupNotice,
    items,
    selectedCategory,
    selectedProductId,
    discount,
    paymentReceived,
    customers,
    productCategories,
    filteredProducts,
    isLoadingFormData,
    customerSelectRef,
    productSelectRef,
    subtotal,
    discountAmount,
    paymentAmount,
    total,
    change,
    setDate,
    setStatus,
    setCustomer,
    setSelectedCategory,
    setSelectedProductId,
    setDiscount,
    setPaymentReceived,
    addProductById,
    addSelectedProduct,
    handleCustomerSelectChange,
    handleCustomerNameChange,
    handleCustomerPhoneChange,
    handleCustomerAddressChange,
    startAddNewCustomer,
    updateItem,
    removeItem,
    buildPayload,
    buildPayloadForSubmit,
  };
};
