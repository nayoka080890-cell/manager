import React from 'react';
import BranchPageContent from '@/features/branches/components/BranchPageContent';
import type { Language } from '@/i18n/translations';

type BranchPageProps = {
  language: Language;
};

const BranchPage: React.FC<BranchPageProps> = ({ language }) => <BranchPageContent language={language} />;

export default BranchPage;
