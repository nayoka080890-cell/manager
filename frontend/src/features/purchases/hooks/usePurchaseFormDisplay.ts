import { useMemo } from 'react';
import type { PurchaseLineItem } from '@/features/purchases/components/PurchaseFormPageContent';

type UsePurchaseFormDisplayOptions = {
  enableBoxSteelFields: boolean;
  enableWeightPricingFields: boolean;
  enableVolumePricingFields: boolean;
  editingItems?: PurchaseLineItem[];
  labels: {
    packagingUnitsQty: string;
    bundleQty: string;
    unitsPerPack: string;
    unitsPerBundle: string;
    totalVolume: string;
    totalWeight: string;
    pricePerVolume: string;
    pricePerWeight: string;
  };
};

export const usePurchaseFormDisplay = ({
  enableBoxSteelFields,
  enableWeightPricingFields,
  enableVolumePricingFields,
  editingItems,
  labels,
}: UsePurchaseFormDisplayOptions) => {
  return useMemo(() => {
    const boxPackagingUnitsLabel = labels.packagingUnitsQty ?? labels.bundleQty;
    const boxUnitsPerPackLabel = labels.unitsPerPack ?? labels.unitsPerBundle;

    const hasBoxSteelDataInEdit = Boolean(
      editingItems?.some((item) =>
        Number(item.packagingUnitsQty) > 0 || Number(item.unitsPerPack) > 0 || Number(item.totalUnits) > 0
      )
    );
    const hasWeightPricingDataInEdit = Boolean(
      editingItems?.some((item) => Number(item.billableQty) > 0 || Number(item.unitPrice) > 0)
    );
    const hasVolumeUnitInEdit = Boolean(
      editingItems?.some((item) => /m3|m\^3|m³|cubic/i.test(item.unit ?? ''))
    );

    const showBoxSteelFields = enableBoxSteelFields || hasBoxSteelDataInEdit;
    const showVolumePricingFields = enableVolumePricingFields || (hasVolumeUnitInEdit && !showBoxSteelFields);
    const showWeightPricingFields = !showVolumePricingFields && (enableWeightPricingFields || showBoxSteelFields || hasWeightPricingDataInEdit);
    const showMeasurePricingFields = showWeightPricingFields || showVolumePricingFields;
    const totalMeasureLabel = showVolumePricingFields ? labels.totalVolume : labels.totalWeight;
    const pricePerMeasureLabel = showVolumePricingFields ? labels.pricePerVolume : labels.pricePerWeight;

    return {
      boxPackagingUnitsLabel,
      boxUnitsPerPackLabel,
      showBoxSteelFields,
      showVolumePricingFields,
      showWeightPricingFields,
      showMeasurePricingFields,
      totalMeasureLabel,
      pricePerMeasureLabel,
    };
  }, [editingItems, enableBoxSteelFields, enableVolumePricingFields, enableWeightPricingFields, labels.bundleQty, labels.packagingUnitsQty, labels.pricePerVolume, labels.pricePerWeight, labels.totalVolume, labels.totalWeight, labels.unitsPerBundle, labels.unitsPerPack]);
};
