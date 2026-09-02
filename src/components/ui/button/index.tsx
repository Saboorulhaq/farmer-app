import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { styles } from './index.styled';

interface UIButtonProps {
  loading?: boolean;
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  activeStyle?: ViewStyle;
}

export function UIContainedButton({
  loading = false,
  onPress,
  disabled = false,
  children,
  size = 'medium',
  style = {},
  textStyle,
  activeStyle,
}: UIButtonProps) {
  // Compute the actual disabled state
  const isDisabled = disabled || loading;

  // Compute base button styles
  const baseButtonStyles = React.useMemo(() => {
    let baseStyles: ViewStyle[] = [styles.button, styles[size]];
    if (style) baseStyles.push(style);
    if (isDisabled) {
      baseStyles.push(styles.containedDisabled);
    } else {
      baseStyles.push(styles.contained);
    }
    return baseStyles;
  }, [isDisabled, size, style]);

  // Style function for Pressable
  const getButtonStyle = React.useCallback(({
    pressed,
  }: PressableStateCallbackType): ViewStyle[] => {
    if (pressed && !isDisabled) {
      return [...baseButtonStyles, styles.pressed, activeStyle].filter(Boolean) as ViewStyle[];
    }
    return baseButtonStyles;
  }, [baseButtonStyles, isDisabled, activeStyle]);

  const textStyles = React.useMemo(() => {
    return [
      styles.text,
      styles.primaryText,
      styles[`${size}Text`],
      disabled && !loading && styles.disabledText,
      textStyle,
    ].filter(Boolean) as TextStyle[];
  }, [disabled, loading, size, textStyle]);

  return (
    <Pressable
      key={isDisabled ? 'disabled' : 'enabled'}
      style={getButtonStyle}
      onPress={onPress}
      disabled={isDisabled}
      android_ripple={{
        color: 'rgba(255, 255, 255, 0.3)',
        borderless: false,
      }}
    >
      {loading ? (
        <ActivityIndicator color="#099453" style={{ marginRight: 8 }} />
      ) : (
        <Text style={textStyles} numberOfLines={0}>{children}</Text>
      )}
    </Pressable>
  );
}

export function UIOutlinedButton({
  onPress,
  disabled = false,
  children,
  size = 'medium',
  style = {},
  textStyle,
  activeStyle,
}: UIButtonProps) {
  // Compute base button styles
  const baseButtonStyles = React.useMemo(() => {
    let baseStyles: ViewStyle[] = [styles.button, styles[size]];
    if (style) baseStyles.push(style);
    if (disabled) {
      baseStyles.push(styles.outlinedDisabled);
    } else {
      baseStyles.push(styles.outlined);
    }
    return baseStyles;
  }, [disabled, size, style]);

  // Style function for Pressable
  const getButtonStyle = React.useCallback(({
    pressed,
  }: PressableStateCallbackType): ViewStyle[] => {
    if (pressed && !disabled) {
      return [...baseButtonStyles, styles.pressed, activeStyle].filter(Boolean) as ViewStyle[];
    }
    return baseButtonStyles;
  }, [baseButtonStyles, disabled, activeStyle]);

  const textStyles = React.useMemo(() => {
    let baseStyles: TextStyle[] = [
      styles.text,
      styles.outlinedText,
      styles[`${size}Text`],
    ];
    if (textStyle) baseStyles.push(textStyle);
    if (disabled) {
      baseStyles.push(styles.outlinedDisabledText);
    }
    return baseStyles;
  }, [disabled, size, textStyle]);

  return (
    <Pressable
      style={getButtonStyle}
      onPress={onPress}
      disabled={disabled}
      android_ripple={{
        color: 'rgba(255, 255, 255, 0.3)',
        borderless: false,
      }}
    >
      <Text style={textStyles}>{children}</Text>
    </Pressable>
  );
}

interface UIIconButtonProps extends PressableProps {
  children: React.ReactNode;
  style?: ViewStyle;
  activeStyle?: ViewStyle;
}

export function UIIconButton({
  children,
  style,
  activeStyle,
  disabled,
  hitSlop,
  ...props
}: UIIconButtonProps) {
  const getButtonStyle = ({
    pressed,
  }: PressableStateCallbackType): ViewStyle[] => {
    const baseStyles = [styles.iconButton, style];

    if (pressed && !disabled) {
      baseStyles.push(styles.pressed, activeStyle);
    }

    return baseStyles.filter(Boolean) as ViewStyle[];
  };

  // Default hitSlop to extend touch area beyond visual bounds
  const defaultHitSlop = { top: 10, bottom: 10, left: 10, right: 10 };

  return (
    <Pressable 
      style={getButtonStyle} 
      disabled={disabled} 
      hitSlop={hitSlop ?? defaultHitSlop}
      {...props}
    >
      {children}
    </Pressable>
  );
}
