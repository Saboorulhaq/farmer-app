import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

// Simple event emitter for auth state changes
type EventCallback = () => void;
class SimpleEventEmitter {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }
}

export const authEventEmitter = new SimpleEventEmitter();
export const AUTH_LOGOUT_EVENT = 'auth:logout';

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    // @ts-ignore - Navigation ref types are complex, but this works at runtime
    navigationRef.navigate(name, params);
  }
}

export function reset(name: string, params?: any) {
  if (navigationRef.isReady()) {
    // @ts-ignore - Navigation ref types are complex, but this works at runtime
    navigationRef.reset({
      index: 0,
      routes: [{ name, params }],
    });
  }
}

