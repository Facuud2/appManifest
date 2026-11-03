'use client';

import React from 'react';
import { MobileTopHeader } from './MobileTopHeader';

interface AppHeaderProps {
  onOpenInstallGuide?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = () => {
  return <MobileTopHeader />;
};
