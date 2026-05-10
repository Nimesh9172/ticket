import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Stack } from "expo-router";
import { Image, StyleSheet, View } from "react-native";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  // Expo Go never uses app.json native splash — show the same art here until the app is ready.
  if (!fontsLoaded) {
    return (
      <View style={styles.bootSplash}>
        <Image
          source={require("../assets/images/splashr1.png")}
          style={styles.bootSplashImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  bootSplash: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    flex: 1,
    justifyContent: "center",
  },
  bootSplashImage: {
    height: 280,
    width: 280,
  },
});
