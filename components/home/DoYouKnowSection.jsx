import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export function DoYouKnowSection({ facts }) {
  return (
    <View style={styles.section}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {facts.map((fact) => (
          <View key={fact.id} style={styles.card}>
            <View style={styles.imagePlaceholder}>
              <Image source={fact.image} style={styles.image} />
            </View>
            <Text style={styles.factText}>{fact.text}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 6,
  },
  row: {
    gap: 12,
    paddingRight: 8,
  },
  card: {
    width: 150,
  },
  imagePlaceholder: {
    height: 130,
    width: 150,
    borderRadius: 12,
    overflow: "hidden",
  },
  placeholderLabel: {
    color: "#5A668A",
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
  },
  factText: {
    color: "#4E5C81",
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  image: {
    height: "100%",
    width: "100%",
  },
});
