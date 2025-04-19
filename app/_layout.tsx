import "../styles/global.css";
import "react-native-reanimated";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as Updates from "expo-updates";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import * as SplashScreen from "expo-splash-screen";
import { ThemedToast } from "@/components/ThemedToast";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemeProvider } from "@react-navigation/native";
import { MyDarkTheme, MyLightTheme } from "@/constants/Colors";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          Toast.show({
            type: "info",
            text1: "Atualização disponível",
            text2: "Baixando atualização...",
          });

          await Updates.fetchUpdateAsync();

          Toast.show({
            type: "info",
            text1: "Atualização pronta",
            text2: "Reiniciando o app...",
          });

          setTimeout(() => {
            Updates.reloadAsync();
          }, 1500);
        }
      } catch (e) {
        if (!__DEV__) {
          Toast.show({ type: "error", text1: "Erro ao buscar atualização" });
        }
      }
    }

    if (loaded) {
      SplashScreen.hideAsync();
      checkForUpdates();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? MyDarkTheme : MyLightTheme}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen
          name="(stack)"
          options={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      <Toast
        autoHide
        swipeable
        avoidKeyboard
        position="bottom"
        config={{
          success: (props) => <ThemedToast {...props} type="success" />,
          error: (props) => <ThemedToast {...props} type="error" />,
          info: (props) => <ThemedToast {...props} type="info" />,
        }}
      />
    </ThemeProvider>
  );
}
