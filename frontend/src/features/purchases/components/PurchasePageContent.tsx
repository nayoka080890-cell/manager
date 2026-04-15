import React, { useEffect, useMemo, useState } from 'react';
import PurchaseFormPageContent, { type Purchase, type PurchaseInput, type PurchaseLineItem } from '@/features/purchases/components/PurchaseFormPageContent';
import { purchaseApi } from '@/features/purchases/api/purchaseApi';
import { usePurchaseSpecialConfig } from '@/features/purchases/hooks/usePurchaseSpecialConfig';
import EditPurchasePage from '@/pages/purchase/EditPurchasePage';
import { purchaseTranslations, type Language } from '@/i18n/translations';
import { formatVnd } from '@/utils/formatCurrency';

type EditingDetail = {
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
};

type EditingDisplayConfig = {
  defaultCategory?: string;
  enableBoxSteelFields: boolean;
  enableWeightPricingFields: boolean;
  enableVolumePricingFields: boolean;
};

type PaymentTarget = {
  id: number;
  purchaseNumber: string;
  supplierName: string;
  total: number;
  paymentMade: number;
  balanceDue: number;
};

const initialPurchases: Purchase[] = [];

type PurchasesPanelProps = {
  language: Language;
  viewMode?: 'list' | 'add' | 'add-box-steel' | 'add-reinforcing-steel' | 'add-roofing-sheet' | 'add-wood-plank';
  onViewChange?: (tab: string) => void;
};

const statusBadge = (status: Purchase['status']) => {
  const styles: Record<Purchase['status'], string> = {
    Draft: 'bg-gray-100 text-gray-700',
    Ordered: 'bg-blue-100 text-blue-700',
    Received: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  };
  return styles[status];
};

const formatDateDMY = (dateString: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
};

