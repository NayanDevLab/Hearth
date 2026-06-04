import { Stack } from 'expo-router';

export default function SpotLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
