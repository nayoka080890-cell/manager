import React from 'react';
import AddNewPurchasePage, { type Purchase, type PurchaseInput, type PurchaseLineItem } from './AddNewPurchasePage';
import { type Language } from '../../i18n/translations';

type EditPurchasePageProps = {
  language: Language;
  editingPurchase: Purchase;
  defaultCategory?: string;
  enableBoxSteelFields?: boolean;
  enableWeightPricingFields?: boolean;
  enableVolumePricingFields?: boolean;
  editingDetail: {
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

const EditPurchasePage: React.FC<EditPurchasePageProps> = ({
  language,
  editingPurchase,
  defaultCategory,
  enableBoxSteelFields = false,
  enableWeightPricingFields = false,
  enableVolumePricingFields = false,
  editingDetail,
  onBack,
  onSubmit,
}) => {
  return (
    <AddNewPurchasePage
      language={language}
      editingPurchase={editingPurchase}
      defaultCategory={defaultCategory}
      enableBoxSteelFields={enableBoxSteelFields}
      enableWeightPricingFields={enableWeightPricingFields}
      enableVolumePricingFields={enableVolumePricingFields}
      editingDetail={editingDetail}
      onBack={onBack}
      onSubmit={onSubmit}
    />
  );
};

export default EditPurchasePage;
