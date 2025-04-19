import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { Theme } from "@/constants/Theme";
import { BlurView } from "expo-blur";

type ToastType = "success" | "error" | "info";

type Props = {
  type: ToastType;
  text1?: string;
  text2?: string;
};

export function ThemedToast({ type, text1, text2 }: Props) {
  const theme = useColorScheme() ?? "light";
  const themeColors = Colors[theme];

  let borderColor: string;
  let icon: keyof typeof Ionicons.glyphMap;

  switch (type) {
    case "success":
      borderColor = themeColors.success;
      icon = "checkmark-circle";
      break;
    case "error":
      borderColor = themeColors.error;
      icon = "alert-circle";
      break;
    case "info":
      borderColor = themeColors.text;
      icon = "information-circle";
      break;
    default:
      borderColor = themeColors.text;
      icon = "information-circle";
  }

  const Container: React.ElementType = Platform.OS === "ios" ? BlurView : View;

  return (
    <Container
      intensity={60}
      tint={theme}
      style={[
        styles.container,
        {
          borderColor,
          backgroundColor:
            Platform.OS === "android" ? themeColors.background : "transparent",
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={24}
        color={borderColor}
        style={{ marginRight: Theme.spacing.sm }}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: themeColors.text }]}>{text1}</Text>
        {text2 && (
          <Text style={[styles.message, { color: themeColors.icon }]}>
            {text2}
          </Text>
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 4,
    shadowRadius: 4,
    overflow: "hidden",
    shadowOpacity: 0.1,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    padding: Theme.spacing.lg,
    marginTop: Theme.spacing.md,
    borderWidth: Theme.border.sm,
    borderRadius: Theme.radius.lg,
    marginHorizontal: Theme.spacing.md,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    fontWeight: "bold",
    fontSize: Theme.fontSize.md,
  },
  message: {
    fontSize: Theme.fontSize.sm,
    marginTop: Theme.spacing.xs,
  },
});
