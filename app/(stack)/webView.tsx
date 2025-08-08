import React, { useState } from "react";
import { WebView } from "react-native-webview";
import { SafeAreaView, StyleSheet } from "react-native";
import ExpandableSearch from "@/components/app/ExpandableSearch";

const WebViewScreen = () => {
  const [url, setUrl] = useState();

  console.log(url);

  return (
    <SafeAreaView style={styles.container}>
      <ExpandableSearch setUrl={setUrl} />
      <WebView
        source={{
          uri: url || "",
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
