import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  FlatList,
  ListRenderItem,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './index.styled';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import UITypography from '@/components/ui/typography';
import UISearchInput from '@/components/ui/search-input';
import BuyerCard from './components/BuyerCard';
import ViewMoreBuyerCard from './components/ViewMoreBuyerCard';
import VerfiedBanner from '@/assets/images/farmer/verifieed-buyers.png';
import BuyInputBanner from '@/assets/images/farmer/buy-input-banner.png';
import VerifiedCorn from '@/assets/images/farmer/verified-corn.png';
import VerifiedTractor from '@/assets/images/farmer/verified-tracker.png';
import { axiosFinancingPrivate } from '@/config/axios';
import { useDebugStore } from '@/store/useDebugStore';
import { COUNTRY } from '@env';
import type { FSAStep } from '@/store/useProductsStore';

export type Buyer = {
  id: string;
  uuid?: string;
  name?: string;
  title: string;
  company_name?: string;
  gps: string;
  ghana_post_gps?: string;
  image: any;
  image_url?: string;
  crops?: string[];
  location?: string;
  phone_number?: string;
  has_catalog?: boolean;
  purchase_disabled_message?: string;
  accepts_provider_credit?: boolean;
  provider_credit_disabled_message?: string;
};

type RouteParams = {
  GovernmentVerifiedBuyers: {
    fsaStep?: FSAStep;
    fsaSteps?: FSAStep[];
    productSlug?: string;
    submissionId?: string | null;
    initiateFsaStaticFlow?: boolean;
    harvestData?: {
      crop: string;
      expectedYield: string;
      yieldUnit: string;
      pickupLocation: string;
    };
    selectedOption?: 'aggregators' | 'forward_sale';
    harvestDetailId?: string;
  };
};

// Default placeholder images for buyers without images
const PLACEHOLDER_IMAGES = [VerifiedCorn, VerifiedTractor];

// Helper function to capitalize first letter of crop name
const capitalizeCropName = (crop: string): string => {
  return crop.charAt(0).toUpperCase() + crop.slice(1).toLowerCase();
};

const Separator = () => <View style={styles.separator} />;

