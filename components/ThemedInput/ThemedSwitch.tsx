import React from "react";
import { Theme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { View, Switch, StyleSheet, useColorScheme } from "react-native";
import { ThemedInputContainer } from "./ThemedInputContainer";
import {
  Ionicons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

type IconLibrary = "MaterialCommunityIcons" | "Ionicons" | "FontAwesome";

type IconNames = {
  MaterialCommunityIcons: keyof typeof MaterialCommunityIcons.glyphMap;
  Ionicons: keyof typeof Ionicons.glyphMap;
  FontAwesome: keyof typeof FontAwesome.glyphMap;
};

interface Props<T extends IconLibrary> {
  label: string;
  value: boolean;
  iconLibrary?: T;
  IconLeft?: IconNames[T];
  IconRight?: IconNames[T];
  onValueChange: (value: boolean) => void;
}

export const ThemedSwitch = <T extends IconLibrary>({
  label,
  value,
  IconLeft,
  IconRight,
  iconLibrary,
  onValueChange,
}: Props<T>) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const renderIcon = (
    iconName?: any,
    library: T = "MaterialCommunityIcons" as any
  ) => {
    if (!iconName) return null;

    const iconColor = theme.icon;

    switch (library) {
      case "MaterialCommunityIcons":
        return (
          <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
        );
      case "Ionicons":
        return <Ionicons name={iconName} size={24} color={iconColor} />;
      case "FontAwesome":
        return <FontAwesome name={iconName} size={24} color={iconColor} />;
      default:
        return null;
    }
  };

  return (
    <ThemedInputContainer row labelCenter label={label}>
      <View style={styles.row}>
        {IconLeft && (
          <View style={styles.icon}>{renderIcon(IconLeft, iconLibrary)}</View>
        )}
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: theme.icon, true: theme.success }}
          thumbColor={value ? theme.tint : theme.icon}
        />
        {IconRight && (
          <View style={styles.icon}>{renderIcon(IconRight, iconLibrary)}</View>
        )}
      </View>
    </ThemedInputContainer>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    // paddingHorizontal: Theme.spacing.sm,
  },
});
