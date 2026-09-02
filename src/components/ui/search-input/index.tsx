import React from "react";
import { View, TouchableOpacity, TextInput as RNTextInput, ViewStyle, TextStyle } from "react-native";
import debounce from "lodash.debounce";
import UITextInput from "../input";
import SearchIcon from "@/components/icons/SearchIcon";
import CrossIcon from "@/components/icons/CrossIcon";
import { styles } from "./index.styled";

type UISearchInputProps = {
  value?: string;
  defaultValue?: string;
  onChangeText?: (text: string) => void;
  onSearch?: (query: string) => void;
  debounceMs?: number;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  wrapperStyle?: ViewStyle;
  showClear?: boolean;
  onClear?: () => void;
};

export default function UISearchInput({
  value,
  defaultValue,
  onChangeText,
  onSearch,
  debounceMs = 300,
  placeholder = "Search buyers by name.",
  autoFocus,
  disabled,
  containerStyle,
  inputStyle,
  wrapperStyle,
  showClear = true,
  onClear,
}: UISearchInputProps) {
  const [internal, setInternal] = React.useState<string>(defaultValue ?? "");
  const inputRef = React.useRef<RNTextInput>(null);

  const query = value !== undefined ? value : internal;

  const debouncedSearch = React.useMemo(() =>
    debounce((q: string) => {
      if (onSearch) onSearch(q);
    }, debounceMs), [onSearch, debounceMs]
  );

  const handleChange = (text: string) => {
    if (value === undefined) setInternal(text);
    if (onChangeText) onChangeText(text);
    debouncedSearch(text);
  };

  const handleSubmit = () => {
    if (onSearch) onSearch(query);
  };

  const handleClear = () => {
    if (value === undefined) setInternal("");
    if (onChangeText) onChangeText("");
    if (onClear) onClear();
    if (onSearch) onSearch("");
    inputRef.current?.focus();
  };

  const showClearButton = showClear && query.length > 0 && !disabled;

  return (
    <View style={[styles.container, containerStyle]}>
      <UITextInput
        ref={inputRef}
        value={query}
        onChangeText={handleChange}
        placeholder={placeholder}
        editable={!disabled}
        returnKeyType="search"
        onSubmitEditing={handleSubmit}
        addonBefore={<SearchIcon size={18} color="#404040" />}
        addonBeforeProps={{ containerStyle: styles.addonBeforeContainer, showDivider: false }}
        containerStyle={{ marginBottom: 0 }}
        wrapperStyle={[styles.wrapper, wrapperStyle]}
        inputStyle={[styles.input, inputStyle]}
        autoFocus={autoFocus}
      />
      {showClearButton ? (
        <>
          <View style={styles.divider} />
          <TouchableOpacity onPress={handleClear} style={styles.clearButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <CrossIcon size={14} />
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
}
