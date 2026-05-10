import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export function TicketOptions({ options }) {
  return (
    <View style={styles.grid}>
      {options.map((option) => (
        <TicketOptionCard key={option.title} option={option} />
      ))}
    </View>
  );
}

function TicketOptionCard({ option }) {
  return (
    <Pressable style={styles.option}>
      <View style={styles.reservedImageContainer}>
        <Image source={option.image} style={styles.reservedImage} />
      </View>
      <Text style={styles.label}>{option.title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    columnGap: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  option: {
    alignItems: "center",
    flex: 1,
  },
  label: {
    marginTop: 2,
    color: "#222840",
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    textAlign: "center",
  },
  reservedImage: {
    height: "100%",
    width: "100%",
  },
  reservedImageContainer: {
    height: 90,
    width: 110,
    borderRadius: 10,
  },
});
