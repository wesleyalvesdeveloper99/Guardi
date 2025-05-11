import { Theme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState, useEffect } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import { ScannerModeType } from "@/interface/other";

interface Props {
  onHandleCapture: (base64: string) => void;
  onScan: (data: string) => void;
  mode?: ScannerModeType;
}

const Scanner = ({ onScan, onHandleCapture, mode = "QRCODE" }: Props) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState<"off" | "on">("off");
  const [scanned, setScanned] = useState(false);
  const [facing, setFacing] = useState<"back" | "front">("back");

  const cameraRef = useRef<CameraView>(null);
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    onScan(data);
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.3,
        skipProcessing: true,
      });
      if (photo?.uri) onHandleCapture(photo.uri);
      // if (photo?.base64) onHandleCapture(photo.base64);
    }
  };

  if (permission?.status === "undetermined") {
    return <Text style={{ color: color.text }}>Carregando...</Text>;
  }

  if (!permission?.granted) {
    return (
      <Text style={{ color: color.error }}>
        Sem permissão para acessar a câmera
      </Text>
    );
  }

  return (
    <>
      <CameraView
        ref={cameraRef}
        facing={facing}
        enableTorch={torch === "on"}
        onBarcodeScanned={
          mode === "QRCODE" && !scanned ? handleBarCodeScanned : undefined
        }
        style={{
          width: "100%",
          height: "100%",
        }}
      />
      <View
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          alignItems: "center",
          position: "absolute",
          gap: Theme.spacing.xl,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: "50%",
            borderColor: "#fff",
            borderWidth: Theme.border.sm,
            aspectRatio: mode === "FACIAL" ? 0.75 : 1,
            borderRadius: mode === "FACIAL" ? 100 : Theme.radius.md,
          }}
        />

        <View
          style={{
            gap: Theme.spacing.md,
            flexDirection: "row",
            alignItems: "baseline",
          }}
        >
          <TouchableOpacity
            disabled={facing === "front"}
            onPress={() => setTorch((prev) => (prev === "on" ? "off" : "on"))}
          >
            <Ionicons
              name={torch === "on" ? "flashlight" : "flashlight-outline"}
              color="#fff"
              size={30}
            />
          </TouchableOpacity>

          {mode === "FACIAL" && (
            <TouchableOpacity onPress={handleCapture}>
              <Ionicons name="camera" size={50} color="#fff" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() =>
              setFacing((prev) => (prev === "back" ? "front" : "back"))
            }
          >
            <Ionicons
              name={
                facing === "back"
                  ? "camera-reverse-outline"
                  : "camera-reverse-sharp"
              }
              size={30}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default Scanner;
