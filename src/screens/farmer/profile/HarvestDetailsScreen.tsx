import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  UITextInput,
  UIPicker,
  UIContainedButton,
  UITypography,
  UIToggleSwitch,
} from '@/components/ui';
import CheckIcon from '@/components/icons/CheckIcon';
import Tooltip from '@/components/ui/tooltip';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import FinancialProfileIcon from '@/components/icons/FinancialProfileIcon';
import WarningTriangleIcon from '@/components/icons/WarningTriangleIcon';
import { axiosPrivate } from '@/config/axios';
import { formatFarmLabel } from '@/util/formatFarmLabel';
import { Toast } from 'toastify-react-native';

type FormValues = Record<string, any>;

interface Farm {
  uuid: string;
  ghana_post_gps_number: string | null;
  address: string | null;
  primary_crop: string | null;
  secondary_crop: string | null;
  has_active_loan: boolean;
}

// ── Static field configuration ──

const HARVEST_DETAILS_FIELDS = [
  {
    field_key: 'selected_produce',
    field_type: 'radio' as const,
    label: 'Select Produce',
    is_required: true,
    is_active: true,
    validation_rules: {
      presence: true,
      validation_messages: { presence: 'Please select a crop.' },
    },
    field_config: { layout: 'grid', display_format: 'icon_cards', unit_field: '' },
    options: [
      { option_value: 'maize', option_label: 'Maize', display_order: 0, is_active: true },
      { option_value: 'soybean', option_label: 'Soybean', display_order: 1, is_active: true },
      { option_value: 'sorghum', option_label: 'Sorghum', display_order: 2, is_active: true },
      { option_value: 'rice', option_label: 'Rice', display_order: 3, is_active: true },
      { option_value: 'tomato', option_label: 'Tomato', display_order: 4, is_active: true },
      { option_value: 'onion', option_label: 'Onion', display_order: 5, is_active: true },
      { option_value: 'pepper', option_label: 'Pepper', display_order: 6, is_active: true },
      { option_value: 'cowpea', option_label: 'Cowpea', display_order: 7, is_active: true },
    ],
  },
  {
    field_key: 'expected_volume',
    field_type: 'number' as const,
    label: 'Expected Volume',
    is_required: true,
    is_active: true,
    validation_rules: {
      presence: true,
      type: 'number',
      min: 0.01,
      precision: 2,
      max_length: 10,
      validation_messages: {
        presence: 'Please enter a valid volume greater than zero.',
        min: 'Please enter a valid volume greater than zero.',
        max_length: 'Expected volume must not exceed 10 characters.',
      },
    },
    field_config: { decimal_places: 2, step: 0.01, min: 0, max: null as number | null, unit_field: 'expected_volume_unit' },
    options: [] as any[],
  },
  {
    field_key: 'expected_volume_unit',
    field_type: 'select' as const,
    label: 'Units',
    is_required: true,
    is_active: true,
    validation_rules: {
      presence: true,
      allowed_values: ['bags', 'kg', 'tons', 'MT'],
      validation_messages: { presence: 'Units required.' },
    },
    field_config: { options_source: 'static', unit_field: '' },
    options: [
      { option_value: 'bags', option_label: 'bag(s)', display_order: 0, is_active: true },
      { option_value: 'kg', option_label: 'kg(s)', display_order: 1, is_active: true },
      { option_value: 'tons', option_label: 'ton(s)', display_order: 2, is_active: true },
      { option_value: 'MT', option_label: 'MT', display_order: 3, is_active: true },
    ],
  },
  {
    field_key: 'expected_selling_price_per_unit',
    field_type: 'number' as const,
    label: 'Expected Selling Price per Unit',
    is_required: false,
    is_active: true,
    validation_rules: {
      type: 'number',
      min: 0.01,
      precision: 2,
      max_length: 10,
      validation_messages: {
        min: 'Expected Price must be greater than zero.',
        max_length: 'Expected selling price must not exceed 10 characters.',
      },
    },
    field_config: { decimal_places: 2, step: 0.01, min: 0, currency: 'PKR', unit_field: '' },
    options: [] as any[],
  },
];

// ── Validation helpers ──

const sanitizeNumericInput = (value: string): string => {
  if (!value) return value;
  const startsWithMinus = value.trim().startsWith('-');
  let sanitized = value.replace(/[^\d.-]/g, '');
  const firstDotIndex = sanitized.indexOf('.');
  if (firstDotIndex !== -1) {
    sanitized =
      sanitized.substring(0, firstDotIndex + 1) +
      sanitized.substring(firstDotIndex + 1).replace(/\./g, '');
  }
  sanitized = sanitized.replace(/-/g, '');
  if (startsWithMinus && sanitized.length > 0) sanitized = '-' + sanitized;
  return sanitized;
};

