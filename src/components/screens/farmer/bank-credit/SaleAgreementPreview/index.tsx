import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import UITypography from '@/components/ui/typography';
import { UIContainedButton } from '@/components/ui/button';
import SectionHeader from './components/SectionHeader';
import LabelValueRow from './components/LabelValueRow';
import PdfCard from './components/PdfCard';
import { styles } from './index.styled';
import UICheckbox from '@/components/ui/checkbox';
import RNBlobUtil from 'react-native-blob-util';
import { Toast } from 'toastify-react-native';
import { axiosFinancingPrivate, axiosPublic } from '@/config/axios';
import { useDebugStore } from '@/store/useDebugStore';
import { submissionsService } from '@/services/submissions.service';
import type {
  FSAStep,
  ProductConfigurationField,
} from '@/store/useProductsStore';
import type { Buyer } from '@/components/screens/farmer/bank-credit/GovernmentVerifiedBuyers';
import { useFarmer } from '@/constants/context/farmer/context';
import ExecuteFSAIcon from '@/components/icons/ExecuteFSAIcon';
import AuthFarmerPrivacyModal from '@/components/screens/auth/farmer/farmer-details/AuthFarmerPrivacyModal';

type RouteParams = {
  SaleAgreementPreview: {
    buyer?: Buyer;
    fsaSteps?: FSAStep[];
    formValues?: Record<string, any>;
    productSubmissionId?: string | null;
    productSlug?: string;
    // Payment context for harvest crop filtering (buy-inputs flow)
    paymentType?: string;
    harvestDetailIds?: string[];
    // Lender offer flow params
    isLenderOfferFlow?: boolean;
    submissionId?: string;
    offerId?: string;
    lenderName?: string;
    // Marketplace sale order flow params
    isMarketplaceFlow?: boolean;
    marketplaceKeyTerms?: any;
    marketplaceOrderId?: string;
    marketplaceBuyerName?: string;
    marketplacePickupLocation?: string;
    // Static "Initiate FSA" flow flag
    initiateFsaStaticFlow?: boolean;
  };
};

