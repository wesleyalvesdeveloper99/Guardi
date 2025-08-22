import Scanner from "../app/Scanner";
import { Theme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { masks, MasksType } from "@/constants/Masks";
import React, { useRef, useState, useEffect } from "react";
import { ThemedInputContainer } from "./ThemedInputContainer";
import {
  View,
  TextInput,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Modal,
  Dimensions,
  TextInput as RNTextInput,
} from "react-native";

interface Props {
  label?: string;
  value: string;
  mask?: MasksType;
  placeholder?: string;
  scannerEnabled?: boolean;
  secureTextEntry?: boolean;
  onSubmitEditing?: () => void;
  onHandlerQrCode?: () => void;
  onChangeText: (text: string) => void;
  getRef?: (ref: RNTextInput | null) => void;
  onScannerToggle?: (isOpen: boolean) => void;
  keyboardType?: "default" | "email-address" | "numeric";
  inputMode?: "none" | "text" | "numeric" | "tel" | "search" | "email" | "url";
}

export const ThemedInput = ({
  mask,
  label,
  value,
  getRef,
  inputMode,
  placeholder,
  onChangeText,
  onScannerToggle,
  onSubmitEditing,
  onHandlerQrCode,
  scannerEnabled = false,
  secureTextEntry = false,
  keyboardType = "default",
}: Props) => {
  const [scanning, setScanning] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const inputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    if (getRef) {
      getRef(inputRef.current);
    }
  }, [getRef]);

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
    onScannerToggle?.(true);
  };

  const handleQRCodeScan = (data: string) => {
    setScanning(false);
    onScannerToggle?.(false);
    onChangeText(data);
    if (onHandlerQrCode) onHandlerQrCode();
  };

  const closeScanner = () => {
    setScanning(false);
    onScannerToggle?.(false);
  };

  const { width, height } = Dimensions.get("window");
  const scannerWidth = width * 0.8;
  const scannerHeight = height * 0.5;

  return (
    <ThemedInputContainer label={label}>
      <View style={styles.row}>
        <TextInput
          ref={inputRef}
          value={value}
          inputMode={inputMode}
          autoCapitalize="none"
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

      <Modal
        visible={scanning}
        transparent={true}
        statusBarTranslucent
        animationType="slide"
      >
        <TouchableOpacity
          style={styles.modalContainer}
          onPress={closeScanner}
          activeOpacity={1}
        >
          <Scanner borderRadius={12} onScan={handleQRCodeScan} />
        </TouchableOpacity>
      </Modal>
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
  },
  icon: {
    paddingHorizontal: Theme.spacing.sm,
  },
  modalContainer: {
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  scannerWrapper: {
    borderRadius: Theme.radius.md,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
});
