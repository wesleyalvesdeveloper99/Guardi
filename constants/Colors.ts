const tintColorLight = "#000";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    success: "#3FB984",
    error: "#F87171",
  },
  dark: {
    text: "#ECEDEE",
    background: "#222a32",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    success: "#3FB984",
    error: "#F87171",
  },
};

import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";

export const MyLightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    text: Colors.light.text,
    border: Colors.light.text,
    primary: Colors.light.tint,
    card: Colors.light.background,
    notification: Colors.light.tint,
    background: Colors.light.background,
  },
};

export const MyDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    text: Colors.dark.text,
    border: Colors.dark.text,
    primary: Colors.dark.tint,
    card: Colors.dark.background,
    notification: Colors.dark.tint,
    background: Colors.dark.background,
  },
};
