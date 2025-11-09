# Analizador de Contratos Legales con IA

Proyecto en React para analizar contratos legales usando técnicas de IA. La interfaz está completamente en español, mientras que el código (nombres de archivos, funciones y componentes) está en inglés.

## Propósito

Facilitar la revisión de contratos legales mediante una interfaz sencilla y animada, preparada para futuras integraciones de procesamiento de lenguaje natural.

## Tecnologías usadas

- React
- Tailwind CSS
- Framer Motion

## Estructura de carpetas

- `src/components`: componentes reutilizables.
- `src/pages`: páginas de la aplicación (incluye `Home.jsx`).
- `src/assets`: recursos estáticos.
- `src/hooks`: hooks personalizados.
- `src/tests`: pruebas.

## Configuración y ejecución

1. Instala dependencias:
   - `npm install`
   - `npm install framer-motion`
2. Ejecuta el proyecto:
   - `npm start`
3. Abre `http://localhost:3000/` y verifica que se muestre el texto “Analizador de Contratos Legales con IA” centrado con animación de entrada suave (fade in).

## Tailwind CSS

- Tailwind está conectado mediante `tailwind.config.js`, `postcss.config.js` y las directivas en `src/index.css` (`@tailwind base; @tailwind components; @tailwind utilities;`).
