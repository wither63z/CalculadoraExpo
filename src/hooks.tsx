import { useState } from 'react';

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type Operator = '+' | '−' | '×' | '÷' | '^';
type ScientificKey =
  | 'sin'
  | 'cos'
  | 'tan'
  | 'sqrt'
  | 'square'
  | 'log'
  | 'ln'
  | 'reciprocal'
  | 'powerOfTen'
  | 'pi'
  | 'e';

export type CalculatorKey =
  | Digit
  | Operator
  | ScientificKey
  | '('
  | ')'
  | 'AC'
  | '⌫'
  | '±'
  | '.'
  | '=';

export type CalculatorHistoryItem = {
  id: number;
  expression: string;
  result: string;
};

const MAX_ENTRY_DIGITS = 12;
// El tokenizador acepta únicamente símbolos conocidos; no ejecuta código dinámico.
const TOKEN_PATTERN =
  /(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|powerOfTen|reciprocal|square|sqrt|sin|cos|tan|log|ln|π|e|[()+−×÷^]/g;

function isDigit(key: CalculatorKey): key is Digit {
  return /^\d$/.test(key);
}

function isOperator(key: CalculatorKey): key is Operator {
  return key === '+' || key === '−' || key === '×' || key === '÷' || key === '^';
}

function formatNumber(value: number) {
  return String(Number(value.toFixed(10)));
}

function formatExpression(expression: string) {
  let formatted = '';
  let previous = '';

  for (const character of expression.replace(/\s/g, '')) {
    if (character === '=') {
      formatted = `${formatted.trimEnd()} = `;
    } else if ('+−×÷^'.includes(character)) {
      const isUnary = (character === '+' || character === '−') &&
        (!previous || '(+−×÷^'.includes(previous));
      formatted = isUnary
        ? `${formatted}${character}`
        : `${formatted.trimEnd()} ${character} `;
    } else {
      formatted += character;
    }
    previous = character;
  }

  return formatted.trim();
}

function applyFunction(name: string, value: number, useDegrees: boolean): number | null {
  let result: number;

  switch (name) {
    case 'sin':
      result = Math.sin(useDegrees ? (value % 360) * Math.PI / 180 : value);
      break;
    case 'cos':
      result = Math.cos(useDegrees ? (value % 360) * Math.PI / 180 : value);
      break;
    case 'tan': {
      const angle = useDegrees ? (value % 180) * Math.PI / 180 : value;
      if (Math.abs(Math.cos(angle)) < 1e-12) {
        return null;
      }
      result = Math.tan(angle);
      break;
    }
    case 'sqrt':
      if (value < 0) {
        return null;
      }
      result = Math.sqrt(value);
      break;
    case 'square':
      result = value ** 2;
      break;
    case 'log':
      if (value <= 0) {
        return null;
      }
      result = Math.log10(value);
      break;
    case 'ln':
      if (value <= 0) {
        return null;
      }
      result = Math.log(value);
      break;
    case 'reciprocal':
      if (value === 0) {
        return null;
      }
      result = 1 / value;
      break;
    case 'powerOfTen':
      result = 10 ** value;
      break;
    default:
      return null;
  }

  return Number.isFinite(result) ? result : null;
}

export function evaluateExpression(
  expression: string,
  useDegrees: boolean,
): number | null {
  const compact = expression.replace(/\s/g, '');
  const tokens = compact.match(TOKEN_PATTERN) ?? [];
  if (!compact || tokens.join('') !== compact) {
    return null;
  }

  // Parser descendente: cada función representa un nivel de precedencia.
  let position = 0;
  const current = () => tokens[position];

  function parsePrimary(): number | null {
    const token = current();
    if (!token) {
      return null;
    }

    if (/^(?:\d|\.)/.test(token)) {
      position += 1;
      const value = Number(token);
      return Number.isFinite(value) ? value : null;
    }

    if (token === 'π' || token === 'e') {
      position += 1;
      return token === 'π' ? Math.PI : Math.E;
    }

    if (
      token === 'sin' || token === 'cos' || token === 'tan' || token === 'sqrt' ||
      token === 'square' || token === 'log' || token === 'ln' ||
      token === 'reciprocal' || token === 'powerOfTen'
    ) {
      position += 1;
      if (current() !== '(') {
        return null;
      }
      position += 1;
      const value = parseAdditive();
      if (value === null || current() !== ')') {
        return null;
      }
      position += 1;
      return applyFunction(token, value, useDegrees);
    }

    if (token === '(') {
      position += 1;
      const value = parseAdditive();
      if (value === null || current() !== ')') {
        return null;
      }
      position += 1;
      return value;
    }

    return null;
  }

  function parsePower(): number | null {
    const left = parsePrimary();
    if (left === null) {
      return null;
    }
    if (current() !== '^') {
      return left;
    }

    position += 1;
    const right = parseUnary();
    if (right === null) {
      return null;
    }
    const result = left ** right;
    return Number.isFinite(result) ? result : null;
  }

  function parseUnary(): number | null {
    if (current() === '+' || current() === '−') {
      const sign = current();
      position += 1;
      const value = parseUnary();
      return value === null ? null : sign === '−' ? -value : value;
    }
    return parsePower();
  }

  function startsPrimary(token: string | undefined) {
    return token === '(' || token === 'π' || token === 'e' ||
      token === 'sin' || token === 'cos' || token === 'tan' || token === 'sqrt' ||
      token === 'square' || token === 'log' || token === 'ln' ||
      token === 'reciprocal' || token === 'powerOfTen' ||
      (token !== undefined && /^(?:\d|\.)/.test(token));
  }

  function parseMultiplicative(): number | null {
    let value = parseUnary();
    if (value === null) {
      return null;
    }

    while (
      current() === '×' || current() === '÷' ||
      startsPrimary(current())
    ) {
      const operation = current();
      if (operation === '×' || operation === '÷') {
        position += 1;
      }
      const right = parseUnary();
      if (right === null || (operation === '÷' && right === 0)) {
        return null;
      }
      value = operation === '÷' ? value / right : value * right;
      if (!Number.isFinite(value)) {
        return null;
      }
    }

    return value;
  }

  function parseAdditive(): number | null {
    let value = parseMultiplicative();
    if (value === null) {
      return null;
    }

    while (current() === '+' || current() === '−') {
      const operation = current();
      position += 1;
      const right = parseMultiplicative();
      if (right === null) {
        return null;
      }
      value = operation === '+' ? value + right : value - right;
      if (!Number.isFinite(value)) {
        return null;
      }
    }

    return value;
  }

  const result = parseAdditive();
  return position === tokens.length ? result : null;
}

function getLastGroupStart(expression: string): number {
  if (!expression.endsWith(')')) {
    return -1;
  }
  let depth = 0;
  for (let index = expression.length - 1; index >= 0; index -= 1) {
    if (expression[index] === ')') {
      depth += 1;
    } else if (expression[index] === '(') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }
  return -1;
}

function getLastOperation(
  expression: string,
  useDegrees: boolean,
): { operator: Operator; operand: number } | null {
  const compact = expression.replace(/\s/g, '');
  let depth = 0;
  let lastOperator = -1;

  for (let index = 0; index < compact.length; index += 1) {
    const character = compact[index];
    if (character === '(') {
      depth += 1;
    } else if (character === ')') {
      depth -= 1;
    } else if (
      depth === 0 &&
      (character === '+' || character === '−' || character === '×' ||
        character === '÷' || character === '^') &&
      index > 0 &&
      !'(+−×÷^'.includes(compact[index - 1])
    ) {
      lastOperator = index;
    }
  }

  if (lastOperator < 0) {
    return null;
  }
  const operator = compact[lastOperator] as Operator;
  const operand = evaluateExpression(compact.slice(lastOperator + 1), useDegrees);
  return operand === null ? null : { operator, operand };
}

export function useCalculator() {
  // Cada llamada al hook crea su propio estado; no hay variables globales compartidas.
  const [display, setDisplay] = useState('0');
  const [expressionLabel, setExpressionLabel] = useState('');
  const [useDegrees, setUseDegrees] = useState(true);
  const [prefix, setPrefix] = useState('');
  const [entry, setEntry] = useState('0');
  const [entryStarted, setEntryStarted] = useState(false);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [lastOperation, setLastOperation] = useState<{
    operator: Operator;
    operand: number;
  } | null>(null);
  const [history, setHistory] = useState<CalculatorHistoryItem[]>([]);

  function reset() {
    setDisplay('0');
    setExpressionLabel('');
    setPrefix('');
    setEntry('0');
    setEntryStarted(false);
    setJustEvaluated(false);
    setLastOperation(null);
  }

  function showError() {
    setDisplay('Error');
    setExpressionLabel(`${prefix}${entryStarted ? entry : ''}`);
    setPrefix('');
    setEntry('0');
    setEntryStarted(false);
    setJustEvaluated(true);
    setLastOperation(null);
  }

  function enterDigit(digit: Digit) {
    if (display === 'Error') {
      reset();
    }
    if (justEvaluated) {
      setPrefix('');
      setEntry(digit);
      setEntryStarted(true);
      setDisplay(digit);
      setExpressionLabel('');
      setJustEvaluated(false);
      setLastOperation(null);
      return;
    }

    if (entryStarted && !/^-?\d*\.?\d*$/.test(entry)) {
      setPrefix(`${prefix}${entry} × `);
      setEntry(digit);
      setDisplay(digit);
      setEntryStarted(true);
      return;
    }

    if (!entryStarted && prefix.trimEnd().endsWith(')')) {
      setPrefix(`${prefix} × `);
    }

    const nextEntry = entryStarted
      ? (() => {
          const digitCount = entry.replace(/[-.]/g, '').length;
          if (digitCount >= MAX_ENTRY_DIGITS) {
            return entry;
          }
          if (entry === '0') {
            return digit;
          }
          if (entry === '-0') {
            return `-${digit}`;
          }
          return `${entry}${digit}`;
        })()
      : digit;

    setEntry(nextEntry);
    setEntryStarted(true);
    setDisplay(nextEntry);
  }

  function enterDecimal() {
    if (justEvaluated) {
      setPrefix('');
      setEntry('0.');
      setEntryStarted(true);
      setDisplay('0.');
      setExpressionLabel('');
      setJustEvaluated(false);
      setLastOperation(null);
      return;
    }

    if (entryStarted && !/^-?\d*\.?\d*$/.test(entry)) {
      setPrefix(`${prefix}${entry} × `);
      setEntry('0.');
      setDisplay('0.');
      setEntryStarted(true);
      return;
    }
    if (!entryStarted && prefix.trimEnd().endsWith(')')) {
      setPrefix(`${prefix} × `);
    }

    const nextEntry = entryStarted
      ? entry.includes('.') ? entry : `${entry}.`
      : '0.';
    setEntry(nextEntry);
    setEntryStarted(true);
    setDisplay(nextEntry);
  }

  function chooseOperator(operator: Operator) {
    if (display === 'Error') {
      return;
    }

    let nextPrefix = prefix;
    if (justEvaluated) {
      nextPrefix = `${entry} `;
    } else if (entryStarted) {
      nextPrefix = `${prefix}${entry} `;
    } else if (!nextPrefix.trim()) {
      nextPrefix = `${display} `;
    }

    const trimmedPrefix = nextPrefix.trimEnd();
    const lastCharacter = trimmedPrefix[trimmedPrefix.length - 1];
    if (lastCharacter && '+−×÷^'.includes(lastCharacter)) {
      nextPrefix = `${trimmedPrefix.slice(0, -1)} `;
    }

    nextPrefix = `${nextPrefix}${operator} `;
    setPrefix(nextPrefix);
    setEntry('');
    setEntryStarted(false);
    setJustEvaluated(false);
    setExpressionLabel('');
    setLastOperation(null);
  }

  function insertParenthesis(parenthesis: '(' | ')') {
    if (display === 'Error') {
      if (parenthesis === ')') {
        return;
      }
      reset();
      setPrefix('(');
      setDisplay('0');
      setJustEvaluated(false);
      return;
    }

    if (parenthesis === '(') {
      if (justEvaluated) {
        setPrefix('');
        setEntry('');
        setEntryStarted(false);
      } else if (entryStarted) {
        setPrefix(`${prefix}${entry} × (`);
        setEntry('');
        setEntryStarted(false);
      } else if (prefix.trimEnd().endsWith(')')) {
        setPrefix(`${prefix} × (`);
      } else {
        setPrefix(`${prefix}(`);
      }
      setDisplay('0');
      setExpressionLabel('');
      setJustEvaluated(false);
      setLastOperation(null);
      return;
    }

    const currentExpression = `${prefix}${entryStarted ? entry : ''}`;
    const openCount = (currentExpression.match(/\(/g) ?? []).length;
    const closeCount = (currentExpression.match(/\)/g) ?? []).length;
    if (openCount <= closeCount || /[+−×÷^(]\s*$/.test(currentExpression)) {
      return;
    }

    const nextPrefix = entryStarted ? `${prefix}${entry})` : `${prefix})`;
    const groupStart = getLastGroupStart(nextPrefix.trimEnd());
    const groupValue = groupStart < 0
      ? null
      : evaluateExpression(nextPrefix.slice(groupStart), useDegrees);
    setPrefix(nextPrefix);
    setEntry('');
    setEntryStarted(false);
    setDisplay(groupValue === null ? display : formatNumber(groupValue));
    setExpressionLabel('');
    setJustEvaluated(false);
  }

  function applyScientific(key: ScientificKey) {
    if (display === 'Error') {
      return;
    }

    if (key === 'pi' || key === 'e') {
      const constant = key === 'pi' ? 'π' : 'e';
      let nextPrefix = prefix;
      if (justEvaluated) {
        nextPrefix = '';
      } else if (entryStarted) {
        nextPrefix = `${prefix}${entry} × `;
      } else if (prefix.trimEnd().endsWith(')')) {
        nextPrefix = `${prefix} × `;
      }
      setPrefix(nextPrefix);
      setEntry(constant);
      setEntryStarted(true);
      setDisplay(formatNumber(key === 'pi' ? Math.PI : Math.E));
      setExpressionLabel('');
      setJustEvaluated(false);
      setLastOperation(null);
      return;
    }

    let nextPrefix = justEvaluated ? '' : prefix;
    let operand = entryStarted ? entry : '';
    if (!operand && nextPrefix.trimEnd().endsWith(')')) {
      const groupStart = getLastGroupStart(nextPrefix.trimEnd());
      if (groupStart >= 0) {
        operand = nextPrefix.slice(groupStart).trim();
        nextPrefix = nextPrefix.slice(0, groupStart);
      }
    }
    if (!operand) {
      operand = '0';
    }

    const value = evaluateExpression(operand, useDegrees);
    const result = value === null ? null : applyFunction(key, value, useDegrees);
    if (result === null) {
      setPrefix(nextPrefix);
      setEntry(`${key}(${operand})`);
      setEntryStarted(true);
      setExpressionLabel('');
      setDisplay('Error');
      setJustEvaluated(true);
      setLastOperation(null);
      return;
    }

    const nextEntry = `${key}(${operand})`;
    setPrefix(nextPrefix);
    setEntry(nextEntry);
    setEntryStarted(true);
    setDisplay(formatNumber(result));
    setExpressionLabel('');
    setJustEvaluated(false);
    setLastOperation(null);
  }

  function toggleSign() {
    if (display === 'Error') {
      return;
    }
    if (justEvaluated) {
      setPrefix('');
      setEntry(`−(${entry})`);
      setEntryStarted(true);
      setDisplay(formatNumber(-Number(display)));
      setExpressionLabel('');
      setJustEvaluated(false);
      setLastOperation(null);
      return;
    }

    const nextEntry = entryStarted && /^-?\d*\.?\d*$/.test(entry)
      ? entry.startsWith('-') ? entry.slice(1) : `-${entry}`
      : `−(${entryStarted ? entry : '0'})`;
    const result = evaluateExpression(nextEntry, useDegrees);
    setEntry(nextEntry);
    setEntryStarted(true);
    if (result !== null) {
      setDisplay(formatNumber(result));
    }
  }

  function backspace() {
    if (display === 'Error' || justEvaluated) {
      reset();
      return;
    }

    if (entryStarted && /^-?\d*\.?\d*$/.test(entry)) {
      const shortened = entry.slice(0, -1);
      const nextEntry = shortened === '' || shortened === '-' ? '0' : shortened;
      setEntry(nextEntry);
      setDisplay(nextEntry);
      return;
    }
    if (entryStarted) {
      setEntry('');
      setEntryStarted(false);
      setDisplay('0');
      return;
    }

    const nextPrefix = prefix.trimEnd().slice(0, -1);
    setPrefix(nextPrefix);
  }

  function equals() {
    if (display === 'Error') {
      return;
    }
    if (justEvaluated) {
      if (!lastOperation) {
        return;
      }
      const result = lastOperation.operator === '÷' && lastOperation.operand === 0
        ? null
        : calculateBinary(
            Number(display),
            lastOperation.operator,
            lastOperation.operand,
          );
      if (result === null) {
        showError();
        return;
      }
      const resultText = formatNumber(result);
      const repeatedExpression =
        `${display} ${lastOperation.operator} ${formatNumber(lastOperation.operand)} =`;
      setDisplay(resultText);
      setEntry(resultText);
      setExpressionLabel(formatExpression(repeatedExpression));
      setHistory((items) => [
        {
          id: Date.now(),
          expression: formatExpression(repeatedExpression.slice(0, -2)),
          result: resultText,
        },
        ...items,
      ]);
      return;
    }

    const fullExpression = `${prefix}${entryStarted ? entry : ''}`.trim();
    const value = evaluateExpression(fullExpression || display, useDegrees);
    if (value === null) {
      showError();
      return;
    }

    const resultText = formatNumber(value);
    const savedExpression = fullExpression || display;
    const formattedExpression = formatExpression(savedExpression);
    const last = getLastOperation(savedExpression, useDegrees);
    setDisplay(resultText);
    setPrefix('');
    setEntry(resultText);
    setEntryStarted(true);
    setExpressionLabel(`${formattedExpression} =`);
    setJustEvaluated(true);
    setLastOperation(last);
    setHistory((items) => [
      { id: Date.now(), expression: formattedExpression, result: resultText },
      ...items,
    ]);
  }

  function press(key: CalculatorKey) {
    if (isDigit(key)) {
      enterDigit(key);
    } else if (key === '.') {
      enterDecimal();
    } else if (key === 'AC') {
      reset();
    } else if (key === '⌫') {
      backspace();
    } else if (key === '±') {
      toggleSign();
    } else if (key === '=') {
      equals();
    } else if (isOperator(key)) {
      chooseOperator(key);
    } else if (key === '(' || key === ')') {
      insertParenthesis(key);
    } else {
      applyScientific(key);
    }
  }

  function toggleAngleMode() {
    setUseDegrees((current) => !current);
  }

  function clearHistory() {
    setHistory([]);
  }

  function restoreHistoryItem(item: CalculatorHistoryItem) {
    setDisplay(item.result);
    setExpressionLabel(`${item.expression} =`);
    setPrefix('');
    setEntry(item.result);
    setEntryStarted(true);
    setJustEvaluated(true);
    setLastOperation(getLastOperation(item.expression, useDegrees));
  }

  return {
    display,
    expression: formatExpression(
      expressionLabel || `${prefix}${entryStarted ? entry : ''}`,
    ),
    history,
    press,
    useDegrees,
    toggleAngleMode,
    clearHistory,
    restoreHistoryItem,
  };
}

function calculateBinary(left: number, operator: Operator, right: number): number | null {
  let result: number;
  switch (operator) {
    case '+':
      result = left + right;
      break;
    case '−':
      result = left - right;
      break;
    case '×':
      result = left * right;
      break;
    case '÷':
      if (right === 0) {
        return null;
      }
      result = left / right;
      break;
    case '^':
      result = left ** right;
      break;
  }
  return Number.isFinite(result) ? result : null;
}
