import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import DeviceInfo from 'react-native-device-info';

interface DeviceState {
  uniqueId: string | null;
  loading: boolean;
}

export const useDeviceStore = create<DeviceState>()(
  persist(
    set => ({
      uniqueId: null,
      loading: true,
    }),
    {
      name: 'device-storage',
    },
  ),
);

(async () => {
  const { uniqueId, loading } = useDeviceStore.getState();
  if (!uniqueId && loading) {
    try {
      const id = await DeviceInfo.getUniqueId();
      useDeviceStore.setState({ uniqueId: id, loading: false });
    } catch (error) {
      console.log('Error fetching device unique ID:', error);
      useDeviceStore.setState({ loading: false });
    }
  } else {
    useDeviceStore.setState({ loading: false });
  }
})();
