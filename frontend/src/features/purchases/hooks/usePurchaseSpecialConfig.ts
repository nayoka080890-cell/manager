import { useMemo } from 'react';

type ViewMode = 'list' | 'add' | 'add-box-steel' | 'add-reinforcing-steel' | 'add-roofing-sheet' | 'add-wood-plank';

type PurchaseLabels = {
  boxSteel: string;
  reinforcingSteel: string;
  roofingSheet: string;
  woodPlank: string;
  createPurchaseFor: string;
};

export const usePurchaseSpecialConfig = (viewMode: ViewMode, labels: PurchaseLabels) => {
  return useMemo(() => {
    if (viewMode === 'add-box-steel') {
      return {
        category: 'Box steel',
        title: labels.boxSteel,
        enableBoxSteelFields: true,
        enableWeightPricingFields: true,
        enableVolumePricingFields: false,
      };
    }

    if (viewMode === 'add-reinforcing-steel') {
      return {
        category: 'Reinforcing steel',
        title: labels.reinforcingSteel,
        enableBoxSteelFields: false,
        enableWeightPricingFields: true,
        enableVolumePricingFields: false,
      };
    }

    if (viewMode === 'add-roofing-sheet') {
      return {
        category: 'Roofing sheet',
        title: labels.roofingSheet,
        enableBoxSteelFields: true,
        enableWeightPricingFields: true,
        enableVolumePricingFields: false,
      };
    }

    if (viewMode === 'add-wood-plank') {
      return {
        category: 'Wood plank',
        title: labels.woodPlank,
        enableBoxSteelFields: false,
        enableWeightPricingFields: false,
        enableVolumePricingFields: true,
      };
    }

    return null;
  }, [labels.boxSteel, labels.createPurchaseFor, labels.reinforcingSteel, labels.roofingSheet, labels.woodPlank, viewMode]);
};
