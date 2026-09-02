import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  Pressable,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { styles } from './CheckoutScreen.styled';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import ChevronDownIcon from '@/components/icons/ChevronDownIcon';
import CrossIcon from '@/components/icons/CrossIcon';
import { UIContainedButton, UITypography, UIIconButton } from '@/components/ui';
import UICenterModal from '@/components/ui/modal/center';
import { axiosFinancingPrivate, axiosPrivate, axiosPublic } from '@/config/axios';
import type { FSAStep } from '@/store/useProductsStore';
import { COUNTRY } from '@env';
import { useFarmer } from '@/constants/context/farmer/context';
import { Toast } from 'toastify-react-native';

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  selected_item_id?: string;
}

interface Program {
  id: string;
  lender_name: string;
  name: string;
  sanctioned_facility_limit: number;
  available_limit: number;
  total_outstanding: number;
  currency: string;
  status: string;
  harvest_detail_ids?: string[];
}

interface RouteParams {
  Checkout: {
    cartItems: CartItem[];
    totalAmount: number;
    step?: FSAStep;
    steps?: FSAStep[];
    productSlug?: string;
    submissionId?: string | null;
    providerId?: string;
    providerName?: string;
    isOrderLocked?: boolean;
    fromDashboard?: boolean;
    acceptsProviderCredit?: boolean;
    providerCreditDisabledMessage?: string;
  };
}

