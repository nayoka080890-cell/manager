import React from 'react';
import ProductsPageContent from '@/features/products/components/ProductsPageContent';
import type { Product } from '@/features/products/api/productApi';
import type { Category } from '@/features/products/api/productApi';
import type { Language } from '@/i18n/translations';

type ProductsPanelProps = {
  language: Language;
  onViewChange?: (tab: string) => void;
  onEdit?: (product: Product | null) => void;
};

const ProductsPanel: React.FC<ProductsPanelProps> = ({ language, onViewChange, onEdit }) => (
  <ProductsPageContent language={language} onViewChange={onViewChange} onEdit={onEdit} />
);

export type { Product, Category };

export default ProductsPanel;
