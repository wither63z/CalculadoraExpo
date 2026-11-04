import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';

import { CalculatorColors } from '@/constants/Colors';
import CustomText from './CustomText';

type CalculatorButtonVariant = 'number' | 'utility' | 'operator';

type CalculatorButtonProps = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  doubleWidth?: boolean;
  variant?: CalculatorButtonVariant;
};

export default function CalculatorButton({
  label,
  onPress,
  accessibilityLabel,
  doubleWidth = false,
  variant = 'number',
}: CalculatorButtonProps) {
  function handlePress() {
    void Haptics.selectionAsync();
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        doubleWidth && styles.doubleWidth,
        variant === 'utility' && styles.utilityButton,
        variant === 'operator' && styles.operatorButton,
        pressed && styles.pressed,
      ]}
    >
      <CustomText
        variant="button"
        style={variant === 'utility' ? styles.darkText : undefined}
      >
        {label}
      </CustomText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexBasis: '22%',
    flexGrow: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: CalculatorColors.key,
  },
  doubleWidth: {
    flexBasis: '47%',
    aspectRatio: 2.15,
    alignItems: 'flex-start',
    paddingLeft: 26,
  },
  utilityButton: {
    backgroundColor: CalculatorColors.utilityKey,
  },
  operatorButton: {
    backgroundColor: CalculatorColors.operatorKey,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
  darkText: {
    color: CalculatorColors.darkText,
  },
});
