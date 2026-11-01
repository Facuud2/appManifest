'use client';

import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface LiquidEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  badge?: string;
}

export const LiquidEmptyState: React.FC<LiquidEmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  badge = 'Espacio fértil',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl glass-card border border-white/95 shadow-glass text-center space-y-4 ${className}`}
      data-testid="liquid-empty-state"
    >
      {/* Subtle atmospheric glow behind icon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-gradient-to-tr from-manifest-pink/25 via-manifest-lavender/30 to-manifest-celeste/25 blur-3xl pointer-events-none" />

      {/* Mystical Icon Container */}
      <div className="relative z-10 w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-white via-white/80 to-manifest-lavender/30 border border-white/90 shadow-sm flex items-center justify-center">
        <Icon className="w-6 h-6 text-manifest-auraPurple" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-manifest-pink animate-pulse" />
      </div>

      {/* Copy */}
      <div className="relative z-10 space-y-1.5 max-w-sm mx-auto">
        <div className="inline-block px-2.5 py-0.5 rounded-full bg-manifest-lavender/40 border border-manifest-auraPurple/20 text-[10px] font-semibold text-manifest-auraPurple uppercase tracking-wider mb-1">
          {badge}
        </div>
        <h4 className="font-serif text-base sm:text-lg font-bold text-manifest-ink">
          {title}
        </h4>
        <p className="text-xs text-manifest-inkMuted leading-relaxed">
          {description}
        </p>
      </div>

      {/* Single Clear Next-Step CTA */}
      {actionLabel && onAction && (
        <div className="relative z-10 pt-1">
          <button
            type="button"
            onClick={onAction}
            className="px-5 py-2.5 rounded-2xl primary-gradient-btn text-xs font-semibold shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
            data-testid="empty-state-cta"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};
