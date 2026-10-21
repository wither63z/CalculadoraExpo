import { StyleSheet, Text, type TextProps } from 'react-native';

type CustomTextVariant = 'big' | 'small' | 'button' | 'eyebrow' | 'title' | 'footer';

type CustomTextProps = TextProps & {
  variant: CustomTextVariant;
};

export default function CustomText({
  variant,
  numberOfLines,
  adjustsFontSizeToFit,
  style,
  ...textProps
}: CustomTextProps) {
  const isResult = variant === 'big';

  return (
    <Text
      {...textProps}
      numberOfLines={isResult ? 1 : numberOfLines}
      adjustsFontSizeToFit={isResult ? true : adjustsFontSizeToFit}
      style={[styles[variant], style]}
    />
  );
}

const styles = StyleSheet.create({
  big: {
    color: '#FFF9EF',
    fontSize: 54,
    fontWeight: '300',
    letterSpacing: -1,
  },
  small: {
    color: '#9EABB5',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 8,
  },
  button: {
    color: '#F7F1E8',
    fontSize: 22,
    fontWeight: '600',
  },
  eyebrow: {
    color: '#7D7569',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    color: '#1B2430',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 3,
  },
  footer: {
    color: '#7D7569',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 14,
  },
});