const PurchasePageContent: React.FC<PurchasesPanelProps> = ({ language, viewMode = 'list', onViewChange }) => {
  const t = purchaseTranslations[language];
  const today = new Date().toISOString().split('T')[0];
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [editingDetail, setEditingDetail] = useState<EditingDetail | null>(null);
  const [editingDisplayConfig, setEditingDisplayConfig] = useState<EditingDisplayConfig>({
    defaultCategory: undefined,
    enableBoxSteelFields: false,
    enableWeightPricingFields: false,
    enableVolumePricingFields: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Purchase['status']>('all');
  const [createdDateFrom, setCreatedDateFrom] = useState(today);
  const [createdDateTo, setCreatedDateTo] = useState(today);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'supplier-asc' | 'supplier-desc' | 'amount-asc' | 'amount-desc'>('newest');
  const [paymentTarget, setPaymentTarget] = useState<PaymentTarget | null>(null);
  const [paymentDate, setPaymentDate] = useState(today);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  const loadPurchases = async () => {
    try {
      const data = await purchaseApi.list();
      setPurchases(data);
    } catch (error) {
      console.error('Failed to load purchases:', error);
    }
  };

  useEffect(() => {
    void loadPurchases();
  }, []);

  useEffect(() => {
    if (viewMode !== 'list') {
      setEditingPurchase(null);
      setEditingDetail(null);
      setEditingDisplayConfig({
        defaultCategory: undefined,
        enableBoxSteelFields: false,
        enableWeightPricingFields: false,
        enableVolumePricingFields: false,
      });
      setShowForm(true);
      return;
    }
    setEditingPurchase(null);
    setEditingDetail(null);
    setEditingDisplayConfig({
      defaultCategory: undefined,
      enableBoxSteelFields: false,
      enableWeightPricingFields: false,
      enableVolumePricingFields: false,
    });
    setShowForm(false);
  }, [viewMode]);

  const filteredPurchases = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const list = purchases.filter((item) => {
      const matchesSearch =
        !normalized ||
        item.purchaseNumber.toLowerCase().includes(normalized) ||
        item.supplierName.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCreatedFrom = !createdDateFrom || item.createdAt >= createdDateFrom;
      const matchesCreatedTo = !createdDateTo || item.createdAt <= createdDateTo;
      const matchesCreatedDate = matchesCreatedFrom && matchesCreatedTo;
      return matchesSearch && matchesStatus && matchesCreatedDate;
    });

    return list.slice().sort((a, b) => {
      if (sortBy === 'newest') return b.date.localeCompare(a.date);
      if (sortBy === 'oldest') return a.date.localeCompare(b.date);
      if (sortBy === 'supplier-asc') return a.supplierName.localeCompare(b.supplierName);
      if (sortBy === 'supplier-desc') return b.supplierName.localeCompare(a.supplierName);
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return b.amount - a.amount;
    });
  }, [createdDateFrom, createdDateTo, purchases, searchTerm, sortBy, statusFilter]);

  const goToList = () => {
    onViewChange?.('purchases');
    setShowForm(false);
    setEditingPurchase(null);
    setEditingDetail(null);
    setEditingDisplayConfig({
      defaultCategory: undefined,
      enableBoxSteelFields: false,
      enableWeightPricingFields: false,
      enableVolumePricingFields: false,
    });
  };

  const handleFormSubmit = async (input: PurchaseInput): Promise<boolean> => {
    try {
      const payload = {
        supplierId: input.supplierId,
        warehouseId: input.warehouseId,
        date: input.date,
        status: input.status,
        items: input.items,
        discount: input.discount,
        paymentMade: input.paymentMade,
      };

      if (editingPurchase) {
        const updated = await purchaseApi.update(editingPurchase.id, payload);
        setPurchases((prev) => prev.map((item) => (item.id === editingPurchase.id ? updated : item)));
        goToList();
      } else {
        const created = await purchaseApi.create(payload);
        setPurchases((prev) => [created, ...prev]);
        goToList();
        void loadPurchases();
      }
      return true;
    } catch (error) {
      console.error('Failed to save purchase:', error);
      return false;
    }
  };

  const handleEdit = async (purchase: Purchase) => {
    let detailData:
      | {
          warehouseId?: number | null;
          warehouseName?: string | null;
          items: Array<{
            id: number;
            productId: number;
            productName: string;
            unit: string;
            qty: number;
            packagingUnitsQty?: number | null;
            unitsPerPack?: number | null;
            totalUnits?: number | null;
            billableQty?: number | null;
            unitPrice?: number | null;
            unitCost: number;
          }>;
          discount: number;
          paymentMade: number;
          payments?: Array<{ id: number; date: string; amount: number; method: string; reference: string | null; notes: string | null; isInitial: boolean }>;
        }
      | null = null;

    try {
      detailData = await purchaseApi.detail(purchase.id);

      const payments = detailData.payments ?? [];
      const hasNonInitialPayments = payments.some((p) => !p.isInitial);

      setEditingDetail({
        items: detailData.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          unit: item.unit ?? '',
          qty: item.qty,
          packagingUnitsQty: Number(item.packagingUnitsQty ?? 0),
          unitsPerPack: Number(item.unitsPerPack ?? 0),
          totalUnits: Number(item.totalUnits ?? 0),
          billableQty: Number(item.billableQty ?? 0),
          unitPrice: Number(item.unitPrice ?? 0),
          unitCost: item.unitCost,
        })),
        discount: detailData.discount,
        paymentMade: detailData.paymentMade,
        hasNonInitialPayments,
        payments,
      });

      const productIds = Array.from(new Set(detailData.items.map((item) => item.productId).filter((id) => id > 0)));
      let defaultCategory: string | undefined;
      if (productIds.length > 0) {
        try {
          const allProducts = await purchaseApi.products();
          const categories = allProducts
            .filter((product) => productIds.includes(product.id))
            .map((product) => (product.category ?? '').trim().toLowerCase())
            .filter((value) => value.length > 0);
          defaultCategory = categories[0];

          const hasBoxSteelCategory = categories.some((category) => category.includes('box steel'));
          const hasReinforcingSteelCategory = categories.some((category) => category.includes('reinforcing steel'));
          const hasRoofingSheetCategory = categories.some((category) => category.includes('roofing sheet'));
          const hasWoodPlankCategory = categories.some((category) => category.includes('wood plank'));

          setEditingDisplayConfig({
            defaultCategory,
            enableBoxSteelFields: hasBoxSteelCategory || hasRoofingSheetCategory,
            enableWeightPricingFields: hasBoxSteelCategory || hasReinforcingSteelCategory || hasRoofingSheetCategory,
            enableVolumePricingFields: hasWoodPlankCategory,
          });
        } catch {
          setEditingDisplayConfig({
            defaultCategory,
            enableBoxSteelFields: false,
            enableWeightPricingFields: false,
            enableVolumePricingFields: false,
          });
        }
      } else {
        setEditingDisplayConfig({
          defaultCategory: undefined,
          enableBoxSteelFields: false,
          enableWeightPricingFields: false,
          enableVolumePricingFields: false,
        });
      }
    } catch (error) {
      console.error('Failed to load purchase details:', error);
      setEditingDetail({ items: [], discount: 0, paymentMade: 0, hasNonInitialPayments: false, payments: [] });
      setEditingDisplayConfig({
        defaultCategory: undefined,
        enableBoxSteelFields: false,
        enableWeightPricingFields: false,
        enableVolumePricingFields: false,
      });
    }
    setEditingPurchase({
      ...purchase,
      warehouseId: detailData?.warehouseId ?? purchase.warehouseId ?? null,
      warehouseName: detailData?.warehouseName ?? purchase.warehouseName ?? null,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await purchaseApi.remove(id);
      setPurchases((prev) => prev.filter((purchase) => purchase.id !== id));
    } catch (error) {
      console.error('Failed to delete purchase:', error);
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

  const handleOpenPayment = async (purchase: Purchase) => {
    try {
      const detail = await purchaseApi.getBalance(purchase.id);

      setPaymentTarget({
        id: purchase.id,
        purchaseNumber: purchase.purchaseNumber,
        supplierName: purchase.supplierName,
        total: Number(detail.total) || purchase.amount,
        paymentMade: Number(detail.paymentMade) || 0,
        balanceDue: Number(detail.balanceDue) || 0,
      });
      setPaymentDate(today);
      setPaymentAmount('');
      setPaymentMethod('Cash');
      setPaymentReference('');
      setPaymentNotes('');
      setPaymentError('');
    } catch (error) {
      console.error('Failed to load purchase balance:', error);
      setPaymentError('Failed to load purchase payment info.');
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

      const response = await purchaseApi.addPayment(paymentTarget.id, {
        date: paymentDate,
        amount: amountValue,
        method: paymentMethod,
        reference: paymentReference.trim() || null,
        notes: paymentNotes.trim() || null,
      });

      setPaymentTarget((prev) =>
        prev
          ? {
              ...prev,
              total: Number(response.purchase.total) || prev.total,
              paymentMade: Number(response.purchase.paymentMade) || prev.paymentMade,
              balanceDue: Number(response.purchase.balanceDue) || prev.balanceDue,
            }
          : prev
      );

      setPaymentAmount('');
      setPaymentReference('');
      setPaymentNotes('');

      if ((Number(response.purchase.balanceDue) || 0) <= 0) {
        closePaymentModal();
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? 'Failed to add payment.';
      setPaymentError(message);
      console.error('Failed to add payment:', error);
    } finally {
      setIsSavingPayment(false);
    }
  };

  const specialPurchaseConfig = usePurchaseSpecialConfig(viewMode, {
    boxSteel: t.boxSteel,
    reinforcingSteel: t.reinforcingSteel,
    roofingSheet: t.roofingSheet,
    woodPlank: t.woodPlank,
    createPurchaseFor: t.createPurchaseFor,
  });



  if (showForm) {
    if (editingPurchase) {
      return (
        <EditPurchasePage
          editingPurchase={editingPurchase}
          editingDetail={editingDetail}
          onSubmit={handleFormSubmit}
          onBack={goToList}
          language={language}
          defaultCategory={editingDisplayConfig.defaultCategory}
          enableBoxSteelFields={editingDisplayConfig.enableBoxSteelFields}
          enableWeightPricingFields={editingDisplayConfig.enableWeightPricingFields}
          enableVolumePricingFields={editingDisplayConfig.enableVolumePricingFields}
        />
      );
    }

    return (
      <PurchaseFormPageContent
        editingPurchase={null}
        editingDetail={null}
        onSubmit={handleFormSubmit}
        onBack={goToList}
        language={language}
        defaultCategory={specialPurchaseConfig?.category}
        customCreateTitle={specialPurchaseConfig ? `${t.createPurchaseFor} ${specialPurchaseConfig.title}` : undefined}
        enableBoxSteelFields={Boolean(specialPurchaseConfig?.enableBoxSteelFields)}
        enableWeightPricingFields={Boolean(specialPurchaseConfig?.enableWeightPricingFields)}
        enableVolumePricingFields={Boolean(specialPurchaseConfig?.enableVolumePricingFields)}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <button
          onClick={() => {
            setShowForm(true);
            onViewChange?.('purchases-add');
          }}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
        >
          + {t.createNewPurchase}
        </button>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{t.purchases}</h3>
          <p className="text-xs text-gray-500">({purchases.length} {t.purchase}{purchases.length !== 1 ? 's' : ''})</p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 p-3">
        {purchases.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            {t.noPurchasesYet}{' '}
            <button onClick={() => {
              setShowForm(true);
              onViewChange?.('purchases-add');
            }} className="text-indigo-600 hover:underline">
              {t.createFirstOne}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPurchases}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="date"
                value={createdDateFrom}
                onChange={(e) => setCreatedDateFrom(e.target.value)}
                aria-label={`${t.createdDate} from`}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="date"
                value={createdDateTo}
                onChange={(e) => setCreatedDateTo(e.target.value)}
                aria-label={`${t.createdDate} to`}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | Purchase['status'])}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">{t.allStatuses}</option>
                <option value="Draft">{t.draft}</option>
                <option value="Ordered">{t.ordered}</option>
                <option value="Received">{t.received}</option>
                <option value="Cancelled">{t.cancelled}</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'supplier-asc' | 'supplier-desc' | 'amount-asc' | 'amount-desc')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="newest">{t.sortBy}: {t.newest}</option>
                <option value="oldest">{t.sortBy}: {t.oldest}</option>
                <option value="supplier-asc">{t.sortBy}: {t.supplierAZ}</option>
                <option value="supplier-desc">{t.sortBy}: {t.supplierZA}</option>
                <option value="amount-asc">{t.sortBy}: {t.amountLowHigh}</option>
                <option value="amount-desc">{t.sortBy}: {t.amountHighLow}</option>
              </select>
              
            </div>
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.no}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.supplier}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.amount}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.paymentHistory}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.debt}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.date}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.status}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPurchases.map((purchase, index) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{purchase.supplierName}</td>
                    <td className="px-3 py-2 text-right text-sm text-gray-700">{formatVnd(purchase.amount)}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {purchase.payments && purchase.payments.length > 0 ? (
                        <div className="space-y-1">
                          {purchase.payments.map((payment) => (
                            <div key={payment.id} className="text-xs bg-blue-50 px-2 py-1 rounded">
                              <span className="font-medium">{formatVnd(payment.amount)}</span>
                              <span className="text-gray-500 ml-1">({formatDateDMY(payment.date)})</span>
                              {payment.isInitial && <span className="ml-1 text-gray-400">•</span>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No payments</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-medium text-red-600">{formatVnd(purchase.balanceDue ?? 0)}</td>
                    <td className="px-3 py-2 text-right text-sm text-gray-700">{formatDateDMY(purchase.date)}</td>
                    <td className="px-3 py-2 text-right text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusBadge(purchase.status)}`}>
                        {purchase.status === 'Draft' ? t.draft : purchase.status === 'Ordered' ? t.ordered : purchase.status === 'Received' ? t.received : t.cancelled}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-sm">
                      <button
                        onClick={() => {
                          void handleOpenPayment(purchase);
                        }}
                        disabled={purchase.status !== 'Received'}
                        aria-label={t.payment}
                        title={purchase.status !== 'Received' ? 'Only received purchases can be paid' : t.payment}
                        className={`inline-flex h-8 w-8 items-center justify-center text-white rounded mr-2 ${
                          purchase.status === 'Received'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-gray-400 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                          <path d="M3 10h18" />
                          <path d="M7 15h1" />
                          <path d="M11 15h4" />
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(purchase)}
                        aria-label={t.edit}
                        title={t.edit}
                        className="inline-flex h-8 w-8 items-center justify-center text-white bg-blue-600 rounded hover:bg-blue-700 mr-2"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(purchase.id)}
                        aria-label={t.delete}
                        title={t.delete}
                        className="inline-flex h-8 w-8 items-center justify-center text-white bg-red-600 rounded hover:bg-red-700"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 14H6L5 6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPurchases.length === 0 && (
                  <tr>
                    <td className="px-3 py-4 text-sm text-gray-500" colSpan={8}>{t.noPurchasesFound}</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-200">
          <button className="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200">
            Import Excel
          </button>
          <button className="px-3 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700">
            Export Excel
          </button>
        </div>
      </div>

      {paymentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-5 py-4">
              <h4 className="text-lg font-semibold text-gray-900">{t.addPayment}</h4>
              <p className="mt-1 text-sm text-gray-600">
                {paymentTarget.purchaseNumber} - {paymentTarget.supplierName}
              </p>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t.paymentDate}</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t.paymentAmount}</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t.paymentMethod}</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t.reference}</label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t.notes}</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span>Total:</span>
                  <span className="font-medium">{formatVnd(paymentTarget.total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t.paymentMade}:</span>
                  <span className="font-medium">{formatVnd(paymentTarget.paymentMade)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t.balanceDue}:</span>
                  <span className="font-semibold text-rose-700">{formatVnd(paymentTarget.balanceDue)}</span>
                </div>
              </div>

              {paymentError && <p className="text-sm text-red-600">{paymentError}</p>}
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button
                onClick={closePaymentModal}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                {t.close}
              </button>
              <button
                onClick={() => {
                  void handleSavePayment();
                }}
                disabled={isSavingPayment || paymentTarget.balanceDue <= 0}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingPayment ? t.saving : t.savePayment}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasePageContent;
