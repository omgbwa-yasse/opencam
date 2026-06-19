import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { PairingView } from './components/PairingView';
import { PreviewView } from './components/PreviewView';
import { StatsPanel } from './components/StatsPanel';
import { TauriIPC } from './services/TauriIPC';
import { WebRTCService } from './services/WebRTCService';
import { useAppStore } from './store/appStore';

export default function App() {
  const { connectionState, stats, config, localIp,
          setConnectionState, setStats, setLocalIp } = useAppStore();
  const webrtc = useRef<WebRTCService | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    TauriIPC.getLocalIp().then(setLocalIp);
    TauriIPC.startSignalingServer(config.signalingPort);
    setConnectionState('waiting');

    const unlistenSignaling = TauriIPC.onSignalingMessage(async (raw) => {
      const msg = raw as any;
      if (msg.type === 'offer') {
        webrtc.current = new WebRTCService();
        webrtc.current.onStream = (s) => { setStream(s); setConnectionState('connected'); };
        webrtc.current.onStats  = setStats;
        await webrtc.current.handleOffer(msg.sdp, (answerSdp) => {
          TauriIPC.sendSignalingMessage({ type: 'answer', sdp: answerSdp });
        });
      } else if (msg.type === 'ice') {
        webrtc.current?.addIceCandidate(msg.candidate);
      }
    });

    const unlistenConn = TauriIPC.onMobileConnectionChange((connected) => {
      if (!connected) {
        setConnectionState('waiting');
        setStream(null);
        setStats(null);
        webrtc.current?.close();
        webrtc.current = null;
      }
    });

    return () => {
      unlistenSignaling.then((fn) => fn());
      unlistenConn.then((fn) => fn());
      TauriIPC.stopSignalingServer();
      webrtc.current?.close();
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <span className="logo">OpenCam</span>
        <span className={`status status-${connectionState}`}>{connectionState}</span>
      </header>
      <main className="app-main">
        {connectionState !== 'connected'
          ? <PairingView ip={localIp} port={config.signalingPort} />
          : <PreviewView stream={stream} />}
      </main>
      <footer><StatsPanel stats={stats} /></footer>
    </div>
  );
}