const normalizeNumericInput = (value: string): string => {
  if (!value) return value;
  if (value.includes('.')) {
    const parts = value.split('.');
    const normalizedInteger = parts[0].replace(/^0+/, '') || '0';
    return parts[1] !== undefined ? `${normalizedInteger}.${parts[1]}` : normalizedInteger;
  }
  return value.replace(/^0+/, '') || '0';
};

const isValidCompleteNumber = (value: string): boolean => {
  if (!value) return false;
  return /^-?\d+\.?\d*$|^-?\d*\.?\d+$/.test(value.trim());
};

const validateField = (
  field: { field_key: string; field_type: string; label: string; is_required: boolean; validation_rules: any; field_config: any },
  value: any,
  formValues: FormValues,
): string | null => {
  const rules = field.validation_rules as any;
  if (!rules) return null;
  const messages = rules.validation_messages || {};

  if (rules.presence) {
    if (value === null || value === undefined || value === '') {
      return messages.presence || `${field.label} is required`;
    }
  }

  // Length validation for string values
  if (rules.max_length && value !== null && value !== undefined && value !== '') {
    const strValue = String(value);
    if (strValue.length > rules.max_length) {
      return messages.max_length || `${field.label} must not exceed ${rules.max_length} characters`;
    }
  }

  if (rules.type === 'number' && value !== null && value !== undefined && value !== '') {
    if (typeof value === 'string' && !isValidCompleteNumber(value)) {
      return messages.type || `${field.label} must be a valid number`;
    }
    const n = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(n)) return messages.type || `${field.label} must be a valid number`;
    if (n < 0) return `${field.label} must be greater than zero.`;
  }

  if (value !== null && value !== undefined && value !== '') {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    if (!isNaN(n) && typeof n === 'number') {
      // Bags unit check
      if (field.field_config?.unit_field && formValues) {
        const unitValue = formValues[field.field_config.unit_field];
        if (unitValue === 'bags' && typeof value === 'string' && value.includes('.')) {
          return 'Decimals are not allowed when unit is Bags.';
        }
      }
      // Zero check for volume/price
      if (n <= 0 && (field.field_key.includes('volume') || field.field_key.includes('price'))) {
        if (rules.min === undefined) {
          return field.field_key.includes('volume')
            ? messages.min || 'Volume must be greater than zero.'
            : messages.min || 'Price must be greater than zero.';
        }
      }
      const rawMin =
        rules.min !== undefined && rules.min !== null
          ? rules.min
          : field.field_config?.min;
      const minValue = rawMin !== undefined && rawMin !== null ? rawMin : undefined;
      if (minValue !== undefined && n < minValue)
        return messages.min || `${field.label} must be at least ${minValue}`;

      const rawMax =
        rules.max !== undefined && rules.max !== null
          ? rules.max
          : field.field_config?.max;
      const maxValue = rawMax !== undefined && rawMax !== null ? rawMax : undefined;
      if (maxValue !== undefined && n > maxValue)
        return messages.max || `${field.label} must be at most ${maxValue}`;

      if (rules.precision !== undefined) {
        const str = n.toString();
        const dot = str.indexOf('.');
        if (dot !== -1 && str.length - dot - 1 > rules.precision) {
          return messages.precision || `${field.label} must have at most ${rules.precision} decimal places`;
        }
      }
    }
  }

  if (rules.allowed_values && value !== null && value !== undefined && value !== '') {
    if (!rules.allowed_values.includes(value))
      return messages.allowed_values || `${field.label} has an invalid value`;
  }

  return null;
};

// ── Main screen ──

