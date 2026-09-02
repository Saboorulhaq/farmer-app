import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { styles } from './index.styled';
import UITypography from '@/components/ui/typography';
import {
  UITextInput,
  UIPicker,
  UICheckbox,
  UICheckboxCard,
  UIToggleSwitch,
  UIAmountSelector,
  UIUploadPicker,
  UIDocumentUpload,
} from '@/components/ui';
import type {
  DocumentApiEndpoints,
  DocumentInfo,
} from '@/components/ui/document-upload';
import Tooltip from '@/components/ui/tooltip';
import type {
  ProductConfigurationSection,
  ProductConfigurationField,
  FSAStep,
} from '@/store/useProductsStore';
import { axiosPrivate, axiosFinancingPrivate, axiosPublic } from '@/config/axios';
import { useDebugStore } from '@/store/useDebugStore';
import { formatGpsInput } from '@/util/formatGPSNumber';
import { validDistrictCodes } from '@/constants/regionCodes';

// Icon imports - we'll render icons based on section icon property
import LoanRequestIcon from '@/components/icons/LoanRequestIcon';
import PersonalDetailIcon from '@/components/icons/PersonalDetailIcon';
import ResidentialIcon from '@/components/icons/ResidentialIcon';
import DeclarationIcon from '@/components/icons/DeclarationIcon';
import FarmDetailIcon from '@/components/icons/FarmDetailIcon';
import FinancialProfileIcon from '@/components/icons/FinancialProfileIcon';
import BorrowingDetailsIcon from '@/components/icons/BorrowingDetailsIcon';
import DocumentsIcon from '@/components/icons/DocumentsIcon';
import ArrowDownIcon from '@/components/icons/ArrowDownIcon';
import WarningTriangleIcon from '@/components/icons/WarningTriangleIcon';
import { COUNTRY } from '@env';

// Import facility type images
import BankCreditImg from '@/assets/images/bank-credit.png';

// Produce image assets mapping
const PRODUCE_ASSETS: Record<string, { src: any; style: any }> = {
  maize: { src: require('@/assets/images/farmer/buyer-corn.png'), style: {} },
  soybean: {
    src: require('@/assets/images/farmer/buyer-tractor.png'),
    style: {},
  },
  sorghum: {
    src: require('@/assets/images/farmer/miki39st-vq8p2xu.png'),
    style: {},
  },
  rice: {
    src: require('@/assets/images/farmer/miki3c1v-m1nokpj.png'),
    style: {},
  },
  tomato: { src: require('@/assets/images/farmer/gvb-banner.png'), style: {} },
  onion: {
    src: require('@/assets/images/farmer/miki44o0-bllx5jp.png'),
    style: {},
  },
  pepper: {
    src: require('@/assets/images/farmer/miki46ls-ou6zhqd.png'),
    style: {},
  },
  cowpea: {
    src: require('@/assets/images/farmer/miki48tg-n8cc25j.png'),
    style: {},
  },
};

const ICON_COLORS = {
  bgFill: '#1D3A70',
  borderColor: '#1D3A70',
  strokeColor: '#FFFFFF',
};

type FormValues = Record<string, any>;
type FieldErrors = Record<string, string | null>;

// Submission payload type for the new API format
interface FieldSubmissionPayload {
  is_draft: boolean;
  type: 'product_submission';
  product_slug: string;
  field_values: Record<string, any>;
  step_identifier: string;
  step_number: number;
  submission_id?: string;
}

interface ProductSectionProps {
  section: ProductConfigurationSection;
  formValues: FormValues;
  onFieldChange: (fieldKey: string, value: any) => void;
  stepNumber: number;
  errors?: FieldErrors;
  fsaSteps?: FSAStep[];
  // New submission-related props
  productSlug: string;
  isValidatingStep?: boolean;
  stepIdentifier: string;
  submissionId?: string | null;
  onSubmissionIdReceived?: (submissionId: string) => void;
  registerFieldRef?: (fieldKey: string, ref: View | null) => void;
  onFieldErrorChange?: (fieldKey: string, error: string | null) => void;
  scrollToField?: (fieldRef: View | null) => void;
  // FSA modal and completion props
  onShowFsaModal?: () => void;
  fsaCompleted?: boolean;
  // Payment context for harvest crop filtering
  paymentType?: string; // 'transaction_program' | 'provider_credit'
  harvestDetailIds?: string[]; // Linked harvest detail IDs from selected transaction program
}

// Helper function to check conditional logic
const shouldShowField = (
  field: ProductConfigurationField,
  formValues: FormValues,
): boolean => {
  if (!field.conditional_logic?.show_if) return true;

  const { field_key, operator, value } = field.conditional_logic.show_if;
  const currentValue = formValues[field_key];

  switch (operator) {
    case 'equals':
      return currentValue === value;
    case 'not_equals':
      return currentValue !== value;
    case 'contains':
      return Array.isArray(currentValue) && currentValue.includes(value);
    case 'not_empty':
      return (
        currentValue !== null &&
        currentValue !== undefined &&
        currentValue !== ''
      );
    default:
      return true;
  }
};

// Get section icon based on icon name
const getSectionIcon = (iconName?: string, stepNumber?: number) => {
  switch (iconName) {
    case 'document':
    case 'cash':
      return <LoanRequestIcon size={30} />;
    case 'person':
      return <PersonalDetailIcon {...ICON_COLORS} />;
    case 'home':
    case 'residential':
      return <ResidentialIcon />;
    case 'declaration':
      return <DeclarationIcon />;
    case 'farm':
      return <FarmDetailIcon {...ICON_COLORS} />;
    case 'leaf':
    case 'currency':
      return (
        <FinancialProfileIcon
          bgFill="#1D3A70"
          borderColor="#1D3A70"
          iconFill="#FFFFFF"
        />
      );
    case 'bank':
      return <BorrowingDetailsIcon />;
    case 'folder':
      return (
        <DocumentsIcon
          size={30}
          bgFill="#1D3A70"
          borderColor="#1D3A70"
          strokeColor="#FFFFFF"
        />
      );
    default:
      // Return icon based on step number as fallback
      switch (stepNumber) {
        case 1:
          return <LoanRequestIcon size={30} />;
        case 2:
          return <PersonalDetailIcon {...ICON_COLORS} />;
        case 3:
          return <FarmDetailIcon {...ICON_COLORS} />;
        case 4:
          return (
            <FinancialProfileIcon
              bgFill="#1D3A70"
              borderColor="#1D3A70"
              iconFill="#FFFFFF"
            />
          );
        case 5:
          return (
            <DocumentsIcon
              size={30}
              bgFill="#1D3A70"
              borderColor="#1D3A70"
              strokeColor="#FFFFFF"
            />
          );
        default:
          return null;
      }
  }
};

// Get facility type image and label
const getFacilityTypeDisplay = (field: ProductConfigurationField, fieldValue: string) => {
  const matchedOption = field.options?.find(
    opt => opt.option_value === fieldValue,
  );
  return {
    image: BankCreditImg,
    label: matchedOption?.option_label || fieldValue || 'Bank Credit',
  };
};

// Helper function to sanitize text input - removes emojis and special characters
const sanitizeTextInput = (value: string, shouldTrim: boolean = false): string => {
  if (!value) return value;
  // Remove emojis and special unicode characters
  let sanitized = value.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
    '',
  );
  // Only trim if explicitly requested (e.g., on blur)
  // Always collapse multiple consecutive spaces (even during typing)
  // This prevents double/triple spaces when invalid characters are removed
  sanitized = sanitized.replace(/[ \t]+/g, ' ');

  // If result is only whitespace, return empty string (don't leave a single space)
  if (sanitized.trim() === '') {
    return '';
  }

  // Only trim if explicitly requested (e.g., on blur)
  if (shouldTrim) {
    // Collapse newlines and other whitespace into single space
    sanitized = sanitized.replace(/[\s\uFEFF\xA0]+/g, ' ');
    // Then trim leading/trailing
    sanitized = sanitized.trim();
  }
  return sanitized;
};

// Helper function to sanitize restricted text input - removes unsupported characters
// Only allows: standard Latin letters (a-z, A-Z), numbers, spaces, and basic punctuation (.,!?-)
// Removes: non-Latin scripts (Arabic, Urdu, etc.), emojis, script tags, special symbols (@#$%^&* etc.), quotes, parentheses, etc.
// Used for textarea fields and Name/Position text fields
const sanitizeRestrictedTextInput = (value: string, shouldTrim: boolean = false): string => {
  if (!value) return value;
  // First remove non-Latin scripts (characters outside ASCII and Latin-1 Supplement)
  // This removes Arabic, Urdu, Chinese, Japanese, and other non-Latin scripts
  let sanitized = value.replace(/[^\x00-\x7F\u00C0-\u00FF]/g, '');
  // Then remove all characters except standard Latin letters, numbers, spaces, and basic punctuation
  // Allowed: a-z, A-Z, 0-9, space, . (period) , (comma) ! ? - (hyphen)
  // Note: Escaping special regex characters: . , ! ? - (hyphen needs to be at the end or escaped)
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s.,!?-]/g, '');
  // Remove script tags explicitly (case-insensitive) - do this after character filtering
  sanitized = sanitized.replace(/<\/?script[^>]*>/gi, '');
  sanitized = sanitized.replace(/<\/?style[^>]*>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, ''); // Remove event handlers like onclick=
  // Always collapse multiple consecutive spaces (even during typing)
  // This prevents double/triple spaces when invalid characters are removed
  sanitized = sanitized.replace(/[ \t]+/g, ' ');

  // If result is only whitespace, return empty string (don't leave a single space)
  if (sanitized.trim() === '') {
    return '';
  }

  // Only trim if explicitly requested (e.g., on blur)
  if (shouldTrim) {
    // Collapse newlines and other whitespace into single space
    sanitized = sanitized.replace(/[\s\uFEFF\xA0]+/g, ' ');
    // Then trim leading/trailing
    sanitized = sanitized.trim();
  }
  return sanitized;
};

// Helper function to check for unsupported characters in restricted text fields
// Returns true if unsupported characters are found (including non-Latin scripts)
// Used for textarea fields and Name/Position text fields
const hasUnsupportedCharacters = (value: string): boolean => {
  if (!value) return false;
  // First check for non-Latin scripts (Arabic, Urdu, Chinese, etc.)
  // Only allow ASCII (0x00-0x7F) and Latin-1 Supplement (0xC0-0xFF) which includes accented Latin characters
  const nonLatinRegex = /[^\x00-\x7F\u00C0-\u00FF]/;
  if (nonLatinRegex.test(value)) return true;
  // Check for characters that are NOT allowed: anything except standard Latin letters, numbers, spaces, and basic punctuation
  // Allowed: a-z, A-Z, 0-9, space, . , ! ? - (hyphen at end of character class)
  const unsupportedRegex = /[^a-zA-Z0-9\s.,!?-]/;
  if (unsupportedRegex.test(value)) return true;
  // Check for script tags (case-insensitive)
  if (/<\/?script[^>]*>/gi.test(value)) return true;
  if (/<\/?style[^>]*>/gi.test(value)) return true;
  // Check for event handlers like onclick=
  if (/on\w+\s*=/gi.test(value)) return true;
  return false;
};

// Helper function to check if a field is a Name or Position field
// Returns true if the field should have restricted character validation
const isNameOrPositionField = (fieldKey: string): boolean => {
  // Check if field key contains "name" or "position" but exclude specific fields that shouldn't be restricted
  const lowerKey = fieldKey.toLowerCase();
  if (lowerKey.includes('ghana_card')) return false; // Ghana Card numbers have their own format
  if (lowerKey.includes('gps')) return false; // GPS fields have their own format
  return lowerKey.includes('name') || lowerKey.includes('position');
};

// Helper function to check if a string is a valid complete number
// Returns true if the entire string represents a valid number (no trailing non-numeric characters)
const isValidCompleteNumber = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;

  // Trim whitespace
  const trimmed = value.trim();
  if (trimmed === '') return false;

  // Check if the entire string matches a valid number pattern
  // Allows: digits, optional decimal point, optional negative sign at the start
  // Examples: "123", "123.45", "-123", "0.5", ".5"
  // Rejects: "123abc", "123.45xyz", "12 34", etc.
  // Pattern breakdown:
  //   -? = optional minus sign
  //   \d+\.?\d* = one or more digits, optional decimal point, optional more digits
  //   | \d*\.?\d+ = or: optional digits, optional decimal point, one or more digits
  const numberRegex = /^-?\d+\.?\d*$|^-?\d*\.?\d+$/;

  return numberRegex.test(trimmed);
};

// Helper function to sanitize numeric input - only allows digits, decimal point, and optional minus sign
// Prevents non-numeric characters from being entered in number fields
const sanitizeNumericInput = (value: string): string => {
  if (!value || typeof value !== 'string') return value;

  // Store original first character to preserve minus sign position
  const startsWithMinus = value.trim().startsWith('-');

  // Remove all characters except digits, decimal point, and minus sign
  let sanitized = value.replace(/[^\d.-]/g, '');

  // Only allow one decimal point (keep the first one)
  const firstDotIndex = sanitized.indexOf('.');
  if (firstDotIndex !== -1) {
    sanitized = sanitized.substring(0, firstDotIndex + 1) + sanitized.substring(firstDotIndex + 1).replace(/\./g, '');
  }

  // Only allow minus sign at the start
  // Remove all minus signs first, then add one at the start if needed
  sanitized = sanitized.replace(/-/g, '');
  if (startsWithMinus && sanitized.length > 0) {
    sanitized = '-' + sanitized;
  }

  return sanitized;
};

// Helper function to normalize numeric values by removing leading zeros
const normalizeNumericInput = (value: string): string => {
  if (!value || typeof value !== 'string') return value;

  // Handle decimal numbers separately - preserve leading zero before decimal point
  // e.g., "0.5" should stay "0.5", but "001.50" should become "1.50"
  if (value.includes('.')) {
    const parts = value.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // Remove leading zeros from integer part, but keep at least one digit
    const normalizedInteger = integerPart.replace(/^0+/, '') || '0';

    // Return normalized value with decimal part
    return decimalPart !== undefined ? `${normalizedInteger}.${decimalPart}` : normalizedInteger;
  }

  // For integers, remove leading zeros but keep at least one digit (e.g., "000" -> "0")
  return value.replace(/^0+/, '') || '0';
};

// Helper function to check for invalid characters (non-Latin for specific fields)
const hasInvalidCharacters = (
  value: string,
  allowNonLatin: boolean = true,
): boolean => {
  if (!value || allowNonLatin) return false;
  // Check if string contains non-ASCII characters (excluding common accents)
  const nonLatinRegex = /[^\x00-\x7F\u00C0-\u00FF]/;
  return nonLatinRegex.test(value);
};

// Helper function to check for emojis
const hasEmojis = (value: string): boolean => {
  if (!value) return false;
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(value);
};

