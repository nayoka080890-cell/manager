import BranchPage from '@/pages/branches/BranchPage';
import CustomerPanel from '@/pages/customer/CustomerPage';
import DashboardPanel from '@/pages/dashboard/DashboardPage';
import InvoicesPanel from '@/pages/invoices/InvoicesPage';
import AddNewProductPage from '@/pages/products/AddNewProductPage';
import CategoriesPanel from '@/pages/products/CategoriesPage';
import ProductsPanel, { type Product } from '@/pages/products/ProductsPage';
import PurchasePanel from '@/pages/purchase/PurchasePage';
import SupplierPanel from '@/pages/supplier/SupplierPage';
import UsersPanel from '@/pages/users/UsersPage';
import WarehousePage from '@/pages/warehouses/WarehousePage';
import type { Language } from '@/i18n/translations';

type TranslationDictionary = Record<string, string>;

type NavChildItem = { name: string; id: DashboardTabId };
export type NavItem = { name: string; id: DashboardTabId; icon: string; children?: NavChildItem[] };

export type DashboardTabId =
  | 'dashboard'
  | 'invoices'
  | 'invoices-add'
  | 'purchases'
  | 'purchases-add'
  | 'purchases-add-box-steel'
  | 'purchases-add-reinforcing-steel'
  | 'purchases-add-roofing-sheet'
  | 'purchases-add-wood-plank'
  | 'products'
  | 'products-add'
  | 'categories'
  | 'customers'
  | 'customers-add'
  | 'suppliers'
  | 'branches'
  | 'warehouses'
  | 'users'
  | 'users-add';

type ResolveDashboardContentArgs = {
  activeTab: DashboardTabId;
  language: Language;
  editingProduct: Product | null;
  onViewChange: (tab: string) => void;
  onEditProduct: (product: Product | null) => void;
};

export const buildDashboardNavigation = (t: TranslationDictionary): NavItem[] => [
  { name: t.dashboard, id: 'dashboard', icon: '📊' },
  {
    name: t.invoices,
    id: 'invoices',
    icon: '🧾',
    children: [
      { name: t.allInvoices, id: 'invoices' },
      { name: t.addInvoice, id: 'invoices-add' },
    ],
  },
  {
    name: t.purchases,
    id: 'purchases',
    icon: '🛒',
    children: [
      { name: t.allPurchases, id: 'purchases' },
      { name: t.addPurchase, id: 'purchases-add' },
      { name: t.purchaseBoxSteel, id: 'purchases-add-box-steel' },
      { name: t.purchaseReinforcingSteel, id: 'purchases-add-reinforcing-steel' },
      { name: t.purchaseRoofingSheet, id: 'purchases-add-roofing-sheet' },
      { name: t.purchaseWoodPlank, id: 'purchases-add-wood-plank' },
    ],
  },
  {
    name: t.products,
    id: 'products',
    icon: '📦',
    children: [
      { name: t.allProducts, id: 'products' },
      { name: t.addProduct, id: 'products-add' },
      { name: t.categories, id: 'categories' },
    ],
  },
  { name: t.customers, id: 'customers', icon: '👤' },
  { name: t.suppliers, id: 'suppliers', icon: '🏭' },
  { name: t.branches, id: 'branches', icon: '🏢' },
  { name: t.warehouses, id: 'warehouses', icon: '🏬' },
  {
    name: t.users,
    id: 'users',
    icon: '👥',
    children: [
      { name: t.allUsers, id: 'users' },
      { name: t.addUser, id: 'users-add' },
    ],
  },
];

export const resolveDashboardContent = ({
  activeTab,
  language,
  editingProduct,
  onViewChange,
  onEditProduct,
}: ResolveDashboardContentArgs) => {
  switch (activeTab) {
    case 'dashboard':
      return <DashboardPanel />;
    case 'products':
      return <ProductsPanel language={language} onViewChange={onViewChange} onEdit={(product) => onEditProduct(product)} />;
    case 'products-add':
      return <AddNewProductPage language={language} onViewChange={onViewChange} editingProduct={editingProduct} />;
    case 'categories':
      return <CategoriesPanel />;
    case 'users':
      return <UsersPanel language={language} viewMode="list" onViewChange={onViewChange} />;
    case 'users-add':
      return <UsersPanel language={language} viewMode="add" onViewChange={onViewChange} />;
    case 'invoices':
      return <InvoicesPanel language={language} viewMode="list" onViewChange={onViewChange} />;
    case 'invoices-add':
      return <InvoicesPanel language={language} viewMode="add" onViewChange={onViewChange} />;
    case 'customers':
      return <CustomerPanel language={language} viewMode="list" onViewChange={onViewChange} />;
    case 'customers-add':
      return <CustomerPanel language={language} viewMode="add" onViewChange={onViewChange} />;
    case 'suppliers':
      return <SupplierPanel language={language} />;
    case 'branches':
      return <BranchPage language={language} />;
    case 'warehouses':
      return <WarehousePage language={language} />;
    case 'purchases':
      return <PurchasePanel key={activeTab} language={language} viewMode="list" onViewChange={onViewChange} />;
    case 'purchases-add':
      return <PurchasePanel key={activeTab} language={language} viewMode="add" onViewChange={onViewChange} />;
    case 'purchases-add-box-steel':
      return <PurchasePanel key={activeTab} language={language} viewMode="add-box-steel" onViewChange={onViewChange} />;
    case 'purchases-add-reinforcing-steel':
      return <PurchasePanel key={activeTab} language={language} viewMode="add-reinforcing-steel" onViewChange={onViewChange} />;
    case 'purchases-add-roofing-sheet':
      return <PurchasePanel key={activeTab} language={language} viewMode="add-roofing-sheet" onViewChange={onViewChange} />;
    case 'purchases-add-wood-plank':
      return <PurchasePanel key={activeTab} language={language} viewMode="add-wood-plank" onViewChange={onViewChange} />;
    default:
      return <DashboardPanel />;
  }
};
