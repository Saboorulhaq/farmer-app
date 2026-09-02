import AuthHeader from '@/components/layout/auth/AuthHeader';
import AuthFarmerPrivacyModal from '@/components/screens/auth/farmer/farmer-details/AuthFarmerPrivacyModal';
import {
  UIContainedButton,
  UIPicker,
  UITextInput,
  UITypography,
} from '@/components/ui';
import { useAgentFarmerRegister } from '@/constants/context/agent/agent-farmer-register/context';
import {
  cropsOptions,
  farmOptions,
  farmSizeUnits,
} from '@/screens/auth/farmer/farm-details/ts/constants';
import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import React, { useState, useRef } from 'react';
import { Keyboard, Platform, StatusBar, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import * as Yup from 'yup';
import { styles } from './AgentFarmDetailsScreen.styled';
import { axiosPublic } from '@/config/axios';
import { trigger } from 'react-native-haptic-feedback';
import { validDistrictCodes as _validDistrictCodes } from '@/constants/regionCodes';
import { formatGpsInput as _formatGpsInput } from '@/util/formatGPSNumber';

interface FarmDetailsFormValues {
  ownsFarm: string;
  primaryCrops: string;
  secondaryCrops: string | null;
  farmSize: string;
  farmSizeUnit: string;
  gpsNumber: string;
  addressLine: string;
}

const FarmDetailsSchema = Yup.object().shape({
  ownsFarm: Yup.string().required('Please select if you own a farm.'),
  primaryCrops: Yup.string().required('Please select your primary crop.'),
  secondaryCrops: Yup.string().nullable(),
  farmSize: Yup.string()
    .max(5, 'Farm size must not exceed 5 characters')
    .test('is-valid-number', 'Please enter a valid number for farm size.', value => {
      if (!value) return false;
      const num = Number(value);
      return !isNaN(num) && num > 0 && num <= 10000;
    })
    .required('Please enter a valid farm size.'),
  farmSizeUnit: Yup.string().required('Please select a unit for farm size.'),
  gpsNumber: Yup.string()
    .test('postal-code', 'Postal code must be exactly 5 digits', value => {
      if (!value || value.trim() === '') return true;
      return /^\d{5}$/.test(value.trim());
    }),
  addressLine: Yup.string()
    .max(512, 'Address must not exceed 512 characters'),
});
export default function AgentFarmDetailsScreen() {
  const { navigate } = useNavigation();
  const { top, bottom } = useSafeAreaInsets();
  const { farmDetails, setFarmDetails } = useAgentFarmerRegister();
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [isBackspace, setIsBackspace] = useState(false);
  const [dynamicCrops, setDynamicCrops] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [isLoadingCrops, setIsLoadingCrops] = useState(false);
  const scrollViewRef = useRef<any>(null);
  const farmSizeInputRef = useRef<any>(null);
  const gpsInputRef = useRef<any>(null);

  const formik = useFormik<FarmDetailsFormValues>({
    initialValues: {
      ownsFarm: farmDetails?.ownsFarm || '',
      primaryCrops: farmDetails?.primaryCrop || '',
      secondaryCrops: farmDetails?.secondaryCrop || null,
      farmSize: farmDetails?.farmSize || '',
      farmSizeUnit: farmDetails?.farmSizeUnit || '',
      gpsNumber: farmDetails?.ghanaPostGPS || '',
      addressLine: farmDetails?.addressLine || '',
    },
    validationSchema: FarmDetailsSchema,
    onSubmit: async values => {
      try {
        const _farmDetails = {
          ownsFarm: values.ownsFarm,
          primaryCrop: values.primaryCrops,
          secondaryCrop: values.secondaryCrops,
          farmSize: values.farmSize,
          farmSizeUnit: values.farmSizeUnit,
          ghanaPostGPS: values.gpsNumber,
          addressLine: values.addressLine,
        };

        setFarmDetails(_farmDetails);
        navigate('FarmReview' as never);
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Submission Failed',
          text2:
            error?.response?.data?.error || 'An unexpected error occurred.',
        });
      }
    },
    validateOnMount: false,
    validateOnChange: true,
  });

  const {
    values,
    errors,
    touched,
    setFieldValue,
    handleSubmit,
    isValid,
    isSubmitting,
    handleChange,
    setFieldTouched,
    handleBlur,
  } = formik;
  console.log(isSubmitting);

  React.useEffect(() => {
    // Persist in-progress form values so Android back/unmount restores draft.
    setFarmDetails({
      ownsFarm: values.ownsFarm,
      primaryCrop: values.primaryCrops,
      secondaryCrop: values.secondaryCrops,
      farmSize: values.farmSize,
      farmSizeUnit: values.farmSizeUnit,
      ghanaPostGPS: values.gpsNumber,
      addressLine: values.addressLine,
    });
  }, [
    values.ownsFarm,
    values.primaryCrops,
    values.secondaryCrops,
    values.farmSize,
    values.farmSizeUnit,
    values.gpsNumber,
    values.addressLine,
    setFarmDetails,
  ]);

  // Fetch crop options from config_options API
  React.useEffect(() => {
    const fetchCropOptions = async () => {
      try {
        setIsLoadingCrops(true);
        const response = await axiosPublic.get('/config_options?key=crop');
        const data = response.data?.data || [];

        // Map API response to options format
        const mappedCropOptions = Array.isArray(data)
          ? data
              .sort(
                (a: any, b: any) =>
                  (a.attributes?.sort_order ?? 0) -
                  (b.attributes?.sort_order ?? 0),
              )
              .map((item: any) => ({
                value: item.attributes?.value || '',
                label: item.attributes?.value || '',
              }))
          : [];

        console.log('Crop options from API:', mappedCropOptions);
        setDynamicCrops(mappedCropOptions);
      } catch (error) {
        console.log('Error fetching crop options:', error);
        // Fallback to static options if API fails
        setDynamicCrops(cropsOptions);
      } finally {
        setIsLoadingCrops(false);
      }
    };

    fetchCropOptions();
  }, []);

  const handlePrivacyClose = () => {
    setPrivacyVisible(false);
  };

  // Use dynamic crops if available, otherwise fallback to static options
  const cropsOptionsToUse =
    dynamicCrops.length > 0 ? dynamicCrops : cropsOptions;

  return (
    <View
      style={[
        styles.scrollView,
        {
          paddingTop: top + 20,
        },
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <AuthHeader title="Farm Details" />
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={120}
        extraHeight={120}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => Keyboard.dismiss()}
      >
        <View style={styles.container}>
          <UITypography variant="regular" style={styles.contentTitle}>
            Tell us about farmer's{'\n'}farming operations
          </UITypography>

          <UIPicker
            label="Farm ownership"
            requiredLabel
            options={farmOptions}
            selectedValue={values.ownsFarm}
            onValueChange={async value => {
              await setFieldValue('ownsFarm', value);
            }}
            error={touched.ownsFarm && !!errors.ownsFarm}
            helperText={touched.ownsFarm ? errors.ownsFarm : ''}
          />
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flex: 0.4 }}>
              <UITextInput
                ref={farmSizeInputRef}
                label="Farm Size"
                requiredLabel
                placeholder="Please enter"
                keyboardType="number-pad"
                returnKeyType="done"
                maxLength={5}
                onSubmitEditing={() => Keyboard.dismiss()}
                value={values.farmSize}
                onChangeText={handleChange('farmSize')}
                onFocus={() => {
                  setTimeout(() => {
                    farmSizeInputRef.current?.measureInWindow((x: number, y: number) => {
                      scrollViewRef.current?.scrollToPosition(0, Math.max(0, y - 150), true);
                    });
                  }, 100);
                }}
                onBlur={handleBlur('farmSize')}
                error={touched.farmSize && !!errors.farmSize}
                helperText={touched.farmSize ? errors.farmSize : ''}
              />
            </View>
            <View style={{ flex: 0.6 }}>
              <UIPicker
                label="Farm Size Unit"
                requiredLabel
                placeholder="Select"
                options={farmSizeUnits}
                selectedValue={values.farmSizeUnit}
                onValueChange={async (value: any) => {
                  await setFieldValue('farmSizeUnit', value);
                }}
                error={touched.farmSizeUnit && !!errors.farmSizeUnit}
                helperText={touched.farmSizeUnit ? errors.farmSizeUnit : ''}
              />
            </View>
          </View>

          <UIPicker
            label="Primary Produce"
            requiredLabel
            placeholder="Select"
            options={cropsOptionsToUse}
            selectedValue={values.primaryCrops}
            onValueChange={async value => {
              await setFieldValue('primaryCrops', value);
            }}
            error={touched.primaryCrops && !!errors.primaryCrops}
            helperText={touched.primaryCrops ? errors.primaryCrops : ''}
            disabled={isLoadingCrops}
          />

          <UIPicker
            label="Secondary Produce (Optional)"
            options={cropsOptionsToUse.reduce((acc, curr) => {
              if (curr.value !== values.primaryCrops) {
                //@ts-ignore
                acc.push(curr);
              }
              return acc;
            }, [])}
            selectedValue={values.secondaryCrops}
            onValueChange={async value =>
              await setFieldValue('secondaryCrops', value)
            }
            optional
            disabled={isLoadingCrops}
          />
          <UITextInput
            ref={gpsInputRef}
            label="POSTAL CODE"
            placeholder="XXXXX"
            value={values.gpsNumber}
            keyboardType="numeric"
            maxLength={5}
            returnKeyType="done"
            onChangeText={text => {
              const digits = text.replace(/\D/g, '').slice(0, 5);
              if (!touched.gpsNumber) setFieldTouched('gpsNumber', true);
              setFieldValue('gpsNumber', digits);
            }}
            onFocus={() => {
              setTimeout(() => {
                gpsInputRef.current?.measureInWindow((x: number, y: number) => {
                  scrollViewRef.current?.scrollToPosition(0, Math.max(0, y - 150), true);
                });
              }, 100);
            }}
            onBlur={handleBlur('gpsNumber')}
            error={touched.gpsNumber && !!errors.gpsNumber}
            helperText={touched.gpsNumber && errors.gpsNumber ? errors.gpsNumber : ''}
          />

          <UITextInput
            label="Address"
            requiredLabel
            placeholder="Enter your address"
            value={values.addressLine}
            maxLength={512}
            onChangeText={text => {
              setFieldValue('addressLine', text);
            }}
            onBlur={handleBlur('addressLine')}
            error={touched.addressLine && !!errors.addressLine}
            helperText={touched.addressLine && errors.addressLine ? errors.addressLine : ''}
            multiline
            numberOfLines={2}
          />
        </View>
        <View style={styles.footer}>
          <UIContainedButton
            key={isValid ? 'enabled' : 'disabled'}
            loading={isSubmitting}
            onPress={
              handleSubmit as (e?: React.FormEvent<HTMLFormElement>) => void
            }
            disabled={!isValid || isSubmitting}
          >
            CONFIRM
          </UIContainedButton>
        </View>
      </KeyboardAwareScrollView>
      <AuthFarmerPrivacyModal
        visible={privacyVisible}
        onClose={handlePrivacyClose}
      />
    </View>
  );
}
