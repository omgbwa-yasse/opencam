import { invoke, listen } from '@tauri-apps/api';

export const TauriIPC = {
  startSignalingServer: (port: number) =>
    invoke<void>('start_signaling_server', { port }),

  stopSignalingServer: () =>
    invoke<void>('stop_signaling_server'),

  sendSignalingMessage: (msg: unknown) =>
    invoke<void>('send_signaling_message', { message: JSON.stringify(msg) }),

  setVirtualCameraActive: (active: boolean) =>
    invoke<void>('set_virtual_camera_active', { active }),

  pushFrameToVirtualCamera: (frame: Uint8Array) =>
    invoke<void>('push_frame_to_virtual_camera', { frame: Array.from(frame) }),

  getLocalIp: () =>
    invoke<string>('get_local_ip'),

  onSignalingMessage: (cb: (msg: unknown) => void) =>
    listen('signaling-message', (e) => cb(e.payload)),

  onMobileConnectionChange: (cb: (connected: boolean) => void) =>
    listen<boolean>('mobile-connection', (e) => cb(e.payload)),
};
