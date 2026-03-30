\# Proyecto: English Vocabulary App



\## Objetivo

Crear una web-app para aprender vocabulario inglés-español a partir del archivo:



`source/guia\_vocabulario\_ingles\_completa.pdf`



La app debe servir para:

\- estudiar vocabulario por categorías

\- buscar palabras rápidamente

\- practicar con flashcards

\- hacer quizzes

\- guardar progreso y favoritos

\- pensar y estudiar en inglés con apoyo en español



\## Flujo obligatorio de trabajo

1\. Leer el PDF

2\. Extraer el contenido a `data/vocabulary.json`

3\. Validar y limpiar los datos

4\. Construir la app usando SOLO `data/vocabulary.json`

5\. No depender del PDF en tiempo de ejecución



\## Stack obligatorio

\- Next.js

\- TypeScript

\- Tailwind CSS



\## Reglas globales

\- La interfaz de la app debe estar en español

\- El contenido principal de estudio debe estar en inglés con traducción al español

\- Diseño responsive mobile-first

\- Código limpio, mantenible y modular

\- No inventar vocabulario sin base clara

\- Si una entrada del PDF es ambigua, conservarla con un campo `note`

\- Antes de construir la UI, revisar que el JSON esté bien formado

\- No usar el PDF directamente dentro de la app una vez extraído el JSON



\## Prioridades

1\. Calidad de datos

2\. Buena UX

3\. Simplicidad

4\. Escalabilidad futura



\## Entregables esperados

\- `data/vocabulary.json`

\- aplicación funcional completa

\- componentes reutilizables

\- README con instrucciones para instalar y ejecutar

\- estructura limpia del proyecto



\## Flujo recomendado dentro de Claude Code

Primero usar la skill `extract-pdf-vocab`.

Después usar la skill `build-vocab-app`.



\## Archivos de referencia

@docs/app-spec.md

@.claude/rules/frontend.md

@.claude/rules/data-quality.md

@.claude/rules/ux.md

