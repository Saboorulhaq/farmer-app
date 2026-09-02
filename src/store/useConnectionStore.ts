import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';
import { Toast } from 'toastify-react-native';

export type ConnectionType = {
  visible: boolean;
  type: 'error' | 'success';
  title: string;
  message: string;
  buttonText?: string;
  loading?: boolean;
};

interface ConnectionState {
  connectionState: ConnectionType;
  showOffline: () => void;
  showOnline: () => void;
  checkConnection: () => void; // Remove navigation parameter
  close: () => void;
}

const initialState: ConnectionType = {
  visible: false,
  type: 'error',
  title: 'You are currently\noffline',
  message:
    '"You\'re currently offline. Check your connection and try again later."',
  buttonText: 'Try Again',
  loading: false,
};

export const useConnectionStore = create<ConnectionState>(set => ({
  connectionState: initialState,
  showOffline: () =>
    set({
      connectionState: {
        ...initialState,
        visible: true,
        loading: false,
      },
    }),
  showOnline: () =>
    set({
      connectionState: {
        visible: true,
        type: 'success',
        title: 'Online Connection\nRestored',
        message: '"Your internet connection was restored."',
        buttonText: 'Next',
        loading: false,
      },
    }),
  checkConnection: async () => {
    set(state => ({
      connectionState: {
        ...state.connectionState,
        loading: true,
        buttonText: 'Checking...',
      },
    }));
    const netInfoState = await NetInfo.fetch();
    if (netInfoState.isInternetReachable) {
      // Navigate to the ConnectivityScreen with online status
      set({
        connectionState: {
          visible: true,
          type: 'success',
          title: 'Online Connection\nRestored',
          message: '"Your internet connection was restored."',
          buttonText: 'Next',
          loading: false,
        },
      });
    } else {
      // Navigate to the ConnectivityScreen with offline status
      set(state => ({
        connectionState: {
          ...state.connectionState,
          loading: false,
          buttonText: 'Try Again',
        },
      }));
      Toast.show({
        type: 'error',
        text1: 'No Network',
        text2: 'You are still offline. Please check your connection.',
      });
    }
  },
  close: () =>
    set(state => ({ connectionState: { ...state.connectionState, visible: false } })),
}));