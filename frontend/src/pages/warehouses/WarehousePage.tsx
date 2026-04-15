import React from 'react';
import WarehousePageContent from '@/features/warehouses/components/WarehousePageContent';
import type { Language } from '@/i18n/translations';

type WarehousePageProps = {
  language: Language;
};

const WarehousePage: React.FC<WarehousePageProps> = ({ language }) => <WarehousePageContent language={language} />;

export default WarehousePage;
