import axios from "axios";
import * as Haptics from "expo-haptics";
import Result from "@/components/app/Result";
import Scanner from "@/components/app/Scanner";
import Toast from "react-native-toast-message";
import { ApiResponse } from "@/interface/response";
import React, { useState, useEffect } from "react";
import ThemedLoader from "@/components/ThemedLoader";
import { ThemedText } from "@/components/ThemedText";
import { CHANNELS_TO_NUMBER } from "@/constants/Scanner";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CHANNELS, ScannerModeType } from "@/interface/other";
import { useLocalSearchParams, useRouter } from "expo-router";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { useScannerStore } from "@/store/useScannerHistoryStore";
import { ThemedInput } from "@/components/ThemedInput/ThemedInput";
import {
  View,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";

NfcManager.start();

const ScannerScreen = () => {
  const router = useRouter();
  const lockRef = React.useRef(false);
  const [readNfc, setReadNfc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const addHistory = useScannerStore((state) => state.addHistory);
  const [modeType, setmodeType] = useState<ScannerModeType>("QRCODE");
  const [date, setDate] = useState<ApiResponse | undefined>(undefined);
  const { url, pin, enableNfc, enableKeyboard } = useLocalSearchParams();

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
        addHistory({
          value: value,
          channel: canal,
          createdAt: new Date(),
          resultData: resultData,
        });
        setDate(resultData);
      } else {
        addHistory({
          value: value,
          channel: canal,
          createdAt: new Date(),
          error: { message: "Não foi possível comunicar com a URL fornecida!" },
        });
        Toast.show({
          type: "error",
          text1: `Erro (${canal})`,
          text2: "Não foi possível comunicar com a URL fornecida!",
        });
        router.replace("/(stack)");
      }
    } catch (error: any) {
      addHistory({
        value: value,
        channel: canal,
        createdAt: new Date(),
        error: error || "Error",
      });
      console.error(error);
      Toast.show({
        type: "error",
        text1: `Erro (${canal})`,
        text2: "Não foi possível conectar com a URL fornecida!",
      });
      router.replace("/(stack)");
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

  const handleIconPress = () => {
    setmodeType((prev) => (prev === "QRCODE" ? "FACIAL" : "QRCODE"));
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

              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleIconPress}
              >
                <MaterialCommunityIcons
                  color={readNfc ? "green" : "white"}
                  name={modeType !== "QRCODE" ? "qrcode" : "face-agent"}
                  size={40}
                />
              </TouchableOpacity>

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
              mode={modeType}
              onHandleCapture={(base64) => {
                handleScannedValue(base64, "FACIAL");
              }}
              onScan={(value) => handleScannedValue(value, "QRCODE")}
            />
            <View
              style={{
                bottom: 5,
                padding: 5,
                opacity: 0.8,
                width: "90%",
                borderRadius: 10,
                alignSelf: "center",
                position: "absolute",
                paddingHorizontal: 1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "black",
              }}
            >
              <ThemedText
                numberOfLines={1}
                style={{ fontSize: 14, textAlign: "center", color: "white" }}
                type="defaultSemiBold"
              >{`PIN: ${pin} URL: ${url}`}</ThemedText>
            </View>
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
    gap: 20,
    zIndex: 100,
    width: "90%",
    marginTop: 30,
    position: "absolute",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ScannerScreen;
