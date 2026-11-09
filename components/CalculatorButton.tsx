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
  compact?: boolean;
  dense?: boolean;
  keyHeight?: number;
  toolbar?: boolean;
  historyItem?: boolean;
  variant?: CalculatorButtonVariant;
};

export default function CalculatorButton({
  label,
  onPress,
  accessibilityLabel,
  doubleWidth = false,
  compact = false,
  dense = false,
  keyHeight = 44,
  toolbar = false,
  historyItem = false,
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
      hitSlop={4}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        doubleWidth && styles.doubleWidth,
        compact && styles.compactButton,
        dense && !doubleWidth && styles.denseButton,
        dense && doubleWidth && styles.denseDoubleWidth,
        !toolbar && (compact || dense) && { height: keyHeight },
        toolbar && styles.toolbarButton,
        historyItem && styles.historyItemButton,
        variant === 'utility' && styles.utilityButton,
        variant === 'operator' && styles.operatorButton,
        pressed && styles.pressed,
      ]}
    >
      <CustomText
        variant="button"
        numberOfLines={historyItem ? 1 : undefined}
        adjustsFontSizeToFit={historyItem}
        style={[
          variant === 'utility' && styles.darkText,
          compact && styles.compactText,
          historyItem && styles.historyItemText,
        ]}
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
  compactButton: {
    flexBasis: '18.4%',
    flexGrow: 0,
    width: '18.4%',
    aspectRatio: undefined,
    borderRadius: 24,
  },
  denseButton: {
    flexBasis: '22%',
    flexGrow: 0,
    aspectRatio: undefined,
  },
  denseDoubleWidth: {
    aspectRatio: undefined,
  },
  toolbarButton: {
    flexBasis: 'auto',
    flexGrow: 0,
    aspectRatio: undefined,
    height: 44,
    minWidth: 78,
  },
  historyItemButton: {
    flexBasis: '100%',
    flexGrow: 0,
    aspectRatio: undefined,
    width: '100%',
    height: 48,
    minWidth: 0,
    borderRadius: 16,
    paddingHorizontal: 12,
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
  compactText: {
    fontSize: 16,
  },
  historyItemText: {
    fontSize: 17,
  },
});
