import React from 'react';
import UsersPageContent from '@/features/users/components/UsersPageContent';
import type { Language } from '@/i18n/translations';

type UsersPanelProps = {
  language: Language;
  viewMode?: 'list' | 'add';
  onViewChange?: (tab: string) => void;
};

const UsersPanel: React.FC<UsersPanelProps> = ({ language, viewMode = 'list', onViewChange }) => (
  <UsersPageContent language={language} viewMode={viewMode} onViewChange={onViewChange} />
);

export default UsersPanel;
