import React, { useState } from 'react';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { dashboardTranslations, type Language } from '@/i18n/translations';
import Sidebar from '@/pages/dashboard/components/Sidebar';
import Topbar from '@/pages/dashboard/components/Topbar';
import type { Product } from '@/pages/products/ProductsPage';
import { buildDashboardNavigation, resolveDashboardContent, type DashboardTabId } from '@/router/dashboardRoutes';
import { useAppStore } from '@/stores/appStore';

const AdminDashboard: React.FC = () => {
  const { user } = useAppStore();
  const { logout } = useAuthActions();
  const [activeTab, setActiveTab] = useState<DashboardTabId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('vi');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const t = dashboardTranslations[language];
  const navigation = buildDashboardNavigation(t);

  const handleViewChange = (newTab: DashboardTabId) => {
    if (newTab !== 'products-add') {
      setEditingProduct(null);
    }

    setActiveTab(newTab);
  };

  const currentTitle =
    navigation.find((item) => item.id === activeTab)?.name ||
    navigation.flatMap((item) => item.children ?? []).find((child) => child.id === activeTab)?.name ||
    t.dashboard;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}
      <Sidebar
        navigation={navigation}
        activeTab={activeTab}
        onNavigate={(id: string) => setActiveTab(id as DashboardTabId)}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        language={language}
        setLanguage={setLanguage}
        languageLabel={t.language}
      />
      <div className="flex flex-col flex-1 lg:overflow-hidden">
        <Topbar
          currentTitle={currentTitle}
          onLogout={logout}
          setSidebarOpen={setSidebarOpen}
          logoutLabel={t.logout}
          userName={user?.name || 'Unknown User'}
        />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto px-2 py-2">
            {resolveDashboardContent({
              activeTab,
              language,
              editingProduct,
              onViewChange: (tab) => handleViewChange(tab as DashboardTabId),
              onEditProduct: setEditingProduct,
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
