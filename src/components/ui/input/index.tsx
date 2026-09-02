import EyeClosedIcon from "@/components/icons/EyeClosedIcon";
import React, { ReactNode, forwardRef } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import MaskInput, { Mask } from "react-native-mask-input";
import UIPicker from "../picker";
import Typography from "../typography";
import { styles } from "./index.styled";
import EyeOpenedIcon from "@/components/icons/EyeOpenedIcon";
import CalendarPicker from "../calender";

interface UITextInputProps extends TextInputProps {
  label?: string;
  labelStyle?: TextStyle;
  requiredLabel?: boolean;
  requiredLabelStyle?: TextStyle;
  addonBefore?: ReactNode;
  addonBeforeProps?: {
    containerStyle?: ViewStyle;
    showDivider?: boolean;
  };
  containerStyle?: ViewStyle;
  wrapperStyle?: ViewStyle;
  inputStyle?: TextStyle;
  pickerAddonProps?: any;
  password?: boolean;
  helperText?: string;
  error?: boolean;
  mask?: Mask | (string | RegExp)[];
  onChangeText?: (text: string, rawText?: string) => void;
  boxed?: boolean;
}

const UITextInput = forwardRef<TextInput, UITextInputProps>(({
  label,
  labelStyle,
  requiredLabel = false,
  requiredLabelStyle,
  addonBefore,
  addonBeforeProps,
  containerStyle,
  wrapperStyle,
  inputStyle,
  pickerAddonProps,
  password = false,
  helperText = "",
  error = false,
  editable = true,
  mask,
  onChangeText,
  ...rest
}, ref) => {
  const [focused, setFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isEmpty, setIsEmpty] = React.useState(() => {
    if (typeof rest.value === 'string') {
      return rest.value.length === 0;
    }
    if (typeof rest.defaultValue === 'string') {
      return rest.defaultValue.length === 0;
    }
    return true;
  });

  React.useEffect(() => {
    if (typeof rest.value === 'string') {
      setIsEmpty(rest.value.length === 0);
    }
  }, [rest.value]);

  const InputComponent = mask ? MaskInput : TextInput;

  let calendarPickerProps: any = null;
  let calendarPickerStyle: any = null;

  if (pickerAddonProps && pickerAddonProps.type === 'calendar') {
    const { type: _type, style: inlineStyle, ...restProps } = pickerAddonProps;
    calendarPickerProps = restProps;
    calendarPickerStyle = inlineStyle;
  }

  const placeholderColor = error ? "#E53935" : "#B5B5B5";

  const handleTextChange = (text: string, rawText?: string) => {
    setIsEmpty(text.length === 0);
    if (onChangeText) {
      onChangeText(text, rawText);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Typography
          variant="medium"
          style={[styles.label, labelStyle]}
        >
          {label}
          {requiredLabel ? (
            <Typography variant="medium" style={[styles.requiredAsterisk, requiredLabelStyle]}>
              *
            </Typography>
          ) : null}
        </Typography>
      ) : null}

      <View
        style={[
          rest.boxed ? styles.boxedWrapper : styles.inputWrapper,
          wrapperStyle,
          !editable && styles.inputWrapperDisabled,
          !rest.boxed && focused && !error && editable && { borderBottomColor: "#8B8B8B" },
          !rest.boxed && error && styles.inputWrapperError,
        ]}
      >
        {calendarPickerProps ? (
          <CalendarPicker
            inline
            {...calendarPickerProps}
            style={[styles.calendarInline, calendarPickerStyle]}
          />
        ) : (
          <>
            {pickerAddonProps ? (
              <View style={styles.addonContainer}>
                <UIPicker inline {...pickerAddonProps} />
                <View style={styles.verticalDivider} />
              </View>
            ) : addonBefore ? (
              <View style={[styles.addonContainer, addonBeforeProps?.containerStyle]}>
                {addonBefore}
                {(addonBeforeProps?.showDivider ?? true) && <View style={styles.verticalDivider} />}
              </View>
            ) : null}

            <InputComponent
              ref={ref}
              style={[
                rest.boxed ? styles.boxedInput : styles.input,
                inputStyle,
                !editable && { color: "#808080" },
                (addonBefore || pickerAddonProps) && styles.inputWithAddon,
                error && styles.inputError,
                isEmpty && (rest.boxed ? styles.boxedPlaceholderInput : styles.placeholderInput),
              ]}
              editable={editable}
              placeholderTextColor={placeholderColor}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              secureTextEntry={password && !showPassword}
              mask={mask}
              onChangeText={handleTextChange}
              multiline={rest.boxed ? true : rest.multiline}
              numberOfLines={rest.boxed ? (rest.numberOfLines ?? 4) : rest.numberOfLines}
              textAlignVertical={rest.boxed ? "top" : (rest as any).textAlignVertical}
              {...rest}
            />

            {password && (
              <TouchableOpacity style={{ marginRight: 10 }} onPress={() => setShowPassword((prev) => !prev)}>
                {showPassword ? <EyeOpenedIcon /> : <EyeClosedIcon />}
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {helperText ? (
        <Text style={[styles.helperText, error && styles.helperTextError]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});

export default UITextInput;
