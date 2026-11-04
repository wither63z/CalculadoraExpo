import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalculatorButton from '@/components/CalculatorButton';
import CustomText from '@/components/CustomText';
import { CalculatorColors } from '@/constants/Colors';
import { type CalculatorKey, useCalculator } from '@/src/hooks';

type ButtonConfig = {
  label: string;
  value: CalculatorKey;
  accessibilityLabel?: string;
  doubleWidth?: boolean;
  variant?: 'number' | 'utility' | 'operator';
};

const buttons: ButtonConfig[] = [
  { label: 'AC', value: 'AC', variant: 'utility' },
  { label: '+/−', value: '±', variant: 'utility' },
  {
    label: '⌫',
    value: '⌫',
    accessibilityLabel: 'Borrar último dígito',
    variant: 'utility',
  },
  { label: '÷', value: '÷', variant: 'operator' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '×', value: '×', variant: 'operator' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '−', value: '−', variant: 'operator' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '+', value: '+', variant: 'operator' },
  { label: '0', value: '0', doubleWidth: true },
  { label: '.', value: '.' },
  { label: '=', value: '=', variant: 'operator' },
];

export default function CalculatorScreen() {
  const { display, press } = useCalculator();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.calculator}>
        <View
          accessibilityRole="text"
          accessibilityLabel={`Resultado: ${display}`}
          style={styles.display}
        >
          <CustomText variant="big">{display}</CustomText>
        </View>

        <View style={styles.keypad}>
          {buttons.map((button) => (
            <CalculatorButton
              key={button.value}
              label={button.label}
              accessibilityLabel={button.accessibilityLabel}
              doubleWidth={button.doubleWidth}
              variant={button.variant}
              onPress={() => press(button.value)}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CalculatorColors.background,
  },
  calculator: {
    flex: 1,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  display: {
    flex: 1,
    minHeight: 120,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 22,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
});
