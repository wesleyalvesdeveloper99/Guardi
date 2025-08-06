import * as Sharing from "expo-sharing";
import { Theme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { ThemedText } from "@/components/ThemedText";
import ThemedLoader from "@/components/ThemedLoader";
import { Keyboard, useColorScheme } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedInput } from "@/components/ThemedInput/ThemedInput";
import {
  useScannerStore,
  ScannerHistoryType,
} from "@/store/useScannerHistoryStore";
import {
  View,
  Alert,
  FlatList,
  Animated,
  Pressable,
  StyleSheet,
} from "react-native";

const HistoryScreen = () => {
  const router = useRouter();
  const scheme = useColorScheme();
  const { pin, url } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const history = useScannerStore((state) => state.history);
  const [data, setData] = useState<ScannerHistoryType[]>([]);
  const clearHistory = useScannerStore((state) => state.clearHistory);

  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const [searchValue, setSearchValue] = useState("");
  const listRef = useRef<FlatList>(null);
  const lastOffsetY = useRef(0);

  useEffect(() => {
    if (pin === undefined && history) {
      setData(history);
    }
  }, [history]);

  useEffect(() => {
    if (typeof pin == "string") {
      fetchRemoteData(pin);
    }
  }, [pin]);

  const fetchRemoteData = async (codigo: string) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${String(url)}/consulta_acesso/?codigo=${codigo}`
      );
      const data = await response.json();

      const result: ScannerHistoryType[] = data.map((item: any) => ({
        value: pin,
        channel: item.setordescricao,
        createdAt: item.acessodatahora,
        resultData: {
          event: 0,
          actions: [],
          user_id: 0,
          success: item.acessorealizado ? 1 : 0,
          message: item.acessodescricao,
          user_name: "",
          portal_id: 0,
          user_image: false,
          url_user_image: "",
        },
        modeType: "someMode",
      }));
      setData(result ?? []);
    } catch {
      Alert.alert("Erro", "Falha ao buscar dados remotos.");
    } finally {
      setLoading(false);
      Keyboard.dismiss();
    }
  };

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

  const handleExportCSV = async () => {
    if (!history.length) {
      Alert.alert("Histórico vazio", "Não há dados para exportar.");
      return;
    }

    const header = "Data/Hora;Codigo;Liberado?;Mensagem";
    const rows = history.map((item) => {
      const date = new Date(item.createdAt).toLocaleString();
      const code = (item.value || "").replace(/;/g, ",");
      const liberado = item.resultData?.success === 1 ? "Sim" : "Não";
      const mensagem = (item.resultData?.message || "")
        .replace(/;/g, ",")
        .replace(/\n/g, " ");
      return `${date};${code};${liberado};${mensagem}`;
    });

    const csvContent = [header, ...rows].join("\n");

    try {
      const fileUri = FileSystem.cacheDirectory + "historico.csv";
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert(
          "Erro",
          "Compartilhamento não está disponível neste dispositivo."
        );
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Exportar Histórico CSV",
        UTI: "public.comma-separated-values-text",
      });
    } catch (error) {
      Alert.alert("Erro ao exportar CSV", `${error}`);
    }
  };

  const filteredHistory = data.filter((item) =>
    item.value.toLowerCase().includes(searchValue.toLowerCase())
  );

  if (loading) {
    return <ThemedLoader />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors[scheme!].background }}>
      <Animated.View
        style={[
          styles.header,
          {
            top: filteredHistory.length > 5 ? 0 : undefined,
            bottom: filteredHistory.length < 5 ? 0 : undefined,
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
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color={Colors[scheme!].icon}
            />
          </Pressable>
        </View>
        <View style={{ flex: 1, padding: Theme.spacing.md }}>
          <ThemedInput
            value={searchValue}
            onChangeText={setSearchValue}
            placeholder="Pesquisar código..."
          />
        </View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={handleExportCSV}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="download-outline"
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
      </Animated.View>

      <View
        style={[styles.tableHeader, { backgroundColor: Colors[scheme!].icon }]}
      >
        <ThemedText
          numberOfLines={1}
          style={[
            styles.th,
            styles.columnBorder,
            { flex: 1.5, color: Colors[scheme!].text },
          ]}
        >
          Data/Hora
        </ThemedText>
        <ThemedText
          numberOfLines={1}
          style={[
            styles.th,
            styles.columnBorder,
            { flex: 1, color: Colors[scheme!].text },
          ]}
        >
          Código
        </ThemedText>
        <ThemedText
          numberOfLines={1}
          style={[
            styles.th,
            styles.columnBorder,
            { flex: 1, color: Colors[scheme!].text },
          ]}
        >
          Liberado?
        </ThemedText>
        <ThemedText
          numberOfLines={1}
          style={[styles.th, { flex: 1, color: Colors[scheme!].text }]}
        >
          Mensagem
        </ThemedText>
      </View>

      <FlatList
        ref={listRef}
        windowSize={5}
        onScroll={onScroll}
        data={filteredHistory}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        keyExtractor={(_, index) => index.toString()}
        ListEmptyComponent={
          <ThemedText style={[styles.empty, { color: Colors[scheme!].text }]}>
            Nenhum histórico
          </ThemedText>
        }
        renderItem={({ item }) => {
          const success = item.resultData?.success;
          const color = success
            ? Colors[scheme!].success
            : Colors[scheme!].error;

          return (
            <View style={[styles.tableRow, { backgroundColor: color }]}>
              <ThemedText
                style={[
                  styles.td,
                  styles.columnBorder,
                  { flex: 1.5, color: Colors[scheme!].text },
                ]}
                numberOfLines={1}
              >
                {new Date(item.createdAt).toLocaleString()}
              </ThemedText>
              <ThemedText
                style={[
                  styles.td,
                  styles.columnBorder,
                  { flex: 1, color: Colors[scheme!].text },
                ]}
                numberOfLines={1}
              >
                {item.value}
              </ThemedText>
              <ThemedText
                style={[styles.td, styles.columnBorder, { flex: 1 }]}
                numberOfLines={1}
              >
                {item.resultData?.success === 1 ? "Sim" : "Não"}
              </ThemedText>
              <ThemedText style={[styles.td, { flex: 1 }]} numberOfLines={1}>
                {item.resultData?.message}
              </ThemedText>
            </View>
          );
        }}
      />
    </View>
  );
};

export default HistoryScreen;

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
  iconButton: {
    padding: Theme.spacing.sm,
    borderRadius: 50,
    backgroundColor: "white",
  },
  pressed: {
    opacity: 0.6,
  },
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
  th: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 12,
  },
  td: {
    textAlign: "center",
    fontWeight: "500",
    fontSize: 10,
  },
  columnBorder: {
    borderRightWidth: Theme.border.xs,
  },
  empty: {
    textAlign: "center",
    marginTop: Theme.spacing.lg,
    fontSize: Theme.fontSize.md,
  },
});
