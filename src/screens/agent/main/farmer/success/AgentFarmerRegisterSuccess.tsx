import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./AgentFarmerRegisterSuccess.styled";
import { UIContainedButton, UITypography } from "@/components/ui";
import { Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAgent } from "@/constants/context/agent/context";

export default function AgentFarmerRegisterSuccesss() {
  const { replace } = useNavigation();
  const { top, bottom } = useSafeAreaInsets();
  const { refresh } = useAgent();
  const handleDashboard = () => {
    replace("Main");
    refresh();
  };

  return (
    <View
      style={[
        styles.scrollView,
        {
          paddingTop: top + 20,
        },
      ]}
    >
      <Image
        source={require("@/assets/gifs/success.gif")}
        style={{ width: 200, height: 200 }}
      />
      <UITypography
        variant="medium"
        style={{ fontSize: 36, textAlign: "center", marginBottom: 16 }}
      >
        Congratulations!
      </UITypography>
      <UITypography
        variant="medium"
        style={{
          fontSize: 16,
          textAlign: "center",
          color: "#404040",
          marginBottom: 16,
        }}
      >
        Farmer has been successfully registered.
      </UITypography>
      <UIContainedButton onPress={handleDashboard}>
        Go to Dashboard
      </UIContainedButton>
    </View>
  );
}
