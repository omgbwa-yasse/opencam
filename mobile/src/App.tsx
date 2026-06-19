import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './screens/HomeScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#f8fafc',
          headerTitleStyle: { fontWeight: 'bold' },
        }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'OpenCam' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Parametres' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
