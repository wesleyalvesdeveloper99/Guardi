import React from "react";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, StyleSheet } from "react-native";

const WebViewScreen = () => {
  const { url } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{
          uri: url as string,
        }}
        allowsBackForwardNavigationGestures
        autoManageStatusBarEnabled
        style={styles.webview}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default WebViewScreen;
