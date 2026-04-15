import { useEffect, useMemo, useState } from 'react';
import { productApi, type Product } from '@/features/products/api/productApi';

const emptyInput = {
  name: '',
  displayName: '',
  sku: '',
  specifications: '',
  thinkness: '',
  weight: '',
  description: '',
  unit: '',
  packagingUnit: '',
  unitsPerPack: '',
  billableUnit: '',
  purchasePrice: '',
  sellingPrice: '',
  category: '',
};

type UseAddNewProductPageOptions = {
  editingProduct?: Product | null;
  onViewChange?: (tab: string) => void;
};

export const useAddNewProductPage = ({ editingProduct, onViewChange }: UseAddNewProductPageOptions) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [productInput, setProductInput] = useState(emptyInput);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await productApi.listCategories();
        setCategories(data.map((item) => item.name));
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    void loadCategories();
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setProductInput({
        name: editingProduct.name,
        displayName: editingProduct.displayName ?? '',
        sku: editingProduct.sku ?? '',
        specifications: editingProduct.specifications ?? '',
        thinkness: editingProduct.thinkness ?? '',
        weight: editingProduct.weight !== null && editingProduct.weight !== undefined ? editingProduct.weight.toString() : '',
        description: editingProduct.description ?? '',
        unit: editingProduct.unit,
        packagingUnit: editingProduct.packagingUnit ?? '',
        unitsPerPack: editingProduct.unitsPerPack !== null && editingProduct.unitsPerPack !== undefined
          ? editingProduct.unitsPerPack.toString()
          : '',
        billableUnit: editingProduct.billableUnit ?? '',
        purchasePrice: editingProduct.purchasePrice.toString(),
        sellingPrice: editingProduct.sellingPrice.toString(),
        category: editingProduct.category ?? '',
      });
    } else {
      setProductInput(emptyInput);
    }
  }, [editingProduct]);

  const availableCategories = useMemo(() => {
    if (editingProduct?.category && !categories.includes(editingProduct.category)) {
      return [...categories, editingProduct.category];
    }
    return categories;
  }, [categories, editingProduct]);

  const handleSubmit = async () => {
    if (!productInput.name || !productInput.unit) return;

    const payload = {
      name: productInput.name,
      displayName: productInput.displayName || undefined,
      sku: productInput.sku || undefined,
      specifications: productInput.specifications,
      thinkness: productInput.thinkness || undefined,
      weight: productInput.weight === '' ? undefined : Number(productInput.weight),
      description: productInput.description || undefined,
      unit: productInput.unit,
      packagingUnit: productInput.packagingUnit || undefined,
      unitsPerPack: productInput.unitsPerPack === '' ? undefined : Number(productInput.unitsPerPack),
      billableUnit: productInput.billableUnit || undefined,
      purchasePrice: Number(productInput.purchasePrice),
      sellingPrice: Number(productInput.sellingPrice),
      category: productInput.category,
    };

    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, payload);
      } else {
        await productApi.create(payload);
      }
      onViewChange?.('products');
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  return {
    productInput,
    availableCategories,
    setProductInput,
    handleSubmit,
  };
};
