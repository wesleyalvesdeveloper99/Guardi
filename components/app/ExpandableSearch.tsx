import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ThemedInput } from "@/components/ThemedInput/ThemedInput";
import React, { useState, useRef, useEffect } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";

const ExpandableSearch = () => {
  const [manualValue, setManualValue] = useState("");
  const inputRef = useRef<any>(null);
  const colors = Colors[useColorScheme() ?? "light"];

  const [expandedState, setExpandedState] = useState(false);
  const borderLeftRadiusAnim = useSharedValue(0);
  const expanded = useSharedValue(false);
  const widthAnim = useSharedValue(60);

  const animatedStyle = useAnimatedStyle(() => ({
    width: widthAnim.value,
    borderTopLeftRadius: borderLeftRadiusAnim.value,
    borderBottomLeftRadius: borderLeftRadiusAnim.value,
  }));

  useEffect(() => {
    if (expanded.value) {
      widthAnim.value = withTiming(width - 40, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      borderLeftRadiusAnim.value = withTiming(45, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      widthAnim.value = withTiming(60, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      borderLeftRadiusAnim.value = withTiming(100, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [expandedState]);

  const expand = () => {
    expanded.value = true;
    setExpandedState(true);
  };

  const collapse = () => {
    expanded.value = false;
    setExpandedState(false);
  };

  const handleScannedValue = async (value: string) => {
    collapse();
    router.push({
      pathname: "/(stack)/webView",
      params: {
        url: `http://nuhsistemas.app.br:9000/consulta_acesso/?codigo=${value}`,
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={StyleSheet.absoluteFill}
    >
      <Animated.View
        style={[
          styles.iconButton,
          animatedStyle,
          { backgroundColor: colors.background },
        ]}
      >
        {!expandedState ? (
          <TouchableOpacity onPress={expand} style={styles.icon}>
            <FontAwesome name="search" size={20} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.inputContainer}>
            <ThemedInput
              inputMode="text"
              value={manualValue}
              onChangeText={setManualValue}
              placeholder="Digite o código manual"
              getRef={(ref) => {
                inputRef.current = ref;
              }}
              onSubmitEditing={() => {
                handleScannedValue(manualValue);
              }}
            />

            <TouchableOpacity onPress={collapse} style={styles.icon}>
              <FontAwesome name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  iconButton: {
    height: 60,
    right: "5%",
    bottom: 30,
    zIndex: 100,
    overflow: "hidden",
    borderRadius: 100,
    alignSelf: "center",
    flexDirection: "row",
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 5,
    height: "100%",
    width: "100%",
  },
  icon: {
    height: 60,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ExpandableSearch;
