import axios from "axios";
import * as Haptics from "expo-haptics";
import Result from "@/components/app/Result";
import Scanner from "@/components/app/Scanner";
import Toast from "react-native-toast-message";
import React, { useState, useEffect } from "react";
import ThemedLoader from "@/components/ThemedLoader";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { ThemedInput } from "@/components/ThemedInput/ThemedInput";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Platform,
  StyleSheet,
  BackHandler,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

NfcManager.start();

const CHANNELS = {
  // FACIAL: "FACIAL"
  TECLADO: "TECLADO",
  QRCODE: "QRCODE",
  NFC: "NFC",
};

const CHANNELS_TO_NUMBER: Record<string, number> = {
  NFC: 3,
  QRCODE: 1,
  TECLADO: 0,
  FACIAL: 12,
};

const ScannerScreen = () => {
  const router = useRouter();
  const lockRef = React.useRef(false);
  const [readNfc, setReadNfc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const { url, pin, enableNfc, enableKeyboard } = useLocalSearchParams();
  const [date, setDate] = useState<ApiResponse | undefined>(undefined);

  const handleScannedValue = async (
    value: string,
    canal: keyof typeof CHANNELS
  ) => {
    if (lockRef.current || loading || value === "" || value === undefined)
      return;
    lockRef.current = true;
    setLoading(true);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const formData = new FormData();
      formData.append("pin_number", String(pin));
      formData.append("qrcode_value", value);

      const canalNumber = CHANNELS_TO_NUMBER[canal];

      formData.append("canal", String(canalNumber));

      const { data } = await axios.post(
        `${String(url)}/validar_celular`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const resultData = data.result as ApiResponse;

      if (resultData) {
        setDate(resultData);
      } else {
        Toast.show({
          type: "error",
          text1: `Erro (${canal})`,
          text2: "Não foi possível comunicar com a URL fornecida!",
        });
        router.back();
      }
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: `Erro (${canal})`,
        text2: "Não foi possível conectar com a URL fornecida!",
      });
      router.back();
    } finally {
      setTimeout(() => {
        lockRef.current = false;
        setLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    if (Platform.OS === "android" && enableNfc === "true" && !readNfc) {
      handleStartReading();
    }
  }, []);

  useFocusEffect(() => {
    const onBackPress = () => true;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => subscription.remove();
  });

  const handleStartReading = async () => {
    try {
      setReadNfc(true);
      await NfcManager.requestTechnology(NfcTech.MifareClassic, {
        alertMessage: Platform.select({
          ios: "Aproxime uma tag NFC.",
          android: "Aproxime uma tag NFC.",
        }),
      });

      const tag = await NfcManager.getTag();

      if (tag && typeof tag.id === "string") {
        handleScannedValue(tag.id, "NFC");
      }
    } catch {
    } finally {
      NfcManager.cancelTechnologyRequest();
      setReadNfc(false);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.container}>
        {loading ? (
          <ThemedLoader />
        ) : !date ? (
          <>
            <View style={styles.buttonContainer}>
              {enableNfc === "true" && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleStartReading}
                  disabled={Platform.OS === "android"}
                >
                  <MaterialCommunityIcons
                    name="credit-card-wireless-outline"
                    size={40}
                    color={readNfc ? "green" : "white"}
                  />
                </TouchableOpacity>
              )}

              {enableKeyboard === "true" && (
                <ThemedInput
                  inputMode="text"
                  value={manualValue}
                  onChangeText={setManualValue}
                  placeholder="Digite o código manualmente"
                  onSubmitEditing={() => {
                    setManualValue("");
                    handleScannedValue(manualValue, "TECLADO");
                  }}
                />
              )}
            </View>

            <Scanner
              text={`Aponte para um QR Code ${
                enableNfc === "true" ? "ou coloque a tag sobre o NFC" : ""
              }`}
              onScan={(value) => handleScannedValue(value, "QRCODE")}
            />
          </>
        ) : (
          <Result
            date={date}
            url={String(url)}
            onReset={() => {
              setLoading(false);
              setDate(undefined);
              if (
                Platform.OS === "android" &&
                enableNfc === "true" &&
                !readNfc
              ) {
                handleStartReading();
              }
            }}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonContainer: {
    top: 0,
    gap: 10,
    zIndex: 100,
    width: "90%",
    marginTop: 20,
    position: "absolute",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: {
    padding: 15,
    paddingLeft: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    color: "white",
    paddingHorizontal: 15,
    marginTop: 20,
    borderRadius: 10,
    width: "80%",
    backgroundColor: "#222",
  },
});

export default ScannerScreen;
