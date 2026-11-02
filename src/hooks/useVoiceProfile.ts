'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  VoiceProfileMeta,
  getVoiceProfileMeta,
  saveMasterVoiceSample,
  deleteMasterVoiceProfile,
  hasMasterVoiceProfile,
} from '@/lib/voiceStorage';

export function useVoiceProfile() {
  const [profile, setProfile] = useState<VoiceProfileMeta | null>(null);
  const [hasVoice, setHasVoice] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refresh = useCallback(() => {
    const meta = getVoiceProfileMeta();
    setProfile(meta);
    setHasVoice(Boolean(meta && meta.voiceProfileId));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    // Listen to storage events in case profile is updated across tabs or components
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'manifest_aya_voice_profile') {
        refresh();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refresh]);

  const saveSample = useCallback(
    async (blob: Blob, metadata?: Partial<VoiceProfileMeta>) => {
      setIsLoading(true);
      const meta = await saveMasterVoiceSample(blob, metadata);
      setProfile(meta);
      setHasVoice(true);
      setIsLoading(false);
      return meta;
    },
    []
  );

  const removeProfile = useCallback(async () => {
    setIsLoading(true);
    await deleteMasterVoiceProfile();
    setProfile(null);
    setHasVoice(false);
    setIsLoading(false);
  }, []);

  return {
    profile,
    hasVoice,
    isLoading,
    refresh,
    saveSample,
    removeProfile,
  };
}
