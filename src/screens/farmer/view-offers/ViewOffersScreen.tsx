import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Pressable,
  Text,
  ActivityIndicator,
} from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { styles } from './ViewOffersScreen.styled';
import UITypography from '@/components/ui/typography';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';
import { UIIconButton } from '@/components/ui/button';
import SendArrowIcon from './SendArrowIcon';
import {
  submissionsService,
  LenderOffer,
} from '@/services/submissions.service';

function AcceptedCheckIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Circle cx="11" cy="11" r="10.5" stroke="#099453" strokeWidth="1.5" fill="#fff" />
      <Polyline
        points="6.5,11.5 9.5,14.5 15.5,8.5"
        stroke="#099453"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

type ViewOffersScreenRouteProp = RouteProp<
  { ViewOffers: { submissionId: string } },
  'ViewOffers'
>;

export default function ViewOffersScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<ViewOffersScreenRouteProp>();
  const { submissionId } = route.params;

  const [offers, setOffers] = useState<LenderOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, [submissionId]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await submissionsService.getLenderOffers(submissionId);
      setOffers(response.data ?? []);
    } catch (error) {
      console.log('Error fetching lender offers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <ActivityIndicator size="large" color="#099453" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: top + 16 }]}>
        <UIIconButton onPress={() => navigation.goBack()}>
          <ArrowLeftIcon />
        </UIIconButton>
        <Text style={styles.headerTitle}>My Offers</Text>
      </View>

      {/* Offers List */}
      <View style={styles.listContainer}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {offers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <UITypography variant="medium" style={styles.emptyText}>
                No offers available yet
              </UITypography>
            </View>
          ) : (
            offers.map((offer) => {
              const hasAnyAcceptedOffer = offers.some(o => o.offer_status?.toLowerCase() === 'accepted');
              const isAccepted = offer.offer_status?.toLowerCase() === 'accepted';
              const isRejected = offer.offer_status?.toLowerCase() === 'rejected';
              const shadowStyle = isAccepted
                ? styles.offerCardShadowAccepted
                : isRejected
                ? styles.offerCardShadowRejected
                : styles.offerCardShadow;

              return (
              <View key={offer.id} style={styles.offerCardWrapper}>
                <View style={styles.offerCard}>
                  {/* Shadow behind card */}
                  <View style={shadowStyle} />

                  {/* Accepted badge */}
                  {isAccepted && (
                    <View style={styles.acceptedBadge}>
                      <AcceptedCheckIcon />
                    </View>
                  )}

                {/* Bank Name Banner */}
                <View style={styles.bankNameBanner}>
                  <Text style={styles.bankNameText}>{offer.lender_name}</Text>
                </View>

                {/* Offer Details */}
                <View style={styles.offerDetailsContainer}>
                  <View style={styles.offerDetailRow}>
                    <Text style={styles.offerDetailLabel}>Approved Limit</Text>
                    <Text style={styles.offerDetailValue}>
                      Rs {Number(offer.approved_limit).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.offerDetailRow}>
                    <Text style={styles.offerDetailLabel}>Interest Rate</Text>
                    <Text style={styles.offerDetailValue}>
                      {offer.interest_rate}
                    </Text>
                  </View>
                </View>

                {/* View Details Button */}
                <Pressable
                  style={isAccepted ? styles.viewDetailsButtonAccepted : styles.viewDetailsButton}
                  onPress={() =>
                    navigation.navigate('OfferDetail', {
                      submissionId,
                      offerId: offer.id,
                      lenderName: offer.lender_name,
                      offerStatus: offer.offer_status,
                      hasAnyAcceptedOffer,
                    })
                  }
                >
                  <SendArrowIcon width={16} height={16} color={isAccepted ? '#FFFFFF' : '#099453'} />
                  <Text style={isAccepted ? styles.viewDetailsTextAccepted : styles.viewDetailsText}>View Details</Text>
                </Pressable>
                </View>
              </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}