export default function GovernmentVerifiedBuyers() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'GovernmentVerifiedBuyers'>>();
  const { top } = useSafeAreaInsets();

  const { fsaStep, fsaSteps, productSlug, submissionId, harvestData, selectedOption, harvestDetailId, initiateFsaStaticFlow } = route.params || {};
  
  console.log('👥 GovernmentVerifiedBuyers received:', {
    submissionId,
  });

  const [query, setQuery] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const isDebugMode = useDebugStore(state => state.isDebugMode);

  // Get the API config from the first section of the FSA step
  const apiConfig = useMemo(() => {
    const section = fsaStep?.sections?.[0];
    if (
      section?.data_source === 'external_api' &&
      section.external_api_config
    ) {
      return section.external_api_config;
    }
    return null;
  }, [fsaStep]);

  // Extract pre-selected provider ID from submission data when editing
  useEffect(() => {
    const section = fsaStep?.sections?.[0];
    if (section?.fields && Array.isArray(section.fields)) {
      const providerIdField = section.fields.find(
        field => field.field_key === 'provider_id' || field.field_key === 'selected_provider_id'
      );
      if (providerIdField?.value) {
        console.log('📝 Pre-selected provider ID from submission:', providerIdField.value);
        setSelectedProviderId(providerIdField.value);
      }
    }
  }, [fsaStep]);

  // Check if this is sell-harvest flow
  const isSellHarvestFlow = !!selectedOption;

  // Fetch buyers from API
  useEffect(() => {
    const fetchBuyers = async () => {
       // For sell-harvest flow (or the static Initiate FSA flow), fetch from buyers API
      if ((isSellHarvestFlow || initiateFsaStaticFlow) && !apiConfig?.endpoint) {
        try {
          setLoading(true);
          setError(null);

          const response = await axiosFinancingPrivate.get('/buyers');
          
          const responseData = response.data?.data || response.data;

          if (Array.isArray(responseData)) {
            const mappedBuyers: Buyer[] = responseData.map((item: any, index: number) => {
              const attrs = item.attributes || {};
              const imageUrl = attrs.logo_url || attrs.image_url || item.logo_url || item.image_url;
              let crops = attrs.crops || item.crops || [];
              if (typeof crops === 'string') {
                crops = crops.split(',').map((c: string) => c.trim());
              }

              return {
                id: item.id || item.uuid || `provider-${index}`,
                uuid: item.id || item.uuid,
                name: attrs.name || item.name,
                title: attrs.company_name || attrs.name || item.company_name || 'Unknown Company',
                company_name: attrs.company_name || item.company_name,
                gps: attrs.location || item.ghana_post_gps || item.location || 'N/A',
                ghana_post_gps: item.ghana_post_gps,
                location: attrs.location || item.location,
                phone_number: attrs.phone_number || item.phone_number,
                crops,
                image: imageUrl ? { uri: imageUrl } : PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length],
                image_url: imageUrl,
                has_catalog: attrs.has_catalog ?? item.has_catalog ?? true,
                purchase_disabled_message: attrs.purchase_disabled_message || item.purchase_disabled_message,
                accepts_provider_credit: attrs.accepts_provider_credit ?? item.accepts_provider_credit,
                provider_credit_disabled_message: attrs.provider_credit_disabled_message || item.provider_credit_disabled_message,
              };
            });

            console.log('✅ Fetched input providers for sell-harvest:', mappedBuyers.length);
            setBuyers(mappedBuyers);
          }
        } catch (err: any) {
          console.log('❌ Failed to fetch input providers:', err?.response?.data || err?.message);
          setError('Failed to load providers. Please try again.');
        } finally {
          setLoading(false);
        }
        return;
      }

      if (!apiConfig?.endpoint) {
        // Use static data if no API config and not sell-harvest
        setBuyers([
          {
            id: 'b1',
            title: 'Maize Buying Company',
            gps: 'AK-968-8687',
            image: VerifiedCorn,
          },
          {
            id: 'b2',
            title: 'Maize Buying Company',
            gps: 'AK-635-8658',
            image: VerifiedTractor,
          },
          {
            id: 'b3',
            title: 'Agro Processing Ltd',
            gps: 'AK-222-3399',
            image: VerifiedCorn,
          },
          {
            id: 'b4',
            title: 'Harvest Traders',
            gps: 'AK-110-8899',
            image: VerifiedTractor,
          },
        ]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Strip /api/v1 prefix if present since axiosFinancingPrivate already has it in base URL
        let endpoint = apiConfig.endpoint;
        if (endpoint.startsWith('/api/v1/')) {
          endpoint = endpoint.replace('/api/v1/', '/');
        }

        // Prepare query params
        const params: Record<string, any> = {};
        if (apiConfig.query_params) {
          Object.entries(apiConfig.query_params).forEach(([paramKey, paramValue]) => {
            if (paramValue === 'submission_id' && submissionId) {
              params[paramKey] = submissionId;
            } else if (paramValue === 'product_slug' && productSlug) {
              params[paramKey] = productSlug;
            } else {
              // Pass the raw value from config
              params[paramKey] = paramValue;
            }
          });
        }

        // Add country parameter for all buyer API calls
        params.country = COUNTRY;

        console.log('📤 Fetching buyers from', endpoint, 'with country:', COUNTRY);
        const response = await axiosFinancingPrivate.request({
          method: apiConfig.method || 'GET',
          url: endpoint,
          params,
        });

        const responseData = apiConfig.response_key
          ? response.data?.[apiConfig.response_key]
          : response.data;

        if (Array.isArray(responseData)) {
          const displayFields = apiConfig.display_fields || {};
          
          // Helper function to get nested value using dot notation
          const getNestedValue = (obj: any, path: string) => {
            return path.split('.').reduce((current, key) => current?.[key], obj);
          };

          const mappedBuyers: Buyer[] = responseData.map(
            (item: any, index: number) => {
              const idPath = apiConfig.item_identifier || 'id';
              const id = getNestedValue(item, idPath) || item.id || `buyer-${index}`;

              const namePath = displayFields.name || 'name';
              const name = getNestedValue(item, namePath) || item.name;

              const companyNamePath = displayFields.company_name || 'company_name';
              const title = getNestedValue(item, companyNamePath) || 
                           item.company_name || 
                           'Unknown Provider';

              const locationPath = displayFields.location || 'location';
              const location = getNestedValue(item, locationPath) || item.location;

              const gpsPath = displayFields.ghana_post_gps || 'ghana_post_gps';
              const gps = getNestedValue(item, gpsPath) || 
                         item.ghana_post_gps || 
                         location || 
                         'N/A';

              const imageUrlPath = displayFields.image_url || 'image_url';
              const logoUrlPath = displayFields.logo_url || 'logo_url';
              const imageUrl =
                getNestedValue(item, imageUrlPath) ||
                getNestedValue(item, logoUrlPath) ||
                item.attributes?.logo_url ||
                item.logo_url ||
                item.image_url;

              const cropsPath = displayFields.crops || 'crops';
              let crops = getNestedValue(item, cropsPath) || item.crops || [];

              // Ensure crops is always an array
              if (typeof crops === 'string') {
                try {
                  // Try checking if it's a JSON stringified array
                  if (crops.trim().startsWith('[') && crops.trim().endsWith(']')) {
                     const parsed = JSON.parse(crops);
                     if (Array.isArray(parsed)) {
                       crops = parsed;
                     }
                  } else {
                     // Assume comma separated
                     crops = crops.split(',').map((c: string) => c.trim());
                  }
                } catch (e) {
                  // Fallback for JSON parse errors
                  crops = crops.split(',').map((c: string) => c.trim());
                }
                
                // Final safety check if the above logic failed to produce an array (shouldn't happen with split, but good for TS)
                if (!Array.isArray(crops)) { 
                    // If JSON.parse returned non-array (though we checked)
                    crops = [crops.toString()];
                }
              } else if (!Array.isArray(crops)) {
                crops = [];
              }

              const phonePath = displayFields.phone_number || 'phone_number';
              const phone_number = getNestedValue(item, phonePath) || item.phone_number;

              const has_catalog = item.attributes?.has_catalog ?? item.has_catalog ?? true;
              const purchase_disabled_message = item.attributes?.purchase_disabled_message || item.purchase_disabled_message;
              const accepts_provider_credit = item.attributes?.accepts_provider_credit ?? item.accepts_provider_credit;
              const provider_credit_disabled_message = item.attributes?.provider_credit_disabled_message || item.provider_credit_disabled_message;

              return {
                id,
                uuid: item.uuid || id,
                name,
                title,
                company_name: title,
                gps,
                ghana_post_gps: gps,
                image: imageUrl
                  ? { uri: imageUrl }
                  : PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length],
                image_url: imageUrl,
                crops,
                location,
                phone_number,
                has_catalog,
                purchase_disabled_message,
                accepts_provider_credit,
                provider_credit_disabled_message,
              };
            },
          );
          setBuyers(mappedBuyers);
        }
      } catch (err: any) {
        console.log('Failed to fetch buyers:', err);
        setError(err?.message || 'Failed to load buyers');
        // Fall back to static data on error
        setBuyers([
          {
            id: 'b1',
            title: 'Maize Buying Company',
            gps: 'AK-968-8687',
            image: VerifiedCorn,
          },
          {
            id: 'b2',
            title: 'Maize Buying Company',
            gps: 'AK-635-8658',
            image: VerifiedTractor,
          },
          {
            id: 'b3',
            title: 'Agro Processing Ltd',
            gps: 'AK-222-3399',
            image: VerifiedCorn,
          },
          {
            id: 'b4',
            title: 'Harvest Traders',
            gps: 'AK-110-8899',
            image: VerifiedTractor,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyers();
  }, [apiConfig, isSellHarvestFlow, initiateFsaStaticFlow]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return buyers;
    return buyers.filter(
      b =>
        b.title.toLowerCase().includes(q) ||
        b.gps.toLowerCase().includes(q) ||
        (b.name?.toLowerCase().includes(q) ?? false),
    );
  }, [query, buyers]);

  const renderItem: ListRenderItem<Buyer> = ({ item }) => (
    <BuyerCard
      title={item.title}
      gps={item.gps}
      image={item.image}
      acceptsProviderCredit={item.accepts_provider_credit}
      onPress={() =>
        navigation.navigate('VerifiedBuyerDetails', { 
          buyer: {
            ...item,
            deals: item.crops?.map(crop => capitalizeCropName(crop)),
          }, 
          fsaSteps, 
          productSlug, 
          submissionId,
          harvestData,
          selectedOption,
          harvestDetailId,
          initiateFsaStaticFlow,
        })
      }
    />
  );

  const renderMoreItem: ListRenderItem<Buyer> = ({ item }) => (
    <ViewMoreBuyerCard
      title={item.title}
      gps={item.gps}
      image={item.image}
      crops={item.crops}
      acceptsProviderCredit={item.accepts_provider_credit}
      onPress={() =>
        navigation.navigate('VerifiedBuyerDetails', { 
          buyer: {
            ...item,
            deals: item.crops?.map(crop => capitalizeCropName(crop)),
          }, 
          fsaSteps, 
          productSlug, 
          submissionId,
          harvestData,
          selectedOption,
          harvestDetailId,
          initiateFsaStaticFlow,
        })
      }
    />
  );

  // Determine if we should use "Provider" terminology (for buy-inputs) or "Buyer" terminology
  const isProviderFlow = productSlug === 'buy-inputs';

  // Get step title from config or use default
  // For buy-inputs in "View More" mode, show "Select Registered Input Provider"
  const screenTitle = useMemo(() => {
    if (isProviderFlow && showMore) {
      return 'Select Registered Input Provider';
    }
    return fsaStep?.title || 'Government Verified Buyers';
  }, [fsaStep?.title, isProviderFlow, showMore]);
  const entityName = isProviderFlow ? 'Provider' : 'Buyer';
  const entityNamePlural = isProviderFlow ? 'Providers' : 'Buyers';
  const entityNameLower = isProviderFlow ? 'provider' : 'buyer';
  const entityNamePluralLower = isProviderFlow ? 'providers' : 'buyers';

  const handleSearchChange = (text: string) => {
    setQuery(text);
  };

  // Content for non-showMore mode (banner, horizontal list, view more button)
  const renderDefaultContent = () => (
    <>
      {loading && (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <ActivityIndicator size="large" color="#1D3A70" />
          <UITypography
            variant="regular"
            style={{ marginTop: 12, color: '#666' }}
          >
            Loading {entityNamePluralLower}...
          </UITypography>
        </View>
      )}

      {!loading && (
        <>
          <View style={styles.bannerWrap}>
            <Image
              source={isProviderFlow ? BuyInputBanner : VerfiedBanner}
              style={styles.bannerCard}
              resizeMode="contain"
            />
          </View>

          <UITypography variant="semiBold" style={styles.sectionTitle}>
            Find {entityNamePlural} Near You
          </UITypography>
          <UITypography variant="regular" style={styles.sectionSub}>
            {entityNamePlural} in your districts/regions
          </UITypography>

          <View style={styles.listWrap}>
            <FlatList
              data={filtered}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={Separator}
              contentContainerStyle={styles.horizontalContent}
            />
          </View>

          {filtered.length > 0 && (
            <TouchableOpacity
              style={styles.viewMoreBtn}
              activeOpacity={0.8}
              onPress={() => setShowMore(true)}
            >
              <UITypography variant="medium" style={styles.viewMoreText}>
                View More
              </UITypography>
            </TouchableOpacity>
          )}

          {filtered.length === 0 && query.trim().length > 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <UITypography variant="regular" style={{ color: '#666' }}>
                No {entityNamePluralLower} found. Try a different search term.
              </UITypography>
            </View>
          )}
        </>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <LoanScreenHeader
        title={screenTitle}
        onBack={() => navigation.goBack()}
        containerStyle={[styles.header, { marginTop: top }]}
      />

      {/* Search input rendered OUTSIDE FlatList to prevent remounting on state change */}
      <View style={[styles.content, { paddingBottom: 0 }]}>
        <View style={styles.searchWrap}>
          <UISearchInput
            value={query}
            onChangeText={handleSearchChange}
            onSearch={setQuery}
            placeholder={
              productSlug === 'buy-inputs'
                ? 'Search input provider by name'
                : undefined
            }
          />
        </View>
      </View>

      {!loading && showMore ? (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderMoreItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingTop: 16 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            query.trim().length > 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <UITypography variant="regular" style={{ color: '#666' }}>
                  No {entityNamePluralLower} found. Try a different search term.
                </UITypography>
              </View>
            ) : null
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: 0 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {renderDefaultContent()}
        </ScrollView>
      )}
    </View>
  );
}
