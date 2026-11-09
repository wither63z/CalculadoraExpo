# CalculadoraExpo

Calculadora móvil creada con React Native, Expo Router y TypeScript. Incluye modo básico y científico, historial, respuesta háptica y adaptación automática a diferentes alturas de pantalla.

## Funciones

- Operaciones básicas: suma, resta, multiplicación y división.
- Entrada decimal, cambio de signo, borrado y limpieza total.
- Paréntesis, potencias y multiplicación implícita (`2π`, `2(3+4)`).
- Seno, coseno y tangente en grados o radianes.
- Raíz cuadrada, cuadrado, logaritmo base 10, logaritmo natural, inverso y potencia de 10.
- Constantes π y e.
- Historial reutilizable de resultados.
- Errores controlados para división entre cero y dominios matemáticos inválidos.

## Ejecutar en un celular

Requisitos: Node.js LTS, la aplicación Expo Go y el computador y celular conectados a la misma red.

```bash
npm install
npx expo start
```

Después, escanea el código QR desde Expo Go. Si la red bloquea la conexión local, usa:

```bash
npx expo start --tunnel
```

## Verificación

```bash
npm run check
npx expo-doctor
```

`npm run check` ejecuta ESLint, TypeScript y 25 pruebas matemáticas. Expo Doctor comprueba que las dependencias correspondan con el SDK instalado.

## Estructura importante

| Archivo | Responsabilidad |
| --- | --- |
| `app/_layout.tsx` | Layout de Expo Router, barra de estado y barra de navegación de Android. |
| `app/index.tsx` | Pantalla, modos, historial y distribución responsiva de botones. |
| `components/CalculatorButton.tsx` | Botón reutilizable, colores, tamaños, accesibilidad y vibración. |
| `components/CustomText.tsx` | Variantes de texto y ajuste automático del resultado. |
| `src/hooks.tsx` | Estado, construcción de expresiones, parser y operaciones matemáticas. |
| `constants/Colors.ts` | Paleta visual de la calculadora. |
| `tests/calculator-engine.test.ts` | Pruebas de operaciones básicas y científicas. |

La explicación detallada para modificar la práctica está en [docs/GUIA_DE_CAMBIOS.md](docs/GUIA_DE_CAMBIOS.md).

