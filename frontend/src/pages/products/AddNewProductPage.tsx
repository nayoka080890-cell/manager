import React from 'react';
import AddNewProductPageContent from '@/features/products/components/AddNewProductPageContent';
import type { Product } from '@/features/products/api/productApi';
import type { Language } from '@/i18n/translations';

type AddNewProductPageProps = {
  language: Language;
  onViewChange?: (tab: string) => void;
  editingProduct?: Product | null;
};

const AddNewProductPage: React.FC<AddNewProductPageProps> = ({ language, onViewChange, editingProduct }) => (
  <AddNewProductPageContent language={language} onViewChange={onViewChange} editingProduct={editingProduct} />
);

export default AddNewProductPage;
