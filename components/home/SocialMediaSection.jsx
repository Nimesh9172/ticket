import { Image, Pressable, StyleSheet, View } from "react-native";

export function SocialMediaSection({ platforms }) {
  return (
    <View style={styles.section}>
      <View style={styles.banner}>
        <Image
          source={require("../../assets/images/sl3.png")}
          style={styles.bannerImage}
        />
        <View style={styles.iconRow}>
          {platforms.map((platform) => (
            <Pressable key={platform.id} style={styles.iconWrap}>
              <Image source={platform.image} style={styles.iconImage} />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
  },
  banner: {
    alignItems: "center",
    backgroundColor: "#B9C9E7",
    borderRadius: 12,
    height: 200,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  bannerLabel: {
    color: "#355088",
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    position: "absolute",
    top: 14,
  },
  iconRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: "50%",
    transform: [{ translateY: -20 }],
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: 18,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  iconImage: {
    height: "100%",
    width: "100%",
  },
  bannerImage: {
    bottom: 0,
    height: "100%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%",
  },
});
