import { create } from 'zustand';
import { AppState, CameraConfig, PeerConnection } from '../types';

interface AppStore extends AppState {
  setCameraConfig: (config: Partial<CameraConfig>) => void;
  setConnection:   (conn: PeerConnection | null) => void;
  setStreaming:    (s: boolean) => void;
  setBatteryMode:  (b: boolean) => void;
  resetConnection: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  cameraConfig: {
    resolution: '1280x720',
    fps: 30,
    facing: 'back',
    autofocus: true,
  },
  connection:  null,
  streaming:   false,
  batteryMode: false,

  setCameraConfig: (config) =>
    set((s) => ({ cameraConfig: { ...s.cameraConfig, ...config } })),
  setConnection:   (conn)   => set({ connection: conn }),
  setStreaming:    (streaming) => set({ streaming }),
  setBatteryMode:  (batteryMode) => set({ batteryMode }),
  resetConnection: () => set({ connection: null, streaming: false }),
}));
