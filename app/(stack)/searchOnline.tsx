import axios from "axios";
import { Theme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme, ActivityIndicator } from "react-native";
import { useScannerStore } from "@/store/useScannerHistoryStore";
import { ThemedInput } from "@/components/ThemedInput/ThemedInput";
import { View, FlatList, Animated, Pressable, StyleSheet } from "react-native";

export type SearchOnlineType = {
  realizado: "S" | "N";
  descricao: string;
  data_hora: string;
  leitor: string;
  setor: string;
};

const SearchOnline = () => {
  const router = useRouter();
  const { url } = useLocalSearchParams();
  const scheme = useColorScheme() ?? "light";
  const [data, setData] = useState<SearchOnlineType[]>([]);
  const [loading, setLoading] = useState(false);
  const clearHistory = useScannerStore((state) => state.clearHistory);

  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const [searchValue, setSearchValue] = useState(
    __DEV__ ? "0005558680561892" : ""
  );
  const listRef = useRef<FlatList>(null);
  const lastOffsetY = useRef(0);
  const colors = Colors[scheme];

  const onScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const direction = currentOffset > lastOffsetY.current ? "down" : "up";
    lastOffsetY.current = currentOffset;

    Animated.timing(headerTranslateY, {
      toValue: direction === "down" ? -100 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const OnSearchOnline = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${String(url)}/consulta_acesso`, {
        params: { codigo: searchValue, modo: "json" },
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      setData(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Animated.View
        style={[
          styles.header,
          {
            top: data.length > 5 ? 0 : undefined,
            bottom: data.length < 5 ? 0 : undefined,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
              { backgroundColor: colors.background },
            ]}
          >
            <Ionicons name="arrow-back" size={28} color={colors.icon} />
          </Pressable>
        </View>

        <View style={{ flex: 1, padding: Theme.spacing.md }}>
          <ThemedInput
            scannerEnabled
            value={searchValue}
            onChangeText={setSearchValue}
            onHandlerQrCode={OnSearchOnline}
            onSubmitEditing={OnSearchOnline}
            placeholder="Digite o código..."
          />
        </View>

        {/* <View style={styles.headerRight}>
          <Pressable
            onPress={clearHistory}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
              { backgroundColor: colors.background },
            ]}
          >
            <Ionicons name="qr-code-outline" size={28} color={colors.icon} />
          </Pressable>
        </View> */}
      </Animated.View>

      <View style={[styles.tableHeader, { backgroundColor: colors.icon }]}>
        <ThemedText
          style={[
            styles.th,
            styles.columnBorder,
            { flex: 1, color: colors.text },
          ]}
        >
          Data/Hora
        </ThemedText>
        <ThemedText
          style={[
            styles.th,
            styles.columnBorder,
            { flex: 1, color: colors.text },
          ]}
        >
          Setor
        </ThemedText>
        <ThemedText
          style={[
            styles.th,
            styles.columnBorder,
            { flex: 1, color: colors.text },
          ]}
        >
          Leitor
        </ThemedText>
        <ThemedText
          style={[
            styles.th,
            styles.columnBorder,
            { flex: 0.5, color: colors.text },
          ]}
        >
          Realizado?
        </ThemedText>
        <ThemedText style={[styles.th, { flex: 2, color: colors.text }]}>
          Descrição
        </ThemedText>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.icon} />
        </View>
      ) : (
        <FlatList
          data={data}
          ref={listRef}
          windowSize={5}
          onScroll={onScroll}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          scrollEventThrottle={16}
          removeClippedSubviews
          keyExtractor={(_, index) => index.toString()}
          ListEmptyComponent={
            <ThemedText style={[styles.empty, { color: colors.text }]}>
              {searchValue !== "" ? "Vazio" : "Pesquise..."}
            </ThemedText>
          }
          renderItem={({ item }: { item: SearchOnlineType }) => {
            const success = item.realizado === "S";
            const color = success ? colors.success : colors.error;

            return (
              <View style={[styles.tableRow, { backgroundColor: color }]}>
                <ThemedText
                  style={[
                    styles.td,
                    styles.columnBorder,
                    { flex: 1, color: colors.text },
                  ]}
                >
                  {new Date(item.data_hora).toLocaleString()}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.td,
                    styles.columnBorder,
                    { flex: 1, color: colors.text },
                  ]}
                >
                  {item.setor}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.td,
                    styles.columnBorder,
                    { flex: 1, color: colors.text },
                  ]}
                >
                  {item.leitor}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.td,
                    styles.columnBorder,
                    { flex: 0.5, color: colors.text },
                  ]}
                >
                  {item.realizado}
                </ThemedText>
                <ThemedText
                  style={[styles.td, { flex: 2, color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.descricao}
                </ThemedText>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

export default SearchOnline;

const styles = StyleSheet.create({
  header: {
    zIndex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
  },
  iconButton: { padding: Theme.spacing.sm, borderRadius: 50 },
  pressed: { opacity: 0.6 },
  tableHeader: {
    flexDirection: "row",
    borderWidth: Theme.border.xs,
    paddingHorizontal: Theme.spacing.sm,
  },
  tableRow: {
    borderTopWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: Theme.border.xs,
    paddingHorizontal: Theme.spacing.sm,
  },
  th: { textAlign: "center", fontWeight: "700", fontSize: 12 },
  td: { textAlign: "center", fontWeight: "500", fontSize: 10 },
  columnBorder: { borderRightWidth: Theme.border.xs },
  empty: {
    textAlign: "center",
    marginTop: Theme.spacing.lg,
    fontSize: Theme.fontSize.md,
  },
});
