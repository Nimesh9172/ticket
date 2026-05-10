import { StyleSheet, Text } from "react-native";

export function SectionTitle({ title }) {
  return <Text style={styles.title}>{title}</Text>;
}

const styles = StyleSheet.create({
  title: {
    color: "#33406D",
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
  },
});
