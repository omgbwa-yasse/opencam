import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { scanForDesktops, DiscoveredDevice } from '../services/mDNSService';
import { useWebRTC } from '../hooks/useWebRTC';
import { useAppStore } from '../store/appStore';
import { RootStackParamList } from '../App';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>; };

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const [showQR, setShowQR] = useState(false);
  const { connect, disconnect, stats } = useWebRTC();
  const { streaming, connection, cameraConfig } = useAppStore();

  useEffect(() => {
    const cleanup = scanForDesktops(
      (d) => setDevices((prev) => [...prev.filter((x) => x.name !== d.name), d]),
      (name) => setDevices((prev) => prev.filter((x) => x.name !== name))
    );
    return cleanup;
  }, []);

  const handleConnect = async (device: DiscoveredDevice) => {
    try {
      await connect(device.host, device.port, cameraConfig);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OpenCam</Text>

      {streaming && (
        <>
          <Text style={styles.badge}>LIVE</Text>
          <ConnectionStatus stats={stats} connected={streaming} />
          <TouchableOpacity style={styles.btnDanger} onPress={disconnect}>
            <Text style={styles.btnText}>Deconnecter</Text>
          </TouchableOpacity>
        </>
      )}

      {!streaming && (
        <>
          <TouchableOpacity style={styles.btn} onPress={() => setShowQR(!showQR)}>
            <Text style={styles.btnText}>{showQR ? 'Masquer QR' : 'Afficher QR'}</Text>
          </TouchableOpacity>
          {showQR && <QRCodeDisplay ip="" port={8765} />}
          <Text style={styles.subtitle}>Appareils detectes</Text>
          <FlatList
            data={devices}
            keyExtractor={(d) => d.name}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.device} onPress={() => handleConnect(item)}>
                <Text style={styles.deviceText}>{item.name} — {item.host}:{item.port}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <TouchableOpacity style={styles.btnSettings} onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.btnText}>Parametres</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20 },
  title:     { color: '#f8fafc', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  subtitle:  { color: '#94a3b8', fontSize: 14, marginVertical: 12 },
  badge:     { color: '#ef4444', fontWeight: 'bold', letterSpacing: 2, marginBottom: 8 },
  btn:       { backgroundColor: '#3b82f6', padding: 14, borderRadius: 10, marginBottom: 12 },
  btnDanger: { backgroundColor: '#ef4444', padding: 14, borderRadius: 10, marginBottom: 12 },
  btnSettings:{ backgroundColor: '#475569', padding: 12, borderRadius: 10, marginTop: 'auto' },
  btnText:   { color: '#fff', fontWeight: '600', textAlign: 'center' },
  device:    { backgroundColor: '#1e293b', padding: 14, borderRadius: 8, marginBottom: 8 },
  deviceText:{ color: '#e2e8f0', fontSize: 14 },
});
