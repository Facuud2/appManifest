'use client';

import React, { useState } from 'react';
import { TrackingView } from '@/features/tracking/TrackingView';
import { ReleaseRitual } from '@/features/release/ReleaseRitual';
import { SettingsView } from '@/features/settings/SettingsView';
import { Compass, Flame, Award, Settings, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

type SpaceSubTab = 'tracking' | 'release' | 'settings';

export const MySpaceView: React.FC = () => {
  const [subTab, setSubTab] = useState<SpaceSubTab>('tracking');

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Top Header */}
      <div className="px-1">
        <h2 className="text-xl font-serif font-bold text-manifest-ink flex items-center gap-2">
          <Compass className="w-5 h-5 text-manifest-auraPurple" />
          Mi Espacio Sagrado
        </h2>
        <p className="text-xs text-manifest-inkMuted">
          Reconocimiento, liberación y configuración íntima
        </p>
      </div>

      {/* Sub Tabs Segmented Control */}
      <div className="flex p-1 rounded-2xl glass-card border border-white/80">
        <button
          onClick={() => setSubTab('tracking')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            subTab === 'tracking'
              ? 'bg-manifest-ink text-white shadow-sm'
              : 'text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Seguimiento</span>
        </button>

        <button
          onClick={() => setSubTab('release')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            subTab === 'release'
              ? 'bg-manifest-ink text-white shadow-sm'
              : 'text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Liberación</span>
        </button>

        <button
          onClick={() => setSubTab('settings')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            subTab === 'settings'
              ? 'bg-manifest-ink text-white shadow-sm'
              : 'text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Ajustes</span>
        </button>
      </div>

      {/* Active Tab View */}
      <div>
        {subTab === 'tracking' && <TrackingView />}
        {subTab === 'release' && <ReleaseRitual />}
        {subTab === 'settings' && <SettingsView />}
      </div>
    </div>
  );
};