export default function SaleAgreementPreview() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'SaleAgreementPreview'>>();
  const { top } = useSafeAreaInsets();
  const [confirm, setConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfZoomed, setIsPdfZoomed] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const isDebugMode = useDebugStore(state => state.isDebugMode);

  const { buyer, fsaSteps, formValues, productSubmissionId, productSlug, paymentType, harvestDetailIds, isLenderOfferFlow, submissionId, offerId, lenderName, isMarketplaceFlow, marketplaceKeyTerms, marketplaceOrderId, marketplaceBuyerName, marketplacePickupLocation, initiateFsaStaticFlow } = route.params || {};
  const fromDashboard = (route.params as any)?.fromDashboard || false;
  const { farmer } = useFarmer();
  const [requestingOtp, setRequestingOtp] = useState(false);

  // Debug Mode: auto-confirm the agreement so the Next button is enabled.
  useEffect(() => {
    if (isDebugMode) {
      setConfirm(true);
    }
  }, [isDebugMode]);

  const handleBack = useCallback(() => {
    // For buy-inputs flow, navigate back to DynamicLoanApplication (harvest details step)
    if (productSlug === 'buy-inputs' && productSubmissionId) {
      navigation.navigate('DynamicLoanApplication', {
        slug: productSlug,
        initialStepIndex: 4, // Harvest Details step
        submissionId: productSubmissionId,
        fromDashboard,
        paymentType,
        harvestDetailIds: harvestDetailIds || [],
      });
      return;
    }
    navigation.goBack();
  }, [productSlug, productSubmissionId, fromDashboard, navigation, paymentType, harvestDetailIds]);

  // Find the review_agreement or loan_agreement step (buy-inputs uses loan_agreement)
  const reviewStep = useMemo(() => {
    return fsaSteps?.find(step => 
      step.identifier === 'review_agreement' || step.identifier === 'loan_agreement'
    );
  }, [fsaSteps]);

  // Get the first section
  const section = useMemo(() => {
    if (!reviewStep?.sections?.length) return null;
    return [...reviewStep.sections]
      .filter(s => s.is_active !== false)
      .sort((a, b) => a.display_order - b.display_order)[0];
  }, [reviewStep]);

  // Get sorted fields
  const fields = useMemo(() => {
    if (!section?.fields?.length) return [];
    return [...section.fields]
      .filter(f => f.is_active !== false)
      .sort((a, b) => a.display_order - b.display_order);
  }, [section]);

  // State for dynamic content
  const [keyTermsData, setKeyTermsData] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Helper function to extract key terms data from API response
  // Handles different response structures (e.g., "key_terms", "terms", or direct data)
  const extractKeyTermsData = (data: any) => {
    if (!data) return null;

    // Check if data has expected structure keys
    const hasLoanBreakdown = data.loan_breakdown || 
                             data.repayment_model || 
                             data.contingent_charges || 
                             data.means_of_repayment;
    
    const hasFsaStructure = data.parties_involved || 
                           data.contract_breakdown || 
                           data.payment_terms || 
                           data.obligations;

    // If data already has the expected structure, return it directly
    if (hasLoanBreakdown || hasFsaStructure) {
      return data;
    }

    // Otherwise, try to find the nested key that contains the data
    // Look for common wrapper keys: key_terms, terms, data, details, etc.
    const possibleKeys = ['key_terms', 'terms', 'data', 'details', 'loan_terms', 'agreement_terms'];
    
    for (const key of possibleKeys) {
      if (data[key]) {
        const nestedData = data[key];
        const hasNestedLoanBreakdown = nestedData.loan_breakdown || 
                                       nestedData.repayment_model || 
                                       nestedData.contingent_charges || 
                                       nestedData.means_of_repayment;
        
        const hasNestedFsaStructure = nestedData.parties_involved || 
                                     nestedData.contract_breakdown || 
                                     nestedData.payment_terms || 
                                     nestedData.obligations;
        
        if (hasNestedLoanBreakdown || hasNestedFsaStructure) {
          return nestedData;
        }
      }
    }

    // If no known structure found, return null
    return null;
  };

  // Fetch dynamic content from APIs
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        for (const field of fields) {
          if (
            field.data_source === 'external_api' &&
            field.external_api_config
          ) {
            const config = field.external_api_config;
            let endpoint = config.endpoint;

            // Replace buyer_id placeholder if present
            if (endpoint.includes(':buyer_id') && buyer?.uuid) {
              endpoint = endpoint.replace(':buyer_id', buyer.uuid);
            }

            // Strip /api/v1 prefix if present to avoid duplication
            if (endpoint.startsWith('/api/v1/')) {
              endpoint = endpoint.replace('/api/v1/', '/');
            }

            const params: Record<string, any> = {};

if (config.query_params) {
  Object.entries(config.query_params).forEach(([paramKey, paramValue]) => {
    if (paramValue === 'submission_id' && productSubmissionId) {
      params[paramKey] = productSubmissionId;
    }
    if (paramValue === 'buyer_id' && buyer?.uuid) {
      params[paramKey] = buyer.uuid;
    }
  });
}

console.log('✅ Final axios params:', params);


            try {
              const response = await axiosFinancingPrivate.get(endpoint, { params });
              const data = config.response_key
                ? response.data[config.response_key]
                : response.data;

              console.log(`📦 Received data for ${field.field_key}:`, data);

              // Store content based on field type or content_type
              const contentType = field.field_config?.content_type;
              if (field.field_key === 'key_terms' || contentType === 'key_terms' || field.field_key === 'loan_breakdown') {
                // Extract and store the structured key terms data
                const extractedData = extractKeyTermsData(data);
                if (extractedData) {
                  console.log(`✅ Successfully extracted key terms data:`, extractedData);
                  // Buy input flow: also store input_provider_name when present (from input_provider_key_terms API)
                  const inputProviderName = data?.input_provider_name ?? data?.data?.input_provider_name;
                  const loanType = data?.loan_type ?? data?.data?.loan_type;
                  setKeyTermsData({
                    key_terms: extractedData,
                    ...(inputProviderName && { input_provider_name: inputProviderName }),
                    ...(loanType && { loan_type: loanType }),
                  });
                } else {
                  console.warn(`⚠️ Could not extract key terms data from response. Raw data:`, data);
                }

                // Also extract agreement_document_url if present in the same response
                if (data?.agreement_document_url) {
                  console.log(`✅ Extracted agreement_document_url from key_terms response`);
                  setPdfUrl(data.agreement_document_url);
                }
              // } else if (field.field_key === 'agreement_pdf' || contentType === 'agreement_pdf') {
              //   setPdfUrl(typeof data === 'string' ? data : data?.url || '');
              }
            } catch (error) {
              console.log(`❌ Error fetching ${field.field_key}:`, error);

              // If this was the agreement_pdf field and we still have no PDF URL
              // (i.e. key_terms response didn't include agreement_document_url), use fallback
              const contentType = field.field_config?.content_type;
              if (field.field_key === 'agreement_pdf' || contentType === 'agreement_pdf') {
                setPdfUrl(prev => {
                  if (!prev) {
                    console.log('Using fallback sample PDF due to API error');
                    return 'https://drive.google.com/uc?export=download&id=1ziIkNasKRGGzdF6FEcfJtFgvz1o4Jikk';
                  }
                  return prev;
                });
              }
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (fields.length > 0) {
      fetchContent();
    } else {
      setLoading(false);
    }
  }, [fields, buyer]);

  // Marketplace flow: set key terms from params
  useEffect(() => {
    if (!isMarketplaceFlow || !marketplaceKeyTerms) return;

    setLoading(true);
    try {
      const kt = marketplaceKeyTerms.key_terms;
      if (kt) {
        const extractedData = extractKeyTermsData(kt);
        if (extractedData) {
          setKeyTermsData({ key_terms: extractedData });
        } else {
          setKeyTermsData({ key_terms: kt });
        }
      }

      if (marketplaceKeyTerms.agreement_document_url) {
        setPdfUrl(marketplaceKeyTerms.agreement_document_url);
      }
    } finally {
      setLoading(false);
    }
  }, [isMarketplaceFlow, marketplaceKeyTerms]);

  // Fetch key terms for lender offer flow
  useEffect(() => {
    if (!isLenderOfferFlow || !submissionId || !offerId) return;

    const fetchLenderOfferKeyTerms = async () => {
      setLoading(true);
      try {
        const response = await submissionsService.getLenderOfferKeyTerms(submissionId, offerId);
        console.log('📦 Lender offer key terms:', response);

        const payload = response?.data;
        if (payload?.key_terms) {
          const extractedData = extractKeyTermsData(payload.key_terms);
          if (extractedData) {
            setKeyTermsData({ key_terms: extractedData });
          } else {
            // Use raw key_terms if extraction doesn't find known structure
            setKeyTermsData({ key_terms: payload.key_terms });
          }
        }

        const docUrl = payload?.agreement_document_url;
        if (docUrl && !docUrl.includes('example.com')) {
          setPdfUrl(docUrl);
        } else {
          console.log('Using fallback sample PDF due to API error');
          setPdfUrl('https://drive.google.com/uc?export=download&id=1ziIkNasKRGGzdF6FEcfJtFgvz1o4Jikk');
        }
      } catch (error) {
        console.log('❌ Error fetching lender offer key terms:', error);
        setPdfUrl('https://drive.google.com/uc?export=download&id=1ziIkNasKRGGzdF6FEcfJtFgvz1o4Jikk');
      } finally {
        setLoading(false);
      }
    };

    fetchLenderOfferKeyTerms();
  }, [isLenderOfferFlow, submissionId, offerId]);

  // Get checkbox field for consent
  const consentField = useMemo(() => {
    return fields.find(f => f.field_type === 'checkbox');
  }, [fields]);

  // Static "Initiate FSA" flow: fetch the sale agreement (key terms + PDF URL)
  // from the buyer agreement_pdf endpoint using the buyer selected in step 1.
  useEffect(() => {
    const buyerId = buyer?.uuid || buyer?.id;
    if (!initiateFsaStaticFlow || !buyerId) return;

    const fetchAgreement = async () => {
      setLoading(true);
      try {
        const response = await axiosFinancingPrivate.get(
          `/buyers/${buyerId}/agreement_pdf`,
        );
        const data = response.data?.data || response.data;
        console.log('✅ Static FSA agreement_pdf fetched for buyer', buyerId, data);

        if (data?.key_terms) {
          const extracted = extractKeyTermsData(data.key_terms);
          setKeyTermsData({
            key_terms: extracted || data.key_terms,
          });
        }
        if (data?.agreement_document_url) {
          setPdfUrl(data.agreement_document_url);
        }
      } catch (error) {
        console.log('❌ Failed to fetch static FSA agreement_pdf:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgreement();
  }, [initiateFsaStaticFlow, buyer]);

  const screenTitle = isMarketplaceFlow ? 'Forward Sale Agreement' : isLenderOfferFlow ? (lenderName || 'Review Agreement') : initiateFsaStaticFlow ? 'Forward Sale Agreement' : (reviewStep?.title || 'Review Agreement');

  // Helper function to sanitize name for filename (remove spaces and special characters)
  const sanitizeName = (name: string): string => {
    if (!name) return '';
    return name
      .replace(/[^a-zA-Z0-9]/g, '') // Remove all non-alphanumeric characters
      .trim();
  };

  // Helper function to format date as DDMonYYYY (e.g., 24Dec2025)
  const formatDate = (): string => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    return `${day}${month}${year}`;
  };

  // Generate filename following convention: FSA-[Farmer Name]-[Buyer Name]-[Date].pdf
  const generateFilename = useCallback((): string => {
    // Get farmer name from keyTermsData or fallback
    const farmerName = keyTermsData?.key_terms?.parties_involved?.farmer_name 
      || 'Farmer';
    
    // Get buyer name from keyTermsData, buyer object, or fallback
    const buyerName = keyTermsData?.key_terms?.parties_involved?.buyer_name 
      || buyer?.company_name 
      || buyer?.title 
      || 'Buyer';
    
    // Sanitize names
    const sanitizedFarmerName = sanitizeName(farmerName);
    const sanitizedBuyerName = sanitizeName(buyerName);
    
    // Format date
    const dateStr = formatDate();
    
    // Construct filename
    const filename = `FSA-${sanitizedFarmerName}-${sanitizedBuyerName}-${dateStr}.pdf`;
    
    return filename;
  }, [keyTermsData, buyer]);

  const handleDownload = useCallback(async () => {
    if (!pdfUrl) {
      Toast.show({
        type: 'error',
        text1: 'No PDF available',
        text2: 'PDF URL not found',
      });
      return;
    }

    try {
      const filename = generateFilename();
      const dirs = RNBlobUtil.fs.dirs;
      const targetPath =
        Platform.OS === 'android'
          ? `${dirs.DownloadDir}/${filename}`
          : `${dirs.DocumentDir}/${filename}`;

      const config =
        Platform.OS === 'android'
          ? {
              fileCache: true,
              path: targetPath,
              addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                title: filename,
                description: isLenderOfferFlow ? 'Loan Agreement' : 'Forward Sale Agreement',
                mime: 'application/pdf',
                mediaScannable: true,
                path: targetPath,
              },
            }
          : {
              fileCache: true,
              path: targetPath,
            };

      const res = await RNBlobUtil.config(config).fetch('GET', pdfUrl);
      const savedPath = res.path();

      if (Platform.OS === 'ios') {
        try {
          RNBlobUtil.ios.previewDocument(savedPath);
        } catch {}
      } else {
        try {
          RNBlobUtil.android.actionViewIntent(savedPath, 'application/pdf');
        } catch {}
      }

      Toast.show({
        type: 'success',
        text1: 'Your document has been downloaded',
        //text2: 'Your document has been downloaded',
      });
    } catch (_err) {
      Toast.show({
        type: 'error',
        text1: 'Download failed',
        text2: 'Unable to save PDF',
      });
    }
  }, [pdfUrl, generateFilename]);

  if (loading) {
    return (
      <View style={styles.container}>
        <LoanScreenHeader
          title={screenTitle}
          onBack={handleBack}
          containerStyle={[styles.header, { marginTop: top }]}
          titleStyle={isLenderOfferFlow ? { flexShrink: 1, flexWrap: 'wrap', textAlign: 'center', fontSize: 16 } : undefined}
        />
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#4CAF50" />
          <UITypography style={{ marginTop: 16 }}>
            Loading agreement details...
          </UITypography>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LoanScreenHeader
        title={screenTitle}
        onBack={handleBack}
        containerStyle={[styles.header, { marginTop: top }]}
        titleStyle={isLenderOfferFlow ? { flexShrink: 1, flexWrap: 'wrap', textAlign: 'center', fontSize: 16 } : undefined}
      />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isPdfZoomed}
      >
        <View style={styles.card}>
          {/* Key Terms Section */}
          {keyTermsData?.key_terms && (
            <>
              {/* Buy input flow: show provider name + "Provider Credit" and hardcoded description */}
              {productSlug === 'buy-inputs' && keyTermsData?.input_provider_name ? (
                <>
                  <SectionHeader
                    title={`${keyTermsData.input_provider_name}${keyTermsData.loan_type ? ` - ${keyTermsData.loan_type}` : ''}`}
                    center
                    titleStyle={{ letterSpacing: 0.3 }}
                  />
                  <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
                    <UITypography variant="regular" style={styles.text}>
                      This loan gives you quick access to funds from your input provider.
                    </UITypography>
                  </View>
                </>
              ) : (
                <>
                  <SectionHeader
                    title="Key Terms"
                    center
                    titleStyle={{ letterSpacing: 0.3 }}
                  />
                  {keyTermsData.key_terms.description && (
                    <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
                      <UITypography variant="regular" style={styles.text}>
                        {keyTermsData.key_terms.description}
                      </UITypography>
                    </View>
                  )}
                </>
              )}

              {/* Buy-Input Product: Loan Breakdown */}
              {keyTermsData.key_terms.loan_breakdown && (
                <>
                  <SectionHeader title="Loan Breakdown" />
                  <View style={styles.lableWrapper}>
                    {(keyTermsData.key_terms.loan_breakdown.loan_amount || keyTermsData.key_terms.loan_breakdown.sanctioned_limit) && (
                      <LabelValueRow
                        label="Loan Amount"
                        value={keyTermsData.key_terms.loan_breakdown.loan_amount ?? keyTermsData.key_terms.loan_breakdown.sanctioned_limit}
                      />
                    )}
                    {keyTermsData.key_terms.loan_breakdown.interest_rate && (
                      <LabelValueRow
                        label="Interest Rate"
                        value={keyTermsData.key_terms.loan_breakdown.interest_rate}
                      />
                    )}
                    {keyTermsData.key_terms.loan_breakdown.tenure && (
                      <LabelValueRow
                        label="Tenure"
                        value={keyTermsData.key_terms.loan_breakdown.tenure}
                      />
                    )}
                    {keyTermsData.key_terms.loan_breakdown.processing_fee != null && (
                      <LabelValueRow
                        label="Processing Fee"
                        value={String(keyTermsData.key_terms.loan_breakdown.processing_fee)}
                      />
                    )}
                    {keyTermsData.key_terms.loan_breakdown.total_interest && (
                      <LabelValueRow
                        label="Total Interest"
                        value={keyTermsData.key_terms.loan_breakdown.total_interest}
                      />
                    )}
                    {keyTermsData.key_terms.loan_breakdown.upfront_charges && (
                      <LabelValueRow
                        label="Upfront Charges"
                        value={keyTermsData.key_terms.loan_breakdown.upfront_charges}
                      />
                    )}
                    {keyTermsData.key_terms.loan_breakdown.net_disbursed_amount && (
                      <LabelValueRow
                        label="Net Disbursed Amount"
                        value={keyTermsData.key_terms.loan_breakdown.net_disbursed_amount}
                      />
                    )}
                    {keyTermsData.key_terms.loan_breakdown.total_amount_to_be_repaid != null && (
                      <LabelValueRow
                        label="Total Amount to be Repaid"
                        value={String(keyTermsData.key_terms.loan_breakdown.total_amount_to_be_repaid)}
                      />
                    )}
                    {keyTermsData.key_terms.loan_breakdown.annual_percentage_rate && (
                      <LabelValueRow
                        label="Annual Percentage Rate"
                        value={keyTermsData.key_terms.loan_breakdown.annual_percentage_rate}
                      />
                    )}
                  </View>
                </>
              )}

              {/* Buy-Input Product: Repayment Model */}
              {keyTermsData.key_terms.repayment_model && (
                <>
                  <SectionHeader title="Repayment Model" />
                  <View style={styles.lableWrapper}>
                    {keyTermsData.key_terms.repayment_model.repayment_frequency && (
                      <LabelValueRow
                        label="Repayment Frequency"
                        value={keyTermsData.key_terms.repayment_model.repayment_frequency}
                      />
                    )}
                    {(keyTermsData.key_terms.repayment_model.number_of_installments || keyTermsData.key_terms.repayment_model.number_of_instalments) && (
                      <LabelValueRow
                        label="Number of Instalments"
                        value={keyTermsData.key_terms.repayment_model.number_of_installments ?? keyTermsData.key_terms.repayment_model.number_of_instalments}
                      />
                    )}
                    {(keyTermsData.key_terms.repayment_model.amount_of_each_installment || keyTermsData.key_terms.repayment_model.amount_of_each_instalment) && (
                      <LabelValueRow
                        label="Amount of Each Instalment"
                        value={keyTermsData.key_terms.repayment_model.amount_of_each_installment ?? keyTermsData.key_terms.repayment_model.amount_of_each_instalment}
                      />
                    )}
                  </View>
                </>
              )}

              {/* Buy-Input Product: Contingent Charges */}
              {keyTermsData.key_terms.contingent_charges && (
                <>
                  <SectionHeader title="Contingent Charges" />
                  <View style={styles.lableWrapper}>
                    {keyTermsData.key_terms.contingent_charges.prepayment_charges && (
                      <LabelValueRow
                        label="Prepayment Charges"
                        value={keyTermsData.key_terms.contingent_charges.prepayment_charges}
                      />
                    )}
                    {keyTermsData.key_terms.contingent_charges.penal_charges && (
                      <LabelValueRow
                        label="Penal Charges"
                        value={keyTermsData.key_terms.contingent_charges.penal_charges}
                      />
                    )}
                  </View>
                </>
              )}

              {/* Buy-Input Product: Means of Repayment */}
              {keyTermsData.key_terms.means_of_repayment && (
                <>
                  <SectionHeader title="Means of Repayment" />
                  <View style={styles.lableWrapper}>
                    {keyTermsData.key_terms.means_of_repayment.repay_with && (
                      <LabelValueRow
                        label="Repay With"
                        value={keyTermsData.key_terms.means_of_repayment.repay_with}
                      />
                    )}
                    {keyTermsData.key_terms.means_of_repayment.option_1_cash && (
                      <LabelValueRow
                        label="Option 1: Cash"
                        value={keyTermsData.key_terms.means_of_repayment.option_1_cash}
                      />
                    )}
                    {keyTermsData.key_terms.means_of_repayment.option_2_produce && (
                      <LabelValueRow
                        label="Option 2: Produce"
                        value={keyTermsData.key_terms.means_of_repayment.option_2_produce}
                      />
                    )}
                  </View>
                  {keyTermsData.key_terms.means_of_repayment.note && (
                    <View style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
                      <UITypography
                        variant="regular"
                        style={[styles.text, { fontSize: 13, fontStyle: 'italic' }]}
                      >
                        Note: {keyTermsData.key_terms.means_of_repayment.note}
                      </UITypography>
                    </View>
                  )}
                </>
              )}

              {/* FSA Product: Parties Involved */}
              {keyTermsData.key_terms.parties_involved && (
                <>
                  <SectionHeader title="Parties Involved" />
                  <View style={styles.lableWrapper}>
                    {keyTermsData.key_terms.parties_involved.farmer_name &&
                      keyTermsData.key_terms.parties_involved.farmer_name !==
                        '-' && (
                        <LabelValueRow
                          label="Farmer Name"
                          value={
                            keyTermsData.key_terms.parties_involved.farmer_name
                          }
                        />
                      )}
                    {keyTermsData.key_terms.parties_involved.lender_name &&
                      keyTermsData.key_terms.parties_involved.lender_name !==
                        '-' && (
                        <LabelValueRow
                          label="Lender Name"
                          value={
                            keyTermsData.key_terms.parties_involved.lender_name
                          }
                        />
                      )}
                    {keyTermsData.key_terms.parties_involved.farm_location &&
                      keyTermsData.key_terms.parties_involved.farm_location !==
                        '-' && (
                        <LabelValueRow
                          label="Farm Location"
                          value={
                            keyTermsData.key_terms.parties_involved
                              .farm_location
                          }
                        />
                      )}
                    {keyTermsData.key_terms.parties_involved.buyer_name &&
                      keyTermsData.key_terms.parties_involved.buyer_name !==
                        '-' && (
                        <LabelValueRow
                          label="Buyer Name"
                          value={
                            keyTermsData.key_terms.parties_involved.buyer_name
                          }
                        />
                      )}
                    {keyTermsData.key_terms.parties_involved.buyer_location &&
                      keyTermsData.key_terms.parties_involved.buyer_location !==
                        '-' && (
                        <LabelValueRow
                          label="Buyer Location"
                          value={
                            keyTermsData.key_terms.parties_involved
                              .buyer_location
                          }
                        />
                      )}
                  </View>
                </>
              )}

              {/* FSA Product: Contract Breakdown */}
              {keyTermsData.key_terms.contract_breakdown && (
                <>
                  <SectionHeader title="Contract Breakdown" />
                  <View style={styles.lableWrapper}>
                    {keyTermsData.key_terms.contract_breakdown.product_type &&
                      keyTermsData.key_terms.contract_breakdown.product_type !==
                        '-' && (
                        <LabelValueRow
                          label="Produce Type"
                          value={
                            keyTermsData.key_terms.contract_breakdown
                              .product_type
                          }
                        />
                      )}
                    {keyTermsData.key_terms.contract_breakdown
                      .committed_volume &&
                      keyTermsData.key_terms.contract_breakdown
                        .committed_volume !== '-' && (
                        <LabelValueRow
                          label="Committed Volume"
                          value={
                            keyTermsData.key_terms.contract_breakdown
                              .committed_volume
                          }
                        />
                      )}
                    {keyTermsData.key_terms.contract_breakdown.expected_grade &&
                      keyTermsData.key_terms.contract_breakdown
                        .expected_grade !== '-' && (
                        <LabelValueRow
                          label="Expected Grade"
                          value={
                            keyTermsData.key_terms.contract_breakdown
                              .expected_grade
                          }
                        />
                      )}
                    {keyTermsData.key_terms.contract_breakdown
                      .delivery_window && (
                      <LabelValueRow
                        label="Delivery Window"
                        value={
                          keyTermsData.key_terms.contract_breakdown
                            .delivery_window
                        }
                      />
                    )}
                    {keyTermsData.key_terms.contract_breakdown
                      .delivery_location && (
                      <LabelValueRow
                        label="Delivery Location"
                        value={
                          keyTermsData.key_terms.contract_breakdown
                            .delivery_location
                        }
                      />
                    )}
                    {keyTermsData.key_terms.contract_breakdown
                      .forward_price && (
                      <LabelValueRow
                        label="Forward Price"
                        value={
                          keyTermsData.key_terms.contract_breakdown
                            .forward_price
                        }
                      />
                    )}
                  </View>
                </>
              )}

              {/* FSA Product: Payment Terms */}
              {keyTermsData.key_terms.payment_terms && (
                <>
                  <SectionHeader title="Payment Terms" />
                  <View style={styles.lableWrapper}>
                    {keyTermsData.key_terms.payment_terms.payment && (
                      <LabelValueRow
                        label="Payment"
                        value={keyTermsData.key_terms.payment_terms.payment}
                      />
                    )}
                    {keyTermsData.key_terms.payment_terms.inspection && (
                      <LabelValueRow
                        label="Inspection"
                        value={keyTermsData.key_terms.payment_terms.inspection}
                      />
                    )}
                  </View>
                </>
              )}

              {/* FSA Product: Obligations */}
              {keyTermsData.key_terms.obligations && (
                <>
                  <SectionHeader title="Obligations" />
                  <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
                    <UITypography
                      style={[
                        styles.text,
                        { color: '#2F2B3DB2', fontWeight: '500' },
                      ]}
                    >
                      {keyTermsData.key_terms.obligations}
                    </UITypography>
                  </View>
                </>
              )}
            </>
          )}

          {/* Buyer Information 
          {buyer && (
            <>
              <SectionHeader title="Buyer Information" />
              <View style={styles.lableWrapper}>
                {buyer.company_name && (
                  <LabelValueRow
                    label="Buyer Name"
                    value={buyer.company_name}
                  />
                )}
                {buyer.location && (
                  <LabelValueRow label="Location" value={buyer.location} />
                )}
                {buyer.ghana_post_gps && (
                  <LabelValueRow
                    label="GPS Address"
                    value={buyer.ghana_post_gps}
                  />
                )}
                {buyer.phone_number && (
                  <LabelValueRow
                    label="Phone Number"
                    value={buyer.phone_number}
                  />
                )}
              </View>
            </>
          )}

          
          {formValues && Object.keys(formValues).length > 0 && (
            <>
              <SectionHeader title="Agreement Details" />
              <View style={styles.lableWrapper}>
                {formValues.expected_volume && (
                  <LabelValueRow
                    label="Expected Volume"
                    value={`${formValues.expected_volume} ${
                      formValues.expected_volume_unit || ''
                    }`}
                  />
                )}
                {formValues.committed_volume && (
                  <LabelValueRow
                    label="Committed Volume"
                    value={`${formValues.committed_volume} ${
                      formValues.committed_volume_unit || ''
                    }`}
                  />
                )}
              </View>
            </>
          )}*/}
        </View>

        {/* PDF Preview — hide for buy-inputs when payment is not provider_credit */}
        {pdfUrl && !isLenderOfferFlow && !(productSlug === 'buy-inputs' && paymentType !== 'provider_credit') && (
          <PdfCard 
            uri={pdfUrl} 
            onZoomStateChange={setIsPdfZoomed}
          />
        )}

        {pdfUrl && !isLenderOfferFlow && !(productSlug === 'buy-inputs' && paymentType !== 'provider_credit') && (
          <Pressable onPress={handleDownload}>
            <UITypography variant="semiBold" style={styles.downloadText}>
              Download
            </UITypography>
          </Pressable>
        )}

        {/* Marketplace Execute FSA Section */}
        {isMarketplaceFlow && (
          <View style={styles.executeFsaSection}>
            <UITypography variant="medium" style={styles.executeFsaDesc}>
              Take your harvest to the nearest collection centre.
            </UITypography>

            {marketplaceBuyerName && (
              <UITypography variant="medium" style={styles.executeFsaDetail}>
                <UITypography variant="semiBold" style={styles.executeFsaDetailLabel}>Buyer - </UITypography>
                {marketplaceBuyerName}
              </UITypography>
            )}

            {keyTermsData?.key_terms?.contract_breakdown?.delivery_location && (
              <UITypography variant="medium" style={styles.executeFsaDetail}>
                <UITypography variant="semiBold" style={styles.executeFsaDetailLabel}>Location- </UITypography>
                {keyTermsData.key_terms.contract_breakdown.delivery_location}
              </UITypography>
            )}

            {keyTermsData?.key_terms?.contract_breakdown?.delivery_window && (
              <UITypography variant="medium" style={styles.executeFsaDetail}>
                <UITypography variant="semiBold" style={styles.executeFsaDetailLabel}>Date - </UITypography>
                {keyTermsData.key_terms.contract_breakdown.delivery_window}
              </UITypography>
            )}

            <UITypography variant="medium" style={styles.executeFsaDetail}>
              <UITypography variant="semiBold" style={styles.executeFsaDetailLabel}>Time - </UITypography>
              9 am to 5 pm
            </UITypography>

            <Pressable
              style={styles.executeFsaButton}
              disabled={requestingOtp}
              onPress={async () => {
                setRequestingOtp(true);
                try {
                  const phoneNumber = farmer?.attributes?.phone_number;
                  if (!phoneNumber) {
                    Toast.show({ type: 'error', text1: 'Error', text2: 'Phone number not found.' });
                    return;
                  }
                  await axiosPublic.post('/users/request_otp', {
                    data: {
                      attributes: {
                        phone_number: phoneNumber,
                        email: farmer?.attributes?.email,
                        skip_count_check: true,
                        flow: 'SALE_ORDER_OTP',
                      },
                    },
                  });
                  navigation.navigate('LoanRequestOTPVerification', {
                    isMarketplaceFlow: true,
                    marketplaceTransactionType: 'sale_order',
                    marketplaceTransactionId: marketplaceOrderId,
                    marketplaceSuccessMessage: "Once you've delivered the harvest to the collection centre, the buyer will confirm and process your payment.",
                    otpFlow: 'SALE_ORDER_OTP',
                  });
                } catch (err: any) {
                  const error = err?.response?.data?.error || 'Failed to request OTP';
                  Toast.show({ type: 'error', text1: 'Error', text2: error });
                } finally {
                  setRequestingOtp(false);
                }
              }}
            >
              <ExecuteFSAIcon width={10} height={16} color="#FFFFFF" />
              <UITypography variant="semiBold" style={styles.executeFsaButtonText}>
                {requestingOtp ? 'Loading...' : 'Execute Smart FSA Contract'}
              </UITypography>
            </Pressable>
          </View>
        )}

        {/* Consent Checkbox */}
        {!isMarketplaceFlow && (consentField || isLenderOfferFlow || initiateFsaStaticFlow) && (
          <View style={styles.consentWrap}>
            <UICheckbox
              checked={confirm}
              onPress={() => setConfirm(c => !c)}
              size={40}
            />
            <View style={styles.consentTextWrap}>
              {(() => {
                const fullText = isLenderOfferFlow
                  ? 'I/We hereby declare that I have read, understood, and agree to the terms and conditions outlined in this Loan Agreement. By signing and providing OTP-based consent in the next step, I/We confirm acceptance of the agreed terms stated in the loan agreement. I/We also authorize the parties to execute the obligations, settlements, and deductions as applicable under this agreement.'
                  : (consentField?.label || 'I have read and agree to the Terms and Conditions of the Sale Agreement.');
                const lowerText = fullText.toLowerCase();
                const keyword =
                  lowerText.includes('terms and conditions')
                    ? 'terms and conditions'
                    : 'terms';
                const idx = lowerText.indexOf(keyword);
                if (idx === -1) {
                  return <Text style={styles.consentText}>{fullText}</Text>;
                }
                const before = fullText.slice(0, idx);
                const linked = fullText.slice(idx, idx + keyword.length);
                const after = fullText.slice(idx + keyword.length);
                return (
                  <Text style={styles.consentText}>
                    {before}
                    <Text
                      style={styles.consentTextLink}
                      onPress={() => setPrivacyModalVisible(true)}
                    >
                      {linked}
                    </Text>
                    {after}
                  </Text>
                );
              })()}
            </View>
          </View>
        )}

        {!isMarketplaceFlow && <UIContainedButton
          style={styles.saveButton}
          disabled={!confirm || isSubmitting}
          onPress={async () => {
            // Lender offer flow
            if (isLenderOfferFlow && submissionId && offerId) {
              try {
                setIsSubmitting(true);
                console.log('📤 Confirming lender offer agreement...');
                await submissionsService.confirmLenderAgreement(submissionId, offerId);
                console.log('✅ Lender offer agreement confirmed');

                // Navigate to Authentication with lender offer params
                navigation.navigate('Authentication', {
                  isLenderOfferFlow: true,
                  submissionId,
                  offerId,
                  lenderName,
                });
              } catch (error: any) {
                console.log('❌ Confirm agreement failed:', error);
                Toast.error(
                  error?.response?.data?.message || 'Failed to confirm agreement',
                );
              } finally {
                setIsSubmitting(false);
              }
              return;
            }

            // Static "Initiate FSA" flow: skip the submission POST and go
            // straight to the Authentication screen.
            if (initiateFsaStaticFlow) {
              navigation.navigate('Authentication', {
                buyer,
                formValues,
                initiateFsaStaticFlow: true,
              });
              return;
            }

            // Original FSA/buy-inputs flow
            console.log('🔍 Debug - reviewStep:', reviewStep);
            console.log('🔍 Debug - productSubmissionId:', productSubmissionId);
            console.log('🔍 Debug - fsaSteps:', fsaSteps);
            console.log('🔍 Debug - productSlug:', productSlug);
            
            // Debug Mode: skip the submission POST and go straight to Authentication.
            if (isDebugMode) {
              navigation.navigate('Authentication', {
                fsaSteps,
                buyer,
                formValues,
                productSubmissionId,
                productSlug,
                fromDashboard,
                paymentType,
                harvestDetailIds,
              });
              return;
            }

            if (!reviewStep || !productSubmissionId) {
              console.log('Missing reviewStep or productSubmissionId');
              return;
            }

            try {
              setIsSubmitting(true);
              console.log('📤 Submitting Step 8 (Review Agreement)...');

              // Prepare field values
              const fieldValues: Record<string, any> = {
                agreement_accepted: confirm,
              };

              // Submit step to API
              const response = await axiosFinancingPrivate.post('/submissions', {
                is_draft: false,
                type: 'product_submission',
                product_slug: productSlug || 'agri-loan',
                field_values: fieldValues,
                step_identifier: reviewStep.identifier,
                step_number: reviewStep.step_number,
                submission_id: productSubmissionId,
              });

              console.log('✅ Step 8 submission successful:', response.data);

              // Navigate to Authentication
              navigation.navigate('Authentication', {
                fsaSteps,
                buyer,
                formValues,
                productSubmissionId,
                productSlug,
                fromDashboard,
                paymentType,
                harvestDetailIds,
              });
            } catch (error: any) {
              console.log('❌ Step 8 submission failed:', error);
              Toast.error(
                error?.response?.data?.message || 'Failed to submit agreement review',
              );
            } finally {
              setIsSubmitting(false);
            }
          }}
          key={`button-${confirm}-${isSubmitting}`}
        >
          {isSubmitting ? 'Submitting...' : 'Save & Continue'}
        </UIContainedButton>}
      </ScrollView>

      <AuthFarmerPrivacyModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
      />
    </View>
  );
}
