import React, { useRef, useState } from "react";
import {
  Dimensions,
  GestureResponderEvent,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Tooltip from "@/components/ui/tooltip";

type Variant =
  | "thin"
  | "thinItalic"
  | "extraLight"
  | "extraLightItalic"
  | "light"
  | "lightItalic"
  | "regular"
  | "regularItalic"
  | "medium"
  | "mediumItalic"
  | "semiBold"
  | "semiBoldItalic"
  | "bold"
  | "boldItalic"
  | "extraBold"
  | "extraBoldItalic"
  | "black"
  | "blackItalic";

type TypographyTooltipConfig = {
  text: string;
  text2?: string;
  width?: number;
  offset?: number;
  placement?: "top" | "bottom";
  containerStyle?: StyleProp<ViewStyle>;
  arrowStyle?: StyleProp<ViewStyle>;
};

interface UITypographyProps extends TextProps {
  variant?: Variant;
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  tooltipProps?: TypographyTooltipConfig;
  requiredAsterisk?: boolean;
  requiredAsteriskStyle?: StyleProp<TextStyle>;
}

const DEFAULT_TOOLTIP_WIDTH = 250;
const TOOLTIP_HORIZONTAL_PADDING = 16;

export default function UITypography({
  variant = "regular",
  children,
  style,
  tooltipProps,
  requiredAsterisk = false,
  requiredAsteriskStyle,
  ...rest
}: UITypographyProps) {
  const { onPress, ...textProps } = rest;
  const textRef = useRef<View | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({
    top: 0,
    left: 0,
    arrowLeft: DEFAULT_TOOLTIP_WIDTH / 2,
  });

  const tooltipWidth = tooltipProps?.width ?? DEFAULT_TOOLTIP_WIDTH;
  const tooltipOffset = tooltipProps?.offset ?? 8;
  const tooltipPlacement = tooltipProps?.placement ?? "bottom";

  const textContent = (
    <Text
      style={[styles[variant], style]}
      onPress={!tooltipProps ? onPress : undefined}
      {...textProps}
    >
      {children}
      {requiredAsterisk ? (
        <Text style={[styles.requiredAsterisk, requiredAsteriskStyle]}>*</Text>
      ) : null}
    </Text>
  );

  const handlePress = (event: GestureResponderEvent) => {
    onPress?.(event);

    if (!tooltipProps) {
      return;
    }

    if (tooltipVisible) {
      setTooltipVisible(false);
      return;
    }

    const screenWidth = Dimensions.get("window").width;

    if (!textRef.current) {
      setTooltipVisible(true);
      return;
    }

    textRef.current.measureInWindow((x, y, width, height) => {
      const desiredLeft = x + width / 2 - tooltipWidth / 2;
      const clampedLeft = Math.min(
        Math.max(desiredLeft, TOOLTIP_HORIZONTAL_PADDING),
        screenWidth - tooltipWidth - TOOLTIP_HORIZONTAL_PADDING
      );
      const arrowLeft = Math.min(
        Math.max(x + width / 2 - clampedLeft, 12),
        tooltipWidth - 12
      );

      const top =
        tooltipPlacement === "bottom"
          ? y + height + tooltipOffset
          : Math.max(y - tooltipOffset, tooltipOffset);

      setTooltipPosition({
        top,
        left: clampedLeft,
        arrowLeft,
      });
      setTooltipVisible(true);
    });
  };

  if (!tooltipProps) {
    return textContent;
  }

  return (
    <>
      <Pressable
        ref={textRef}
        hitSlop={8}
        onPress={handlePress}
        style={styles.pressableWrapper}
      >
        {textContent}
      </Pressable>
      <Modal
        transparent
        visible={tooltipVisible}
        animationType="fade"
        onRequestClose={() => setTooltipVisible(false)}
      >
        <Tooltip
          visible={tooltipVisible}
          text={tooltipProps.text}
          text2={tooltipProps.text2}
          placement={tooltipPlacement}
          style={[
            styles.tooltipBase,
            {
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              width: tooltipWidth,
            },
            tooltipProps.containerStyle,
          ]}
          arrowStyle={[
            styles.tooltipArrow,
            {
              left: tooltipPosition.arrowLeft - 6,
              marginLeft: 0,
            },
            tooltipProps.arrowStyle,
          ]}
          onClose={() => setTooltipVisible(false)}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  thin: { fontFamily: "Poppins-Thin" },
  thinItalic: { fontFamily: "Poppins-ThinItalic" },
  extraLight: { fontFamily: "Poppins-ExtraLight" },
  extraLightItalic: { fontFamily: "Poppins-ExtraLightItalic" },
  light: { fontFamily: "Poppins-Light" },
  lightItalic: { fontFamily: "Poppins-LightItalic" },
  regular: { fontFamily: "Poppins-Regular" },
  regularItalic: { fontFamily: "Poppins-Italic" },
  medium: { fontFamily: "Poppins-Medium" },
  mediumItalic: { fontFamily: "Poppins-MediumItalic" },
  semiBold: { fontFamily: "Poppins-SemiBold" },
  semiBoldItalic: { fontFamily: "Poppins-SemiBoldItalic" },
  bold: { fontFamily: "Poppins-Bold" },
  boldItalic: { fontFamily: "Poppins-BoldItalic" },
  extraBold: { fontFamily: "Poppins-ExtraBold" },
  extraBoldItalic: { fontFamily: "Poppins-ExtraBoldItalic" },
  black: { fontFamily: "Poppins-Black" },
  blackItalic: { fontFamily: "Poppins-BlackItalic" },
  pressableWrapper: { alignSelf: "flex-start" },
  tooltipBase: { position: "absolute", zIndex: 1000 },
  tooltipArrow: {},
  requiredAsterisk: { color: "#E53935" },
});
