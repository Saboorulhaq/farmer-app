import React, { createContext, useContext, useEffect, useState } from "react";
import { axiosPrivate, axiosPublic } from "@/config/axios";
import { Toast } from "toastify-react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";

export type Farmer = {
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
  FarmerStack: undefined;
  FarmerAuthStack: { screen: string };
};

type FarmerContextType = {
  farmer: Farmer | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const FarmerContext = createContext<FarmerContextType | undefined>(undefined);

export const useFarmer = () => {
  const ctx = useContext(FarmerContext);
  if (!ctx) throw new Error("useFarmer must be used within FarmerProvider");
  return ctx;
};

export const FarmerProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);

  console.log(farmer?.attributes?.farmers_count);

  const fetchFarmer = async () => {
    setLoading(true);
    try {
      const res = await axiosPrivate.get("/users/me");
      setFarmer(res.data?.data);
    } catch (error: any) {
      const status = error?.response?.status;
      // Skip handling 401 if it's already handled globally by axios interceptor
      if (status === 401 && !(error as any).__handledGlobally) {
        Toast.error("Failed to fetch farmer");
        navigation.navigate("FarmerAuthStack", { screen: "FarmerMain" });
      } else if (status === 401) {
        // 401 already handled globally, just log
        console.log("401 error already handled globally by axios interceptor");
      } else {
        console.warn("Failed to fetch farmer", error?.response?.status || error?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmer();
  }, []);

  return (
    <FarmerContext.Provider value={{ farmer, loading, refresh: fetchFarmer }}>
      {children}
    </FarmerContext.Provider>
  );
};