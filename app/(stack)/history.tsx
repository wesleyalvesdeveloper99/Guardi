import React from "react";
import { Theme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useScannerStore } from "@/store/useScannerHistoryStore";
import {
  View,
  Share,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";

export default function HistoryScreen() {
  const scheme = useColorScheme();
  const color = scheme === "dark" ? Colors.dark.text : Colors.light.text;
  const bgCard = scheme === "dark" ? "#1e1e1e" : "#f0f0f0";

  const history = useScannerStore((state) => state.history);
  const clearHistory = useScannerStore((state) => state.clearHistory);

  const handleShare = async () => {
    const content = history
      .map((item) => {
        const time = item.createdAt.toLocaleTimeString();
        let sharedMessage = `[${time}] ${item.channel}: ${item.value}`;

        if (item.error) {
          sharedMessage += `\nErro: ${JSON.stringify(
            item.error.message,
            null,
            2
          )}`;
        }

        if (item.resultData) {
          sharedMessage += `\nResultado: ${JSON.stringify(
            item.resultData,
            null,
            2
          )}`;
        }

        return sharedMessage;
      })
      .join("\n\n");

    await Share.share({ message: content });
  };

  return (
    <>
      <View style={styles.header}>
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="share-outline" size={28} color={color} />
        </Pressable>
        <Pressable
          onPress={clearHistory}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="trash-outline" size={28} color={color} />
        </Pressable>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: bgCard }]}>
            <ThemedText numberOfLines={1} style={styles.item}>
              [{item.createdAt.toLocaleTimeString()}] {item.channel}:{" "}
              {item.value}
            </ThemedText>
            {item.error && (
              <ThemedText style={styles.error}>
                Erro: {JSON.stringify(item.error.message, null, 2)}
              </ThemedText>
            )}
            {item.resultData && (
              <ThemedText>
                Result: {JSON.stringify(item.resultData, null, 2)}
              </ThemedText>
            )}
          </View>
        )}
        ListEmptyComponent={
          <ThemedText style={styles.empty}>Nenhum histórico</ThemedText>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  iconButton: {
    padding: Theme.spacing.sm,
    borderRadius: 50,
  },
  pressed: {
    opacity: 0.6,
  },
  list: {
    padding: Theme.spacing.md,
  },
  card: {
    borderRadius: Theme.border.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    elevation: 2,
  },
  item: {
    fontSize: Theme.fontSize.md,
  },
  error: {
    color: "red",
    marginTop: 4,
    fontSize: Theme.fontSize.sm,
  },
  empty: {
    textAlign: "center",
    marginTop: Theme.spacing.lg,
    fontSize: Theme.fontSize.md,
  },
});
