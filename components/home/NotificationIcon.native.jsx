import LottieView from "lottie-react-native";
import { StyleSheet } from "react-native";

export function NotificationIcon() {
  return (
    <LottieView
      source={require("../../assets/notification.json")}
      autoPlay
      loop
      style={styles.notificationLottie}
    />
  );
}

const styles = StyleSheet.create({
  notificationLottie: {
    height: 30,
    width: 40,
  },
});
