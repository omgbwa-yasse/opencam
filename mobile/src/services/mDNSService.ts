import Zeroconf from 'react-native-zeroconf';

export interface DiscoveredDevice {
  name: string;
  host: string;
  port: number;
}

const zeroconf = new Zeroconf();

export function scanForDesktops(
  onFound: (d: DiscoveredDevice) => void,
  onLost:  (name: string) => void
): () => void {
  zeroconf.on('resolved', (service: any) => {
    onFound({ name: service.name, host: service.host, port: service.port });
  });
  zeroconf.on('remove', (name: string) => onLost(name));
  zeroconf.scan('opencam', 'tcp', 'local.');
  return () => { zeroconf.stop(); zeroconf.removeAllListeners(); };
}
