import axios from "axios";
import * as Haptics from "expo-haptics";
import Result from "@/components/app/Result";
import Scanner from "@/components/app/Scanner";
import Toast from "react-native-toast-message";
import React, { useState, useEffect } from "react";
import ThemedLoader from "@/components/ThemedLoader";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  View,
  Platform,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

NfcManager.start();

const ScannerScreen = () => {
  const router = useRouter();
  const [readNfc, setReadNfc] = useState(false);
  const [loading, setLoading] = useState(false);
  const { url, pin, enableNfc } = useLocalSearchParams();
  const [date, setDate] = useState<ApiResponse | undefined>(undefined);

  const handleScannedValue = async (value: string) => {
    if (loading) return;

    setLoading(true);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const formData = new FormData();
      formData.append("pin_number", String(pin));
      formData.append("qrcode_value", value);

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
          text1: "Error!",
          text2: "Não foi possível comunicar com a URL fornecida!",
        });
        router.back();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Erro ao escanear",
        text2: error?.response?.data?.message || "Tente novamente",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Platform.OS === "android") {
      if (enableNfc === "true") {
        if (readNfc === false) {
          handleStartReading();
        }
      }
    }
  }, []);

  useFocusEffect(() => {
    const onBackPress = () => {
      return true;
    };

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
        handleScannedValue(tag.id);
      }
    } catch (error) {
    } finally {
      NfcManager.cancelTechnologyRequest();
      setReadNfc(false);
    }
  };

  return (
    <View style={[styles.container]}>
      {loading ? (
        <ThemedLoader />
      ) : !date ? (
        <>
          {enableNfc === "true" && (
            <View style={styles.buttonContainer}>
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
            </View>
          )}

          <Scanner
            text={`Aponte para um QR Code ${
              enableNfc === "true" ? "ou coloque a tag sobre o NFC" : ""
            }`}
            onScan={handleScannedValue}
          />
        </>
      ) : (
        <Result
          date={date}
          url={String(url)}
          onReset={() => {
            setLoading(false);
            setDate(undefined);

            if (enableNfc === "true") {
              if (readNfc == false) {
                handleStartReading();
              }
            }
          }}
        />
      )}
    </View>
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
    zIndex: 100,
    width: "90%",
    marginTop: 20,
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: {
    padding: 15,
    paddingLeft: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ScannerScreen;
