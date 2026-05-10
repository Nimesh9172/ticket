import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";

const INITIAL_SCALE = 1.52;
const ZOOM_DURATION_MS = 880;

/**
 * Full-screen splash: logo stays at INITIAL_SCALE until fonts load, then zooms out to 1.
 * Keeps the first animated frame aligned with the pre-font static frame (no size pop).
 */
export function AnimatedSplash({ fontsLoaded, onZoomOutComplete }) {
  const scale = useRef(new Animated.Value(INITIAL_SCALE)).current;
  const didRun = useRef(false);

  useEffect(() => {
    if (!fontsLoaded || didRun.current) return;
    didRun.current = true;

    Animated.timing(scale, {
      toValue: 1,
      duration: ZOOM_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onZoomOutComplete();
    });
  }, [fontsLoaded, onZoomOutComplete, scale]);

  return (
    <View style={styles.root} accessibilityRole="none">
      <Animated.Image
        accessibilityIgnoresInvertColors
        source={require("../assets/images/logor1.png")}
        style={[styles.logo, { transform: [{ scale }] }]}
        resizeMode="contain"
      />
    </View>
  );
}

/** Static splash while fonts load (under native splash). Same art as animated layer. */
export function BootSplashStatic() {
  return (
    <View style={styles.root}>
      <Image
        source={require("../assets/images/logor1.png")}
        style={[styles.logo, { transform: [{ scale: INITIAL_SCALE }] }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    flex: 1,
    justifyContent: "center",
  },
  logo: {
    height: 260,
    width: 260,
  },
});
