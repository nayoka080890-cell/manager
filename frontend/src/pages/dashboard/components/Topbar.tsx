import React from 'react';

type TopbarProps = {
  currentTitle: string;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
  logoutLabel: string;
  userName: string;
};

const Topbar: React.FC<TopbarProps> = ({ currentTitle, setSidebarOpen, onLogout, logoutLabel, userName }) => (
  <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 h-16 flex items-center lg:px-4">
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center w-full">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <p className="ml-2 lg:ml-0 text-xl font-semibold text-gray-900 capitalize text-left">{currentTitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-gray-700 truncate max-w-36 sm:max-w-48">{userName}</p>
        <button
          onClick={onLogout}
          aria-label={logoutLabel}
          title={logoutLabel}
          className="bg-red-600 hover:bg-red-700 text-white w-10 h-10 flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

export default Topbar;
