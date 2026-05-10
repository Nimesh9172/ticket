import { Image, Pressable, StyleSheet, View } from "react-native";

import { NotificationIcon } from "./NotificationIcon";

export function HomeHeader() {
  return (
    <View style={styles.header}>
      <Pressable style={styles.circleButton}>
        <Image
          source={require("../../assets/images/language.png")}
          style={styles.language}
        />
      </Pressable>

      <View style={styles.brandWrap}>
        <Image
          source={require("../../assets/images/rone-removebg-preview.png")}
          style={styles.brand}
        />
      </View>

      <Pressable style={styles.circleButton}>
        <NotificationIcon />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    // borderColor: "red",
    // borderWidth: 1,
    width: "100%",
  },
  language: {
    width: "100%",
    height: "100%",
  },
  circleButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#EEF0F3",
    borderRadius: 42,
    borderWidth: 1,
    height: 50,
    color: "red",
    justifyContent: "center",
    shadowColor: "#15213A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    width: 50,
  },
  brandWrap: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  brand: {
    height: 64,
    resizeMode: "contain",
    width: 150,
  },
});
