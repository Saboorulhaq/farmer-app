import React from 'react';
import {
  Image,
  ImageSourcePropType,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import UITypography from '@/components/ui/typography';
import LocationIcon from '@/components/icons/LocationIcon';
import { styles } from '../index.styled';

type Props = {
  title: string;
  gps: string;
  image: ImageSourcePropType;
  crops?: string[];
  onPress?: () => void;
  acceptsProviderCredit?: boolean;
};

export default function ViewMoreBuyerCard({
  title,
  gps,
  image,
  crops,
  onPress,
  acceptsProviderCredit,
}: Props) {
  const capitalizeCropName = (crop: string): string => {
    return crop.charAt(0).toUpperCase() + crop.slice(1).toLowerCase();
  };

  const displayCrops =
    crops && crops.length > 0 
      ? crops.map(crop => capitalizeCropName(crop))
      : ['Maize', 'Cocoa', 'Rice', 'Pepper'];

  return (
    <TouchableOpacity
      style={styles.moreCard}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.moreCardRow}>
        <Image source={image} style={styles.moreImage} resizeMode="cover" />
        <View style={styles.moreContent}>
          <UITypography variant="semiBold" style={styles.moreTitle}>
            {title}
          </UITypography>
          <View style={[styles.moreMeta, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
              <LocationIcon size={12} color="#8B5CF6" />
              <UITypography variant="medium" style={[styles.moreMetaText, { flex: 1 }]} numberOfLines={2}>
                {gps}
              </UITypography>
            </View>
            {acceptsProviderCredit === true && (
              <View style={moreTagStyles.badge}>
                <UITypography variant="medium" style={moreTagStyles.badgeText}>
                  Provider Credit
                </UITypography>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.dealsRowHeader}>
        <UITypography variant="medium" style={styles.dealsLabel}>
          Deals In:
        </UITypography>
        <View style={styles.dealsRow}>
          {displayCrops.slice(0, 4).map((crop, index) => (
            <View key={`${crop}-${index}`} style={styles.tag}>
              <UITypography variant="medium" style={styles.tagText}>
                {crop}
              </UITypography>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const moreTagStyles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#099453',
    alignSelf: 'center',
    flexShrink: 0,
  },
  badgeText: { fontSize: 11, color: '#FFFFFF' },
});
