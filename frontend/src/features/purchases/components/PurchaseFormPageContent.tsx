import React, { useState, useEffect, useMemo, useRef } from 'react';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css';
import { purchaseApi } from '@/features/purchases/api/purchaseApi';
import { usePurchaseFormDisplay } from '@/features/purchases/hooks/usePurchaseFormDisplay';
import { purchaseFormTranslations, type Language } from '@/i18n/translations';
import { formatVnd } from '@/utils/formatCurrency';

export type Purchase = {
  id: number;
  purchaseNumber: string;
  supplierId: number;
  supplierName: string;
  warehouseId?: number | null;
  warehouseName?: string | null;
  date: string;
  amount: number;
  paymentMade?: number;
  balanceDue?: number;
  status: 'Draft' | 'Ordered' | 'Received' | 'Cancelled';
  createdAt: string;
  payments?: Array<{ id: number; date: string; amount: number; method: string; isInitial: boolean }>;
};

export type PurchaseInput = {
  purchaseNumber: string;
  supplierId: number;
  warehouseId: number;
  date: string;
  status: Purchase['status'];
  items: Array<{
    productId: number;
    productName: string;
    unit: string;
    qty: number;
    packagingUnitsQty?: number;
    unitsPerPack?: number;
    totalUnits?: number;
    billableQty?: number;
    unitPrice?: number;
    unitCost: number;
  }>;
  discount: number;
  paymentMade: number;
};

export type PurchaseLineItem = {
  id: number;
  productId: number;
  productName: string;
  packagingUnit?: string;
  unit: string;
  qty: number;
  packagingUnitsQty: number;
  unitsPerPack: number;
  totalUnits: number;
  billableQty: number;
  unitPrice: number;
  unitCost: number;
};

type ProductDemo = {
  id: number;
  name: string;
  category: string;
  packagingUnit: string;
  unit: string;
  purchasePrice: number;
};

type SupplierInfo = {
  id: number;
  name: string;
  phone: string;
  address: string;
};

type WarehouseOption = {
  id: number;
  code: string;
  name: string;
};

type Props = {
  language: Language;
  editingPurchase: Purchase | null;
  defaultCategory?: string;
  customCreateTitle?: string;
  enableBoxSteelFields?: boolean;
  enableWeightPricingFields?: boolean;
  enableVolumePricingFields?: boolean;
  editingDetail?: {
    items: PurchaseLineItem[];
    discount: number;
    paymentMade: number;
    hasNonInitialPayments: boolean;
    payments: Array<{
      id: number;
      date: string;
      amount: number;
      method: string;
      reference: string | null;
      notes: string | null;
      isInitial: boolean;
    }>;
  } | null;
  onBack: () => void;
  onSubmit: (input: PurchaseInput) => Promise<boolean>;
};

const formatDateDMY = (dateString: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
};

const normalizePurchaseLineItem = (item: Partial<PurchaseLineItem> & Pick<PurchaseLineItem, 'id' | 'productId' | 'productName'>): PurchaseLineItem => ({
  id: item.id,
  productId: item.productId,
  productName: item.productName,
  packagingUnit: item.packagingUnit ?? '',
  unit: item.unit ?? '',
  qty: Number(item.qty ?? 0),
  packagingUnitsQty: Number(item.packagingUnitsQty ?? 0),
  unitsPerPack: Number(item.unitsPerPack ?? 0),
  totalUnits: Number(item.totalUnits ?? 0),
  billableQty: Number(item.billableQty ?? 0),
  unitPrice: Number(item.unitPrice ?? 0),
  unitCost: Number(item.unitCost ?? 0),
});

