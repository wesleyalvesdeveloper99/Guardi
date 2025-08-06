import React from "react";
import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        navigationBarHidden: true,
        navigationBarTranslucent: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Stack.Screen
        name="scanner"
        options={{
          title: "Scanner",
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          orientation: "landscape",
          title: "History",
        }}
      />
    </Stack>
  );
}
