\# Especificación funcional



\## Resumen

La aplicación es un entrenador de vocabulario inglés-español basado en un PDF de estudio. Debe permitir revisar palabras, entender su significado, ver ejemplos de uso y practicar activamente.



\## Usuario objetivo

Persona hispanohablante que quiere mejorar su vocabulario de inglés y usarlo para pensar, entender y hablar mejor.



\## Funcionalidades principales



\### 1. Inicio

Pantalla principal con:

\- resumen del progreso

\- acceso rápido a categorías

\- acceso a modo repaso

\- acceso a favoritos

\- acceso a quiz y flashcards



\### 2. Listado de vocabulario

Debe mostrar:

\- palabra en inglés

\- traducción al español

\- categoría

\- dificultad

\- botón de favorito



Debe permitir:

\- búsqueda por palabra

\- filtros por categoría

\- filtros por dificultad

\- ordenar alfabéticamente



\### 3. Detalle de palabra

Debe mostrar:

\- palabra en inglés

\- traducción al español

\- ejemplo en inglés

\- ejemplo traducido al español

\- categoría

\- tags

\- nota si existe

\- botón para marcar conocida / no conocida

\- botón favorito



\### 4. Flashcards

Modo tarjeta:

\- cara frontal: palabra en inglés

\- cara trasera: traducción y ejemplo

\- navegación siguiente/anterior

\- marcar fácil/difícil



\### 5. Quiz

Tipos:

\- inglés -> español

\- español -> inglés

\- completar ejemplo

\- opción múltiple



\### 6. Favoritos

Lista de palabras guardadas por el usuario.



\### 7. Progreso

Guardar en localStorage:

\- palabras vistas

\- palabras dominadas

\- favoritas

\- estadísticas de quiz

\- racha básica de estudio



\## Requisitos de datos

La fuente única será `data/vocabulary.json`



\## Modelo base de entrada

Cada entrada debe tener:

\- id

\- english\_word

\- spanish\_translation

\- example\_sentence\_en

\- example\_sentence\_es

\- category

\- difficulty

\- tags

\- note



\## Requisitos de interfaz

\- moderna

\- limpia

\- muy legible

\- rápida

\- usable en móvil y escritorio

\- dark mode



\## Requisitos técnicos

\- Next.js App Router

\- TypeScript estricto

\- Tailwind

\- componentes reutilizables

\- estado simple y claro

\- localStorage para persistencia local



\## Futuras mejoras posibles

\- TTS pronunciación

\- repaso espaciado

\- estadísticas avanzadas

\- import/export de progreso

\- login y sincronización

