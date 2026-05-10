import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import {
  AnimatedSplash,
  BootSplashStatic,
} from "@/components/AnimatedSplash";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  const [splashDone, setSplashDone] = useState(false);

  const handleSplashFinish = useCallback(() => setSplashDone(true), []);

  useEffect(() => {
    if (!fontsLoaded) return;

    let cancelled = false;
    const hideNative = () => {
      if (!cancelled) SplashScreen.hideAsync().catch(() => {});
    };

    // Let the JS splash (same frame as native) paint, then drop the native layer for the zoom-out.
    requestAnimationFrame(hideNative);
    const t = setTimeout(hideNative, 48);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [fontsLoaded]);

  if (!splashDone) {
    return fontsLoaded ? (
      <AnimatedSplash
        fontsLoaded={fontsLoaded}
        onZoomOutComplete={handleSplashFinish}
      />
    ) : (
      <BootSplashStatic />
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
