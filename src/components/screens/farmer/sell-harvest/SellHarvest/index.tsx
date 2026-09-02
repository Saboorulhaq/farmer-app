import React, { useState } from 'react';
import { View, ScrollView, StatusBar, Pressable, Text, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { styles } from './index.styled';
import UITypography from '@/components/ui/typography';
import { UIIconButton } from '@/components/ui/button';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';
import AggregatorIcon from '@/components/icons/AggregatorIcon';
import ContractIcon from '@/components/icons/ContractIcon';
import CheckIcon from '@/components/icons/CheckIcon';
import { axiosFinancingPrivate } from '@/config/axios';

type SellOption = 'aggregators' | 'forward_sale' | null;

type RouteParams = {
  SellHarvest: {
    harvestData?: {
      crop: string;
      expectedYield: string;
      yieldUnit: string;
      pickupLocation: string;
    };
    submissionId?: string;
    harvestDetailId?: string;
  };
};

const SELL_OPTIONS = [
  {
    id: 'aggregators' as const,
    title: 'Sell to Aggregators',
    tag: 'Fast payout',
    description: 'Sell to open-market aggregators for faster access to bulk buyers.',
    Icon: AggregatorIcon,
  },
  // {
  //   id: 'forward_sale' as const,
  //   title: 'Forward Sale Agreement',
  //   tag: 'Contract',
  //   description: "Sell under a pre-agreed contract and deliver to buyer's collection centre.",
  //   Icon: ContractIcon,
  // },
];

export default function SellHarvest() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'SellHarvest'>>();
  const { top, bottom } = useSafeAreaInsets();

  const [selectedOption, setSelectedOption] = useState<SellOption>(null);
  const [loading, setLoading] = useState(false);
  const harvestData = route.params?.harvestData;
  const submissionId = route.params?.submissionId;
  const harvestDetailId = route.params?.harvestDetailId;

  const handleOptionSelect = (option: SellOption) => {
    setSelectedOption(option);
  };

  const handleContinue = async () => {
    if (!selectedOption || loading) return;

    // Forward Sale Agreement path — no /submissions call, go straight to the FSA sale order.
    // if (selectedOption === 'forward_sale') {
    //   try {
    //     setLoading(true);
    //     const response = await axiosFinancingPrivate.get('/sell-harvest/fsa-flow', {
    //       params: { selected_harvest_id: harvestDetailId },
    //     });
    //     const attributes = response.data?.data?.attributes || response.data?.attributes;
    //
    //     const emptyState = attributes?.empty_state;
    //     if (emptyState) {
    //       Toast.show({
    //         type: 'error',
    //         text1: emptyState.title || 'Nothing available',
    //         text2: emptyState.message || 'No harvest is available for Sell Harvest.',
    //       });
    //       return;
    //     }
    //
    //     const sellOptions = attributes?.sell_options || [];
    //     const fsaOption = sellOptions.find(
    //       (o: any) => o.key === 'forward_sale_agreement',
    //     );
    //     const fsa = fsaOption?.enabled === false ? null : fsaOption?.fsa_options?.[0] || null;
    //
    //     if (!fsa) {
    //       Toast.show({
    //         type: 'error',
    //         text1: 'Unavailable',
    //         text2: 'Forward sale agreement is not available for this harvest.',
    //       });
    //       return;
    //     }
    //
    //     navigation.navigate('FsaSalesOrder', {
    //       fsaId: fsa?.fsa_id || null,
    //       harvestId: harvestDetailId,
    //       selectedFsa: fsa,
    //       harvestData,
    //     });
    //   } catch (error: any) {
    //     console.log(
    //       '❌ Failed to load FSA flow:',
    //       error?.response?.data || error?.message,
    //     );
    //     Toast.show({
    //       type: 'error',
    //       text1: 'Unavailable',
    //       text2: 'Forward sale agreement is not available for this harvest.',
    //     });
    //   } finally {
    //     setLoading(false);
    //   }
    //   return;
    // }

    // Sell to Aggregators path — collect the buyer next; the submission is created
    // once at the end of the flow (before OTP), not here.
    navigation.navigate('GovernmentVerifiedBuyers', {
      harvestData,
      selectedOption,
      harvestDetailId,
      submissionId,
    });
  };

  const renderOption = (option: typeof SELL_OPTIONS[0]) => {
    const isSelected = selectedOption === option.id;
    const { Icon } = option;

    return (
      <Pressable
        key={option.id}
        style={[styles.optionCard, isSelected && styles.optionCardSelected]}
        onPress={() => handleOptionSelect(option.id)}
      >
        <View style={styles.optionHeader}>
          <View
            style={[
              styles.optionIconContainer,
              isSelected ? styles.optionIconSelected : styles.optionIconDefault,
            ]}
          >
            <Icon width={30} height={30} color="#FFFFFF" />
          </View>

          <View style={styles.optionContent}>
            <UITypography variant="semiBold" style={styles.optionTitle}>
              {option.title}
            </UITypography>

            <View
              style={[
                styles.tagContainer,
                isSelected ? styles.tagSelected : styles.tagDefault,
              ]}
            >
              <UITypography
                variant="medium"
                style={[
                  styles.tagText,
                  isSelected ? styles.tagTextSelected : styles.tagTextDefault,
                ]}
              >
                {option.tag}
              </UITypography>
            </View>
          </View>

          <View style={styles.radioContainer}>
            {isSelected ? (
              <View style={styles.checkCircle}>
                <CheckIcon size={14} color="#FFFFFF" />
              </View>
            ) : (
              <View style={styles.radioOuter} />
            )}
          </View>
        </View>

        <UITypography variant="medium" style={styles.optionDescription}>
          {option.description}
        </UITypography>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <UIIconButton onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeftIcon />
          </UIIconButton>
          <UITypography variant="semiBold" style={styles.headerTitle}>
            Sell Harvest
          </UITypography>
        </View>

        {/* Subtitle */}
        <UITypography variant="medium" style={styles.subtitle}>
          Choose how you want to sell your harvest
        </UITypography>

        {/* Options */}
        {SELL_OPTIONS.map(renderOption)}
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.buttonContainer, { bottom: bottom + 50 }]}>
        <Pressable
          onPress={handleContinue}
          disabled={!selectedOption || loading}
          style={{
            borderRadius: 12,
            height: 56,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: selectedOption ? '#099453' : '#E7F8F0',
            ...(selectedOption && {
              shadowColor: 'rgba(90, 58, 66, 0.24)',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 8,
              elevation: 6,
            }),
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 16,
                textAlign: 'center',
                color: selectedOption ? '#FFFFFF' : '#A8D5BA',
              }}
            >
              Continue
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
