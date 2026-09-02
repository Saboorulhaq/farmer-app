import React, { useEffect, useState } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

interface Props {
  images: any[];
  children?: React.ReactNode;
}

const CYCLE_DURATION = 3500;

export const AgentBackgroundCarousel: React.FC<Props> = ({
  images,
  children,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images?.length) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, CYCLE_DURATION);

    return () => clearInterval(timer);
  }, [images]);

  return (
    <ImageBackground
      source={images[index]}
      style={styles.bg}
      // contentFit="cover"
      // transition={CYCLE_DURATION}
      imageStyle={{ opacity: 0.7 }}
    >
      <View style={styles.overlay} />
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { width: "100%", height: "100%", backgroundColor: "black" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
});
