import React from 'react';
import { View } from 'react-native';
import SwitchToggle from 'react-native-switch-toggle';
import { styles } from './index.styled';

type UIToggleSwitchProps = {
  value: boolean;
  onToggle: () => void;
  labelLeft?: string;
  labelRight?: string;
  disabled?: boolean;
};

export default function UIToggleSwitch({
  value,
  onToggle,
  labelLeft = 'YES',
  labelRight = 'NO',
  disabled = false,
}: UIToggleSwitchProps) {
  return (
    <View style={disabled ? styles.containerDisabled : undefined}>
      <SwitchToggle
        switchOn={value}
        type={1}
        onPress={disabled ? () => {} : onToggle}
        containerStyle={styles.container}
        circleStyle={styles.circle}
        leftContainerStyle={styles.leftLabelWrap}
        rightContainerStyle={styles.rightLabelWrap}
        backgroundColorOn="#099453"
        backgroundColorOff="#E2E2E2"
        circleColorOn="#FFFFFF"
        circleColorOff="#FFFFFF"
        backTextLeft={value ? labelLeft : ''}
        textLeftStyle={styles.label}
        backTextRight={!value ? labelRight : ''}
        textRightStyle={styles.label}
      />
    </View>
  );
}