const PurchaseFormPageContent: React.FC<Props> = ({ language, editingPurchase, defaultCategory, customCreateTitle, enableBoxSteelFields = false, enableWeightPricingFields = false, enableVolumePricingFields = false, editingDetail, onBack, onSubmit }) => {
  const t = purchaseFormTranslations[language];
  const isReadOnly = Boolean(editingPurchase && editingDetail && editingDetail.hasNonInitialPayments);
  const {
    boxPackagingUnitsLabel,
    boxUnitsPerPackLabel,
    showBoxSteelFields,
    showVolumePricingFields,
    showMeasurePricingFields,
    totalMeasureLabel,
    pricePerMeasureLabel,
  } = usePurchaseFormDisplay({
    enableBoxSteelFields,
    enableWeightPricingFields,
    enableVolumePricingFields,
    editingItems: editingDetail?.items,
    labels: {
      packagingUnitsQty: (t as Record<string, string>).packagingUnitsQty,
      bundleQty: t.bundleQty,
      unitsPerPack: (t as Record<string, string>).unitsPerPack,
      unitsPerBundle: t.unitsPerBundle,
      totalVolume: t.totalVolume,
      totalWeight: t.totalWeight,
      pricePerVolume: t.pricePerVolume,
      pricePerWeight: t.pricePerWeight,
    },
  });
  const today = new Date().toISOString().split('T')[0];
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
  const [suppliers, setSuppliers] = useState<SupplierInfo[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [products, setProducts] = useState<ProductDemo[]>([]);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Purchase info
  const [purchaseNumber, setPurchaseNumber] = useState(() => {
    if (editingPurchase?.purchaseNumber) return editingPurchase.purchaseNumber;
    return '';
  });
  const [date, setDate] = useState(() => {
    if (editingPurchase) return editingPurchase.date;
    return today;
  });
  const [status, setStatus] = useState<Purchase['status']>(() => {
    if (editingPurchase) return editingPurchase.status;
    return 'Ordered';
  });
  const [warehouseId, setWarehouseId] = useState<number>(() => {
    if (editingPurchase?.warehouseId) return editingPurchase.warehouseId;
    return 0;
  });

  // Supplier info
  const [supplier, setSupplier] = useState(() => {
    if (editingPurchase) {
      return {
        id: editingPurchase.supplierId,
        name: editingPurchase.supplierName,
        phone: '',
        address: '',
      };
    }
    return {
      id: 0,
      name: '',
      phone: '',
      address: '',
    };
  });

  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const warehouseData = await purchaseApi.listWarehouses();
        setWarehouses(warehouseData);
      } catch (error) {
        console.error('Failed to load warehouses:', error);
        setWarehouses([]);
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    void loadWarehouses();
  }, []);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const data = await purchaseApi.listSuppliers();
        setSuppliers(
          data.map((supplierItem) => ({
            id: supplierItem.id,
            name: supplierItem.name,
            phone: supplierItem.phone ?? '',
            address: supplierItem.address ?? '',
          }))
        );
      } catch (error) {
        console.error('Failed to load suppliers:', error);
        setSuppliers([]);
      } finally {
        setIsLoadingSuppliers(false);
      }
    };

    void loadSuppliers();
  }, []);

  useEffect(() => {
    if (editingPurchase) return;

    void fetchNextPurchaseNumber();
  }, [editingPurchase]);

  const fetchNextPurchaseNumber = async () => {
    try {
      const data = await purchaseApi.nextNumber();
      setPurchaseNumber(data.purchaseNumber);
    } catch (error) {
      console.error('Failed to load next purchase number:', error);
      setPurchaseNumber('');
    }
  };

  useEffect(() => {
    const loadProductsAndCategories = async () => {
      try {
        const [productData, categoryData] = await Promise.all([
          purchaseApi.listProducts(),
          purchaseApi.listCategories(),
        ]);

        setProducts(
          productData.map((productItem) => ({
            id: productItem.id,
            name: productItem.name,
            category: productItem.category ?? '',
            packagingUnit: productItem.packagingUnit ?? '',
            unit: productItem.unit,
            purchasePrice: Number(productItem.purchasePrice) || 0,
          }))
        );

        const categoriesFromProducts = productData
          .map((item) => item.category)
          .filter((value): value is string => Boolean(value && value.trim()));
        const categoriesFromApi = categoryData.map((item) => item.name);

        setProductCategories(Array.from(new Set([...categoriesFromApi, ...categoriesFromProducts])));
      } catch (error) {
        console.error('Failed to load products/categories:', error);
        setProducts([]);
        setProductCategories([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    void loadProductsAndCategories();
  }, []);

  useEffect(() => {
    setSupplier((prev) => {
      if (!prev.id) return prev;
      const selectedSupplier = suppliers.find((item) => item.id === prev.id);
      if (!selectedSupplier) return prev;

      if (
        prev.name === selectedSupplier.name &&
        prev.phone === selectedSupplier.phone &&
        prev.address === selectedSupplier.address
      ) {
        return prev;
      }

      return {
        id: selectedSupplier.id,
        name: selectedSupplier.name,
        phone: selectedSupplier.phone,
        address: selectedSupplier.address,
      };
    });
  }, [suppliers]);

  const filteredWarehouses = useMemo(() => warehouses, [warehouses]);

  useEffect(() => {
    if (!filteredWarehouses.some((item) => item.id === warehouseId)) {
      setWarehouseId(filteredWarehouses[0]?.id ?? 0);
    }
  }, [filteredWarehouses, warehouseId]);

  // Products
  const [items, setItems] = useState<PurchaseLineItem[]>(() => {
    if (editingPurchase && editingDetail) return editingDetail.items.map(normalizePurchaseLineItem);
    if (editingPurchase) return [];
    return [];
  });
  const [selectedCategory, setSelectedCategory] = useState(() => defaultCategory ?? 'all');
  const [productSearch, setProductSearch] = useState('');
  const supplierSelectRef = useRef<HTMLSelectElement | null>(null);
  // Always-current supplier id for use inside async Select2 init
  const supplierIdRef = useRef(supplier.id);
  supplierIdRef.current = supplier.id;

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  const searchFilteredProducts = useMemo(() => {
    if (!productSearch.trim()) return filteredProducts;
    const q = productSearch.toLowerCase();
    return filteredProducts.filter((p) => p.name.toLowerCase().includes(q) || (p.category ?? '').toLowerCase().includes(q));
  }, [filteredProducts, productSearch]);

  useEffect(() => {
    if (editingPurchase) return;
    if (!defaultCategory) return;
    setSelectedCategory(defaultCategory);
  }, [defaultCategory, editingPurchase]);

  // Summary
  const [discount, setDiscount] = useState(() => {
    if (editingPurchase && editingDetail) return editingDetail.discount > 0 ? String(editingDetail.discount) : '';
    if (editingPurchase) return '';
    return '';
  });
  const [paymentMade, setPaymentMade] = useState(() => {
    if (editingPurchase && editingDetail) return editingDetail.paymentMade > 0 ? String(editingDetail.paymentMade) : '';
    if (editingPurchase) return '';
    return '';
  });

  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!supplierSelectRef.current) return;

    let $select: JQuery<HTMLElement> | null = null;
    let initialized = false;

    const initSelect2 = async () => {
      try {
        const w = window as Window & { jQuery?: typeof $; $?: typeof $ };
        w.jQuery = $;
        w.$ = $;

        const select2Module = await import('select2/dist/js/select2.full.min.js');
        const select2Factory = (select2Module as unknown as { default?: (root: Window, jQuery: typeof $) => void }).default;
        if (typeof ($.fn as { select2?: unknown }).select2 !== 'function' && typeof select2Factory === 'function') {
          select2Factory(window, $);
        }

        if (!supplierSelectRef.current) return;
        $select = $(supplierSelectRef.current);

        if (typeof ($select as { select2?: unknown }).select2 !== 'function') {
          console.error('Select2 is loaded but not attached to jQuery.');
          return;
        }

        ($select as any).select2({
          placeholder: t.searchChooseSupplier,
          width: '100%',
          allowClear: true,
          minimumResultsForSearch: 0,
        });

        // Restore current supplier value after Select2 has initialized
        if (supplierIdRef.current) {
          $select.val(String(supplierIdRef.current)).trigger('change.select2');
        }

        $select.on('change', () => {
          const val = $select?.val() as string | null;
          const selectedId = Number(val) || 0;
          const selectedSupplier = suppliers.find((s) => s.id === selectedId);

          if (selectedSupplier) {
            setSupplier({
              id: selectedSupplier.id,
              name: selectedSupplier.name,
              phone: selectedSupplier.phone,
              address: selectedSupplier.address,
            });
          } else {
            setSupplier({ id: 0, name: '', phone: '', address: '' });
          }
        });

        $select.on('select2:open', () => {
          const searchInput = document.querySelector('.select2-container--open .select2-search__field') as HTMLInputElement | null;
          searchInput?.focus();
        });

        initialized = true;
      } catch (error) {
        console.error('Select2 initialization failed:', error);
      }
    };

    void initSelect2();

    return () => {
      if ($select) {
        $select.off('change');
        $select.off('select2:open');
        if (initialized && typeof ($select as any).select2 === 'function') {
          ($select as any).select2('destroy');
        }
      }
    };
  }, [suppliers, t.searchChooseSupplier]);

  useEffect(() => {
    if (!supplierSelectRef.current) return;
    const $select = $(supplierSelectRef.current);
    $select.val(supplier.id ? String(supplier.id) : '').trigger('change.select2');
  }, [supplier.id]);

  const subtotal = items.reduce(
    (sum, item) => sum + (showMeasurePricingFields ? item.billableQty * item.unitPrice : item.qty * item.unitCost),
    0
  );
  const discountAmount = Number(discount) || 0;
  const total = subtotal - discountAmount;
  const paymentAmount = Number(paymentMade) || 0;
  const change = paymentAmount - total;

  const addProductById = (productId: number) => {
    if (!productId) return;

    setItems((prev) => {
      if (prev.some((item) => item.productId === productId)) return prev;

      const product = products.find((p) => p.id === productId);
      if (!product) return prev;

      const nextId = prev.length > 0 ? Math.max(...prev.map((item) => item.id)) + 1 : 1;
      return [
        ...prev,
        {
          id: nextId,
          productId: product.id,
          productName: product.name,
          packagingUnit: product.packagingUnit,
          unit: product.unit,
          qty: 1,
          packagingUnitsQty: 0,
          unitsPerPack: 0,
          totalUnits: 0,
          billableQty: 0,
          unitPrice: 0,
          unitCost: product.purchasePrice,
        },
      ];
    });
  };

  const updateItem = (
    id: number,
    updates: Partial<Pick<PurchaseLineItem, 'qty' | 'packagingUnitsQty' | 'unitsPerPack' | 'totalUnits' | 'billableQty' | 'unitPrice' | 'unitCost'>>
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextItem = {
          ...item,
          ...updates,
        };

        if (showBoxSteelFields) {
          const packagingUnitsQty = Number(nextItem.packagingUnitsQty) || 0;
          const unitsPerPack = Number(nextItem.unitsPerPack) || 0;
          nextItem.totalUnits = packagingUnitsQty * unitsPerPack;
        }

        return {
          ...nextItem,
        };
      })
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const resetFormFields = async () => {
    setDate(today);
    setStatus('Ordered');
    setWarehouseId(0);
    setSupplier({ id: 0, name: '', phone: '', address: '' });
    setItems([]);
    setSelectedCategory(defaultCategory ?? 'all');
    setProductSearch('');
    setDiscount('');
    setPaymentMade('');
    if (!editingPurchase) {
      await fetchNextPurchaseNumber();
    }
  };

  const handlePrintPurchase = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!supplier.id) {
      setSubmitError(t.errorSelectSupplier);
      return;
    }
    if (!warehouseId) {
      setSubmitError(t.errorSelectWarehouse);
      return;
    }
    if (items.length === 0) {
      setSubmitError(t.errorNoItems);
      return;
    }

    setSubmitting(true);
    try {
      const saved = await onSubmit({
        purchaseNumber: purchaseNumber.trim(),
        supplierId: supplier.id,
        warehouseId,
        date,
        status,
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          unit: item.unit,
          qty: showBoxSteelFields ? item.totalUnits : showMeasurePricingFields ? item.billableQty : item.qty,
          ...(showMeasurePricingFields
            ? {
                billableQty: item.billableQty,
                unitPrice: item.unitPrice,
              }
            : {}),
          ...(showBoxSteelFields
            ? {
                packagingUnitsQty: item.packagingUnitsQty,
                unitsPerPack: item.unitsPerPack,
                totalUnits: item.totalUnits,
              }
            : {}),
          unitCost: showMeasurePricingFields ? item.unitPrice : item.unitCost,
        })),
        discount: discountAmount,
        paymentMade: paymentAmount,
      });
      if (!saved) {
        setSubmitError(t.errorSaveFailed);
      }
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-800">
          ← {t.backToList}
        </button>
        <span className="text-gray-300">|</span>
        <h3 className="text-lg font-semibold text-gray-900">
          {editingPurchase ? t.editPurchase : customCreateTitle ?? t.createNewPurchase}
        </h3>
      </div>

      {isReadOnly && (
        <div className="flex items-center gap-2 rounded border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          {t.readOnlyPaymentWarning}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* Purchase Info — full width, all fields in one row */}
        <div className="bg-white shadow-sm border border-gray-200 p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t.purchaseNo}</span>
              <p className="mt-1 block w-full border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {purchaseNumber || '...'}
              </p>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t.date}</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                readOnly={isReadOnly}
                className={`mt-1 block w-full border border-gray-300 px-3 py-2 text-sm ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'focus:border-indigo-500 focus:ring-indigo-500'}`}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t.status}</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Purchase['status'])}
                disabled={isReadOnly}
                className={`mt-1 block w-full border border-gray-300 px-3 py-2 text-sm ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'focus:border-indigo-500 focus:ring-indigo-500'}`}
              >
                <option value="Draft">{t.draft}</option>
                <option value="Ordered">{t.ordered}</option>
                <option value="Received">{t.received}</option>
                <option value="Cancelled">{t.cancelled}</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t.warehouse}</span>
              <select
                value={warehouseId || ''}
                onChange={(e) => setWarehouseId(Number(e.target.value) || 0)}
                disabled={isReadOnly}
                className={`mt-1 block w-full border border-gray-300 px-3 py-2 text-sm ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'focus:border-indigo-500 focus:ring-indigo-500'}`}
                required
              >
                <option value="">{isLoadingWarehouses ? t.loadingWarehouses : t.selectWarehouse}</option>
                {!isLoadingWarehouses && filteredWarehouses.length === 0 ? (
                  <option value="" disabled>
                    {t.noWarehouses}
                  </option>
                ) : null}
                {filteredWarehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.code} - {warehouse.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2.5 items-start">
          <div className="bg-white shadow-sm border border-gray-200 p-3 lg:col-span-1 lg:sticky lg:top-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t.selectProduct}</h4>
            <div className="space-y-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={isReadOnly}
                className={`block w-full border border-gray-300 px-3 py-2 text-sm ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'focus:border-indigo-500 focus:ring-indigo-500'}`}
              >
                <option value="all">{t.allCategories}</option>
                {productCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder={t.searchChooseProduct}
                disabled={isReadOnly}
                className={`block w-full border border-gray-300 px-3 py-2 text-sm ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'focus:border-indigo-500 focus:ring-indigo-500'}`}
              />
              <div className="overflow-y-auto max-h-[calc(100vh-260px)] border border-gray-200 divide-y divide-gray-100">
                {isLoadingProducts ? (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">{t.loadingProducts}</div>
                ) : searchFilteredProducts.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">{t.noProducts}</div>
                ) : (
                  searchFilteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addProductById(product.id)}
                      disabled={isReadOnly}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="font-medium text-gray-900 truncate">{product.name}</div>
                      {product.category && <div className="text-xs text-gray-400">{product.category}</div>}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2.5 lg:col-span-3">
            {/* Supplier Info */}
            <div className="bg-white shadow-sm border border-gray-200 p-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{t.supplierInfo}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{t.supplierName}</span>
                {isReadOnly ? (
                  <input
                    type="text"
                    value={supplier.name}
                    readOnly
                    className="mt-1 block w-full border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                  />
                ) : (
                  <select
                    ref={supplierSelectRef}
                    defaultValue=""
                    disabled={isLoadingSuppliers}
                    onChange={(e) => {
                      const selectedId = Number(e.target.value) || 0;
                      const selectedSupplier = suppliers.find((s) => s.id === selectedId);
                      if (selectedSupplier) {
                        setSupplier({
                          id: selectedSupplier.id,
                          name: selectedSupplier.name,
                          phone: selectedSupplier.phone,
                          address: selectedSupplier.address,
                        });
                      } else {
                        setSupplier({ id: 0, name: '', phone: '', address: '' });
                      }
                    }}
                    className="invoice-customer-select mt-1 block w-full border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">{isLoadingSuppliers ? t.loadingSuppliers : t.searchChooseSupplier}</option>
                    {!isLoadingSuppliers && suppliers.length === 0 ? (
                      <option value="" disabled>
                        {t.noSuppliers}
                      </option>
                    ) : null}
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">{t.phone}</span>
                <input
                  type="text"
                  value={supplier.phone}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                  placeholder="-"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-gray-700">{t.address}</span>
                <input
                  type="text"
                  value={supplier.address}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                  placeholder="-"
                />
              </label>
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 p-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{t.products}</h4>
            <div className="overflow-x-auto border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.product}</th>
                    {!showBoxSteelFields && (
                      <>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.unit}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.qty}</th>
                      </>
                    )}
                    {showBoxSteelFields && (
                      <>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{boxPackagingUnitsLabel}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{boxUnitsPerPackLabel}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.totalUnits}</th>
                      </>
                    )}
                    {showMeasurePricingFields && (
                      <>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{totalMeasureLabel}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{pricePerMeasureLabel}</th>
                      </>
                    )}
                    {!showMeasurePricingFields && (
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.unitCost}</th>
                    )}
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.total}</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.remove}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={showBoxSteelFields ? 8 : showMeasurePricingFields ? 7 : 6}
                        className="px-3 py-4 text-sm text-gray-500 text-center"
                      >
                        {t.noItems}
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 text-sm text-gray-900">{item.productName}</td>
                        {!showBoxSteelFields && <td className="px-3 py-2 text-right text-sm text-gray-700">{item.unit}</td>}
                        {!showBoxSteelFields && (
                          <td className="px-3 py-2 text-right text-sm">
                            <input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={(e) => updateItem(item.id, { qty: Math.max(1, Number(e.target.value) || 1) })}
                              readOnly={isReadOnly}
                              className={`w-24 text-right border border-gray-300 px-2 py-1 text-sm ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                            />
                          </td>
                        )}
                        {showBoxSteelFields && (
                          <>
                            <td className="px-3 py-2 text-right text-sm">
                              <div className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                                <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={item.packagingUnitsQty}
                                  onChange={(e) => updateItem(item.id, { packagingUnitsQty: Math.max(0, Number(e.target.value) || 0) })}
                                  readOnly={isReadOnly}
                                  className={`w-24 text-right border border-gray-300 px-2 py-1 text-sm ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                                />
                                <span className="text-xs text-gray-500">/ ({item.packagingUnit || '-'})</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right text-sm">
                              <div className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                                <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={item.unitsPerPack}
                                  onChange={(e) => updateItem(item.id, { unitsPerPack: Math.max(0, Number(e.target.value) || 0) })}
                                  readOnly={isReadOnly}
                                  className={`w-24 text-right border border-gray-300 px-2 py-1 text-sm ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                                />
                                <span className="text-xs text-gray-500">/ ({item.unit || '-'})</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right text-sm">
                              <div className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                                <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={item.totalUnits}
                                  readOnly
                                  className={`w-24 text-right border border-gray-300 px-2 py-1 text-sm ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                                />
                                <span className="text-xs text-gray-500">/ ({item.unit || '-'})</span>
                              </div>
                            </td>
                          </>
                        )}
                        {showMeasurePricingFields && (
                          <>
                            <td className="px-3 py-2 text-right text-sm">
                              <input
                                type="number"
                                min={0}
                                step={showVolumePricingFields ? 0.001 : 0.01}
                                value={item.billableQty}
                                onChange={(e) => updateItem(item.id, { billableQty: Math.max(0, Number(e.target.value) || 0) })}
                                readOnly={isReadOnly}
                                className={`w-24 text-right border border-gray-300 px-2 py-1 text-sm ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                              />
                            </td>
                            <td className="px-3 py-2 text-right text-sm">
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(item.id, { unitPrice: Math.max(0, Number(e.target.value) || 0) })}
                                readOnly={isReadOnly}
                                className={`w-24 text-right border border-gray-300 px-2 py-1 text-sm ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                              />
                            </td>
                          </>
                        )}
                        {!showMeasurePricingFields && (
                          <td className="px-3 py-2 text-right text-sm">
                            <div className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={item.unitCost}
                                onChange={(e) => updateItem(item.id, { unitCost: Math.max(0, Number(e.target.value) || 0) })}
                                readOnly={isReadOnly}
                                className={`w-28 text-right border border-gray-300 px-2 py-1 text-sm ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                              />
                              <span className="text-xs text-gray-500">/ (VNĐ)</span>
                            </div>
                          </td>
                        )}
                        <td className="px-3 py-2 text-right text-sm text-gray-900 text-right">
                          {formatVnd(showMeasurePricingFields ? item.billableQty * item.unitPrice : item.qty * item.unitCost)}
                        </td>
                        <td className="px-3 py-2 text-right text-sm text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            disabled={isReadOnly}
                            className="text-red-600 hover:text-red-800 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {t.remove}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
                </div>
              </div>

        <div className="bg-white shadow-sm border border-gray-200 p-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{t.summary}</h4>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">{t.discount}</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    readOnly={isReadOnly}
                    className={`mt-1 text-right block w-full border border-gray-300 px-3 py-2 text-sm ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'focus:border-indigo-500 focus:ring-indigo-500'}`}
                    placeholder="0.00"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">{t.paymentMade}</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={paymentMade}
                    onChange={(e) => setPaymentMade(e.target.value)}
                    readOnly={isReadOnly}
                    className={`mt-1 text-right block w-full border border-gray-300 px-3 py-2 text-sm ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'focus:border-indigo-500 focus:ring-indigo-500'}`}
                    placeholder="0.00"
                  />
                </label>
              </div>
              <div className="flex-1 space-y-1 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t.subtotal}</span>
                  <span className="font-medium text-gray-900">{formatVnd(subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">{t.discount}</span>
                  <span className="font-medium text-red-500">- {formatVnd(discountAmount)}</span>
                </div>
                <div className="flex justify-between py-3 border-b-2 border-gray-300">
                  <span className="font-semibold text-gray-800 text-base">{t.total}</span>
                  <span className="font-bold text-gray-900 text-base">{formatVnd(total)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t.payment}</span>
                  <span className="font-medium text-green-600">{formatVnd(paymentAmount)}</span>
                </div>
                <div className={`flex justify-between py-2 px-3 mt-1 ${change >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <span className={`font-semibold ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {change >= 0 ? t.change : t.balanceDue}
                  </span>
                  <span className={`font-bold text-base ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatVnd(Math.abs(change))}
                  </span>
                </div>
              </div>
            </div>
        </div>

        {/* Payment History */}
        {editingPurchase && editingDetail && editingDetail.payments.length > 0 && (
          <div className="bg-white shadow-sm border border-gray-200 p-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{t.paymentHistory}</h4>
            <div className="overflow-x-auto border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.paymentHistoryDate}</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.paymentHistoryAmount}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.paymentHistoryMethod}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.paymentHistoryReference}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.paymentHistoryNotes}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {editingDetail.payments.map((payment) => (
                    <tr key={payment.id} className={payment.isInitial ? 'bg-gray-50' : ''}>
                      <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">
                        {formatDateDMY(payment.date)}
                        {payment.isInitial && (
                          <span className="ml-2 inline-block text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">{t.paymentHistoryInitial}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm text-right font-medium text-green-700 whitespace-nowrap">{formatVnd(payment.amount)}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{payment.method}</td>
                      <td className="px-3 py-2 text-sm text-gray-500">{payment.reference ?? '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-500">{payment.notes ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        {submitError && (
          <div className="mb-2 flex items-center gap-2 rounded border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {submitError}
          </div>
        )}
        <div className="flex gap-3 pb-6">
          <button
            type="button"
            onClick={() => {
              void resetFormFields();
            }}
            className="px-6 py-2 text-sm font-semibold text-gray-700 bg-amber-100 hover:bg-amber-200"
          >
            {t.refreshForm}
          </button>
          <button
            type="button"
            onClick={handlePrintPurchase}
            className="px-6 py-2 text-sm font-semibold text-white bg-slate-600 hover:bg-slate-700"
          >
            {t.printPurchase}
          </button>
          {!isReadOnly && (
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? t.saving : (editingPurchase ? t.saveChanges : t.createPurchase)}
            </button>
          )}
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            {t.cancel}
          </button>
        </div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default PurchaseFormPageContent;
