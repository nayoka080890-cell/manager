import React from 'react';
import SupplierPageContent from '@/features/suppliers/components/SupplierPageContent';
import type { Language } from '@/i18n/translations';

type SuppliersPanelProps = {
  language: Language;
};

const SupplierPage: React.FC<SuppliersPanelProps> = ({ language }) => <SupplierPageContent language={language} />;

export default SupplierPage;
