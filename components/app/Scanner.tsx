import { Theme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { ScannerModeType } from "@/interface/other";
import React, { useRef, useState, useEffect } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { View, Text, useColorScheme, TouchableOpacity } from "react-native";

interface Props {
  onHandleCapture?: (base64: string) => void;
  onScan: (data: string) => void;
  mode?: ScannerModeType;
  borderRadius?: number;
}

const Scanner = ({
  onScan,
  onHandleCapture,
  mode = "DEFAULT",
  borderRadius = 0,
}: Props) => {
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
        quality: 0.1,
        skipProcessing: true,
      });

      if (photo?.base64 && onHandleCapture) onHandleCapture(photo.base64);
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
          mode === "DEFAULT" && !scanned ? handleBarCodeScanned : undefined
        }
        style={{
          borderRadius: borderRadius,
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
            height: 300,
            borderColor: "#fff",
            borderWidth: Theme.border.sm,
            aspectRatio: mode === "FACIAL" ? 0.7 : 1,
            borderRadius:
              mode === "FACIAL" ? Theme.radius.full : Theme.radius.md,
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
