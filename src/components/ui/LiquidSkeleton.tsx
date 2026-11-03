'use client';

import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * Apple Design Liquid Glass Skeleton Theme
 * Calibrated with soft translucent lavender base and crisp specular highlight sweeps.
 */
export const AppleSkeletonTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SkeletonTheme
      baseColor="rgba(235, 230, 252, 0.65)"
      highlightColor="rgba(255, 255, 255, 0.95)"
      duration={1.5}
      borderRadius="0.875rem"
    >
      {children}
    </SkeletonTheme>
  );
};

export const ManifestationCardSkeleton: React.FC = () => {
  return (
    <AppleSkeletonTheme>
      <div
        data-testid="manifestation-skeleton"
        className="relative overflow-hidden p-3.5 sm:p-5 rounded-xl sm:rounded-3xl glass-card border border-manifest-glassBorder shadow-glass space-y-3 select-none"
      >
        {/* Top Header Line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton width={18} height={18} circle />
            <Skeleton width={70} height={20} borderRadius="9999px" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton width={44} height={22} borderRadius="9999px" />
            <Skeleton width={26} height={26} circle />
          </div>
        </div>

        {/* Content Affirmation Lines */}
        <div className="space-y-1.5 pt-1">
          <Skeleton height={20} width="92%" />
          <Skeleton height={18} width="65%" />
        </div>
      </div>
    </AppleSkeletonTheme>
  );
};

export const JournalCardSkeleton: React.FC = () => {
  return (
    <AppleSkeletonTheme>
      <div
        data-testid="journal-skeleton"
        className="relative overflow-hidden p-4 sm:p-5 rounded-2xl sm:rounded-3xl glass-card border border-manifest-glassBorder border-l-4 border-l-purple-400/70 shadow-glass space-y-2.5 select-none"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton width={80} height={22} borderRadius="9999px" />
            <Skeleton width={90} height={16} borderRadius="6px" />
          </div>
          <Skeleton width={24} height={24} circle />
        </div>

        <div className="pt-0.5 space-y-1.5">
          <Skeleton height={22} width="85%" />
          <Skeleton height={16} count={2} width="98%" />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Skeleton width={50} height={18} borderRadius="9999px" />
          <Skeleton width={60} height={18} borderRadius="9999px" />
        </div>
      </div>
    </AppleSkeletonTheme>
  );
};

export const RampageCardSkeleton: React.FC = () => {
  return (
    <AppleSkeletonTheme>
      <div
        data-testid="rampage-card-skeleton"
        className="w-full relative p-6 sm:p-9 rounded-3xl sm:rounded-[2rem] liquid-glass-surface shadow-liquid flex flex-col justify-between min-h-[220px] sm:min-h-[250px] overflow-hidden"
      >
        <span
          aria-hidden="true"
          className="absolute top-3.5 left-4 font-serif text-3xl sm:text-4xl text-manifest-ink/10 select-none"
        >
          “
        </span>
        <span
          aria-hidden="true"
          className="absolute bottom-3.5 right-4 font-serif text-3xl sm:text-4xl text-manifest-ink/10 select-none"
        >
          ”
        </span>

        {/* Top bar */}
        <div className="flex items-center justify-between relative z-10">
          <Skeleton width={110} height={20} borderRadius="9999px" />
          <Skeleton width={45} height={20} borderRadius="9999px" />
        </div>

        {/* Center quote */}
        <div className="my-auto py-5 space-y-2 text-center flex flex-col items-center relative z-10 w-full">
          <Skeleton height={26} width="78%" />
          <Skeleton height={22} width="52%" />
          <div className="pt-2">
            <Skeleton height={14} width={220} borderRadius="9999px" />
          </div>
        </div>

        {/* Bottom indicator */}
        <div className="flex justify-center relative z-10">
          <Skeleton width={140} height={12} borderRadius="9999px" />
        </div>
      </div>
    </AppleSkeletonTheme>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <AppleSkeletonTheme>
      <div className="space-y-4 pt-1 w-full" data-testid="dashboard-loading-skeleton">
        {/* Greeting Banner Skeleton */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl glass-card border border-manifest-glassBorder space-y-2.5 relative overflow-hidden shadow-glass">
          <Skeleton width={130} height={16} borderRadius="9999px" />
          <Skeleton width={260} height={32} borderRadius="0.75rem" />
        </div>

        {/* Mode Segmented Control Skeleton */}
        <div className="flex p-1 rounded-full glass-card border border-manifest-glassBorder gap-1 relative overflow-hidden shadow-xs">
          <div className="flex-1">
            <Skeleton height={34} borderRadius="9999px" />
          </div>
          <div className="flex-1">
            <Skeleton height={34} borderRadius="9999px" />
          </div>
        </div>

        {/* Manifestation Cards Skeletons */}
        <div className="space-y-2.5">
          <ManifestationCardSkeleton />
          <ManifestationCardSkeleton />
          <ManifestationCardSkeleton />
        </div>

        {/* Journal Cards Skeletons */}
        <div className="space-y-2.5 pt-1">
          <JournalCardSkeleton />
          <JournalCardSkeleton />
        </div>
      </div>
    </AppleSkeletonTheme>
  );
};
