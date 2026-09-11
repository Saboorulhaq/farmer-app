import AuthHeader from '@/components/layout/auth/AuthHeader';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import LocationIcon from '@/components/icons/LocationIcon';
import {
UICheckbox,
UIContainedButton,
UIPicker,
UITextInput,
UITypography,
} from '@/components/ui';
import { FarmerAuthNavigationProp } from '@/navigation/auth/farmer/AuthFarmerNavigation';
import { AuthFarmDetails, useRegisterStore } from '@/store/useRegisterStore';
import { useDebugStore } from '@/store/useDebugStore';
import { DEBUG_FARM_DETAILS } from '@/constants/testing/registrationDebugData';
import type { CapturedLocation } from '@/services/location.service';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import RegisterPrivacyModal from '../../../../components/screens/auth/farmer/farmer-details/AuthFarmerPrivacyModal';
import { styles } from './AuthFarmerDetailsScreen.styled';
import { cropsOptions, farmOptions, farmSizeUnits } from './ts/constants';
import { axiosPublic } from '@/config/axios';
import { trigger } from 'react-native-haptic-feedback';
import { Toast } from 'toastify-react-native';
// Address on this screen is populated via GPS capture/card scan and is not
// character-validated; only a max length applies.

const FarmDetailsSchema = Yup.object().shape({
ownsFarm: Yup.string().required('Select your farm ownership status'),

primaryCrops: Yup.string().required(
'Please select your primary crop.',
),

secondaryCrops: Yup.string().nullable(),

farmSize: Yup.string()
.max(5, 'Farm size must not exceed 5 characters')
.test(
'is-valid-number',
'Please enter a valid number for farm size.',
value => {
if (!value) return false;

    const num = Number(value);

    return !isNaN(num) && num > 0 && num <= 10000;
  },
)
.required('Please enter a valid farm size.'),
farmSizeUnit: Yup.string().required(
'Please select a unit for farm size.',
),
gpsNumber: Yup.string()
.test(
'postal-code',
'Postal code must be exactly 5 digits',
value => {
if (!value || value.trim() === '') return true;

    return /^\d{5}$/.test(value.trim());
  },
)
.test(
  'postal-code-or-address',

  // TASK REQUIREMENT
  'Please enter Postal Code or Farm Location.',

  (value, ctx) => {
    const hasPostalCode =
      !!value && value.trim() !== '';

    const hasAddress =
      !!ctx.parent.addressLine &&
      ctx.parent.addressLine.trim() !== '';

    // User must provide either Postal Code OR Farm Location
    return hasPostalCode || hasAddress;
  },
),
addressLine: Yup.string().max(
512,
'Address must not exceed 512 characters',
),
agree: Yup.boolean()
.oneOf(
[true],
'Please accept the terms and conditions to continue.',
)
.required(
'Please accept the terms and conditions to continue.',
),
});

