'use client';

import React, { useState } from 'react';
import { LayoutGroup } from 'framer-motion';
import { Segmented, SegmentedButton } from 'konsta/react';
import { TrackingView } from '@/features/tracking/TrackingView';
import { SignsView } from '@/features/signs/SignsView';
import { ReleaseRitual } from '@/features/release/ReleaseRitual';
import { SettingsView } from '@/features/settings/SettingsView';
import { Compass, Flame, Award, Settings, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store';
import { LIQUID_GLASS_SPECULAR } from '@/lib/iosSprings';

type SpaceSubTab = 'tracking' | 'signs' | 'release' | 'settings';

export const MySpaceView: React.FC = () => {
  const [subTab, setSubTab] = useState<SpaceSubTab>('tracking');
  const { manifestationSigns } = useAppStore();

  return (
    <LayoutGroup id="space-layout-group">
      <div className="space-y-6 pt-1">
      {/* Top Header - Hidden on Mobile because Konsta Navbar shows Large Title 'Mi Espacio' */}
      <div className="hidden lg:block px-1">
        <h2 className="text-xl font-serif font-bold text-manifest-ink flex items-center gap-2">
          <Compass className="w-5 h-5 text-manifest-auraPurple" />
          Mi Espacio Sagrado
        </h2>
        <p className="text-xs text-manifest-inkMuted">
          Reconocimiento, sincronías del camino y rituales de paz
        </p>
      </div>

      {/* Sub Tabs Konsta Cupertino Segmented Control */}
      <Segmented
        strong
        rounded
        colors={{
          strongBgIos: `${LIQUID_GLASS_SPECULAR}`,
        }}
        className="w-full p-0.5 sm:p-1 bg-white/80 border border-purple-200/70 shadow-sm"
      >
        <SegmentedButton
          strong
          rounded
          active={subTab === 'tracking'}
          onClick={() => setSubTab('tracking')}
          className={`text-[11px] sm:text-xs font-semibold py-1.5 px-1.5 sm:py-2 sm:px-2 !normal-case cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none ${
            subTab === 'tracking' ? 'text-purple-950 font-bold bg-white border border-purple-200/90 shadow-sm' : 'text-slate-600 font-medium hover:text-slate-900'
          }`}
        >
          <span className="flex items-center justify-center gap-1 whitespace-nowrap">
            <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>Progreso</span>
          </span>
        </SegmentedButton>

        <SegmentedButton
          strong
          rounded
          active={subTab === 'signs'}
          onClick={() => setSubTab('signs')}
          className={`text-[11px] sm:text-xs font-semibold py-1.5 px-1.5 sm:py-2 sm:px-2 !normal-case cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none ${
            subTab === 'signs' ? 'text-purple-950 font-bold bg-white border border-purple-200/90 shadow-sm' : 'text-slate-600 font-medium hover:text-slate-900'
          }`}
        >
          <span className="flex items-center justify-center gap-1 whitespace-nowrap">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>Señales ({manifestationSigns.length})</span>
          </span>
        </SegmentedButton>

        <SegmentedButton
          strong
          rounded
          active={subTab === 'release'}
          onClick={() => setSubTab('release')}
          className={`text-[11px] sm:text-xs font-semibold py-1.5 px-1.5 sm:py-2 sm:px-2 !normal-case cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none ${
            subTab === 'release' ? 'text-purple-950 font-bold bg-white border border-purple-200/90 shadow-sm' : 'text-slate-600 font-medium hover:text-slate-900'
          }`}
        >
          <span className="flex items-center justify-center gap-1 whitespace-nowrap">
            <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>Liberación</span>
          </span>
        </SegmentedButton>

        <SegmentedButton
          strong
          rounded
          active={subTab === 'settings'}
          onClick={() => setSubTab('settings')}
          data-testid="subtab-settings"
          className={`text-[11px] sm:text-xs font-semibold py-1.5 px-1.5 sm:py-2 sm:px-2 !normal-case cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none ${
            subTab === 'settings' ? 'text-purple-950 font-bold bg-white border border-purple-200/90 shadow-sm' : 'text-slate-600 font-medium hover:text-slate-900'
          }`}
        >
          <span className="flex items-center justify-center gap-1 whitespace-nowrap">
            <Settings className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>Ajustes</span>
          </span>
        </SegmentedButton>
      </Segmented>

      {/* Active Tab View */}
      <div>
        {subTab === 'tracking' && <TrackingView />}
        {subTab === 'signs' && <SignsView />}
        {subTab === 'release' && <ReleaseRitual />}
        {subTab === 'settings' && <SettingsView />}
      </div>
    </div>
  </LayoutGroup>
);
};
