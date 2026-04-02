import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createPaletteStore, createTokenStore } from "@chroma/core";

export const usePaletteStore = createPaletteStore(AsyncStorage);
export const useTokenStore = createTokenStore(AsyncStorage);

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}
