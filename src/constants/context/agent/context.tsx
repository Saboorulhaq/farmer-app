import React, { createContext, useContext, useEffect, useState } from 'react';
import { axiosPrivate, axiosPublic } from '@/config/axios';
import { Toast } from 'toastify-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useAuth } from '../auth/context';

export type Agent = {
  attributes: {
    id: string;
    name: string;
    email: string;
    is_approved: boolean;
    phone_number: boolean;
    farmers_count: number;
    images?: string[];
  };
};

type RootStackParamList = {
  AgentStack: undefined;
  FarmerAuthStack: { screen: string };
};

type AgentContextType = {
  agent: Agent | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const useAgent = () => {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('useAgent must be used within AgentProvider');
  return ctx;
};

export const AgentProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleLogout } = useAuth();

  console.log(agent?.attributes?.farmers_count);

  const fetchAgent = async () => {
    setLoading(true);
    try {
      const res = await axiosPrivate.get('/users/me');
      setAgent(res.data?.data);
    } catch (error: any) {
      const status = error?.response?.status;
      // Skip handling 401 if it's already handled globally by axios interceptor
      if (status === 401 && !(error as any).__handledGlobally) {
        Toast.error('Failed to fetch agent');
        handleLogout();
      } else if (status === 401) {
        // 401 already handled globally, just log
        console.log('401 error already handled globally by axios interceptor');
      } else {
        console.warn('Failed to fetch agent', error?.response?.status || error?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgent();
  }, []);

  return (
    <AgentContext.Provider value={{ agent, loading, refresh: fetchAgent }}>
      {children}
    </AgentContext.Provider>
  );
};
