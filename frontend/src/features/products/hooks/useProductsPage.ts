import { useEffect, useMemo, useState } from 'react';
import { productApi, type Product } from '@/features/products/api/productApi';

export const useProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'>('newest');
  const [isImporting, setIsImporting] = useState(false);

  const loadData = async () => {
    try {
      const [productData, categoryData] = await Promise.all([
        productApi.list(),
        productApi.listCategories(),
      ]);

      setProducts(productData);
      setCategories(categoryData.map((item) => item.name));
    } catch (error) {
      console.error('Failed to load product data:', error);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const availableCategories = useMemo(() => {
    const categoryNamesFromProducts = products
      .map((item) => item.category)
      .filter((name) => name && name.trim() !== '');

    return Array.from(new Set([...categories, ...categoryNamesFromProducts]));
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    const normalizedName = nameFilter.trim().toLowerCase();
    const list = products.filter((item) => {
      const matchesName =
        !normalizedName ||
        item.name.toLowerCase().includes(normalizedName) ||
        (item.displayName ?? '').toLowerCase().includes(normalizedName) ||
        (item.sku ?? '').toLowerCase().includes(normalizedName) ||
        (item.description ?? '').toLowerCase().includes(normalizedName);
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesName && matchesCategory;
    });

    return list.slice().sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
      if (sortBy === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
      return b.sellingPrice - a.sellingPrice;
    });
  }, [categoryFilter, nameFilter, products, sortBy]);

  const handleDelete = async (id: number) => {
    try {
      await productApi.remove(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleImport = async (file: File) => {
    if (!file) return;

    try {
      setIsImporting(true);
      await productApi.importExcel(file);
      await loadData();
    } catch (error) {
      console.error('Failed to import products:', error);
    } finally {
      setIsImporting(false);
    }
  };

  return {
    products,
    nameFilter,
    categoryFilter,
    sortBy,
    isImporting,
    availableCategories,
    filteredProducts,
    setNameFilter,
    setCategoryFilter,
    setSortBy,
    handleDelete,
    handleImport,
  };
};
