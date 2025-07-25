import React from "react";
import { ThemedText } from "../ThemedText";
import { Theme } from "../../constants/Theme";
import { Colors } from "../../constants/Colors";
import { View, StyleSheet, useColorScheme } from "react-native";

interface Props {
  row?: boolean;
  labelCenter?: boolean;
  label: string | undefined;
  children: React.ReactNode;
}

export const ThemedInputContainer = ({
  label,
  children,
  row = false,
  labelCenter = false,
}: Props) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: row ? "row" : "column",
          gap: row ? 5 : 0,
        },
      ]}
    >
      {label && (
        <ThemedText
          style={[
            styles.label,
            { color: theme.text, textAlign: labelCenter ? "center" : "left" },
          ]}
        >
          {label}
        </ThemedText>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    marginVertical: Theme.spacing.xs,
  },
  label: {
    fontSize: Theme.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
});
