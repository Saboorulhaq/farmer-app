import React from 'react';
import { Image, ImageSourcePropType, View, TouchableOpacity, StyleSheet } from 'react-native';
import UITypography from '@/components/ui/typography';
import LocationIcon from '@/components/icons/LocationIcon';
import { styles } from '../index.styled';

type BuyerCardProps = {
  title: string;
  gps: string;
  image: ImageSourcePropType;
  onPress?: () => void;
  acceptsProviderCredit?: boolean;
};

export default function BuyerCard({ title, gps, image, onPress, acceptsProviderCredit }: BuyerCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.card}>
      <Image source={image} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardContent}>
        <UITypography variant="semiBold" style={styles.cardTitle}>{title}</UITypography>
        <View style={styles.cardMeta}>
          <LocationIcon size={14} color="#8B5CF6" />
          <UITypography variant="medium" style={styles.cardMetaText}>{gps}</UITypography>
        </View>
        {acceptsProviderCredit === true && (
          <View style={cardTagStyles.tag}>
            <UITypography variant="medium" style={cardTagStyles.tagText}>
              Provider Credit
            </UITypography>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const cardTagStyles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    marginTop: 6,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: '#E6F7ED',
  },
  tagText: { fontSize: 9, color: '#099453' },
});
