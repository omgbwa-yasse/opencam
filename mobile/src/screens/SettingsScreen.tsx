import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { useAppStore } from '../store/appStore';
import { CameraConfig, FPS, Resolution } from '../types';

const RESOLUTIONS: Resolution[] = ['1920x1080', '1280x720', '854x480', '640x360'];
const FPS_OPTIONS: FPS[]        = [60, 30, 24, 15];

export const SettingsScreen: React.FC = () => {
  const { cameraConfig, batteryMode, setCameraConfig, setBatteryMode } = useAppStore();

  const pick = <K extends keyof CameraConfig>(key: K, value: CameraConfig[K]) =>
    setCameraConfig({ [key]: value });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.section}>Resolution</Text>
      <View style={styles.row}>
        {RESOLUTIONS.map((r) => (
          <TouchableOpacity
            key={r} style={[styles.chip, cameraConfig.resolution === r && styles.chipActive]}
            onPress={() => pick('resolution', r)}>
            <Text style={styles.chipText}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.section}>FPS</Text>
      <View style={styles.row}>
        {FPS_OPTIONS.map((f) => (
          <TouchableOpacity
            key={f} style={[styles.chip, cameraConfig.fps === f && styles.chipActive]}
            onPress={() => pick('fps', f)}>
            <Text style={styles.chipText}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.section}>Camera</Text>
      <View style={styles.row}>
        {(['back', 'front'] as const).map((f) => (
          <TouchableOpacity
            key={f} style={[styles.chip, cameraConfig.facing === f && styles.chipActive]}
            onPress={() => pick('facing', f)}>
            <Text style={styles.chipText}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.rowSwitch}>
        <Text style={styles.label}>Economie batterie</Text>
        <Switch value={batteryMode} onValueChange={setBatteryMode} />
      </View>
      <View style={styles.rowSwitch}>
        <Text style={styles.label}>Autofocus</Text>
        <Switch value={cameraConfig.autofocus}
          onValueChange={(v) => pick('autofocus', v)} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#0f172a', padding: 20 },
  section:    { color: '#94a3b8', fontSize: 12, fontWeight: '600',
                letterSpacing: 1, marginTop: 20, marginBottom: 8 },
  row:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rowSwitch:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                marginTop: 20 },
  label:      { color: '#e2e8f0', fontSize: 16 },
  chip:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                backgroundColor: '#1e293b' },
  chipActive: { backgroundColor: '#3b82f6' },
  chipText:   { color: '#e2e8f0', fontSize: 13 },
});
