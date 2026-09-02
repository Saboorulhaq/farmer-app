import React from 'react';
import { Image, ImageSourcePropType, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UIIconButton } from '@/components/ui/button';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';

interface HeaderImageProps {
  source: ImageSourcePropType;
  onBack: () => void;
}

export default function HeaderImage({ source, onBack }: HeaderImageProps) {
  const { top } = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <Image source={source} style={styles.image} />
      <UIIconButton
        onPress={onBack}
        style={[styles.backWrap, { top: top + 8 }]}
        activeStyle={styles.backActive}
      >
        <View style={styles.backInner}>
          <ArrowLeftIcon />
        </View>
      </UIIconButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  backWrap: {
    position: 'absolute',
    left: 16,
    borderRadius: 16,
    shadowColor: '#9FACB9',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  backActive: { opacity: 0.9 },
  backInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFEE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

