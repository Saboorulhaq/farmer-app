import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Modal,
  ActivityIndicator,
  Image,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { styles } from './InputPurchaseScreen.styled';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import ChevronDownIcon from '@/components/icons/ChevronDownIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import ShoppingCartIcon from '@/components/icons/ShoppingCartIcon';
import DeleteIcon from '@/components/icons/DeleteIcon';
import Svg, { Line } from 'react-native-svg';
import { UIContainedButton, UITypography } from '@/components/ui';
import { axiosFinancingPrivate } from '@/config/axios';
import type { FSAStep } from '@/store/useProductsStore';
import { Toast } from 'toastify-react-native';

function CloseIcon({ size = 14, color = '#333' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Line x1="1" y1="1" x2="13" y2="13" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1="13" y1="1" x2="1" y2="13" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

interface InputItem {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity?: number;
  selected_item_id?: string;
  cart_item_id?: string;
}

interface CatalogItem {
  id: string;
  type?: string;
  item_name?: string;
  price?: number;
  measuring_unit?: string;
  unit?: string;
  category?: string;
  categoryKey?: string;
  attributes?: {
    item_name?: string;
    price?: number;
    measuring_unit?: string;
    unit?: string;
    category?: string;
    description?: string;
    image_url?: string;
    is_active?: boolean;
    display_order?: number;
  };
}

interface RouteParams {
  InputPurchase: {
    step?: FSAStep;
    steps?: FSAStep[];
    productSlug?: string;
    submissionId?: string | null;
    providerId?: string;
    providerName?: string;
    isOrderLocked?: boolean;
    updatedCartItems?: InputItem[];
    acceptsProviderCredit?: boolean;
    providerCreditDisabledMessage?: string;
  };
}

export default function InputPurchaseScreen() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 390;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const { 
    step, 
    steps, 
    productSlug = 'buy-inputs', 
    submissionId, 
    providerId: routeProviderId, 
    providerName: routeProviderName,
    isOrderLocked = false,
    updatedCartItems,
    acceptsProviderCredit,
    providerCreditDisabledMessage,
  } = (route.params as RouteParams['InputPurchase']) || {};
  
  // Extract providerId from step data if not provided via route params
  const [providerId, setProviderId] = useState<string | undefined>(routeProviderId);
  const [providerName, setProviderName] = useState<string | undefined>(routeProviderName);

  // Sync cart items from navigation params (e.g. returning from CartSummary after deletion)
  useEffect(() => {
    if (updatedCartItems && Array.isArray(updatedCartItems)) {
      console.log('🔄 Syncing cart items from navigation params:', updatedCartItems.length);
      setCartItems(updatedCartItems);
    }
  }, [updatedCartItems]);

  // Extract provider info from step 1 submission data if editing
  useEffect(() => {
    if (!providerId && steps && Array.isArray(steps)) {
      const step1 = steps.find(s => s.identifier === 'government_verified_provider');
      if (step1?.sections && Array.isArray(step1.sections)) {
        const section = step1.sections[0];
        if (section?.fields && Array.isArray(section.fields)) {
          const providerIdField = section.fields.find(
            f => f.field_key === 'provider_id' || f.field_key === 'selected_provider_id'
          );
          const providerNameField = section.fields.find(
            f => f.field_key === 'provider_name'
          );
          
          if (providerIdField?.value) {
            console.log('📝 Extracted providerId from step 1:', providerIdField.value);
            setProviderId(providerIdField.value);
          }
          if (providerNameField?.value) {
            setProviderName(providerNameField.value);
          }
        }
      }
    }
  }, [steps, providerId]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedInputType, setSelectedInputType] = useState<string>('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showInputTypeDropdown, setShowInputTypeDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<InputItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [isAddingAnotherInput, setIsAddingAnotherInput] = useState(false);
  const hasInitializedCart = useRef(false);

  // Clear form fields when modal opens
  useEffect(() => {
    if (showInputTypeDropdown) {
      setSearchQuery('');
      setSelectedInputType('');
      // Don't clear selectedCategory - we need it to filter items in the dropdown!
    }
  }, [showInputTypeDropdown]);

  // Get the section configuration from the step
  const section = useMemo(() => {
    if (!step?.sections?.length) return null;
    return step.sections.find(s => s.identifier === 'purchase_details') || step.sections[0];
  }, [step]);

  // Get API config from section
  const apiConfig = useMemo(() => {
    if (section?.data_source === 'external_api' && section.external_api_config) {
      return section.external_api_config;
    }
    return null;
  }, [section]);

  // Get screen title from step config
  const screenTitle = step?.title || 'Input Purchase';

  // Submit field value as draft
  const submitFieldDraft = useCallback(
    async (fieldValues: Record<string, any>) => {
      if (!productSlug) {
        console.warn('Missing productSlug for draft submission');
        return;
      }

      try {
        setIsSubmittingDraft(true);

        const payload = {
          is_draft: true,
          type: 'product_submission',
          product_slug: productSlug,
          field_values: fieldValues,
          step_identifier: 'input_purchase_details',
          step_number: 2,
          ...(submissionId && { submission_id: submissionId }),
        };

        console.log('📤 Submitting Step 2 field draft:', JSON.stringify(payload, null, 2));

        const response = await axiosFinancingPrivate.post('/submissions', payload);
        const responseData = response.data?.data || response.data;

        console.log('✅ Step 2 field draft submitted successfully:', responseData);
      } catch (error: any) {
        console.log('❌ Failed to submit Step 2 field draft:', error?.response?.data || error?.message);
      } finally {
        setIsSubmittingDraft(false);
      }
    },
    [productSlug, submissionId],
  );

  // Populate cart items from submission data when editing
  useEffect(() => {
    const section = step?.sections?.[0];
    if (section?.fields && Array.isArray(section.fields)) {
      const categoryField = section.fields.find(f => f.field_key === 'inputs_required');
      const varietyField = section.fields.find(f => f.field_key === 'select_variety');
      const itemIdField = section.fields.find(f => f.field_key === 'selected_item_id');
      const priceField = section.fields.find(f => f.field_key === 'unit_price');
      const quantityField = section.fields.find(f => f.field_key === 'quantity');
      const unitField = section.fields.find(f => f.field_key === 'quantity_unit');

      // If we have saved values, populate the form
      if (categoryField?.value) {
        console.log('📝 Pre-populating Step 2 from submission:', {
          category: categoryField.value,
          variety: varietyField?.value,
          itemId: itemIdField?.value,
          price: priceField?.value,
          quantity: quantityField?.value,
          unit: unitField?.value,
        });
        
        setSelectedCategory(categoryField.value);
        hasInitializedCart.current = true;
        
        if (varietyField?.value && itemIdField?.value) {
          const existingItem: InputItem = {
            id: itemIdField.value,
            name: varietyField.value,
            category: categoryField.value,
            price: priceField?.value || 0,
            unit: unitField?.value || 'units',
            quantity: quantityField?.value || 1,
            selected_item_id: itemIdField.value,
          };
          setCartItems([existingItem]);
          setSelectedInputType(varietyField.value);
        }
      }
    }
  }, [step]);

  // Fetch input purchase data from submission API when step data is empty but submissionId is available
  useFocusEffect(
    useCallback(() => {
      const fetchFromSubmission = async () => {
        if (!submissionId || !productSlug) return;
        // Skip if we already have cart items populated or if cart was already initialized (e.g. after deletion)
        if (cartItems.length > 0 || hasInitializedCart.current) return;

        try {
          console.log('🔄 InputPurchase: Fetching submission data for:', submissionId);
          const response = await axiosFinancingPrivate.get(`/submissions/${submissionId}`, {
            params: { product_slug: productSlug }
          });
          const submissionData = response.data?.data || response.data;
          const submissionSteps = submissionData?.attributes?.product_configuration?.steps ||
                                 submissionData?.product_configuration?.steps || [];

          // Extract provider info from step 1 if not already set
          if (!providerId) {
            const step1 = submissionSteps.find((s: any) => s.identifier === 'government_verified_provider');
            if (step1?.sections) {
              const provSection = step1.sections[0];
              const provIdField = provSection?.fields?.find((f: any) => f.field_key === 'provider_id' || f.field_key === 'selected_provider_id');
              const provNameField = provSection?.fields?.find((f: any) => f.field_key === 'provider_name');
              if (provIdField?.value) {
                console.log('✅ InputPurchase: Restored providerId from submission:', provIdField.value);
                setProviderId(provIdField.value);
              }
              if (provNameField?.value) {
                setProviderName(provNameField.value);
              }
            }
          }

          // Extract input purchase data from step 2
          const inputStep = submissionSteps.find((s: any) => s.identifier === 'input_purchase_details');
          if (inputStep?.sections) {
            const section = inputStep.sections[0];
            if (section?.fields) {
              const categoryField = section.fields.find((f: any) => f.field_key === 'inputs_required');
              const varietyField = section.fields.find((f: any) => f.field_key === 'select_variety');
              const itemIdField = section.fields.find((f: any) => f.field_key === 'selected_item_id');
              const priceField = section.fields.find((f: any) => f.field_key === 'unit_price');
              const quantityField = section.fields.find((f: any) => f.field_key === 'quantity');
              const unitField = section.fields.find((f: any) => f.field_key === 'quantity_unit');

              if (categoryField?.value) {
                console.log('✅ InputPurchase: Restored data from submission');
                setSelectedCategory(categoryField.value);
                hasInitializedCart.current = true;

                if (varietyField?.value && itemIdField?.value) {
                  const existingItem: InputItem = {
                    id: itemIdField.value,
                    name: varietyField.value,
                    category: categoryField.value,
                    price: priceField?.value || 0,
                    unit: unitField?.value || 'units',
                    quantity: quantityField?.value || 1,
                    selected_item_id: itemIdField.value,
                  };
                  setCartItems([existingItem]);
                  setSelectedInputType(varietyField.value);
                }
              }
            }
          }
        } catch (error: any) {
          console.log('⚠️ InputPurchase: Could not fetch submission:', error?.response?.data || error?.message);
        }
      };

      fetchFromSubmission();
    }, [submissionId, productSlug, cartItems.length, providerId])
  );

  // Fetch catalog items from API
  useEffect(() => {
    const fetchCatalogItems = async () => {
      if (!apiConfig?.endpoint || !providerId) {
        console.log('No API config or provider ID, using static data');
        return;
      }

      try {
        setLoading(true);
        
        // Replace :provider_id in endpoint with actual provider ID
        let endpoint = apiConfig.endpoint.replace(':provider_id', providerId);
        
        // Strip /api/v1 prefix if present
        if (endpoint.startsWith('/api/v1/')) {
          endpoint = endpoint.replace('/api/v1/', '/');
        }

        console.log('📤 Fetching catalog items from:', endpoint);
        
        const response = await axiosFinancingPrivate.get(endpoint);
        const responseData = apiConfig.response_key 
          ? response.data?.[apiConfig.response_key] 
          : response.data;

        console.log('✅ Catalog items response:', responseData);

        // Handle both flat array and categorized object responses
        if (Array.isArray(responseData)) {
          // Flat array response
          setCatalogItems(responseData);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(responseData.map((item: CatalogItem) => item.type || item.category || 'Other'))];
          setCategories(uniqueCategories.filter(Boolean) as string[]);
        } else if (typeof responseData === 'object' && responseData !== null) {
          // Categorized object response (e.g., {seeds: [...], fertilizers: [...], equipment: [...]})
          const allItems: any[] = [];
          const categoryNames: string[] = [];
          
          Object.entries(responseData).forEach(([categoryKey, items]) => {
            if (Array.isArray(items)) {
              categoryNames.push(categoryKey);
              // Flatten items and add category from the key
              items.forEach((item: any) => {
                allItems.push({
                  ...item,
                  // Store the category key for reference
                  categoryKey,
                });
              });
            }
          });
          
          setCatalogItems(allItems);
          setCategories(categoryNames);
        }
      } catch (error: any) {
        console.log('❌ Failed to fetch catalog items:', error?.response?.data || error?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogItems();
  }, [apiConfig, providerId]);

  // Convert catalog items to InputItem format
  const availableItems = useMemo((): InputItem[] => {
    if (catalogItems.length > 0) {
      return catalogItems.map((item) => {
        // Handle JSON:API format (attributes nested)
        const attrs = item.attributes || item;
        const itemType = item.type || item.categoryKey || attrs.category || 'Other';
        
        return {
          id: item.id,
          name: attrs.item_name || item.item_name || 'Unknown',
          category: itemType,
          price: attrs.price || item.price || 0,
          unit: attrs.measuring_unit || item.measuring_unit || attrs.unit || item.unit || 'unit',
          selected_item_id: item.id,
        };
      });
    }
    // Fallback to static data
    return [
      { id: '1', name: 'Urea Fertilizer', category: 'Fertilizer', price: 1200, unit: '50 kg bag' },
      { id: '2', name: 'Urea Fertilizer_2', category: 'Fertilizer', price: 300, unit: '1 kg bag' },
      { id: '3', name: 'Urea Fertilizer_3', category: 'Fertilizer', price: 300, unit: '1 kg bag' },
    ];
  }, [catalogItems]);

  // Get available categories
  const availableCategories = useMemo(() => {
    if (categories.length > 0) {
      // Capitalize first letter of each category
      return categories.map(cat => 
        cat.charAt(0).toUpperCase() + cat.slice(1)
      );
    }
    return ['Seeds', 'Fertilizer', 'Hybrid Maize Seeds', 'Other'];
  }, [categories]);

  // Filter items based on search query and selected category
  const filteredItems = useMemo(() => {
    let items = availableItems;
    
    // Filter by category if selected
    if (selectedCategory) {
      items = items.filter(item => 
        item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return items;
  }, [availableItems, selectedCategory, searchQuery]);

  const closeInputTypeModal = () => {
    setShowInputTypeDropdown(false);
    setSearchQuery('');
    setSelectedInputType('');
  };

  const handleAddToCart = async (item: InputItem) => {
    try {
      // Check if item already exists in cart (from submission or previously added)
      const existingItem = cartItems.find((i) => i.id === item.id || i.selected_item_id === item.id);
      if (existingItem) {
        // Update quantity of existing item
        setCartItems(
          cartItems.map((i) =>
            (i.id === item.id || i.selected_item_id === item.id) ? { ...i, quantity: (i.quantity || 1) + 1 } : i
          )
        );
        setShowInputTypeDropdown(false);
        return;
      }

      // Add to cart via API
      const payload = {
        catalogue_item_id: item.id,
        quantity: 1,
        quantity_unit: item.unit,
        product_submission_id: submissionId || null,
        notes: null,
      };

      console.log('📤 Adding item to cart:', payload);
      const response = await axiosFinancingPrivate.post('/cart_items', payload);
      console.log('✅ Item added to cart:', response.data);

      // Include cart_item_id from response for deletion later
      const cartItemId = response.data?.data?.id || response.data?.id;
      setCartItems([...cartItems, { ...item, quantity: 1, cart_item_id: cartItemId }]);
      hasInitializedCart.current = true;
      
      // Close the dropdown modal
      setShowInputTypeDropdown(false);
      
      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Input added to cart successfully.',
      });
      
      // Reset form for new input (clear category, input type and search)
      setSelectedCategory('');
      setSelectedInputType('');
      setSearchQuery('');
      setIsAddingAnotherInput(false);
      
      // Submit draft after adding to cart
      submitFieldDraft({
        inputs_required: item.category,
        select_variety: item.name,
        selected_item_id: item.id,
        unit_price: item.price,
        quantity: 1,
        quantity_unit: item.unit,
      });
    } catch (error: any) {
      console.log('❌ Failed to add item to cart:', error?.response?.data || error?.message);
      // Fallback to local state update
      const existingItem = cartItems.find((i) => i.id === item.id);
      if (existingItem) {
        setCartItems(
          cartItems.map((i) =>
            i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
          )
        );
      } else {
        setCartItems([...cartItems, { ...item, quantity: 1 }]);
        
        // Show success toast even on fallback
        Toast.show({
          type: 'success',
          text1: 'Input added to cart successfully.',
        });
        
        // Reset form for new input
        setSelectedCategory('');
        setSelectedInputType('');
        setSearchQuery('');
        setIsAddingAnotherInput(false);
      }
      
      // Close the dropdown modal
      setShowInputTypeDropdown(false);
    }
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    const updatedItems = cartItems.map((item) => {
      if (item.id === itemId) {
        const newQuantity = (item.quantity || 1) + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => (item.quantity || 1) > 0);
    
    setCartItems(updatedItems);
    
    // Find the updated item and submit draft
    const updatedItem = updatedItems.find(item => item.id === itemId);
    if (updatedItem) {
      submitFieldDraft({
        inputs_required: updatedItem.category,
        select_variety: updatedItem.name,
        selected_item_id: updatedItem.selected_item_id || updatedItem.id,
        unit_price: updatedItem.price,
        quantity: updatedItem.quantity,
        quantity_unit: updatedItem.unit,
      });
    }
  };

  const handleDeleteItem = async (itemId: string, cartItemId?: string) => {
    try {
      if (cartItemId) {
        console.log('📤 Deleting cart item:', cartItemId);
        await axiosFinancingPrivate.delete(`/cart_items/${cartItemId}`);
        console.log('✅ Cart item deleted successfully');
      }
      
      // Remove from local state
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error: any) {
      console.log('❌ Failed to delete cart item:', error?.response?.data || error?.message);
      // Still remove from local state even if API fails
      setCartItems(cartItems.filter(item => item.id !== itemId));
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    // Find the item to get its cart_item_id
    const item = cartItems.find(i => i.id === itemId);
    
    try {
      if (item?.cart_item_id) {
        console.log('📤 Deleting cart item:', item.cart_item_id);
        await axiosFinancingPrivate.delete(`/cart_items/${item.cart_item_id}`);
        console.log('✅ Cart item deleted successfully');
      }
    } catch (error: any) {
      console.log('❌ Failed to delete cart item:', error?.response?.data || error?.message);
      // Continue with local state update even if API fails
    }
    
    // Update local state
    setCartItems(cartItems.filter((item) => item.id !== itemId));
    if (cartItems.length === 1) {
      setSelectedInputType('');
    }
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleViewCart = async () => {
    // If order is locked, just navigate to the next screen without submitting
    if (isOrderLocked) {
      console.log('🔒 Order locked, skipping submission and navigating to next step');
      navigation.navigate('CartSummary', { 
        cartItems, 
        totalAmount,
        step: steps?.find(s => s.identifier === 'cart_summary'),
        steps,
        productSlug,
        submissionId,
        providerId,
        providerName,
        isOrderLocked,
        acceptsProviderCredit,
        providerCreditDisabledMessage,
      });
      return;
    }

    // Submit step 2 to API before navigating
    try {
      // Get the first cart item for field_values (or aggregate all items)
      const firstItem = cartItems[0];
      
      const payload = {
        submission_id: submissionId,
        is_draft: false,
        step_identifier: 'input_purchase_details',
        step_number: 2,
        type: 'product_submission',
        product_slug: productSlug,
        field_values: {
          inputs_required: firstItem?.category || selectedCategory,
          select_variety: firstItem?.name || selectedInputType,
          selected_item_id: firstItem?.selected_item_id || firstItem?.id,
          unit_price: firstItem?.price || 0,
          quantity: firstItem?.quantity || 1,
          quantity_unit: firstItem?.unit || 'bags',
        },
      };

      console.log('📤 Submitting Step 2 (Input Purchase Details):', payload);
      
      const response = await axiosFinancingPrivate.post('/submissions', payload);
      const responseData = response.data?.data || response.data;
      console.log('✅ Step 2 submission successful:', responseData);

      // Extract submission_id from response (check attributes first, then top level)
      const updatedSubmissionId = responseData?.attributes?.submission_id || responseData?.submission_id || submissionId;

      // Navigate to cart summary
      navigation.navigate('CartSummary', { 
        cartItems, 
        totalAmount,
        step: steps?.find(s => s.identifier === 'cart_summary'),
        steps,
        productSlug,
        submissionId: updatedSubmissionId,
        providerId,
        providerName,
        isOrderLocked,
        acceptsProviderCredit,
        providerCreditDisabledMessage,
      });
    } catch (error: any) {
      console.log('❌ Step 2 submission failed:', error);
      // Navigate anyway to not block the flow
      navigation.navigate('CartSummary', { 
        acceptsProviderCredit,
        providerCreditDisabledMessage,
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isOrderLocked) {
          navigation.navigate('Main');
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [isOrderLocked, navigation])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (isOrderLocked) {
              navigation.navigate('Main');
            } else {
              navigation.goBack();
            }
          }}
        >
          <ChevronLeftIcon color="#101010" />
        </TouchableOpacity>
        <UITypography variant="semiBold" style={styles.headerTitle}>
          {screenTitle}
        </UITypography>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#099453" />
          <UITypography variant="medium" style={{ marginTop: 12, color: '#666' }}>
            Loading catalog...
          </UITypography>
        </View>
      ) : (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <UITypography variant="medium" style={styles.subtitle}>
          Select required inputs to continue
        </UITypography>

        {/* Fields without card when no items added */}
        {cartItems.length === 0 ? (
          <View style={styles.fieldsContainer}>
            {/* Select Input Category */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Select Input Category <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.dropdown, isOrderLocked && { opacity: 0.7 }]}
                onPress={() => !isOrderLocked && setShowCategoryDropdown(true)}
                disabled={isOrderLocked}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !selectedCategory && styles.dropdownPlaceholder,
                  ]}
                >
                  {selectedCategory || 'Please select'}
                </Text>
                {!isOrderLocked && <ChevronDownIcon color="#444" />}
              </TouchableOpacity>
            </View>

            {/* Select Input Type (shows after category selected) */}
            {selectedCategory && (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Select Input Type <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.dropdown, isOrderLocked && { opacity: 0.7 }]}
                  onPress={() => {
                    if (!isOrderLocked) {
                      // Don't clear selectedCategory - we need it to filter items!
                      setSearchQuery('');
                      setSelectedInputType('');
                      setShowInputTypeDropdown(true);
                    }
                  }}
                  disabled={isOrderLocked}
                >
                  <Text style={styles.dropdownPlaceholder}>Please select</Text>
                  {!isOrderLocked && <ChevronDownIcon color="#444" />}
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* Main Card Container - shows when items are added */
          <View style={styles.mainCard}>
            {/* Added Items Display Inside Card - Show first */}
            <View style={styles.fieldContainerInCard}>
              <Text style={styles.label}>
                Cart Items
              </Text>
              
              {/* Added Items Display */}
              {cartItems.map((item, index) => (
                <View key={item.id} style={[styles.addedItemSection, index > 0 && { marginTop: 24 }]}>
                  <View style={styles.addedItemHeader}>
                    <Text style={styles.addedItemName}>{item.name}</Text>
                    {!isOrderLocked && (
                      <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                        <DeleteIcon width={16} height={18} color="#E53E3E" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.addedItemDetails}>
                    <Text style={styles.addedItemPrice}>Rs {item.price.toLocaleString()}</Text>
                    <Text style={styles.addedItemUnit}>1 {item.unit}</Text>
                  </View>
                  <View style={styles.quantityRow}>
                    <View style={styles.quantityControl}>
                      {!isOrderLocked && (
                        <TouchableOpacity
                          style={[styles.quantityButton, styles.quantityButtonLeft]}
                          onPress={() => handleQuantityChange(item.id, -1)}
                        >
                          <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                      )}
                      <View style={[styles.quantityDisplay, isOrderLocked && { width: '100%', alignItems: 'center' }]}>
                        <Text style={styles.quantityText}>{item.quantity || 1} {isOrderLocked && (item.unit || 'units')}</Text>
                      </View>
                      {!isOrderLocked && (
                        <TouchableOpacity
                          style={[styles.quantityButton, styles.quantityButtonRight]}
                          onPress={() => handleQuantityChange(item.id, 1)}
                        >
                          <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Total Section Inside Card */}
            <View style={styles.cardDivider} />
            <View style={styles.cardTotalSection}>
              <Image 
                source={require('@/assets/images/shopping-basket.png')}
                style={{ width: 20, height: 20, tintColor: '#000000' }}
                resizeMode="contain"
              />
              <Text style={styles.cardTotalAmount}>Rs {totalAmount.toLocaleString()}</Text>
              <View style={styles.cardTotalDivider} />
              <Text style={styles.cardTotalItems}>{totalItems} Item{totalItems !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        )}

        {/* Add Another Input Section - Outside the card */}
        {cartItems.length > 0 && !isOrderLocked && (
          <>
            {/* Show "Add Another Input" button when not adding */}
            {!isAddingAnotherInput && (
              <TouchableOpacity
                style={styles.addAnotherButton}
                onPress={() => {
                  setSelectedCategory('');
                  setSearchQuery('');
                  setSelectedInputType('');
                  setIsAddingAnotherInput(true);
                }}
              >
                <View style={styles.addAnotherIcon}>
                  <Text style={styles.addAnotherIconText}>+</Text>
                </View>
                <Text style={styles.addAnotherText}>Add Another Input</Text>
              </TouchableOpacity>
            )}

            {/* Show category and input type fields at bottom when adding another input */}
            {isAddingAnotherInput && (
              <View style={[styles.fieldsContainer, { marginTop: 24 }]}>
                {/* Select Input Category */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>
                    Select Input Category <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowCategoryDropdown(true)}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        !selectedCategory && styles.dropdownPlaceholder,
                      ]}
                    >
                      {selectedCategory || 'Please select'}
                    </Text>
                    <ChevronDownIcon color="#444" />
                  </TouchableOpacity>
                </View>

                {/* Select Input Type (shows after category selected) */}
                {selectedCategory && (
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>
                      Select Input Type <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.dropdown}
                      onPress={() => {
                        setSearchQuery('');
                        setSelectedInputType('');
                        setShowInputTypeDropdown(true);
                      }}
                    >
                      <Text style={styles.dropdownPlaceholder}>Please select</Text>
                      <ChevronDownIcon color="#444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
      )}

      {/* Category Dropdown Modal */}
      <Modal
        visible={showCategoryDropdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.modalPlaceholder}>Please select</Text>
            {availableCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedCategory(category);
                  setShowCategoryDropdown(false);
                  setSelectedInputType('');
                }}
              >
                <Text style={styles.dropdownItemText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Input Type Dropdown Modal */}
      <Modal
        visible={showInputTypeDropdown}
        transparent
        animationType="slide"
        onRequestClose={closeInputTypeModal}
      >
        <View style={styles.inputTypeModalContainer}>
          <View style={styles.inputTypeModal}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeInputTypeModal}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close input type modal"
            >
              <CloseIcon size={14} color="#333" />
            </TouchableOpacity>

            <View style={styles.searchContainer}>
              <SearchIcon color="#bcbcbc" />
              <TextInput
                key={`search-${showInputTypeDropdown}`}
                style={styles.searchInput}
                placeholder="Search Input"
                placeholderTextColor="#bcbcbc"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={false}
              />
            </View>

            <ScrollView style={styles.itemsList}>
              {filteredItems.map((item, index) => (
                <View key={item.id}>
                  <View style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemCategory}>{item.category}</Text>
                      <Text style={styles.itemUnit}>1 {item.unit}</Text>
                    </View>
                    <View style={styles.itemPricing}>
                      <Text style={styles.itemPrice}>Rs {item.price}</Text>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddToCart(item)}
                      >
                        <Text style={styles.addButtonText}>+ Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {index < filteredItems.length - 1 && <View style={styles.itemDivider} />}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Cart Bar */}
      <View style={[styles.bottomBar, !isSmallScreen && styles.bottomBarRow]}>
        <View style={[styles.cartInfo, !isSmallScreen && styles.cartInfoRow]}>
          <Image 
            source={require('@/assets/images/shopping-basket.png')}
            style={{ width: 28, height: 28, tintColor: '#099453' }}
            resizeMode="contain"
          />
          <Text style={styles.cartAmount}>Rs {totalAmount.toLocaleString()}</Text>
          <View style={styles.dividerVertical} />
          <Text style={styles.cartItemCount} numberOfLines={1}>{totalItems} Item{totalItems !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={[styles.viewCartButton, !isSmallScreen && styles.viewCartButtonRow, totalItems === 0 && styles.viewCartButtonDisabled]}
          onPress={handleViewCart}
          disabled={totalItems === 0}
        >
          <Text style={[styles.viewCartText, totalItems === 0 && styles.viewCartTextDisabled]}>
            {isOrderLocked ? 'CONTINUE' : 'View Cart & Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
