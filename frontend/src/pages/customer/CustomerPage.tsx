import React from 'react';
import CustomerPageContent from '@/features/customers/components/CustomerPageContent';
import type { Language } from '@/i18n/translations';

type CustomersPanelProps = {
  language: Language;
  viewMode?: 'list' | 'add';
  onViewChange?: (tab: string) => void;
};

const CustomerPage: React.FC<CustomersPanelProps> = ({ language, viewMode = 'list', onViewChange }) => (
  <CustomerPageContent language={language} viewMode={viewMode} onViewChange={onViewChange} />
);

export default CustomerPage;
