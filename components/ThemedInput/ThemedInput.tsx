import Scanner from "../app/Scanner";
import React, { useState } from "react";
import { Theme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { masks, MasksType } from "@/constants/Masks";
import { ThemedInputContainer } from "./ThemedInputContainer";
import {
  View,
  TextInput,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from "react-native";

interface Props {
  label?: string;
  value: string;
  mask?: MasksType;
  placeholder?: string;
  scannerEnabled?: boolean;
  secureTextEntry?: boolean;
  onSubmitEditing?: () => void;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "email-address" | "numeric";
  inputMode?: "none" | "text" | "numeric" | "tel" | "search" | "email" | "url";
}

export const ThemedInput = ({
  mask,
  label,
  value,
  inputMode,
  placeholder,
  onChangeText,
  onSubmitEditing,
  scannerEnabled = false,
  secureTextEntry = false,
  keyboardType = "default",
}: Props) => {
  const [scanning, setScanning] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const handleOnChangeText = (text: string) => {
    let value = text;
    if (mask) {
      value = masks[mask](String(value));
    }
    onChangeText && onChangeText(value);
  };

  const handleIconPress = () => {
    if (!scannerEnabled) return;
    setScanning(true);
  };

  const handleQRCodeScan = (data: string) => {
    setScanning(false);
    onChangeText(data);
  };

  const closeScanner = () => {
    setScanning(false);
  };

  return (
    <ThemedInputContainer label={label}>
      <View style={styles.row}>
        <TextInput
          value={value}
          autoCapitalize="none"
          inputMode={inputMode}
          placeholder={placeholder}
          keyboardType={keyboardType}
          onSubmitEditing={onSubmitEditing}
          onChangeText={handleOnChangeText}
          placeholderTextColor={theme.icon}
          secureTextEntry={secureTextEntry}
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: theme.icon,
              backgroundColor: theme.background,
            },
          ]}
        />
        {scannerEnabled && !scanning && (
          <Ionicons
            size={24}
            color={theme.icon}
            style={styles.icon}
            name="qr-code-outline"
            onPress={handleIconPress}
          />
        )}
      </View>

      {scannerEnabled && scanning && (
        <View
          style={[
            styles.scannerContainer,
            {
              borderRadius: Theme.radius.md,
            },
          ]}
        >
          <Scanner onScan={handleQRCodeScan} />
          <TouchableOpacity style={styles.closeButton} onPress={closeScanner}>
            <Ionicons name="close-circle" size={30} color={theme.icon} />
          </TouchableOpacity>
        </View>
      )}
    </ThemedInputContainer>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    height: 50,
    padding: Theme.spacing.md,
    fontSize: Theme.fontSize.md,
    borderWidth: Theme.border.xs,
    borderRadius: Theme.radius.md,
    marginVertical: Theme.spacing.sm,
  },
  icon: {
    paddingHorizontal: Theme.spacing.sm,
  },
  scannerContainer: {
    justifyContent: "center",
    position: "relative",
    alignItems: "center",
    overflow: "hidden",
    height: 400,
    flex: 1,
  },
  closeButton: {
    top: 0,
    right: 0,
    padding: 10,
    position: "absolute",
  },
});
