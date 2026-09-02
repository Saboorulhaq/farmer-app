import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { View, ViewStyle, Platform, Text } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { styles } from '../index.styled';

type Props = {
  onCaptured: (uri: string) => void;
  onCleared?: () => void;
  style?: ViewStyle;
  initialDataUri?: string | null;
};

export type SignaturePadRef = {
  clearSignature: () => void;
  readSignature: () => void;
};

const SignaturePad = forwardRef<SignaturePadRef, Props>(
  ({ onCaptured, onCleared, style, initialDataUri }, forwardedRef) => {
    const ref = useRef<any>(null);
    const [hasSignature, setHasSignature] = useState(!!initialDataUri);

    // Expose methods to parent
    useImperativeHandle(forwardedRef, () => ({
      clearSignature: () => {
        if (ref.current) {
          ref.current.clearSignature();
        }
        setHasSignature(false);
      },
      readSignature: () => {
        if (ref.current) {
          ref.current.readSignature();
        }
      },
    }));

    const handleSignature = (sig: string) => {
      setHasSignature(true);
      onCaptured(sig);
    };

    const handleEmpty = () => {
      // Canvas is empty, no signature to capture
      setHasSignature(false);
    };

    const handleClear = () => {
      setHasSignature(false);
      if (onCleared) onCleared();
    };

    const handleError = (error: any) => {
      console.log('Signature pad error:', error);
    };

    const handleEnd = () => {
      ref.current?.readSignature();
    };

    // After WebView loads, restore saved signature and notify parent
    useEffect(() => {
      if (!initialDataUri) return;
      const timer = setTimeout(() => {
        ref.current?.readSignature();
      }, 600);
      return () => clearTimeout(timer);
    }, []);

    const injectedJavaScript = initialDataUri
      ? `(function(){function tryLoad(){if(window.signaturePad){window.signaturePad.fromDataURL('${initialDataUri}');}else{setTimeout(tryLoad,50);}}tryLoad();})();true;`
      : undefined;

    return (
      <View style={style}>
        <View style={styles.padWrapper}>
          <SignatureCanvas
            ref={ref}
            onEnd={handleEnd}
            onOK={handleSignature}
            onEmpty={handleEmpty}
            onClear={handleClear}
            onError={handleError}
            autoClear={false}
            nestedScrollEnabled={Platform.OS === 'android'}
            descriptionText=""
            clearText=""
            confirmText=""
            penColor="#000000"
            backgroundColor="rgba(255,255,255,0)"
            webStyle={`
              .m-signature-pad {
                box-shadow: none;
                border: none;
                height: 100%;
              }
              .m-signature-pad--body {
                border: none;
              }
              .m-signature-pad--footer {
                display: none;
              }
              body, html {
                height: 100%;
                margin: 0;
                padding: 0;
              }
            `}
            webviewProps={{
              cacheEnabled: true,
              androidLayerType: 'hardware',
              ...(injectedJavaScript && { injectedJavaScript }),
              ...(Platform.OS === 'ios' && {
                scrollEnabled: false,
                bounces: false,
                showsVerticalScrollIndicator: false,
                showsHorizontalScrollIndicator: false,
              }),
            }}
          />
          {!hasSignature && (
            <View style={styles.placeholderContainer} pointerEvents="none">
              <Text style={styles.placeholderText}>Sign inside the box.</Text>
            </View>
          )}
        </View>
      </View>
    );
  },
);

export default SignaturePad;
