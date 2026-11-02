'use client';

import React from 'react';

export const ShimmerSweep: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-manifest-ink/10 to-transparent animate-shimmer pointer-events-none ${className}`}
  />
);

export const ManifestationCardSkeleton: React.FC = () => {
  return (
    <div
      data-testid="manifestation-skeleton"
      className="relative overflow-hidden p-3.5 sm:p-4 rounded-2xl glass-card border border-manifest-glassBorder shadow-sm space-y-2.5"
    >
      <ShimmerSweep />

      {/* Meta Top Line */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Drag Handle & Badge Placeholder */}
          <div className="w-5 h-3 rounded-md bg-manifest-ink/10" />
          <div className="w-14 h-4 rounded-full bg-manifest-glassControl" />
        </div>
        {/* Action icons placeholder */}
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-5 rounded-lg bg-manifest-glassControl" />
          <div className="w-5 h-5 rounded-lg bg-manifest-ink/10" />
          <div className="w-5 h-5 rounded-lg bg-manifest-ink/10" />
        </div>
      </div>

      {/* Content Text Lines */}
      <div className="space-y-1.5 pt-0.5">
        <div className="h-4 w-11/12 rounded-lg bg-manifest-ink/10" />
        <div className="h-4 w-3/4 rounded-lg bg-manifest-ink/10" />
      </div>
    </div>
  );
};

export const JournalCardSkeleton: React.FC = () => {
  return (
    <div
      data-testid="journal-skeleton"
      className="relative overflow-hidden p-3.5 sm:p-4 rounded-2xl glass-card border border-manifest-glassBorder border-l-[3.5px] border-l-manifest-auraPurple/50 shadow-sm space-y-2"
    >
      <ShimmerSweep />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-20 h-4 rounded-full bg-manifest-glassControl" />
          <div className="w-16 h-3 rounded-md bg-manifest-ink/10" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-lg bg-manifest-ink/10" />
          <div className="w-5 h-5 rounded-lg bg-manifest-ink/10" />
        </div>
      </div>

      <div className="space-y-1.5 pt-0.5">
        <div className="h-3.5 w-full rounded-md bg-manifest-ink/10" />
        <div className="h-3.5 w-4/5 rounded-md bg-manifest-ink/10" />
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 pt-1" data-testid="dashboard-loading-skeleton">
      {/* Greeting Banner Skeleton */}
      <div className="p-4 rounded-2xl glass-card border border-manifest-glassBorder space-y-2 relative overflow-hidden">
        <ShimmerSweep />
        <div className="w-32 h-3 rounded-full bg-manifest-ink/10" />
        <div className="w-56 h-7 rounded-xl bg-manifest-ink/15" />
      </div>

      {/* Segmented Control Skeleton */}
      <div className="flex p-1 rounded-2xl glass-card border border-manifest-glassBorder gap-1 relative overflow-hidden">
        <ShimmerSweep />
        <div className="flex-1 h-8 rounded-xl bg-manifest-glassControl" />
        <div className="flex-1 h-8 rounded-xl bg-manifest-ink/5" />
      </div>

      {/* Manifestation Cards Skeletons */}
      <div className="space-y-2">
        <ManifestationCardSkeleton />
        <ManifestationCardSkeleton />
        <ManifestationCardSkeleton />
      </div>

      {/* Journal Cards Skeletons */}
      <div className="space-y-2 pt-1">
        <JournalCardSkeleton />
        <JournalCardSkeleton />
      </div>
    </div>
  );
};
