import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import UICheckbox from "../checkbox";

interface UICheckboxCardProps {
  label: string;
  checked: boolean;
  onPress: () => void;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

const UICheckboxCard: React.FC<UICheckboxCardProps> = ({
  label,
  checked,
  onPress,
  style,
  labelStyle,
}) => (
  <TouchableOpacity
    style={[styles.card, style]}
    activeOpacity={0.9}
    onPress={onPress}
  >
    <Text style={[styles.label, labelStyle]}>{label}</Text>
    <UICheckbox checked={checked} onPress={onPress} size={32} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: "#232323",
    fontWeight: "600",
    flex: 1,
    flexWrap: "wrap",
  },
});

export default UICheckboxCard;
