import { useEffect, useState } from 'react';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';

import { initDb } from '@/db';
import { initI18n } from '@/i18n';
import { rescheduleAllTaskReminders, setupNotifications } from '@/lib/notifications';
import { prefs } from '@/storage/prefs';

import '../src/styles/global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    async function bootstrap() {
      try {
        // 1. Open SQLite and run pending migrations
        await initDb();
        // 2. Load saved language and init i18next
        const lang = await prefs.getLanguage();
        await initI18n(lang);
        // 3. Request notification permissions and re-sync task reminders
        await setupNotifications();
        await rescheduleAllTaskReminders();
      } catch (e) {
        console.error('Bootstrap error:', e);
      } finally {
        setAppReady(true);
      }
    }
    bootstrap();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && appReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, appReady]);

  if ((!fontsLoaded && !fontError) || !appReady) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
