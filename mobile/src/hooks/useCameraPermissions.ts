import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export function useCameraPermissions() {
  const [granted, setGranted] = useState(false);
  const [checked, setChecked] = useState(false);

  const permission = Platform.OS === 'ios'
    ? PERMISSIONS.IOS.CAMERA
    : PERMISSIONS.ANDROID.CAMERA;

  useEffect(() => {
    check(permission).then((res) => {
      setGranted(res === RESULTS.GRANTED);
      setChecked(true);
    });
  }, [permission]);

  const requestPermission = useCallback(async () => {
    const res = await request(permission);
    setGranted(res === RESULTS.GRANTED);
    return res === RESULTS.GRANTED;
  }, [permission]);

  return { granted, checked, requestPermission };
}
