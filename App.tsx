import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { useThemeStore } from '@/store/themeStore';
import { Appearance } from 'react-native';
import { useEffect } from 'react';

export default function App() {
  const theme = useThemeStore((state) => state.theme);
  const setColorScheme = useThemeStore((state) => state.setColorScheme);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, [setColorScheme]);

  return (
    <SafeAreaProvider>
      <StatusBar style={theme.colors.background === '#000000' ? 'light' : 'dark'} />
      <AppNavigator />
      <Toast />
    </SafeAreaProvider>
  );
}

