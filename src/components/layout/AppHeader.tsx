'use client';

import React from 'react';
import { UserScopeSwitcher } from './UserScopeSwitcher';

interface AppHeaderProps {
  onOpenInstallGuide?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = () => {
  return (
    <header
      data-testid="dynamic-app-header"
      className="lg:hidden sticky top-0 z-40 w-full bg-manifest-surfaceNav/95 backdrop-blur-2xl border-b border-manifest-glassBorder px-3 py-2 transition-all shadow-glass flex items-center justify-center"
    >
      <div className="max-w-[280px] w-full flex items-center justify-center">
        <UserScopeSwitcher compact idPrefix="mobile-top-header" />
      </div>
    </header>
  );
};
