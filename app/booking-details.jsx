import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_BACKGROUND = "#D3D3D3";
const TICKET_PAPER = "#FBF5F2";
const TICKET_GREEN = "#B8F18E";
const NOTCH_FILL = "#D3D3D3";

const QR_SEASON_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const QR_SEASON_DIGITS = "0123456789";

/**
 * Fixed prefix X03 + 7 chars; at least one digit in the middle five positions
 * (not first/last of the suffix), rest uppercase letters — e.g. X03ZE4PIAG.
 */
function generateSeasonTicketId() {
  const suffix = [];
  const digitIndex = 1 + Math.floor(Math.random() * 5);
  for (let i = 0; i < 7; i += 1) {
    if (i === digitIndex) {
      suffix.push(
        QR_SEASON_DIGITS[Math.floor(Math.random() * QR_SEASON_DIGITS.length)],
      );
    } else {
      suffix.push(
        QR_SEASON_LETTERS[Math.floor(Math.random() * QR_SEASON_LETTERS.length)],
      );
    }
  }
  return `X03${suffix.join("")}`;
}

const QR_VALUE_TEMPLATE =
  "UTS|SEASON|__SEASON_ID__|RI8666|7972861253|VIRAR|ANDHERI|IRT>BSR|39KM|BOOKED:2026-05-06T08:25:09|VALID:2026-05-07:2026-06-06|MONTHLY|AC-EMU|FIRST|1870.00|NAME:NIMESH VISHWAKARMA|AGE:27|ID:BFXPV8990RUTS|SEASON|__SEASON_ID__|RI8666|7972861253|VIRAR|ANDHERI|IRT>BSR|39KM|BOOKED:2026-05-06T08:25:09|VALID:2026-05-07:2026-06-06|MONTHLY|AC-EMU|FIRST|1870.00|NAME:NIMESH VISHWAKARMA|AGE:27|ID:BFXPV8990RUTS|SEASON|__SEASON_ID__|RI8666|7972861253|VIRAR|ANDHERI|IRT>BSR|39KM|BOOKED:2026-05-06T08:25:09|VALID:2026-05-07:2026-06-06|MONTHLY|AC-EMU|FIRST|1870.00|NAME:NIMESH VISHWAKARMA|AGE:27|ID:BFXPV8990R";

function buildQrPayload(seasonId) {
  return QR_VALUE_TEMPLATE.replaceAll("__SEASON_ID__", seasonId);
}

/** Initial preview countdown (displayed as 04:59). */
const PREVIEW_DURATION_SEC = 4 * 60 + 59;

const TIMER_DIGIT_HEIGHT = 56;
const TIMER_DIGIT_WIDTH = 30;
const TIMER_ROLL_DURATION_MS = 430;
const TIMER_ROLL_START_Y = -TIMER_DIGIT_HEIGHT;
const TIMER_ROLL_EXIT_Y = TIMER_DIGIT_HEIGHT;

const TIMER_ROLL_TIMING = {
  duration: TIMER_ROLL_DURATION_MS,
  easing: Easing.out(Easing.cubic),
};
const TIMER_ROLL_FADE = {
  duration: TIMER_ROLL_DURATION_MS,
  easing: Easing.out(Easing.quad),
};

function getMmSsParts(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return {
    mm: String(m).padStart(2, "0"),
    ss: String(s).padStart(2, "0"),
  };
}

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Local calendar date minus `daysBack`, same clock time as `now`. */
function bookingCalendarDaysAgoAtNowClock(daysBack = 2, now = new Date()) {
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - daysBack,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
  );
}

