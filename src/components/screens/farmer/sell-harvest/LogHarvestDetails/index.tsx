import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, StatusBar, Pressable, Image, TextInput, Text, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, LayoutAnimation, UIManager, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { styles } from './index.styled';
import UITypography from '@/components/ui/typography';
import { UIIconButton } from '@/components/ui/button';
import UIPicker from '@/components/ui/picker';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';
import LocationIcon from '@/components/icons/LocationIcon';
import ChevronDownIcon from '@/components/icons/ChevronDownIcon';
import CrossIcon from '@/components/icons/CrossIcon';
import DeleteIcon from '@/components/icons/DeleteIcon';
import HarvestDetailImg from '@/assets/images/Harvest-detail.png';
import InfoIcon from '@/assets/images/i-icon.png';
import { axiosFinancingPrivate, axiosPrivate } from '@/config/axios';
import Svg, { Path } from 'react-native-svg';
import { UIToggleSwitch } from '@/components/ui';
import { harvestLogsService } from '@/services/harvestLogs.service';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function EditIcon({ size = 16, color = '#888' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L5.067 13.6l-3.6.733.733-3.6L11.333 2Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Static crop options (fallback)
const CROP_OPTIONS = [
  { label: 'Sorghum', value: 'sorghum' },
  { label: 'Maize', value: 'maize' },
  { label: 'Rice', value: 'rice' },
  { label: 'Wheat', value: 'wheat' },
  { label: 'Soybean', value: 'soybean' },
  { label: 'Cowpea', value: 'cowpea' },
  { label: 'Tomato', value: 'tomato' },
  { label: 'Onion', value: 'onion' },
];

// Static unit options
const UNIT_OPTIONS = [
  { label: 'Kgs', value: 'KGs' },
  { label: 'Tonnes', value: 'Tonnes' },
  { label: 'Bags', value: 'Bags' },
  { label: 'Crates', value: 'Crates' },
];

const MAX_ACTUAL_VOLUME_DIGITS = 7;
const MAX_ACTUAL_VOLUME_INPUT_LENGTH = 10; // Supports up to 7 digits and optional decimal part.

export default function LogHarvestDetails() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { top, bottom } = useSafeAreaInsets();

  // Get submissionId from route params if resuming
  const resumeSubmissionId = route.params?.submissionId;
  // mode: 'log' (from marketplace Log Now), 'view' (view/update existing log), or 'sell' (default - existing full sell flow)
  const mode = route.params?.mode || 'sell';
  const harvestLogId = route.params?.harvestLogId;
  const harvestDetailIdParam = route.params?.harvestDetailId;
  const [isViewLoading, setIsViewLoading] = useState(mode === 'view');
  // Ref to store the pickup location from the API that we need to auto-select once locations are derived
  const pendingPickupLocationRef = useRef<string | null>(null);

  const [crop, setCrop] = useState<string | null>(null);
  const [expectedYield, setExpectedYield] = useState('');
  const [yieldUnit, setYieldUnit] = useState<string | null>(null);
  const [pickupLocations, setPickupLocations] = useState<string[]>([]);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<string | null>(null);
  const [dynamicCrops, setDynamicCrops] = useState<Array<{ label: string; value: string }>>([]);
  const [isLoadingCrops, setIsLoadingCrops] = useState(false);
  const [allFarms, setAllFarms] = useState<any[]>([]);
  const [allHarvestDetails, setAllHarvestDetails] = useState<any[]>([]);
  const [isLoadingHarvestDetails, setIsLoadingHarvestDetails] = useState(false);
  const [noHarvestForCrop, setNoHarvestForCrop] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(resumeSubmissionId || null);
  const [loading, setLoading] = useState(false);
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(false);
  const [actualVolumeError, setActualVolumeError] = useState<string | null>(null);
  // Track harvest_detail_id and farm_uuid for harvest log API
  const [selectedHarvestDetailId, setSelectedHarvestDetailId] = useState<string | null>(null);
  const [selectedFarmUuid, setSelectedFarmUuid] = useState<string | null>(null);

  // Harvest logs accordion state
  const [harvestLogs, setHarvestLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Controls whether the manual harvest form (Harvest Details + Pickup Location) is visible
  const [showAddHarvestForm, setShowAddHarvestForm] = useState(false);

  // Map from pickup location to harvest detail id / farm uuid
  const locationToHarvestInfoRef = useRef<Record<string, { harvestDetailId: string; farmUuid: string }>>({});

  // Refs for keyboard scroll handling
  const scrollViewRef = useRef<ScrollView>(null);
  const actualVolumeInputRef = useRef<TextInput>(null);
  const actualVolumeContainerRef = useRef<View>(null);
  const [actualVolumeYPosition, setActualVolumeYPosition] = useState<number>(0);

  const validateActualVolume = useCallback((value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // Allow only numeric values with an optional decimal point.
    if (!/^\d+(\.\d+)?$/.test(trimmed)) {
      return 'Please enter a valid number';
    }

    const digitCount = trimmed.replace(/\D/g, '').length;
    if (digitCount > MAX_ACTUAL_VOLUME_DIGITS) {
      return `Actual volume cannot exceed ${MAX_ACTUAL_VOLUME_DIGITS} digits`;
    }

    return null;
  }, []);

  // Fetch crop options and harvest details from API, load submission data if resuming
  // Fetch crop options + submission data once (or when resumeSubmissionId changes)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoadingCrops(true);

        const farmsResponse = await axiosPrivate.get('/users/farms');
        const farmsData: any[] = farmsResponse.data?.data || [];
        setAllFarms(farmsData);
        const cropSet = new Set<string>();
        farmsData.forEach((f: any) => {
          const attrs = f.attributes || f;
          if (attrs.primary_crop) cropSet.add(attrs.primary_crop.toLowerCase().trim());
          if (attrs.secondary_crop) cropSet.add(attrs.secondary_crop.toLowerCase().trim());
        });
        const mappedCropOptions = Array.from(cropSet).map(crop => ({
          value: crop,
          label: crop.charAt(0).toUpperCase() + crop.slice(1),
        }));

        setDynamicCrops(mappedCropOptions);

        // If resuming, load submission data to pre-fill form fields
        if (resumeSubmissionId) {
          setIsLoadingSubmission(true);
          try {
            const submissionResponse = await axiosFinancingPrivate.get(`/submissions/${resumeSubmissionId}`);
            const submissionData = submissionResponse.data?.data?.attributes;
            const step = submissionData?.product_configuration?.steps?.[0];
            const section = step?.sections?.[0];
            const fields = section?.fields || [];

            fields.forEach((field: any) => {
              if (field.field_key === 'crop' && field.value) {
                setCrop(field.value);
              } else if (field.field_key === 'expected_volume' && field.value) {
                setExpectedYield(field.value.toString());
              } else if (field.field_key === 'expected_volume_unit' && field.value) {
                setYieldUnit(field.value);
              }
            });
          } catch (error) {
            console.log('Error loading submission data:', error);
          } finally {
            setIsLoadingSubmission(false);
          }
        }
      } catch (error) {
        console.log('Error fetching crop options:', error);
        setDynamicCrops(CROP_OPTIONS);
      } finally {
        setIsLoadingCrops(false);
      }
    };

    fetchInitialData();
  }, [resumeSubmissionId]);

  // Re-fetch farms + harvest details every time the screen is focused so the pickup
  // locations update immediately after the user adds/edits a farm or harvest detail.
  useFocusEffect(
    useCallback(() => {
      const fetchHarvestDetails = async () => {
        try {
          setIsLoadingHarvestDetails(true);
          const [farmsResponse, harvestResponse] = await Promise.all([
            axiosPrivate.get('/users/farms'),
            axiosPrivate.get('/harvest_details'),
          ]);
          const farmsData: any[] = farmsResponse.data?.data || [];
          setAllFarms(farmsData);
          const harvestData = harvestResponse.data?.data || [];
          console.log('📥 [AXIOS RESPONSE] harvest_details:', harvestData);
          setAllHarvestDetails(harvestData);
        } catch (error) {
          console.log('Error fetching harvest details:', error);
        } finally {
          setIsLoadingHarvestDetails(false);
        }
      };

      fetchHarvestDetails();
    }, []),
  );

  // Use dynamic crops if available, otherwise fallback to static options
  const cropsOptionsToUse = dynamicCrops.length > 0 ? dynamicCrops : CROP_OPTIONS;

  // Reusable function to fetch harvest logs
  const fetchHarvestLogs = useCallback(async () => {
    try {
      setIsLoadingLogs(true);
      const response = await harvestLogsService.getAllHarvestLogs();
      const logs = response?.data || [];
      setHarvestLogs(logs);
      // Auto-show the form when there are no harvest logs
      if (logs.length === 0 && mode !== 'view') {
        setShowAddHarvestForm(true);
      }
    } catch (error) {
      console.log('Error fetching harvest logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  }, [mode]);

  // Fetch all harvest logs for the accordion
  useFocusEffect(
    useCallback(() => {
      fetchHarvestLogs();
    }, [fetchHarvestLogs]),
  );

  // Handle selecting a harvest log from the accordion
  const handleSelectLog = async (log: any) => {
    const logId = log.id || log.attributes?.id;
    const attrs = log.attributes || log;

    if (selectedLogId === logId) {
      // Deselect
      setSelectedLogId(null);
      setCrop(null);
      setExpectedYield('');
      setYieldUnit(null);
      setSelectedPickupLocation(null);
      setSelectedHarvestDetailId(null);
      setSelectedFarmUuid(null);
      return;
    }

    setSelectedLogId(logId);
    setExpectedYield(String(attrs.actual_volume || ''));
    setYieldUnit(attrs.actual_volume_unit || null);
    setSelectedPickupLocation(attrs.pickup_location || null);
    pendingPickupLocationRef.current = attrs.pickup_location || null;
    setSelectedFarmUuid(attrs.farm_uuid || null);
    setSelectedHarvestDetailId(attrs.harvest_detail_id || null);

    // Get crop from harvest detail
    const detailId = attrs.harvest_detail_id;
    if (detailId) {
      const matched = allHarvestDetails.find((hd: any) => (hd.id || hd.attributes?.id) === detailId);
      if (matched) {
        const produce = matched.attributes?.selected_produce || '';
        setCrop(produce.toLowerCase().trim());
      }
    }

    // Hide the add form when selecting from accordion
    if (showAddHarvestForm) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowAddHarvestForm(false);
    }
  };

  // Helper to get crop name for a harvest log
  const getCropForLog = (log: any) => {
    const attrs = log.attributes || log;
    const detailId = attrs.harvest_detail_id;
    if (detailId) {
      const matched = allHarvestDetails.find((hd: any) => (hd.id || hd.attributes?.id) === detailId);
      if (matched) {
        const produce = matched.attributes?.selected_produce || '';
        return produce.charAt(0).toUpperCase() + produce.slice(1);
      }
    }
    return 'Unknown Crop';
  };

  // Handle deleting a harvest log
  const handleDeleteLog = useCallback((logId: string) => {
    Alert.alert(
      'Delete Harvest Log',
      'Are you sure you want to delete this harvest log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await harvestLogsService.deleteHarvestLog(logId);
              Toast.success('Harvest log deleted successfully');
              if (selectedLogId === logId) {
                setSelectedLogId(null);
                setCrop(null);
                setExpectedYield('');
                setYieldUnit(null);
                setSelectedPickupLocation(null);
                setSelectedHarvestDetailId(null);
                setSelectedFarmUuid(null);
              }
              if (expandedLogId === logId) {
                setExpandedLogId(null);
              }
              fetchHarvestLogs();
            } catch (err: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: err?.response?.data?.message || 'Failed to delete harvest log. Please try again.',
              });
            }
          },
        },
      ],
    );
  }, [selectedLogId, expandedLogId, fetchHarvestLogs]);

  // Handle editing a harvest log — navigate to this same screen in view mode
  const handleEditLog = useCallback((log: any) => {
    const logId = log.id || log.attributes?.id;
    const attrs = log.attributes || log;
    const detailId = attrs.harvest_detail_id;
    navigation.push('LogHarvestDetails', {
      mode: 'view',
      harvestLogId: logId,
      harvestDetailId: detailId,
    });
  }, [navigation]);

  // Derive pickup locations from matching harvest details whenever crop or allHarvestDetails changes
  useEffect(() => {
    if (!crop) {
      setPickupLocations([]);
      setSelectedPickupLocation(null);
      setNoHarvestForCrop(false);
      return;
    }

    const cropLower = crop.toLowerCase();
    const matching = allHarvestDetails.filter(
      (hd: any) =>
        (hd.attributes?.selected_produce || '').toLowerCase() === cropLower,
    );

    if (matching.length === 0) {
      setPickupLocations([]);
      setNoHarvestForCrop(true);
      setSelectedHarvestDetailId(null);
      setSelectedFarmUuid(null);
      return;
    }

    // Collect all unique pickup locations from the farms linked to matching harvest details.
    // The API returns farm_uuids (not full farm objects), so look up each UUID in allFarms.
    // Use Ghana POST GPS number if available, otherwise fall back to the farm address.
    const locations: string[] = [];
    // Track maps from location to harvest_detail_id and farm_uuid
    const locationToHarvestInfo: Record<string, { harvestDetailId: string; farmUuid: string }> = {};
    matching.forEach((hd: any) => {
      const harvestDetailId = hd.id || hd.attributes?.id;
      const farmUuids: string[] = hd.attributes?.farm_uuids || [];
      farmUuids.forEach((uuid: string) => {
        const farmRecord = allFarms.find((f: any) => (f.attributes?.uuid || f.uuid) === uuid);
        const attrs = farmRecord?.attributes || farmRecord;
        const location = attrs?.ghana_post_gps_number || attrs?.address;
        if (location && !locations.includes(location)) {
          locations.push(location);
          locationToHarvestInfo[location] = { harvestDetailId, farmUuid: uuid };
        }
      });
    });

    setPickupLocations(locations);
    // Auto-select the pending pickup location (from view mode or log selection)
    if (pendingPickupLocationRef.current && locations.includes(pendingPickupLocationRef.current)) {
      const loc = pendingPickupLocationRef.current;
      setSelectedPickupLocation(loc);
      const info = locationToHarvestInfo[loc];
      if (info) {
        setSelectedHarvestDetailId(info.harvestDetailId);
        setSelectedFarmUuid(info.farmUuid);
      }
      pendingPickupLocationRef.current = null;
    } else if (!pendingPickupLocationRef.current) {
      setSelectedPickupLocation(null);
      setSelectedHarvestDetailId(null);
      setSelectedFarmUuid(null);
    }
    setNoHarvestForCrop(false);
    // Store the location-to-harvest mapping for later use
    locationToHarvestInfoRef.current = locationToHarvestInfo;
    console.log('📍 Pickup locations for crop:', crop, locations);
  }, [crop, allHarvestDetails, allFarms]);

  // Fetch harvest log data when in view mode
  useEffect(() => {
    if (mode !== 'view') return;
    const fetchViewData = async () => {
      try {
        setIsViewLoading(true);
        if (harvestLogId) {
          const logResponse = await harvestLogsService.getHarvestLogById(harvestLogId);
          const logData = logResponse?.data?.attributes || logResponse?.data || logResponse;
          setExpectedYield(String(logData.actual_volume || ''));
          setYieldUnit(logData.actual_volume_unit || '');
          setSelectedPickupLocation(logData.pickup_location || null);
          pendingPickupLocationRef.current = logData.pickup_location || null;
          setSelectedFarmUuid(logData.farm_uuid || null);
          setSelectedHarvestDetailId(logData.harvest_detail_id || harvestDetailIdParam || null);

          // Get crop from harvest detail
          const detailId = logData.harvest_detail_id || harvestDetailIdParam;
          if (detailId) {
            const hdResponse = await axiosPrivate.get('/harvest_details');
            const allDetails = hdResponse.data?.data || [];
            const matched = allDetails.find((hd: any) => (hd.id || hd.attributes?.id) === detailId);
            if (matched) {
              const produce = matched.attributes?.selected_produce || '';
              setCrop(produce.toLowerCase().trim());
            }
          }
        }
      } catch (error) {
        console.log('Error fetching harvest log for view:', error);
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load harvest details.' });
      } finally {
        setIsViewLoading(false);
      }
    };
    fetchViewData();
  }, [mode, harvestLogId, harvestDetailIdParam]);

  // Re-validate when value is prefilled from resume API or changed programmatically.
  useEffect(() => {
    setActualVolumeError(validateActualVolume(expectedYield));
  }, [expectedYield, validateActualVolume]);

  const getCropLabel = () => {
    return cropsOptionsToUse.find(opt => opt.value === crop)?.label || '';
  };

  const getUnitLabel = () => {
    return UNIT_OPTIONS.find(opt => opt.value === yieldUnit)?.label || '';
  };

  const handleLogHarvest = async () => {
    if (!crop || !expectedYield || !yieldUnit) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please fill in all required fields.',
      });
      return;
    }

    if (noHarvestForCrop || pickupLocations.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No Harvest Record',
        text2: 'No harvest details found for the selected crop. Please add a harvest record first.',
      });
      return;
    }

    if (!selectedPickupLocation) {
      Toast.show({
        type: 'error',
        text1: 'No Pickup Location',
        text2: 'Please select a pickup location.',
      });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'view') {
        // Update mode: call PATCH harvest_logs API and go back
        if (!harvestLogId) {
          Toast.show({ type: 'error', text1: 'Error', text2: 'Missing harvest log ID.' });
          setLoading(false);
          return;
        }
        const today = new Date().toISOString().split('T')[0];
        await harvestLogsService.updateHarvestLog(harvestLogId, {
          data: {
            type: 'harvest_log',
            attributes: {
              actual_volume: parseFloat(expectedYield),
              actual_volume_unit: yieldUnit,
              harvested_at: today,
              pickup_location: selectedPickupLocation,
            },
          },
        });
        Toast.success('Harvest updated successfully');
        navigation.goBack();
      } else if (mode === 'log' && selectedLogId) {
        // Log mode with accordion selection: navigate to edit view
        const selectedLog = harvestLogs.find((l: any) => (l.id || l.attributes?.id) === selectedLogId);
        if (selectedLog) {
          handleEditLog(selectedLog);
        }
      } else if (mode === 'log') {
        // Log-only mode (from marketplace Log Now): call harvest_logs API and go back
        if (!selectedHarvestDetailId || !selectedFarmUuid) {
          Toast.show({
            type: 'error',
            text1: 'Missing Data',
            text2: 'Unable to determine harvest detail. Please try again.',
          });
          setLoading(false);
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        await harvestLogsService.createHarvestLog({
          data: {
            type: 'harvest_log',
            attributes: {
              harvest_detail_id: selectedHarvestDetailId,
              farm_uuid: selectedFarmUuid,
              actual_volume: parseFloat(expectedYield),
              actual_volume_unit: yieldUnit,
              harvested_at: today,
              pickup_location: selectedPickupLocation,
            },
          },
        });

        Toast.success('Harvest logged successfully');
        navigation.goBack();
      } else if (selectedLogId) {
        // Sell flow: a harvest log is selected from accordion → go to SellHarvest.
        // No /submissions call here; the submission is created once at the end of the
        // flow (aggregators) or skipped entirely (forward sale agreement).

        // Get unit price from the matched harvest detail
        const matchedDetail = allHarvestDetails.find((hd: any) => (hd.id || hd.attributes?.id) === selectedHarvestDetailId);
        const unitPrice = matchedDetail?.attributes?.expected_selling_price_per_unit ?? null;

        const harvestData = {
          crop: getCropLabel(),
          expectedYield,
          yieldUnit: getUnitLabel(),
          pickupLocation: selectedPickupLocation,
          unitPrice,
        };

        navigation.navigate('SellHarvest', {
          harvestData,
          harvestDetailId: selectedHarvestDetailId,
          submissionId,
        });
      } else {
        // Sell flow: adding new harvest via form → POST harvest_log, stay on screen, refresh logs
        if (!selectedHarvestDetailId || !selectedFarmUuid) {
          Toast.show({
            type: 'error',
            text1: 'Missing Data',
            text2: 'Unable to determine harvest detail. Please try again.',
          });
          setLoading(false);
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        await harvestLogsService.createHarvestLog({
          data: {
            type: 'harvest_log',
            attributes: {
              harvest_detail_id: selectedHarvestDetailId,
              farm_uuid: selectedFarmUuid,
              actual_volume: parseFloat(expectedYield),
              actual_volume_unit: yieldUnit,
              harvested_at: today,
              pickup_location: selectedPickupLocation,
            },
          },
        });

        Toast.success('Harvest logged successfully');

        // Reset form and hide it
        setCrop(null);
        setExpectedYield('');
        setYieldUnit(null);
        setSelectedPickupLocation(null);
        setSelectedHarvestDetailId(null);
        setSelectedFarmUuid(null);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowAddHarvestForm(false);

        // Refresh harvest logs so the new one appears in the accordion
        await fetchHarvestLogs();
      }
    } catch (error: any) {
      console.log('❌ Failed to submit harvest details:', error?.response?.data || error?.message);
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: error?.response?.data?.error || 'Failed to submit harvest details. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle focus on Actual Volume input to scroll into view
  const handleActualVolumeFocus = () => {
    // Small delay to ensure keyboard is shown
    setTimeout(() => {
      if (actualVolumeYPosition > 0) {
        scrollViewRef.current?.scrollTo({
          y: actualVolumeYPosition - 100, // Offset to show input above keyboard
          animated: true,
        });
      } else {
        // Fallback: scroll to end if position not measured yet
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    }, 300);
  };

  // Measure the position of the Actual Volume container
  const handleActualVolumeContainerLayout = (event: any) => {
    const { y } = event.nativeEvent.layout;
    setActualVolumeYPosition(y);
  };

  if (isViewLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#099453" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.scrollContent, { paddingTop: top }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <UIIconButton onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeftIcon />
          </UIIconButton>
          <UITypography variant="semiBold" style={styles.headerTitle}>
            {mode === 'view' ? 'Actual Harvest Details' : 'Log Harvest Details'}
          </UITypography>
        </View>

        {/* Subtitle */}
        <UITypography variant="medium" style={styles.subtitle}>
          {mode === 'view' ? 'Review and update your harvest details' : 'Confirm your harvest details'}
        </UITypography>

        {/* Harvest Logs - each log gets its own accordion card */}
        {mode !== 'view' && harvestLogs.length > 0 && (
          <>
            {isLoadingLogs && (
              <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                <ActivityIndicator size="small" color="#099453" />
              </View>
            )}
            {harvestLogs.map((log: any, index: number) => {
              const logId = log.id || log.attributes?.id;
              const attrs = log.attributes || log;
              const isSelected = selectedLogId === logId;
              const isExpanded = expandedLogId === logId;
              const cropName = getCropForLog(log);
              const unitLabel = UNIT_OPTIONS.find(u => u.value === attrs.actual_volume_unit)?.label || attrs.actual_volume_unit || '';

              return (
                <View
                  key={logId || index}
                  style={{
                    marginHorizontal: 20,
                    marginBottom: 12,
                    borderRadius: 12,
                    backgroundColor: isSelected ? '#E7F8F0' : '#FFFFFF',
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: isSelected ? '#099453' : '#E8E8E8',
                  }}
                >
                  {/* Header row: radio + title + chevron */}
                  <Pressable
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setExpandedLogId(isExpanded ? null : logId);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                    }}
                  >
                    {/* Radio button */}
                    <Pressable
                      onPress={() => handleSelectLog(log)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: isSelected ? '#099453' : '#CCC',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      {isSelected && (
                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#099453' }} />
                      )}
                    </Pressable>

                    <Image source={HarvestDetailImg} style={{ width: 24, height: 24, marginRight: 10 }} resizeMode="contain" />
                    <UITypography variant="semiBold" style={{ fontSize: 14, color: '#222', flex: 1 }}>
                      {cropName || 'Harvest Log'}
                    </UITypography>

                    {isExpanded && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, gap: 16 }}>
                        <TouchableOpacity
                          onPress={() => handleEditLog(log)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <EditIcon size={16} color="#888" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteLog(logId)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <DeleteIcon width={14} height={16} color="#888" />
                        </TouchableOpacity>
                      </View>
                    )}

                    <View style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}>
                      <ChevronDownIcon size={20} color="#666" />
                    </View>
                  </Pressable>

                  {/* Expanded body */}
                  {isExpanded && (
                    <View style={{ borderTopWidth: 1, borderTopColor: '#E8E8E8' }}>
                      {/* Harvest Details card */}
                      <View style={[styles.card, { marginHorizontal: 12, marginTop: 12, marginBottom: 6, shadowOpacity: 0, elevation: 0, borderWidth: 0 }]}>
                        <View style={styles.cardHeader}>
                          <Image source={HarvestDetailImg} style={styles.harvestIcon} resizeMode="contain" />
                          <UITypography variant="semiBold" style={styles.cardTitle}>
                            Harvest Details
                          </UITypography>
                        </View>

                        <View style={styles.fieldContainer}>
                          <UITypography variant="medium" style={styles.fieldLabel}>
                            Crop
                          </UITypography>
                          <UITypography variant="medium" style={styles.fieldValue}>
                            {cropName || '—'}
                          </UITypography>
                          <View style={styles.fieldDivider} />
                        </View>

                        <View style={styles.fieldContainer}>
                          <UITypography variant="medium" style={styles.fieldLabel}>
                            Actual Volume
                          </UITypography>
                          <View style={styles.yieldRow}>
                            <View style={styles.yieldField}>
                              <UITypography variant="medium" style={styles.fieldValue}>
                                {attrs.actual_volume || '—'}
                              </UITypography>
                              <View style={styles.fieldDivider} />
                            </View>
                            <View style={styles.yieldField}>
                              <UITypography variant="medium" style={styles.fieldValue}>
                                {unitLabel || '—'}
                              </UITypography>
                              <View style={styles.fieldDivider} />
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Pickup Location card */}
                      <View style={[styles.locationCard, { marginHorizontal: 12, marginTop: 6, marginBottom: 14, shadowOpacity: 0, elevation: 0, borderWidth: 0 }]}>
                        <View style={styles.locationHeader}>
                          <LocationIcon size={21} color="#099453" />
                          <UITypography variant="semiBold" style={[styles.cardTitle, { marginLeft: 12 }]}>
                            Pickup Location
                          </UITypography>
                        </View>
                        <View style={styles.locationRow}>
                          <UITypography variant="medium" style={styles.fieldLabel}>
                            {attrs.pickup_location || '—'}
                          </UITypography>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        {/* Harvest Details Card - shown in view mode always, or when Add Harvest Details is tapped */}
        {(mode === 'view' || showAddHarvestForm) && (
        <>
        <View style={styles.card}>
          <View style={[styles.cardHeader, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={HarvestDetailImg} style={styles.harvestIcon} resizeMode="contain" />
              <UITypography variant="semiBold" style={styles.cardTitle}>
                Harvest Details
              </UITypography>
            </View>
            {mode !== 'view' && (
              <Pressable
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setShowAddHarvestForm(false);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <CrossIcon size={14} />
              </Pressable>
            )}
          </View>

          {/* Crop Field - Dropdown (read-only in view mode) */}
          <View style={styles.fieldContainer}>
            <UITypography variant="medium" style={styles.fieldLabel}>
              Crop
            </UITypography>
            {mode === 'view' ? (
              <UITypography variant="medium" style={styles.fieldLabel}>
                {getCropLabel() || '—'}
              </UITypography>
            ) : (
              <UIPicker
                options={cropsOptionsToUse}
                selectedValue={crop}
                onValueChange={(value) => {
                  setCrop(value);
                }}
                placeholder="Select crop"
                inline
                style={styles.pickerInline}
                disabled={isLoadingCrops}
              />
            )}
            <View style={styles.fieldDivider} />
          </View>

          {/* Actual Volume Fields */}
          <View 
            ref={actualVolumeContainerRef}
            onLayout={handleActualVolumeContainerLayout}
            style={styles.fieldContainer}
          >
            <UITypography variant="medium" style={styles.fieldLabel}>
              Actual Volume
            </UITypography>
            <View style={styles.yieldRow}>
              <View style={styles.yieldField}>
                <TextInput
                  ref={actualVolumeInputRef}
                  style={styles.yieldInput}
                  value={expectedYield}
                  onChangeText={(value) => {
                    setExpectedYield(value);
                    const validationError = validateActualVolume(value);
                    setActualVolumeError(validationError);
                  }}
                  onFocus={handleActualVolumeFocus}
                  keyboardType="numeric"
                  maxLength={MAX_ACTUAL_VOLUME_INPUT_LENGTH}
                  placeholder="Enter volume"
                  placeholderTextColor="#B5B5B5"
                />
                <View style={styles.fieldDivider} />
              </View>
              <View style={styles.yieldField}>
                <UIPicker
                  options={UNIT_OPTIONS}
                  selectedValue={yieldUnit}
                  onValueChange={(value) => {
                    setYieldUnit(value);
                  }}
                  placeholder="Unit"
                  inline
                  style={styles.pickerInline}
                />
                <View style={styles.fieldDivider} />
              </View>
            </View>
            {actualVolumeError ? (
              <Text style={{ color: '#D32F2F', fontSize: 12, marginTop: 6, fontFamily: 'Poppins-Regular' }}>
                {actualVolumeError}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Pickup Location Card */}
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <LocationIcon size={21} color="#099453" />
            <UITypography variant="semiBold" style={[styles.cardTitle, { marginLeft: 12 }]}>
              Pickup Location
            </UITypography>
          </View>

          <View style={styles.locationRow}>
            {isLoadingHarvestDetails ? (
              <ActivityIndicator size="small" color="#099453" />
            ) : !crop ? (
              <UITypography variant="medium" style={[styles.fieldLabel, { color: '#B5B5B5' }]}>
                Select a crop to see pickup location
              </UITypography>
            ) : noHarvestForCrop ? (
              <UITypography variant="medium" style={[styles.fieldLabel, { color: '#D32F2F' }]}>
                No harvest record found for {getCropLabel()}. Please add a harvest record first.
              </UITypography>
            ) : pickupLocations.length === 0 ? (
              <UITypography variant="medium" style={[styles.fieldLabel, { color: '#B5B5B5' }]}>
                No pickup location available
              </UITypography>
            ) : (
              pickupLocations.map((gps, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 6,
                  }}
                >
                  <UITypography variant="medium" style={[styles.fieldLabel, { flex: 1, marginBottom: 0 }]}>
                    {gps}
                  </UITypography>
                  <UIToggleSwitch
                    value={selectedPickupLocation === gps}
                    onToggle={() => {
                      setSelectedPickupLocation(prev => {
                        const newVal = prev === gps ? null : gps;
                        const info = locationToHarvestInfoRef.current[gps];
                        if (newVal && info) {
                          setSelectedHarvestDetailId(info.harvestDetailId);
                          setSelectedFarmUuid(info.farmUuid);
                        } else {
                          setSelectedHarvestDetailId(null);
                          setSelectedFarmUuid(null);
                        }
                        return newVal;
                      });
                    }}
                    labelLeft="Yes"
                    labelRight="No"
                  />
                </View>
              ))
            )}
          </View>
        </View>
        </>
        )}

        {/* Add Harvest Details CTA - only shown when form is hidden, in log/sell modes */}
        {mode !== 'view' && !showAddHarvestForm && (
        <Pressable
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setShowAddHarvestForm(true);
            // Deselect any selected log when manually adding
            setSelectedLogId(null);
          }}
          style={{
            marginHorizontal: 20,
            marginBottom: 16,
            borderRadius: 12,
            backgroundColor: '#099453',
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            width: '60%',
          }}
        >
          <UITypography variant="semiBold" style={{ fontSize: 14, color: '#FFFFFF' }}>
            + Log Harvest Details
          </UITypography>
        </Pressable>
        )}

        {/* Summary Card - Only show when all required fields are filled and a location is selected */}
        {crop && expectedYield && yieldUnit && selectedPickupLocation && (
          <View style={styles.summaryCard}>
            <UITypography variant="medium" style={styles.summaryLabel}>
              You're logging:
            </UITypography>
            <UITypography variant="medium" style={styles.summaryValue}>
              {expectedYield} {getUnitLabel()} of {getCropLabel()}
            </UITypography>
            <UITypography variant="medium" style={styles.summaryLocation}>
              Pickup from {selectedPickupLocation}
            </UITypography>
          </View>
        )}

        {/* Log Harvest Button */}
        <View style={[styles.buttonContainer, { marginBottom: bottom + 20 }]}>
          <Pressable
            onPress={handleLogHarvest}
            disabled={loading || isLoadingCrops || isLoadingHarvestDetails || isLoadingSubmission || !crop || !expectedYield || !yieldUnit || !!actualVolumeError || noHarvestForCrop || !selectedPickupLocation}
            style={{
              borderRadius: 12,
              height: 56,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: (!loading && !isLoadingCrops && !isLoadingHarvestDetails && !isLoadingSubmission && crop && expectedYield && yieldUnit && !actualVolumeError && !noHarvestForCrop && selectedPickupLocation) ? '#099453' : '#E7F8F0',
              ...(!loading && !isLoadingCrops && !isLoadingHarvestDetails && !isLoadingSubmission && crop && expectedYield && yieldUnit && !actualVolumeError && !noHarvestForCrop && selectedPickupLocation && {
                shadowColor: 'rgba(90, 58, 66, 0.24)',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 8,
                elevation: 6,
              }),
            }}
          >
            {(loading || isLoadingSubmission || isLoadingHarvestDetails) ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 16,
                  textAlign: 'center',
                  color: (!isLoadingCrops && !isLoadingHarvestDetails && !isLoadingSubmission && crop && expectedYield && yieldUnit && !actualVolumeError && !noHarvestForCrop && selectedPickupLocation) ? '#FFFFFF' : '#A8D5BA',
                }}
              >
                {mode === 'view' ? 'Update' : (mode === 'log' && selectedLogId) ? 'Update' : selectedLogId ? 'Sell Harvest' : 'Log Harvest'}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
