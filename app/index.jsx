import { BottomNav } from "@/components/home/BottomNav";
import { DoYouKnowSection } from "@/components/home/DoYouKnowSection";
import { HomeHeader } from "@/components/home/HomeHeader";
import { OfferingsGrid } from "@/components/home/OfferingsGrid";
import { SectionTitle } from "@/components/home/SectionTitle";
import { SocialMediaSection } from "@/components/home/SocialMediaSection";
import { TicketOptions } from "@/components/home/TicketOptions";
import { UpcomingJourneyCard } from "@/components/home/UpcomingJourneyCard";
import {
  bottomNavItems,
  doYouKnowFacts,
  offerings,
  socialPlatforms,
  ticketOptions,
} from "@/constants/home";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader />
        <Text style={styles.greeting}>Hi, Nimesh Vishwakarma!</Text>

        <SectionTitle title="Journey Planner" />
        <TicketOptions options={ticketOptions} />

        <SectionTitle title="More Offerings" />
        <OfferingsGrid offerings={offerings} />

        <SectionTitle title="Upcoming Journey" />
        <UpcomingJourneyCard />

        <SectionTitle title="Do You know?" />
        <DoYouKnowSection facts={doYouKnowFacts} />

        <SectionTitle title="Follow Us On Social Media Platforms" />
        <SocialMediaSection platforms={socialPlatforms} />
      </ScrollView>

      <BottomNav items={bottomNavItems} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 170,
  },
  greeting: {
    color: "#33406D",
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    marginTop: 15,
  },
});