function formatPreviewBookingLineFromDate(d) {
  const day = String(d.getDate()).padStart(2, "0");
  const mon = MONTHS_SHORT[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${mon} ${yyyy}, ${hh}:${mi}`;
}

function formatBookedOnLineFromDate(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;
}

function formatDateOnlyDdMmYyyy(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Calendar date of `d` (local), plus `deltaDays`. */
function addCalendarDays(d, deltaDays) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + deltaDays);
  return x;
}

/**
 * Owns countdown state so the booking screen doesn't re-render every second
 * (avoids jitter from layout + QR + ScrollView subtree).
 */
const RollingTimerDigit = memo(function RollingTimerDigit({
  value,
  rollTrigger,
}) {
  const previousValueRef = useRef(value);
  const previousTriggerRef = useRef(rollTrigger);
  const rollIdRef = useRef(0);
  const [roll, setRoll] = useState(null);

  const outgoingY = useSharedValue(0);
  const outgoingOpacity = useSharedValue(1);
  const incomingY = useSharedValue(0);
  const incomingOpacity = useSharedValue(1);

  const outgoingStyle = useAnimatedStyle(() => ({
    opacity: outgoingOpacity.value,
    transform: [{ translateY: outgoingY.value }],
  }));
  const incomingStyle = useAnimatedStyle(() => ({
    opacity: incomingOpacity.value,
    transform: [{ translateY: incomingY.value }],
  }));

  useLayoutEffect(() => {
    if (previousTriggerRef.current === rollTrigger) return;
    rollIdRef.current += 1;
    setRoll({
      id: rollIdRef.current,
      from: previousValueRef.current,
      to: value,
    });
    previousValueRef.current = value;
    previousTriggerRef.current = rollTrigger;
  }, [rollTrigger, value]);

  useLayoutEffect(() => {
    if (!roll) return;

    cancelAnimation(outgoingY);
    cancelAnimation(outgoingOpacity);
    cancelAnimation(incomingY);
    cancelAnimation(incomingOpacity);

    outgoingY.value = 0;
    outgoingOpacity.value = 1;
    incomingY.value = TIMER_ROLL_START_Y;
    incomingOpacity.value = 0;

    outgoingY.value = withTiming(TIMER_ROLL_EXIT_Y, TIMER_ROLL_TIMING);
    outgoingOpacity.value = withTiming(0, TIMER_ROLL_FADE);
    incomingY.value = withTiming(0, TIMER_ROLL_TIMING);
    incomingOpacity.value = withTiming(1, TIMER_ROLL_FADE, (finished) => {
      if (finished) runOnJS(setRoll)(null);
    });
  }, [incomingOpacity, incomingY, outgoingOpacity, outgoingY, roll]);

  return (
    <View style={styles.previewTimerDigitSlot}>
      {roll ? (
        <>
          <Animated.View
            key={`out-${roll.id}`}
            style={[styles.previewTimerDigitOverlay, outgoingStyle]}
          >
            <Text style={[styles.previewTimer, styles.previewTimerDigitText]}>
              {roll.from}
            </Text>
          </Animated.View>
          <Animated.View
            key={`in-${roll.id}`}
            style={[styles.previewTimerDigitOverlay, incomingStyle]}
          >
            <Text style={[styles.previewTimer, styles.previewTimerDigitText]}>
              {roll.to}
            </Text>
          </Animated.View>
        </>
      ) : (
        <Text style={[styles.previewTimer, styles.previewTimerDigitText]}>
          {value}
        </Text>
      )}
    </View>
  );
});

const PreviewCountdownTimer = memo(function PreviewCountdownTimer() {
  const [previewSecondsLeft, setPreviewSecondsLeft] =
    useState(PREVIEW_DURATION_SEC);

  useEffect(() => {
    const id = setInterval(() => {
      setPreviewSecondsLeft((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const { mm: timerMm, ss: timerSs } = getMmSsParts(previewSecondsLeft);

  return (
    <View style={styles.previewTimerWrap}>
      <View style={styles.previewTimerRow}>
        <RollingTimerDigit value={timerMm[0]} rollTrigger={timerMm} />
        <RollingTimerDigit value={timerMm[1]} rollTrigger={timerMm} />
        <Text style={styles.previewTimerColon}>:</Text>
        <RollingTimerDigit value={timerSs[0]} rollTrigger={timerSs} />
        <RollingTimerDigit value={timerSs[1]} rollTrigger={timerSs} />
      </View>
    </View>
  );
});

export default function BookingDetails() {
  const router = useRouter();
  const {
    previewBookingDateTime,
    bookedOnDateTime,
    validFromDate,
    validTillDate,
  } = useMemo(() => {
    const ref = bookingCalendarDaysAgoAtNowClock(2);
    const till = addCalendarDays(ref, 30);
    return {
      previewBookingDateTime: formatPreviewBookingLineFromDate(ref),
      bookedOnDateTime: formatBookedOnLineFromDate(ref),
      validFromDate: formatDateOnlyDdMmYyyy(ref),
      validTillDate: formatDateOnlyDdMmYyyy(till),
    };
  }, []);

  const { seasonTicketId, qrPayload } = useMemo(() => {
    const id = generateSeasonTicketId();
    return { seasonTicketId: id, qrPayload: buildQrPayload(id) };
  }, []);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="light" backgroundColor="#065ADD" />
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Pressable onPress={handleBackPress} style={styles.backButton}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  color="#FFFFFF"
                  size={20}
                />
              </Pressable>
              <View>
                <Text style={styles.headerTitle}>Booking Details</Text>
                <Text style={styles.headerSubTitle}>Mobile: 7972861253</Text>
              </View>
            </View>
            <View style={styles.shareButton}>
              <MaterialCommunityIcons
                name="share-variant"
                color="#FFFFFF"
                size={23}
              />
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.thankYou}>
            Thank You Nimesh Vishwakarma, Happy Journey !
          </Text>

          <View style={styles.ticketCard}>
            <ImageBackground
              source={require("../assets/images/ticketbg.png")}
              resizeMode="cover"
              style={styles.previewCard}
              fadeDuration={0}
            >
              <Text style={styles.dynamicPreview}>
                Dymanic Preview will close in
              </Text>
              <PreviewCountdownTimer />

              <Text style={styles.previewLabel}>
                Ticket Booking Date & Time
              </Text>
              <Text style={styles.previewDate}>{previewBookingDateTime}</Text>
              <Text style={styles.previewCode}>RI8666</Text>
              <Text style={styles.previewTransfer}>
                Ticket is Non-Transferable
              </Text>
            </ImageBackground>

            <View style={styles.ticketBody}>
              <View style={styles.sectionRow}>
                <Text style={styles.rowMain}>Season Ticket</Text>
                <Text style={styles.rowRightStrong}>{seasonTicketId}</Text>
              </View>

              <View style={styles.stationRow}>
                <Text style={styles.station}>VIRAR</Text>
                <Text style={styles.distance}>- 60 km -</Text>
                <Text style={styles.station}>CHURCHGATE</Text>
              </View>

              <View style={styles.sectionRow}>
                <Text style={styles.rowSub}>Via</Text>
                <Text style={styles.rowSub}>Booked on</Text>
              </View>
              <View style={styles.sectionRow}>
                <Text style={styles.rowMain}>IRT{">"}BSR</Text>
                <Text style={styles.rowMain}>{bookedOnDateTime}</Text>
              </View>

              <View style={styles.sectionRow}>
                <Text style={styles.rowSub}>Valid From</Text>
                <Text style={styles.rowSub}>*Valid Till</Text>
              </View>
              <View style={styles.sectionRow}>
                <Text style={styles.rowMain}>{validFromDate}</Text>
                <Text style={styles.rowMain}>{validTillDate}</Text>
              </View>

              <Text style={styles.planText}>
                MONTHLY | AC-EMU | FIRST | ₹ 2205.00
              </Text>
              <View style={styles.passengerDivider}>
                <View style={styles.divider} />
                <View
                  pointerEvents="none"
                  style={[styles.edgeNotch, styles.leftNotch]}
                />
                <View
                  pointerEvents="none"
                  style={[styles.edgeNotch, styles.rightNotch]}
                />
              </View>

              <View style={styles.sectionRow}>
                <View>
                  <Text style={styles.rowSub}>Name</Text>
                  <Text style={styles.rowMain}>Nimesh Vishwakarma</Text>
                </View>
                <View style={styles.rightCol}>
                  <Text style={styles.rowSub}>Age</Text>
                  <Text style={styles.rowMain}>27 years</Text>
                </View>
              </View>

              <View style={styles.sectionRow}>
                <View>
                  <Text style={styles.rowSub}>ID Type</Text>
                  <Text style={styles.rowMain}>PAN Card</Text>
                </View>
                <View style={styles.rightCol}>
                  <Text style={styles.rowSub}>ID Number</Text>
                  <Text style={styles.rowMain}>BFXPV8990R</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.noteBanner}>
            <Text style={styles.noteText}>
              Note: This ticket is non refundable. Ticket is stored locally on
              the device. Please do not change your handset or perform factory
              reset.
            </Text>
          </View>

          <View style={styles.qrWrap}>
            <QRCode
              value={qrPayload}
              size={225}
              color="#15110F"
              backgroundColor={TICKET_PAPER}
              quietZone={0}
            />
          </View>

          <View style={styles.didYouKnow}>
            <Text style={styles.didYouKnowTitle}>Do you know?</Text>
            <Text style={styles.didYouKnowText}>
              IR recovers only 57% of cost of travel on an average.
            </Text>
            <Text style={styles.didYouKnowText}>
              {
                "This ticket is booked on a personal user ID. It's sale/purchase is "
              }
              an offence u/s 143 of the Railways Act, 1989
            </Text>
            <Text style={styles.didYouKnowText}>
              For enquiry and integrated railway helpline, please dial 139.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#065ADD",
  },
  scroll: {
    backgroundColor: PAGE_BACKGROUND,
  },
  header: {
    backgroundColor: "#065ADD",
    paddingBottom: 12,
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: 16,
    borderWidth: 1.5,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  shareButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
  },
  headerSubTitle: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
  },
  content: {
    paddingBottom: 28,
    paddingHorizontal: 12,
    // paddingTop: 14,
  },
  thankYou: {
    color: "#413632",
    backgroundColor: TICKET_PAPER,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    marginBottom: 12,
  },
  ticketCard: {
    backgroundColor: TICKET_PAPER,
    borderBottomWidth: 11,
    borderColor: TICKET_GREEN,
    borderRadius: 12,
    borderTopWidth: 8,
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  ticketBody: {
    backgroundColor: TICKET_PAPER,
    borderColor: TICKET_GREEN,
    borderTopWidth: 5,
    paddingBottom: 13,
    paddingHorizontal: 9,
    paddingTop: 11,
  },
  previewCard: {
    alignItems: "center",
    paddingTop: 9,
    width: "100%",
    height: 180,
    position: "relative",
  },
  previewHeading: {
    color: "#FFFFFF",
    fontFamily: "Poppins_700Bold",
    fontSize: 13,
  },
  previewTimerWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  previewTimerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    minHeight: TIMER_DIGIT_HEIGHT,
  },
  previewTimerDigitSlot: {
    alignItems: "center",
    height: TIMER_DIGIT_HEIGHT,
    justifyContent: "center",
    overflow: "hidden",
    width: TIMER_DIGIT_WIDTH,
  },
  previewTimerColon: {
    color: "#FF0000",
    fontFamily: "Poppins_800ExtraBold",
    fontSize: 44,
    includeFontPadding: false,
    lineHeight: TIMER_DIGIT_HEIGHT,
    textAlign: "center",
    width: 22,
  },
  previewTimer: {
    color: "#FF0000",
    fontFamily: "Poppins_700Bold",
    fontSize: 44,
    lineHeight: TIMER_DIGIT_HEIGHT,
  },
  previewTimerDigitText: {
    includeFontPadding: false,
    textAlign: "center",
    width: TIMER_DIGIT_WIDTH,
  },
  previewTimerDigitOverlay: {
    alignItems: "center",
    height: TIMER_DIGIT_HEIGHT,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: TIMER_DIGIT_WIDTH,
  },
  previewLabel: {
    color: "#C7B2A8",
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
  },
  previewDate: {
    color: "#FF9F00",
    fontFamily: "Poppins_500Medium",
    fontSize: 23,
    lineHeight: 30,
    marginTop: 3,
  },
  previewCode: {
    color: "#DDD2C9",
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    lineHeight: 15,
    marginTop: 1,
  },
  previewTransfer: {
    color: "#DDD2C9",
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    lineHeight: 15,
  },
  railwaysLeft: {
    color: "#D1CBC8",
    fontFamily: "Poppins_700Bold",
    fontSize: 11,
    left: -22,
    letterSpacing: 1,
    position: "absolute",
    top: 77,
    transform: [{ rotate: "-90deg" }],
  },
  railwaysRight: {
    color: "#D1CBC8",
    fontFamily: "Poppins_700Bold",
    fontSize: 11,
    letterSpacing: 1,
    position: "absolute",
    right: -13,
    top: 75,
    transform: [{ rotate: "90deg" }],
  },
  previewDash: {
    borderLeftColor: "rgba(255,255,255,0.68)",
    borderLeftWidth: 1,
    borderStyle: "dashed",
    bottom: 0,
    position: "absolute",
    top: 0,
    width: 0,
  },
  previewDashLeft: {
    left: 31,
  },
  previewDashRight: {
    right: 31,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  rowMain: {
    color: "#473B37",
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
  },
  rowRightStrong: {
    color: "#473B37",
    fontFamily: "Poppins_700Bold",
    fontSize: 13,
  },
  stationRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    marginTop: 1,
  },
  station: {
    color: "#413632",
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
  },
  distance: {
    color: "#766863",
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },
  rowSub: {
    color: "#756965",
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
  },
  rightCol: {
    alignItems: "flex-end",
  },
  planText: {
    color: "#756965",
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    marginTop: 3,
  },
  passengerDivider: {
    height: 32,
    justifyContent: "center",
    marginBottom: 5,
    marginTop: 3,
    position: "relative",
  },
  divider: {
    backgroundColor: "#E6D3CE",
    height: 1,
  },
  edgeNotch: {
    backgroundColor: NOTCH_FILL,
    borderRadius: 17,
    height: 34,
    position: "absolute",
    top: -1,
    width: 34,
    zIndex: 2,
  },
  leftNotch: {
    left: -26,
  },
  rightNotch: {
    right: -26,
  },
  noteBanner: {
    backgroundColor: "rgba(226, 110, 79, 0.14)",
    borderRadius: 10,
    marginHorizontal: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noteText: {
    color: "#E26E4F",
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    lineHeight: 18,
  },
  qrWrap: {
    alignItems: "center",
    backgroundColor: TICKET_PAPER,
    width: "100%",
    marginTop: 8,
    paddingBottom: 17,
    paddingTop: 22,
  },
  didYouKnow: {
    backgroundColor: TICKET_PAPER,
    borderTopColor: "#E3CECB",
    borderTopWidth: 1,
    paddingBottom: 6,
    paddingHorizontal: 10,
    paddingTop: 12,
  },
  didYouKnowTitle: {
    color: "#36302B",
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    marginBottom: 8,
  },
  didYouKnowText: {
    color: "#9B8E84",
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  dynamicPreview: {
    color: "#FFFFFF",
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    textAlign: "center",
  },
});
