import { Stack } from 'expo-router';

export default function RoomLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
