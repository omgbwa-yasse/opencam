import { useCallback, useRef, useState } from 'react';
import { WebRTCService } from '../services/WebRTCService';
import { useAppStore } from '../store/appStore';
import { CameraConfig, StreamStats } from '../types';

export function useWebRTC() {
  const svc = useRef<WebRTCService | null>(null);
  const [stats, setStats] = useState<StreamStats | null>(null);
  const setConnection = useAppStore((s) => s.setConnection);
  const setStreaming   = useAppStore((s) => s.setStreaming);
  const resetConnection = useAppStore((s) => s.resetConnection);

  const connect = useCallback(async (ip: string, port: number, config: CameraConfig) => {
    svc.current = new WebRTCService();
    svc.current.onStats = setStats;
    svc.current.onDisconnected = () => { resetConnection(); setStats(null); };
    await svc.current.connect(ip, port, config);
    setConnection({ desktopIp: ip, desktopPort: port, connected: true, stats: null });
    setStreaming(true);
  }, [setConnection, setStreaming, resetConnection]);

  const disconnect = useCallback(() => {
    svc.current?.disconnect();
    svc.current = null;
    setStats(null);
    resetConnection();
  }, [resetConnection]);

  return { connect, disconnect, stats };
}
