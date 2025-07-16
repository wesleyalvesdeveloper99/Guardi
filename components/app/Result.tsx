import { View, StyleSheet, Image, useColorScheme, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { Colors } from "../../constants/Colors";
import { ThemedButton } from "../ThemedButton";
import { Theme } from "../../constants/Theme";
import { ThemedText } from "../ThemedText";
import { Audio } from "expo-av";

const Result = ({
  url,
  date,
  onReset,
}: {
  url: string;
  date: {
    success: number;
    user_name: string;
    url_user_image: string;
    message: string;
  };
  onReset: () => void;
}) => {
  const [seconds, setSeconds] = useState(5);
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (seconds === 0) {
      onReset();
    }
  }, [seconds]);

  useEffect(() => {
    const playSound = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
        });

        await Audio.Sound.createAsync(
          date.success === 1
            ? require("../../assets/sounds/success.mp3")
            : require("../../assets/sounds/error.mp3"),
          { shouldPlay: true }
        );
      } catch (error: any) {
        Alert.alert(
          "Erro ao reproduzir áudio",
          error?.message || String(error)
        );
      }
    };
    playSound();
  }, []);

  return (
    <View
      style={[
        styles.resultContainer,
        {
          backgroundColor: date.success === 1 ? "green" : "red",
        },
      ]}
    >
      {date.url_user_image && (
        <Image
          source={{ uri: `${url}${date.url_user_image}` }}
          style={[styles.userImage, { borderColor: currentColors.icon }]}
        />
      )}
      <ThemedText
        style={{
          fontWeight: "bold",
          fontSize: Theme.fontSize.lg,
          marginBottom: Theme.spacing.sm,
          color: "white",
        }}
      >
        {date.success === 1 ? "Liberado" : "Bloqueado"}
      </ThemedText>
      <ThemedText style={[styles.messageText, { color: "white" }]}>
        {date.message}
      </ThemedText>
      <ThemedText style={[styles.userNameText, { color: "white" }]}>
        {date.user_name}
      </ThemedText>
      <View style={styles.buttonContainer}>
        <ThemedButton title={`Fechar (${seconds}s)`} onPress={onReset} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  resultContainer: {
    alignItems: "center",
    justifyContent: "center",
    margin: Theme.spacing.lg,
    padding: Theme.spacing.xl,
    borderRadius: Theme.radius.md,
  },
  userImage: {
    width: 300,
    height: 300,
    borderWidth: Theme.border.sm,
    borderRadius: Theme.radius.full,
    marginBottom: Theme.spacing.lg,
  },
  messageText: {
    fontWeight: "500",
    textAlign: "center",
    fontSize: Theme.fontSize.md,
    marginBottom: Theme.spacing.sm,
  },
  userNameText: {
    fontSize: Theme.fontSize.md,
    marginBottom: Theme.spacing.sm,
  },
  buttonContainer: {
    marginTop: Theme.spacing.md,
    width: "100%",
  },
});

export default Result;