export default function AuthFarmerDetailsScreen() {
const navigation = useNavigation<FarmerAuthNavigationProp>();

const { navigate } = navigation;

const route = useRoute<
RouteProp<
{
Details: {
capturedLocation?: CapturedLocation;
} | undefined;
},
'Details'
>

();
const { top } = useSafeAreaInsets();
const [privacyVisible, setPrivacyVisible] =
useState(false);

const {
userDetails,
updateFarmDetails,
farmDetails,
} = useRegisterStore();

const isDebugMode = useDebugStore(
state => state.isDebugMode,
);

const [dynamicCrops, setDynamicCrops] = useState<
Array<{
label: string;
value: string;
}>

([]);
const [isLoadingCrops, setIsLoadingCrops] =
useState(false);
const formik = useFormik<AuthFarmDetails>({
initialValues: {
ownsFarm: farmDetails.ownsFarm || '',
primaryCrops: farmDetails.primaryCrops || '',
secondaryCrops:
farmDetails.secondaryCrops || null,
farmSize: farmDetails.farmSize || '',
farmSizeUnit: farmDetails.farmSizeUnit || '',
gpsNumber: farmDetails.gpsNumber || '',
addressLine: farmDetails.addressLine || '',
agree: farmDetails.agree || false,
lat: farmDetails.lat ?? null,
long: farmDetails.long ?? null,
accuracy: farmDetails.accuracy ?? null,
},

validationSchema: FarmDetailsSchema,

validateOnMount: false,
validateOnChange: true,

enableReinitialize: false,

onSubmit: async values => {
  try {
    updateFarmDetails(values);

    // Debug Mode:
    // Skip OTP request and go directly to OTP screen
    if (isDebugMode) {
      navigate('RegisterOTPVerification');
      return;
    }

    const payload = {
      data: {
        attributes: {
          phone_number:
            userDetails.phone_number,

          email:
            userDetails.email,

          skip_count_check: true,

          flow: 'REGISTRATION_OTP',
        },
      },
    };

    await axiosPublic.post(
      '/users/request_otp',
      payload,
    );

    navigate('RegisterOTPVerification');

  } catch (err: any) {
    console.log(err.response);

    trigger('notificationError');

    if (
      err.code === 'NETWORK_ERROR' ||
      !err?.response
    ) {
      Toast.show({
        type: 'error',
        text1: 'No Internet Connection',
        text2:
          'Please check your internet connection and try again',
      });

      return;
    }

    const { data } = err?.response;

    if (data?.error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: data.error,
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
setFieldError,
setTouched,
handleSubmit,
isSubmitting,
handleChange,
handleBlur,
} = formik;

// Debug Mode:
// Prefill farm details
React.useEffect(() => {
if (isDebugMode) {
formik.setValues(DEBUG_FARM_DETAILS);
}

// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isDebugMode]);
React.useEffect(() => {
// Persist in-progress form values
// so back/unmount restores draft
updateFarmDetails({
ownsFarm: values.ownsFarm,
primaryCrops: values.primaryCrops,
secondaryCrops: values.secondaryCrops,
farmSize: values.farmSize,
farmSizeUnit: values.farmSizeUnit,
gpsNumber: values.gpsNumber,
addressLine: values.addressLine,
agree: values.agree,
lat: values.lat,
long: values.long,
accuracy: values.accuracy,
});
}, [
values.ownsFarm,
values.primaryCrops,
values.secondaryCrops,
values.farmSize,
values.farmSizeUnit,
values.gpsNumber,
values.addressLine,
values.agree,
values.lat,
values.long,
values.accuracy,
updateFarmDetails,
]);

// Apply a location captured on the
// Capture Location screen
React.useEffect(() => {
const captured =
route.params?.capturedLocation;

if (captured?.address) {
  setFieldValue(
    'addressLine',
    captured.address,
    false,
  );

  setFieldValue(
    'gpsNumber',
    '',
    false,
  );

  setFieldValue(
    'lat',
    captured.latitude,
    false,
  );

  setFieldValue(
    'long',
    captured.longitude,
    false,
  );

  setFieldValue(
    'accuracy',
    captured.accuracy,
    false,
  );

  setFieldTouched(
    'addressLine',
    true,
    false,
  );

  setFieldError(
    'gpsNumber',
    undefined,
  );

  navigation.setParams({
    capturedLocation: undefined,
  });
}

// eslint-disable-next-line react-hooks/exhaustive-deps
}, [route.params?.capturedLocation]);
// Fetch crop options from API
React.useEffect(() => {
const fetchCropOptions = async () => {
try {
setIsLoadingCrops(true);

    const response =
      await axiosPublic.get(
        '/config_options?key=crop',
      );

    const data =
      response.data?.data || [];

    const mappedCropOptions =
      Array.isArray(data)
        ? data
            .sort(
              (a: any, b: any) =>
                (a.attributes?.sort_order ?? 0) -
                (b.attributes?.sort_order ?? 0),
            )
            .map((item: any) => ({
              value:
                item.attributes?.value || '',
              label:
                item.attributes?.value || '',
            }))
        : [];

    console.log(
      'Crop options from API:',
      mappedCropOptions,
    );

    setDynamicCrops(
      mappedCropOptions,
    );

  } catch (error) {
    console.log(
      'Error fetching crop options:',
      error,
    );

    // Fallback to static options
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

// Use dynamic crops if available
const cropsOptionsToUse =
dynamicCrops.length > 0
? dynamicCrops
: cropsOptions;

/**

CONFIRM BUTTON VALIDATION

Shows validation errors when the user
tries to proceed.

The user must provide either:

Postal Code
OR

Farm Location
*/
const handleConfirm = async () => {
// Mark all required fields as touched
// so validation messages become visible
await setTouched({
ownsFarm: true,
primaryCrops: true,
secondaryCrops: false,
farmSize: true,
farmSizeUnit: true,
gpsNumber: true,
addressLine: true,
agree: true,
lat: false,
long: false,
accuracy: false,
});
// Run validation
const validationErrors =
  await formik.validateForm();

// Stop the user if there are validation errors
if (
  Object.keys(validationErrors).length > 0
) {
  return;
}

// All validation passed
handleSubmit();
};
return (
<View
style={[
styles.scrollView,
{
paddingTop: top + 20,
},
]}
>
<AuthHeader title="Farm Details" />

  <KeyboardAwareScrollView
    enableOnAndroid
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
    extraScrollHeight={
      Platform.OS === 'ios'
        ? 40
        : 200
    }
    contentContainerStyle={styles.contentContainer}
    onScrollBeginDrag={() =>
      Platform.OS === 'ios' &&
      Keyboard.dismiss()
    }
  >
    <View style={styles.screenContent}>
      <View style={styles.container}>

        <UITypography
          variant="regular"
          style={styles.contentTitle}
        >
          Tell us a bit about your{'\n'}
          farming operations
        </UITypography>

        {/* FARM OWNERSHIP */}

        <UIPicker
          label="Farm Ownership"
          requiredLabel
          placeholder="Select"
          options={farmOptions}
          selectedValue={values.ownsFarm}
          onValueChange={async value => {
            await setFieldValue(
              'ownsFarm',
              value,
            );
          }}
          error={
            touched.ownsFarm &&
            !!errors.ownsFarm
          }
          helperText={
            touched.ownsFarm
              ? errors.ownsFarm
              : ''
          }
        />

        {/* FARM SIZE */}

        <View style={styles.formRow}>
          <View style={styles.farmSizeWrapper}>

            <UITypography
              variant="regular"
              style={rowStyles.label}
              requiredAsterisk
              requiredAsteriskStyle={{
                color: '#E53935',
              }}
            >
              Farm Size
            </UITypography>

            <UITextInput
              placeholder="Please enter"
              keyboardType="number-pad"
              returnKeyType="done"
              maxLength={5}
              onSubmitEditing={() =>
                Keyboard.dismiss()
              }
              value={values.farmSize}
              onChangeText={handleChange(
                'farmSize',
              )}
              onBlur={handleBlur(
                'farmSize',
              )}
              error={
                touched.farmSize &&
                !!errors.farmSize
              }
              helperText=""
              wrapperStyle={styles.farmSizeInputWrapper}
              containerStyle={styles.farmSizeInputContainer}
              inputStyle={styles.farmSizeInput}
            />

          </View>

          <View style={styles.farmSizeUnitWrapper}>

            <UITypography
              variant="regular"
              style={rowStyles.label}
              requiredAsterisk
              requiredAsteriskStyle={{
                color: '#E53935',
              }}
            >
              Farm Size Unit
            </UITypography>

            <UIPicker
              requiredLabel
              placeholder="Select"
              options={farmSizeUnits}
              selectedValue={
                values.farmSizeUnit
              }
              onValueChange={async (
                value: any,
              ) => {
                await setFieldValue(
                  'farmSizeUnit',
                  value,
                );
              }}
              error={
                touched.farmSizeUnit &&
                !!errors.farmSizeUnit
              }
              helperText=""
            />

          </View>
        </View>

        {(touched.farmSize &&
          errors.farmSize) ||
        (touched.farmSizeUnit &&
          errors.farmSizeUnit) ? (
          <UITypography
            variant="regular"
            style={rowStyles.error}
          >
            {(touched.farmSize &&
              errors.farmSize) ||
              (touched.farmSizeUnit &&
                errors.farmSizeUnit)}
          </UITypography>
        ) : null}

        {/* PRIMARY PRODUCE */}

        <UIPicker
          label="Primary Produce"
          requiredLabel
          placeholder="Select"
          options={cropsOptionsToUse}
          selectedValue={
            values.primaryCrops
          }
          onValueChange={async value => {
            await setFieldValue(
              'primaryCrops',
              value,
            );
          }}
          error={
            touched.primaryCrops &&
            !!errors.primaryCrops
          }
          helperText={
            touched.primaryCrops
              ? errors.primaryCrops
              : ''
          }
          disabled={isLoadingCrops}
        />

        {/* SECONDARY PRODUCE */}

        <UIPicker
          label="Secondary Produce (Optional)"
          placeholder="Select"
          options={cropsOptionsToUse.reduce(
            (acc, curr) => {
              if (
                curr.value !==
                values.primaryCrops
              ) {
                //@ts-ignore
                acc.push(curr);
              }

              return acc;
            },
            [],
          )}
          selectedValue={
            values.secondaryCrops
          }
          onValueChange={async value =>
            await setFieldValue(
              'secondaryCrops',
              value,
            )
          }
          optional
          disabled={isLoadingCrops}
        />

        {/* POSTAL CODE */}

        <UITextInput
          label="POSTAL CODE"
          placeholder="XXXXX"
          value={values.gpsNumber}
          keyboardType="numeric"
          maxLength={5}
          returnKeyType="done"

          onChangeText={text => {
            const digits = text
              .replace(/\D/g, '')
              .slice(0, 5);

            if (!touched.gpsNumber) {
              setFieldTouched(
                'gpsNumber',
                true,
              );
            }

            handleChange(
              'gpsNumber',
            )(digits);
          }}

          onBlur={handleBlur(
            'gpsNumber',
          )}

          error={
            touched.gpsNumber &&
            !!errors.gpsNumber
          }

          helperText={
            touched.gpsNumber &&
            errors.gpsNumber
              ? errors.gpsNumber
              : ''
          }
        />

        {/* ADDRESS / FARM LOCATION */}

        {!!values.addressLine && (
          <UITextInput
            label="Address"
            placeholder="Enter your address"
            value={values.addressLine}
            maxLength={512}

            onChangeText={text =>
              setFieldValue(
                'addressLine',
                text,
              )
            }

            onBlur={handleBlur(
              'addressLine',
            )}

            error={
              touched.addressLine &&
              !!errors.addressLine
            }

            helperText={
              touched.addressLine &&
              errors.addressLine
                ? errors.addressLine
                : ''
            }

            multiline
            numberOfLines={2}
          />
        )}

        {/* CAPTURE FARM LOCATION */}

        <Pressable
          style={styles.locationCta}

          onPress={() =>
            navigate('CaptureLocation')
          }

          android_ripple={{
            color:
              'rgba(22,101,52,0.08)',
          }}
        >
          <View
            style={
              styles.locationCtaIconCircle
            }
          >
            <LocationIcon
              size={18}
              color="#166534"
            />
          </View>

          <View
            style={
              styles.locationCtaTextWrap
            }
          >
            <UITypography
              variant="medium"
              style={
                styles.locationCtaTitle
              }
            >
              {values.addressLine
                ? 'Update farm location'
                : 'Capture current farm location'}
            </UITypography>

            <UITypography
              variant="regular"
              style={
                styles.locationCtaSubtitle
              }
            >
              Use GPS to capture your farm's
              exact location
            </UITypography>
          </View>

          <ChevronRightIcon
            size={20}
            color="#166534"
          />
        </Pressable>

        {/* TERMS AND CONDITIONS */}

        <View
          style={styles.agreement}
        >
          <UICheckbox
            checked={values.agree}

            onPress={async () => {
              await setFieldValue(
                'agree',
                !values.agree,
              );

              await setFieldTouched(
                'agree',
                true,
              );
            }}
          />

          <UITypography
            variant="regular"
            style={
              styles.agreementText
            }
          >
            I agree to the Terms and Conditions
            {'\n'}
            and{' '}

            <UITypography
              variant="semiBold"
              style={styles.privacyPolicyLink}
              onPress={() =>
                setPrivacyVisible(true)
              }
            >
              Privacy Policy
            </UITypography>

          </UITypography>
        </View>

        {touched.agree &&
          !!errors.agree && (
            <UITypography
              variant="regular"
              style={styles.errorText}
            >
              {errors.agree}
            </UITypography>
          )}

      </View>

      {/* CONFIRM BUTTON */}

      <View style={styles.footer}>
        <UIContainedButton
          loading={isSubmitting}

          // Run our custom validation
          onPress={handleConfirm}

          // Only disable while submitting
          disabled={isSubmitting}
        >
          CONFIRM
        </UIContainedButton>
      </View>

    </View>
  </KeyboardAwareScrollView>

  <RegisterPrivacyModal
    visible={privacyVisible}
    onClose={handlePrivacyClose}
  />

</View>
);
}
const rowStyles = StyleSheet.create({
label: {
fontSize: 12,
color: '#8B8B8B',
marginTop: 12,
lineHeight: 16,
includeFontPadding: false,
},

error: {
fontSize: 12,
color: '#E53935',
marginTop: 2,
marginBottom: 8,
},
});