// Helper function to validate file
const validateFile = (
  file: any,
  allowedTypes?: string[],
  maxSizeMB?: number,
): string | null => {
  if (!file) return null;

  // Check file type
  if (allowedTypes && allowedTypes.length > 0) {
    const fileType = file.type || file.mimeType || '';
    const fileName = file.name || file.fileName || '';
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    const isValidType =
      allowedTypes.some(type => fileType.includes(type)) ||
      allowedTypes.some(type => {
        if (type.includes('pdf')) return fileExtension === 'pdf';
        if (type.includes('jpeg') || type.includes('jpg'))
          return ['jpg', 'jpeg'].includes(fileExtension || '');
        if (type.includes('png')) return fileExtension === 'png';
        if (type.includes('svg')) return fileExtension === 'svg';
        return false;
      });

    if (!isValidType) {
      return 'This file type is not supported. Please upload PDF, PNG, JPG, or SVG files only.';
    }
  }

  // Check file size
  if (maxSizeMB && file.size) {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File is too large. Maximum size is ${maxSizeMB} MB.`;
    }
  }

  // Check if file is readable/not corrupt (basic check)
  if (file.size === 0) {
    return 'We could not read this file. Please try uploading again.';
  }

  // Check for invalid filename characters
  const fileName = file.name || file.fileName || '';
  const invalidCharsRegex = /[<>:"/\\|?*\x00-\x1F]/;
  if (invalidCharsRegex.test(fileName)) {
    return 'File name contains invalid characters. Please rename the file and try again.';
  }

  return null;
};

// Format a raw value for display (handles linked_farms and other arrays of objects)
const formatDisplayValue = (rawVal: any): string => {
  if (rawVal === null || rawVal === undefined || rawVal === '') return '';
  if (Array.isArray(rawVal)) {
    const first = rawVal[0];
    if (first != null && typeof first === 'object' && !Array.isArray(first)) {
      return rawVal
        .map((item: any) => {
          if (typeof item === 'string') return item;
          const candidates = [
            item.ghana_post_gps_number,
            item.ghana_post_gps,
            item.location,
            item.name,
            item.uuid,
            item.id,
          ];
          const label = candidates.find((c: any) => c != null && typeof c !== 'object');
          const str = label != null ? String(label).trim() : '';
          return str || '—';
        })
        .filter(Boolean)
        .join(', ');
    }
    return rawVal.map((x: any) => String(x)).join(', ');
  }
  return String(rawVal);
};

// Helper function to check if any borrowing detail field has a value
const hasAnyBorrowingDetailValue = (formValues: FormValues): boolean => {
  const borrowingDetailFields = ['lender', 'borrowing_facility_type', 'outstanding_amount', 'outstanding_currency'];
  return borrowingDetailFields.some(fieldKey => {
    const fieldValue = formValues[fieldKey];
    if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
      return false;
    }
    // For number fields, check if value is greater than 0
    if (typeof fieldValue === 'string') {
      const numValue = parseFloat(fieldValue);
      if (!isNaN(numValue)) {
        return numValue > 0;
      }
    }
    return true;
  });
};

// Cache for committed volume to avoid repeated API calls
let committedVolumeCache: { volume: number; unit: string; timestamp: number } | null = null;
const CACHE_DURATION = 5000; // 5 seconds cache

// Helper function to get committed volume from FSA steps (checks both config and fetches from API if needed)
const getCommittedVolumeFromFSA = async (
  fsaSteps?: FSAStep[], 
  submissionId?: string | null
): Promise<{ volume: number; unit: string } | null> => {
  // First, try to get from FSA steps in config (fastest)
  if (fsaSteps && fsaSteps.length > 0) {
    const fsaStep = fsaSteps.find(step => step.identifier === 'forward_sale_agreement');
    if (fsaStep && fsaStep.sections) {
      for (const section of fsaStep.sections) {
        if (!section.fields) continue;
        
        const committedVolumeField = section.fields.find(
          field => field.field_key === 'committed_volume'
        );
        
        const committedVolumeUnitField = section.fields.find(
          field => field.field_key === 'committed_volume_unit'
        );
        
        if (committedVolumeField && committedVolumeField.value) {
          const committedValue = parseFloat(committedVolumeField.value);
          const committedUnit = committedVolumeUnitField?.value || '';
          
          if (!isNaN(committedValue) && committedValue > 0) {
            return { volume: committedValue, unit: committedUnit };
          }
        }
      }
    }
  }
  
  // Check cache first
  if (committedVolumeCache && (Date.now() - committedVolumeCache.timestamp) < CACHE_DURATION) {
    return { volume: committedVolumeCache.volume, unit: committedVolumeCache.unit };
  }
  
  // If not in config and we have submissionId, fetch from API
  if (submissionId) {
    try {
      const response = await axiosFinancingPrivate.get(`/submissions/${submissionId}`);
      const responseData = response.data?.data || response.data;
      const fsaStepsFromAPI = responseData?.attributes?.product_configuration?.fsa_steps || [];
      
      for (const step of fsaStepsFromAPI) {
        if (step.identifier === 'forward_sale_agreement' && step.sections) {
          for (const section of step.sections) {
            if (section.fields) {
              const committedVolumeField = section.fields.find((f: any) => f.field_key === 'committed_volume');
              const committedVolumeUnitField = section.fields.find((f: any) => f.field_key === 'committed_volume_unit');
              
              if (committedVolumeField?.value) {
                const committedValue = parseFloat(committedVolumeField.value);
                const committedUnit = committedVolumeUnitField?.value || '';
                
                if (!isNaN(committedValue) && committedValue > 0) {
                  // Cache the result
                  committedVolumeCache = {
                    volume: committedValue,
                    unit: committedUnit,
                    timestamp: Date.now()
                  };
                  return { volume: committedValue, unit: committedUnit };
                }
              }
            }
          }
        }
      }
    } catch (error) {
      // Silently handle error - validation will just skip if API fails
    }
  }
  
  return null;
};

// Validation helper function
const validateField = (
  field: ProductConfigurationField,
  value: any,
  formValues?: FormValues,
  fsaSteps?: FSAStep[],
): string | null => {
  const rules = field.validation_rules;
  if (!rules) return null;

  const messages = rules?.validation_messages || {};

  // =====================
  // FILE TYPE VALIDATIONS
  // =====================
  if (field.field_type === 'file' && value) {
    const fileError = validateFile(
      value,
      rules?.file_types || field.field_config?.allowed_types,
      rules?.max_size_mb || field.field_config?.max_size_mb,
    );
    if (fileError) return fileError;
  }

  // =====================
  // GPS / ADDRESS XOR VALIDATION
  // =====================
  if (
    (field.field_key === 'residential_ghana_post_gps_number' || field.field_key === 'residential_address_details') &&
    formValues
  ) {
    const gpsKey = 'residential_ghana_post_gps_number';
    const addressKey = 'residential_address_details';
    const gpsVal = field.field_key === gpsKey
      ? ((value || '') + '').trim()
      : ((formValues[gpsKey] || '') + '').trim();
    const addressVal = field.field_key === addressKey
      ? ((value || '') + '').trim()
      : ((formValues[addressKey] || '') + '').trim();
    const hasGps = gpsVal.length > 0;
    const hasAddress = addressVal.length > 0;

    if (!hasGps && !hasAddress) {
      return 'Enter either Postal Code or Address.';
    }
    if (hasGps && hasAddress) {
      return 'Provide only one: Postal Code or Address.';
    }
    // If this field is empty and the sibling is filled, skip further validation
    if (((value || '') + '').trim().length === 0) {
      return null;
    }
  }

  // Special validation for borrowing details fields
  // If any borrowing detail field has a value, all related fields become required
  const borrowingDetailFields = ['lender', 'borrowing_facility_type', 'outstanding_amount', 'outstanding_currency'];
  const isBorrowingDetailField = borrowingDetailFields.includes(field.field_key);
  const shouldBeRequired = isBorrowingDetailField && formValues && hasAnyBorrowingDetailValue(formValues);

  // Check required/presence (including conditional requirement for borrowing details)
  // Skip presence check for GPS/Address fields (handled by XOR validation above)
  const isGpsAddressField = field.field_key === 'residential_ghana_post_gps_number' || field.field_key === 'residential_address_details';
  const isRequired = rules?.presence || shouldBeRequired;
  if (isRequired && !isGpsAddressField) {
    if (value === null || value === undefined || value === '') {
      return messages.presence || `${field.label} is required`;
    }
    // Check empty arrays for multiselect
    if (Array.isArray(value) && value.length === 0) {
      return messages.presence || `${field.label} is required`;
    }
    // For number fields in borrowing details, check if value is greater than 0
    if (field.field_type === 'number' && isBorrowingDetailField) {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue) || numValue <= 0) {
        return messages.presence || messages.min || `${field.label} is required`;
      }
    }
  }

  // =====================
  // TEXT VALIDATIONS
  // =====================
  if (
    typeof value === 'string' &&
    value.length > 0 &&
    (field.field_type === 'text' || field.field_type === 'textarea')
  ) {
    // Check for emojis in text fields
    if (hasEmojis(value)) {
      return (
        messages.invalid_characters ||
        'Some characters are not allowed. Please use standard text only.'
      );
    }

    // Check for unsupported characters (including non-Latin scripts) in textarea fields (like description fields)
    // This restricts input to standard Latin letters, numbers, spaces, and basic punctuation only
    // Applies to textarea fields that should not accept special characters, emojis, script tags, or non-Latin scripts
    // Prevents issues with downstream processing, payload handling, and PDF generation
    if (field.field_type === 'textarea' && hasUnsupportedCharacters(value)) {
      return (
        messages.invalid_characters ||
        'Some characters cannot be processed. Please edit the text.'
      );
    }

    // Check for unsupported characters (including non-Latin scripts) in Name and Position text fields
    // This restricts input to standard Latin letters, numbers, spaces, and basic punctuation only
    // Prevents script tags, special symbols, non-Latin scripts, and other unsupported characters
    // Prevents issues with downstream processing, payload handling, and PDF generation
    if (field.field_type === 'text' && isNameOrPositionField(field.field_key) && hasUnsupportedCharacters(value)) {
      return (
        messages.invalid_characters ||
        'Some characters cannot be processed. Please edit the text.'
      );
    }

    // Check for non-Latin characters if field requires ASCII only
    if (rules?.ascii_only && hasInvalidCharacters(value, false)) {
      return (
        messages.invalid_characters || 'Please use standard Latin letters only.'
      );
    }

    // Check for allowed characters pattern (for names, positions, etc.)
    if (rules?.allowed_characters) {
      try {
        const allowedRegex = new RegExp(rules.allowed_characters);
        if (!allowedRegex.test(value)) {
          return (
            messages.allowed_characters ||
            'Please use only allowed characters for this field.'
          );
        }
      } catch (e) {
        console.log(
          'Invalid allowed_characters regex:',
          rules.allowed_characters,
        );
      }
    }
  }

  // Check type validation
  if (rules?.type && value !== null && value !== undefined && value !== '') {
    switch (rules.type) {
      case 'number':
        // For string values, check if it's a valid complete number (no trailing characters)
        if (typeof value === 'string') {
          if (!isValidCompleteNumber(value)) {
            return messages.type || `${field.label} must be a valid number`;
          }
        }
        const numVal = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numVal)) {
          return messages.type || `${field.label} must be a valid number`;
        }
        // Check for negative values when not allowed
        if (rules?.positive_only !== false && numVal < 0) {
          return (
            messages.negative || `${field.label} must be greater than zero.`
          );
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          return messages.type || `${field.label} must be a boolean value`;
        }
        break;
      case 'date':
        const dateVal = new Date(value);
        if (isNaN(dateVal.getTime())) {
          return messages.type || `${field.label} must be a valid date`;
        }
        break;
    }
  }

  // Check must_be_true for checkboxes/confirmations
  if (rules?.must_be_true && value !== true) {
    return messages.must_be_true || `You must confirm ${field.label}`;
  }

  // =====================
  // NUMBER VALIDATIONS
  // =====================
  if (value !== null && value !== undefined && value !== '') {
    // For number fields, first verify the value is actually a valid complete number
    // This must be done BEFORE any numeric validations (precision, min, max, etc.)
    if (field.field_type === 'number') {
      // For string values, check if it's a valid complete number (no trailing characters)
      if (typeof value === 'string') {
        if (!isValidCompleteNumber(value)) {
          return messages.type || `${field.label} must be a valid number`;
        }
      }
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      // If the value is not a valid number, return type error immediately
      // This ensures consistent error messages for non-numeric input
      if (isNaN(numValue)) {
        return messages.type || `${field.label} must be a valid number`;
      }
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    // Check if volume field has unit "bags" - decimals not allowed
    if (
      field.field_type === 'number' &&
      field.field_key.includes('volume') &&
      field.field_config?.unit_field &&
      formValues
    ) {
      const unitFieldKey = field.field_config.unit_field;
      const unitValue = formValues[unitFieldKey];

      if (unitValue === 'bags') {
        // Check if value contains decimals
        const valueStr = typeof value === 'string' ? value : value?.toString();
        if (valueStr && valueStr.includes('.')) {
          return 'Decimals are not allowed when unit is Bags.';
        }
      }
    }

    // Check zero or negative for harvest volume, price fields
    if (
      !isNaN(numValue) &&
      (field.field_key.includes('volume') ||
        field.field_key.includes('price') ||
        field.field_key.includes('amount'))
    ) {
      if (numValue <= 0 && rules?.min === undefined) {
        if (field.field_key.includes('volume')) {
          return messages.min || 'Volume must be greater than zero.';
        }
        if (field.field_key.includes('price')) {
          return messages.min || 'Price must be greater than zero.';
        }
      }
    }

    // Check minimum value for numbers
    // Check both validation_rules.min and field_config.min
    const minValue = rules?.min !== undefined && rules?.min !== null
      ? rules.min
      : field.field_config?.min !== undefined && field.field_config?.min !== null
        ? field.field_config.min
        : undefined;

    if (minValue !== undefined && !isNaN(numValue) && numValue < minValue) {
      // Special message for amount field with currency
      if (field.field_key === 'amount' && field.field_config?.currency) {
        const currency = field.field_config.unit || 'Rs';
        const maxValue = rules?.max !== undefined ? rules.max : field.field_config?.max || 40000;
        return (
          messages.min ||
          `Please enter a valid amount between ${currency}${minValue} and ${currency}${maxValue}.`
        );
      }
      return messages.min || `${field.label} must be at least ${minValue}`;
    }

    // Check maximum value for numbers
    // Check both validation_rules.max and field_config.max
    const maxValue = rules?.max !== undefined && rules?.max !== null
      ? rules.max
      : field.field_config?.max !== undefined && field.field_config?.max !== null
        ? field.field_config.max
        : undefined;

    if (maxValue !== undefined && !isNaN(numValue) && numValue > maxValue) {
      // Special message for amount field with currency
      if (field.field_key === 'amount' && field.field_config?.currency) {
        const currency = field.field_config.unit || 'Rs';
        // Use the computed minValue from above, or default to 500
        const minVal = minValue !== undefined ? minValue : 500;
        return (
          messages.max ||
          `Please enter a valid amount between ${currency}${minVal} and ${currency}${maxValue}.`
        );
      }
      return messages.max || `${field.label} must be at most ${maxValue}`;
    }

    // Check divisible_by for numbers (e.g., amount must be divisible by 500)
    if (rules?.divisible_by !== undefined && !isNaN(numValue)) {
      if (numValue % rules.divisible_by !== 0) {
        const currency = field.field_config?.unit || '';
        return (
          messages.divisible_by ||
          `${field.label} must be in increments of ${currency}${rules.divisible_by}`
        );
      }
    }

    // Check precision for decimal numbers
    // Only check precision if the value is actually a valid number
    if (rules?.precision !== undefined && !isNaN(numValue)) {
      const strValue = numValue.toString();
      const decimalIndex = strValue.indexOf('.');
      if (decimalIndex !== -1) {
        const decimalPlaces = strValue.length - decimalIndex - 1;
        if (decimalPlaces > rules.precision) {
          return (
            messages.precision ||
            `${field.label} must have at most ${rules.precision} decimal places`
          );
        }
      }
    }
  }

  // =====================
  // EXPECTED VOLUME VS COMMITTED VOLUME VALIDATION
  // =====================
  // Note: expected_volume validation against committed volume is now handled asynchronously
  // in the field change and blur handlers to support fetching from API
  // This synchronous function skips that validation

  // =====================
  // TEXT LENGTH VALIDATIONS
  // =====================
  if (typeof value === 'string' && value.length > 0) {
    // Check minimum length for text
    if (rules?.min_length && value.length < rules.min_length) {
      return (
        messages.min_length ||
        `${field.label} must be at least ${rules.min_length} characters`
      );
    }

    // Check maximum length for text (enforce max 500 chars for free text)
    const maxLength =
      rules?.max_length || (field.field_type === 'textarea' ? 500 : undefined);
    if (maxLength && value.length > maxLength) {
      return (
        messages.max_length ||
        `${field.label} must be at most ${maxLength} characters`
      );
    }

    // Safe threshold for long text (200-250 chars for titles/names)
    if (
      rules?.safe_length_threshold &&
      value.length > rules.safe_length_threshold
    ) {
      return (
        messages.safe_length_threshold ||
        `${field.label} is too long. Please keep it under ${rules.safe_length_threshold} characters.`
      );
    }
  }

  // Check pattern/regex
  // Override: residential_ghana_post_gps_number is a 5-digit postal code, not a Ghana GPS code
  const patternOverrides: Record<string, string> = {
    residential_ghana_post_gps_number: '^\\d{5}$',
  };
  const effectivePattern = patternOverrides[field.field_key] ?? rules?.pattern;
  if (effectivePattern && typeof value === 'string' && value.length > 0) {
    try {
      const regex = new RegExp(effectivePattern);
      if (!regex.test(value)) {
        return messages.pattern || `${field.label} format is invalid`;
      }
    } catch (e) {
      console.log('Invalid regex pattern:', rules.pattern);
    }
  }

  // Check allowed_values
  if (
    rules?.allowed_values &&
    value !== null &&
    value !== undefined &&
    value !== ''
  ) {
    const allowedValues = rules.allowed_values;
    if (Array.isArray(value)) {
      // For multiselect, check all values are allowed
      const invalidValues = value.filter(
        (v: any) => !allowedValues.includes(v),
      );
      if (invalidValues.length > 0) {
        return (
          messages.allowed_values ||
          `${field.label} contains invalid selection(s)`
        );
      }
    } else {
      // For single select/radio
      if (!allowedValues.includes(value)) {
        return messages.allowed_values || `${field.label} has an invalid value`;
      }
    }
  }

  // Check minimum selections for multiselect
  if (rules?.min_selections && Array.isArray(value)) {
    if (value.length < rules.min_selections) {
      return (
        messages.min_selections ||
        `Please select at least ${rules.min_selections} option(s)`
      );
    }
  }

  // Check max_date for date fields
  if (rules?.max_date && value) {
    const dateValue = new Date(value);
    let maxDate: Date;
    if (rules.max_date === 'today') {
      maxDate = new Date();
      maxDate.setHours(23, 59, 59, 999); // End of today
    } else {
      maxDate = new Date(rules.max_date);
    }
    if (dateValue > maxDate) {
      return messages.max_date || `${field.label} cannot be in the future`;
    }
  }

  // Check min_date for date fields
  if (rules?.min_date && value) {
    const dateValue = new Date(value);
    const minDate = new Date(rules.min_date);
    if (dateValue < minDate) {
      return (
        messages.min_date || `${field.label} must be after ${rules.min_date}`
      );
    }
  }

  return null;
};

// Dynamic field renderer
const DynamicField: React.FC<{
  field: ProductConfigurationField;
  value: any;
  onChange: (value: any) => void;
  onBlur?: (value: any) => void;
  onSubmit?: (value: any) => void;
  formValues: FormValues;
  error?: string | null;
  sectionApiEndpoints?: DocumentApiEndpoints | null;
  fsaSteps?: FSAStep[];
  onLinkFSA?: () => void;
  scrollToField?: (fieldRef: View | null) => void;
  fsaCompleted?: boolean;
  loanReturnParams?: { slug: string; submissionId?: string | null; initialStepIndex: number };
  paymentType?: string;
  harvestDetailIds?: string[];
}> = ({
  field,
  value,
  onChange,
  onBlur,
  onSubmit,
  formValues,
  error,
  sectionApiEndpoints,
  fsaSteps,
  onLinkFSA,
  scrollToField,
  fsaCompleted,
  loanReturnParams,
  paymentType,
  harvestDetailIds = [],
}) => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [apiOptions, setApiOptions] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [apiData, setApiData] = useState<any[]>([]);
  const [expandedFarms, setExpandedFarms] = useState<string[]>([]);
  const [gpsBackspace, setGpsBackspace] = useState(false);
  const [cropOptions, setCropOptions] = useState<Array<{value: string; label: string; image_url: string}>>([]);
  const [showAllCrops, setShowAllCrops] = useState(false);
  const [hasInputProviders, setHasInputProviders] = useState(true);
  const isDebugMode = useDebugStore(state => state.isDebugMode);

  const renderNoFarmState = () => (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        backgroundColor: '#F9F9F9',
        marginTop: 8,
      }}
    >
      <UITypography
        variant="medium"
        style={{ fontSize: 14, color: '#888888', textAlign: 'center', lineHeight: 22 }}
      >
        All your registered farms already have active loans. Please add a new farm to continue this application.
      </UITypography>
      <Pressable
        style={styles.addFarmRow}
        onPress={() => navigation.navigate('AddFarm')}
      >
        <View style={styles.addFarmCircle}>
          <UITypography variant="semiBold" style={{ color: '#FFFFFF', fontSize: 16 }}>
            +
          </UITypography>
        </View>
        <UITypography variant="medium" style={styles.addFarmText}>
          Add Farm
        </UITypography>
      </Pressable>
    </View>
  );

  // Debug Mode: auto-select the first farm or harvest once the API data arrives.
  useEffect(() => {
    if (
      isDebugMode &&
      (field.field_key === 'selected_farms' || field.field_key === 'selected_harvest') &&
      apiData.length > 0 &&
      !value
    ) {
      const identifier = field.external_api_config?.item_identifier || 'uuid';
      const firstId = apiData[0][identifier];
      if (firstId) {
        onChange(firstId);
        onSubmit?.(firstId);
      }
    }
  }, [isDebugMode, field.field_key, field.external_api_config, apiData, value, onChange, onSubmit]);

  // Fetch data from API if field has data_source: "external_api"
  useEffect(() => {
    let cancelled = false;

    const fetchFieldData = async () => {
      // Debug Mode: allow farms + harvest fetches so real options appear;
      // block everything else.
      if (
        isDebugMode &&
        field.field_key !== 'selected_farms' &&
        field.field_key !== 'selected_harvest'
      ) {
        return;
      }
      if (field.data_source !== 'external_api' || !field.external_api_config) {
        return;
      }

      // Note: For bank-credit flow, harvest details are filtered by selected_farms
      // (step 3). The cancelled flag in the cleanup ensures that if selected_farms
      // changes while a fetch is in-flight, the stale unfiltered response is
      // discarded. This prevents the Android race condition where PagerView mounts
      // all steps at once and the unfiltered response overwrites the filtered one.

      try {
        setLoadingOptions(true);

        const { endpoint, response_key, query_params } =
          field.external_api_config;
        // Use axiosPrivate for auth endpoints (e.g. /api/v1/auth/harvest_details)
        // and axiosFinancingPrivate for other endpoints
        const isAuthEndpoint = endpoint.startsWith('/api/v1/auth/');
        const axiosInstance = isAuthEndpoint ? axiosPrivate : axiosFinancingPrivate;
        const cleanEndpoint = isAuthEndpoint
          ? endpoint.replace(/^\/api\/v1\/auth/, '')
          : endpoint.replace(/^\/api\/v1/, '');

        console.log(`Fetching field data from: ${cleanEndpoint} (using ${isAuthEndpoint ? 'auth' : 'financing'} base URL)`);

        // Prepare query params
        const params: Record<string, any> = {};
        if (query_params) {
          Object.entries(query_params).forEach(([paramKey, paramValue]) => {
            // Map configuration values to actual data
            if (paramValue === 'submission_id' && (formValues?.submission_id || formValues?.productSubmissionId)) {
               // checking formValues first for submission_id
               params[paramKey] = formValues.submission_id || formValues.productSubmissionId;
            } else if (formValues && formValues[paramValue]) {
              params[paramKey] = formValues[paramValue];
            } else {
              // If not found in formValues, pass the raw value
              params[paramKey] = paramValue;
            }
          });
        }

        const response = await axiosInstance.get(cleanEndpoint, { params });

        // Ignore stale responses from superseded effect runs
        if (cancelled) return;

        const data = response_key
          ? response.data[response_key]
          : response.data?.data || response.data;

        console.log(`API Data for ${field.field_key}:`, data);

        let resultData = Array.isArray(data) ? data : [];

        // Flatten nested {id, type, attributes: {...}} structure to top level
        // so display_fields and filtering can access properties directly
        resultData = resultData.map((item: any) => {
          if (item.attributes && typeof item.attributes === 'object') {
            return { ...item, ...item.attributes };
          }
          return item;
        });

        // For farm selection, filter out farms that already have an active loan
        if (field.field_key === 'selected_farms') {
          resultData = resultData.filter((farm: any) => !farm.has_active_loan);
          console.log(`Filtered farms with active loans: ${resultData.length} available farms`);
        }

        // For harvest details (selected_harvest), filter by farms selected in step 3
        if (field.field_key === 'selected_harvest' && formValues.selected_farms) {
          const selectedFarmIds = Array.isArray(formValues.selected_farms)
            ? formValues.selected_farms
            : [formValues.selected_farms];
          
          if (selectedFarmIds.length > 0) {
            resultData = resultData.filter((harvest: any) => {
              const linkedFarms = harvest.linked_farms || harvest.farm_uuids;
              if (!linkedFarms) return false;
              
              // linked_farms can be an array of farm objects or UUIDs
              if (Array.isArray(linkedFarms)) {
                return linkedFarms.some((farm: any) => {
                  const farmId = typeof farm === 'string' ? farm : (farm.uuid || farm.id);
                  return selectedFarmIds.includes(farmId);
                });
              }
              return false;
            });
            console.log(`Filtered harvests by selected farms (${selectedFarmIds.length} farms):`, resultData.length, 'harvests');
          }
        }

        setApiData(resultData);
      } catch (error) {
        if (!cancelled) {
          console.log(`Error fetching data for ${field.field_key}:`, error);
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    };

    fetchFieldData();

    return () => {
      cancelled = true;
    };
  }, [field.field_key, field.data_source, field.external_api_config, formValues.selected_farms, isFocused]);

  useEffect(() => {
    const fetchInputProviders = async () => {
      if (isDebugMode) return; // Debug Mode: no API.
      if (field.field_key !== 'link_to_sale_agreement') {
        return;
      }

      try {
        const response = await axiosFinancingPrivate.get('/input_providers', {
          params: {
            country: COUNTRY,
          },
        });

        const providers = response.data?.data || [];
        const hasProviders = Array.isArray(providers) && providers.length > 0;
        setHasInputProviders(hasProviders);

        if (!hasProviders && value) {
          onChange(false);
          onSubmit?.(false);
        }
      } catch (fetchError) {
        console.log('Error fetching input providers:', fetchError);
        setHasInputProviders(false);

        if (value) {
          onChange(false);
          onSubmit?.(false);
        }
      }
    };

    fetchInputProviders();
  }, [field.field_key, isFocused, onChange, onSubmit, value]);

  // Fetch crop options from config_options API for produce selection fields
  useEffect(() => {
    const fetchCropOptions = async () => {
      if (isDebugMode) return; // Debug Mode: no API.
      // Only fetch for selected_produce field with icon_cards display format
      if (
        field.field_key !== 'selected_produce' ||
        field.field_config?.display_format !== 'icon_cards'
      ) {
        return;
      }

      try {
        setLoadingOptions(true);
        const response = await axiosPublic.get('/config_options?key=crop');
        const data = response.data?.data || [];

        // Map API response to options format with image_url
        const mappedCropOptions = Array.isArray(data)
          ? data
              .sort((a: any, b: any) => (a.attributes?.sort_order ?? 0) - (b.attributes?.sort_order ?? 0))
              .map((item: any) => ({
                value: item.attributes?.value?.toLowerCase() || '',
                label: item.attributes?.value || '',
                image_url: item.attributes?.image_url || '',
              }))
          : [];

        console.log('Crop options from API:', mappedCropOptions);
        setCropOptions(mappedCropOptions);
      } catch (error) {
        console.log('Error fetching crop options:', error);
        // Fallback to static options if API fails
        setCropOptions([]);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchCropOptions();
  }, [field.field_key, field.field_config?.display_format]);

  // Reset showAllCrops when crop options change
  useEffect(() => {
    if (field.field_key === 'selected_produce' && cropOptions.length > 0) {
      setShowAllCrops(false);
    }
  }, [cropOptions.length, field.field_key]);

  // Fetch options from API if options_source is "api"
  useEffect(() => {
    const fetchApiOptions = async () => {
      if (isDebugMode) return; // Debug Mode: no API.
      if (
        field.field_config?.options_source !== 'api' ||
        !field.field_config?.api_endpoint
      ) {
        return;
      }

      // Don't fetch API options for readonly/non-editable fields
      if (field.field_config?.editable === false) {
        return;
      }

      try {
        setLoadingOptions(true);

        const endpoint = field.field_config.api_endpoint;

        // Use axiosFinancingPrivate for all API endpoints by default
        // (countries, cooperatives, lenders, produce/grades, etc.)
        const axiosInstance = axiosFinancingPrivate;

        // Clean endpoint to remove /api/v1 prefix since it's in the base URL
        const cleanEndpoint = endpoint.replace(/^\/api\/v1/, '');

        console.log(`Fetching options from: ${cleanEndpoint}`);

        const response = await axiosInstance.get(cleanEndpoint);

        // Extract data - assume response.data.data contains array of options
        const data = response.data?.data || response.data || [];

        console.log(`API Options for ${field.field_key}:`, data);

        // Map API response to options format
        // Handle different API response structures (lenders, countries, cooperatives, etc.)
        const mappedOptions = Array.isArray(data)
          ? data.map((item: any) => ({
              label:
                item.lender_name ||
                item.name ||
                item.label ||
                item.title ||
                item.id,
              value: item.id || item.code || item.value,
            }))
          : [];

        setApiOptions(mappedOptions);
      } catch (error) {
        console.log(`Error fetching options for ${field.field_key}:`, error);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchApiOptions();
  }, [field.field_key, field.field_config]);

  const options = useMemo(() => {
    // Use crop options from API if available for selected_produce field
    if (field.field_key === 'selected_produce' && cropOptions.length > 0) {
      return cropOptions;
    }
    
    // Use API options if available, otherwise use static options
    if (apiOptions.length > 0) {
      return apiOptions;
    }

    return (field.options || [])
      .filter(opt => opt.is_active !== false)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map(opt => ({
        label: opt.option_label,
        value: opt.option_value,
        image_url: opt.icon || '', // Fallback to icon from static config if available
      }));
  }, [field.options, apiOptions, cropOptions, field.field_key]);

  // Refs for textarea fields (must be declared before switch to follow Rules of Hooks)
  const textareaContainerRef = useRef<View>(null);
  const textareaRef = useRef<any>(null);

  // State for tooltip fields (must be declared before switch to follow Rules of Hooks)
  const [tooltipIsOpen, setTooltipIsOpen] = useState(false);

  const renderLabel = () => {
    if (!field.label) return null;
    return (
      <UITypography
        variant="medium"
        style={styles.fieldLabel}
        requiredAsterisk={field.is_required}
        requiredAsteriskStyle={styles.requiredAsterisk}
      >
        {field.label}
      </UITypography>
    );
  };

  // Check conditional logic after all hooks have been called
  if (!shouldShowField(field, formValues)) {
    return null;
  }

  switch (field.field_type) {
    case 'text':
    case 'number':
      // Format display value based on field config
      let displayValue = value?.toString() || '';

      // Convert country code to country name
      if (field.field_config?.display_format === 'country_name' && value) {
        const countryMap: Record<string, string> = {
          PAK: 'Pakistani',
          PK: 'Pakistani',
          GHA: 'Ghanaian',
          GH: 'Ghanaian',
          NGA: 'Nigerian',
          NG: 'Nigerian',
          KEN: 'Kenyan',
          KE: 'Kenyan',
          UGA: 'Ugandan',
          UG: 'Ugandan',
          TZA: 'Tanzanian',
          TZ: 'Tanzanian',
        };
        displayValue = countryMap[value.toUpperCase()] || value;
      }

      // Format date for display
      if (field.field_key === 'date_of_birth' && value) {
        try {
          const date = new Date(value);
          // Check if date is valid before formatting
          if (!isNaN(date.getTime())) {
            const months = [
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ];
            displayValue = `${date.getDate()} ${
              months[date.getMonth()]
            } ${date.getFullYear()}`;
          } else {
            displayValue = '';
          }
        } catch (e) {
          displayValue = '';
        }
      }

      // Show "-" for empty values or invalid values in readonly fields (Personal Details)
      if (field.field_config?.editable === false) {
        // Replace empty, NA, N/A, null, undefined, or values containing NaN with "-"
        if (!displayValue || displayValue === 'NA' || displayValue === 'N/A' || 
            displayValue === 'null' || displayValue === 'undefined' || 
            displayValue.includes('NaN')) {
          displayValue = '-';
        }
      }

      // Generate placeholder for Name and Position fields if not provided
      let placeholder = field.placeholder;
      if (!placeholder) {
        if (field.field_key.includes('name') && !field.field_key.includes('ghana_card')) {
          placeholder = 'Enter name';
        } else if (field.field_key.includes('position')) {
          placeholder = 'Enter position';
        }
      }

      return (
        <View style={styles.fieldContainer}>
          <UITextInput
            label={field.label}
            labelStyle={{ fontSize: 14, fontWeight: '500', color: '#404040', marginTop: 0, marginBottom: 8 }}
            requiredLabel={field.is_required}
            placeholder={placeholder || ''}
            value={displayValue}
            addonBefore={(field.field_key === 'expected_selling_price_per_unit' || field.field_key === 'outstanding_amount') ? (
              <Text style={{ fontSize: 16, color: '#404040', fontWeight: '500' }}>Rs</Text>
            ) : undefined}
            addonBeforeProps={(field.field_key === 'expected_selling_price_per_unit' || field.field_key === 'outstanding_amount') ? {
              showDivider: false,
              containerStyle: { marginRight: 8, width: 'auto', paddingRight: 0 }
            } : undefined}
            onChangeText={(text) => {
              // Apply GPS masking for GPS fields (excluding residential postal code)
              if (field.field_key !== 'residential_ghana_post_gps_number' && field.field_key.includes('ghana_post_gps')) {
                if (gpsBackspace) {
                  setGpsBackspace(false);
                  onChange(text.toUpperCase());
                  return;
                }
                const formatted = formatGpsInput(text, validDistrictCodes);
                onChange(formatted);
              } else if (field.field_type === 'number') {
                // Sanitize numeric input to only allow digits, decimal point, and optional minus sign
                const sanitized = sanitizeNumericInput(text);
                onChange(sanitized);
              } else {
                // Apply sanitization for Name/Position fields during typing
                // This prevents invalid characters from ever entering the state
                if (field.field_type === 'text' && isNameOrPositionField(field.field_key)) {
                  const sanitized = sanitizeRestrictedTextInput(text, false); // false = don't trim while typing
                  onChange(sanitized);
                } else if (field.field_type === 'text') {
                  const sanitized = sanitizeTextInput(text, false); // false = don't trim while typing
                  onChange(sanitized);
                } else {
                  onChange(text);
                }
              }
            }}
            onKeyPress={({ nativeEvent }) => {
              if (field.field_key !== 'residential_ghana_post_gps_number' && field.field_key.includes('ghana_post_gps') && nativeEvent.key === 'Backspace') {
                setGpsBackspace(true);
              }
            }}
            onBlur={() => onBlur?.(value)}
            keyboardType={field.field_type === 'number' ? 'numeric' : 'default'}
            editable={field.field_config?.editable !== false}
            error={!!error}
            helperText={error || field.helper_text || ''}
            autoCapitalize={(field.field_key !== 'residential_ghana_post_gps_number' && field.field_key.includes('ghana_post_gps')) ? 'characters' : 'none'}
          />
        </View>
      );

    case 'textarea':
      // Handle focus to ensure proper scrolling for conditionally rendered fields
      // For fields that appear conditionally (like description when "others" is selected),
      // we need to ensure KeyboardAwareScrollView has time to measure the field
      const handleTextareaFocus = () => {
        // Use the scrollToField callback from parent to manually scroll to the field
        // This ensures consistent scrolling behavior on every focus, not just the first time
        if (scrollToField && textareaContainerRef.current) {
          scrollToField(textareaContainerRef.current);
        } else {
          // Fallback: use delay and measurement if callback is not available
          setTimeout(() => {
            if (textareaContainerRef.current) {
              textareaContainerRef.current.measureInWindow?.((x: number, y: number, width: number, height: number) => {
                // This measurement helps KeyboardAwareScrollView know where the field is
              });
            }
          }, 300);
        }
      };

      return (
        <View ref={textareaContainerRef} style={styles.fieldContainer}>
          {renderLabel()}
          <UITextInput
            ref={textareaRef}
            boxed
            placeholder={field.placeholder || ''}
            value={value || ''}
            onChangeText={(text) => {
              const sanitized = sanitizeRestrictedTextInput(text, false);
              onChange(sanitized);
            }}
            onFocus={handleTextareaFocus}
            onBlur={() => onBlur?.(value)}
            numberOfLines={field.field_config?.rows || 4}
            wrapperStyle={styles.textareaBox}
            inputStyle={styles.textareaText}
            multiline
            error={!!error}
            helperText={error || ''}
          />
        </View>
      );

    case 'date':
      // If date_picker is explicitly disabled, render as readonly text
      if (
        field.field_config?.date_picker === false ||
        field.field_config?.editable === false
      ) {
        // Format date for display
        let dateDisplayValue = value || '';
        if (value) {
          try {
            const date = new Date(value);
            // Check if date is valid before formatting
            if (!isNaN(date.getTime())) {
              const months = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ];
              dateDisplayValue = `${date.getDate()} ${
                months[date.getMonth()]
              } ${date.getFullYear()}`;
            } else {
              dateDisplayValue = '';
            }
          } catch (e) {
            dateDisplayValue = '';
          }
        }

        // Show "-" for empty values or invalid values in readonly date fields (Personal Details)
        if (!dateDisplayValue || dateDisplayValue === 'NA' || dateDisplayValue === 'N/A' || 
            dateDisplayValue === 'null' || dateDisplayValue === 'undefined' || 
            dateDisplayValue.includes('NaN')) {
          dateDisplayValue = '-';
        }

        return (
          <View style={styles.fieldContainer}>
            <UITextInput
              label={field.label}
              requiredLabel={field.is_required}
              placeholder={field.placeholder || ''}
              value={dateDisplayValue}
              onChangeText={onChange}
              editable={false}
            />
            {error && (
              <UITypography
                variant="regular"
                style={[styles.infoHint, { color: '#E53935' }]}
              >
                {error}
              </UITypography>
            )}
            {!error && field.helper_text && (
              <UITypography variant="regular" style={styles.infoHint}>
                {field.helper_text}
              </UITypography>
            )}
          </View>
        );
      }

      // Otherwise, render with date picker
      const todayISO = useMemo(() => {
        const date = new Date();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${date.getFullYear()}-${month}-${day}`;
      }, []);

      return (
        <View style={styles.fieldContainer}>
          {renderLabel()}
          <UITextInput
            placeholder={field.placeholder || 'DD Month YYYY'}
            value={value || ''}
            editable={false}
            pickerAddonProps={{
              type: 'calendar',
              selectedValue: value,
              onValueChange: onChange,
              maxDate:
                field.field_config?.max_date === 'today' ? todayISO : undefined,
              selectionMode: 'single',
              placeholder: field.placeholder || 'Select date',
            }}
          />
          {<View style={styles.divider} />}
        </View>
      );

    case 'select':
      if (
        field.field_config?.display_format === 'accordion' &&
        apiData.length === 0 &&
        !loadingOptions &&
        field.field_key === 'selected_farms'
      ) {
        return (
          <View style={styles.fieldContainer}>
            {renderLabel()}
            {field.helper_text && (
              <UITypography variant="regular" style={styles.infoHint}>
                {field.helper_text}
              </UITypography>
            )}
            {renderNoFarmState()}
          </View>
        );
      }

      // Empty state for harvest selection when no records are linked to selected farm(s)
      if (
        field.field_config?.display_format === 'accordion' &&
        apiData.length === 0 &&
        !loadingOptions &&
        field.field_key === 'selected_harvest'
      ) {
        return (
          <View style={styles.fieldContainer}>
            {renderLabel()}
            {field.helper_text && (
              <UITypography variant="regular" style={styles.infoHint}>
                {field.helper_text}
              </UITypography>
            )}
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 32,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                borderRadius: 10,
                backgroundColor: '#F9F9F9',
                marginTop: 8,
              }}
            >
              <UITypography
                variant="medium"
                style={{ fontSize: 14, color: '#888888', textAlign: 'center', lineHeight: 22 }}
              >
                No harvest details found linked to the selected farm(s).
              </UITypography>
              <Pressable
                style={{
                  marginTop: 16,
                  paddingVertical: 10,
                  paddingHorizontal: 24,
                  backgroundColor: '#1D3A70',
                  borderRadius: 8,
                }}
                onPress={() => {
                  const selectedFarmIds = Array.isArray(formValues.selected_farms)
                    ? formValues.selected_farms
                    : formValues.selected_farms
                      ? [formValues.selected_farms]
                      : [];
                  navigation.navigate('Profile', {
                    screen: 'HarvestDetails',
                    params: {
                      preSelectedFarmUuids: selectedFarmIds,
                      returnToTab: 'Home',
                      returnToScreen: 'DynamicLoanApplication',
                      returnToParams: loanReturnParams
                        ? {
                            slug: loanReturnParams.slug,
                            submissionId: loanReturnParams.submissionId,
                            initialStepIndex: loanReturnParams.initialStepIndex,
                          }
                        : undefined,
                    },
                  });
                }}
              >
                <UITypography
                  variant="semiBold"
                  style={{ fontSize: 14, color: '#FFFFFF', textAlign: 'center' }}
                >
                  Add Harvest Detail
                </UITypography>
              </Pressable>
            </View>
          </View>
        );
      }

      // Special handling for nationality field when editable is false
      if (
        field.field_key === 'nationality' &&
        field.field_config?.editable === false
      ) {
        // Display country name from value (don't fetch API)
        let countryDisplay = value || '';
        if (value) {
          // Map common country codes to names
          const countryMap: Record<string, string> = {
            PAK: 'Pakistani',
            PK: 'Pakistani',
            Pakistan: 'Pakistani',
            GHA: 'Ghanaian',
            GH: 'Ghanaian',
            Ghana: 'Ghanaian',
            NGA: 'Nigerian',
            NG: 'Nigerian',
            Nigeria: 'Nigerian',
            KEN: 'Kenyan',
            KE: 'Kenyan',
            Kenya: 'Kenyan',
            UGA: 'Ugandan',
            UG: 'Ugandan',
            Uganda: 'Ugandan',
            TZA: 'Tanzanian',
            TZ: 'Tanzanian',
            Tanzania: 'Tanzanian',
          };
          countryDisplay = countryMap[value] || value;
        }

        // Show "-" for empty values or invalid values in readonly nationality field (Personal Details)
        if (!countryDisplay || countryDisplay === 'NA' || countryDisplay === 'N/A' || 
            countryDisplay === 'null' || countryDisplay === 'undefined' || 
            countryDisplay.includes('NaN')) {
          countryDisplay = '-';
        }

        return (
          <View style={styles.fieldContainer}>
            <UITextInput
              label={field.label}
              requiredLabel={field.is_required}
              placeholder={field.placeholder || ''}
              value={countryDisplay}
              onChangeText={onChange}
              editable={false}
            />
            {error && (
              <UITypography
                variant="regular"
                style={[styles.infoHint, { color: '#E53935' }]}
              >
                {error}
              </UITypography>
            )}
            {!error && field.helper_text && (
              <UITypography variant="regular" style={styles.infoHint}>
                {field.helper_text}
              </UITypography>
            )}
          </View>
        );
      }

      // General handling for other select fields when editable is false (e.g., gender)
      if (field.field_config?.editable === false) {
        let displayVal = value || '';
        
        // Show "-" for empty values or invalid values
        if (!displayVal || displayVal === 'NA' || displayVal === 'N/A' || 
            displayVal === 'null' || displayVal === 'undefined' || 
            displayVal.includes('NaN')) {
          displayVal = '-';
        }

        return (
          <View style={styles.fieldContainer}>
            <UITextInput
              label={field.label}
              requiredLabel={field.is_required}
              placeholder={field.placeholder || ''}
              value={displayVal}
              onChangeText={onChange}
              editable={false}
            />
            {error && (
              <UITypography
                variant="regular"
                style={[styles.infoHint, { color: '#E53935' }]}
              >
                {error}
              </UITypography>
            )}
            {!error && field.helper_text && (
              <UITypography variant="regular" style={styles.infoHint}>
                {field.helper_text}
              </UITypography>
            )}
          </View>
        );
      }

      // Special handling for facility_type field
      if (field.field_key === 'facility_type' && value) {
        const facilityDisplay = getFacilityTypeDisplay(field, value);
        return (
          <View style={styles.fieldContainer}>
            <View style={styles.facilityRow}>
              <Image
                source={facilityDisplay.image}
                style={styles.facilityImg}
              />
              <View style={styles.facilityTextContainer}>
                <UITypography variant="medium" style={styles.facilityLabel}>
                  {field.label}
                </UITypography>
                <UITypography variant="semiBold" style={styles.facilityType} numberOfLines={2}>
                  {facilityDisplay.label}
                </UITypography>
                <Pressable
                  onPress={() => {
                    // Navigate to main farmer screen to choose facility type
                    navigation.navigate('Main');
                  }}
                >
                  <UITypography variant="semiBold" style={styles.changeLink}>
                    Change
                  </UITypography>
                </Pressable>
              </View>
            </View>
          </View>
        );
      }

      // Accordion layout for single-select farm/harvest fields with external API data
      if (
        field.field_config?.display_format === 'accordion' &&
        apiData.length > 0
      ) {
        const isMultiple = field.field_config?.multiple !== false;
        const selectedValues: string[] = isMultiple
          ? Array.isArray(value) ? value : (value ? [value] : [])
          : value ? [value] : [];
        const { item_identifier, item_display, display_fields } =
          field.external_api_config || {};

        const toggleFarmExpansion = (farmId: string, e: any) => {
          e.stopPropagation();
          setExpandedFarms(prev =>
            prev.includes(farmId)
              ? prev.filter(id => id !== farmId)
              : [...prev, farmId],
          );
        };

        return (
          <View style={styles.fieldContainer}>
            {renderLabel()}
            {field.helper_text && (
              <UITypography variant="regular" style={styles.infoHint}>
                {field.helper_text}
              </UITypography>
            )}
            <View style={styles.farmList}>
              {apiData.map((farm: any) => {
                const farmId = item_identifier
                  ? farm[item_identifier]
                  : farm.id || farm.uuid;
                const farmDisplay = item_display
                  ? (farm[item_display] || farm.address || farm.name)
                  : (farm.name || farm.address);
                const isSelected = selectedValues.includes(farmId);
                const isExpanded = expandedFarms.includes(farmId);
                const harvestHasActiveLoan =
                  Array.isArray(farm.linked_farms) &&
                  farm.linked_farms.some((lf: any) => lf.has_active_loan === true);

                // Determine if this harvest crop should be disabled based on payment method
                const isHarvestDisabled = field.field_key === 'selected_harvest' && paymentType
                  ? paymentType === 'transaction_program'
                    ? harvestDetailIds.length > 0 && !harvestDetailIds.includes(farmId)
                    : paymentType === 'provider_credit'
                      ? harvestHasActiveLoan
                      : harvestHasActiveLoan
                  : harvestHasActiveLoan;

                const disabledReason = field.field_key === 'selected_harvest' && paymentType === 'transaction_program' && isHarvestDisabled
                  ? 'not_linked_to_program'
                  : harvestHasActiveLoan ? 'active_loan' : null;

                return (
                  <View
                    key={farmId}
                    style={[
                      styles.farmCard,
                      isSelected && styles.farmCardSelected,
                      isHarvestDisabled && haStyles.disabledCard,
                    ]}
                  >
                    <Pressable
                      style={styles.farmHeader}
                      onPress={() => {
                        if (isHarvestDisabled) return;
                        let newValue: any;
                        if (isMultiple) {
                          newValue = isSelected
                            ? selectedValues.filter(id => id !== farmId)
                            : [...selectedValues, farmId];
                        } else {
                          newValue = isSelected ? null : farmId;
                        }
                        onChange(newValue);
                        onSubmit?.(newValue);
                      }}
                    >
                      <View style={[styles.farmCheckbox, isHarvestDisabled && haStyles.disabledCheckbox]}>
                        {isSelected && (
                          <View style={styles.farmCheckboxInner} />
                        )}
                      </View>
                      <UITypography variant="semiBold" style={[styles.farmTitle, isHarvestDisabled && haStyles.disabledText]}>
                        {farmDisplay}
                      </UITypography>
                      {display_fields && (
                        <Pressable
                          onPress={e => toggleFarmExpansion(farmId, e)}
                          style={styles.farmExpandButton}
                        >
                          <View style={[styles.farmExpandIcon, isExpanded && { transform: [{ rotate: '180deg' }] }]}>
                            <ArrowDownIcon />
                          </View>
                        </Pressable>
                      )}
                    </Pressable>

                    {display_fields && isExpanded && (
                      <View style={[styles.farmDetails, { marginTop: 16, paddingTop: 8 }]}>
                        {Object.entries(display_fields).map(([label, dataKey]: [string, any]) => {
                          if (dataKey === 'farm_size_unit') return null;
                          const isFarmSize = dataKey === 'farm_size';
                          const rawVal = isFarmSize
                            ? [farm.farm_size, farm.farm_size_unit].filter(x => x != null && x !== '').join(' ') || farm[dataKey]
                            : farm[dataKey];
                          if (rawVal === null || rawVal === undefined || rawVal === '') return null;
                          const displayVal = formatDisplayValue(rawVal);
                          const labelOverrides: Record<string, string> = {
                            ghana_post_gps: 'Postal Code',
                            ghana_post_gps_number: 'Postal Code',
                          };
                          const displayLabel = labelOverrides[label] ?? label
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, c => c.toUpperCase());
                          return (
                            <UITextInput
                              key={label}
                              label={displayLabel}
                              labelStyle={haStyles.inputLabel}
                              value={displayVal}
                              editable={false}
                              error={false}
                              helperText=""
                            />
                          );
                        })}
                        {isHarvestDisabled && (
                          <View style={haStyles.loanBanner}>
                            <WarningTriangleIcon size={20} color="#F32735" />
                            <View style={haStyles.loanBannerTextWrap}>
                              <UITypography variant="semiBold" style={haStyles.loanBannerTitle}>
                                {disabledReason === 'not_linked_to_program'
                                  ? 'Not linked to selected program'
                                  : 'Active Loan linked to the harvest'}
                              </UITypography>
                              <UITypography variant="regular" style={haStyles.loanBannerSubtitle}>
                                {disabledReason === 'not_linked_to_program'
                                  ? 'This harvest is not linked to the selected transaction program'
                                  : 'You cannot select harvest details linked to an active loan'}
                              </UITypography>
                            </View>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );
      }

      // Default select rendering
      // Enable clearing for lender, borrowing_facility_type, and outstanding_currency fields
      const allowClear =
        field.field_key === 'lender' ||
        field.field_key === 'borrowing_facility_type' ||
        field.field_key === 'outstanding_currency';

      return (
        <View style={styles.fieldContainer}>
          <UIPicker
            label={field.label}
            labelStyles={styles.fieldLabel}
            requiredLabel={field.is_required}
            options={options}
            selectedValue={value}
            onValueChange={(val) => {
              onChange(val);
              onSubmit?.(val);
            }}
            placeholder={field.placeholder || 'Select'}
            inline={field.field_config?.inline}
            optional={allowClear}
            error={!!error}
            helperText={error || ''}
          />
          {/* !field.field_config?.inline && <View style={styles.pickerDivider} />} */}
          {!error && field.helper_text && (
            <UITypography variant="regular" style={styles.infoHint}>
              {field.helper_text}
            </UITypography>
          )}
        </View>
      );

    case 'multiselect':
      if (
        field.field_config?.display_format === 'accordion' &&
        apiData.length === 0 &&
        !loadingOptions &&
        field.field_key === 'selected_farms'
      ) {
        return (
          <View style={styles.fieldContainer}>
            {renderLabel()}
            {field.helper_text && (
              <UITypography variant="regular" style={styles.infoHint}>
                {field.helper_text}
              </UITypography>
            )}
            {renderNoFarmState()}
          </View>
        );
      }

      // Accordion layout – empty state for harvest when no records linked to selected farm(s)
      if (
        field.field_config?.display_format === 'accordion' &&
        apiData.length === 0 &&
        !loadingOptions &&
        field.field_key === 'selected_harvest'
      ) {
        return (
          <View style={styles.fieldContainer}>
            {renderLabel()}
            {field.helper_text && (
              <UITypography variant="regular" style={styles.infoHint}>
                {field.helper_text}
              </UITypography>
            )}
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 32,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                borderRadius: 10,
                backgroundColor: '#F9F9F9',
                marginTop: 8,
              }}
            >
              <UITypography
                variant="medium"
                style={{ fontSize: 14, color: '#888888', textAlign: 'center', lineHeight: 22 }}
              >
                No harvest details found linked to the selected farm(s).
              </UITypography>
              <Pressable
                style={{
                  marginTop: 16,
                  paddingVertical: 10,
                  paddingHorizontal: 24,
                  backgroundColor: '#1D3A70',
                  borderRadius: 8,
                }}
                onPress={() => {
                  const selectedFarmIds = Array.isArray(formValues.selected_farms)
                    ? formValues.selected_farms
                    : formValues.selected_farms
                      ? [formValues.selected_farms]
                      : [];
                  navigation.navigate('Profile', {
                    screen: 'HarvestDetails',
                    params: {
                      preSelectedFarmUuids: selectedFarmIds,
                      returnToTab: 'Home',
                      returnToScreen: 'DynamicLoanApplication',
                      returnToParams: loanReturnParams
                        ? {
                            slug: loanReturnParams.slug,
                            submissionId: loanReturnParams.submissionId,
                            initialStepIndex: loanReturnParams.initialStepIndex,
                          }
                        : undefined,
                    },
                  });
                }}
              >
                <UITypography
                  variant="semiBold"
                  style={{ fontSize: 14, color: '#FFFFFF', textAlign: 'center' }}
                >
                  Add Harvest Detail
                </UITypography>
              </Pressable>
            </View>
          </View>
        );
      }

      // Accordion layout for farm selection with API data
      if (
        field.field_config?.display_format === 'accordion' &&
        apiData.length > 0
      ) {
        const isMultiple = field.field_config?.multiple !== false;
        const selectedValues: string[] = isMultiple
          ? Array.isArray(value) ? value : (value ? [value] : [])
          : value ? [value] : [];
        const { item_identifier, item_display, display_fields } =
          field.external_api_config || {};

        const toggleFarmExpansion = (farmId: string, e: any) => {
          e.stopPropagation();
          setExpandedFarms(prev =>
            prev.includes(farmId)
              ? prev.filter(id => id !== farmId)
              : [...prev, farmId],
          );
        };

        return (
          <View style={styles.fieldContainer}>
            {renderLabel()}
            {field.helper_text && (
              <UITypography variant="regular" style={styles.infoHint}>
                {field.helper_text}
              </UITypography>
            )}
            <View style={styles.farmList}>
              {apiData.map((farm: any) => {
                const farmId = item_identifier
                  ? farm[item_identifier]
                  : farm.id || farm.uuid;
                const farmDisplay = item_display
                  ? (farm[item_display] || farm.address || farm.name)
                  : (farm.name || farm.address);
                const isSelected = selectedValues.includes(farmId);
                const isExpanded = expandedFarms.includes(farmId);
                const harvestHasActiveLoan =
                  Array.isArray(farm.linked_farms) &&
                  farm.linked_farms.some((lf: any) => lf.has_active_loan === true);

                // Determine if this harvest crop should be disabled based on payment method
                const isHarvestDisabled = field.field_key === 'selected_harvest' && paymentType
                  ? paymentType === 'transaction_program'
                    ? harvestDetailIds.length > 0 && !harvestDetailIds.includes(farmId)
                    : paymentType === 'provider_credit'
                      ? harvestHasActiveLoan
                      : harvestHasActiveLoan
                  : harvestHasActiveLoan;

                const disabledReason = field.field_key === 'selected_harvest' && paymentType === 'transaction_program' && isHarvestDisabled
                  ? 'not_linked_to_program'
                  : harvestHasActiveLoan ? 'active_loan' : null;

                return (
                  <View
                    key={farmId}
                    style={[
                      styles.farmCard,
                      isSelected && styles.farmCardSelected,
                      isHarvestDisabled && haStyles.disabledCard,
                    ]}
                  >
                    <Pressable
                      style={styles.farmHeader}
                      onPress={() => {
                        if (isHarvestDisabled) return;
                        let newValue: any;
                        if (isMultiple) {
                          newValue = isSelected
                            ? selectedValues.filter(id => id !== farmId)
                            : [...selectedValues, farmId];
                        } else {
                          newValue = isSelected ? null : farmId;
                        }
                        onChange(newValue);
                        onSubmit?.(newValue);
                      }}
                    >
                      <View style={[styles.farmCheckbox, isHarvestDisabled && haStyles.disabledCheckbox]}>
                        {isSelected && (
                          <View style={styles.farmCheckboxInner} />
                        )}
                      </View>
                      <UITypography variant="semiBold" style={[styles.farmTitle, isHarvestDisabled && haStyles.disabledText]}>
                        {farmDisplay}
                      </UITypography>
                      {display_fields && (
                        <Pressable
                          onPress={e => toggleFarmExpansion(farmId, e)}
                          style={styles.farmExpandButton}
                        >
                          <View style={[styles.farmExpandIcon, isExpanded && { transform: [{ rotate: '180deg' }] }]}>
                            <ArrowDownIcon />
                          </View>
                        </Pressable>
                      )}
                    </Pressable>

                    {display_fields && isExpanded && (
                      <View style={[styles.farmDetails, { marginTop: 16, paddingTop: 8 }]}>
                        {field.field_key === 'selected_harvest' ? (
                          <>
                            {/* Select Produce - green tile */}
                            {farm.selected_produce && (
                              <View style={haStyles.fieldContainer}>
                                <UITypography variant="medium" style={haStyles.fieldLabel}>
                                  Select Produce
                                </UITypography>
                                <View style={haStyles.grid}>
                                  <View style={[haStyles.produceTile, haStyles.produceTileSelected]}>
                                    <UITypography variant="medium" style={haStyles.produceLabel}>
                                      {String(farm.selected_produce).charAt(0).toUpperCase() + String(farm.selected_produce).slice(1)}
                                    </UITypography>
                                  </View>
                                </View>
                              </View>
                            )}

                            {/* Expected Volume + Units inline */}
                            {(farm.expected_volume !== null && farm.expected_volume !== undefined) && (
                              <View style={haStyles.fieldContainer}>
                                <View style={haStyles.inlineRow}>
                                  <View style={haStyles.inlineLeft}>
                                    <UITextInput
                                      label="Expected Volume"
                                      labelStyle={haStyles.inputLabel}
                                      value={String(farm.expected_volume)}
                                      editable={false}
                                      keyboardType="numeric"
                                      error={false}
                                      helperText=""
                                    />
                                  </View>
                                  <View style={haStyles.inlineRight}>
                                    <UITextInput
                                      label="Units"
                                      labelStyle={haStyles.inputLabel}
                                      value={farm.expected_volume_unit || '—'}
                                      editable={false}
                                      error={false}
                                      helperText=""
                                    />
                                  </View>
                                </View>
                              </View>
                            )}

                            {/* Expected Selling Price per Unit */}
                            {(farm.expected_selling_price_per_unit !== null && farm.expected_selling_price_per_unit !== undefined) && (
                              <View style={haStyles.fieldContainer}>
                                <UITextInput
                                  label="Expected Selling Price per Unit"
                                  labelStyle={haStyles.inputLabel}
                                  value={String(farm.expected_selling_price_per_unit)}
                                  addonBefore={
                                    <Text style={{ fontSize: 16, color: '#404040', fontWeight: '500' }}>Rs</Text>
                                  }
                                  addonBeforeProps={{
                                    showDivider: false,
                                    containerStyle: { marginRight: 8, width: 'auto', paddingRight: 0 },
                                  }}
                                  editable={false}
                                  keyboardType="numeric"
                                  error={false}
                                  helperText=""
                                />
                              </View>
                            )}

                            {/* Link to farm - toggle switches (read-only) */}
                            {farm.linked_farms && Array.isArray(farm.linked_farms) && farm.linked_farms.length > 0 && (
                              <View style={haStyles.fieldContainer}>
                                <UITypography variant="medium" style={haStyles.fieldLabel}>
                                  Link to farm
                                </UITypography>
                                {farm.linked_farms.map((linkedFarm: any, idx: number) => {
                                  const farmLabel = (() => {
                                    if (typeof linkedFarm === 'string') return linkedFarm;
                                    const candidates = [
                                      linkedFarm.ghana_post_gps_number,
                                      linkedFarm.ghana_post_gps,
                                      linkedFarm.location,
                                      linkedFarm.name,
                                      linkedFarm.uuid,
                                    ];
                                    const prim = candidates.find((c: any) => c != null && typeof c !== 'object');
                                    return prim != null ? String(prim).trim() : '—';
                                  })();
                                  return (
                                    <View key={idx} style={haStyles.farmRow}>
                                      <UITypography variant="medium" style={haStyles.farmLabel}>
                                        {String(farmLabel)}
                                      </UITypography>
                                      <UIToggleSwitch
                                        value={true}
                                        onToggle={() => {}}
                                        labelLeft="Yes"
                                        labelRight="No"
                                      />
                                    </View>
                                  );
                                })}
                              </View>
                            )}

                            {/* Disabled banner */}
                            {isHarvestDisabled && (
                              <View style={haStyles.loanBanner}>
                                <WarningTriangleIcon size={20} color="#F32735" />
                                <View style={haStyles.loanBannerTextWrap}>
                                  <UITypography variant="semiBold" style={haStyles.loanBannerTitle}>
                                    {disabledReason === 'not_linked_to_program'
                                      ? 'Not linked to selected program'
                                      : 'Active Loan linked to the harvest'}
                                  </UITypography>
                                  <UITypography variant="regular" style={haStyles.loanBannerSubtitle}>
                                    {disabledReason === 'not_linked_to_program'
                                      ? 'This harvest is not linked to the selected transaction program'
                                      : 'You cannot select harvest details linked to an active loan'}
                                  </UITypography>
                                </View>
                              </View>
                            )}
                          </>
                        ) : (
                          /* Generic display_fields key-value rows for all other accordions (e.g. farms) */
                          Object.entries(display_fields).map(([label, dataKey]: [string, any], idx, arr) => {
                            // Combine farm_size + farm_size_unit into one row and hide farm_size_unit
                            if (dataKey === 'farm_size_unit') return null;
                            const isFarmSize = dataKey === 'farm_size';
                            const rawVal = isFarmSize
                              ? [farm.farm_size, farm.farm_size_unit].filter(x => x != null && x !== '').join(' ') || farm[dataKey]
                              : farm[dataKey];
                            if (rawVal === null || rawVal === undefined || rawVal === '') return null;
                            const displayVal = formatDisplayValue(rawVal);
                            const labelOverrides: Record<string, string> = {
                              ghana_post_gps: 'Postal Code',
                              ghana_post_gps_number: 'Postal Code',
                            };
                            const displayLabel = labelOverrides[label] ?? label
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, c => c.toUpperCase());
                            const isLast = idx === arr.length - 1;
                            return (
                              <UITextInput
                                key={label}
                                label={displayLabel}
                                labelStyle={haStyles.inputLabel}
                                value={displayVal}
                                editable={false}
                                error={false}
                                helperText=""
                              />
                            );
                          })
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );
      }

      // Grid layout for produce selection
      if (field.field_config?.layout === 'grid') {
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <View style={styles.fieldContainer}>
            {renderLabel()}
            <View style={styles.grid}>
              {options.map(opt => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.produceTile,
                      isSelected && styles.produceTileSelected,
                    ]}
                    onPress={() => {
                      let newValue;
                      if (isSelected) {
                        newValue = selectedValues.filter((v: string) => v !== opt.value);
                      } else {
                        newValue = [...selectedValues, opt.value];
                      }
                      onChange(newValue);
                      onSubmit?.(newValue);
                    }}
                  >
                    <View style={styles.produceCircle}>
                      {/* Placeholder for produce image */}
                      <UITypography variant="medium" style={{ fontSize: 20 }}>
                        {opt.label.charAt(0)}
                      </UITypography>
                    </View>
                    <UITypography variant="medium" style={styles.produceLabel}>
                      {opt.label}
                    </UITypography>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      }
      // Default multiselect with checkboxes
      return (
        <View style={styles.fieldContainer}>
          {renderLabel()}
          <View style={styles.checkboxList}>
            {options.map(opt => (
              <UICheckboxCard
                key={opt.value}
                label={opt.label}
                style={styles.checkboxCard}
                checked={Array.isArray(value) && value.includes(opt.value)}
                onPress={() => {
                  const currentValues = Array.isArray(value) ? value : [];
                  let newValue;
                  if (currentValues.includes(opt.value)) {
                    newValue = currentValues.filter((v: string) => v !== opt.value);
                  } else {
                    newValue = [...currentValues, opt.value];
                  }
                  onChange(newValue);
                  onSubmit?.(newValue);
                }}
              />
            ))}
          </View>
        </View>
      );

    case 'radio':
      const isHorizontal = field.field_config?.layout === 'horizontal';
      const isGridLayout = field.field_config?.layout === 'grid';
      const hasIconCards = field.field_config?.display_format === 'icon_cards';
      const isResidentOwnershipField = field.field_key === 'resident_ownership';

      // Grid layout with icon cards (for produce selection)
      if (isGridLayout && hasIconCards) {
        const MAX_INITIAL_CROPS = 10;
        const hasMoreCrops = options.length > MAX_INITIAL_CROPS;
        const displayedOptions = showAllCrops ? options : options.slice(0, MAX_INITIAL_CROPS);
        
        return (
          <View style={styles.fieldContainer}>
            {renderLabel()}
            <View style={styles.grid}>
              {displayedOptions.map(opt => {
                const produceAsset = PRODUCE_ASSETS[opt.value];
                const isSelected = value === opt.value;
                // Use image_url from API if available, otherwise fallback to static assets
                const hasApiImage = opt.image_url && opt.image_url.length > 0;

                return (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.produceTile,
                      isSelected && styles.produceTileSelected,
                      { justifyContent: 'center', alignItems: 'center' }
                    ]}
                    onPress={() => {
                      onChange(opt.value);
                      onSubmit?.(opt.value);
                    }}
                  >
                    {/* <View style={styles.produceCircle}>
                      {hasApiImage ? (
                        <Image
                          source={{ uri: opt.image_url }}
                          style={{ width: 40, height: 40, borderRadius: 20 }}
                          resizeMode="cover"
                        />
                      ) : produceAsset ? (
                        <Image
                          source={produceAsset.src}
                          style={[
                            { width: 40, height: 40 },
                            produceAsset.style,
                          ]}
                          resizeMode="contain"
                        />
                      ) : (
                        <UITypography variant="medium" style={{ fontSize: 20 }}>
                          {opt.label.charAt(0)}
                        </UITypography>
                      )}
                    </View> */}
                    <UITypography variant="medium" style={[styles.produceLabel, { fontSize: 14 }]}>
                      {opt.label}
                    </UITypography>
                  </Pressable>
                );
              })}
            </View>
            {hasMoreCrops && !showAllCrops && (
              <Pressable
                style={styles.viewMoreButton}
                onPress={() => setShowAllCrops(true)}
              >
                <UITypography variant="medium" style={styles.viewMoreText}>
                  View More
                </UITypography>
              </Pressable>
            )}
            {hasMoreCrops && showAllCrops && (
              <Pressable
                style={styles.viewMoreButton}
                onPress={() => setShowAllCrops(false)}
              >
                <UITypography variant="medium" style={styles.viewMoreText}>
                  View Less
                </UITypography>
              </Pressable>
            )}
            {error && (
              <UITypography
                variant="regular"
                style={[styles.infoHint, { color: '#E53935', marginTop: 8 }]}
              >
                {error}
              </UITypography>
            )}
            {!error && field.helper_text && (
              <UITypography variant="regular" style={styles.infoHint}>
                {field.helper_text}
              </UITypography>
            )}
          </View>
        );
      }

      // Only resident_ownership field gets rectangular box styling
      if (isHorizontal && isResidentOwnershipField) {
        // Horizontal radio buttons inside rectangular boxes (matching Figma design) - ONLY for resident_ownership
        return (
          <View style={styles.fieldContainer}>
            {renderLabel()}
            <View style={styles.radioGroupHorizontal}>
              {options.map(opt => (
                <Pressable
                  key={opt.value}
                  style={styles.radioBtnBox}
                  onPress={() => {
                    onChange(opt.value);
                    onSubmit?.(opt.value);
                  }}
                >
                  <View
                    style={
                      value === opt.value
                        ? styles.radioOuterActiveBox
                        : styles.radioOuterBox
                    }
                  >
                    {value === opt.value && <View style={styles.radioInnerBox} />}
                  </View>
                  <UITypography
                    variant="medium"
                    style={styles.radioBtnBoxText}
                  >
                    {opt.label}
                  </UITypography>
                </Pressable>
              ))}
            </View>
            {error && (
              <UITypography
                variant="regular"
                style={[styles.infoHint, { color: '#E53935', marginTop: 8 }]}
              >
                {error}
              </UITypography>
            )}
            {!error && field.helper_text && (
              <UITypography variant="regular" style={styles.infoHint}>
                {field.helper_text}
              </UITypography>
            )}
          </View>
        );
      }

      // Regular horizontal radio buttons (without boxes) for other fields
      if (isHorizontal) {
        return (
          <View style={styles.fieldContainer}>
            {renderLabel()}
            <View style={styles.radioGroup}>
              {options.map(opt => (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    onChange(opt.value);
                    onSubmit?.(opt.value);
                  }}
                  style={[
                    styles.chip,
                    value === opt.value && styles.chipActive,
                  ]}
                >
                  <UITypography
                    variant={value === opt.value ? 'semiBold' : 'regular'}
                    style={styles.chipText}
                  >
                    {opt.label}
                  </UITypography>
                </Pressable>
              ))}
            </View>
          </View>
        );
      }

      // Vertical radio buttons
      return (
        <View style={styles.fieldContainer}>
          {renderLabel()}
          <View style={styles.radioGroupVertical}>
            {options.map(opt => (
              <Pressable
                key={opt.value}
                style={styles.radioBtn}
                onPress={() => {
                  onChange(opt.value);
                  onSubmit?.(opt.value);
                }}
              >
                <View
                  style={
                    value === opt.value
                      ? styles.radioOuterActive
                      : styles.radioOuter
                  }
                >
                  {value === opt.value && <View style={styles.radioInner} />}
                </View>
                <UITypography
                  variant="medium"
                  style={{ color: '#898A8D', fontSize: 14 }}
                >
                  {opt.label}
                </UITypography>
              </Pressable>
            ))}
          </View>
        </View>
      );

    case 'checkbox':
      return (
        <View style={styles.confirmRow}>
          <UICheckbox
            checked={!!value}
            onPress={() => {
              const newValue = !value;
              onChange(newValue);
              onSubmit?.(newValue);
            }}
            size={40}
          />
          <UITypography variant="medium" style={styles.confirmText}>
            {field.label}
          </UITypography>
        </View>
      );

    case 'tooltip':
      return (
        <View style={[styles.fieldContainer, { zIndex: 100 }]}>
          <Pressable
            onPress={() => setTooltipIsOpen(!tooltipIsOpen)}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: tooltipIsOpen ? 0 : 4 }}
          >
            <UITypography
              variant="bold"
              style={{
                color: '#582C5F', // Matching the purple from screenshot
                fontSize: 14,
                marginRight: 8,
              }}
            >
              {field.field_config?.label || field.label}
            </UITypography>
            <View style={styles.infoBadge}>
              <Text style={styles.infoText}>i</Text>
            </View>
          </Pressable>

          {tooltipIsOpen && (
            <View style={{ marginTop: 8, position: 'relative' }}>
               {/* Tooltip Arrow (Rotated Square for Border) */}
               <View style={{
                position: 'absolute',
                top: -5, // Adjusted for smaller arrow
                left: 24,
                width: 10, // Smaller arrow
                height: 10,
                backgroundColor: 'white',
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderColor: '#E5E7EB',
                transform: [{ rotate: '45deg' }],
                zIndex: 2,
              }} />

              {/* Tooltip Box */}
              <View style={{
                backgroundColor: 'white',
                borderRadius: 8,
                padding: 12, // Reduced padding
                paddingVertical: 8, // Reduced vertical padding
                borderWidth: 1,
                borderColor: '#E5E7EB',
                zIndex: 1,
              }}>
                <UITypography
                  variant="regular"
                  style={{
                    fontSize: 13, // Slightly smaller text
                    color: '#374151',
                    lineHeight: 18,
                    textAlign: 'left'
                  }}
                >
                  {field.field_config?.content}
                </UITypography>
              </View>
            </View>
          )}
        </View>
      );

    case 'toggle':
      // Check if FSA is completed (all FSA steps have 'completed' status)
      const isFsaCompleted = fsaCompleted || (
        fsaSteps &&
        fsaSteps.length > 0 &&
        fsaSteps.every(step => step.status === 'completed')
      );
      const isLinkToSaleAgreementToggle = field.field_key === 'link_to_sale_agreement';
      const isLinkToSaleAgreementDisabled =
        isLinkToSaleAgreementToggle && !hasInputProviders;

      return (
        <View style={styles.fieldContainer}>
          <View style={styles.toggleRow}>
            <UITypography variant="semiBold" style={styles.toggleLabel}>
              {field.label}
              {field.is_required && (
                <Text style={styles.requiredAsterisk}> *</Text>
              )}
            </UITypography>
            <UIToggleSwitch
              value={!!value}
              disabled={isLinkToSaleAgreementDisabled}
              onToggle={() => {
                if (isLinkToSaleAgreementDisabled) {
                  return;
                }
                const newValue = !value;
                onChange(newValue);
                onSubmit?.(newValue);
              }}
            />
          </View>
          {isLinkToSaleAgreementDisabled && (
            <UITypography variant="regular" style={styles.infoHint}>
              we dont have any buyers in the system right now
            </UITypography>
          )}
          {/* FSA Completed indicator - shown when FSA flow is completed and toggle is ON */}
          {field.field_key === 'link_to_sale_agreement' && !!value && isFsaCompleted && (
            <View style={styles.fsaCompletedContainer}>
              <View style={styles.fsaCompletedBadge}>
                <UITypography variant="medium" style={styles.fsaCompletedText}>
                  ✓ Smart FSA Contract Linked
                </UITypography>
              </View>
            </View>
          )}
        </View>
      );

    case 'button':
      // Handle button field type (e.g., link_fsa_button)
      const isLinkFsaButton = field.field_key === 'link_fsa_button';
      
      // Check if FSA is completed
      const isFsaCompletedForButton = fsaCompleted || (
        fsaSteps &&
        fsaSteps.length > 0 &&
        fsaSteps.every(step => step.status === 'completed')
      );

      // Don't show Link FSA button if FSA is already completed
      if (isLinkFsaButton && isFsaCompletedForButton) {
        return null;
      }

      return (
        <View style={styles.fieldContainer}>
          <Pressable onPress={onLinkFSA} style={styles.linkFsaButton}>
            <UITypography variant="medium" style={styles.linkFsaText}>
              {field.label}
            </UITypography>
          </Pressable>
        </View>
      );

    case 'slider':
      return (
        <View style={styles.fieldContainer}>
          {renderLabel()}
          <UIAmountSelector
            value={value}
            defaultValue={field.field_config?.min || 0}
            min={field.field_config?.min || 0}
            max={field.field_config?.max || 100000}
            step={field.field_config?.step || 1}
            onChange={(val) => {
              // Only update local state during sliding, don't submit draft API
              onChange(val);
            }}
            onBlur={(val) => {
              // Delegate to handleLocalFieldBlur which validates, sets errors, and submits draft API
              onBlur?.(val);
            }}
            style={{ marginTop: 12 }}
            error={error}
          />
        </View>
      );

    case 'file':
      // Use DocumentUpload if section has api_endpoints (for document step)
      if (sectionApiEndpoints) {
        return (
          <View style={styles.fieldContainer}>
            <UIDocumentUpload
              label={field.label}
              fieldKey={field.field_key}
              documentType={field.field_key}
              apiEndpoints={sectionApiEndpoints}
              value={value as DocumentInfo | null}
              onChange={onChange}
              isRequired={field.is_required}
              error={error}
              allowedTypes={
                field.field_config?.allowed_types ||
                field.validation_rules?.file_types
              }
              maxSizeMB={
                field.field_config?.max_size_mb ||
                field.validation_rules?.max_size_mb ||
                10
              }
            />
          </View>
        );
      }
      // Fallback to simple upload picker
      return (
        <View style={styles.fieldContainer}>
          <UIUploadPicker
            label={value ? field.label : undefined}
            file={value}
            onUpload={onChange}
            onDelete={() => onChange(null)}
          />
        </View>
      );

    default:
      return (
        <View style={styles.fieldContainer}>
          {renderLabel()}
          <UITextInput
            placeholder={field.placeholder || ''}
            value={value?.toString() || ''}
            onChangeText={onChange}
          />
        </View>
      );
  }
};

// Main ProductSection component
const ProductSection: React.FC<ProductSectionProps> = ({
  section,
  formValues,
  onFieldChange,
  stepNumber,
  errors = {},
  fsaSteps,
  productSlug,
  stepIdentifier,
  submissionId,
  onSubmissionIdReceived,
  isValidatingStep = false,
  registerFieldRef,
  onFieldErrorChange,
  scrollToField,
  onShowFsaModal,
  fsaCompleted,
  paymentType,
  harvestDetailIds = [],
}) => {
  const navigation = useNavigation<any>();
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const isDebugMode = useDebugStore(state => state.isDebugMode);

  // Clear touchedFields when new parent errors arrive from step validation
  // This ensures backend validation errors are always displayed
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      setTouchedFields(new Set());
    }
  }, [errors]);

  // Clear errors for file fields when they become empty
  useEffect(() => {
    const fileFields = section.fields?.filter(f => f.field_type === 'file') || [];
    fileFields.forEach(field => {
      const value = formValues[field.field_key];
      if (!value || value === null || value === undefined || value === '') {
        setFieldErrors(prev => {
          if (prev[field.field_key]) {
            const newErrors = { ...prev };
            delete newErrors[field.field_key];
            onFieldErrorChange?.(field.field_key, null);
            return newErrors;
          }
          return prev;
        });
      }
    });
  }, [formValues, section.fields, onFieldErrorChange]);

  // Submit field value as draft
  const submitFieldDraft = useCallback(
    async (fieldKey: string, value: any) => {
      // Debug Mode: never persist drafts to the API.
      if (isDebugMode) {
        return;
      }

      // Don't submit draft if step validation is in progress
      if (isValidatingStep) {
        console.log('⏸️ Skipping draft submission - step validation in progress');
        return;
      }

      if (!productSlug || !stepIdentifier) {
        console.warn('Missing productSlug or stepIdentifier for draft submission');
        return;
      }

      try {
        setIsSubmitting(true);

        const payload: FieldSubmissionPayload = {
          is_draft: true,
          type: 'product_submission',
          product_slug: productSlug,
          field_values: {
            [fieldKey]: value,
          },
          step_identifier: stepIdentifier,
          step_number: stepNumber,
        };

        // Include submission_id if we have one from a previous submission
        if (submissionId) {
          payload.submission_id = submissionId;
        }

        console.log('📤 Submitting field draft:', JSON.stringify(payload, null, 2));

        const response = await axiosFinancingPrivate.post('/submissions', payload);
        const responseData = response.data?.data || response.data;

        console.log('✅ Field draft submitted successfully:', responseData);

        // If this is the first submission and we receive a submission_id, notify parent
        if (responseData?.submission_id && !submissionId && onSubmissionIdReceived) {
          onSubmissionIdReceived(responseData.submission_id);
        }
      } catch (error: any) {
        console.log('❌ Failed to submit field draft:', error?.response?.data || error?.message);
        // Don't throw - we don't want to block the user from continuing to fill the form
      } finally {
        setIsSubmitting(false);
      }
    },
    [productSlug, stepIdentifier, stepNumber, submissionId, onSubmissionIdReceived, isValidatingStep, isDebugMode],
  );

  // Wrapper for field change that also triggers draft submission
  const handleFieldChangeWithSubmission = useCallback(
    (fieldKey: string, value: any, field?: ProductConfigurationField) => {
      // First update the local form state
      onFieldChange(fieldKey, value);

      // For file fields, submit immediately after upload to save the document reference
      // Text/textarea fields will submit on blur
      // Other fields (select, radio, etc.) submit via onSubmit handler
      if (field?.field_type === 'file' && value) {
        console.log(`📄 File field changed, submitting immediately: ${fieldKey}`);
        submitFieldDraft(fieldKey, value);
      }
    },
    [onFieldChange, submitFieldDraft],
  );

  // Submit field on blur (for text/textarea fields)
  const handleFieldBlur = useCallback(
    (fieldKey: string, value: any, field?: ProductConfigurationField) => {
      console.log(`📤 Field blur triggered for: ${fieldKey}, value:`, value);

      // Validate field before submitting draft
      // Only save valid values to prevent invalid data from being stored
      // Allow null/empty values to be saved (for clearing fields)
      if (field && value !== null && value !== undefined && value !== '') {
        const validationError = validateField(field, value, formValues, fsaSteps);
        if (validationError) {
          console.log(`❌ Validation failed for ${fieldKey}, skipping draft save:`, validationError);
          // Don't save invalid data - return early
          return;
        }
      }

      // Only submit draft if value is valid (or null/empty, which is allowed for clearing)
      submitFieldDraft(fieldKey, value);

      // Logic to uncheck Declaration "I confirm..." checkbox if critical info changes
      // This handles TEXT fields (triggered on blur)
      const CRITICAL_PEP_FIELDS = [
        'pep_name',
        'pep_position',
        'connected_party_name',
        'connected_party_position'
      ];

      if (CRITICAL_PEP_FIELDS.includes(fieldKey)) {
        console.log(`👀 Critical field blurred: ${fieldKey}, unchecking declaration`);
        onFieldChange('confirm_id_accuracy', false);
        submitFieldDraft('confirm_id_accuracy', false);
      }

      // Logic to clear dependent fields when declaration toggles are set to NO (false)
      if (value === false) {
        if (fieldKey === 'is_politically_exposed_person') {
          // Clear PEP fields
          console.log('🧹 Clearing PEP fields because toggle is NO');
          const pepFields = ['pep_name', 'pep_relationship', 'pep_position'];
          pepFields.forEach(key => {
            onFieldChange(key, null);
            submitFieldDraft(key, null);
            onFieldErrorChange?.(key, null);
          });
        } else if (fieldKey === 'has_relative_in_dabidi_program') {
          // Clear Connected Party fields
          console.log('🧹 Clearing Connected Party fields because toggle is NO');
          const connectedFields = ['connected_party_name', 'connected_party_relationship', 'connected_party_position'];
          connectedFields.forEach(key => {
            onFieldChange(key, null);
            submitFieldDraft(key, null);
            onFieldErrorChange?.(key, null);
          });
        }
      }
    },
    [submitFieldDraft, formValues, onFieldChange, fsaSteps],
  );

  // Submit field immediately (for select, radio, checkbox, etc.)
  const handleFieldSubmit = useCallback(
    (fieldKey: string, value: any, field?: ProductConfigurationField) => {
      console.log(`📤 Field submit triggered for: ${fieldKey}, value:`, value);

      // Validate field before submitting draft for non-text fields too
      // Only save valid values to prevent invalid data from being stored
      // Allow null/empty values to be saved (for clearing fields)
      if (field && value !== null && value !== undefined && value !== '') {
        const validationError = validateField(field, value, formValues, fsaSteps);
        if (validationError) {
          console.log(`❌ Validation failed for ${fieldKey}, skipping draft save:`, validationError);
          // Don't save invalid data - return early
          return;
        }
      }

      // Only submit draft if value is valid (or null/empty, which is allowed for clearing)
      submitFieldDraft(fieldKey, value);

      // Logic to uncheck Declaration "I confirm..." checkbox if critical info changes
      // We duplicate this here because toggle/select fields use this handler
      const CRITICAL_PEP_FIELDS = [
        'is_politically_exposed_person',
        'pep_name',
        'pep_relationship',
        'pep_position',
        'has_relative_in_dabidi_program',
        'connected_party_name',
        'connected_party_relationship',
        'connected_party_position'
      ];

      if (CRITICAL_PEP_FIELDS.includes(fieldKey)) {
        // Uncheck the declaration locally and in draft
        onFieldChange('confirm_id_accuracy', false);
        submitFieldDraft('confirm_id_accuracy', false);
      }
    },
    [submitFieldDraft, formValues, onFieldChange, fsaSteps],
  );

  // Find the Government Verified Buyers step from fsaSteps
  const governmentBuyersStep = useMemo(() => {
    return fsaSteps?.find(
      step => step.identifier === 'government_verified_buyers',
    );
  }, [fsaSteps]);

  // Handler for Link FSA click - now shows FSA modal instead of navigating directly
  const handleLinkFSA = () => {
    if (onShowFsaModal) {
      // Use the modal callback if provided
      onShowFsaModal();
    } else if (governmentBuyersStep) {
      // Fallback: navigate directly to FSA step (legacy behavior)
      navigation.navigate('GovernmentVerifiedBuyers', {
        fsaStep: governmentBuyersStep,
        fsaSteps,
        productSlug,
        submissionId,
      });
    }
  };

  const sortedFields = useMemo(() => {
    return [...(section.fields || [])]
      .filter(f => f.is_active !== false)
      .sort((a, b) => a.display_order - b.display_order);
  }, [section.fields]);

  // Validate all fields with values when component mounts or when section fields change
  // This ensures validation errors are shown if invalid data was loaded from saved drafts
  // Use a ref to track if we've already validated on initial mount
  const hasValidatedOnMountRef = React.useRef(false);

  useEffect(() => {
    if (sortedFields.length === 0) return;

    // Only validate once on mount/initial load to catch invalid saved data
    // Subsequent validations happen on blur/submit
    if (!hasValidatedOnMountRef.current) {
      hasValidatedOnMountRef.current = true;

      // Validate all fields that have values
      const newFieldErrors: FieldErrors = {};
      sortedFields.forEach(field => {
        const fieldValue = formValues[field.field_key];

        // Only validate fields that have values (skip empty/required validation on mount)
        if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
          const validationError = validateField(field, fieldValue, formValues, fsaSteps);
          if (validationError) {
            newFieldErrors[field.field_key] = validationError;
          }
        }
      });

      // Set validation errors if any invalid data is found
      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(prev => ({ ...prev, ...newFieldErrors }));
        // Report errors to parent
        Object.keys(newFieldErrors).forEach(fieldKey => {
          onFieldErrorChange?.(fieldKey, newFieldErrors[fieldKey]);
        });
      }
    }
  }, [sortedFields, formValues, onFieldErrorChange]); // Include formValues to validate when data is loaded

  // Fetch external API data if section has data_source: "external_api"
  useEffect(() => {
    const fetchExternalData = async () => {
      // Skip automatic API calls for buy-inputs product
      if (productSlug === 'buy-inputs') {
        return;
      }

      if (
        section.data_source !== 'external_api' ||
        !section.external_api_config ||
        dataFetched
      ) {
        return;
      }

      const { endpoint, method, response_key } = section.external_api_config;

      // Skip if endpoint is not provided (e.g., sections with api_endpoints structure)
      // These are handled by specific field components
      if (!endpoint) {
        console.log(
          'Section has external_api_config but no single endpoint - likely uses api_endpoints structure for field-level handling',
        );
        return;
      }

      try {
        setIsLoadingData(true);

        // Determine which axios instance to use based on endpoint
        const axiosInstance = endpoint.includes('/api/v1/financing')
          ? axiosFinancingPrivate
          : axiosPrivate;

        // Remove base path prefixes to avoid duplication
        // axiosPrivate base URL already includes /api/v1/auth
        // axiosFinancingPrivate base URL already includes /api/v1/financing
        let cleanEndpoint = endpoint;
        if (axiosInstance === axiosPrivate) {
          cleanEndpoint = endpoint.replace(/^\/api\/v1\/auth/, '');
        } else if (axiosInstance === axiosFinancingPrivate) {
          cleanEndpoint = endpoint.replace(/^\/api\/v1\/financing/, '');
        }

        const response = await axiosInstance.request({
          url: cleanEndpoint,
          method: method || 'GET',
        });

        // Extract data from response using response_key
        let responseData = response_key
          ? response.data[response_key]
          : response.data;

        // If responseData has attributes property, use that (common API pattern)
        if (responseData?.attributes) {
          responseData = responseData.attributes;
        }

        console.log('External API Response Data:', responseData);

        // Pre-fill fields based on prefill_from config
        section.fields?.forEach(field => {
          const prefillKey = field.field_config?.prefill_from;
          if (prefillKey && responseData[prefillKey] !== undefined) {
            // Only set if field is empty to avoid overwriting user changes
            if (
              formValues[field.field_key] === undefined ||
              formValues[field.field_key] === null ||
              formValues[field.field_key] === ''
            ) {
              console.log(
                `Pre-filling field ${field.field_key} with value from ${prefillKey}:`,
                responseData[prefillKey],
              );
              onFieldChange(field.field_key, responseData[prefillKey]);
            }
          }
        });

        setDataFetched(true);
      } catch (error) {
        console.log('Error fetching external data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchExternalData();
  }, [section, dataFetched, formValues, onFieldChange]);

  // Initialize declaration toggles to 'false' if they are null (for resume flow)
  useEffect(() => {
    const DECLARATION_TOGGLES = [
      'is_politically_exposed_person',
      'has_relative_in_dabidi_program',
    ];

    DECLARATION_TOGGLES.forEach((toggleKey) => {
      const field = section.fields?.find((f) => f.field_key === toggleKey);

      // If field exists in this section and value is null/undefined
      if (field) {
        const currentValue = formValues[toggleKey];
        if (currentValue === null || currentValue === undefined) {
          console.log(
            `⚪ Initializing ${toggleKey} to false (default for resume)`,
          );
          handleFieldChangeWithSubmission(toggleKey, false, field);
        }
      }
    });
  }, [
    section.fields,
    formValues,
    handleFieldChangeWithSubmission,
  ]);

  // Automatically submit facility_type draft API when it's set in step 1
  const facilityTypeSubmittedRef = useRef(false);
  useEffect(() => {
    // Only for step 1 and facility_type field
    if (stepNumber !== 1 || submissionId) return;

    const facilityTypeField = section.fields?.find((f) => f.field_key === 'facility_type');
    if (!facilityTypeField) return;

    const facilityTypeValue = formValues['facility_type'];

    // Only submit if facility_type has a value and hasn't been submitted yet
    if (facilityTypeValue && !facilityTypeSubmittedRef.current) {
      console.log('📤 Auto-submitting facility_type draft API:', facilityTypeValue);
      facilityTypeSubmittedRef.current = true;

      // Validate the value first
      const validationError = validateField(facilityTypeField, facilityTypeValue, formValues, fsaSteps);
      if (!validationError) {
        // Submit draft API
        submitFieldDraft('facility_type', facilityTypeValue);
      } else {
        console.log('❌ facility_type validation failed, skipping auto-submit:', validationError);
        facilityTypeSubmittedRef.current = false; // Reset so it can retry
      }
    }
  }, [formValues, stepNumber, section.fields, submitFieldDraft, fsaSteps]);

  const showTooltip = section.metadata?.tooltip;

  return (
    <View style={styles.card}>
      {/* Section Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          {getSectionIcon(section.icon, stepNumber)}
          <UITypography variant="semiBold" style={styles.cardTitle}>
            {section.title}
          </UITypography>
        </View>
        {showTooltip && (
          <View style={{ position: 'relative', zIndex: 100 }}>
            <Pressable
              style={styles.infoBadge}
              onPress={() => setTooltipVisible(true)}
            >
              <Text style={styles.infoText}>i</Text>
            </Pressable>
            <Tooltip
              visible={tooltipVisible}
              text={section.metadata?.tooltip || ''}
              arrowStyle={{ left: '85%', marginLeft: 0 }}
              style={{
                position: 'absolute',
                bottom: 35,
                right: -34,
                width: 200,
              }}
              onClose={() => setTooltipVisible(false)}
              placement="top"
            />
          </View>
        )}
      </View>

      {/* Section Description */}
      {section.description && (
        <UITypography variant="medium" style={styles.cardDescription}>
          {section.description}
        </UITypography>
      )}

      {/* Helper text (used in Documents section) */}
      {(section as any).helper_text && (
        <View style={styles.infoRow}>
          <View style={styles.infoBadge}>
            <Text style={styles.infoText}>i</Text>
          </View>
          <Text style={styles.infoHint}>{(section as any).helper_text}</Text>
        </View>
      )}

      {/* Fields */}
      <View
        style={
          section.fields && section.fields.some(f => f.field_type === 'file')
            ? styles.uploadList
            : undefined
        }
      >
        {sortedFields.map((field, fieldIndex) => {
          // Check if this is expected_volume and next field is expected_volume_unit
          const nextField = sortedFields[fieldIndex + 1];
          const shouldRenderInlineVolume =
            field.field_key === 'expected_volume' &&
            nextField?.field_key === 'expected_volume_unit';

          // Check if this is outstanding_amount and next field is outstanding_currency
          const shouldRenderInlineOutstanding =
            field.field_key === 'outstanding_amount' &&
            nextField?.field_key === 'outstanding_currency';

          // Skip rendering expected_volume_unit if it will be rendered inline with expected_volume
          if (
            field.field_key === 'expected_volume_unit' &&
            sortedFields[fieldIndex - 1]?.field_key === 'expected_volume'
          ) {
            return null;
          }

          // Skip rendering outstanding_currency if it will be rendered inline with outstanding_amount
          if (
            field.field_key === 'outstanding_currency' &&
            sortedFields[fieldIndex - 1]?.field_key === 'outstanding_amount'
          ) {
            return null;
          }

          const handleLocalFieldChange = (val: any) => {
            // Mark text/textarea fields as touched to hide parent validation errors during typing
            // Mark file fields as touched when a document is uploaded to hide parent validation errors
            if (field.field_type === 'text' || field.field_type === 'textarea' ||
                (field.field_type === 'file' && val)) {
              setTouchedFields(prev => new Set(prev).add(field.field_key));
            }

            // Sanitize input based on field type
            let sanitizedValue = val;
            if (typeof val === 'string') {
              if (field.field_type === 'number') {
                // First sanitize to only allow numeric characters (digits, decimal point, minus sign)
                let numericOnly = sanitizeNumericInput(val);

                // Check if this is a volume field with unit "bags" - remove decimals
                if (field.field_key.includes('volume') && field.field_config?.unit_field && formValues) {
                  const unitFieldKey = field.field_config.unit_field;
                  const unitValue = formValues[unitFieldKey];

                  if (unitValue === 'bags') {
                    // Remove any decimal point and digits after it for bags
                    sanitizedValue = numericOnly.replace(/\.\d*/g, '');
                  } else {
                    sanitizedValue = normalizeNumericInput(numericOnly);
                  }
                } else {
                  sanitizedValue = normalizeNumericInput(numericOnly);
                }
              } else if (field.field_type === 'textarea') {
                // Use stricter sanitization for textarea fields to prevent unsupported characters
                sanitizedValue = sanitizeRestrictedTextInput(val);
              } else if (field.field_type === 'text' && isNameOrPositionField(field.field_key)) {
                // Use stricter sanitization for Name and Position fields to prevent unsupported characters
                sanitizedValue = sanitizeRestrictedTextInput(val);
              } else if (field.field_type === 'text') {
                sanitizedValue = sanitizeTextInput(val);
              }
            }

            // Update local form state first (with sanitized value)
            const updatedFormValues = { ...formValues, [field.field_key]: sanitizedValue };
            handleFieldChangeWithSubmission(field.field_key, sanitizedValue, field);

            // Validate expected_volume on change (not just on blur) to check against committed volume
            if (field.field_key === 'expected_volume' && sanitizedValue !== null && sanitizedValue !== undefined && sanitizedValue !== '') {
              // Run async validation for expected_volume
              (async () => {
                const expectedNumValue = parseFloat(sanitizedValue);
                if (!isNaN(expectedNumValue)) {
                  const committedVolumeData = await getCommittedVolumeFromFSA(fsaSteps, submissionId);
                  
                  if (committedVolumeData !== null) {
                    const expectedVolumeUnit = updatedFormValues.expected_volume_unit || updatedFormValues.expected_volume_units || '';
                    const unitsMatch = !committedVolumeData.unit || !expectedVolumeUnit || committedVolumeData.unit === expectedVolumeUnit;
                    
                    if (unitsMatch && expectedNumValue < committedVolumeData.volume) {
                      const errorMsg = `Expected volume cannot be lower than the committed volume (${committedVolumeData.volume}) already set in the Smart FSA Contract.`;
                      setFieldErrors(prev => ({ ...prev, [field.field_key]: errorMsg }));
                      onFieldErrorChange?.(field.field_key, errorMsg);
                      return;
                    }
                  }
                }
                
                // Clear error if validation passes
                setFieldErrors(prev => ({ ...prev, [field.field_key]: null }));
                onFieldErrorChange?.(field.field_key, null);
              })();
            } else if (field.field_key === 'residential_ghana_post_gps_number' || field.field_key === 'residential_address_details') {
              // GPS / Address XOR: show error when both are filled (same as registration flow)
              const gpsKey = 'residential_ghana_post_gps_number';
              const addressKey = 'residential_address_details';
              const siblingKey = field.field_key === gpsKey ? addressKey : gpsKey;
              const currentVal = ((sanitizedValue || '') + '').trim();
              const siblingVal = ((formValues[siblingKey] || '') + '').trim();

              if (currentVal.length > 0 && siblingVal.length > 0) {
                const errorMsg = 'Provide only one: Postal Code or Address.';
                setFieldErrors(prev => ({
                  ...prev,
                  [field.field_key]: errorMsg,
                  [siblingKey]: errorMsg,
                }));
                onFieldErrorChange?.(field.field_key, errorMsg);
                onFieldErrorChange?.(siblingKey, errorMsg);
              } else {
                // Clear errors on both fields when XOR condition is satisfied
                setFieldErrors(prev => ({
                  ...prev,
                  [field.field_key]: null,
                  [siblingKey]: null,
                }));
                onFieldErrorChange?.(field.field_key, null);
                onFieldErrorChange?.(siblingKey, null);
              }
            } else if (field.field_key !== 'expected_volume') {
              // For other fields, clear error when user starts typing/changing
              setFieldErrors(prev => ({ ...prev, [field.field_key]: null }));
              onFieldErrorChange?.(field.field_key, null);
            }

            // When lender is cleared, also clear related fields
            if (field.field_key === 'lender' && sanitizedValue === null) {
              // Clear borrowing_facility_type, outstanding_amount, and outstanding_currency
              // When clearing fields (setting to null), we allow saving without validation
              const borrowingFacilityTypeField = sortedFields.find(f => f.field_key === 'borrowing_facility_type');
              const outstandingAmountField = sortedFields.find(f => f.field_key === 'outstanding_amount');
              const outstandingCurrencyField = sortedFields.find(f => f.field_key === 'outstanding_currency');

              onFieldChange('borrowing_facility_type', null);
              handleFieldSubmit('borrowing_facility_type', null, borrowingFacilityTypeField);
              onFieldChange('outstanding_amount', null);
              handleFieldSubmit('outstanding_amount', null, outstandingAmountField);
              onFieldChange('outstanding_currency', null);
              handleFieldSubmit('outstanding_currency', null, outstandingCurrencyField);

              // Clear errors for related fields
              setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors['borrowing_facility_type'];
                delete newErrors['outstanding_amount'];
                delete newErrors['outstanding_currency'];
                return newErrors;
              });
              // Report error clearing to parent
              onFieldErrorChange?.('borrowing_facility_type', null);
              onFieldErrorChange?.('outstanding_amount', null);
              onFieldErrorChange?.('outstanding_currency', null);
            }

            // GPS / Address XOR validation is now handled above with error messages
            // instead of auto-clearing the other field

            // Note: For expected_volume, validation happens on change to provide immediate feedback
            // For other fields, validation happens on blur for better UX
          };

          // Submit on blur (for text/textarea fields) and validate
          const handleLocalFieldBlur = (val: any) => {
            console.log(`🔵 Local blur handler called for ${field.field_key}, value:`, val);

            // Process value on blur: trim text, normalize numeric values
            let processedValue = val;
            if (typeof val === 'string') {
              if (field.field_type === 'number') {
                // First sanitize to only allow numeric characters (digits, decimal point, minus sign)
                let numericOnly = sanitizeNumericInput(val);

                // Check if this is a volume field with unit "bags" - remove decimals
                if (field.field_key.includes('volume') && field.field_config?.unit_field && formValues) {
                  const unitFieldKey = field.field_config.unit_field;
                  const unitValue = formValues[unitFieldKey];

                  if (unitValue === 'bags') {
                    // Remove any decimal point and digits after it for bags
                    processedValue = numericOnly.replace(/\.\d*/g, '');
                  } else {
                    // Normalize numeric input to remove leading zeros
                    processedValue = normalizeNumericInput(numericOnly);
                  }
                } else {
                  // Normalize numeric input to remove leading zeros
                  processedValue = normalizeNumericInput(numericOnly);
                }
              } else if (field.field_type === 'textarea') {
                // Use stricter sanitization for textarea fields to prevent unsupported characters
                processedValue = sanitizeRestrictedTextInput(val, true); // true = trim
              } else if (field.field_type === 'text' && isNameOrPositionField(field.field_key)) {
                // Use stricter sanitization for Name and Position fields to prevent unsupported characters
                processedValue = sanitizeRestrictedTextInput(val, true); // true = trim
              } else if (field.field_type === 'text') {
                processedValue = sanitizeTextInput(val, true); // true = trim
              }

              // Update the value if it changed after processing
              if (processedValue !== val) {
                handleFieldChangeWithSubmission(field.field_key, processedValue);
                // Update val for validation
                val = processedValue;
              }
            }

            // Validate on blur for better UX
            // Skip validation for file fields - they validate on upload
            if (field.field_type !== 'file') {
              // Special async validation for expected_volume
              if (field.field_key === 'expected_volume') {
                (async () => {
                  const expectedNumValue = parseFloat(processedValue);
                  if (!isNaN(expectedNumValue)) {
                    const committedVolumeData = await getCommittedVolumeFromFSA(fsaSteps, submissionId);
                    
                    if (committedVolumeData !== null) {
                      const expectedVolumeUnit = formValues.expected_volume_unit || formValues.expected_volume_units || '';
                      const unitsMatch = !committedVolumeData.unit || !expectedVolumeUnit || committedVolumeData.unit === expectedVolumeUnit;
                      
                      if (unitsMatch && expectedNumValue < committedVolumeData.volume) {
                        const errorMsg = `Expected volume cannot be lower than the committed volume (${committedVolumeData.volume}) already set in the Smart FSA Contract.`;
                        setFieldErrors(prev => ({ ...prev, [field.field_key]: errorMsg }));
                        onFieldErrorChange?.(field.field_key, errorMsg);
                        return;
                      }
                    }
                  }
                  
                  // Run other validations
                  const error = validateField(field, processedValue, formValues, fsaSteps);
                  if (error) {
                    setFieldErrors(prev => ({ ...prev, [field.field_key]: error }));
                    onFieldErrorChange?.(field.field_key, error);
                    return;
                  }
                  
                  // Clear error if validation passes
                  setFieldErrors(prev => ({ ...prev, [field.field_key]: null }));
                  onFieldErrorChange?.(field.field_key, null);
                  
                  // Submit draft if validation passes
                  handleFieldBlur(field.field_key, processedValue, field);
                })();
                return; // Exit early for async validation
              } else {
                // Regular validation for other fields
                const error = validateField(field, processedValue, formValues, fsaSteps);
                if (error) {
                  setFieldErrors(prev => ({ ...prev, [field.field_key]: error }));
                  onFieldErrorChange?.(field.field_key, error);
                  // Don't save invalid data - stop here
                  return;
                } else {
                  // Clear error if validation passes
                  setFieldErrors(prev => ({ ...prev, [field.field_key]: null }));
                  onFieldErrorChange?.(field.field_key, null);
                }
              }
            }

            // Only submit draft if validation passes (validation happens inside handleFieldBlur now)
            handleFieldBlur(field.field_key, processedValue, field);
          };

          // Submit immediately (for select, radio, checkbox, etc.)
          const handleLocalFieldSubmit = (val: any) => {
            console.log(`🟢 Local submit handler called for ${field.field_key}, value:`, val);
            handleFieldSubmit(field.field_key, val, field);
          };

          // Handle clearing lender field and related fields
          const handleClearLender = () => {
            const borrowingFacilityTypeField = sortedFields.find(f => f.field_key === 'borrowing_facility_type');
            const outstandingAmountField = sortedFields.find(f => f.field_key === 'outstanding_amount');
            const outstandingCurrencyField = sortedFields.find(f => f.field_key === 'outstanding_currency');

            // Clear lender field
            handleLocalFieldChange(null);
            handleLocalFieldSubmit(null);

            // Clear related fields
            onFieldChange('borrowing_facility_type', null);
            handleFieldSubmit('borrowing_facility_type', null, borrowingFacilityTypeField);
            onFieldChange('outstanding_amount', null);
            handleFieldSubmit('outstanding_amount', null, outstandingAmountField);
            onFieldChange('outstanding_currency', null);
            handleFieldSubmit('outstanding_currency', null, outstandingCurrencyField);

            // Clear errors for related fields
            setFieldErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors['borrowing_facility_type'];
              delete newErrors['outstanding_amount'];
              delete newErrors['outstanding_currency'];
              return newErrors;
            });
            // Report error clearing to parent
            onFieldErrorChange?.('borrowing_facility_type', null);
            onFieldErrorChange?.('outstanding_amount', null);
            onFieldErrorChange?.('outstanding_currency', null);
          };

          // Get api_endpoints from section's external_api_config for file fields
          const sectionApiEndpoints = section.external_api_config
            ?.api_endpoints as DocumentApiEndpoints | undefined;

          const fieldValue = formValues[field.field_key];

          // Hide parent validation errors for fields that have been touched (modified) since last validation
          // This ensures errors only show on blur, not while typing
          // For file fields, hide parent errors when a document is uploaded (has a value)
          // But show parent errors when no document is uploaded (to show "is required" errors from backend)
          let parentError = touchedFields.has(field.field_key) ? null : errors[field.field_key];
          if (field.field_type === 'file' && fieldValue) {
            // Hide parent errors when a document is uploaded (requirement is satisfied)
            parentError = null;
          }
          // Combine parent errors (backend validation) with local field errors (client-side validation)
          let fieldError = parentError || fieldErrors[field.field_key];

          // Handle inline rendering for expected_volume and expected_volume_unit
          if (shouldRenderInlineVolume) {
            const unitField = nextField;
            const unitFieldValue = formValues[unitField.field_key];
            const unitFieldError = touchedFields.has(unitField.field_key)
              ? null
              : (errors[unitField.field_key] || fieldErrors[unitField.field_key]);

            // Get options for unit field
            const unitOptions = (unitField.options || [])
              .filter((opt: any) => opt.is_active !== false)
              .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
              .map((opt: any) => ({
                label: opt.option_label,
                value: opt.option_value,
              }));

            const handleUnitFieldChange = (val: any) => {
              handleFieldChangeWithSubmission(unitField.field_key, val);

              // If unit changed to "bags", remove decimals from volume field
              if (val === 'bags' && formValues[field.field_key]) {
                const volumeValue = formValues[field.field_key];
                if (typeof volumeValue === 'string' && volumeValue.includes('.')) {
                  const updatedVolume = volumeValue.replace(/\.\d*/g, '');
                  handleFieldChangeWithSubmission(field.field_key, updatedVolume);
                }
              }
              
              // If this is expected_volume_unit changing, re-validate expected_volume
              if ((unitField.field_key === 'expected_volume_unit' || unitField.field_key === 'expected_volume_units') 
                  && field.field_key === 'expected_volume') {
                const expectedVolumeValue = formValues[field.field_key];
                if (expectedVolumeValue) {
                  // Re-validate expected_volume with the new unit
                  const tempFormValues = { ...formValues, [unitField.field_key]: val };
                  const error = validateField(field, expectedVolumeValue, tempFormValues, fsaSteps);
                  if (error) {
                    setFieldErrors(prev => ({ ...prev, [field.field_key]: error }));
                    onFieldErrorChange?.(field.field_key, error);
                  } else {
                    setFieldErrors(prev => ({ ...prev, [field.field_key]: null }));
                    onFieldErrorChange?.(field.field_key, null);
                  }
                }
              }
            };

            const handleUnitFieldSubmit = (val: any) => {
              handleFieldSubmit(unitField.field_key, val, unitField);
            };

            return (
              <View
                key={field.field_key}
                style={styles.fieldContainer}
                ref={(ref) => registerFieldRef?.(field.field_key, ref)}
              >
                <View style={styles.inlineRow}>
                  <View style={styles.inlineLeft}>
                    <UITextInput
                      label={field.label}
                      labelStyle={{ fontSize: 14, fontWeight: '500', color: '#404040', marginTop: 0, marginBottom: 8 }}
                      requiredLabel={field.is_required}
                      placeholder={field.placeholder || ''}
                      value={formValues[field.field_key]?.toString() || ''}
                      onChangeText={(text) => {
                        // If unit is "bags", remove decimals as user types
                        const unitValue = formValues[unitField.field_key];
                        if (unitValue === 'bags' && text.includes('.')) {
                          text = text.replace(/\.\d*/g, '');
                        }
                        handleLocalFieldChange(text);
                      }}
                      onBlur={() => handleLocalFieldBlur(formValues[field.field_key])}
                      keyboardType="numeric"
                      error={false}
                      helperText=""
                    />
                  </View>
                  <View style={styles.inlineRight}>
                    <UIPicker
                      label={unitField.label}
                      labelStyles={{ fontSize: 14, fontWeight: '500', color: '#404040', marginTop: 0, marginBottom: 8 }}
                      requiredLabel={unitField.is_required}
                      options={unitOptions}
                      selectedValue={unitFieldValue}
                      onValueChange={(val) => {
                        handleUnitFieldChange(val);
                        handleUnitFieldSubmit(val);
                      }}
                      placeholder={unitField.placeholder || 'Please Select'}
                      inline={false}
                      error={false}
                      helperText=""
                      style={[styles.inlinePicker, { marginBottom: 0 }]}
                    />
                  </View>
                </View>
                {/* Render errors below the inline row to maintain alignment */}
                {(fieldError || unitFieldError) && (
                  <View style={{ marginTop: 4 }}>
                    {fieldError && (
                      <UITypography
                        variant="regular"
                        style={[styles.infoHint, { color: '#E53935', marginTop: 0 }]}
                      >
                        {fieldError}
                      </UITypography>
                    )}
                    {unitFieldError && (
                      <UITypography
                        variant="regular"
                        style={[styles.infoHint, { color: '#E53935', marginTop: fieldError ? 4 : 0 }]}
                      >
                        {unitFieldError}
                      </UITypography>
                    )}
                  </View>
                )}
              </View>
            );
          }

          // Handle inline rendering for outstanding_amount and outstanding_currency
          if (shouldRenderInlineOutstanding) {
            const currencyField = nextField;
            const currencyFieldValue = formValues[currencyField.field_key];
            const currencyFieldError = touchedFields.has(currencyField.field_key)
              ? null
              : (errors[currencyField.field_key] || fieldErrors[currencyField.field_key]);

            // Get options for currency field
            const currencyOptions = (currencyField.options || [])
              .filter((opt: any) => opt.is_active !== false)
              .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
              .map((opt: any) => ({
                label: opt.option_label,
                value: opt.option_value,
              }));

            const handleCurrencyFieldChange = (val: any) => {
              handleFieldChangeWithSubmission(currencyField.field_key, val);
            };

            const handleCurrencyFieldSubmit = (val: any) => {
              handleFieldSubmit(currencyField.field_key, val, currencyField);
            };

            // Enable clearing for currency field
            const allowClearCurrency = currencyField.field_key === 'outstanding_currency';

            return (
              <View
                key={field.field_key}
                style={styles.fieldContainer}
                ref={(ref) => registerFieldRef?.(field.field_key, ref)}
              >
                <View style={styles.inlineRow}>
                  <View style={styles.inlineLeft}>
                    <UITextInput
                      label={field.label}
                      labelStyle={{ fontSize: 14, fontWeight: '500', color: '#404040', marginTop: 0, marginBottom: 8 }}
                      requiredLabel={field.is_required}
                      placeholder={field.placeholder || ''}
                      value={formValues[field.field_key]?.toString() || ''}
                      addonBefore={
                        <Text style={{ fontSize: 16, color: '#404040', fontWeight: '500' }}>Rs</Text>
                      }
                      addonBeforeProps={{
                        showDivider: false,
                        containerStyle: { marginRight: 8, width: 'auto', paddingRight: 0 }
                      }}
                      onChangeText={(text) => handleLocalFieldChange(text)}
                      onBlur={() => handleLocalFieldBlur(formValues[field.field_key])}
                      keyboardType="numeric"
                      error={false}
                      helperText=""
                    />
                  </View>
                  <View style={styles.inlineRight}>
                    <UIPicker
                      label={currencyField.label}
                      labelStyles={{ fontSize: 14, fontWeight: '500', color: '#404040', marginTop: 0, marginBottom: 8 }}
                      requiredLabel={currencyField.is_required}
                      options={currencyOptions}
                      selectedValue={currencyFieldValue}
                      onValueChange={(val) => {
                        handleCurrencyFieldChange(val);
                        handleCurrencyFieldSubmit(val);
                      }}
                      placeholder={currencyField.placeholder || 'Please Select'}
                      inline={false}
                      optional={allowClearCurrency}
                      error={false}
                      helperText=""
                      style={[styles.inlinePicker, { marginBottom: 0 }]}
                    />
                  </View>
                </View>
                {/* Render errors below the inline row to maintain alignment */}
                {(fieldError || currencyFieldError) && (
                  <View style={{ marginTop: 4 }}>
                    {fieldError && (
                      <UITypography
                        variant="regular"
                        style={[styles.infoHint, { color: '#E53935', marginTop: 0 }]}
                      >
                        {fieldError}
                      </UITypography>
                    )}
                    {currencyFieldError && (
                      <UITypography
                        variant="regular"
                        style={[styles.infoHint, { color: '#E53935', marginTop: fieldError ? 4 : 0 }]}
                      >
                        {currencyFieldError}
                      </UITypography>
                    )}
                  </View>
                )}
              </View>
            );
          }

          return (
            <View
              key={field.field_key}
              ref={(ref) => registerFieldRef?.(field.field_key, ref)}
            >
              <DynamicField
                field={field}
                value={formValues[field.field_key]}
                onChange={handleLocalFieldChange}
                onBlur={handleLocalFieldBlur}
                onSubmit={handleLocalFieldSubmit}
                formValues={formValues}
                error={fieldError}
                sectionApiEndpoints={sectionApiEndpoints}
                fsaSteps={fsaSteps}
                onLinkFSA={handleLinkFSA}
                scrollToField={scrollToField}
                fsaCompleted={fsaCompleted}
                loanReturnParams={{
                  slug: productSlug,
                  submissionId: submissionId,
                  initialStepIndex: stepNumber - 1,
                }}
                paymentType={paymentType}
                harvestDetailIds={harvestDetailIds}
              />
              {field.field_key === 'residential_address_details' && (
                <UITypography
                  variant="regular"
                  style={{ fontSize: 12, color: '#888888', marginTop: 6, marginBottom: 4 }}
                >
                  * Enter either Postal Code or Address.
                </UITypography>
              )}
              {field.field_key === 'lender' && formValues[field.field_key] && (
                <Pressable onPress={handleClearLender} style={styles.clearButton}>
                  <UITypography variant="regular" style={styles.clearButtonText}>
                    Clear
                  </UITypography>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>


    </View>
  );
};

// Styles for the read-only harvest accordion details
const haStyles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#404040',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#404040',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  produceTile: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  produceTileSelected: {
    borderColor: '#099453',
    backgroundColor: '#09945310',
  },
  produceLabel: {
    fontSize: 14,
    color: '#099453',
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  inlineLeft: {
    flex: 0.5,
  },
  inlineRight: {
    flex: 0.5,
  },
  farmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  farmLabel: {
    fontSize: 14,
    color: '#404040',
    flex: 1,
    marginRight: 10,
  },
  infoRow: {
    marginBottom: 14,
  },
  infoLabel: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#101010',
    lineHeight: 22,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#DDD',
    marginTop: 12,
  },
  disabledCard: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.7,
  },
  disabledCheckbox: {
    borderColor: '#BDBDBD',
    backgroundColor: '#EEEEEE',
  },
  disabledText: {
    color: '#9E9E9E',
  },
  loanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    gap: 10,
  },
  loanBannerTextWrap: { flex: 1 },
  loanBannerTitle: { fontSize: 12, color: '#101010', fontWeight: '600' },
  loanBannerSubtitle: { fontSize: 11, color: '#666', marginTop: 2 },
});

export default ProductSection;

