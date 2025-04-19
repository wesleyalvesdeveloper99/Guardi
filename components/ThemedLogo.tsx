import React from "react";
import { Image, View, useColorScheme, StyleSheet } from "react-native";

interface Props {
  width?: any;
  aspectRatio?: number;
}

export const ThemedLogo = ({ width = "100%", aspectRatio = 1 }: Props) => {
  const colorScheme = useColorScheme() ?? "light";
  const source =
    colorScheme === "dark"
      ? require("../assets/images/LogoBlack.png")
      : require("../assets/images/logoWhite.png");

  return (
    <View style={[styles.container, { width }]}>
      <View style={{ paddingBottom: `${100 / aspectRatio}%`, width: "100%" }} />
      <Image source={source} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignSelf: "center",
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