export default function HarvestDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { top, bottom } = useSafeAreaInsets();

  // Route params: harvest (edit data) and linkedFarmUuids (farms used by OTHER harvests)
  const editHarvest = route.params?.harvest ?? null;
  const otherLinkedFarmUuids: string[] = route.params?.linkedFarmUuids ?? [];
  // Pre-selected farm UUIDs from loan application flow (step 3 farms)
  const preSelectedFarmUuids: string[] = route.params?.preSelectedFarmUuids ?? [];
  // Return destination after save (used when opened from loan application flow)
  const returnToTab: string | undefined = route.params?.returnToTab;
  const returnToScreen: string | undefined = route.params?.returnToScreen;
  const returnToParams: Record<string, any> | undefined = route.params?.returnToParams;

  const [formValues, setFormValues] = useState<FormValues>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Existing harvest detail ID — set when editing (drives POST vs PATCH)
  const [harvestDetailId, setHarvestDetailId] = useState<string | null>(
    editHarvest?.id ? String(editHarvest.id) : null,
  );
  const [loadingInitial, setLoadingInitial] = useState(true);

  // API-loaded data
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(false);
  // linked farm UUIDs (toggles)
  const [linkedFarmIds, setLinkedFarmIds] = useState<Set<string>>(new Set());
  // snapshot of farm links as loaded from the API — used to restore on produce re-selection
  const savedLinkedFarmIds = useRef<Set<string>>(new Set());
  // farmer's own crops for produce validation
  const [farmerCrops, setFarmerCrops] = useState<string[]>([]);
  // Farm UUIDs linked to OTHER harvest details — fetched from API so it's always fresh
  const [fetchedLinkedFarmUuids, setFetchedLinkedFarmUuids] = useState<string[]>([]);

  const [harvestTooltipVisible, setHarvestTooltipVisible] = useState(false);
  const [showAllCrops, setShowAllCrops] = useState(false);

  // Reset form state, re-fetch farms and harvest details whenever focused in create mode.
  // The screen stays mounted across tab navigations, so form state and farm data would
  // otherwise persist/go stale. Also fetches existing harvest_details from API to compute
  // which farm UUIDs are already linked (so they're excluded from the eligible list).
  useFocusEffect(
    useCallback(() => {
      if (route.params?.harvest) return; // edit mode — handled by separate useEffect

      const preUuids: string[] = route.params?.preSelectedFarmUuids ?? [];

      setFormValues({});
      setFieldErrors({});
      setLinkedFarmIds(new Set());
      savedLinkedFarmIds.current = new Set();
      setHarvestDetailId(null);
      setShowAllCrops(false);
      setHarvestTooltipVisible(false);
      setFetchedLinkedFarmUuids([]);

      setLoadingFarms(true);
      Promise.all([
        axiosPrivate.get('/users/farms'),
        axiosPrivate.get('/harvest_details'),
      ])
        .then(([farmsRes, harvestRes]) => {
          // Process farms
          const raw: any[] = farmsRes.data?.data || [];
          const mapped: Farm[] = raw.map((f: any) => {
            const attrs = f.attributes || f;
            return {
              uuid: attrs.uuid || String(f.id),
              ghana_post_gps_number: attrs.ghana_post_gps_number ?? null,
              address: attrs.address ?? null,
              primary_crop: attrs.primary_crop ?? null,
              secondary_crop: attrs.secondary_crop ?? null,
              has_active_loan: attrs.has_active_loan === true,
            };
          });
          setFarms(mapped);
          const crops = new Set<string>();
          mapped.forEach(farm => {
            if (farm.primary_crop) crops.add(farm.primary_crop.toLowerCase().trim());
            if (farm.secondary_crop) crops.add(farm.secondary_crop.toLowerCase().trim());
          });
          setFarmerCrops(Array.from(crops));

          // Compute all farm UUIDs already linked to existing harvest details
          const harvestList: any[] = harvestRes.data?.data || [];
          const allLinkedUuids = harvestList.flatMap(
            (h: any) => h.attributes?.farm_uuids ?? [],
          );
          setFetchedLinkedFarmUuids(allLinkedUuids);

          // Re-apply pre-selection when navigating from loan application flow
          if (preUuids.length > 0) {
            const matchedFarm = mapped.find(f => preUuids.includes(f.uuid));
            if (matchedFarm?.primary_crop) {
              const produce = matchedFarm.primary_crop.toLowerCase().trim();
              setFormValues(prev => ({ ...prev, selected_produce: produce }));
            }
            const preLinkedSet = new Set(
              preUuids.filter(uuid => mapped.some(f => f.uuid === uuid)),
            );
            if (preLinkedSet.size > 0) {
              setLinkedFarmIds(preLinkedSet);
              savedLinkedFarmIds.current = preLinkedSet;
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoadingFarms(false));
    }, [route.params?.harvest, route.params?.preSelectedFarmUuids]),
  );

  // Fetch farms — used for both "Link to farm" toggles and produce validation
  useEffect(() => {
    (async () => {
      try {
        setLoadingFarms(true);
        const res = await axiosPrivate.get('/users/farms');
        const raw: any[] = res.data?.data || [];
        const mapped: Farm[] = raw.map((f: any) => {
          const attrs = f.attributes || f;
          return {
            uuid: attrs.uuid || String(f.id),
            ghana_post_gps_number: attrs.ghana_post_gps_number ?? null,
            address: attrs.address ?? null,
            primary_crop: attrs.primary_crop ?? null,
            secondary_crop: attrs.secondary_crop ?? null,
            has_active_loan: attrs.has_active_loan === true,
          };
        });
        setFarms(mapped);

        // Build allowed crops set for produce validation
        const crops = new Set<string>();
        mapped.forEach(farm => {
          if (farm.primary_crop) crops.add(farm.primary_crop.toLowerCase().trim());
          if (farm.secondary_crop) crops.add(farm.secondary_crop.toLowerCase().trim());
        });
        setFarmerCrops(Array.from(crops));

        // If pre-selected farm UUIDs were passed (from loan application flow),
        // auto-select the primary produce of the first matching farm and pre-link those farms
        if (preSelectedFarmUuids.length > 0 && !editHarvest) {
          const matchedFarm = mapped.find(f => preSelectedFarmUuids.includes(f.uuid));
          if (matchedFarm?.primary_crop) {
            const produce = matchedFarm.primary_crop.toLowerCase().trim();
            setFormValues(prev => ({
              ...prev,
              selected_produce: prev.selected_produce || produce,
            }));
          }
          // Pre-link the selected farms
          const preLinkedSet = new Set(
            preSelectedFarmUuids.filter(uuid => mapped.some(f => f.uuid === uuid)),
          );
          if (preLinkedSet.size > 0) {
            setLinkedFarmIds(preLinkedSet);
            savedLinkedFarmIds.current = preLinkedSet;
          }
        }
      } catch {
        setFarms([]);
        setFarmerCrops([]);
      } finally {
        setLoadingFarms(false);
      }
    })();
  }, []);

  // Pre-populate form when editing an existing harvest detail
  useEffect(() => {
    (async () => {
      try {
        setLoadingInitial(true);

        if (!editHarvest) return; // create mode — nothing to pre-populate

        const attrs = editHarvest;

        // Always sync harvestDetailId from the current edit params — the useState
        // initializer only runs on first mount so it can be stale if the screen was
        // previously visited in create mode.
        setHarvestDetailId(attrs.id ? String(attrs.id) : null);

        setFormValues({
          selected_produce: attrs.selected_produce
            ? attrs.selected_produce.toLowerCase().trim()
            : '',
          expected_volume: attrs.expected_volume != null ? String(attrs.expected_volume) : '',
          expected_volume_unit: attrs.expected_volume_unit ?? '',
          expected_selling_price_per_unit:
            attrs.expected_selling_price_per_unit != null
              ? String(attrs.expected_selling_price_per_unit)
              : '',
        });

        // Pre-select linked farm toggles
        const linkedUuids: string[] = attrs.farm_uuids ?? [];
        if (linkedUuids.length > 0) {
          const initialSet = new Set(linkedUuids);
          setLinkedFarmIds(initialSet);
          savedLinkedFarmIds.current = initialSet;
        }

      } catch {
        // error → form stays empty (create mode)
      } finally {
        setLoadingInitial(false);
      }
    })();
  }, [editHarvest]);

  // Derive active loan status from the farms already fetched — no extra API call needed.
  const hasActiveLoan = useMemo(
    () => Array.from(linkedFarmIds).some(uuid => farms.find(f => f.uuid === uuid)?.has_active_loan === true),
    [farms, linkedFarmIds],
  );

  // Set of farm UUIDs used by OTHER harvest details (not the current one being edited).
  // In edit mode, use route params (caller knows which to exclude). In create mode,
  // use API-fetched data so it's always fresh regardless of which screen navigated here.
  const otherLinkedSet = useMemo(() => {
    if (editHarvest) {
      return new Set(otherLinkedFarmUuids);
    }
    return new Set(fetchedLinkedFarmUuids);
  }, [editHarvest, otherLinkedFarmUuids, fetchedLinkedFarmUuids]);

  // Farms filtered to those whose primary/secondary crop matches the selected produce
  // AND are not already linked to another harvest detail
  const eligibleFarms = useMemo(() => {
    const selectedProduce = formValues.selected_produce?.toLowerCase().trim();
    if (!selectedProduce) return [];
    return farms.filter(f => {
      const primary = f.primary_crop?.toLowerCase().trim();
      const secondary = f.secondary_crop?.toLowerCase().trim();
      const cropMatches = primary === selectedProduce || secondary === selectedProduce;
      // Exclude farms already linked to a different harvest detail
      const isLinkedElsewhere = otherLinkedSet.has(f.uuid);
      return cropMatches && !isLinkedElsewhere;
    });
  }, [farms, formValues.selected_produce, otherLinkedSet]);

  const produceOptions = useMemo(() => {
    // When navigated from the loan flow with specific farm(s) pre-selected,
    // restrict the produce list to only those farms' primary & secondary crops.
    if (preSelectedFarmUuids.length > 0 && farms.length > 0) {
      const selectedFarms = farms.filter(f => preSelectedFarmUuids.includes(f.uuid));
      if (selectedFarms.length > 0) {
        const cropSet = new Set<string>();
        selectedFarms.forEach(f => {
          if (f.primary_crop) cropSet.add(f.primary_crop.toLowerCase().trim());
          if (f.secondary_crop) cropSet.add(f.secondary_crop.toLowerCase().trim());
        });
        const crops = Array.from(cropSet).filter(Boolean);
        if (crops.length > 0) {
          return crops.map(crop => ({
            value: crop,
            label: crop.charAt(0).toUpperCase() + crop.slice(1),
          }));
        }
      }
    }
    // Default: all farmer crops from all farms
    if (farmerCrops.length > 0) {
      return farmerCrops.map(crop => ({
        value: crop,
        label: crop.charAt(0).toUpperCase() + crop.slice(1),
      }));
    }
    // If there are no farms, there is no produce to select.
    if (farms.length === 0) {
      return [];
    }
    return HARVEST_DETAILS_FIELDS[0].options
      .filter(o => o.is_active)
      .sort((a, b) => a.display_order - b.display_order)
      .map(o => ({ value: o.option_value, label: o.option_label }));
  }, [farmerCrops, farms, preSelectedFarmUuids]);

  const volumeUnitOptions = useMemo(
    () =>
      HARVEST_DETAILS_FIELDS[2].options
        .filter(o => o.is_active)
        .sort((a, b) => a.display_order - b.display_order)
        .map(o => ({ label: o.option_label, value: o.option_value })),
    [],
  );

  // ── Field change handlers ──

  const handleFieldChange = useCallback(
    (key: string, value: any) => {
      setFormValues(prev => ({ ...prev, [key]: value }));

      if (key === 'selected_produce' && value) {
        // Deselect linked farms that no longer match and clear their per-farm errors
        const selectedProduceLower = value.toLowerCase().trim();
        const newEligibleUuids = new Set(
          farms
            .filter(f => {
              const primary = f.primary_crop?.toLowerCase().trim();
              const secondary = f.secondary_crop?.toLowerCase().trim();
              return primary === selectedProduceLower || secondary === selectedProduceLower;
            })
            .map(f => f.uuid),
        );
        // Restore any saved links that are eligible for the new produce; clear the rest
        const restoredIds = new Set(
          [...savedLinkedFarmIds.current].filter(id => newEligibleUuids.has(id)),
        );
        setLinkedFarmIds(restoredIds.size > 0 ? restoredIds : new Set([...linkedFarmIds].filter(id => newEligibleUuids.has(id))));

        if (
          farmerCrops.length > 0 &&
          !farmerCrops.includes(value.toLowerCase().trim())
        ) {
          setFieldErrors(prev => ({
            ...prev,
            selected_produce:
              'Selected crop must match either your primary or secondary crop',
          }));
        } else {
          setFieldErrors(prev => ({ ...prev, selected_produce: null }));
        }
      } else {
        setFieldErrors(prev => ({ ...prev, [key]: null }));
      }
    },
    [farmerCrops, farms, linkedFarmIds],
  );

  const handleNumericChange = useCallback(
    (key: string, text: string) => {
      let sanitized = sanitizeNumericInput(text);
      if (key === 'expected_volume' && formValues.expected_volume_unit === 'bags') {
        sanitized = sanitized.replace(/\.\d*/g, '');
      }
      sanitized = normalizeNumericInput(sanitized);
      handleFieldChange(key, sanitized);
    },
    [formValues.expected_volume_unit, handleFieldChange],
  );

  const handleNumericBlur = useCallback(
    (key: string) => {
      const field = HARVEST_DETAILS_FIELDS.find(f => f.field_key === key);
      if (!field) return;
      let val = formValues[key];
      if (typeof val === 'string') {
        val = normalizeNumericInput(sanitizeNumericInput(val));
        if (key === 'expected_volume' && formValues.expected_volume_unit === 'bags') {
          val = val.replace(/\.\d*/g, '');
        }
        if (val !== formValues[key]) setFormValues(prev => ({ ...prev, [key]: val }));
      }
      const error = validateField(field, val, formValues);
      setFieldErrors(prev => ({ ...prev, [key]: error }));
    },
    [formValues],
  );

  const handleUnitChange = useCallback(
    (val: any) => {
      handleFieldChange('expected_volume_unit', val);
      if (val === 'bags' && formValues.expected_volume) {
        const v = formValues.expected_volume;
        if (typeof v === 'string' && v.includes('.')) {
          setFormValues(prev => ({ ...prev, expected_volume: v.replace(/\.\d*/g, '') }));
        }
      }
    },
    [formValues.expected_volume, handleFieldChange],
  );

  const toggleFarm = useCallback((uuid: string) => {
    setLinkedFarmIds(prev => {
      // Single-select: deselect if already linked, otherwise replace with this one
      if (prev.has(uuid)) return new Set();
      return new Set([uuid]);
    });
    setFieldErrors(prev => ({ ...prev, linked_farms: null }));
  }, []);

  // ── Form validity ──

  const isFormValid = useMemo((): boolean => {
    for (const field of HARVEST_DETAILS_FIELDS) {
      if (!field.is_active || !field.is_required) continue;
      const val = formValues[field.field_key];
      if (val === undefined || val === null || val === '') return false;
      if (fieldErrors[field.field_key]) return false;
    }
    if (formValues.selected_produce && eligibleFarms.length === 0) return false;
    if (eligibleFarms.length > 0 && linkedFarmIds.size === 0) return false;
    const hasAnyError = Object.values(fieldErrors).some(e => !!e);
    if (hasAnyError) return false;
    return true;
  }, [formValues, fieldErrors, eligibleFarms, linkedFarmIds]);

  // ── Save ──

  const handleSave = useCallback(async () => {
    Keyboard.dismiss();
    setIsSubmitting(true);

    const newErrors: Record<string, string | null> = {};
    let hasError = false;

    for (const field of HARVEST_DETAILS_FIELDS) {
      if (!field.is_active) continue;
      const error = validateField(field, formValues[field.field_key], formValues);
      if (error) { newErrors[field.field_key] = error; hasError = true; }
    }

    // Produce must match farmer crops
    const selectedProduce = formValues.selected_produce;
    if (
      selectedProduce &&
      farmerCrops.length > 0 &&
      !farmerCrops.includes(selectedProduce.toLowerCase().trim())
    ) {
      newErrors.selected_produce =
        'Selected crop must match either your primary or secondary crop';
      hasError = true;
    }

    // At least one eligible farm must be linked; also block if no farms match the selected produce
    if (formValues.selected_produce && eligibleFarms.length === 0) {
      newErrors.linked_farms = 'No farms are available for the selected produce. Please update a farm or choose a different crop.';
      hasError = true;
    } else if (eligibleFarms.length > 0 && linkedFarmIds.size === 0) {
      newErrors.linked_farms = 'Please link at least one farm.';
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(prev => ({ ...prev, ...newErrors }));
      setIsSubmitting(false);
      return;
    }

    try {
      const farmUuids = Array.from(linkedFarmIds);
      const payload = {
        data: {
          type: 'harvest_detail',
          attributes: {
            selected_produce: formValues.selected_produce,
            expected_volume: parseFloat(formValues.expected_volume),
            expected_volume_unit: formValues.expected_volume_unit,
            expected_selling_price_per_unit: formValues.expected_selling_price_per_unit
              ? parseFloat(formValues.expected_selling_price_per_unit)
              : null,
            link_to_farms: farmUuids.length,
            farm_uuids: farmUuids,
          },
        },
      };

      if (harvestDetailId) {
        await axiosPrivate.patch(`/harvest_details/${harvestDetailId}`, payload);
      } else {
        await axiosPrivate.post('/harvest_details', payload);
      }

      Toast.show({
        type: 'success',
        text1: 'Harvest Details Saved',
        text2: 'Your harvest details have been saved successfully.',
      });

      if (returnToTab && returnToScreen) {
        navigation.navigate(returnToTab, {
          screen: returnToScreen,
          params: returnToParams,
        });
      } else {
        navigation.goBack();
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFieldErrors(prev => ({ ...prev, ...error.response.data.errors }));
      }
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formValues, farmerCrops, eligibleFarms, linkedFarmIds, harvestDetailId, navigation]);

  // ── Render ──

  const MAX_INITIAL_CROPS = 10;
  const hasMoreCrops = produceOptions.length > MAX_INITIAL_CROPS;
  const displayedProduceOptions = showAllCrops
    ? produceOptions
    : produceOptions.slice(0, MAX_INITIAL_CROPS);
  const noFarmsForProduceSelection = !loadingFarms && farms.length === 0;

  if (loadingInitial) {
    return (
      <View style={[s.container, { paddingTop: top }]}>
        <LoanScreenHeader
          title={editHarvest ? 'Edit Harvest Details' : 'Add Harvest Details'}
          onBack={() => navigation.goBack()}
          containerStyle={s.header}
          titleStyle={s.headerTitle}
        />
        <View style={s.centered}>
          <ActivityIndicator size="large" color="#099453" />
        </View>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: top }]}>
      <LoanScreenHeader
        title={editHarvest ? 'Edit Harvest Details' : 'Add Expected Harvest Details'}
        onBack={() => navigation.goBack()}
        containerStyle={s.header}
        titleStyle={s.headerTitle}
      />

      <KeyboardAwareScrollView
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={Platform.OS === 'ios' ? 80 : 100}
        extraHeight={Platform.OS === 'ios' ? 80 : 100}
        enableResetScrollToCoords={false}
        contentContainerStyle={[s.scrollContent, { paddingBottom: bottom + 100 }]}
      >
        {/* ── Harvest Details card ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={s.headerLeft}>
              <FinancialProfileIcon bgFill="#1D3A70" borderColor="#1D3A70" iconFill="#FFFFFF" />
              <UITypography variant="semiBold" style={s.cardTitle}>
                Harvest Details
              </UITypography>
            </View>
            <View style={{ position: 'relative', zIndex: 100 }}>
              <Pressable
                style={s.infoBadge}
                onPress={() => setHarvestTooltipVisible(true)}
              >
                <Text style={s.infoText}>i</Text>
              </Pressable>
              <Tooltip
                visible={harvestTooltipVisible}
                text="Choose the crop you plan to grow and need funding for."
                arrowStyle={{ left: '85%', marginLeft: 0 }}
                style={{ position: 'absolute', bottom: 35, right: -34, width: 200 }}
                onClose={() => setHarvestTooltipVisible(false)}
                placement="top"
              />
            </View>
          </View>

          {/* Select Produce */}
          <View style={s.fieldContainer}>
            <UITypography
              variant="medium"
              style={s.fieldLabel}
              requiredAsterisk
              requiredAsteriskStyle={s.requiredAsterisk}
            >
              Select Produce
            </UITypography>
            {loadingFarms ? (
              <ActivityIndicator size="small" color="#099453" style={{ marginTop: 12 }} />
            ) : noFarmsForProduceSelection ? (
              <UITypography variant="regular" style={s.noFarmsText}>
                No produce to record. Please add a farm first.
              </UITypography>
            ) : (
              <>
                <View style={s.grid}>
                  {displayedProduceOptions.map(opt => {
                    const isSelected = formValues.selected_produce === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        style={[
                          s.produceTile,
                          isSelected && s.produceTileSelected,
                          { justifyContent: 'center', alignItems: 'center' },
                        ]}
                        onPress={() => handleFieldChange('selected_produce', opt.value)}
                      >
                        <UITypography
                          variant="medium"
                          style={[s.produceLabel, { fontSize: 14 }]}
                        >
                          {opt.label}
                        </UITypography>
                      </Pressable>
                    );
                  })}
                </View>
                {hasMoreCrops && !showAllCrops && (
                  <Pressable
                    style={s.viewMoreButton}
                    onPress={() => setShowAllCrops(true)}
                  >
                    <UITypography variant="medium" style={s.viewMoreText}>
                      View More
                    </UITypography>
                  </Pressable>
                )}
                {hasMoreCrops && showAllCrops && (
                  <Pressable
                    style={s.viewMoreButton}
                    onPress={() => setShowAllCrops(false)}
                  >
                    <UITypography variant="medium" style={s.viewMoreText}>
                      View Less
                    </UITypography>
                  </Pressable>
                )}
              </>
            )}
            {fieldErrors.selected_produce && (
              <UITypography
                variant="regular"
                style={[s.errorText, { marginTop: 8 }]}
              >
                {fieldErrors.selected_produce}
              </UITypography>
            )}
          </View>

          {/* Expected Volume + Units */}
          <View style={s.fieldContainer}>
            <View style={s.inlineRow}>
              <View style={s.inlineLeft}>
                <UITextInput
                  label="Expected Volume"
                  labelStyle={s.inputLabel}
                  requiredLabel
                  placeholder="0.00"
                  value={formValues.expected_volume?.toString() || ''}
                  maxLength={10}
                  onChangeText={text => handleNumericChange('expected_volume', text)}
                  onBlur={() => handleNumericBlur('expected_volume')}
                  keyboardType="numeric"
                  error={false}
                  helperText=""
                />
              </View>
              <View style={s.inlineRight}>
                <UIPicker
                  label="Units"
                  labelStyles={s.inputLabel}
                  requiredLabel
                  options={volumeUnitOptions}
                  selectedValue={formValues.expected_volume_unit}
                  onValueChange={handleUnitChange}
                  placeholder="Please Select"
                  inline={false}
                  error={false}
                  helperText=""
                  style={[s.inlinePicker, { marginBottom: 0 }]}
                />
              </View>
            </View>
            {(fieldErrors.expected_volume || fieldErrors.expected_volume_unit) && (
              <View style={{ marginTop: 4 }}>
                {fieldErrors.expected_volume && (
                  <UITypography variant="regular" style={s.errorText}>
                    {fieldErrors.expected_volume}
                  </UITypography>
                )}
                {fieldErrors.expected_volume_unit && (
                  <UITypography
                    variant="regular"
                    style={[
                      s.errorText,
                      { marginTop: fieldErrors.expected_volume ? 4 : 0 },
                    ]}
                  >
                    {fieldErrors.expected_volume_unit}
                  </UITypography>
                )}
              </View>
            )}
          </View>

          {/* Expected Selling Price per Unit */}
          <View style={s.fieldContainer}>
            <UITextInput
              label="Expected Selling Price per Unit"
              labelStyle={s.inputLabel}
              placeholder="0.00"
              value={formValues.expected_selling_price_per_unit?.toString() || ''}
              maxLength={10}
              addonBefore={
                <Text style={{ fontSize: 16, color: '#404040', fontWeight: '500' }}>
                  Rs
                </Text>
              }
              addonBeforeProps={{
                showDivider: false,
                containerStyle: { marginRight: 8, width: 'auto', paddingRight: 0 },
              }}
              onChangeText={text =>
                handleNumericChange('expected_selling_price_per_unit', text)
              }
              onBlur={() => handleNumericBlur('expected_selling_price_per_unit')}
              keyboardType="numeric"
              error={!!fieldErrors.expected_selling_price_per_unit}
              helperText={fieldErrors.expected_selling_price_per_unit || ''}
            />
          </View>

          {/* Link to farm */}
          <View style={s.fieldContainer}>
            <UITypography
              variant="medium"
              style={s.fieldLabel}
              requiredAsterisk={eligibleFarms.length > 0}
              requiredAsteriskStyle={s.requiredAsterisk}
            >
              Link to farm
            </UITypography>

            {loadingFarms ? (
              <ActivityIndicator size="small" color="#099453" style={{ marginTop: 8 }} />
            ) : farms.length === 0 ? (
              <UITypography variant="regular" style={s.noFarmsText}>
                No farms registered yet.
              </UITypography>
            ) : eligibleFarms.length === 0 ? (
              <UITypography variant="regular" style={s.noFarmsText}>
                {formValues.selected_produce
                  ? `No available farms have ${formValues.selected_produce} as a primary or secondary crop (farms already linked to another harvest are excluded).`
                  : 'Select a produce above to see eligible farms.'}
              </UITypography>
            ) : (
              eligibleFarms.map(farm => {
                const displayLabel = formatFarmLabel(
                  farm.ghana_post_gps_number,
                  farm.address,
                  farm.uuid,
                );
                const isLinked = linkedFarmIds.has(farm.uuid);
                return (
                  <View key={farm.uuid} style={s.farmRow}>
                    <UITypography variant="medium" style={s.farmLabel}>
                      {displayLabel}
                    </UITypography>
                    <UIToggleSwitch
                      value={isLinked}
                      onToggle={() => toggleFarm(farm.uuid)}
                      labelLeft="Yes"
                      labelRight="No"
                    />
                  </View>
                );
              })
            )}

            {fieldErrors.linked_farms && (
              <UITypography
                variant="regular"
                style={[s.errorText, { marginTop: 6 }]}
              >
                {fieldErrors.linked_farms}
              </UITypography>
            )}
          </View>
        </View>

        {hasActiveLoan && (
          <View style={s.loanBanner}>
            <WarningTriangleIcon size={20} color="#F32735" />
            <View style={s.loanBannerTextWrap}>
              <UITypography variant="semiBold" style={s.loanBannerTitle}>
                Active Loan linked to the harvest
              </UITypography>
              <UITypography variant="regular" style={s.loanBannerSubtitle}>
                You cannot update harvest details linked to an active loan
              </UITypography>
            </View>
          </View>
        )}

        {/* Save / Update Button */}
        <UIContainedButton
          style={s.saveButton}
          onPress={handleSave}
          disabled={!isFormValid || isSubmitting || hasActiveLoan}
        >
          {isSubmitting ? 'Saving...' : harvestDetailId ? 'Update' : 'Save'}
        </UIContainedButton>
      </KeyboardAwareScrollView>
    </View>
  );
}

