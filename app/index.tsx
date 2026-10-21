import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '../components/CustomText';

function Boton({
  label,
  compact,
  doubleWidth = false,
  light = false,
  blue = false,
}: {
  label: string;
  compact: boolean;
  doubleWidth?: boolean;
  light?: boolean;
  blue?: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.button,
        compact && styles.compactButton,
        doubleWidth && styles.doubleWidthButton,
        compact && doubleWidth && styles.compactDoubleWidthButton,
        light && styles.lightButton,
        blue && styles.blueButton,
      ]}
    >
      <CustomText
        variant="button"
        style={light ? styles.darkButtonText : undefined}
      >
        {label}
      </CustomText>
    </TouchableOpacity>
  );
}

export default function CalculatorScreen() {
  const { height } = useWindowDimensions();
  const compact = height <= 700;

  return (
    <SafeAreaView style={[styles.screen, compact && styles.compactScreen]}>
      <View style={[styles.calculator, compact && styles.compactCalculator]}>
        <View style={[styles.display, compact && styles.compactDisplay]}>
          <CustomText variant="big">0</CustomText>
        </View>

        <View style={[styles.keypad, compact && styles.compactKeypad]}>
          <Boton label="C" compact={compact} light />
          <Boton label="+/−" compact={compact} light />
          <Boton label="%" compact={compact} light />
          <Boton label="÷" compact={compact} blue />

          <Boton label="7" compact={compact} />
          <Boton label="8" compact={compact} />
          <Boton label="9" compact={compact} />
          <Boton label="×" compact={compact} blue />

          <Boton label="4" compact={compact} />
          <Boton label="5" compact={compact} />
          <Boton label="6" compact={compact} />
          <Boton label="−" compact={compact} blue />

          <Boton label="1" compact={compact} />
          <Boton label="2" compact={compact} />
          <Boton label="3" compact={compact} />
          <Boton label="+" compact={compact} blue />

          <Boton label="0" compact={compact} doubleWidth />
          <Boton label="." compact={compact} />
          <Boton label="=" compact={compact} blue />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#17212B',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  compactScreen: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  calculator: {
    flex: 1,
    padding: 16,
  },
  compactCalculator: {
    padding: 8,
  },
  display: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  compactDisplay: {
    flex: 1,
    paddingBottom: 12,
  },
  keypad: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    justifyContent: 'center',
    columnGap: 24,
    rowGap: 24,
  },
  compactKeypad: {
    flex: 1.55,
    columnGap: 12,
    rowGap: 12,
  },
  button: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: '#263440',
  },
  doubleWidthButton: {
    width: 152,
    alignItems: 'flex-start',
    paddingLeft: 24,
  },
  compactButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  compactDoubleWidthButton: {
    width: 128,
    paddingLeft: 20,
  },
  lightButton: {
    backgroundColor: '#A5ADB5',
  },
  blueButton: {
    backgroundColor: '#517697',
  },
  darkButtonText: {
    color: '#17212B',
  },
});
