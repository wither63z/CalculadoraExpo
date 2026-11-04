import { createElement } from 'react';
import { NavigationBar } from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';

function WebStylesheet() {
  if (Platform.OS !== 'web') {
    return null;
  }

  const sheet = (
    StyleSheet as typeof StyleSheet & {
      getSheet?: () => { id: string; textContent: string };
    }
  ).getSheet?.();

  if (!sheet) {
    return null;
  }

  return createElement('style', {
    id: 'react-native-web-styles',
    dangerouslySetInnerHTML: { __html: sheet.textContent },
  });
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      {Platform.OS === 'android' && (
        <NavigationBar style="dark" hidden={false} />
      )}
      <WebStylesheet />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
