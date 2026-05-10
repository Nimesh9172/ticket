import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const NOTCH_SIZE = 26;
const NOTCH_OFFSET_X = "80%";

export function UpcomingJourneyCard() {
  const router = useRouter();
  const dateMinusTwoDays = new Date();
  dateMinusTwoDays.setDate(dateMinusTwoDays.getDate() - 2);

  const currentDateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    weekday: "short",
    year: "2-digit",
  }).format(dateMinusTwoDays);

  return (
    <View style={styles.shell}>
      <LinearGradient
        colors={["#4C49A2", "#B379E1"]}
        end={{ x: 1, y: 0 }}
        start={{ x: 0, y: 0 }}
        style={styles.card}
      >
        <Text style={styles.date}>{currentDateLabel}</Text>
        <View style={styles.rule} />
        <View style={styles.stationRow}>
          <Text style={styles.stationCode}>VIRAR</Text>
          <Text style={styles.stationCode}>CHURCHGATE</Text>
        </View>
        <View style={styles.rule} />
        <View style={styles.bottomRow}>
          <Text style={styles.status}>Unreserved</Text>
          <View style={styles.actions}>
            <Pressable
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
              onPress={() => router.push("/booking-details")}
              style={({ pressed }) => [
                styles.gradientPill,
                pressed && styles.pillPressed,
              ]}
            >
              <LinearGradient
                colors={["#A66ED6", "#415CC9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientFill}
              >
                <Text style={styles.pillLabel}>Book Again</Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
              onPress={() => router.push("/booking-details")}
              style={({ pressed }) => [
                styles.gradientPill,
                pressed && styles.pillPressed,
              ]}
            >
              <LinearGradient
                colors={["#A66ED6", "#415CC9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientFill}
              >
                <Text style={styles.pillLabel}>View Details</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
      <View
        pointerEvents="none"
        style={[styles.notch, styles.notchTop, { marginLeft: -NOTCH_SIZE / 2 }]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.notch,
          styles.notchBottom,
          { marginLeft: -NOTCH_SIZE / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignSelf: "center",
    overflow: "visible",
    position: "relative",
    width: "86%",
  },
  card: {
    borderRadius: 22,
    overflow: "hidden",
    paddingBottom: 30,
    paddingHorizontal: 12,
    paddingTop: 20,
  },
  notch: {
    backgroundColor: "#FFFFFF",
    borderRadius: NOTCH_SIZE / 2,
    height: NOTCH_SIZE,
    position: "absolute",
    width: NOTCH_SIZE,
    zIndex: 2,
  },
  notchTop: {
    left: NOTCH_OFFSET_X,
    top: -NOTCH_SIZE / 2,
  },
  notchBottom: {
    bottom: -NOTCH_SIZE / 2,
    left: NOTCH_OFFSET_X,
  },
  date: {
    color: "#FFFFFF",
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
  },
  rule: {
    backgroundColor: "rgba(255,255,255,0.2)",
    height: 1,
    marginVertical: 9,
  },
  stationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stationCode: {
    color: "#FFFFFF",
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  bottomRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  status: {
    color: "#A8F5D0",
    flex: 1,
    fontFamily: "Poppins_700Bold",
    fontSize: 13,
    marginRight: 10,
  },
  actions: {
    flexDirection: "row",
    flexShrink: 0,
    gap: 8,
  },
  pill: {
    borderColor: "#FFFFFF",
    borderRadius: 50,
    borderWidth: 1,
    // paddingVertical: 15,
  },
  gradientPill: {
    borderColor: "#FFFFFF",
    borderRadius: 50,
    borderWidth: 1,
    overflow: "hidden",
  },
  gradientFill: {
    paddingHorizontal: 15,
    paddingVertical: 2,
  },
  pillPressed: {
    opacity: 0.85,
  },
  pillLabel: {
    color: "#FFFFFF",
    fontFamily: "Poppins_500Medium",
    fontSize: 9,
  },
});
