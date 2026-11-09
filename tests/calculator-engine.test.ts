/// <reference types="node" />

import assert from 'node:assert/strict';

import { evaluateExpression } from '../src/hooks';

function expectValue(
  expression: string,
  expected: number,
  useDegrees = true,
  tolerance = 1e-10,
) {
  const actual = evaluateExpression(expression, useDegrees);
  assert.notEqual(actual, null, `${expression} no debería producir Error`);
  assert.ok(
    Math.abs((actual as number) - expected) <= tolerance,
    `${expression}: se esperaba ${expected}, se obtuvo ${actual}`,
  );
}

function expectError(expression: string, useDegrees = true) {
  assert.equal(
    evaluateExpression(expression, useDegrees),
    null,
    `${expression} debería producir Error`,
  );
}

// Operaciones básicas, precedencia y agrupación.
expectValue('2+3×4', 14);
expectValue('(2+3)×4', 20);
expectValue('10÷2−3', 2);
expectValue('2^3^2', 512);
expectValue('−2^2', -4);

// Multiplicación implícita usada por constantes y paréntesis.
expectValue('2π', 2 * Math.PI);
expectValue('2(3+4)', 14);
expectValue('(2)(3)', 6);

// Funciones científicas en grados.
expectValue('sin(30)', 0.5);
expectValue('cos(60)', 0.5);
expectValue('tan(45)', 1);
expectValue('sqrt(81)', 9);
expectValue('square(7)', 49);
expectValue('log(1000)', 3);
expectValue('ln(e)', 1);
expectValue('reciprocal(4)', 0.25);
expectValue('powerOfTen(3)', 1000);

// Trigonometría en radianes.
expectValue('sin(π÷2)', 1, false);
expectValue('cos(π)', -1, false);

// Casos límite que la interfaz representa como "Error".
expectError('1÷0');
expectError('sqrt(−1)');
expectError('log(0)');
expectError('tan(90)');
expectError('(2+3');
expectError('2++');

console.log('Calculadora: 25 pruebas aprobadas.');
