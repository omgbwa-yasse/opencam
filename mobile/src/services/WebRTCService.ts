import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import { CameraConfig, RESOLUTION_MAP, StreamStats } from '../types';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
];

export class WebRTCService {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private ws: WebSocket | null = null;
  private statsInterval: ReturnType<typeof setInterval> | null = null;
  onStats?: (stats: StreamStats) => void;
  onDisconnected?: () => void;

  async connect(ip: string, port: number, config: CameraConfig): Promise<void> {
    const { width, height } = RESOLUTION_MAP[config.resolution];

    this.localStream = await mediaDevices.getUserMedia({
      audio: false,
      video: {
        width, height,
        frameRate: config.fps,
        facingMode: config.facing === 'front' ? 'user' : 'environment',
      },
    });

    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.localStream.getTracks().forEach((t) => this.pc!.addTrack(t, this.localStream!));

    this.ws = new WebSocket(`ws://${ip}:${port}/signaling`);
    this.ws.onmessage = (e) => this.handleSignal(JSON.parse(e.data));
    this.ws.onclose   = () => this.onDisconnected?.();

    this.pc.onicecandidate = (e) => {
      if (e.candidate && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ice', candidate: e.candidate }));
      }
    };

    await new Promise<void>((res) => { this.ws!.onopen = () => res(); });
    const offer = await this.pc.createOffer({ offerToReceiveVideo: false });
    // Force H.264
    offer.sdp = offer.sdp?.replace(
      /m=video.*\r\n/,
      (m) => m + 'a=fmtp:96 profile-level-id=42e01f\r\n'
    ) ?? offer.sdp;
    await this.pc.setLocalDescription(new RTCSessionDescription(offer));
    this.ws.send(JSON.stringify({ type: 'offer', sdp: offer.sdp }));

    this.statsInterval = setInterval(() => this.collectStats(), 1000);
  }

  private async handleSignal(msg: any) {
    if (!this.pc) return;
    if (msg.type === 'answer') {
      await this.pc.setRemoteDescription(new RTCSessionDescription(msg));
    } else if (msg.type === 'ice') {
      await this.pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
    }
  }

  private async collectStats() {
    if (!this.pc) return;
    const reports = await this.pc.getStats();
    let fps = 0, bitrate = 0, latency = 0, packetsLost = 0;
    reports.forEach((r: any) => {
      if (r.type === 'outbound-rtp' && r.kind === 'video') {
        fps       = r.framesPerSecond ?? 0;
        bitrate   = Math.round((r.bytesSent ?? 0) * 8 / 1000);
        packetsLost = r.packetsLost ?? 0;
      }
      if (r.type === 'candidate-pair' && r.state === 'succeeded') {
        latency = Math.round((r.currentRoundTripTime ?? 0) * 1000);
      }
    });
    this.onStats?.({ fps, bitrate, latency, packetsLost });
  }

  disconnect() {
    if (this.statsInterval) clearInterval(this.statsInterval);
    this.ws?.close();
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.pc?.close();
    this.pc = null;
    this.localStream = null;
    this.ws = null;
  }
}
