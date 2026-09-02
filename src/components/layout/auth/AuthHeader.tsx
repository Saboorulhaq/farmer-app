import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import { UIIconButton, UITypography } from "@/components/ui";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { styles } from "./AuthHeader.styled";

export default function AuthHeader({
  title,
  stepper,
}: {
  title: string;
  stepper?: {
    currentStep: number;
    totalSteps: number;
  };
}) {
  const { goBack } = useNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <UIIconButton onPress={goBack} style={styles.backButton}>
          <ArrowLeftIcon />
        </UIIconButton>

        <UITypography variant="semiBold" style={styles.headerTitle}>
          {title}
        </UITypography>
      </View>

      {stepper && (
        <>
          <UITypography variant="semiBold" style={styles.stepText}>
            STEP {stepper.currentStep} OF {stepper.totalSteps}
          </UITypography>
          <View style={styles.stepContainer}>
            {Array.from({ length: stepper.totalSteps }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.step,
                  index < stepper.currentStep
                    ? styles.stepActive
                    : styles.stepInactive,
                ]}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}
