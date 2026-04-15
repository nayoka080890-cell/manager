import React from 'react';
import PurchaseFormPageContent from '@/features/purchases/components/PurchaseFormPageContent';
import type { Language } from '@/i18n/translations';
import type { Purchase, PurchaseInput, PurchaseLineItem } from '@/features/purchases/components/PurchaseFormPageContent';

type AddNewPurchasePageProps = {
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

const AddNewPurchasePage: React.FC<AddNewPurchasePageProps> = (props) => <PurchaseFormPageContent {...props} />;

export type { Purchase, PurchaseInput, PurchaseLineItem };

export default AddNewPurchasePage;
