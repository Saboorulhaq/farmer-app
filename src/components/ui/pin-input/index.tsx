import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';

interface OtpInputProps {
  code: string[];
  setCode: (code: string[]) => void;
  pinCount: number;
  error?: boolean;
  editable?: boolean;
  secure?: boolean;
}

export interface PINInputRef {
  focusFirst: () => void;
  focusIndex: (index: number) => void;
}

const PINInput = forwardRef<PINInputRef, OtpInputProps>(({
  code,
  setCode,
  pinCount,
  error,
  editable = true,
  secure = true,
}, ref) => {
  const inputRefs = useRef<TextInput[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const focusInput = (index: number) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index].focus();
    }
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    focusFirst: () => {
      focusInput(0);
    },
    focusIndex: (index: number) => {
      focusInput(index);
    },
  }));

  const handleChangeText = (text: string, index: number) => {
    if (text.length > 1) return;
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < pinCount - 1) {
      focusInput(index + 1);
    } else if (text && index === pinCount - 1) {
      // Last input filled - dismiss keyboard
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  return (
    <View style={styles.container}>
      {[...Array(pinCount)].map((_, index) => {
        const isFocused = focusedIndex === index;
        const hasValue = !!code[index];

        return (
          <TextInput
            key={index}
            ref={r => {
              if (r) inputRefs.current[index] = r;
            }}
            style={[
              styles.inputBox,
              (isFocused || hasValue) && {
                borderColor: '#8B8B8B',
                borderBottomWidth: 2,
              },
              error && { borderColor: '#D32F2F' },
              !editable && { opacity: 0.5 },
            ]}
            maxLength={1}
            keyboardType="number-pad"
            onChangeText={text => handleChangeText(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            value={secure ? (code[index] ? '•' : '') : code[index] || ''}
            selectTextOnFocus
            textContentType="oneTimeCode"
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            editable={editable}
          />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 6,
    alignSelf: 'center',
  },
  inputBox: {
    flex: 1,
    minWidth: 36,
    height: 48,
    borderBottomWidth: 1,
    borderColor: '#DDD',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default PINInput;
