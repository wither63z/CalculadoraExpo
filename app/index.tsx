import { useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
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
  compact?: boolean;
  variant?: 'number' | 'utility' | 'operator';
};

const basicButtons: ButtonConfig[] = [
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

const scientificButtons: ButtonConfig[] = [
  { label: '(', value: '(', compact: true, variant: 'utility' },
  { label: ')', value: ')', compact: true, variant: 'utility' },
  { label: 'sin', value: 'sin', compact: true, variant: 'operator' },
  { label: 'cos', value: 'cos', compact: true, variant: 'operator' },
  { label: 'tan', value: 'tan', compact: true, variant: 'operator' },
  { label: 'xʸ', value: '^', compact: true, variant: 'operator' },
  { label: '√', value: 'sqrt', compact: true, variant: 'operator' },
  { label: 'x²', value: 'square', compact: true, variant: 'operator' },
  { label: 'log', value: 'log', compact: true, variant: 'operator' },
  { label: 'ln', value: 'ln', compact: true, variant: 'operator' },
  { label: '1/x', value: 'reciprocal', compact: true, variant: 'operator' },
  { label: '10ˣ', value: 'powerOfTen', compact: true, variant: 'operator' },
  { label: 'π', value: 'pi', compact: true, variant: 'operator' },
  { label: 'e', value: 'e', compact: true, variant: 'operator' },
];

export default function CalculatorScreen() {
  const {
    display,
    expression,
    history,
    press,
    useDegrees,
    toggleAngleMode,
    clearHistory,
    restoreHistoryItem,
  } = useCalculator();
  const [scientificMode, setScientificMode] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { height } = useWindowDimensions();
  // Ocho filas en modo científico: reduce las teclas solo en teléfonos bajos.
  const keyHeight = Math.round(Math.max(38, Math.min(56, (height - 280) / 8)));

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.calculator}>
        <View style={styles.toolbar}>
          {scientificMode && !historyOpen && (
            <CalculatorButton
              label={useDegrees ? 'DEG' : 'RAD'}
              accessibilityLabel={`Cambiar a ${useDegrees ? 'radianes' : 'grados'}`}
              compact
              toolbar
              variant="utility"
              onPress={toggleAngleMode}
            />
          )}
          <CalculatorButton
            label={
              historyOpen
                ? 'Calculadora'
                : scientificMode
                  ? 'BÁSICA'
                  : 'Científica'
            }
            accessibilityLabel={
              historyOpen
                ? 'Volver a la calculadora'
                : scientificMode
                  ? 'Mostrar calculadora básica'
                  : 'Mostrar calculadora científica'
            }
            compact
            toolbar
            variant="utility"
            onPress={() => {
              if (historyOpen) {
                setHistoryOpen(false);
              } else {
                setScientificMode((current) => !current);
              }
            }}
          />
          <CalculatorButton
            label={historyOpen ? 'Borrar' : `Historial ${history.length}`}
            accessibilityLabel={historyOpen ? 'Borrar historial' : 'Abrir historial'}
            compact
            toolbar
            variant="utility"
            onPress={() => {
              if (historyOpen) {
                clearHistory();
              } else {
                setHistoryOpen(true);
              }
            }}
          />
        </View>
        <View style={styles.expression}>
          <CustomText
            variant="small"
            numberOfLines={1}
            adjustsFontSizeToFit
            accessibilityLabel={`Expresión: ${expression || 'vacía'}`}
          >
            {expression}
          </CustomText>
        </View>
        <View
          accessibilityRole="text"
          accessibilityLabel={`Resultado: ${display}`}
          style={styles.display}
        >
          <CustomText variant="big">{display}</CustomText>
        </View>

        {historyOpen ? (
          <View style={styles.historyPanel}>
            {history.length === 0 ? (
              <CustomText variant="small" style={styles.emptyHistory}>
                Todavía no hay operaciones
              </CustomText>
            ) : (
              <FlatList
                data={history}
                keyExtractor={(item) => String(item.id)}
                style={styles.historyList}
                contentContainerStyle={styles.historyContent}
                renderItem={({ item }) => (
                  <CalculatorButton
                    label={`${item.expression} = ${item.result}`}
                    accessibilityLabel={`${item.expression} igual a ${item.result}. Tocar para reutilizar`}
                    historyItem
                    variant="number"
                    onPress={() => {
                      restoreHistoryItem(item);
                      setHistoryOpen(false);
                    }}
                  />
                )}
              />
            )}
          </View>
        ) : (
          <>
            {scientificMode && (
              <View style={styles.scientificKeypad}>
                {scientificButtons.map((button) => (
                  <CalculatorButton
                    key={button.value}
                    label={button.label}
                    accessibilityLabel={button.accessibilityLabel}
                    compact={button.compact}
                    keyHeight={keyHeight}
                    variant={button.variant}
                    onPress={() => press(button.value)}
                  />
                ))}
              </View>
            )}

            <View style={styles.keypad}>
              {basicButtons.map((button) => (
                <CalculatorButton
                  key={button.value}
                  label={button.label}
                  accessibilityLabel={button.accessibilityLabel}
                  doubleWidth={button.doubleWidth}
                  dense={scientificMode}
                  keyHeight={keyHeight}
                  variant={button.variant}
                  onPress={() => press(button.value)}
                />
              ))}
            </View>
          </>
        )}
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
    paddingTop: 20,
    paddingBottom: 4,
  },
  toolbar: {
    minHeight: 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  display: {
    height: 88,
    minHeight: 88,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  expression: {
    height: 20,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
  },
  historyPanel: {
    flex: 1,
    minHeight: 0,
    paddingTop: 8,
    paddingBottom: 12,
  },
  historyList: {
    flex: 1,
  },
  historyContent: {
    gap: 8,
    paddingBottom: 8,
  },
  emptyHistory: {
    textAlign: 'center',
    paddingTop: 24,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  scientificKeypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 6,
  },
});
