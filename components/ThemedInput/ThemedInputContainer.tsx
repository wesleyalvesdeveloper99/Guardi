import React from "react";
import { ThemedText } from "../ThemedText";
import { Theme } from "../../constants/Theme";
import { Colors } from "../../constants/Colors";
import { View, StyleSheet, useColorScheme } from "react-native";

interface Props {
  label: string | undefined;
  children: React.ReactNode;
}

export const ThemedInputContainer = ({ label, children }: Props) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText style={[styles.label, { color: theme.text }]}>
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
    marginVertical: Theme.spacing.xs,
  },
  label: {
    fontSize: Theme.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
});
