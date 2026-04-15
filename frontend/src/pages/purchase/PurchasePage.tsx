import React from 'react';
import PurchasePageContent from '@/features/purchases/components/PurchasePageContent';
import type { Language } from '@/i18n/translations';

type PurchasesPanelProps = {
  language: Language;
  viewMode?: 'list' | 'add' | 'add-box-steel' | 'add-reinforcing-steel' | 'add-roofing-sheet' | 'add-wood-plank';
  onViewChange?: (tab: string) => void;
};

const PurchasePage: React.FC<PurchasesPanelProps> = ({ language, viewMode = 'list', onViewChange }) => (
  <PurchasePageContent language={language} viewMode={viewMode} onViewChange={onViewChange} />
);

export default PurchasePage;