// ── Styles ──

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerTitle: { color: '#101010', fontSize: 18, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 24 },
  card: {
    marginTop: 18,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#6d6d6d',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 13, color: '#101010', fontWeight: '600' },
  infoBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { fontSize: 12, fontWeight: '600', color: '#404040' },
  fieldContainer: { marginTop: 16 },
  fieldLabel: { fontSize: 14, color: '#404040', fontWeight: '500', marginBottom: 8 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#404040',
    marginTop: 0,
    marginBottom: 8,
  },
  requiredAsterisk: { color: '#E53935' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  produceTile: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  produceTileSelected: { borderColor: '#099453', backgroundColor: '#09945310' },
  produceLabel: { marginTop: 4, fontSize: 11, color: '#404040', textAlign: 'center' },
  viewMoreButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#099453',
    backgroundColor: '#FFFFFF',
  },
  viewMoreText: { fontSize: 11, color: '#099453', fontWeight: '500' },
  inlineRow: { flexDirection: 'row', gap: 12, marginTop: 16, alignItems: 'flex-end' },
  inlineLeft: { flex: 0.42 },
  inlineRight: { flex: 0.58 },
  inlinePicker: { marginTop: 0, marginBottom: 0 },
  farmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  farmLabel: {
    fontSize: 14,
    color: '#404040',
    flex: 1,
    marginRight: 12,
  },
  farmCheckCircleActive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderColor: '#099453',
    backgroundColor: '#099453',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noFarmsText: {
    fontSize: 13,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
  },
  errorText: { fontSize: 12, color: '#E53935' },
  farmErrorText: { fontSize: 12, color: '#E53935', marginTop: 4, marginBottom: 4 },
  loanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 14,
    marginTop: 24,
    gap: 10,
  },
  loanBannerTextWrap: { flex: 1 },
  loanBannerTitle: { fontSize: 13, color: '#101010', fontWeight: '600' },
  loanBannerSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  saveButton: { marginTop: 24, marginBottom: 40, alignSelf: 'stretch' },
});
