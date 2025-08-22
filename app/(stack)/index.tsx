import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import { FontAwesome } from "@expo/vector-icons";
import NfcManager from "react-native-nfc-manager";
import { ThemedLogo } from "@/components/ThemedLogo";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput/ThemedInput";
import { ThemedSwitch } from "@/components/ThemedInput/ThemedSwitch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedScreenContrainer } from "@/components/ThemedScreenContrainer";
import {
  View,
  Alert,
  Linking,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import axios from "axios";

const isValidUrl = (url: string) => {
  const pattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z0-9]{2,6}\/?.*$/;
  return pattern.test(url);
};

export default function HomeScreen() {
  const [url, setUrl] = useState(
    __DEV__ ? "http://nuhsistemas.app.br:9000" : ""
  );
  const [enableKeyboard, setEnableKeyboard] = useState(true);
  const [nfcAvailable, setNfcAvailable] = useState(false);
  const [enableNfc, setEnableNfc] = useState(nfcAvailable);
  const [enableFacial, setEnableFacil] = useState(false);
  const [pin, setPin] = useState(__DEV__ ? "198" : "");
  const [enableCam, setEnableCam] = useState(true);
  const colorScheme = useColorScheme() ?? "light";
  const [loading, setLoading] = useState(false);
  const theme = Colors[colorScheme];
  const router = useRouter();

  const checkNfc = async () => {
    const supported = await NfcManager.isSupported();
    if (supported) {
      const enabled = await NfcManager.isEnabled();
      setNfcAvailable(enabled);
      if (!enabled) {
        Alert.alert(
          "NFC desativado",
          "Ative o NFC e permita o acesso do app. Quando estiver tudo certo, o app vai reiniciar para continuar.",
          [
            {
              text: "Abrir Configurações",
              onPress: () => Linking.openSettings(),
            },
            { text: "Cancelar", style: "cancel" },
          ]
        );
      }
    } else {
      setNfcAvailable(false);
    }
  };

  const loadStoredData = async () => {
    try {
      const storedUrl = await AsyncStorage.getItem("apiUrl");
      const storedPin = await AsyncStorage.getItem("apiPin");
      if (storedUrl) setUrl(storedUrl);
      if (storedPin) setPin(storedPin);
    } catch {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível carregar os dados salvos.",
      });
    }
  };

  useEffect(() => {
    checkNfc();
    loadStoredData();
  }, []);

  useEffect(() => {
    setEnableNfc(nfcAvailable);
  }, [nfcAvailable]);

  const goToNextScreen = async () => {
    if (!url.trim() || !pin.trim()) {
      Toast.show({
        type: "error",
        text1: "Campos obrigatórios",
        text2: "Preencha todos os campos antes de continuar.",
      });
      return;
    }

    if (!isValidUrl(url)) {
      Toast.show({
        type: "error",
        text1: "URL inválida",
        text2: "Por favor, insira uma URL válida.",
      });
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.get(`${String(url)}/get_area_acesso_pin`, {
        params: { pin },
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      const setor = data || undefined;

      if (setor) {
        await AsyncStorage.setItem("apiSetor", setor);
      }

      await AsyncStorage.setItem("apiUrl", url);
      await AsyncStorage.setItem("apiPin", pin);

      router.replace({
        pathname: "/(stack)/scanner",
        params: {
          url,
          pin,
          setor: String(setor),
          enableNfc: String(enableNfc),
          enableCam: String(enableCam),
          enableFacial: String(enableFacial),
          enableKeyboard: String(enableKeyboard),
        },
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Falha ao buscar setor. Verifique os dados e tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          router.push("/(stack)/history");
        }}
        style={{
          right: "5%",
          zIndex: 100,
          position: "absolute",
          top: Constants.statusBarHeight,
        }}
      >
        <FontAwesome name="history" size={24} color={theme.icon} />
      </TouchableOpacity>
      <ThemedScreenContrainer>
        <ThemedLogo width={"50%"} aspectRatio={1} />

        <View style={{ width: "100%", flexDirection: "column" }}>
          <ThemedSwitch
            value={enableKeyboard}
            label="Ativar Teclado:"
            onValueChange={(value) => setEnableKeyboard(value)}
          />
          <ThemedSwitch
            value={enableCam}
            label="Ativar Cam:"
            onValueChange={(value) => setEnableCam(value)}
          />
          <ThemedSwitch
            value={enableFacial}
            label="Ativar Facial:"
            onValueChange={(value) => setEnableFacil(value)}
          />
          {nfcAvailable && (
            <ThemedSwitch
              value={enableNfc}
              label="Ativar NFC:"
              onValueChange={(value) => setEnableNfc(value)}
            />
          )}
        </View>

        <ThemedInput
          value={url}
          scannerEnabled
          inputMode={"text"}
          label="URL da API:"
          onChangeText={setUrl}
          placeholder="Digite a URL da API"
        />

        <ThemedInput
          value={pin}
          label="Código PIN:"
          inputMode={"numeric"}
          onChangeText={setPin}
          placeholder="Digite o código PIN"
        />

        <ThemedButton
          loading={loading}
          title="Continuar"
          onPress={goToNextScreen}
        />
      </ThemedScreenContrainer>
    </>
  );
}
