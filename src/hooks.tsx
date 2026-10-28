import { useState } from 'react';

type Operator = '+' | '−' | '×' | '÷';

type LastOperation = {
  operator: Operator;
  operand: number;
};

function calculate(left: number, operator: Operator, right: number) {
  switch (operator) {
    case '+':
      return left + right;
    case '−':
      return left - right;
    case '×':
      return left * right;
    case '÷':
      return right === 0 ? null : left / right;
  }
}

function formatNumber(value: number) {
  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
  return String(rounded);
}

export function useCalculator() {
  const [display, setDisplay] = useState('0');
  const [accumulator, setAccumulator] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [replaceEntry, setReplaceEntry] = useState(false);
  const [lastOperation, setLastOperation] = useState<LastOperation | null>(null);

  function clear() {
    setDisplay('0');
    setAccumulator(null);
    setOperator(null);
    setReplaceEntry(false);
    setLastOperation(null);
  }

  function showError() {
    setDisplay('Error');
    setAccumulator(null);
    setOperator(null);
    setReplaceEntry(true);
    setLastOperation(null);
  }

  function enterDigit(digit: string) {
    if (display === 'Error' || replaceEntry) {
      setDisplay(digit);
      setReplaceEntry(false);
      return;
    }

    setDisplay((current) => {
      if (current === '0') {
        return digit;
      }
      if (current === '-0') {
        return `-${digit}`;
      }
      return `${current}${digit}`;
    });
  }

  function enterDecimal() {
    if (display === 'Error' || replaceEntry) {
      setDisplay('0.');
      setReplaceEntry(false);
      return;
    }

    setDisplay((current) => current.includes('.') ? current : `${current}.`);
  }

  function chooseOperator(nextOperator: Operator) {
    if (display === 'Error') {
      return;
    }

    const currentValue = Number(display);
    if (accumulator === null) {
      setAccumulator(currentValue);
    } else if (operator && !replaceEntry) {
      const result = calculate(accumulator, operator, currentValue);
      if (result === null) {
        showError();
        return;
      }
      setAccumulator(result);
      setDisplay(formatNumber(result));
    }

    setOperator(nextOperator);
    setReplaceEntry(true);
    setLastOperation(null);
  }

  function equals() {
    if (display === 'Error') {
      return;
    }

    if (operator) {
      const right = Number(display);
      const left = accumulator ?? right;
      const result = calculate(left, operator, right);
      if (result === null) {
        showError();
        return;
      }

      setDisplay(formatNumber(result));
      setAccumulator(null);
      setOperator(null);
      setReplaceEntry(true);
      setLastOperation({ operator, operand: right });
      return;
    }

    if (lastOperation) {
      const result = calculate(
        Number(display),
        lastOperation.operator,
        lastOperation.operand,
      );
      if (result === null) {
        showError();
        return;
      }
      setDisplay(formatNumber(result));
      setReplaceEntry(true);
    }
  }

  function backspace() {
    if (display === 'Error') {
      setDisplay('0');
      setReplaceEntry(false);
      return;
    }

    if (replaceEntry && operator) {
      setDisplay('0');
      setReplaceEntry(false);
      return;
    }

    setDisplay((current) => {
      const shortened = current.slice(0, -1);
      return shortened === '' || shortened === '-' ? '0' : shortened;
    });
    setReplaceEntry(false);
  }

  function toggleSign() {
    if (display === 'Error' || Number(display) === 0) {
      return;
    }
    setDisplay((current) => current.startsWith('-') ? current.slice(1) : `-${current}`);
  }

  function press(key: string) {
    if (/^\d$/.test(key)) {
      enterDigit(key);
    } else if (key === '.') {
      enterDecimal();
    } else if (key === 'AC') {
      clear();
    } else if (key === '⌫') {
      backspace();
    } else if (key === '±') {
      toggleSign();
    } else if (key === '=') {
      equals();
    } else if (key === '+' || key === '−' || key === '×' || key === '÷') {
      chooseOperator(key);
    }
  }

  return { display, press };
}