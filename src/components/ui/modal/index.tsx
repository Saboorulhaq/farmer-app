import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  ModalProps,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

interface BottomModalProps extends ModalProps {
  backdropClose?: boolean;
}

export default function UIBottomModal({
  visible,
  children,
  onRequestClose,
  backdropClose = false,
}: BottomModalProps) {
  return (
    <Modal
      animationType="slide"
      visible={visible}
      transparent
      onRequestClose={onRequestClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "transparent",
        }}
      >
        <TouchableWithoutFeedback
          style={styles.overlay}
          onPress={backdropClose ? onRequestClose : () => {}}
        >
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.container}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: width,
    justifyContent: "flex-end",
    backgroundColor: "#00000080",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00000080", // semi-transparent background
  },
  container: {
    backgroundColor: "white",
    borderTopEndRadius: 20,
    borderTopLeftRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 12,
  },
});
