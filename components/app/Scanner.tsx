import { Theme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { Camera, CameraView } from "expo-camera";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";

const Scanner = ({
  onScan,
  text,
}: {
  onScan: (data: string) => void;
  text?: string;
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const colorScheme = useColorScheme();

  const color = Colors[colorScheme ?? "light"];

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    onScan(data);
  };

  if (hasPermission === null) {
    return <Text style={{ color: color.text }}>Carregando...</Text>;
  }

  if (hasPermission === false) {
    return (
      <Text style={{ color: color.error }}>
        Sem permissão para acessar a câmera
      </Text>
    );
  }

  return (
    <CameraView
      facing="back"
      style={styles.camera}
      onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
    >
      <View
        style={[styles.overlay, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}
      />
      <View
        style={[
          styles.scannerFrame,
          {
            borderColor: "#fff",
            borderWidth: Theme.border.sm,
            borderRadius: Theme.radius.md,
          },
        ]}
      />
      <Text
        style={[
          styles.scannerText,
          {
            color: "#fff",
            fontSize: Theme.fontSize.lg,
          },
        ]}
      >
        {text ? text : "Aponte para um QR Code"}
      </Text>
    </CameraView>
  );
};

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerFrame: {
    width: 250,
    height: 250,
  },
  scannerText: {
    bottom: 40,
    padding: 10,
    fontWeight: "bold",
    textAlign: "center",
    position: "absolute",
  },
});

export default Scanner;
