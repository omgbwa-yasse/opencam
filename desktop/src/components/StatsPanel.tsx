import React from 'react';
import { StreamStats } from '../types';

interface Props { stats: StreamStats | null; }

function qualityClass(latency: number) {
  if (latency < 50)  return 'good';
  if (latency < 150) return 'fair';
  return 'poor';
}

export const StatsPanel: React.FC<Props> = ({ stats }) => {
  if (!stats) return <div className="stats-panel empty">En attente...</div>;
  return (
    <div className={`stats-panel ${qualityClass(stats.latency)}`}>
      <span>{stats.fps} fps</span>
      <span>{stats.bitrate} kbps</span>
      <span>{stats.latency} ms</span>
      {stats.packetsLost > 0 && <span className="loss">{stats.packetsLost} perdus</span>}
    </div>
  );
};
