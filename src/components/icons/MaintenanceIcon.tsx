import React from "react";
import { Image } from "react-native";

export default function MaintenanceIcon({ width = 214, height = 213 }) {
  return (
    <Image
      source={require('@/assets/images/maintain.png')}
      style={{ width, height }}
      resizeMode="contain"
    />
  );
}
