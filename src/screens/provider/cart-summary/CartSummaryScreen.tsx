import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  BackHandler,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { styles } from './CartSummaryScreen.styled';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import { UIContainedButton, UITypography } from '@/components/ui';
import { axiosFinancingPrivate } from '@/config/axios';
import type { FSAStep } from '@/store/useProductsStore';

interface CartItem {
  id: string;
  name: string;
  item_name?: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  quantity_unit?: string;
  selected_item_id?: string;
  cart_item_id?: string;
  currency_symbol?: string;
  provider_id?: string;
  provider_name?: string;
}

interface CartSummary {
  item_count: number;
  invoice_discount: number;
  total: number;
  total_incl_tax: number;
}

interface RouteParams {
  CartSummary: {
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

export default function CartSummaryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { 
    cartItems = [], 
    totalAmount = 0,
    step,
    steps,
    productSlug = 'buy-inputs',
    submissionId,
    providerId,
    providerName,
    isOrderLocked = false,
    fromDashboard = false,
    acceptsProviderCredit,
    providerCreditDisabledMessage,
  } = (route.params as RouteParams['CartSummary']) || {};

  const [loading, setLoading] = useState(false);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [localCartItems, setLocalCartItems] = useState<CartItem[]>(cartItems);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<CartItem | null>(null);

  // Fetch cart items and summary from API on mount
  useEffect(() => {
    const fetchCartData = async () => {
      // First, check if we have cart items from submission (editing mode)
      const cartItemsSection = step?.sections?.find(s => s.identifier === 'cart_items');
      const detailsSection = step?.sections?.find(s => s.identifier === 'cart_summary_details');
      
      let hasSubmissionData = false;
      let hasSummaryData = false;
      
      if (cartItemsSection?.fields && Array.isArray(cartItemsSection.fields)) {
        const cartItemsField = cartItemsSection.fields.find(f => f.field_key === 'cart_items');
        if (cartItemsField?.value && Array.isArray(cartItemsField.value) && cartItemsField.value.length > 0) {
          console.log('📝 Pre-populating Step 3 cart items from submission:', cartItemsField.value);
          
          // Map submission cart items to CartItem format
          const mappedItems: CartItem[] = cartItemsField.value.map((item: any) => ({
            id: item.selected_item_id || item.id || Math.random().toString(),
            cart_item_id: item.cart_item_id || item.id,
            name: item.item_name || item.name || 'Unknown',
            category: item.category || 'Other',
            price: item.unit_price || item.price || 0,
            unit: item.quantity_unit || item.unit || 'unit',
            quantity: item.quantity || 1,
            selected_item_id: item.selected_item_id || item.id,
            currency_symbol: item.currency_symbol || 'Rs',
            provider_id: item.provider_id || providerId,
            provider_name: item.provider_name || providerName,
          }));
          setLocalCartItems(mappedItems);
          hasSubmissionData = true;
        }
      }
      
      if (detailsSection?.fields && Array.isArray(detailsSection.fields)) {
        const cartDetailsField = detailsSection.fields.find(f => f.field_key === 'cart_details');
        if (cartDetailsField?.value) {
          console.log('📝 Pre-populating Step 3 cart details from submission:', cartDetailsField.value);
          setCartSummary(cartDetailsField.value);
          hasSummaryData = true;
        }
      }

      // If no submission data and no cart items from route params, try fetching from API
      if (!hasSubmissionData && cartItems.length === 0) {
        try {
          setLoading(true);
          console.log('📤 Fetching cart items...');
          const response = await axiosFinancingPrivate.get('/cart_items');
          const responseData = response.data?.data || response.data;
          console.log('✅ Cart items response:', responseData);

          if (Array.isArray(responseData) && responseData.length > 0) {
            // Map API response to CartItem format
            const mappedItems: CartItem[] = responseData.map((item: any) => {
              const attrs = item.attributes || item;
              return {
                id: item.id,
                cart_item_id: item.id,
                name: attrs.item_name || attrs.name || 'Unknown',
                category: item.type || attrs.category || 'Other',
                price: attrs.unit_price || attrs.price || 0,
                unit: attrs.quantity_unit || attrs.unit || 'unit',
                quantity: attrs.quantity || 1,
                selected_item_id: attrs.catalogue_item_id || attrs.selected_item_id || item.id,
              };
            });
            setLocalCartItems(mappedItems);
          }
        } catch (error: any) {
          console.log('❌ Failed to fetch cart items:', error?.response?.data || error?.message);
          // Keep using the passed cartItems as fallback
        } finally {
          setLoading(false);
        }
      }

      // Fetch cart summary from API if not in submission data
      if (!hasSummaryData) {
        const summaryApiConfig = detailsSection?.external_api_config;
        if (summaryApiConfig?.endpoint) {
          try {
            console.log('📤 Fetching cart summary from:', summaryApiConfig.endpoint);
            
            // Strip /api/v1 prefix if present
            let endpoint = summaryApiConfig.endpoint;
            if (endpoint.startsWith('/api/v1/')) {
              endpoint = endpoint.replace('/api/v1/', '/');
            }
            
            const response = await axiosFinancingPrivate.get(endpoint);
            const responseData = response.data?.data || response.data;
            console.log('✅ Cart summary response:', responseData);

            // Parse response based on response_key
            let summaryData = responseData;
            if (summaryApiConfig.response_key && responseData[summaryApiConfig.response_key]) {
              summaryData = responseData[summaryApiConfig.response_key];
            }

            if (summaryData) {
              setCartSummary({
                item_count: summaryData.item_count || summaryData.items_count || 0,
                invoice_discount: summaryData.invoice_discount || summaryData.discount || 0,
                total: summaryData.total || summaryData.sub_total || 0,
                total_incl_tax: summaryData.total_incl_tax || summaryData.total_with_tax || summaryData.total || 0,
              });
            }
          } catch (error: any) {
            console.log('❌ Failed to fetch cart summary:', error?.response?.data || error?.message);
          }
        }
      }
    };

    fetchCartData();
  }, [step]);

  // Fetch cart data from submission API when step data is empty but submissionId is available
  useFocusEffect(
    React.useCallback(() => {
      const fetchFromSubmission = async () => {
        if (!submissionId || !productSlug) return;
        // Skip if we already have cart items populated
        if (localCartItems.length > 0) return;

        try {
          console.log('🔄 CartSummary: Fetching submission data for:', submissionId);
          const response = await axiosFinancingPrivate.get(`/submissions/${submissionId}`, {
            params: { product_slug: productSlug }
          });
          const submissionData = response.data?.data || response.data;
          const submissionSteps = submissionData?.attributes?.product_configuration?.steps ||
                                 submissionData?.product_configuration?.steps || [];

          const cartSummaryStep = submissionSteps.find((s: any) => s.identifier === 'cart_summary');
          if (cartSummaryStep?.sections) {
            // Extract cart items
            const cartItemsSec = cartSummaryStep.sections.find((s: any) => s.identifier === 'cart_items');
            if (cartItemsSec?.fields) {
              const cartItemsField = cartItemsSec.fields.find((f: any) => f.field_key === 'cart_items');
              if (cartItemsField?.value && Array.isArray(cartItemsField.value) && cartItemsField.value.length > 0) {
                console.log('✅ CartSummary: Restored cart items from submission:', cartItemsField.value.length);
                const mappedItems: CartItem[] = cartItemsField.value.map((item: any) => ({
                  id: item.selected_item_id || item.id || Math.random().toString(),
                  cart_item_id: item.cart_item_id || item.id,
                  name: item.item_name || item.name || 'Unknown',
                  category: item.category || 'Other',
                  price: item.unit_price || item.price || 0,
                  unit: item.quantity_unit || item.unit || 'unit',
                  quantity: item.quantity || 1,
                  selected_item_id: item.selected_item_id || item.id,
                  currency_symbol: item.currency_symbol || 'Rs',
                  provider_id: item.provider_id || providerId,
                  provider_name: item.provider_name || providerName,
                }));
                setLocalCartItems(mappedItems);
              }
            }

            // Extract cart details/summary
            const cartDetailsSec = cartSummaryStep.sections.find((s: any) => s.identifier === 'cart_summary_details');
            if (cartDetailsSec?.fields) {
              const cartDetailsField = cartDetailsSec.fields.find((f: any) => f.field_key === 'cart_details');
              if (cartDetailsField?.value) {
                console.log('✅ CartSummary: Restored cart details from submission');
                setCartSummary(cartDetailsField.value);
              }
            }
          }
        } catch (error: any) {
          console.log('⚠️ CartSummary: Could not fetch submission:', error?.response?.data || error?.message);
        }
      };

      fetchFromSubmission();
    }, [submissionId, productSlug, localCartItems.length, providerId, providerName])
  );

  // Get section configurations from step
  const cartItemsSection = useMemo(() => {
    if (!step?.sections?.length) return null;
    return step.sections.find(s => s.identifier === 'cart_items');
  }, [step]);

  const detailsSection = useMemo(() => {
    if (!step?.sections?.length) return null;
    return step.sections.find(s => s.identifier === 'cart_summary_details');
  }, [step]);

  // Get screen title from step config
  const screenTitle = step?.title || 'Cart Summary';

  // Get display keys from configuration
  const displayKeys = useMemo(() => {
    const field = cartItemsSection?.fields?.find(f => f.field_key === 'cart_items') as any;
    return field?.display_keys || {
      item: 'ITEMS',
      price: 'PRICE',
      qty: 'QTY.',
      total: 'TOTAL',
    };
  }, [cartItemsSection]);

  const detailsDisplayKeys = useMemo(() => {
    const field = detailsSection?.fields?.find(f => f.field_key === 'cart_details') as any;
    return field?.display_keys || {
      item_count: 'Items (Units)',
      invoice_discount: 'Invoice Discount',
      total: 'Total',
      total_incl_tax: 'Total Incl. tax',
    };
  }, [detailsSection]);

  // Calculate totals
  const totalUnits = localCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const calculatedTotal = localCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );

  const handleProceedToCheckout = async () => {
    // If order is locked, just navigate to the next screen without submitting
    if (isOrderLocked) {
      console.log('🔒 Order locked, skipping submission and navigating to next step');
      navigation.navigate('Checkout', { 
        cartItems: localCartItems, 
        totalAmount: cartSummary?.total || calculatedTotal,
        step: steps?.find(s => s.identifier === 'checkout'),
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

    // Submit step 3 to API before navigating
    try {
      // Prepare cart_items for submission
      const cartItemsPayload = localCartItems.map(item => ({
        selected_item_id: item.selected_item_id || item.id,
        item_name: item.item_name || item.name,
        unit_price: item.price,
        quantity: item.quantity,
        quantity_unit: item.quantity_unit || item.unit || 'units',
        total_price: item.price * item.quantity,
        currency_symbol: item.currency_symbol || 'Rs',
        provider_id: item.provider_id || providerId,
        provider_name: item.provider_name || providerName,
      }));

      // Prepare cart_details for submission
      const cartDetailsPayload = {
        item_count: totalUnits,
        invoice_discount: cartSummary?.invoice_discount || 0,
        total: cartSummary?.total || calculatedTotal,
        total_incl_tax: cartSummary?.total_incl_tax || calculatedTotal,
        currency_symbol: 'Rs',
      };

      const payload = {
        submission_id: submissionId,
        product_slug: productSlug,
        type: 'product_submission',
        step_identifier: 'cart_summary',
        step_number: 3,
        is_draft: false,
        field_values: {
          cart_items: cartItemsPayload,
          cart_details: cartDetailsPayload,
        },
      };

      console.log('📤 Submitting Step 3 (Cart Summary):', payload);

      const response = await axiosFinancingPrivate.post('/submissions', payload);
      const responseData = response.data?.data || response.data;
      console.log('✅ Step 3 submission successful:', responseData);

      // Extract submission_id from response (check attributes first, then top level)
      const updatedSubmissionId = responseData?.attributes?.submission_id || responseData?.submission_id || submissionId;

      // Navigate to checkout
      navigation.navigate('Checkout', { 
        cartItems: localCartItems, 
        totalAmount: cartSummary?.total || calculatedTotal,
        step: steps?.find(s => s.identifier === 'checkout'),
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
      console.log('❌ Step 3 submission failed:', error);
      // Navigate anyway to not block the flow
      navigation.navigate('Checkout', { 
        cartItems: localCartItems, 
        totalAmount: cartSummary?.total || calculatedTotal,
        step: steps?.find(s => s.identifier === 'checkout'),
        steps,
        productSlug,
        submissionId,
        providerId,
        providerName,
        isOrderLocked,
        acceptsProviderCredit,
        providerCreditDisabledMessage,
      });
    }
  };

  const handleDelete = async (itemId: string, cartItemId?: string) => {
    // Get the item actions from metadata
    const deleteAction = cartItemsSection?.metadata?.item_actions?.find(
      (action: any) => action.label === 'Delete'
    );

    const deleteItem = async () => {
      const idToDelete = cartItemId || itemId;
      try {
        setDeleting(itemId);
        console.log('📤 Deleting cart item:', idToDelete);
        await axiosFinancingPrivate.delete(`/cart_items/${idToDelete}`);
        console.log('✅ Cart item deleted successfully');
        setLocalCartItems(prev => prev.filter(item => item.id !== itemId));
      } catch (error: any) {
        console.log('❌ Failed to delete cart item:', error?.response?.data || error?.message);
        // Still remove from local state as fallback
        setLocalCartItems(prev => prev.filter(item => item.id !== itemId));
      } finally {
        setDeleting(null);
      }
    };

    if (deleteAction?.requires_confirmation) {
      Alert.alert(
        'Delete Item',
        'Are you sure you want to remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: deleteItem
          },
        ]
      );
    } else {
      await deleteItem();
    }
  };

  const handleView = (itemId: string) => {
    const item = localCartItems.find(i => i.id === itemId);
    if (item) {
      setViewingItem(item);
    }
  };

  const handleCloseView = () => {
    setViewingItem(null);
  };

  const handleBack = React.useCallback(() => {
    if (fromDashboard) {
      navigation.replace('InputPurchase', {
        step: steps?.find((s: any) => s.identifier === 'input_purchase_details'),
        steps,
        productSlug,
        submissionId,
        providerId,
        providerName,
        isOrderLocked,
        updatedCartItems: localCartItems,
        acceptsProviderCredit,
        providerCreditDisabledMessage,
        fromDashboard,
      });
      return;
    }

    navigation.navigate('InputPurchase', {
      step: steps?.find((s: any) => s.identifier === 'input_purchase_details'),
      steps,
      productSlug,
      submissionId,
      providerId,
      providerName,
      isOrderLocked,
      updatedCartItems: localCartItems,
      acceptsProviderCredit,
      providerCreditDisabledMessage,
      fromDashboard,
    });
  }, [fromDashboard, navigation, steps, productSlug, submissionId, providerId, providerName, isOrderLocked, localCartItems, acceptsProviderCredit, providerCreditDisabledMessage]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [handleBack])
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
        {/* Main Card */}
        <View style={styles.mainCard}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colItems]}>{displayKeys.item}</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>{displayKeys.price}</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>{displayKeys.qty}</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>{displayKeys.total}</Text>
          </View>

          <View style={styles.divider} />

          {/* Items List */}
          {localCartItems.map((item, index) => (
            <View key={item.id}>
              <View style={styles.itemRow}>
                <Text style={styles.itemCategory} numberOfLines={3} ellipsizeMode="tail">{item.name || item.category}</Text>
                <Text style={styles.itemPrice}>Rs {item.price}</Text>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyBadgeText} numberOfLines={1} ellipsizeMode="clip">
                    {item.quantity} {(item.unit || 'units').replace(/\s*bag\b/gi, '').trim() || 'units'}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>Rs {item.price * item.quantity}</Text>
              </View>
              <View style={styles.itemActionsRow}>
                <TouchableOpacity onPress={() => handleView(item.id)}>
                  <Text style={styles.actionText}>View</Text>
                </TouchableOpacity>
                {!isOrderLocked && (
                  <>
                    <View style={styles.actionDivider} />
                    <TouchableOpacity 
                      onPress={() => handleDelete(item.id, item.cart_item_id)}
                      disabled={deleting === item.id}
                    >
                      <Text style={[styles.actionText, deleting === item.id && { opacity: 0.5 }]}>
                        {deleting === item.id ? 'Deleting...' : 'Delete'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
              {index < localCartItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}

          {localCartItems.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <UITypography variant="regular" style={{ color: '#666' }}>
                Your cart is empty
              </UITypography>
            </View>
          )}
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsTab}>
            <Text style={styles.detailsTabText}>{detailsSection?.title || 'Details'}</Text>
          </View>

          <View style={styles.detailsContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{detailsDisplayKeys.item_count} ({totalUnits} units)</Text>
              <Text style={styles.detailValue}>Rs {calculatedTotal}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{detailsDisplayKeys.invoice_discount}</Text>
              <Text style={styles.detailValue}>Rs {cartSummary?.invoice_discount || 0}</Text>
            </View>
          </View>

          <View style={styles.detailsDivider} />

          <View style={styles.detailsContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{detailsDisplayKeys.total}</Text>
              <Text style={styles.detailValue}>Rs {cartSummary?.total || calculatedTotal}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{detailsDisplayKeys.total_incl_tax}</Text>
              <Text style={styles.detailValue}>Rs {cartSummary?.total_incl_tax || calculatedTotal}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <UIContainedButton 
          onPress={handleProceedToCheckout}
          disabled={loading || localCartItems.length === 0}
        >
          {loading ? 'Loading...' : isOrderLocked ? 'VIEW CHECKOUT' : 'PROCEED TO CHECKOUT'}
        </UIContainedButton>
      </View>

      {/* View Item Modal */}
      <Modal
        visible={viewingItem !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCloseView}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <UITypography variant="semiBold" style={styles.modalTitle}>
                Item Detail
              </UITypography>
              <TouchableOpacity onPress={handleCloseView}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {viewingItem && (
              <View style={styles.modalContent}>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Input Category</Text>
                  <Text style={styles.modalDetailValue}>{viewingItem.category || '-'}</Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Selected Variety</Text>
                  <Text style={styles.modalDetailValue}>{viewingItem.name || viewingItem.item_name || '-'}</Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Unit Price</Text>
                  <Text style={styles.modalDetailValue}>Rs {viewingItem.price.toLocaleString()}</Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Quantity & Unit</Text>
                  <Text style={styles.modalDetailValue}>
                    {viewingItem.quantity} {viewingItem.unit || viewingItem.quantity_unit || 'units'}
                  </Text>
                </View>

                <View style={[styles.modalDetailRow, styles.modalDetailRowLast]}>
                  <Text style={styles.modalDetailLabel}>Line Total</Text>
                  <Text style={[styles.modalDetailValue, styles.modalDetailTotal]}>
                    Rs {(viewingItem.price * viewingItem.quantity).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalCloseButtonBottom} onPress={handleCloseView}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
