import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface Props { ip: string; port: number; }

export const QRCodeDisplay: React.FC<Props> = ({ ip, port }) => {
  const payload = JSON.stringify({ opencam: 1, ip, port });
  return (
    <View style={styles.container}>
      <QRCode value={payload} size={200} color="#0f172a" backgroundColor="#f8fafc" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8fafc', borderRadius: 12,
               alignSelf: 'center', marginVertical: 16 },
});
