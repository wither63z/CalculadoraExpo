# Guía para explicar y modificar la calculadora

## 1. Cómo circula una pulsación

1. `app/index.tsx` define qué botones aparecen.
2. Cada botón se renderiza mediante `CalculatorButton`.
3. Al tocarlo, el componente activa la respuesta háptica y llama a `press(valor)`.
4. `useCalculator` decide si el valor es un número, operador, función científica o acción.
5. El hook actualiza `display`, la expresión o el historial.
6. React vuelve a renderizar únicamente los textos y controles que cambiaron.

La interfaz no contiene fórmulas. La lógica matemática está aislada en `src/hooks.tsx`.

## 2. Archivos y responsabilidades

### `app/_layout.tsx`

- `Stack` registra las rutas de Expo Router sin encabezado.
- `StatusBar` usa iconos claros porque el fondo es oscuro.
- `NavigationBar` mantiene visibles y legibles los controles del sistema Android.
- `WebStylesheet` conserva los estilos cuando se ejecuta en navegador.

### `app/index.tsx`

- `basicButtons` contiene las teclas normales.
- `scientificButtons` contiene las teclas científicas.
- `scientificMode` decide qué teclado se muestra.
- `historyOpen` decide si se muestra la calculadora o el historial.
- `keyHeight` calcula la altura de las teclas según la pantalla. El límite es de 38 a 56 píxeles; el área táctil se amplía con `hitSlop`.
- `SafeAreaView` evita que el contenido quede debajo del notch, barra de estado o indicador inferior.

### `components/CalculatorButton.tsx`

- Recibe texto, acción, variante y opciones de tamaño mediante props tipadas.
- `variant="number"` usa el color de números.
- `variant="utility"` se usa para `AC`, signo, borrar y barra superior.
- `variant="operator"` se usa para operaciones y funciones científicas.
- `Haptics.selectionAsync()` genera una vibración breve al tocar.
- El estado `pressed` reduce opacidad y escala para dar respuesta visual.

### `components/CustomText.tsx`

- Centraliza tamaños y colores de texto.
- La variante `big` siempre ocupa una línea y reduce el tamaño automáticamente si el resultado es largo.

### `src/hooks.tsx`

`useCalculator` contiene estados independientes por cada llamada:

- `display`: valor grande que ve el usuario.
- `expressionLabel`: expresión ya evaluada que termina en `=`.
- `prefix`: parte confirmada de la operación actual.
- `entry`: número, constante o función que se está escribiendo.
- `entryStarted`: indica si existe una entrada activa.
- `justEvaluated`: distingue un resultado final de una entrada en construcción.
- `useDegrees`: selecciona grados (`DEG`) o radianes (`RAD`).
- `lastOperation`: permite repetir una operación al volver a pulsar `=`.
- `history`: guarda expresión y resultado de cada cálculo.

`evaluateExpression` es un parser matemático propio. No usa `eval`, por lo que solo acepta los tokens definidos en `TOKEN_PATTERN`. Aplica esta precedencia:

1. Números, constantes, funciones y paréntesis.
2. Signos unarios positivos o negativos.
3. Potencias.
4. Multiplicación y división.
5. Suma y resta.

`applyFunction` valida el dominio de cada función. Por ejemplo, rechaza raíz de negativos, logaritmos de cero o negativos, inverso de cero y tangente indefinida.

## 3. Cambios comunes que puede pedir el profesor

### Cambiar colores

Edita `CalculatorColors` en `constants/Colors.ts`:

```ts
export const CalculatorColors = {
  background: '#17212B',
  key: '#263440',
  utilityKey: '#A5ADB5',
  operatorKey: '#517697',
};
```

### Cambiar el orden o texto de un botón

Busca `basicButtons` o `scientificButtons` en `app/index.tsx`. El orden del arreglo es el orden visual de izquierda a derecha y de arriba abajo.

```ts
{ label: '√', value: 'sqrt', compact: true, variant: 'operator' }
```

- `label` es lo que aparece en pantalla.
- `value` es la clave que recibe el hook.
- `variant` determina el color.
- `compact` usa el tamaño de las teclas científicas.

### Cambiar cuántos dígitos permite

Modifica `MAX_ENTRY_DIGITS` en `src/hooks.tsx`:

```ts
const MAX_ENTRY_DIGITS = 12;
```

### Cambiar la precisión

`formatNumber` redondea a diez decimales para evitar resultados como `0.30000000000000004`. Cambia el `10` de `toFixed(10)` si el profesor pide otra precisión.

### Agregar una función científica

Ejemplo: agregar valor absoluto.

1. Añade `'abs'` al tipo `ScientificKey`.
2. Añade `abs` a `TOKEN_PATTERN`.
3. Reconoce `abs` en la lista de funciones de `parsePrimary`.
4. Añade un caso a `applyFunction`:

```ts
case 'abs':
  result = Math.abs(value);
  break;
```

5. Añade el botón en `scientificButtons`:

```ts
{ label: '|x|', value: 'abs', compact: true, variant: 'operator' }
```

6. Añade una prueba en `tests/calculator-engine.test.ts`.

### Cambiar grados y radianes

`useDegrees` empieza en `true`. Para iniciar en radianes, cambia:

```ts
const [useDegrees, setUseDegrees] = useState(false);
```

Las funciones `sin`, `cos` y `tan` convierten grados a radianes antes de llamar a `Math`.

### Cambiar el tamaño adaptable

En `app/index.tsx`:

```ts
const keyHeight = Math.round(
  Math.max(38, Math.min(56, (height - 280) / 8)),
);
```

- `38`: mínimo para teléfonos bajos.
- `56`: máximo para teléfonos altos.
- `8`: filas totales cuando está abierto el modo científico.

Si se agregan más filas, ajusta el divisor y comprueba el diseño en una pantalla pequeña.

## 4. Comportamientos de error

El display muestra `Error` cuando:

- se divide entre cero;
- se calcula raíz cuadrada de un negativo;
- se calcula `log` o `ln` de cero o un negativo;
- se calcula el inverso de cero;
- la tangente está matemáticamente indefinida;
- faltan números o paréntesis;
- el resultado no es un número finito.

Después de un error, `AC` limpia todo. También se puede empezar directamente escribiendo un número nuevo.

## 5. Cómo comprobar un cambio

Ejecuta siempre:

```bash
npm run check
npx expo-doctor
```

Para probar en el celular:

```bash
npx expo start
```

Revisa al menos: modo básico, modo científico, `DEG/RAD`, historial, `AC`, borrado, decimales, división entre cero y una expresión con paréntesis.

