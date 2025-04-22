import React from "react";
import { Theme } from "../constants/Theme";
import {
  View,
  ViewProps,
  ScrollView,
  DimensionValue,
  KeyboardAvoidingView,
} from "react-native";

interface ThemedScreenContrainerProps extends ViewProps {
  children: React.ReactNode;
  withPadding?: boolean;
}

export const ThemedScreenContrainer = ({
  children,
  withPadding = true,
}: ThemedScreenContrainerProps) => {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={"padding"}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: withPadding ? Theme.spacing.lg : 0,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            width: Theme.layout.containerWidth as DimensionValue,
            rowGap: Theme.spacing.xl,
          }}
        >
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
