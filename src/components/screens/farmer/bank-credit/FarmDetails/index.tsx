import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './index.styled';
import { UIContainedButton, UISteps, UITextInput } from '@/components/ui';
import UITypography from '@/components/ui/typography';
import FarmDetailIcon from '@/components/icons/FarmDetailIcon';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import ArrowDownIcon from '@/components/icons/ArrowDownIcon';

type Farm = {
  id: string;
  name: string;
  ownership: 'owned' | 'rented' | null;
  size: string;
  primary: string;
  secondary?: string;
  gps: string;
  visible: boolean;
  editable: boolean;
};

export default function FarmDetails() {
  const navigation = useNavigation<any>();
  const { top } = useSafeAreaInsets();

  const [farms, setFarms] = useState<Farm[]>([
    { id: 'farm-1', name: 'Farm Name Here', ownership: 'owned', size: '3', primary: 'Soyabean', secondary: 'Maize', gps: '54000', visible: true, editable: false },
  ]);

  const currentFarm = useMemo(() => farms.find(f => f.visible), [farms]);

  const updateFarm = (farmId: string, patch: Partial<Farm>) => {
    setFarms(prev => prev.map(f => (f.id === farmId ? { ...f, ...patch } : f)));
  };

  const activateFarm = (farmId: string) => {
    setFarms(prev => prev.map(f => ({ ...f, visible: f.id === farmId })));
  };

  const isValidFarm = (f: Farm) => !!(f.ownership && f.size && Number(f.size) > 0 && f.primary && f.gps);

  const handleAddFarm = () => {
    if (!currentFarm || !isValidFarm(currentFarm)) return;
    setFarms(prev => {
      const nextIndex = prev.length + 1;
      const updated = prev.map(f =>
        f.id === currentFarm.id
          ? { ...f, visible: false, editable: false }
          : { ...f, visible: false },
      );

      return [
        ...updated,
        {
          id: `farm-${nextIndex}`,
          name: `Farm Name Here_${nextIndex}`,
          ownership: null,
          size: '',
          primary: '',
          secondary: '',
          gps: '',
          visible: true,
          editable: true,
        },
      ];
    });
  };

  return (
    <View style={styles.container}>
      <LoanScreenHeader
        title="Farm Details"
        onBack={() => navigation.goBack()}
        containerStyle={[styles.header, { marginTop: top }]}
        titleStyle={styles.title}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <UISteps steps={5} current={3} style={styles.stepsWrap} />

        {farms.map(farm => (
          farm.visible ? (
            <View key={farm.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <FarmDetailIcon bgFill="#1D3A70" borderColor="#1D3A70" strokeColor="#FFFFFF" />
                  <UITypography variant="semiBold" style={styles.cardTitle}>Farm Details</UITypography>
                </View>
                <Pressable onPress={() => updateFarm(farm.id, { editable: !farm.editable })}>
                  <UITypography variant="semiBold" style={styles.editLink}>{farm.editable ? 'Done' : 'Edit'}</UITypography>
                </Pressable>
              </View>

              <View style={styles.row}>
                <UITypography variant="medium" style={styles.rowLabel}>Farm Ownership</UITypography>
                {farm.editable ? (
                  <View style={styles.radioWrap}>
                    <Pressable style={styles.radioBtn} onPress={() => updateFarm(farm.id, { ownership: 'owned' })}>
                      <View style={farm.ownership === 'owned' ? styles.radioOuterActive : styles.radioOuter}><View style={styles.radioInner} /></View>
                      <UITypography variant="medium" style={{ color: '#898A8D', fontSize: 14, fontWeight: '500' }}>Owned</UITypography>
                    </Pressable>
                    <Pressable style={styles.radioBtn} onPress={() => updateFarm(farm.id, { ownership: 'rented' })}>
                      <View style={farm.ownership === 'rented' ? styles.radioOuterActive : styles.radioOuter}><View style={styles.radioInner} /></View>
                      <UITypography variant="medium" style={{ color: '#898A8D', fontSize: 14, fontWeight: '500' }}>Rented</UITypography>
                    </Pressable>
                  </View>
                ) : (
                  <UITypography variant="medium" style={styles.rowValue}>{farm.ownership === 'owned' ? 'Owned' : 'Rented'}</UITypography>
                )}
                <View style={styles.divider} />
              </View>

              <View style={styles.row}>
                <UITypography variant="medium" style={styles.rowLabel}>Farm Size (acres)</UITypography>
                {farm.editable ? (
                  <UITextInput placeholder="3" value={farm.size} onChangeText={v => updateFarm(farm.id, { size: v })} keyboardType="numeric" />
                ) : (
                  <>
                    <UITypography variant="medium" style={styles.rowValue}>{farm.size}</UITypography>
                    <View style={styles.divider} />
                  </>
                )}
              </View>

              <View style={styles.row}>
                <UITypography variant="medium" style={styles.rowLabel}>Primary Produce</UITypography>
                {farm.editable ? (
                  <UITextInput placeholder="Soyabean" value={farm.primary} onChangeText={v => updateFarm(farm.id, { primary: v })} />
                ) : (
                  <>
                    <UITypography variant="medium" style={styles.rowValue}>{farm.primary}</UITypography>
                    <View style={styles.divider} />
                  </>
                )}
              </View>

              <View style={styles.row}>
                <UITypography variant="medium" style={styles.rowLabel}>Secondary Produce (Optional)</UITypography>
                {farm.editable ? (
                  <UITextInput placeholder="Maize" value={farm.secondary} onChangeText={v => updateFarm(farm.id, { secondary: v })} />
                ) : (
                  <>
                    <UITypography variant="medium" style={styles.rowValue}>{farm.secondary || ''}</UITypography>
                    <View style={styles.divider} />
                  </>
                )}
              </View>

              <View style={styles.row}>
                <UITypography variant="medium" style={styles.rowLabel}>Postal Code</UITypography>
                {farm.editable ? (
                  <UITextInput placeholder="XXXXX" value={farm.gps} keyboardType="numeric" maxLength={5} onChangeText={v => updateFarm(farm.id, { gps: v.replace(/\D/g, '').slice(0, 5) })} />
                ) : (
                  <>
                    <UITypography variant="semiBold" style={styles.rowValue}>{farm.gps}</UITypography>
                    <View style={styles.divider} />
                  </>
                )}
              </View>
            </View>
          ) : (
            <Pressable key={farm.id} style={styles.collapsedCard} onPress={() => activateFarm(farm.id)}>
              <View style={styles.collapsedIndicator}/>
              <UITypography variant="medium" style={styles.collapsedGps}>{farm.gps || 'Postal code not provided'}</UITypography>
              <View style={styles.collapsedArrow}>
                <ArrowDownIcon />
              </View>
            </Pressable>
          )
        ))}

        <Pressable style={styles.addFarmRow} onPress={handleAddFarm}>
          <View style={styles.addFarmCircle}>
            <UITypography variant="semiBold" style={{ color: '#fff', fontSize: 16 }}>+</UITypography>
          </View>
          <UITypography variant="medium" style={styles.addFarmText}>Add Farm</UITypography>
        </Pressable>

        <UIContainedButton style={styles.nextButton} onPress={() => navigation.navigate('FinancialProfile')}>Next</UIContainedButton>
      </ScrollView>
    </View>
  );
}
