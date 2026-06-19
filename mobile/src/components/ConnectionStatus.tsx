import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StreamStats } from '../types';

interface Props { stats: StreamStats | null; connected: boolean; }

function quality(latency: number): string {
  if (latency < 50)  return '#22c55e';
  if (latency < 150) return '#eab308';
  return '#ef4444';
}

export const ConnectionStatus: React.FC<Props> = ({ stats, connected }) => {
  if (!connected) return null;
  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: quality(stats?.latency ?? 999) }]} />
      <Text style={styles.text}>
        {stats ? `${stats.fps}fps  ${stats.bitrate}kbps  ${stats.latency}ms` : 'Connexion...'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8,
               backgroundColor: '#1e293b', borderRadius: 8 },
  dot:  { width: 8, height: 8, borderRadius: 4 },
  text: { color: '#e2e8f0', fontSize: 12, fontFamily: 'monospace' },
});
