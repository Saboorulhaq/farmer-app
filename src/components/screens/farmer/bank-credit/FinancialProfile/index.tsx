import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './index.styled';
import {
  UIContainedButton,
  UISteps,
  UITextInput,
  UIPicker,
} from '@/components/ui';
import UITypography from '@/components/ui/typography';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import FinancialProfileIcon from '@/components/icons/FinancialProfileIcon';
import BorrowingDetailsIcon from '@/components/icons/BorrowingDetailsIcon';
import Tooltip from '@/components/ui/tooltip';
import { cropsOptions } from '@/screens/auth/farmer/farm-details/ts/constants';

type Produce = {
  key: string;
  label: string;
  src: any;
  imgStyle: any;
};

export default function FinancialProfile() {
  const navigation = useNavigation<any>();
  const { top } = useSafeAreaInsets();

  const cropAssets: Record<
    string,
    { src: any; style: any; key: string; label: string }
  > = useMemo(
    () => ({
      Maize: {
        src: require('@/assets/images/farmer/buyer-corn.png'),
        style: styles.image254,
        key: 'maize',
        label: 'Maize',
      },
      Soybean: {
        src: require('@/assets/images/farmer/buyer-tractor.png'),
        style: styles.image253,
        key: 'soybean',
        label: 'Soybean',
      },
      Sorghum: {
        src: require('@/assets/images/farmer/miki39st-vq8p2xu.png'),
        style: styles.image255,
        key: 'sorghum',
        label: 'Sorghum',
      },
      Rice: {
        src: require('@/assets/images/farmer/miki3c1v-m1nokpj.png'),
        style: styles.image259,
        key: 'rice',
        label: 'Rice',
      },
      Tomato: {
        src: require('@/assets/images/farmer/gvb-banner.png'),
        style: styles.image257,
        key: 'tomato',
        label: 'Tomato',
      },
      Onion: {
        src: require('@/assets/images/farmer/miki44o0-bllx5jp.png'),
        style: styles.image258,
        key: 'onion',
        label: 'Onion',
      },
      Pepper: {
        src: require('@/assets/images/farmer/miki46ls-ou6zhqd.png'),
        style: styles.image260,
        key: 'pepper',
        label: 'Pepper',
      },
      'Cowpea Beans': {
        src: require('@/assets/images/farmer/miki48tg-n8cc25j.png'),
        style: styles.image261,
        key: 'cowpea',
        label: 'Cowpea',
      },
    }),
    [],
  );

  // const produceList: Produce[] = useMemo(
  //   () =>
  //     cropsOptions
  //       .filter(opt => cropAssets[opt.value])
  //       .map(opt => ({
  //         key: cropAssets[opt.value].key,
  //         label: cropAssets[opt.value].label,
  //         src: cropAssets[opt.value].src,
  //         imgStyle: cropAssets[opt.value].style,
  //       })),
  //   [cropAssets],
  // );

  const produceSections = useMemo(
    () => [
      {
        title: 'Staple Crops',
        data: [
          { label: 'Maize', value: 'maize' },
          { label: 'Cassava', value: 'cassava' },
          { label: 'Yam', value: 'yam' },
          { label: 'Plantain', value: 'plantain' },
          { label: 'Sorghum', value: 'sorghum' },
          { label: 'Rice', value: 'rice' },
          { label: 'Tomato', value: 'tomato' },
          { label: 'Poultry', value: 'poultry' },
          { label: 'Soybean', value: 'soybean' },
          { label: 'Pepper', value: 'pepper' },
          { label: 'Cowpea', value: 'cowpea' },
          { label: 'Onion', value: 'onion' },
        ],
      },
      {
        title: 'Cash crops',
        data: [
          { label: 'Palm', value: 'palm' },
          { label: 'Cashew', value: 'cashew' },
          { label: 'Shea', value: 'shea' },
          { label: 'Rubber', value: 'rubber' },
          { label: 'Mango', value: 'mango' },
          { label: 'Coconut', value: 'coconut' },
        ],
      },
      {
        title: 'Other Cash Crops',
        data: [{ label: 'Cocoa', value: 'cocoa' }],
      },
    ],
    [],
  );

  const [selectedProduce, setSelectedProduce] = useState<string>('sorghum');
  const [expectedVolume, setExpectedVolume] = useState<string>('500');
  const [unit, setUnit] = useState<string | null>(null);
  const [expectedPrice, setExpectedPrice] = useState<string>('Rs 500.00');
  const [grade, setGrade] = useState<string | null>(null);

  const [lenderName, setLenderName] = useState<string>('');
  const [facilityType, setFacilityType] = useState<string | null>(null);
  const [outstandingAmount, setOutstandingAmount] = useState<string>('5.6');
  const [outstandingType, setOutstandingType] = useState<string | null>(null);

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [harvestTooltipVisible, setHarvestTooltipVisible] = useState(false);
  const borrowHeaderRef = useRef<View>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; right: number }>({
    top: 380,
    right: 60,
  });
  const [harvestTooltipPos, setHarvestTooltipPos] = useState<{
    top: number;
    right: number;
  }>({ top: 80, right: 60 });

  return (
    <View style={styles.container}>
      <LoanScreenHeader
        title="Financial Profile"
        onBack={() => navigation.goBack()}
        containerStyle={[styles.header, { marginTop: top }]}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <UISteps steps={5} current={4} style={styles.stepsWrap} />

        <View style={styles.card}>
          <View
            style={styles.cardHeader}
            onLayout={e => {
              const y = e.nativeEvent.layout.y;
              setHarvestTooltipPos({ top: y + 17, right: 10 });
            }}
          >
            <View style={styles.headerLeft}>
              <FinancialProfileIcon
                bgFill="#1D3A70"
                borderColor="#1D3A70"
                iconFill="#FFFFFF"
              />
              <UITypography variant="semiBold" style={styles.cardTitle}>
                Harvest Details
              </UITypography>
            </View>
            <Pressable
              style={styles.infoBadge}
              onPress={() => setHarvestTooltipVisible(true)}
            >
              <Text style={styles.infoText}>i</Text>
            </Pressable>
          </View>

          <View style={styles.row}>
            <UITypography
              requiredAsterisk
              variant="medium"
              style={styles.rowLabel}
            >
              Select Produce
            </UITypography>
            <View style={styles.grid}>
              <UIPicker
                label="Produce"
                labelStyles={styles.rowLabel}
                style={styles.inlinePicker}
                sections={produceSections}
                selectedValue={selectedProduce}
                onValueChange={setSelectedProduce}
              />
              {/* {produceList.map(p => (
                <Pressable
                  key={p.key}
                  style={[
                    styles.produceTile,
                    selectedProduce === p.key && styles.produceTileSelected,
                  ]}
                  onPress={() => setSelectedProduce(p.key)}
                >
                  <View style={styles.produceCircle}>
                    <Image
                      source={p.src}
                      style={p.imgStyle}
                      resizeMode="contain"
                    />
                  </View>
                  <UITypography variant="medium" style={styles.produceLabel}>
                    {p.label}
                  </UITypography>
                </Pressable>
              ))} */}
            </View>
          </View>

          <View style={styles.inlineRow}>
            <View style={styles.inlineLeft}>
              <UITextInput
                label="Expected Volume"
                labelStyle={styles.rowLabel}
                requiredLabel
                placeholder="500"
                value={expectedVolume}
                onChangeText={setExpectedVolume}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inlineRight}>
              <UIPicker
                label="Units"
                labelStyles={styles.rowLabel}
                style={styles.inlinePicker}
                options={[
                  { label: 'Kg', value: 'kg' },
                  { label: 'Bags', value: 'bags' },
                  { label: 'Tonnes', value: 'tonnes' },
                ]}
                selectedValue={unit}
                onValueChange={setUnit}
              />
            </View>
          </View>

          <View style={styles.row}>
            <UITypography variant="medium" style={styles.rowLabel}>
              Expected Selling Price per Unit
            </UITypography>
            <UITextInput
              placeholder="Rs 500.00"
              value={expectedPrice}
              onChangeText={setExpectedPrice}
            />
          </View>

          <View style={styles.row}>
            <UITypography
              requiredAsterisk
              variant="medium"
              style={styles.rowLabel}
            >
              Expected Grade
            </UITypography>
            <UIPicker
              options={[
                { label: 'Grade A', value: 'A' },
                { label: 'Grade B', value: 'B' },
                { label: 'Grade C', value: 'C' },
              ]}
              selectedValue={grade}
              onValueChange={setGrade}
              placeholder="Please select"
            />
          </View>
        </View>

        <View style={styles.card}>
          <View ref={borrowHeaderRef} style={styles.cardHeader}>
            <View
              style={styles.headerLeft}
              onLayout={e => {
                const y = e.nativeEvent.layout.y;
                setTooltipPos({ top: y + 865, right: 10 });
              }}
            >
              <BorrowingDetailsIcon />
              <UITypography variant="semiBold" style={styles.cardTitle}>
                Borrowing Details
              </UITypography>
            </View>
            <Pressable
              style={styles.infoBadge}
              onPress={() => setTooltipVisible(true)}
            >
              <Text style={styles.infoText}>i</Text>
            </Pressable>
          </View>

          <View style={styles.row}>
            <UIPicker
              label="Lender"
              labelStyles={styles.rowLabel}
              options={[
                { label: 'Select', value: 'select' },
                { label: 'Other', value: 'other' },
              ]}
              selectedValue={null}
              onValueChange={() => {}}
            />
          </View>

          <UIPicker
            label="Facility Type"
            labelStyles={styles.rowLabel}
            options={[
              { label: 'Short-term', value: 'short' },
              { label: 'Overdraft', value: 'od' },
              { label: 'Term Loan', value: 'term' },
            ]}
            selectedValue={facilityType}
            onValueChange={setFacilityType}
            placeholder="Type"
          />

          <View>
            <View style={styles.inlineRow}>
              <View style={[styles.inlineLeft, { flex: 0.4 }]}>
                <UITextInput
                  label="Outstanding"
                  labelStyle={styles.rowLabel}
                  placeholder="Rs"
                  value={`Rs ${outstandingAmount}`}
                  onChangeText={setOutstandingAmount}
                />
              </View>
              <View style={[styles.inlineRight, { flex: 0.6 }]}>
                <UIPicker
                  label=" "
                  style={styles.inlinePicker}
                  options={[
                    { label: 'Please Select', value: 'select' },
                    { label: 'Sanctioned', value: 'sanctioned' },
                    { label: 'Pending', value: 'pending' },
                  ]}
                  selectedValue={outstandingType}
                  onValueChange={setOutstandingType}
                />
              </View>
            </View>
          </View>
        </View>

        <UIContainedButton
          style={styles.nextButton}
          onPress={() => navigation.navigate('Documents')}
        >
          Next
        </UIContainedButton>

        <Tooltip
          visible={harvestTooltipVisible}
          text="Choose the crop you plan to grow and need funding for."
          arrowStyle={{ left: '83%' }}
          style={{
            position: 'absolute',
            top: harvestTooltipPos.top,
            right: harvestTooltipPos.right,
            width: 131,
            height: 61,
          }}
          onClose={() => setHarvestTooltipVisible(false)}
          placement="top"
        />

        <Tooltip
          visible={tooltipVisible}
          arrowStyle={{ left: '86%' }}
          text={
            'Outstanding farm loans include any supplier or buyer credit yet to be settled'
          }
          style={{
            position: 'absolute',
            top: tooltipPos.top,
            right: tooltipPos.right,
            width: 167,
          }}
          onClose={() => setTooltipVisible(false)}
          placement="top"
        />
      </ScrollView>
    </View>
  );
}
