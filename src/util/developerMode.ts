import { NativeModules, Platform } from 'react-native';

const { DeveloperModeModule } = NativeModules;

export async function isDeveloperModeEnabled(): Promise<boolean> {
  if (Platform.OS === 'android' && DeveloperModeModule) {
    try {
      return await DeveloperModeModule.isDeveloperModeEnabled();
    } catch {
      return false;
    }
  }
  return false;
}