export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { farmer } = useFarmer();
  const { 
    cartItems = [], 
    totalAmount = 0,
    step,
    steps,
    productSlug = 'buy-inputs',
    submissionId: initialSubmissionId,
    providerId,
    providerName,
    isOrderLocked = false,
    fromDashboard = false,
    acceptsProviderCredit: acceptsProviderCreditParam,
    providerCreditDisabledMessage: providerCreditDisabledMessageParam,
  } = (route.params as RouteParams['Checkout']) || {};

  // Track provider-credit eligibility in local state so we can resolve it on
  // resume flows where the route params don't carry the IP's flag. Until we
  // know the IP explicitly accepts provider credit, we must not auto-select
  // it as the default payment method.
  const [acceptsProviderCredit, setAcceptsProviderCredit] = useState<boolean | undefined>(
    acceptsProviderCreditParam,
  );
  const [providerCreditDisabledMessage, setProviderCreditDisabledMessage] = useState<
    string | undefined
  >(providerCreditDisabledMessageParam);

  const [selectedDelivery, setSelectedDelivery] = useState<string>('');
  const [showDeliveryDropdown, setShowDeliveryDropdown] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
    acceptsProviderCreditParam === true ? 'provider_credit' : '',
  );
  const [billTo, setBillTo] = useState<string>(providerName || 'Customer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(initialSubmissionId || null);
  const [localCartItems, setLocalCartItems] = useState<CartItem[]>(cartItems);
  const [localTotalAmount, setLocalTotalAmount] = useState<number>(totalAmount);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [showProviderCreditModal, setShowProviderCreditModal] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState<Array<{ value: string; label: string }>>([
    { value: 'doorstep_delivery', label: 'Doorstep Delivery' },
    { value: 'pickup', label: 'Pickup' },
  ]);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [addressOptions, setAddressOptions] = useState<string[]>([]);
  const hasRestoredRef = useRef(false);

  const getNameInitials = useCallback((name: string) => {
    const parts = (name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!parts.length) return 'PC';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, []);

  // Responsive modal styles
  const modalStyles = useMemo(() => {
    const { width: screenWidth } = Dimensions.get('window');
    const isSmallScreen = screenWidth < 380;

    return StyleSheet.create({
      card: {
        width: '100%',
        maxWidth: isSmallScreen ? screenWidth - 40 : 400,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        paddingVertical: isSmallScreen ? 20 : 30,
        paddingHorizontal: isSmallScreen ? 16 : 24,
        shadowColor: 'rgba(109, 109, 109, 0.25)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 6,
      },
      closeBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        zIndex: 10,
      },
      closeCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(109, 109, 109, 0.1)',
        shadowColor: 'rgba(32, 31, 31, 0.6)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 6,
      },
      title: {
        color: '#101010',
        fontFamily: 'Poppins-Bold',
        fontSize: isSmallScreen ? 15 : 18,
        lineHeight: isSmallScreen ? 20 : 24,
        marginBottom: isSmallScreen ? 8 : 12,
        textAlign: 'center',
      },
      body: {
        marginTop: isSmallScreen ? 8 : 12,
        color: '#333333',
        fontFamily: 'Poppins-Regular',
        fontSize: isSmallScreen ? 12 : 14,
        lineHeight: isSmallScreen ? 17 : 20,
        textAlign: 'center',
      },
      actions: {
        marginTop: isSmallScreen ? 16 : 20,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: 12,
      },
      changePaymentTouchable: {
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: 'center',
        backgroundColor: 'transparent',
      },
      changePaymentText: {
        color: '#333333',
        fontSize: isSmallScreen ? 13 : 14,
        textAlign: 'center',
      },
      proceedBtn: {
        height: 44,
        paddingHorizontal: 18,
        paddingVertical: 8,
        minHeight: 40,
        borderRadius: 5,
        width: '100%',
      },
    });
  }, []);

  // Fetch payment programs from API
  useEffect(() => {
    const fetchPrograms = async () => {
      setProgramsLoading(true);
      try {
        console.log('📤 Fetching payment programs from /farmers/transactions/programs');
        const response = await axiosFinancingPrivate.get('/farmers/transactions/programs');
        const data: Program[] = response.data?.data || response.data || [];
        const activePrograms = data.filter(p => p.status === 'active');
        console.log('✅ Payment programs fetched:', activePrograms.length);
        setPrograms(activePrograms);
      } catch (error: any) {
        console.log('⚠️ Could not fetch payment programs:', error?.response?.data || error?.message);
      } finally {
        setProgramsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // When resuming an in-progress request, the route params may not carry the
  // selected IP's `accepts_provider_credit` flag. Without it, the Provider
  // Credit option would default to enabled even for IPs that do not accept it.
  // Resolve it here by fetching the IP from /input_providers and clear any
  // pre-selected provider_credit if the IP does not accept it.
  useEffect(() => {
    if (acceptsProviderCredit !== undefined) return;
    if (!providerId) return;

    let cancelled = false;
    const resolveAcceptsProviderCredit = async () => {
      try {
        const response = await axiosFinancingPrivate.get('/input_providers', {
          params: { country: COUNTRY },
        });
        const providers = response.data?.data || response.data || [];
        if (!Array.isArray(providers)) return;

        const match = providers.find((p: any) => {
          const id = p?.id ?? p?.uuid ?? p?.attributes?.id;
          return String(id) === String(providerId);
        });
        if (!match) return;

        const accepts =
          match?.attributes?.accepts_provider_credit ?? match?.accepts_provider_credit;
        const disabledMessage =
          match?.attributes?.provider_credit_disabled_message ??
          match?.provider_credit_disabled_message;

        if (cancelled) return;

        if (typeof accepts === 'boolean') {
          setAcceptsProviderCredit(accepts);
          if (accepts === false) {
            setProviderCreditDisabledMessage(prev => prev || disabledMessage);
            // Clear any pre-selected provider_credit since the IP does not accept it.
            setSelectedPaymentMethod(prev => (prev === 'provider_credit' ? '' : prev));
          }
        }
      } catch (error: any) {
        console.log(
          '⚠️ Could not resolve provider credit eligibility:',
          error?.response?.data || error?.message,
        );
      }
    };

    resolveAcceptsProviderCredit();
    return () => {
      cancelled = true;
    };
  }, [acceptsProviderCredit, providerId]);

  // Fetch user's name and address from /users/me API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('📤 Fetching user data from /users/me');
        const response = await axiosPrivate.get('/users/me');
        const userData = response.data?.data || response.data;
        const attributes = userData?.attributes || {};
        const userName = userData?.attributes?.name || userData?.name;

        const normalizeAddress = (value: any): string | null => {
          if (typeof value !== 'string') return null;
          const trimmed = value.trim();
          return trimmed.length ? trimmed : null;
        };

        const pushAddress = (bucket: string[], value: any) => {
          const normalized = normalizeAddress(value);
          if (normalized) bucket.push(normalized);
        };

        const getUniqueAddresses = (values: string[]): string[] => {
          const seen = new Set<string>();
          const unique: string[] = [];

          values.forEach(address => {
            const key = address.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              unique.push(address);
            }
          });

          return unique;
        };

        const extractFarmAddresses = (farmSource: any): string[] => {
          const farms = Array.isArray(farmSource)
            ? farmSource
            : farmSource
              ? [farmSource]
              : [];
          const farmAddresses: string[] = [];

          farms.forEach(farm => {
            if (!farm || typeof farm !== 'object') return;
            pushAddress(farmAddresses, farm.address);
            pushAddress(farmAddresses, farm.address_line);
            pushAddress(farmAddresses, farm.residential_address);
            pushAddress(farmAddresses, farm.residence_address);
            pushAddress(farmAddresses, farm.ghana_post_gps_number);
            pushAddress(farmAddresses, farm.gps_number);
          });

          return farmAddresses;
        };
        
        // Set user name if available
        if (userName && (billTo === 'Customer' || billTo === providerName)) {
          console.log('✅ User name fetched:', userName);
          setBillTo(userName);
        }
        
        // Extract all available addresses from residential fields and all farm collections.
        const availableAddresses: string[] = [];

        pushAddress(availableAddresses, attributes?.residential_address);
        pushAddress(availableAddresses, attributes?.residence_address);
        pushAddress(availableAddresses, userData?.residential_address);
        pushAddress(availableAddresses, userData?.residence_address);

        const farmAddressSources = [
          attributes?.farm_profile,
          attributes?.farm_profiles,
          attributes?.farms,
          userData?.farm_profile,
          userData?.farm_profiles,
          userData?.farms,
        ];

        farmAddressSources.forEach(source => {
          extractFarmAddresses(source).forEach(address => availableAddresses.push(address));
        });

        pushAddress(availableAddresses, attributes?.ghana_post_gps_number);
        pushAddress(availableAddresses, userData?.ghana_post_gps_number);

        const uniqueAddresses = getUniqueAddresses(availableAddresses);
        
        if (uniqueAddresses.length > 0) {
          console.log('✅ Checkout delivery addresses fetched:', uniqueAddresses.length);
          setAddressOptions(uniqueAddresses);
          setDeliveryAddress(prev => prev || uniqueAddresses[0]);
        } else {
          console.log('⚠️ No address or GPS found');
        }
      } catch (error: any) {
        console.log('⚠️ Could not fetch user data:', error?.response?.data || error?.message);
      }
    };

    fetchUserData();
  }, []); // Run once on mount

  // Get section configurations from step
  const detailSummarySection = useMemo(() => {
    if (!step?.sections?.length) return null;
    return step.sections.find(s => s.identifier === 'po_detail_summary');
  }, [step]);

  const lineItemsSection = useMemo(() => {
    if (!step?.sections?.length) return null;
    return step.sections.find(s => s.identifier === 'po_line_items');
  }, [step]);

  const totalSummarySection = useMemo(() => {
    if (!step?.sections?.length) return null;
    return step.sections.find(s => s.identifier === 'checkout_total_summary');
  }, [step]);

  const deliverySection = useMemo(() => {
    if (!step?.sections?.length) return null;
    return step.sections.find(s => s.identifier === 'delivery_options');
  }, [step]);

  const paymentSection = useMemo(() => {
    if (!step?.sections?.length) return null;
    return step.sections.find(s => s.identifier === 'mode_of_payment');
  }, [step]);

  // Get screen title from step config
  const screenTitle = step?.title || 'Checkout';

  // Populate delivery and payment selections from submission data when editing
  useEffect(() => {
    const deliveryOptionsSection = step?.sections?.find(s => s.identifier === 'delivery_options');
    const paymentSection = step?.sections?.find(s => s.identifier === 'mode_of_payment');
    const detailSummarySection = step?.sections?.find(s => s.identifier === 'po_detail_summary');
    const lineItemsSection = step?.sections?.find(s => s.identifier === 'po_line_items');
    const totalSummarySection = step?.sections?.find(s => s.identifier === 'checkout_total_summary');
    
    // Check if we have saved delivery option from step data
    if (deliveryOptionsSection?.fields && Array.isArray(deliveryOptionsSection.fields)) {
      const deliveryField = deliveryOptionsSection.fields.find(f => f.field_key === 'delivery_option');
      if (deliveryField?.value) {
        console.log('📝 Pre-populating delivery option from step data:', deliveryField.value);
        setSelectedDelivery(deliveryField.value);
      }
      
      // Check if we have saved delivery address from step data
      const deliveryAddressField = deliveryOptionsSection.fields.find(f => f.field_key === 'delivery_address');
      if (deliveryAddressField?.value) {
        console.log('📝 Pre-populating delivery address from step data:', deliveryAddressField.value);
        setDeliveryAddress(deliveryAddressField.value);
      }
    }
    
    // Check if we have saved payment method from step data
    if (paymentSection?.fields && Array.isArray(paymentSection.fields)) {
      const paymentField = paymentSection.fields.find(f => f.field_key === 'payment_method');
      if (paymentField?.value) {
        console.log('📝 Pre-populating payment method from step data:', paymentField.value);
        setSelectedPaymentMethod(paymentField.value);
      }
    }

    // Mark as restored ONLY if we actually found saved values to restore.
    // Otherwise, let the useFocusEffect fetch from server and restore them.
    const deliveryField = deliveryOptionsSection?.fields?.find((f: any) => f.field_key === 'delivery_option');
    const paymentField = paymentSection?.fields?.find((f: any) => f.field_key === 'payment_method');
    if (deliveryField?.value || paymentField?.value) {
      hasRestoredRef.current = true;
    }
    
    // Extract cart items from submission if not passed via route params
    let cartItemsExtracted = false;
    
    // First try to get from step 4 (current step)
    if (lineItemsSection?.fields && Array.isArray(lineItemsSection.fields)) {
      const lineItemsField = lineItemsSection.fields.find(f => f.field_key === 'po_line_items');
      if (lineItemsField?.value && Array.isArray(lineItemsField.value) && lineItemsField.value.length > 0) {
        console.log('📝 Pre-populating cart items from step 4 submission:', lineItemsField.value);
        
        // Map submission line items to CartItem format
        const mappedItems: CartItem[] = lineItemsField.value.map((item: any) => ({
          id: item.selected_item_id || item.id || Math.random().toString(),
          name: item.item_name || item.name || 'Unknown',
          category: item.category || 'Other',
          price: item.price || 0,
          unit: item.qty?.replace(/[0-9]/g, '').trim() || 'units',
          quantity: parseInt(item.qty) || item.quantity || 1,
          selected_item_id: item.selected_item_id || item.id,
        }));
        
        setLocalCartItems(mappedItems);
        cartItemsExtracted = true;
      }
    }
    
    // If step 4 doesn't have cart items, fallback to step 3 (cart_summary)
    if (!cartItemsExtracted && steps && Array.isArray(steps)) {
      const cartSummaryStep = steps.find(s => s.identifier === 'cart_summary');
      if (cartSummaryStep?.sections && Array.isArray(cartSummaryStep.sections)) {
        const cartItemsSection = cartSummaryStep.sections.find(s => s.identifier === 'cart_items');
        if (cartItemsSection?.fields && Array.isArray(cartItemsSection.fields)) {
          const cartItemsField = cartItemsSection.fields.find(f => f.field_key === 'cart_items');
          if (cartItemsField?.value && Array.isArray(cartItemsField.value) && cartItemsField.value.length > 0) {
            console.log('📝 Pre-populating cart items from step 3 (cart_summary):', cartItemsField.value);
            
            // Map cart items from step 3 to CartItem format
            const mappedItems: CartItem[] = cartItemsField.value.map((item: any) => ({
              id: item.selected_item_id || item.id || Math.random().toString(),
              name: item.item_name || 'Unknown',
              category: item.category || 'Other',
              price: item.unit_price || item.price || 0,
              unit: item.quantity_unit || 'units',
              quantity: item.quantity || 1,
              selected_item_id: item.selected_item_id,
            }));
            
            setLocalCartItems(mappedItems);
            cartItemsExtracted = true;
          }
        }
        
        // Also extract total from step 3's cart_details if available
        const cartDetailsSection = cartSummaryStep.sections.find(s => s.identifier === 'cart_summary_details');
        if (cartDetailsSection?.fields && Array.isArray(cartDetailsSection.fields)) {
          const cartDetailsField = cartDetailsSection.fields.find(f => f.field_key === 'cart_details');
          if (cartDetailsField?.value) {
            const totalValue = cartDetailsField.value.total_incl_tax || cartDetailsField.value.total;
            if (totalValue && totalValue > 0) {
              console.log('📝 Pre-populating total amount from step 3 (cart_summary):', totalValue);
              setLocalTotalAmount(totalValue);
            }
          }
        }
      }
    }
    
    // Extract total amount from submission if not passed via route params
    if (totalSummarySection?.fields && Array.isArray(totalSummarySection.fields)) {
      const totalSummaryField = totalSummarySection.fields.find(f => f.field_key === 'checkout_total_summary');
      if (totalSummaryField?.value) {
        const totalValue = totalSummaryField.value.total || totalSummaryField.value.balance_due;
        if (totalValue && totalValue > 0) {
          console.log('📝 Pre-populating total amount from submission:', totalValue);
          setLocalTotalAmount(totalValue);
        }
      }
    }
  }, [step, steps]);

  // Fetch delivery options and cart summary from API or use static config
  useEffect(() => {
    const fetchCheckoutData = async () => {
      // Fetch delivery options
      const apiConfig = deliverySection?.external_api_config;
      
      if (apiConfig?.endpoint) {
        try {
          console.log('📤 Fetching delivery options from:', apiConfig.endpoint);
          
          // Strip /api/v1 prefix if present
          let endpoint = apiConfig.endpoint;
          if (endpoint.startsWith('/api/v1/')) {
            endpoint = endpoint.replace('/api/v1/', '/');
          }
          
          const response = await axiosFinancingPrivate.get(endpoint);
          const responseData = response.data?.data || response.data;
          
          console.log('✅ Delivery options response:', responseData);
          
          // Parse response based on response_key
          let options = responseData;
          if (apiConfig.response_key && responseData[apiConfig.response_key]) {
            options = responseData[apiConfig.response_key];
          }
          
          // Map to dropdown format
          if (Array.isArray(options)) {
            const mappedOptions = options.map((opt: any) => ({
              value: opt.value || opt.option_value || opt.id,
              label: opt.label || opt.option_label || opt.name,
            }));
            setDeliveryOptions(mappedOptions);
          }
        } catch (error: any) {
          console.log('❌ Failed to fetch delivery options:', error?.response?.data || error?.message);
          // Fallback to static options from field config
          loadStaticDeliveryOptions();
        }
      } else {
        // No API config, use static options
        loadStaticDeliveryOptions();
      }

      // Fetch cart summary data for checkout sections
      // Check if any of the summary sections have external_api_config
      const summaryApiConfig = detailSummarySection?.external_api_config || 
                               lineItemsSection?.external_api_config || 
                               totalSummarySection?.external_api_config;

      if (summaryApiConfig?.endpoint) {
        try {
          console.log('📤 Fetching cart summary for checkout from:', summaryApiConfig.endpoint);
          
          // Strip /api/v1 prefix if present
          let endpoint = summaryApiConfig.endpoint;
          if (endpoint.startsWith('/api/v1/')) {
            endpoint = endpoint.replace('/api/v1/', '/');
          }
          
          const response = await axiosFinancingPrivate.get(endpoint);
          const responseData = response.data?.data || response.data;
          console.log('✅ Cart summary for checkout response:', responseData);

          // Parse response based on response_key
          let summaryData = responseData;
          if (summaryApiConfig.response_key && responseData[summaryApiConfig.response_key]) {
            summaryData = responseData[summaryApiConfig.response_key];
          }

          // Update cart items if available in the response
          if (summaryData.items && Array.isArray(summaryData.items)) {
            const mappedItems: CartItem[] = summaryData.items.map((item: any) => ({
              id: item.selected_item_id || item.id || Math.random().toString(),
              name: item.item_name || item.name || 'Unknown',
              category: item.category || 'Other',
              price: item.unit_price || item.price || 0,
              unit: item.quantity_unit || item.unit || 'units',
              quantity: item.quantity || 1,
              selected_item_id: item.selected_item_id || item.id,
            }));
            setLocalCartItems(mappedItems);
          }

          // Update total amount if available
          if (summaryData.total || summaryData.total_incl_tax) {
            const total = summaryData.total_incl_tax || summaryData.total || 0;
            setLocalTotalAmount(total);
          }

          // Update bill_to if available
          if (summaryData.bill_to_name || summaryData.customer_name) {
            setBillTo(summaryData.bill_to_name || summaryData.customer_name);
          }
        } catch (error: any) {
          console.log('❌ Failed to fetch cart summary for checkout:', error?.response?.data || error?.message);
        }
      }
    };
    
    const loadStaticDeliveryOptions = () => {
      const field = deliverySection?.fields?.find(f => f.field_key === 'delivery_option');
      if (field?.options?.length) {
        const staticOptions = field.options
          .filter((opt: any) => opt.is_active)
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((opt: any) => ({
            value: opt.option_value,
            label: opt.option_label,
          }));
        setDeliveryOptions(staticOptions);
      }
    };
    
    fetchCheckoutData();
  }, [deliverySection, detailSummarySection, lineItemsSection, totalSummarySection]);

  // Get display keys for detail summary
  const detailDisplayKeys = useMemo(() => {
    const field = detailSummarySection?.fields?.find(f => f.field_key === 'checkout_detail_summary') as any;
    return field?.display_keys || {
      bill_to: 'Bill To',
      invoice_number: 'Invoice #',
      invoice_date: 'Invoice Date',
      due_date: 'Due Date',
      price: 'Price',
    };
  }, [detailSummarySection]);

  // Get display keys for total summary
  const totalDisplayKeys = useMemo(() => {
    const field = totalSummarySection?.fields?.find(f => f.field_key === 'checkout_total_summary') as any;
    return field?.display_keys || {
      sub_total: 'Sub Total',
      total: 'Total',
      balance_due: 'Balance Due',
    };
  }, [totalSummarySection]);

  const subTotal = localTotalAmount;
  const balanceDue = localTotalAmount;

  // Compute button disabled state explicitly
  const isButtonDisabled = useMemo(() => {
    // Check if delivery option is selected
    if (!selectedDelivery) return true;
    // If doorstep delivery is selected, check if address is selected
    if (selectedDelivery === 'doorstep_delivery' && !deliveryAddress) return true;
    return isSubmitting;
  }, [selectedDelivery, deliveryAddress, isSubmitting]);

  // Submit field value as draft
  const submitFieldDraft = useCallback(
    async (fieldValues: Record<string, any>) => {
      if (!productSlug) {
        console.warn('Missing productSlug for draft submission');
        return;
      }

      try {
        const payload = {
          is_draft: true,
          type: 'product_submission',
          product_slug: productSlug,
          field_values: fieldValues,
          step_identifier: 'checkout',
          step_number: 4,
          ...(submissionId && { submission_id: submissionId }),
        };

        console.log('📤 Submitting Step 4 field draft:', JSON.stringify(payload, null, 2));

        const response = await axiosFinancingPrivate.post('/submissions', payload);
        const responseData = response.data?.data || response.data;

        console.log('✅ Step 4 field draft submitted successfully:', responseData);
      } catch (error: any) {
        console.log('❌ Failed to submit Step 4 field draft:', error?.response?.data || error?.message);
      }
    },
    [productSlug, submissionId],
  );

  // Generate order details
  const orderNumber = useMemo(() => Math.floor(Math.random() * 1000000).toString(), []);
  const orderDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }, []);

  // Submit checkout data - Create order from cart
  const handleNext = useCallback(async () => {
    setIsSubmitting(true);

    if (!selectedDelivery) {
      // Show error or validation message
      setIsSubmitting(false);
      return;
    }

    // Check if selected lender has sufficient available limit
    const selectedProgram = programs.find(p => p.id === selectedPaymentMethod);
    if (selectedProgram && localTotalAmount > selectedProgram.available_limit) {
      Alert.alert(
        'Insufficient Limit',
        `The available limit of Rs ${selectedProgram.available_limit.toLocaleString()} for ${selectedProgram.lender_name} is less than the total order amount of Rs ${localTotalAmount.toLocaleString()}. Please select a different lender.`,
      );
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare checkout_detail_summary
      const checkoutDetailSummary = {
        bill_to: billTo,
        invoice_number: orderNumber,
        invoice_date: orderDate,
        due_date: orderDate, // Will be updated by checkout API later in authentication step
        price: localTotalAmount,
        currency_symbol: 'Rs',
      };

      // Prepare po_line_items
      const poLineItems = localCartItems.map((item, index) => ({
        selected_item_id: item.selected_item_id || item.id,
        item_number: index + 1,
        item_name: item.name,
        price: item.price,
        qty: `${item.quantity}${item.unit}`,
        total: item.price * item.quantity,
        currency_symbol: 'Rs',
      }));

      // Prepare checkout_total_summary
      const checkoutTotalSummary = {
        sub_total: localTotalAmount,
        total: localTotalAmount,
        balance_due: localTotalAmount,
        currency_symbol: 'Rs',
      };

      // Now submit to product submissions with the correct structure
      const selectedProgramForPayload = programs.find(p => p.id === selectedPaymentMethod);
      const fieldValues: any = {
        checkout_detail_summary: checkoutDetailSummary,
        po_line_items: poLineItems,
        checkout_total_summary: checkoutTotalSummary,
        delivery_option: selectedDelivery,
        payment_method: selectedPaymentMethod,
        selected_program_id: selectedProgramForPayload ? selectedProgramForPayload.id : null,
      };

      // Add delivery_address if doorstep delivery is selected
      if (selectedDelivery === 'doorstep_delivery' && deliveryAddress) {
        fieldValues.delivery_address = deliveryAddress;
      }

      const submissionPayload = {
        submission_id: submissionId,
        product_slug: productSlug,
        type: 'product_submission',
        step_identifier: 'checkout',
        step_number: 4,
        is_draft: false,
        field_values: fieldValues,
      };

      console.log('📤 Submitting Step 4 (Checkout):', JSON.stringify(submissionPayload, null, 2));

      const response = await axiosFinancingPrivate.post('/submissions', submissionPayload);
      const responseData = response.data?.data || response.data;

      console.log('✅ Step 4 submission successful:', responseData);

      // Get submission_id from response
      const newSubmissionId = responseData?.attributes?.submission_id || responseData?.submission_id || submissionId;

      // Determine payment context for harvest crop filtering
      const selectedProgram = programs.find(p => p.id === selectedPaymentMethod);
      const paymentType = selectedProgram ? 'transaction_program' : 'provider_credit';
      const harvestDetailIds = selectedProgram?.harvest_detail_ids || [];

      if (paymentType === 'transaction_program') {
        // Non-provider-credit: skip DynamicLoanApplication and go directly to OTP
        try {
          const phoneNumber = farmer?.attributes?.phone_number;
          if (!phoneNumber) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Phone number not found. Please contact support.' });
          } else {
            const otpPayload = { data: { attributes: { phone_number: phoneNumber, email: farmer?.attributes?.email, skip_count_check: true, flow: 'BUY_INPUT_OTP' } } };
            console.log('📤 Requesting OTP for:', phoneNumber);
            await axiosPublic.post('/users/request_otp', otpPayload);
          }
        } catch (err: any) {
          const otpError = err?.response?.data?.error || 'Failed to request OTP';
          Toast.show({ type: 'error', text1: 'Error', text2: otpError });
        }
        navigation.navigate('LoanRequestOTPVerification', {
          productSubmissionId: newSubmissionId,
          productSlug,
          otpFlow: 'BUY_INPUT_OTP',
        });
      } else {
        // Provider credit: go through the full DynamicLoanApplication flow
        navigation.navigate('DynamicLoanApplication', {
          slug: productSlug,
          submissionId: newSubmissionId,
          initialStepIndex: 4, // Step 5 index (0-based)
          paymentType,
          harvestDetailIds,
          fromCheckout: true,
        });
      }
    } catch (error: any) {
      console.log('❌ Failed to submit checkout:', error?.response?.data || error?.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedDelivery, selectedPaymentMethod, localCartItems, localTotalAmount, step, steps, productSlug, submissionId, providerId, billTo, orderNumber, orderDate, navigation, deliveryAddress, programs, farmer]);

  const handleBack = useCallback(() => {
    if (fromDashboard) {
      navigation.replace('CartSummary', {
        cartItems: localCartItems,
        totalAmount: localTotalAmount,
        step: steps?.find((s: any) => s.identifier === 'cart_summary'),
        steps,
        productSlug,
        submissionId,
        providerId,
        providerName,
        isOrderLocked,
        acceptsProviderCredit,
        providerCreditDisabledMessage,
        fromDashboard,
      });
      return;
    }

    navigation.navigate('CartSummary', {
      cartItems: localCartItems,
      totalAmount: localTotalAmount,
      step: steps?.find((s: any) => s.identifier === 'cart_summary'),
      steps,
      productSlug,
      submissionId,
      providerId,
      providerName,
      isOrderLocked,
      acceptsProviderCredit,
      providerCreditDisabledMessage,
      fromDashboard,
    });
  }, [fromDashboard, navigation, localCartItems, localTotalAmount, steps, productSlug, submissionId, providerId, providerName, isOrderLocked, acceptsProviderCredit, providerCreditDisabledMessage]);

  // Use a ref for the back handler so the BackHandler effect doesn't depend
  // on the handleBack identity (which changes when localCartItems/localTotalAmount change).
  const handleBackRef = useRef(handleBack);
  useEffect(() => {
    handleBackRef.current = handleBack;
  }, [handleBack]);

  // Fetch latest submission when screen focuses
  useFocusEffect(
    useCallback(() => {
      const fetchLatestSubmission = async () => {
        if (submissionId && productSlug) {
          try {
            console.log('🔄 Fetching latest submission data for:', submissionId);
            
            const response = await axiosFinancingPrivate.get(`/submissions/${submissionId}`, {
              params: { product_slug: productSlug }
            });
            const submissionData = response.data?.data || response.data;
            
            // Extract steps from submission (they're nested under product_configuration)
            const submissionSteps = submissionData?.attributes?.product_configuration?.steps || 
                                   submissionData?.product_configuration?.steps || 
                                   submissionData?.attributes?.steps || 
                                   submissionData?.steps || [];
            
            // Find the checkout step
            const checkoutStep = submissionSteps.find((s: any) => s.identifier === 'checkout');
            
            if (checkoutStep?.sections) {
              // Only restore user-controlled selections (delivery, payment) on first focus.
              // Subsequent focus events should not overwrite the user's in-session choices
              // because the draft save may not have completed yet, causing a stale read.
              if (!hasRestoredRef.current) {
                // Find delivery options section
                const deliverySection = checkoutStep.sections.find((s: any) => s.identifier === 'delivery_options');
                if (deliverySection?.fields) {
                  const deliveryField = deliverySection.fields.find((f: any) => f.field_key === 'delivery_option');
                  if (deliveryField?.value) {
                    console.log('✅ Restored delivery option from submission:', deliveryField.value);
                    setSelectedDelivery(deliveryField.value);
                  }
                  
                  // Restore delivery address if available
                  const deliveryAddressField = deliverySection.fields.find((f: any) => f.field_key === 'delivery_address');
                  if (deliveryAddressField?.value) {
                    console.log('✅ Restored delivery address from submission:', deliveryAddressField.value);
                    setDeliveryAddress(deliveryAddressField.value);
                  }
                }
                
                // Find payment section
                const paymentSection = checkoutStep.sections.find((s: any) => s.identifier === 'mode_of_payment');
                if (paymentSection?.fields) {
                  const paymentField = paymentSection.fields.find((f: any) => f.field_key === 'payment_method');
                  if (paymentField?.value) {
                    console.log('✅ Restored payment method from submission:', paymentField.value);
                    setSelectedPaymentMethod(paymentField.value);
                  }
                }

                hasRestoredRef.current = true;
              }
              
              // Find detail summary section to restore bill_to
              const detailSummarySection = checkoutStep.sections.find((s: any) => s.identifier === 'po_detail_summary');
              if (detailSummarySection?.fields) {
                const detailSummaryField = detailSummarySection.fields.find((f: any) => f.field_key === 'checkout_detail_summary');
                if (detailSummaryField?.value?.bill_to) {
                  console.log('✅ Restored bill_to from submission:', detailSummaryField.value.bill_to);
                  setBillTo(detailSummaryField.value.bill_to);
                }
              }

              // Restore line items from checkout step
              const lineItemsSec = checkoutStep.sections.find((s: any) => s.identifier === 'po_line_items');
              if (lineItemsSec?.fields) {
                const lineItemsField = lineItemsSec.fields.find((f: any) => f.field_key === 'po_line_items');
                if (lineItemsField?.value && Array.isArray(lineItemsField.value) && lineItemsField.value.length > 0) {
                  console.log('✅ Restored cart items from checkout step submission:', lineItemsField.value.length);
                  const mappedItems: CartItem[] = lineItemsField.value.map((item: any) => ({
                    id: item.selected_item_id || item.id || Math.random().toString(),
                    name: item.item_name || item.name || 'Unknown',
                    category: item.category || 'Other',
                    price: item.price || item.unit_price || 0,
                    unit: item.qty?.toString().replace(/[0-9.]/g, '').trim() || item.quantity_unit || 'units',
                    quantity: parseInt(item.qty) || item.quantity || 1,
                    selected_item_id: item.selected_item_id || item.id,
                  }));
                  setLocalCartItems(mappedItems);
                }
              }

              // Restore total from checkout step
              const totalSummarySec = checkoutStep.sections.find((s: any) => s.identifier === 'checkout_total_summary');
              if (totalSummarySec?.fields) {
                const totalField = totalSummarySec.fields.find((f: any) => f.field_key === 'checkout_total_summary');
                const totalValue = totalField?.value?.total || totalField?.value?.balance_due;
                if (totalValue && totalValue > 0) {
                  console.log('✅ Restored total from checkout step submission:', totalValue);
                  setLocalTotalAmount(totalValue);
                }
              }
            }

            // Fallback: restore cart items from step 3 (cart_summary) if checkout step had no line items
            const cartSummaryStep = submissionSteps.find((s: any) => s.identifier === 'cart_summary');
            if (cartSummaryStep?.sections) {
              const cartItemsSec = cartSummaryStep.sections.find((s: any) => s.identifier === 'cart_items');
              if (cartItemsSec?.fields) {
                const cartItemsField = cartItemsSec.fields.find((f: any) => f.field_key === 'cart_items');
                if (cartItemsField?.value && Array.isArray(cartItemsField.value) && cartItemsField.value.length > 0) {
                  // Only use fallback if checkout step didn't provide line items
                  setLocalCartItems(prev => {
                    if (prev.length > 0) return prev;
                    console.log('✅ Restored cart items from cart_summary step submission:', cartItemsField.value.length);
                    return cartItemsField.value.map((item: any) => ({
                      id: item.selected_item_id || item.id || Math.random().toString(),
                      name: item.item_name || 'Unknown',
                      category: item.category || 'Other',
                      price: item.unit_price || item.price || 0,
                      unit: item.quantity_unit || 'units',
                      quantity: item.quantity || 1,
                      selected_item_id: item.selected_item_id,
                    }));
                  });
                }
              }

              const cartDetailsSec = cartSummaryStep.sections.find((s: any) => s.identifier === 'cart_summary_details');
              if (cartDetailsSec?.fields) {
                const cartDetailsField = cartDetailsSec.fields.find((f: any) => f.field_key === 'cart_details');
                const totalVal = cartDetailsField?.value?.total_incl_tax || cartDetailsField?.value?.total;
                if (totalVal && totalVal > 0) {
                  setLocalTotalAmount(prev => {
                    if (prev > 0) return prev;
                    console.log('✅ Restored total from cart_summary step submission:', totalVal);
                    return totalVal;
                  });
                }
              }
            }
          } catch (error: any) {
            console.log('⚠️ Could not fetch latest submission:', error?.response?.data || error?.message);
          }
        }
      };

      fetchLatestSubmission();
    }, [submissionId, productSlug])
  );

  // Handle hardware back button (separate from data fetch to avoid loop)
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBackRef.current();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeftIcon color="#101010" />
        </TouchableOpacity>
        <UITypography variant="semiBold" style={styles.headerTitle}>
          {screenTitle}
        </UITypography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Invoice Card */}
        <View style={styles.invoiceCard}>
          {/* Invoice Info */}
          <View style={styles.invoiceInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{detailDisplayKeys.bill_to}</Text>
              <Text style={styles.infoValue}>{billTo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{detailDisplayKeys.invoice_number}</Text>
              <Text style={styles.infoValue}>{orderNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{detailDisplayKeys.invoice_date}</Text>
              <Text style={styles.infoValue}>{orderDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{detailDisplayKeys.price}</Text>
              <Text style={styles.infoValue}>Rs {localTotalAmount}</Text>
            </View>
          </View>

          {/* Items Table */}
          <View style={styles.itemsTable}>
            {/* Dark Gray Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colHash]}>#</Text>
              <Text style={[styles.tableHeaderText, styles.colItemsHeader]}>ITEMS</Text>
              <Text style={[styles.tableHeaderText, styles.colPriceHeader]}>PRICE</Text>
              <Text style={[styles.tableHeaderText, styles.colQtyHeader]}>QTY.</Text>
              <Text style={[styles.tableHeaderText, styles.colTotalHeader]}>TOTAL</Text>
            </View>

            {/* Item Rows */}
            {localCartItems.map((item, index) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colHash]}>{index + 1}</Text>
                <Text style={[styles.itemName, styles.colItemsHeader]}>{item.name || item.category}</Text>
                <Text style={[styles.tableCell, styles.colPriceHeader]}>Rs {item.price}</Text>
                <Text style={[styles.tableCell, styles.colQtyHeader]}>{item.quantity} {item.unit || 'units'}</Text>
                <Text style={[styles.tableCell, styles.colTotalHeader]}>Rs {item.price * item.quantity}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            {/* Totals - Right aligned */}
            <View style={styles.totalsSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{totalDisplayKeys.sub_total}</Text>
                <Text style={styles.totalValue}>Rs {subTotal}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{totalDisplayKeys.total}</Text>
                <Text style={styles.totalValue}>Rs {localTotalAmount}</Text>
              </View>
            </View>

            {/* Balance Due - Dark pill */}
            <View style={styles.balanceDueContainer}>
              <Text style={styles.balanceDueLabel}>{totalDisplayKeys.balance_due}</Text>
              <Text style={styles.balanceDueValue}>Rs {balanceDue}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Options */}
        <View style={styles.deliverySection}>
          <Text style={styles.deliverySectionTitle}>{deliverySection?.title || 'DELIVERY OPTIONS'}</Text>
          <TouchableOpacity
            style={styles.deliveryDropdown}
            onPress={() => setShowDeliveryDropdown(!showDeliveryDropdown)}
          >
            <Text style={[styles.deliveryText, !selectedDelivery && styles.deliveryPlaceholder]}>
              {selectedDelivery ? deliveryOptions.find(o => o.value === selectedDelivery)?.label : 'Select'}
            </Text>
            <ChevronDownIcon color="#444" />
          </TouchableOpacity>

          {showDeliveryDropdown && (
            <View style={styles.deliveryOptions}>
              {deliveryOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.deliveryOption}
                  onPress={() => {
                    setSelectedDelivery(option.value);
                    setShowDeliveryDropdown(false);
                    
                    // Submit draft when delivery option changes
                    const selectedProgramForDraft = programs.find(p => p.id === selectedPaymentMethod);
                    submitFieldDraft({
                      delivery_option: option.value,
                      payment_method: selectedPaymentMethod,
                      selected_program_id: selectedProgramForDraft ? selectedProgramForDraft.id : null,
                    });
                  }}
                >
                  <Text style={styles.deliveryOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Address Dropdown - Show only when doorstep delivery is selected */}
          {selectedDelivery === 'doorstep_delivery' && (
            <View style={{ marginTop: 16 }}>
              <Text style={[styles.deliverySectionTitle, { marginBottom: 8 }]}>DELIVERY ADDRESS</Text>
              <TouchableOpacity
                style={styles.deliveryDropdown}
                onPress={() => setShowAddressDropdown(!showAddressDropdown)}
              >
                <Text style={[styles.deliveryText, !deliveryAddress && styles.deliveryPlaceholder]}>
                  {deliveryAddress || 'Select Address'}
                </Text>
                <ChevronDownIcon color="#444" />
              </TouchableOpacity>

              {showAddressDropdown && (
                <View style={styles.deliveryOptions}>
                  {addressOptions.length > 0 ? (
                    addressOptions.map((address, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.deliveryOption}
                        onPress={() => {
                          setDeliveryAddress(address);
                          setShowAddressDropdown(false);
                          
                          // Submit draft when address changes
                          const selectedProgramForAddr = programs.find(p => p.id === selectedPaymentMethod);
                          submitFieldDraft({
                            delivery_option: selectedDelivery,
                            payment_method: selectedPaymentMethod,
                            delivery_address: address,
                            selected_program_id: selectedProgramForAddr ? selectedProgramForAddr.id : null,
                          });
                        }}
                      >
                        <Text style={styles.deliveryOptionText}>{address}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.deliveryOption}>
                      <Text style={styles.deliveryOptionText}>No address available</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Payment Options */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Payment Options</Text>
          {programsLoading ? (
            <ActivityIndicator color="#099453" style={{ marginVertical: 20 }} />
          ) : (
            <>
              {programs.map((program) => {
                const isSelected = selectedPaymentMethod === program.id;
                return (
                  <TouchableOpacity
                    key={program.id}
                    style={[
                      styles.paymentOptionRow,
                      isSelected && styles.paymentOptionRowSelected,
                    ]}
                    onPress={() => {
                      setSelectedPaymentMethod(program.id);
                      submitFieldDraft({
                        delivery_option: selectedDelivery,
                        payment_method: program.id,
                        selected_program_id: program.id,
                      });
                    }}
                  >
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.paymentTextContainer}>
                      <Text style={styles.paymentLenderName}>
                        {program.lender_name}
                      </Text>
                      <Text style={styles.paymentLenderSubtitle}>
                        {`Available Limit: Rs ${program.available_limit.toLocaleString()}`}
                      </Text>
                    </View>
                    <View style={styles.paymentLenderAvatar}>
                      <Text style={styles.paymentLenderAvatarText}>
                        {getNameInitials(program.lender_name)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Provider Credit */}
              {(() => {
                const isSelected = selectedPaymentMethod === 'provider_credit';
                const isProviderCreditDisabled = acceptsProviderCredit === false;
                const hasNoBankCreditLine = programs.length === 0;
                const isGreyedOut = isProviderCreditDisabled;
                return (
                  <TouchableOpacity
                    style={[
                      styles.paymentOptionRow,
                      isSelected && styles.paymentOptionRowSelected,
                      isGreyedOut && styles.paymentOptionCardDisabled,
                    ]}
                    onPress={() => {
                      if (isGreyedOut) {
                        const messages: string[] = [];
                        if (isProviderCreditDisabled) {
                          messages.push('The selected provider does not accept provider credit as a payment method.');
                        }
                        if (hasNoBankCreditLine) {
                          messages.push('The farmer does not have an approved bank credit line.');
                        }
                        Alert.alert(
                          'Provider Credit Unavailable',
                          messages.join('\n\n') || 'Provider credit is not available for this transaction.',
                        );
                        return;
                      }
                      setShowProviderCreditModal(true);
                    }}
                  >
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.paymentTextContainer}>
                      <Text style={[styles.paymentLenderName, isGreyedOut && { color: '#999' }]}>
                        Provider Credit
                      </Text>
                      <Text style={styles.paymentLenderSubtitle}>
                        {isProviderCreditDisabled && providerCreditDisabledMessage
                          ? providerCreditDisabledMessage
                          : 'Credit Limit: –'}
                      </Text>
                    </View>
                    <View style={styles.paymentLenderAvatar}>
                      <Text style={styles.paymentLenderAvatarText}>
                        {getNameInitials('Provider Credit')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })()}
            </>
          )}
        </View>
        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <UIContainedButton 
            key={`checkout-btn-${isButtonDisabled}`}
            onPress={handleNext}
            disabled={isButtonDisabled}
          >
            {isSubmitting ? 'SUBMITTING...' : 'NEXT'}
          </UIContainedButton>
        </View>
      </ScrollView>

      {/* Provider Credit Modal */}
      <UICenterModal
        visible={showProviderCreditModal}
        onRequestClose={() => setShowProviderCreditModal(false)}
        backdropClose
      >
        <View style={modalStyles.card}>
          <UIIconButton style={modalStyles.closeBtn} onPress={() => setShowProviderCreditModal(false)}>
            <View style={modalStyles.closeCircle}>
              <CrossIcon size={10} />
            </View>
          </UIIconButton>

          <UITypography variant="semiBold" style={modalStyles.title}>
            Provider Credit Selected
          </UITypography>
          <UITypography variant="regular" style={modalStyles.body}>
            The selected provider requires a few additional details before you can proceed.
          </UITypography>

          <View style={modalStyles.actions}>
            <Pressable
              onPress={() => setShowProviderCreditModal(false)}
              style={modalStyles.changePaymentTouchable}
            >
              <UITypography variant="medium" style={modalStyles.changePaymentText}>
                Change payment method
              </UITypography>
            </Pressable>
            <UIContainedButton
              size="medium"
              onPress={() => {
                setSelectedPaymentMethod('provider_credit');
                setShowProviderCreditModal(false);
                submitFieldDraft({
                  delivery_option: selectedDelivery,
                  payment_method: 'provider_credit',
                  selected_program_id: null,
                });
              }}
              style={modalStyles.proceedBtn}
            >
              Proceed
            </UIContainedButton>
          </View>
        </View>
      </UICenterModal>

    </SafeAreaView>
  );
}
