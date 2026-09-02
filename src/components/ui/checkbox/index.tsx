import CheckIcon from "@/components/icons/CheckIcon";
import React from "react";
import {
    GestureResponderEvent,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

interface UICheckboxProps {
  checked: boolean;
  onPress: (event: GestureResponderEvent) => void;
  size?: number;
}

const UICheckbox: React.FC<UICheckboxProps> = ({
  checked,
  onPress,
  size = 40,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.checkbox,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderColor: checked ? "#099453" : "#DDD",
        backgroundColor: checked ? "#099453" : "#FFF",
      },
    ]}
    activeOpacity={0.7}
  >
    {checked && (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#099453",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckIcon />
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  checkbox: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
});

export default UICheckbox;
