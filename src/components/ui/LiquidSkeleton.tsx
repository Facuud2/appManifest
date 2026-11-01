'use client';

import React from 'react';

export const ShimmerSweep: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer pointer-events-none ${className}`}
  />
);

export const ManifestationCardSkeleton: React.FC = () => {
  return (
    <div
      data-testid="manifestation-skeleton"
      className="relative overflow-hidden p-4 sm:p-4.5 rounded-3xl glass-card border border-white/80 shadow-sm space-y-3"
    >
      <ShimmerSweep />

      {/* Meta Top Line */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Drag Handle & Badge Placeholder */}
          <div className="w-5 h-3 rounded-md bg-manifest-ink/10" />
          <div className="w-14 h-4 rounded-full bg-manifest-lavender/40" />
        </div>
        {/* Action icons placeholder */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-manifest-ink/10" />
          <div className="w-4 h-4 rounded-full bg-manifest-ink/10" />
          <div className="w-8 h-4 rounded-full bg-manifest-peach/40" />
          <div className="w-4 h-4 rounded-full bg-manifest-ink/10" />
        </div>
      </div>

      {/* Content Text Lines */}
      <div className="space-y-2 pt-1">
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
      className="relative overflow-hidden p-4 rounded-2xl sm:rounded-3xl glass-card border border-white/80 border-l-[4px] border-l-manifest-auraPurple/30 shadow-sm space-y-2.5"
    >
      <ShimmerSweep />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-24 h-4 rounded-full bg-manifest-lavender/40" />
          <div className="w-16 h-3 rounded-md bg-manifest-ink/10" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-manifest-ink/10" />
          <div className="w-4 h-4 rounded-full bg-manifest-ink/10" />
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <div className="h-3.5 w-full rounded-md bg-manifest-ink/10" />
        <div className="h-3.5 w-4/5 rounded-md bg-manifest-ink/10" />
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pt-2" data-testid="dashboard-loading-skeleton">
      {/* Greeting Banner Skeleton */}
      <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/90 space-y-2 relative overflow-hidden">
        <ShimmerSweep />
        <div className="w-32 h-3 rounded-full bg-manifest-ink/10" />
        <div className="w-56 h-7 rounded-xl bg-manifest-ink/15" />
      </div>

      {/* Segmented Control Skeleton */}
      <div className="flex p-1 rounded-2xl glass-card border border-white/80 gap-1 relative overflow-hidden">
        <ShimmerSweep />
        <div className="flex-1 h-9 rounded-xl bg-white/70" />
        <div className="flex-1 h-9 rounded-xl bg-white/40" />
      </div>

      {/* Manifestation Cards Skeletons */}
      <div className="space-y-2.5">
        <ManifestationCardSkeleton />
        <ManifestationCardSkeleton />
        <ManifestationCardSkeleton />
      </div>

      {/* Journal Cards Skeletons */}
      <div className="space-y-2.5 pt-2">
        <JournalCardSkeleton />
        <JournalCardSkeleton />
      </div>
    </div>
  );
};
