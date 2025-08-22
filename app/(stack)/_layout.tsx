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
          orientation: "portrait",
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
      <Stack.Screen
        name="searchOnline"
        options={{
          orientation: "landscape",
        }}
      />
    </Stack>
  );
}
