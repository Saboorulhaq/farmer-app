import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosPublic } from '@/config/axios';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

type FeatureFlag = {
  disabled?: boolean;
  enabled?: boolean;
};

type AppVersionInfo = {
  app_name?: string;
  version?: string;
  build_number?: string;
  release_date?: string;
  platform?: string;
};

type AppVersions = {
  ios?: {
    internal?: AppVersionInfo | null;
    app_store?: AppVersionInfo | null;
  };
  android?: {
    internal?: AppVersionInfo | null;
    play_store?: AppVersionInfo | null;
  };
};

type UiFeatureToggles = {
  maintenance_mode?: {
    enabled?: boolean;
  };
  app_names?: Record<string, string>;
  home_cards?: Record<string, FeatureFlag>;
  bottom_nav?: Record<string, FeatureFlag>;
  custom_urls?: Record<string, string>;
  app_versions?: AppVersions;
};

interface UiFeatureTogglesResponse {
  data?: {
    type?: string;
    attributes?: UiFeatureToggles;
  };
}

interface AppConfigState {
  appName: string;
  uiFeatureToggles: UiFeatureToggles | null;
  togglesLoading: boolean;
  togglesError: string | null;
  fetchUiFeatureToggles: () => Promise<void>;
  isMaintenanceModeEnabled: () => boolean;
  isHomeCardDisabled: (slug: string) => boolean;
  isBottomNavItemDisabled: (itemKey: string) => boolean;
  isUpdateRequired: () => boolean;
}

const DEFAULT_APP_NAME = 'AKUAFOO ANIDASOO';

// Custom storage adapter that handles errors gracefully
const createSafeStorage = () => {
  return {
    getItem: async (name: string): Promise<string | null> => {
      try {
        return await AsyncStorage.getItem(name);
      } catch (error) {
        console.log(`Error reading from storage (${name}):`, error);
        return null;
      }
    },
    setItem: async (name: string, value: string): Promise<void> => {
      try {
        await AsyncStorage.setItem(name, value);
      } catch (error) {
        // Silently handle storage errors - state will still be in memory
        console.log(`Error writing to storage (${name}):`, error);
      }
    },
    removeItem: async (name: string): Promise<void> => {
      try {
        await AsyncStorage.removeItem(name);
      } catch (error) {
        console.log(`Error removing from storage (${name}):`, error);
      }
    },
  };
};

export const useAppConfigStore = create<AppConfigState>()(
  persist(
    (set, get) => ({
      appName: DEFAULT_APP_NAME,
      uiFeatureToggles: null,
      togglesLoading: false,
      togglesError: null,

      fetchUiFeatureToggles: async () => {
        if (get().togglesLoading) return;

        set({ togglesLoading: true, togglesError: null });

        try {
          const response = await axiosPublic.get<UiFeatureTogglesResponse>('/ui_feature_toggles');
          const attributes = response.data?.data?.attributes;

          if (attributes) {
            set({
              appName: attributes.app_names?.farmer || DEFAULT_APP_NAME,
              uiFeatureToggles: attributes,
              togglesLoading: false,
              togglesError: null,
            });
            return;
          }

          set({ togglesLoading: false });
        } catch (error: any) {
          console.log('Error fetching ui feature toggles:', error?.message || error);
          set({
            togglesLoading: false,
            togglesError: error?.message || 'Failed to fetch ui feature toggles',
          });
        }
      },

      isMaintenanceModeEnabled: () => {
        return get().uiFeatureToggles?.maintenance_mode?.enabled === true;
      },

      isHomeCardDisabled: (slug: string) => {
        return get().uiFeatureToggles?.home_cards?.[slug]?.disabled === true;
      },

      isBottomNavItemDisabled: (itemKey: string) => {
        return get().uiFeatureToggles?.bottom_nav?.[itemKey]?.disabled === true;
      },

      isUpdateRequired: () => {
        const appVersions = get().uiFeatureToggles?.app_versions;
        if (!appVersions) return false;

        const platform = Platform.OS;
        if (platform !== 'ios' && platform !== 'android') return false;

        const platformVersions = appVersions[platform];
        if (!platformVersions) return false;

        // Check internal build number
        const serverVersion = platformVersions.internal;
        if (!serverVersion?.build_number) return false;

        const currentBuildNumber = Number(DeviceInfo.getBuildNumber());
        const currentVersion = DeviceInfo.getVersion();
        const serverBuildNumber = Number(serverVersion.build_number);

        console.log(`📱 Device version: ${currentVersion}, build: ${currentBuildNumber} | Server version: ${serverVersion.version}, build: ${serverBuildNumber}`);

        if (isNaN(currentBuildNumber) || isNaN(serverBuildNumber)) return false;

        return currentBuildNumber < serverBuildNumber;
      },
    }),
    {
      name: 'app-config-storage',
      storage: createJSONStorage(() => createSafeStorage()),
      partialize: (state) => ({
        appName: state.appName,
        uiFeatureToggles: state.uiFeatureToggles,
      }),
      // Handle storage errors gracefully
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.log('Error rehydrating app config:', error);
        }
      },
    },
  ),
);

// Fetch UI feature toggles on app start (includes app name under app_names.farmer).
useAppConfigStore.getState().fetchUiFeatureToggles();
