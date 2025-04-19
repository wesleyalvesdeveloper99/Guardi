import React from "react";
import * as Haptics from "expo-haptics";
import { Theme } from "../constants/Theme";
import { Colors } from "../constants/Colors";
import {
  Pressable,
  Text,
  useColorScheme,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export const ThemedButton = ({ title, onPress, disabled }: Props) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const handlePress = () => {
    onPress();
  };

  const handlePressIn = (ev: GestureResponderEvent) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled ? theme.icon : theme.tint,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colorScheme === "dark" ? "#000" : "#fff" },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.radius.md,
    alignItems: "center",
    marginVertical: Theme.spacing.sm,
  },
  text: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
  },
});
