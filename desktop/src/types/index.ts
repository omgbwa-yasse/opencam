export type Resolution = '1920x1080' | '1280x720' | '854x480';
export type FPS = 15 | 24 | 30 | 60;

export type ConnectionState = 'idle' | 'waiting' | 'connected' | 'error';

export interface StreamStats {
  fps: number;
  bitrate: number;
  latency: number;
  packetsLost: number;
}

export interface DesktopConfig {
  signalingPort: number;
  resolution: Resolution;
  fps: FPS;
  virtualCameraEnabled: boolean;
}

export const DEFAULT_CONFIG: DesktopConfig = {
  signalingPort: 8765,
  resolution: '1280x720',
  fps: 30,
  virtualCameraEnabled: true,
};
