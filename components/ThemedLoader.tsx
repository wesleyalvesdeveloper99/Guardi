import { ActivityIndicator, StyleSheet } from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { BlurView } from "expo-blur";

export default function ThemedLoader() {
  const theme = useColorScheme() ?? "light";
  const themeColors = Colors[theme];

  return (
    <BlurView intensity={60} tint={theme} style={styles.container}>
      <ActivityIndicator size="large" color={themeColors.text} />
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
