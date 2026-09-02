import ExclamationCircleFilledIcon from '@/components/icons/ExclamationCircleFilledIcon';
import AuthHeader from '@/components/layout/auth/AuthHeader';
import { UIContainedButton, UITypography } from '@/components/ui';
import { useFarmerIdCardStore } from '@/store/useFarmerIdCardStore';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { useSharedValue, Worklets } from 'react-native-worklets-core';
import * as Cropper from 'vision-camera-cropper';
import { CropRegion } from 'vision-camera-cropper';
import { styles } from './AuthFarmerIdVerificationCamera.styled';

type IdVerificationCameraRouteProp = RouteProp<
  { params: { side: 'front' | 'back' } },
  'params'
>;

export default function AuthFarmerIdVerificationCamera() {
  const { goBack } = useNavigation();
  const {
    params: { side },
  } = useRoute<IdVerificationCameraRouteProp>();
  const { setFrontBase64, setBackBase64 } = useFarmerIdCardStore();
  const { top, bottom } = useSafeAreaInsets();
  const [processing, setProcessing] = useState(false);

  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1920, height: 1080 } },
    { fps: 30 },
  ]);
  const useCrop = useRef(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [cropRegion, setCropRegion] = useState({
    left: 10,
    top: 20,
    width: 80,
    height: 30,
  });
  const cropRegionShared = useSharedValue<undefined | CropRegion>(undefined);
  const shouldTake = useSharedValue(false);

  const capture = () => {
    shouldTake.value = true;
    setProcessing(true);
  };

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');

      // If permission is denied, show alert
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is needed to capture your NADRA ID. Please enable it in settings.',
          [
            {
              text: 'Cancel',
              onPress: () => goBack(),
              style: 'cancel',
            },
            {
              text: 'Continue',
              onPress: async () => {
                // Check if permission is permanently denied
                const permissionStatus =
                  await Camera.getCameraPermissionStatus();
                if (permissionStatus === 'denied') {
                  // Redirect to settings
                  Linking.openSettings().catch(() => {
                    Alert.alert(
                      'Error',
                      'Unable to open settings. Please go to settings manually to grant camera permission.',
                    );
                    goBack();
                  });
                } else {
                  // Try requesting permission again
                  const newStatus = await Camera.requestCameraPermission();
                  if (newStatus === 'granted') {
                    setHasPermission(true);
                    setIsActive(true);
                    adaptCropRegionForIDCard();
                  } else {
                    goBack();
                  }
                }
              },
            },
          ],
        );
      } else {
        setIsActive(true);
        adaptCropRegionForIDCard();
      }
    })();
  }, []);

  const adaptCropRegionForIDCard = () => {
    let size = getFrameSize();
    let regionWidth = 0.8 * size.width;
    let desiredRegionHeight = regionWidth / (85.6 / 54);
    let height = Math.ceil((desiredRegionHeight / size.height) * 100);
    let region = {
      left: 10,
      width: 80,
      top: 35,
      height: height,
    };
    setCropRegion(region);
    cropRegionShared.value = region;
  };

  const getFrameSize = (): { width: number; height: number } => {
    return { width: 1080, height: 1920 };
  };

  const getViewBox = () => {
    const frameSize = getFrameSize();
    return `0 0 ${frameSize.width} ${frameSize.height}`;
  };

  const onCaptured = async (base64: string) => {
    setIsActive(false);
    setProcessing(false);
    if (side === 'front') setFrontBase64(base64);
    if (side === 'back') setBackBase64(base64);
    goBack();
  };

  const onCapturedJS = Worklets.createRunOnJS(onCaptured);

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    if (shouldTake.value && cropRegionShared.value) {
      shouldTake.value = false;
      const result = Cropper.crop(frame, {
        cropRegion: cropRegionShared.value,
        includeImageBase64: true,
        saveAsFile: false,
      });
      if (result.base64) {
        onCapturedJS(result.base64);
      }
    }
  }, []);

  return (
    <View style={[styles.container, { paddingTop: top + 20 }]}>
      <AuthHeader title="Take Photo of Your NADRA ID" />
      <View style={styles.infoContainer}>
        {/* <Text>❗</Text> */}
        <View style={{ paddingTop: 4, paddingRight: 8 }}>
          <ExclamationCircleFilledIcon />
        </View>
        <UITypography style={styles.infoText}>
          Please make sure there's enough{'\n'}lighting and that the text on
          your card is{'\n'}clearly visible in the image.
        </UITypography>
      </View>

      <View style={styles.cameraWrapper}>
        {device && hasPermission && (
          <View style={styles.cameraInner}>
            <Camera
              style={styles.camera}
              isActive={isActive}
              device={device}
              format={format}
              frameProcessor={frameProcessor}
              pixelFormat="yuv"
            />
            <Svg
              preserveAspectRatio="xMidYMid slice"
              style={StyleSheet.absoluteFill}
              viewBox={getViewBox()}
            >
              <Rect
                x={(cropRegion.left / 100) * getFrameSize().width}
                y={(cropRegion.top / 100) * getFrameSize().height}
                width={(cropRegion.width / 100) * getFrameSize().width}
                height={(cropRegion.height / 100) * getFrameSize().height}
                rx={20}
                strokeWidth="4"
                stroke="white"
                fillOpacity={0.0}
              />
            </Svg>
          </View>
        )}
      </View>

      <UIContainedButton
        key={processing || !hasPermission ? 'disabled' : 'enabled'}
        loading={processing}
        disabled={processing || !hasPermission}
        onPress={capture}
      >
        CAPTURE
      </UIContainedButton>
    </View>
  );
}
