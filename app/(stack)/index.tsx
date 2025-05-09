import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import NfcManager from "react-native-nfc-manager";
import { Linking, Alert, View } from "react-native";
import { ThemedLogo } from "@/components/ThemedLogo";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput/ThemedInput";
import { ThemedSwitch } from "@/components/ThemedInput/ThemedSwitch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedScreenContrainer } from "@/components/ThemedScreenContrainer";

const isValidUrl = (url: string) => {
  const pattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z0-9]{2,6}\/?.*$/;
  return pattern.test(url);
};

export default function HomeScreen() {
  const [enableKeyboard, setEnableKeyboard] = useState(true);
  const [nfcAvailable, setNfcAvailable] = useState(false);
  const [enableNfc, setEnableNfc] = useState(nfcAvailable);
  const [url, setUrl] = useState("http://nuhsistemas.app.br:9000");
  const [pin, setPin] = useState("1001");
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

      console.log(storedUrl);

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

    await AsyncStorage.setItem("apiUrl", url);
    await AsyncStorage.setItem("apiPin", pin);

    router.replace({
      pathname: "/(stack)/scanner",
      params: {
        url,
        pin,
        enableNfc: String(enableNfc),
        enableKeyboard: String(enableKeyboard),
      },
    });
  };

  return (
    <ThemedScreenContrainer>
      <ThemedLogo width={"50%"} aspectRatio={1} />

      <View style={{ width: "100%", flexDirection: "row" }}>
        <ThemedSwitch
          IconLeft="close-box"
          IconRight="keyboard"
          value={enableKeyboard}
          label="Ativar Teclado:"
          iconLibrary="MaterialCommunityIcons"
          onValueChange={(value) => setEnableKeyboard(value)}
        />

        {nfcAvailable && (
          <ThemedSwitch
            IconRight="nfc"
            value={enableNfc}
            label="Ativar NFC:"
            IconLeft="close-box"
            iconLibrary="MaterialCommunityIcons"
            onValueChange={(value) => setEnableNfc(value)}
          />
        )}
      </View>

      <ThemedInput
        value={url}
        scannerEnabled
        inputMode={"url"}
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

      <ThemedButton title="Continuar" onPress={goToNextScreen} />
    </ThemedScreenContrainer>
  );
}
