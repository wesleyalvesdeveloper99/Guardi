import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import NfcManager from "react-native-nfc-manager";
import { Linking, Alert, View } from "react-native";
import { ThemedLogo } from "@/components/ThemedLogo";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput/ThemedInput";
import { ThemedSwitch } from "@/components/ThemedInput/ThemedSwitch";
import { ThemedScreenContrainer } from "@/components/ThemedScreenContrainer";

const isValidUrl = (url: string) => {
  const pattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z0-9]{2,6}\/?.*$/;
  return pattern.test(url);
};

export default function HomeScreen() {
  const [enableKeyboard, setEnableKeyboard] = useState(true);
  const [nfcAvailable, setNfcAvailable] = useState(false);
  const [enableNfc, setEnableNfc] = useState(true);
  const [url, setUrl] = useState("");
  const [pin, setPin] = useState("");
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

  useEffect(() => {
    checkNfc();
  }, []);

  const goToNextScreen = () => {
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

    router.push({
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
