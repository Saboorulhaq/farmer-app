import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './index.styled';
import UITypography from '@/components/ui/typography';
import { useAppConfigStore } from '@/store/useAppConfigStore';
import {
  UIContainedButton,
  UISteps,
  UICheckbox,
  UIPicker,
  UITextInput,
} from '@/components/ui';
import PersonalDetailIcon from '@/components/icons/PersonalDetailIcon';
import ResidentialIcon from '@/components/icons/ResidentialIcon';
import DeclarationIcon from '@/components/icons/DeclarationIcon';
import CheckGradientIcon from '@/components/icons/CheckGradientIcon';
import { UIToggleSwitch } from '@/components/ui';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import type { CalendarSelectionValue } from '@/components/ui/calender';
import { formatGpsInput } from '@/util/formatGPSNumber';
import { validDistrictCodes } from '@/constants/regionCodes';
import { ghanaCardMask } from '@/constants/masks';
import LocationIcon from '@/components/icons/LocationIcon';

const PERSONAL_ICON_COLORS = {
  bgFill: '#1D3A70',
  borderColor: '#1D3A70',
  strokeColor: '#FFFFFF',
};

export default function PersonalDetails() {
  const navigation = useNavigation<any>();
  const { top } = useSafeAreaInsets();
  const appName = useAppConfigStore(state => state.appName);

  const [nameAsPerId, setNameAsPerId] = useState('');
  const [ghanaCardNumber, setGhanaCardNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [nationality, setNationality] = useState<string | null>(null);
  const [cooperative, setCooperative] = useState<string | null>(null);
  const [owned, setOwned] = useState<'owned' | 'rented'>('owned');
  const [pep, setPep] = useState(true);
  const [relativeInProgram, setRelativeInProgram] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [relationshipPep, setRelationshipPep] = useState<string | null>(null);
  const [relationshipConnected, setRelationshipConnected] = useState<
    string | null
  >(null);
  const [gpsNumber, setGpsNumber] = useState('');
  const [gpsBackspace, setGpsBackspace] = useState(false);

  const RequiredLabel = ({
    children,
    textStyle,
  }: {
    children: React.ReactNode;
    textStyle?: any;
  }) => (
    <UITypography
      variant="medium"
      style={textStyle}
      requiredAsterisk
      requiredAsteriskStyle={styles.requiredAsterisk}
    >
      {children}
    </UITypography>
  );

  const todayISO = useMemo(() => {
    const date = new Date();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }, []);

  const genderOptions = useMemo(
    () => [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Other', value: 'other' },
    ],
    [],
  );

  const nationalityOptions = useMemo(
    () => [
      { label: 'Pakistani', value: 'pakistani' },
      { label: 'Indian', value: 'indian' },
      { label: 'Afghan', value: 'afghan' },
    ],
    [],
  );

  return (
    <View style={styles.container}>
      <LoanScreenHeader
        title="Personal Details"
        onBack={() => navigation.goBack()}
        containerStyle={[styles.header, { marginTop: top }]}
        titleStyle={styles.title}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <UISteps steps={5} current={2} style={styles.stepsWrap} />

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <PersonalDetailIcon {...PERSONAL_ICON_COLORS} />
              <UITypography variant="semiBold" style={styles.cardTitle}>
                Personal Details
              </UITypography>
            </View>
            <View style={styles.checkBadge}>
              <CheckGradientIcon width={19} height={23} />
            </View>
          </View>

          <View style={styles.row}>
            <UITypography variant="medium" style={styles.rowLabel}>
              Name as per ID
            </UITypography>
            <UITextInput
              value={nameAsPerId}
              onChangeText={setNameAsPerId}
              placeholder="Enter full name"
              containerStyle={styles.rowInputContainer}
              wrapperStyle={styles.rowInputWrapper}
              inputStyle={styles.rowInput}
              autoCapitalize="words"
            />
            <View style={styles.divider} />
          </View>

          <View style={styles.row}>
            <UITypography variant="medium" style={styles.rowLabel}>
              NADRA ID
            </UITypography>
            <UITextInput
              value={ghanaCardNumber}
              onChangeText={setGhanaCardNumber}
              mask={ghanaCardMask}
              keyboardType="numeric"
              placeholder="XXXXX-XXXXXXX-X"
              containerStyle={styles.rowInputContainer}
              wrapperStyle={styles.rowInputWrapper}
              inputStyle={styles.rowInput}
              autoCapitalize="none"
            />
            <View style={styles.divider} />
          </View>

          <View style={styles.row}>
            <UITypography variant="medium" style={styles.rowLabel}>
              Date of Birth
            </UITypography>
            <UITextInput
              placeholder="DD Month YYYY"
              containerStyle={styles.rowInputContainer}
              wrapperStyle={styles.rowInputWrapper}
              inputStyle={styles.rowInput}
              editable={false}
              pickerAddonProps={{
                type: 'calendar',
                selectedValue: dateOfBirth,
                onValueChange: (value: CalendarSelectionValue) => {
                  if (typeof value === 'string') {
                    setDateOfBirth(value);
                  }
                },
                maxDate: todayISO,
                selectionMode: 'single',
                placeholder: 'DD Month YYYY',
              }}
            />
            <View style={styles.divider} />
          </View>

          <View style={styles.row}>
            <UITypography variant="medium" style={styles.rowLabel}>
              Gender
            </UITypography>
            <UIPicker
              inline
              options={genderOptions}
              selectedValue={gender}
              onValueChange={value => setGender(value)}
              style={styles.inlinePicker}
              placeholder="Select gender"
            />
            <View style={styles.divider} />
          </View>

          <View style={styles.row}>
            <UITypography variant="medium" style={styles.rowLabel}>
              Nationality
            </UITypography>
            <UIPicker
              inline
              options={nationalityOptions}
              selectedValue={nationality}
              onValueChange={value => setNationality(value)}
              style={styles.inlinePicker}
              placeholder="Select nationality"
            />
            <View style={styles.pickerDivider} />
          </View>

          <View style={styles.row}>
            <UITypography variant="medium" style={styles.rowLabel}>
              Are you part of any cooperatives?
            </UITypography>
            <UIPicker
              inline
              options={[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ]}
              style={styles.inlinePicker}
              selectedValue={cooperative}
              onValueChange={(v: string | null) => setCooperative(v)}
            />
            <View style={styles.pickerDivider} />
          </View>
        </View>

        <View style={[styles.card, styles.residentCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <ResidentialIcon />
              <UITypography variant="semiBold" style={styles.cardTitle}>
                Residential Address
              </UITypography>
            </View>
          </View>

          <RequiredLabel textStyle={styles.residentLabel}>
            Resident Ownership
          </RequiredLabel>
          <View style={styles.ownedWrap}>
            <Pressable
              style={styles.ownedBtn}
              onPress={() => setOwned('owned')}
            >
              <View
                style={
                  owned === 'owned'
                    ? styles.radioOuterActive
                    : styles.radioOuter
                }
              >
                <View style={styles.radioInner} />
              </View>
              <UITypography variant="medium" style={styles.ownedText}>
                Owned
              </UITypography>
            </Pressable>
            <Pressable
              style={styles.ownedBtn}
              onPress={() => setOwned('rented')}
            >
              <View
                style={
                  owned === 'rented'
                    ? styles.radioOuterActive
                    : styles.radioOuter
                }
              >
                <View style={styles.radioInner} />
              </View>
              <UITypography variant="medium" style={styles.ownedText}>
                Rented
              </UITypography>
            </Pressable>
          </View>

          <UITextInput
            label="Ghana POST GPS number"
            requiredLabel
            requiredLabelStyle={styles.requiredAsterisk}
            labelStyle={styles.gpsLabel}
            placeholder="AK-039-5028"
            value={gpsNumber}
            addonBefore={<LocationIcon />}
            addonBeforeProps={{
              containerStyle: styles.gpsAddonContainer,
              showDivider: false,
            }}
            onChangeText={text => {
              if (gpsBackspace) {
                setGpsBackspace(false);
                setGpsNumber(text.toUpperCase());
                return;
              }
              const formatted = formatGpsInput(text, validDistrictCodes);
              setGpsNumber(formatted);
            }}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace') {
                setGpsBackspace(true);
              }
            }}
            autoCapitalize="characters"
          />
        </View>

        <View style={[styles.card, styles.declarationCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <DeclarationIcon />
              <UITypography variant="semiBold" style={styles.cardTitle}>
                Declaration
              </UITypography>
            </View>
          </View>

          <View style={styles.declarationRow}>
            <RequiredLabel textStyle={styles.declarationQuestion}>
              Are you or any first degree relative a Politically Exposed Person
              (P.E.P)?
            </RequiredLabel>
            <UIToggleSwitch value={pep} onToggle={() => setPep(p => !p)} />
          </View>
          <UITypography
            variant="semiBold"
            style={styles.linkInfo}
            tooltipProps={{
              text: 'A Politically Exposed Person (PEP) is someone who holds, or has recently held, a prominent public position — such as a senior government official, politician etc. First-degree relatives (spouse, parent, child, sibling) and close associates of a PEP are also considered PEPs.',
              width: 260,
              containerStyle: {
                left: 45,
              },
              arrowStyle: {
                left: '10%',
              },
            }}
          >
            What is P.E.P?
          </UITypography>

          <View style={styles.row}>
            <UITextInput
              label="Name"
              labelStyle={styles.rowLabel}
              placeholder="Akosua Owusu"
              containerStyle={styles.rowInputContainer}
              wrapperStyle={styles.rowInputWrapper}
              inputStyle={styles.rowInput}
            />
          </View>

          <View style={styles.row}>
            <UITypography variant="medium" style={styles.rowLabel}>
              Relationship
            </UITypography>
            <UIPicker
              inline
              options={[
                { label: 'Father', value: 'father' },
                { label: 'Mother', value: 'mother' },
                { label: 'Sibling', value: 'sibling' },
              ]}
              style={styles.inlinePicker}
              selectedValue={relationshipPep}
              onValueChange={(v: string | null) => setRelationshipPep(v)}
            />
            <View style={styles.pickerDivider} />
          </View>

          <UITextInput
            label="Position"
            labelStyle={styles.rowLabel}
            placeholder="Head of Credit Process"
            containerStyle={styles.rowInputContainer}
            wrapperStyle={styles.rowInputWrapper}
            inputStyle={styles.rowInput}
          />

          <View style={styles.declarationRow}>
            <RequiredLabel textStyle={styles.declarationQuestion}>
              Do you have any relative working in {appName}?
            </RequiredLabel>
            <UIToggleSwitch
              value={relativeInProgram}
              onToggle={() => setRelativeInProgram(p => !p)}
            />
          </View>
          <UITypography
            variant="semiBold"
            style={styles.linkInfo}
            tooltipProps={{
              text: 'A Connected Party is an individual who has a direct personal or professional relationship with an employee, officer, or decision-maker of the organization or program.',
              width: 260,
              containerStyle: {
                left: 45,
              },
              arrowStyle: {
                left: '10%',
              },
            }}
          >
            What is Connected Party?
          </UITypography>

          <View style={styles.row}>
            <UITextInput
              label="Name"
              labelStyle={styles.rowLabel}
              placeholder="Akosua Owusu"
              containerStyle={styles.rowInputContainer}
              wrapperStyle={styles.rowInputWrapper}
              inputStyle={styles.rowInput}
            />
          </View>

          <View style={styles.row}>
            <UITypography variant="medium" style={styles.rowLabel}>
              Relationship
            </UITypography>
            <UIPicker
              inline
              options={[
                { label: 'Father', value: 'father' },
                { label: 'Mother', value: 'mother' },
                { label: 'Sibling', value: 'sibling' },
              ]}
              style={styles.inlinePicker}
              selectedValue={relationshipPep}
              onValueChange={(v: string | null) => setRelationshipPep(v)}
            />
            <View style={styles.pickerDivider} />
          </View>

          <UITextInput
            label="Position"
            labelStyle={styles.rowLabel}
            placeholder="Head of Credit Process"
            containerStyle={styles.rowInputContainer}
            wrapperStyle={styles.rowInputWrapper}
            inputStyle={styles.rowInput}
          />
        </View>

        <View style={styles.confirmRow}>
          <UICheckbox
            checked={confirm}
            onPress={() => setConfirm(c => !c)}
            size={40}
          />
          <UITypography
            variant="medium"
            style={{ color: '#404040', fontSize: 14, width: '80%' }}
          >
            I confirm and agree that all the information on my ID is accurate.
          </UITypography>
        </View>

        <UIContainedButton
          style={styles.nextButton}
          onPress={() => navigation.navigate('FarmDetails')}
        >
          Next
        </UIContainedButton>
      </ScrollView>
    </View>
  );
}
