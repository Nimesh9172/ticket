import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export function OfferingsGrid({ offerings }) {
  return (
    <View style={styles.grid}>
      {offerings.map((offering) => (
        <Pressable key={offering.title} style={styles.item}>
          <View style={styles.iconBox}>
            <Image source={offering.image} style={styles.image} />
          </View>
          <Text style={styles.label}>{offering.title}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 20,
  },
  item: {
    alignItems: "center",
    width: "20.5%",
  },
  iconBox: {
    // alignItems: "center",
    // borderRadius: 15,
    height: 60,
    width: 70,
    // justifyContent: "center",
    marginBottom: 8,
    // width: "100%",
  },
  label: {
    color: "#061B50",
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    textAlign: "center",
  },
  image: {
    height: "100%",
    width: "100%",
  },
});
