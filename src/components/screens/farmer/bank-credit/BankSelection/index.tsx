import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  TextInput,
  Image,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './index.styled';
import UITypography from '@/components/ui/typography';
import { UIIconButton } from '@/components/ui/button';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import FilterIcon from '@/components/icons/FilterIcon';
import InfoCircleIcon from '@/components/icons/InfoCircleIcon';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import CheckIcon from '@/components/icons/CheckIcon';

type Bank = {
  id: string;
  name: string;
  logo: any;
};

// Static list of banks (dummy screen — no API calls).
const BANKS: Bank[] = [
  {
    id: 'bop',
    name: 'The Bank of Punjab',
    logo: require('@/assets/banklogo/Bank-of-punjab-Logo.png'),
  },
  {
    id: 'allied',
    name: 'Allied Bank Limited',
    logo: require('@/assets/banklogo/allied-bank.jpeg'),
  },
  {
    id: 'hbl',
    name: 'Habib Bank Limited',
    logo: require('@/assets/banklogo/habib-bank-limited-hbl-logo-png_seeklogo-614489.png'),
  },
  {
    id: 'ubl',
    name: 'United Bank Limited',
    logo: require('@/assets/banklogo/ubl-united-bank-limited-pakistan-logo-png_seeklogo-193900.png'),
  },
  {
    id: 'nbp',
    name: 'National Bank of Pakistan',
    logo: require('@/assets/banklogo/NBP.PK_BIG.png'),
  },
  {
    id: 'bahl',
    name: 'Bank Al Habib Limited',
    logo: require('@/assets/banklogo/Bank-al-habib.PK.png'),
  },
  {
    id: 'meezan',
    name: 'Meezan Bank Limited',
    logo: require('@/assets/banklogo/MEZAAN.PK-a35991f1.png'),
  },
  {
    id: 'mcb',
    name: 'MCB Bank Limited',
    logo: require('@/assets/banklogo/MCB.jpg'),
  },
  {
    id: 'faysal',
    name: 'Faysal Bank Limited',
    logo: require('@/assets/banklogo/Faysal-bank-logo-vector-scaled.jpg'),
  },
];

export default function BankSelection() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { top, bottom } = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected],
  );

  const filteredBanks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return BANKS;
    return BANKS.filter(bank => bank.name.toLowerCase().includes(q));
  }, [search]);

  const toggleBank = (id: string) =>
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));

  const handleClearAll = () => setSelected({});

  const canContinue = selectedCount >= 1;

  // Dummy screen: just proceed to OTP verification (no API calls here).
  const handleContinue = () => {
    navigation.navigate('LoanRequestOTPVerification', {
      productSubmissionId: route.params?.productSubmissionId,
      otpFlow: route.params?.otpFlow || 'LOAN_REQUEST_OTP',
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <View style={styles.headerRow}>
          <UIIconButton onPress={() => navigation.goBack()}>
            <ArrowLeftIcon />
          </UIIconButton>
          <UITypography variant="semiBold" style={styles.headerTitle}>
            Select Bank
          </UITypography>
          <View style={styles.headerSpacer} />
        </View>
      </View>
      <View style={styles.headerDivider} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <UITypography variant="bold" style={styles.heading}>
          Select Your Bank
        </UITypography>
        <UITypography variant="regular" style={styles.subheading}>
          Choose one or more banks to request for credit line.
        </UITypography>

        {/* Search + Filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <SearchIcon size={18} color="#9E9E9E" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search banks"
              placeholderTextColor="#9E9E9E"
              style={styles.searchInput}
            />
          </View>
          <Pressable style={styles.filterButton}>
            <FilterIcon size={18} color="#404040" />
            <UITypography variant="medium" style={styles.filterText}>
              Filter
            </UITypography>
          </Pressable>
        </View>

        {/* Selected / Clear all */}
        <View style={styles.selectionRow}>
          <UITypography variant="medium" style={styles.selectedText}>
            Selected ({selectedCount})
          </UITypography>
          <Pressable onPress={handleClearAll} hitSlop={8}>
            <UITypography variant="semiBold" style={styles.clearAllText}>
              Clear All
            </UITypography>
          </Pressable>
        </View>

        {/* Bank list */}
        {filteredBanks.length === 0 ? (
          <UITypography variant="regular" style={styles.emptyText}>
            No banks found.
          </UITypography>
        ) : (
          filteredBanks.map(bank => {
            const isChecked = !!selected[bank.id];
            return (
              <Pressable
                key={bank.id}
                style={styles.bankCard}
                onPress={() => toggleBank(bank.id)}
              >
                <Image
                  source={bank.logo}
                  style={[
                    styles.bankLogo,
                    bank.id === 'faysal' && styles.bankLogoLarge,
                  ]}
                />
                <View style={styles.bankInfo}>
                  <UITypography variant="semiBold" style={styles.bankName}>
                    {bank.name}
                  </UITypography>
                </View>
                <View
                  style={[styles.checkbox, isChecked && styles.checkboxChecked]}
                >
                  {isChecked && <CheckIcon size={14} color="#FFFFFF" />}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: bottom > 0 ? bottom : 16 }]}>
        <View style={styles.infoRow}>
          <InfoCircleIcon width={16} height={16} color="#404040" />
          <UITypography variant="medium" style={styles.infoText}>
            You can select multiple banks
          </UITypography>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            !canContinue && styles.continueDisabled,
            pressed && canContinue && styles.continuePressed,
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <UITypography variant="semiBold" style={styles.continueText}>
            Continue
          </UITypography>
          <ChevronRightIcon size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
