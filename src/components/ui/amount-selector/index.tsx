import React, { useCallback, useEffect, useRef, useState } from 'react';
import {View, TextInput, Platform} from 'react-native';
import Slider from '@react-native-community/slider';
import UITypography from '@/components/ui/typography';
import { styles } from './index.styled';

const clampValue = (v: number, vmin: number, vmax: number) => Math.min(Math.max(v, vmin), vmax);
const snapToStep = (v: number, step: number) => Math.round(v / step) * step;

interface UIAmountSelectorProps {
  title?: string;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  currency?: string;
  onChange?: (value: number) => void;
  onBlur?: (value: number) => void;
  style?: any;
  error?: string | null;
}

export default function UIAmountSelector({
  title = 'Amount',
  value,
  defaultValue = 12500,
  min = 500,
  max = 40000,
  step = 100,
  currency = 'Rs',
  onChange,
  onBlur,
  style,
  error,
}: UIAmountSelectorProps) {
  const [internal, setInternal] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [editingValue, setEditingValue] = useState('');
  const inputRef = useRef<TextInput>(null);
  const editingValueRef = useRef(editingValue);

  // Keep ref in sync with state
  useEffect(() => {
    editingValueRef.current = editingValue;
  }, [editingValue]);

  // Sync internal state when defaultValue changes (for uncontrolled mode)
  // This ensures that if defaultValue changes, internal reflects it when value is undefined
  useEffect(() => {
    if (value === undefined && internal !== defaultValue) {
      setInternal(defaultValue);
    }
  }, [defaultValue, value, internal]);

  // Use value prop if provided (controlled), otherwise use internal state (uncontrolled)
  const current = value ?? internal;

  // Clamp current value for slider display (slider always works with valid range)
  const clampedCurrent = Math.max(min, Math.min(max, current));

  const updateValue = useCallback(
    (v: number, skipClamp: boolean = false) => {
      // For slider interactions, always clamp to valid range
      // For text input, allow invalid values to pass through for validation
      const finalValue = skipClamp ? v : clampValue(snapToStep(v, step), min, max);
      if (onChange) onChange(finalValue);
      if (value === undefined) setInternal(finalValue);
    },
    [min, max, onChange, step, value]
  );

  const handleSliderValueChange = useCallback(
    (sliderValue: number) => {
      updateValue(sliderValue);
    },
    [updateValue]
  );

  const handleSliderComplete = useCallback(
    (sliderValue: number) => {
      // Call onBlur when user releases the slider
      if (onBlur) {
        onBlur(sliderValue);
      }
    },
    [onBlur]
  );

  // Format number with commas
  const formatNumber = (num: number) => {
    return Math.round(num).toLocaleString();
  };

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Set editing value to current value without formatting
    setEditingValue(Math.round(current).toString());
  }, [current]);

  const handleBlur = useCallback(() => {
    const currentEditingValue = editingValueRef.current;
    setIsFocused(false);
    if (currentEditingValue) {
      const numValue = parseInt(currentEditingValue.replace(/,/g, ''), 10);
      if (!isNaN(numValue)) {
        // Don't clamp on blur - let validation handle invalid values
        // This allows errors to be shown instead of auto-correcting
        updateValue(numValue, true);
        // Call parent onBlur if provided (for validation)
        if (onBlur) {
          onBlur(numValue);
        }
      }
    } else {
      // If empty, call onBlur with current value
      if (onBlur) {
        onBlur(current);
      }
    }
    setEditingValue('');
  }, [updateValue, onBlur, current]);

  const handleChangeText = useCallback((text: string) => {
    // Remove non-digit characters
    const digitsOnly = text.replace(/[^\d]/g, '');
    setEditingValue(digitsOnly);

    // Update value immediately as user types (without clamping)
    // This allows invalid values to be stored for validation
    if (digitsOnly) {
      const numValue = parseInt(digitsOnly, 10);
      if (!isNaN(numValue)) {
        updateValue(numValue, true); // Skip clamping to allow invalid values
      }
    } else if (digitsOnly === '') {
      // If empty, set to 0 for validation purposes
      updateValue(0, true);
    }
  }, [updateValue]);

  // Display value: when focused show raw editing value, otherwise show formatted
  // If there's an error and the value is invalid, show the invalid value as-is
  const displayValue = isFocused
    ? editingValue
    : (error && (current < min || current > max))
      ? formatNumber(current) // Show invalid value when there's an error
      : formatNumber(current);

  return (
    <View style={[styles.container, style]}>
      <UITypography variant="semiBold" style={styles.title}>{title}</UITypography>

      <View style={styles.amountInputContainer}>
        <View style={[styles.amountInputWrapper, error && styles.amountInputError]}>
          <UITypography variant="semiBold" style={styles.currencySymbol}>
            {currency}
          </UITypography>
          <TextInput
            ref={inputRef}
            style={styles.amountInput}
            value={displayValue}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            keyboardType="number-pad"
            selectTextOnFocus
          />
        </View>
        {error && (
          <UITypography variant="regular" style={styles.errorText}>
            {error}
          </UITypography>
        )}
      </View>

      <View style={styles.sliderWrap}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={clampedCurrent}
          onValueChange={handleSliderValueChange}
          onSlidingComplete={handleSliderComplete}
          minimumTrackTintColor="#099453"
          maximumTrackTintColor="#D9D9D9"
          thumbTintColor={Platform?.OS === 'ios' ? "#fff" : "#d3d3d3"}
        />
      </View>
      <View style={styles.labelsRow}>
        <UITypography variant="medium" style={styles.limitLabel}>{`${currency}${min.toLocaleString()}`}</UITypography>
        <UITypography variant="medium" style={styles.limitLabel}>{`${currency}${max.toLocaleString()}`}</UITypography>
      </View>
    </View>
  );
}
