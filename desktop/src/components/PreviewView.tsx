import React, { useEffect, useRef } from 'react';

interface Props { stream: MediaStream | null; }

export const PreviewView: React.FC<Props> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="preview">
      <video ref={videoRef} autoPlay muted playsInline />
      {stream && <span className="live-badge">LIVE</span>}
    </div>
  );
};
