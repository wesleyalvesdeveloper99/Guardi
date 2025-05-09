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

type ModeType = "qrcode" | "face";

const Scanner = ({
  onScan,
  onhandleCapture,
  mode: initialMode = "qrcode",
}: {
  onhandleCapture: (base64: string) => void;
  onScan: (data: string) => void;
  mode?: ModeType;
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState<"off" | "on">("off");
  const [scanned, setScanned] = useState(false);
  const [mode, setMode] = useState<ModeType>(initialMode);
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
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      if (photo?.base64) onhandleCapture(photo.base64);
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
    <CameraView
      ref={cameraRef}
      facing={facing}
      enableTorch={torch === "on"}
      onBarcodeScanned={
        mode === "qrcode" && !scanned ? handleBarCodeScanned : undefined
      }
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        alignItems: "center",
        gap: Theme.spacing.xl,
        justifyContent: "center",
      }}
    >
      <View style={styles.overlay} />

      <View
        style={{
          width: "50%",
          borderColor: "#fff",
          borderWidth: Theme.border.sm,
          aspectRatio: mode === "face" ? 0.75 : 1,
          borderRadius: mode === "face" ? 100 : Theme.radius.md,
        }}
      />

      <View style={{ gap: Theme.spacing.md, flexDirection: "row" }}>
        {facing === "front" && (
          <TouchableOpacity
            onPress={() => setTorch((prev) => (prev === "on" ? "off" : "on"))}
          >
            <Ionicons
              name={torch === "on" ? "flashlight" : "flashlight-outline"}
              color="#fff"
              size={30}
            />
          </TouchableOpacity>
        )}

        {mode === "face" && (
          <TouchableOpacity onPress={handleCapture}>
            <Ionicons name="camera" size={30} color="#fff" />
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
    </CameraView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default Scanner;
