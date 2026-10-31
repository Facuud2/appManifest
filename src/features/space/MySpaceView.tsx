'use client';

import React, { useState } from 'react';
import { TrackingView } from '@/features/tracking/TrackingView';
import { SignsView } from '@/features/signs/SignsView';
import { ReleaseRitual } from '@/features/release/ReleaseRitual';
import { SettingsView } from '@/features/settings/SettingsView';
import { Compass, Flame, Award, Settings, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store';

type SpaceSubTab = 'tracking' | 'signs' | 'release' | 'settings';

export const MySpaceView: React.FC = () => {
  const [subTab, setSubTab] = useState<SpaceSubTab>('tracking');
  const { manifestationSigns } = useAppStore();

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Top Header */}
      <div className="px-1">
        <h2 className="text-xl font-serif font-bold text-manifest-ink flex items-center gap-2">
          <Compass className="w-5 h-5 text-manifest-auraPurple" />
          Mi Espacio Sagrado
        </h2>
        <p className="text-xs text-manifest-inkMuted">
          Reconocimiento, sincronías del camino y rituales de paz
        </p>
      </div>

      {/* Sub Tabs Segmented Control */}
      <div className="flex p-1 rounded-2xl glass-card border border-white/80 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSubTab('tracking')}
          className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            subTab === 'tracking'
              ? 'bg-manifest-ink text-white shadow-sm'
              : 'text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Progreso</span>
        </button>

        <button
          onClick={() => setSubTab('signs')}
          className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            subTab === 'signs'
              ? 'bg-manifest-ink text-white shadow-sm'
              : 'text-manifest-inkMuted hover:text-manifest-ink'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Señales ({manifestationSigns.length})</span>
        </button>

        <button
          onClick={() => setSubTab('release')}
          className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
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
          className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
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
        {subTab === 'signs' && <SignsView />}
        {subTab === 'release' && <ReleaseRitual />}
        {subTab === 'settings' && <SettingsView />}
      </div>
    </div>
  );
};
