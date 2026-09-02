import React, { useState } from 'react';
import { Image, Pressable, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './index.styled';
import LoanRequestIcon from '@/components/icons/LoanRequestIcon';
import UITypography from '@/components/ui/typography';
import {
  UISteps,
  UIAmountSelector,
  UICheckboxCard,
  UIContainedButton,
  UIToggleSwitch,
} from '@/components/ui';
import BankCreditImg from '@/assets/images/bank-credit.png';
import UITextInput from '@/components/ui/input';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';

export default function LoanRequest() {
  const navigation = useNavigation<any>();
  const { top } = useSafeAreaInsets();

  const [tenure, setTenure] = useState('6 Months');
  const tenures = ['3 Months', '6 Months', '9 Months', '1 Year'];

  const [purposes, setPurposes] = useState<{ [k: string]: boolean }>({
    Seeds: false,
    Fertilizers: false,
    Chemicals: false,
    Machinery: false,
    Other: true,
  });

  const togglePurpose = (key: string) =>
    setPurposes(p => ({ ...p, [key]: !p[key] }));

  const [linkSale, setLinkSale] = useState(true);

  return (
    <View style={styles.container}>
      <LoanScreenHeader
        title="Loan Request"
        onBack={() => navigation.goBack()}
        containerStyle={[styles.header, { marginTop: top }]}
        titleStyle={styles.title}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <UISteps steps={5} current={1} style={styles.stepsWrap} />

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              {/* <View style={styles.badge}> */}
              <LoanRequestIcon size={30} />
              {/* </View> */}
              <UITypography variant="semiBold" style={styles.cardTitle}>
                Loan Details
              </UITypography>
            </View>
          </View>
          <UITypography variant="medium" style={styles.desc}>
            Enter the key information about your loan to help us tailor the best
            offer for you.
          </UITypography>

          <View style={styles.facilityRow}>
            <Image source={BankCreditImg} style={styles.facilityImg} />
            <View>
              <UITypography variant="medium" style={styles.facilityLabel}>
                Facility Type
              </UITypography>
              <UITypography variant="semiBold" style={styles.facilityType}>
                Bank Credit
              </UITypography>
              <UITypography variant="semiBold" style={styles.changeLink}>
                Change
              </UITypography>
            </View>
          </View>

          <UIAmountSelector
            defaultValue={12500}
            min={500}
            max={40000}
            style={{ marginTop: 30 }}
          />

          <UITypography variant="semiBold" style={styles.sectionLabel}>
            Tenure
          </UITypography>
          <View style={styles.tenureRow}>
            {tenures.map(t => (
              <Pressable
                key={t}
                onPress={() => setTenure(t)}
                style={[styles.chip, tenure === t && styles.chipActive]}
              >
                <UITypography
                  variant={tenure === t ? 'semiBold' : 'regular'}
                  style={styles.chipText}
                >
                  {t}
                </UITypography>
              </Pressable>
            ))}
          </View>

          <UITypography variant="semiBold" style={styles.sectionLabel}>
            Intended Purpose
          </UITypography>
          <View style={styles.checkboxList}>
            {Object.keys(purposes).map(key => (
              <UICheckboxCard
                key={key}
                label={key}
                style={styles.checkboxCard}
                checked={!!purposes[key]}
                onPress={() => togglePurpose(key)}
              />
            ))}
          </View>

          <UITextInput
            boxed
            placeholder="Add Description"
            numberOfLines={4}
            containerStyle={styles.descriptionInput}
            wrapperStyle={styles.descriptionBox}
            inputStyle={styles.descriptionText}
            placeholderTextColor="#CACCD4"
          />

          <View style={styles.toggleRow}>
            <UITypography
              variant="semiBold"
              style={{ fontSize: 15, color: '#404040', width: '40%' }}
            >
              Link to sale agreement?
            </UITypography>
            <UIToggleSwitch
              value={linkSale}
              onToggle={() => {
                setLinkSale(prev => !prev);
              }}
            />
          </View>
        </View>

        <UIContainedButton
          style={styles.nextButton}
          onPress={() => navigation.navigate('PersonalDetails')}
        >
          Next
        </UIContainedButton>
      </ScrollView>
    </View>
  );
}
