import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ConnectionState, DesktopConfig, StreamStats, DEFAULT_CONFIG } from '../types';

interface AppStore {
  connectionState: ConnectionState;
  stats:           StreamStats | null;
  config:          DesktopConfig;
  localIp:         string;
  setConnectionState: (s: ConnectionState)   => void;
  setStats:           (s: StreamStats | null) => void;
  setConfig:          (c: Partial<DesktopConfig>) => void;
  setLocalIp:         (ip: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      connectionState: 'idle',
      stats:           null,
      config:          DEFAULT_CONFIG,
      localIp:         '',
      setConnectionState: (connectionState) => set({ connectionState }),
      setStats:           (stats)           => set({ stats }),
      setConfig:          (c)               => set((s) => ({ config: { ...s.config, ...c } })),
      setLocalIp:         (localIp)         => set({ localIp }),
    }),
    { name: 'opencam-desktop-config' }
  )
);
