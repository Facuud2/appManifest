'use client';

import React from 'react';
import { App as KonstaApp } from 'konsta/react';
import { DashboardSkeleton } from '@/components/ui/LiquidSkeleton';

/**
 * Next.js App Router Suspense Streaming Fallback
 * Automatically displays instant Apple-style skeletons if any navigation or data fetch takes time.
 */
export default function Loading() {
  return (
    <KonstaApp theme="ios" safeAreas className="min-h-screen aura-bg">
      <div className="min-h-screen max-w-lg lg:max-w-4xl mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <DashboardSkeleton />
      </div>
    </KonstaApp>
  );
}
