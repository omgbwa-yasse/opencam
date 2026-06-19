export class WebRTCService {
  private pc: RTCPeerConnection | null = null;
  private stream: MediaStream | null = null;
  private statsInterval: ReturnType<typeof setInterval> | null = null;
  onStream?: (s: MediaStream) => void;
  onStats?:  (s: { fps: number; bitrate: number; latency: number; packetsLost: number }) => void;

  async handleOffer(sdp: string, onAnswer: (sdp: string) => void) {
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    this.pc.ontrack = (e) => {
      this.stream = e.streams[0];
      this.onStream?.(this.stream);
    };

    this.pc.onicecandidate = () => {}; // ICE via signaling channel

    await this.pc.setRemoteDescription({ type: 'offer', sdp });
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    onAnswer(answer.sdp ?? '');

    this.statsInterval = setInterval(() => this.collectStats(), 1000);
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    await this.pc?.addIceCandidate(candidate);
  }

  private async collectStats() {
    if (!this.pc) return;
    const reports = await this.pc.getStats();
    let fps = 0, bitrate = 0, latency = 0, packetsLost = 0;
    reports.forEach((r: any) => {
      if (r.type === 'inbound-rtp' && r.kind === 'video') {
        fps         = r.framesPerSecond ?? 0;
        bitrate     = Math.round((r.bytesReceived ?? 0) * 8 / 1000);
        packetsLost = r.packetsLost ?? 0;
      }
      if (r.type === 'candidate-pair' && r.state === 'succeeded') {
        latency = Math.round((r.currentRoundTripTime ?? 0) * 1000);
      }
    });
    this.onStats?.({ fps, bitrate, latency, packetsLost });
  }

  close() {
    if (this.statsInterval) clearInterval(this.statsInterval);
    this.pc?.close();
    this.pc = null;
    this.stream = null;
  }
}
