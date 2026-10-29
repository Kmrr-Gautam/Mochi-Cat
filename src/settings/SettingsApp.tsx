// ============================================================
// Mochi – Settings App (React)
// ============================================================
import React, { useEffect, useState, useCallback } from 'react';
import { IPC } from '../shared/ipc-channels';
import { DEFAULT_SETTINGS } from '../shared/constants';
import type { AppSettings, PetData } from '../shared/types';
import { PetRoomView } from './components/PetRoomView';
import { OnboardingView } from './components/OnboardingView';

interface Props {
  isOnboarding: boolean;
}

declare global {
  interface Window {
    mochiAPI: {
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
      send?: (channel: string, ...args: unknown[]) => void;
      on: (channel: string, listener: (...args: unknown[]) => void) => (() => void) | void;
      removeAllListeners: (channel: string) => void;
    };
  }
}

export const SettingsApp: React.FC<Props> = ({ isOnboarding }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [petData, setPetData] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, p] = await Promise.all([
          window.mochiAPI.invoke(IPC.SETTINGS_GET) as Promise<AppSettings>,
          window.mochiAPI.invoke(IPC.PETDATA_GET) as Promise<PetData>,
        ]);
        setSettings(s);
        setPetData(p);
      } catch (e) {
        console.error('[SettingsApp] Failed to load data', e);
      } finally {
        setLoading(false);
      }
    };
    load();

    const cleanup = window.mochiAPI.on(IPC.SETTINGS_CHANGED, (updated) => {
      setSettings(updated as AppSettings);
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  const handleSettingsChange = useCallback(async (partial: Partial<AppSettings>) => {
    const updated = await window.mochiAPI.invoke(IPC.SETTINGS_SET, partial) as AppSettings;
    setSettings(updated);
  }, []);

  const handlePetDataChange = useCallback(async (partial: Partial<PetData>) => {
    const updated = await window.mochiAPI.invoke(IPC.PETDATA_SET, partial) as PetData;
    setPetData(updated);
  }, []);

  const handleOnboardingComplete = useCallback((data: { petData: Partial<PetData>; settings: Partial<AppSettings> }) => {
    window.mochiAPI.send?.(IPC.ONBOARDING_COMPLETE, data);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#FFF5F0',
        color: '#CC8877',
        fontSize: 18,
        fontFamily: 'system-ui',
      }}>
        🐱 Loading Mochi...
      </div>
    );
  }

  if (isOnboarding) {
    return (
      <OnboardingView
        petData={petData}
        settings={settings}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <PetRoomView
      settings={settings}
      petData={petData}
      onSettingsChange={handleSettingsChange}
      onPetDataChange={handlePetDataChange}
    />
  );
};
