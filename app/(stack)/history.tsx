import React from "react";
import { Theme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useScannerStore } from "@/store/useScannerHistoryStore";
import { View, Share, FlatList, Pressable, StyleSheet } from "react-native";

export default function HistoryScreen() {
  const scheme = useColorScheme();

  const history = useScannerStore((state) => state.history);
  const clearHistory = useScannerStore((state) => state.clearHistory);

  const handleShare = async () => {
    const content = history
      .map((item) => {
        let sharedMessage = `[${new Date(item.createdAt).toLocaleString()}] ${
          item.channel
        }: ${item.value}`;
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
    <FlatList
      ListHeaderComponent={
        <View style={styles.header}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="share-outline"
              size={28}
              color={Colors[scheme!].icon}
            />
          </Pressable>
          <Pressable
            onPress={clearHistory}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={28}
              color={Colors[scheme!].icon}
            />
          </Pressable>
        </View>
      }
      data={history}
      contentContainerStyle={styles.list}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={[styles.card, { borderColor: Colors[scheme!].icon }]}>
          <ThemedText
            style={{ color: Colors[scheme!].icon }}
            type="defaultSemiBold"
            numberOfLines={1}
          >
            {`[${new Date(item.createdAt).toLocaleString()}] ${item.channel}: ${
              item.value
            }`}
          </ThemedText>
          {item.error && (
            <ThemedText style={{ color: Colors[scheme!].error }} type="default">
              Erro: {JSON.stringify(item.error.message, null, 2)}
            </ThemedText>
          )}
          {item.resultData && (
            <ThemedText
              style={{ color: Colors[scheme!].success }}
              type="default"
            >
              Result: {JSON.stringify(item.resultData, null, 2)}
            </ThemedText>
          )}
        </View>
      )}
      ListEmptyComponent={
        <ThemedText style={styles.empty}>Nenhum histórico</ThemedText>
      }
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    gap: Theme.spacing.lg,
    justifyContent: "center",
    paddingTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
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
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.border.lg,
    borderWidth: Theme.border.sm,
    padding: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  item: {
    fontSize: Theme.fontSize.md,
  },
  empty: {
    textAlign: "center",
    marginTop: Theme.spacing.lg,
    fontSize: Theme.fontSize.md,
  },
});
