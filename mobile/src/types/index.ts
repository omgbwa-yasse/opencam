export type Resolution = '1920x1080' | '1280x720' | '854x480' | '640x360';
export type FPS = 15 | 24 | 30 | 60;

export interface CameraConfig {
  resolution: Resolution;
  fps: FPS;
  facing: 'front' | 'back';
  autofocus: boolean;
}

export interface StreamStats {
  fps: number;
  bitrate: number;  // kbps
  latency: number;  // ms
  packetsLost: number;
}

export interface PeerConnection {
  desktopIp: string;
  desktopPort: number;
  connected: boolean;
  stats: StreamStats | null;
}

export interface AppState {
  cameraConfig: CameraConfig;
  connection: PeerConnection | null;
  streaming: boolean;
  batteryMode: boolean;
}

export const RESOLUTION_MAP: Record<Resolution, { width: number; height: number }> = {
  '1920x1080': { width: 1920, height: 1080 },
  '1280x720':  { width: 1280, height: 720  },
  '854x480':   { width: 854,  height: 480  },
  '640x360':   { width: 640,  height: 360  },
};
