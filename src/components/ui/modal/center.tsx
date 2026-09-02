import React from "react";
import { Modal, ModalProps, StyleSheet, TouchableWithoutFeedback, View } from "react-native";

interface CenterModalProps extends ModalProps {
  backdropClose?: boolean;
}

export default function UICenterModal({
  visible,
  children,
  onRequestClose,
  backdropClose = false,
}: CenterModalProps) {
  return (
    <Modal animationType="fade" visible={visible} transparent onRequestClose={onRequestClose} style={styles.mainContainer}>
      <View style={styles.root}>
        <TouchableWithoutFeedback onPress={backdropClose ? onRequestClose : () => {}}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.container}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: "#00000000",
  },
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00000080",
  },
  container: {
    width: "90%",
    borderRadius: 20,
    overflow: "visible",
    alignItems: "center",
    paddingHorizontal: 0,
  },
});

