import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function BottomNav({ items }) {
  const router = useRouter();

  const handleNavPress = (item) => {
    if (item.label === "My Bookings") {
      router.push("/booking-details");
    }
  };

  return (
    <View style={styles.nav}>
      {items.map((item) => (
        <Pressable
          key={item.label}
          style={styles.navItem}
          onPress={() => handleNavPress(item)}
        >
          <MaterialCommunityIcons
            name={item.icon}
            color={item.active ? "#FFFFFF" : "rgba(255,255,255,0.5)"}
            size={27}
          />
          <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>
            {item.label}
          </Text>
        </Pressable>
      ))}
      {/* <View style={styles.homeIndicator} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    alignItems: "center",
    backgroundColor: "#066DEE",
    bottom: 0,
    flexDirection: "row",
    height: 92,
    justifyContent: "space-around",
    left: 0,
    paddingBottom: 18,
    paddingTop: 8,
    position: "absolute",
    right: 0,
  },
  navItem: {
    alignItems: "center",
    flex: 1,
    gap: 2,
  },
  navLabel: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
  },
  navLabelActive: {
    color: "#FFFFFF",
    fontFamily: "Poppins_500Medium",
  },
  homeIndicator: {
    backgroundColor: "rgba(255,255,255,0.45)",
    borderRadius: 3,
    bottom: 6,
    height: 5,
    position: "absolute",
    width: 150,
  },
});
