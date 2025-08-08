import axios from "axios";
import { Audio } from "expo-av";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/Colors";
import Result from "@/components/app/Result";
import Scanner from "@/components/app/Scanner";
import Toast from "react-native-toast-message";
import { ApiResponse } from "@/interface/response";
import ThemedLoader from "@/components/ThemedLoader";
import { ThemedText } from "@/components/ThemedText";
import { getMachineInfo } from "@/utils/getMachineInfo";
import { CHANNELS_TO_NUMBER } from "@/constants/Scanner";
import { CHANNELS, ScannerModeType } from "@/interface/other";
import { useLocalSearchParams, useRouter } from "expo-router";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { useScannerStore } from "@/store/useScannerHistoryStore";
import { ThemedInput } from "@/components/ThemedInput/ThemedInput";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import ReactNativeSunmiBroadcastScanner from "@linvix-sistemas/react-native-sunmi-broadcast-scanner";
import {
  View,
  Keyboard,
  Platform,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";

NfcManager.start();

const ScannerScreen = () => {
  const router = useRouter();
  const lockRef = useRef(false);
  const manualInputRef = useRef<any>(null);
  const [readNfc, setReadNfc] = useState(false);
  const [loading, setLoading] = useState(false);
  const colors = Colors[useColorScheme() ?? "light"];
  const [manualValue, setManualValue] = useState<any>("");
  const [date, setDate] = useState<ApiResponse | undefined>(undefined);
  const [lastSentByKeyboard, setLastSentByKeyboard] = useState(false);
  const [modeType, setmodeType] = useState<ScannerModeType>("DEFAULT");
  const {
    url,
    pin,
    setor,
    enableCam,
    enableNfc,
    enableFacial,
    enableKeyboard,
  } = useLocalSearchParams();

  const history = useScannerStore((state) => state.history);
  const addHistory = useScannerStore((state) => state.addHistory);

  const successCount = useMemo(() => {
    return history.filter(
      (item) => item.error === undefined && item.resultData?.success == 1
    ).length;
  }, [history]);

  const errorCount = useMemo(() => {
    return history.filter(
      (item) => item.error === undefined && item.resultData?.success != 1
    ).length;
  }, [history]);

  const handleScannedValue = async (
    value: string,
    canal: keyof typeof CHANNELS
  ) => {
    if (lockRef.current || loading || value === "" || value === undefined)
      return;

    if (!(modeType === "FACIAL" && typeof manualValue !== "object")) {
      lockRef.current = true;
      setLoading(true);
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const formData: any = new FormData();

      if (modeType === "FACIAL" && typeof manualValue === "object") {
        formData.append("credenciamento", value);
        manualValue.forEach(([key, value]: any) => {
          formData.append(key, value);
        });
      } else {
        formData.append("pin_number", String(pin));
        formData.append("qrcode_value", value);
        const canalNumber = CHANNELS_TO_NUMBER[canal];
        formData.append("canal", String(canalNumber));
      }

      if (modeType === "FACIAL" && typeof manualValue !== "object") {
        setManualValue(formData._parts);
        return;
      }

      const machine_info = await getMachineInfo();

      formData.append("machine_info", JSON.stringify(machine_info));

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
          modeType,
          value: value,
          channel: canal,
          resultData: resultData,
          createdAt: String(new Date()),
        });
        setDate(resultData);
      } else {
        addHistory({
          modeType,
          value: value,
          channel: canal,
          createdAt: String(new Date()),
          error: { message: "Não foi possível comunicar com a URL fornecida!" },
        });
        Toast.show({
          type: "error",
          text1: `Erro (${canal})`,
          text2: "Não foi possível comunicar com a URL fornecida!",
        });
        await Audio.Sound.createAsync(
          require("../../assets/sounds/error.mp3"),
          { shouldPlay: true }
        );
        router.replace("/(stack)");
      }
    } catch (error: any) {
      addHistory({
        modeType,
        value: value,
        channel: canal,
        error: error || "Error",
        createdAt: String(new Date()),
      });
      console.error(error);
      await Audio.Sound.createAsync(require("../../assets/sounds/error.mp3"), {
        shouldPlay: true,
      });
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

  useEffect(() => {
    if (enableCam === "false") {
      const cleanup = ReactNativeSunmiBroadcastScanner.onBarcodeRead((ev) => {
        handleScannedValue(ev.code, "QRCODE");
      });

      return () => cleanup.remove();
    }
  }, []);

  const handleIconPress = () => {
    setmodeType((prev) => (prev === "DEFAULT" ? "FACIAL" : "DEFAULT"));
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
            <View
              style={[
                styles.buttonContainer,
                { paddingTop: Constants.statusBarHeight },
              ]}
            >
              <View style={{ maxWidth: "20%" }}>
                <ThemedText numberOfLines={1} style={{ color: "red" }}>
                  {errorCount}
                </ThemedText>
              </View>
              {typeof manualValue !== "object" && (
                <>
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
                  {enableCam === "true" && enableFacial === "true" && (
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={handleIconPress}
                    >
                      <MaterialCommunityIcons
                        color={modeType === "FACIAL" ? "green" : "white"}
                        name={"face-agent"}
                        size={40}
                      />
                    </TouchableOpacity>
                  )}
                  {enableKeyboard === "true" && (
                    <ThemedInput
                      inputMode="text"
                      value={manualValue}
                      onChangeText={setManualValue}
                      placeholder="Digite o código manual"
                      getRef={(ref) => {
                        manualInputRef.current = ref;
                      }}
                      onSubmitEditing={() => {
                        setLastSentByKeyboard(true);
                        setManualValue("");
                        handleScannedValue(manualValue, "TECLADO");
                      }}
                    />
                  )}
                </>
              )}
              <View style={{ maxWidth: "20%" }}>
                <ThemedText numberOfLines={1} style={{ color: "green" }}>
                  {successCount}
                </ThemedText>
              </View>
            </View>
            {enableCam === "true" ? (
              <Scanner
                mode={typeof manualValue === "object" ? modeType : "DEFAULT"}
                onHandleCapture={(base64) => {
                  handleScannedValue(base64, "FACIAL");
                }}
                onScan={(value) => handleScannedValue(value, "QRCODE")}
              />
            ) : (
              <MaterialCommunityIcons
                color={colors.icon}
                name="line-scan"
                size={200}
              />
            )}

            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/(stack)/webView",
                });
              }}
              style={[styles.icon, { backgroundColor: colors.background }]}
            >
              <FontAwesome name="search" size={20} color={colors.text} />
            </TouchableOpacity>

            <View
              style={{
                gap: 1,
                bottom: 5,
                padding: 5,
                opacity: 0.8,
                borderRadius: 10,
                alignSelf: "center",
                position: "absolute",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "black",
              }}
            >
              <ThemedText
                numberOfLines={1}
                type="defaultSemiBold"
                style={{
                  textAlign: "center",
                  color: "white",
                  lineHeight: 10,
                  fontSize: 10,
                }}
              >
                {`${pin} - ${setor}`}
              </ThemedText>
              <ThemedText
                numberOfLines={1}
                type="defaultSemiBold"
                style={{
                  textAlign: "center",
                  lineHeight: 10,
                  color: "white",
                  fontSize: 10,
                }}
              >
                {url}
              </ThemedText>
            </View>
          </>
        ) : (
          <Result
            date={date}
            url={String(url)}
            onReset={() => {
              if (
                enableKeyboard === "true" &&
                typeof manualValue !== "object" &&
                lastSentByKeyboard
              ) {
                setTimeout(() => {
                  manualInputRef.current?.focus();
                }, 100);
              }

              setLoading(false);
              setDate(undefined);
              setManualValue("");
              setLastSentByKeyboard(false);

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
  icon: {
    height: 60,
    right: "5%",
    bottom: 30,
    zIndex: 100,
    aspectRatio: 1,
    borderRadius: 100,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    top: 0,
    gap: 20,
    zIndex: 100,
    width: "90%",
    flexDirection: "row",
    position: "absolute",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ScannerScreen;
