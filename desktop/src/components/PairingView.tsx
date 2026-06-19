import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { DEFAULT_CONFIG } from '../types';

interface Props { ip: string; port: number; onManualConnect?: (ip: string, port: number) => void; }

export const PairingView: React.FC<Props> = ({ ip, port, onManualConnect }) => {
  const [manualIp, setManualIp]     = useState('');
  const [manualPort, setManualPort] = useState(String(DEFAULT_CONFIG.signalingPort));
  const payload = JSON.stringify({ opencam: 1, ip, port });

  return (
    <div className="pairing">
      <h2>Connecter le smartphone</h2>
      <div className="qr-wrapper">
        <QRCode value={payload} size={200} />
      </div>
      <p className="ip-label">{ip}:{port}</p>
      <div className="divider">ou entrer manuellement</div>
      <div className="manual-form">
        <input
          placeholder="IP du desktop"
          value={manualIp}
          onChange={(e) => setManualIp(e.target.value)}
        />
        <input
          placeholder="Port"
          value={manualPort}
          onChange={(e) => setManualPort(e.target.value)}
        />
        <button onClick={() => onManualConnect?.(manualIp, parseInt(manualPort))}>
          Connecter
        </button>
      </div>
    </div>
  );
};
