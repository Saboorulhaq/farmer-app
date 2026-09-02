import React, { useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Toast } from 'toastify-react-native';
import Svg, { Line } from 'react-native-svg';
import type { CapturedLocation } from '@/services/location.service';

import {
  UIContainedButton,
  UIPicker,
  UITextInput,
  UITypography,
} from '@/components/ui';
import LocationIcon from '@/components/icons/LocationIcon';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import { axiosPrivate, axiosPublic } from '@/config/axios';
import {
  cropsOptions,
  farmOptions,
  farmSizeUnits,
} from '@/screens/auth/farmer/farm-details/ts/constants';

function CloseIcon({ size = 14, color = '#333' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Line x1="1" y1="1" x2="13" y2="13" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1="13" y1="1" x2="1" y2="13" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

const AddFarmSchema = Yup.object()
  .shape({
    ownsFarm: Yup.string().required('Select your farm ownership status'),
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
    address: Yup.string()
      .max(512, 'Address must not exceed 512 characters'),
    gpsNumber: Yup.string()
      .test('postal-code', 'Postal code must be exactly 5 digits', value => {
        if (!value || value.trim() === '') return true;
        return /^\d{5}$/.test(value.trim());
      })
      .test(
        'postal-code-or-address',
        'Please add a farm address or a postal code.',
        (value, ctx) => {
          const hasPostalCode = !!value && value.trim() !== '';
          const hasAddress =
            !!ctx.parent.address && ctx.parent.address.trim() !== '';
          return hasPostalCode || hasAddress;
        },
      ),
  });

interface FormValues {
  ownsFarm: string;
  primaryCrops: string;
  secondaryCrops: string | null;
  farmSize: string;
  farmSizeUnit: string;
  address: string;
  gpsNumber: string;
  lat: number | null;
  long: number | null;
  accuracy: number | null;
}

export default function AddFarmScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bottom } = useSafeAreaInsets();

  const editFarm = route.params?.farm ?? null;
  const isEditMode = !!editFarm;

  // Apply location captured on CaptureLocation screen back to this form.
  React.useEffect(() => {
    const captured: CapturedLocation | undefined = route.params?.capturedLocation;
    if (captured?.address) {
      formik.setFieldValue('address', captured.address, false);
      formik.setFieldValue('gpsNumber', '', false);
      formik.setFieldValue('lat', captured.latitude, false);
      formik.setFieldValue('long', captured.longitude, false);
      formik.setFieldValue('accuracy', captured.accuracy, false);
      formik.setFieldTouched('address', true, false);
      formik.setFieldError('gpsNumber', undefined);
      navigation.setParams({ capturedLocation: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.capturedLocation]);

  const [dynamicCrops, setDynamicCrops] = useState<
    { label: string; value: string }[]
  >([]);
  const [isLoadingCrops, setIsLoadingCrops] = useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        setIsLoadingCrops(true);
        const res = await axiosPublic.get('/config_options?key=crop');
        const data = res.data?.data || [];
        const mapped = Array.isArray(data)
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
        setDynamicCrops(mapped);
      } catch {
        setDynamicCrops(cropsOptions);
      } finally {
        setIsLoadingCrops(false);
      }
    })();
  }, []);

  const cropsOptionsToUse =
    dynamicCrops.length > 0 ? dynamicCrops : cropsOptions;

  const formik = useFormik<FormValues>({
    initialValues: {
      ownsFarm: editFarm?.ownsFarmRaw || '',
      primaryCrops: editFarm?.primaryCrop || '',
      secondaryCrops: editFarm?.secondaryCrop && editFarm.secondaryCrop !== '—' ? editFarm.secondaryCrop : null,
      farmSize: editFarm?.farmSize && editFarm.farmSize !== '—' ? editFarm.farmSize : '',
      farmSizeUnit: editFarm?.farmSizeUnit || '',
      address: editFarm?.address && editFarm.address !== '—' ? editFarm.address : '',
      gpsNumber: editFarm?.gpsNumber || '',
      lat: editFarm?.lat ?? null,
      long: editFarm?.long ?? null,
      accuracy: editFarm?.accuracy ?? null,
    },
    validationSchema: AddFarmSchema,
    validateOnMount: true,
    validateOnChange: true,
    onSubmit: async values => {
      try {
        if (isEditMode) {
          await axiosPrivate.put(`/users/farms/${editFarm.uuid}`, {
            data: {
              attributes: {
                owns_farm: values.ownsFarm,
                farm_size: values.farmSize,
                farm_size_unit: values.farmSizeUnit,
                primary_crop: values.primaryCrops,
                secondary_crop: values.secondaryCrops || null,
                ghana_post_gps_number: values.gpsNumber || null,
                address: values.address || null,
                lat: values.lat ?? undefined,
                long: values.long ?? undefined,
                accuracy: values.accuracy ?? undefined,
              },
            },
          });
          navigation.goBack();
          setTimeout(() => {
            Toast.show({ type: 'success', text1: 'Farm updated successfully' });
          }, 150);
          return;
        }

        await axiosPrivate.post('/users/farms', {
          data: {
            attributes: [
              {
                owns_farm: values.ownsFarm,
                farm_size: values.farmSize,
                farm_size_unit: values.farmSizeUnit,
                primary_crop: values.primaryCrops,
                secondary_crop: values.secondaryCrops || null,
                ghana_post_gps_number: values.gpsNumber || null,
                address: values.address || null,
                lat: values.lat ?? undefined,
                long: values.long ?? undefined,
                accuracy: values.accuracy ?? undefined,
                interested_services: [],
              },
            ],
          },
        });

        navigation.goBack();
        setTimeout(() => {
          Toast.show({ type: 'success', text1: 'Farm added successfully' });
        }, 150);
      } catch (err: any) {
        if (!err?.__handledGlobally) {
          const errors = err?.response?.data?.errors;
          const errorMessage =
            (Array.isArray(errors) && errors.length > 0 ? errors[0] : null) ||
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            `Failed to ${isEditMode ? 'update' : 'add'} farm. Please try again.`;
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: errorMessage,
          });
        }
      }
    },
  });

  const {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
  } = formik;

  return (
    <View style={s.overlay}>
      <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <View style={s.sheet}>
        {/* Close button — positioned halfway above the sheet top edge */}
        <TouchableOpacity
          style={s.closeButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <CloseIcon size={14} color="#333" />
        </TouchableOpacity>

        <UITypography variant="semiBold" style={s.sheetTitle}>
          {isEditMode ? 'Edit Farm' : 'Add Farm'}
        </UITypography>

        <KeyboardAwareScrollView
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          extraScrollHeight={Platform.OS === 'ios' ? 40 : 200}
          contentContainerStyle={[
            s.scrollContent,
            { paddingBottom: 16 },
          ]}
          onScrollBeginDrag={() =>
            Platform.OS === 'ios' && Keyboard.dismiss()
          }
        >
          <View style={s.formCard}>
            {/* Farm Ownership */}
            <UIPicker
              label="Farm Ownership"
              requiredLabel
              placeholder="Select"
              options={farmOptions}
              selectedValue={values.ownsFarm}
              onValueChange={async value =>
                setFieldValue('ownsFarm', value)
              }
              error={touched.ownsFarm && !!errors.ownsFarm}
              helperText={touched.ownsFarm ? errors.ownsFarm : ''}
            />

            {/* Farm Size + Size */}
            <View style={s.row}>
              <View style={s.rowLeft}>
                <UITypography
                  variant="regular"
                  style={s.rowLabel}
                  requiredAsterisk
                  requiredAsteriskStyle={{ color: '#E53935' }}
                >
                  Farm Size
                </UITypography>
                <UITextInput
                  placeholder="Please enter"
                  keyboardType="number-pad"
                  returnKeyType="done"
                  maxLength={5}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  value={values.farmSize}
                  onChangeText={handleChange('farmSize')}
                  onBlur={handleBlur('farmSize')}
                  error={touched.farmSize && !!errors.farmSize}
                  helperText=""
                  wrapperStyle={{ paddingBottom: 12 }}
                  containerStyle={{ marginBottom: 0 }}
                  inputStyle={{
                    fontSize: 14,
                    fontFamily: 'Poppins-Medium',
                  }}
                />
              </View>
              <View style={s.rowRight}>
                <UITypography
                  variant="regular"
                  style={s.rowLabel}
                  requiredAsterisk
                  requiredAsteriskStyle={{ color: '#E53935' }}
                >
                  Size
                </UITypography>
                <UIPicker
                  requiredLabel
                  placeholder="Select"
                  options={farmSizeUnits}
                  selectedValue={values.farmSizeUnit}
                  onValueChange={async value =>
                    setFieldValue('farmSizeUnit', value)
                  }
                  error={touched.farmSizeUnit && !!errors.farmSizeUnit}
                  helperText=""
                />
              </View>
            </View>
            {(touched.farmSize && errors.farmSize) ||
            (touched.farmSizeUnit && errors.farmSizeUnit) ? (
              <UITypography variant="regular" style={s.rowError}>
                {(touched.farmSize && errors.farmSize) ||
                  (touched.farmSizeUnit && errors.farmSizeUnit)}
              </UITypography>
            ) : null}

            {/* Primary Produce */}
            <UIPicker
              label="Primary Produce"
              requiredLabel
              placeholder="Select"
              options={cropsOptionsToUse}
              selectedValue={values.primaryCrops}
              onValueChange={async value =>
                setFieldValue('primaryCrops', value)
              }
              error={touched.primaryCrops && !!errors.primaryCrops}
              helperText={touched.primaryCrops ? errors.primaryCrops : ''}
              disabled={isLoadingCrops}
            />

            {/* Secondary Produce (Optional) */}
            <UIPicker
              label="Secondary Produce (Optional)"
              placeholder="Select"
              options={cropsOptionsToUse.filter(
                c => c.value !== values.primaryCrops,
              )}
              selectedValue={values.secondaryCrops}
              onValueChange={async value =>
                setFieldValue('secondaryCrops', value)
              }
              optional
              disabled={isLoadingCrops}
            />

            {/* Farm Address — only shown after GPS capture */}
            {!!values.address && (
              <UITextInput
                label="Farm Address"
                placeholder="Enter farm address"
                value={values.address}
                maxLength={512}
                onChangeText={text => {
                  handleChange('address')(text);
                }}
                onBlur={handleBlur('address')}
                error={touched.address && !!errors.address}
                helperText={
                  touched.address && errors.address
                    ? errors.address
                    : ''
                }
              />
            )}

            {/* Postal Code (farm) */}
            <UITextInput
              label="Postal Code"
              placeholder="XXXXX"
              value={values.gpsNumber}
              keyboardType="numeric"
              maxLength={5}
              returnKeyType="done"
              onChangeText={text => {
                const digits = text.replace(/\D/g, '').slice(0, 5);
                if (!touched.gpsNumber) setFieldTouched('gpsNumber', true);
                handleChange('gpsNumber')(digits);
              }}
              onBlur={handleBlur('gpsNumber')}
              error={touched.gpsNumber && !!errors.gpsNumber}
              helperText={
                touched.gpsNumber && errors.gpsNumber
                  ? errors.gpsNumber
                  : ''
              }
            />

            {/* GPS Capture CTA */}
            <Pressable
              style={s.locationCta}
              onPress={() =>
                navigation.navigate('CaptureLocation', { returnTo: 'AddFarm' })
              }
              android_ripple={{ color: 'rgba(22,101,52,0.08)' }}
            >
              <View style={s.locationCtaIconCircle}>
                <LocationIcon size={18} color="#166534" />
              </View>
              <View style={s.locationCtaTextWrap}>
                <UITypography variant="medium" style={s.locationCtaTitle}>
                  {values.address
                    ? 'Update farm location'
                    : 'Capture current farm location'}
                </UITypography>
                <UITypography variant="regular" style={s.locationCtaSubtitle}>
                  Use GPS to capture your farm's exact location
                </UITypography>
              </View>
              <ChevronRightIcon size={20} color="#166534" />
            </Pressable>
          </View>

        </KeyboardAwareScrollView>

        <View style={[s.buttonContainer, { paddingBottom: bottom + 16 }]}>
          <UIContainedButton
            style={s.submitButton}
            loading={isSubmitting}
            onPress={handleSubmit as any}
            disabled={!isValid || isSubmitting}
          >
            {isEditMode ? 'Update' : 'Add Farm'}
          </UIContainedButton>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeButton: {
    position: 'absolute',
    top: -20,
    right: 0,
    width: 41,
    height: 41,
    borderRadius: 20.5,
    backgroundColor: '#EDEDED',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    maxHeight: '90%',
    flexShrink: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sheetTitle: {
    fontSize: 18,
    color: '#101010',
    textAlign: 'center',
    paddingTop: 24,
    paddingBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  formCard: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  row: { flexDirection: 'row', gap: 16 },
  rowLeft: { flex: 0.4 },
  rowRight: { flex: 0.6 },
  rowError: {
    fontSize: 12,
    color: '#E53935',
    marginTop: 2,
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 12,
    color: '#8B8B8B',
    marginTop: 12,
    marginBottom: 0,
    lineHeight: 16,
    includeFontPadding: false,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 8,
    alignSelf: 'stretch',
  },
  locationCta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CDE7D6',
    backgroundColor: '#F3FAF5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 4,
  },
  locationCtaIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F3E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationCtaTextWrap: {
    flex: 1,
  },
  locationCtaTitle: {
    fontSize: 14,
    color: '#166534',
  },
  locationCtaSubtitle: {
    fontSize: 12,
    color: '#6B7B70',
    marginTop: 1,
  },
});
