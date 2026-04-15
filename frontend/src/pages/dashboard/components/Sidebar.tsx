import React, { useEffect, useState } from 'react';

type NavItem = {
  name: string;
  id: string;
  icon: string;
  children?: { name: string; id: string }[];
};

type SidebarProps = {
  navigation: NavItem[];
  activeTab: string;
  onNavigate: (id: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user?: { name?: string; email?: string } | null;
  language: 'en' | 'vi';
  setLanguage: (language: 'en' | 'vi') => void;
  languageLabel: string;
};

const Sidebar: React.FC<SidebarProps> = ({
  navigation,
  activeTab,
  onNavigate,
  sidebarOpen,
  setSidebarOpen,
  user,
  language,
  setLanguage,
  languageLabel,
}) => {
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const parentWithActiveChild = navigation.find((item) => item.children?.some((child) => child.id === activeTab));
    if (parentWithActiveChild) {
      setExpandedParents((prev) => ({ ...prev, [parentWithActiveChild.id]: true }));
    }
  }, [activeTab, navigation]);

  const toggleParent = (id: string) => {
    setExpandedParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
  <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:w-64 lg:flex-shrink-0 lg:shadow-none lg:self-stretch h-screen lg:h-auto flex flex-col`}>
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center h-16 px-4 bg-white">
        <span className="text-lg font-bold text-gray-900">QH Manage</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-0">
        {navigation.map((item) => (
          <div key={item.id} className="space-y-0">
            <button
              onClick={() => {
                if (item.children?.length) {
                  toggleParent(item.id);
                  return;
                }
                onNavigate(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-0 py-2 text-sm rounded-lg transition-colors ${
                activeTab === item.id || item.children?.some((child) => child.id === activeTab)
                  ? 'font-bold text-gray-900'
                  : 'font-normal text-gray-600 hover:font-bold hover:text-gray-900'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
              {item.children?.length ? (
                <span className="ml-auto text-xs text-gray-500">{expandedParents[item.id] ? '▾' : '▸'}</span>
              ) : null}
            </button>

            {item.children && item.children.length > 0 && expandedParents[item.id] ? (
              <div className="ml-11 space-y-0">
                {item.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => {
                      onNavigate(child.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-0 py-0.5 text-sm rounded-md transition-colors ${
                      activeTab === child.id
                        ? 'font-bold text-gray-900'
                        : 'font-normal text-gray-600 hover:font-bold hover:text-gray-900'
                    }`}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </nav>

      <div className="px-4 pb-4">
        <label className="block">
          <span className="text-xs font-medium text-gray-600">{languageLabel}</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'vi')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="en">English</option>
            <option value="vi">Việt Nam</option>
          </select>
        </label>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Unknown User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'no-email@example.com'}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Sidebar;
