# Proyecto: Academy Core

## Contexto general
Este proyecto nació como una app de vocabulario inglés-español llamada Thinklingo, construida con Next.js, TypeScript y Tailwind CSS.

Ahora el objetivo es evolucionarla a una plataforma base reutilizable para academias de inglés, donde cada academia pueda tener su propio branding, contenido y usuarios, sin tener que cambiar el código manualmente en cada instalación.

Thinklingo puede seguir existiendo como demo pública o versión genérica, pero la arquitectura debe evolucionar a una base white-label.

## Objetivo principal
Convertir la app actual en una plataforma multi-academia con:

- branding dinámico por academia
- backend con Supabase
- autenticación
- estructura de roles
- panel interno inicial para superadmin
- base escalable para futuras funciones de profesores, alumnos, progreso persistente y contenido propio por academia

## Estado actual del proyecto
La app actual ya incluye:

- home
- listado de vocabulario
- detalle de palabra
- flashcards
- quiz
- favoritos
- progreso
- dark mode
- diseño responsive
- datos basados en `data/vocabulary.json`
- persistencia local con `localStorage`

## Meta de la nueva etapa
La nueva etapa NO debe destruir la app actual sin motivo.

La evolución debe ser progresiva:
1. conservar lo reutilizable
2. introducir Supabase con orden
3. introducir branding dinámico
4. introducir auth y roles
5. crear panel interno para superadmin
6. dejar preparada la base para academias reales

## Stack obligatorio
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
  - Auth
  - Postgres
  - Storage

## Restricciones importantes
- No rehacer el proyecto desde cero salvo que sea estrictamente necesario
- No meter cambios masivos sin explicar antes la arquitectura propuesta
- No hardcodear branding de academias en componentes
- No hardcodear secretos ni keys
- No mezclar lógica de branding por toda la app
- No crear una arquitectura excesivamente compleja para la primera versión
- No implementar todas las funciones futuras de golpe
- No romper la versión actual más de lo necesario
- Mantener compatibilidad con Vercel
- Mantener el código modular, claro y escalable

## Filosofía de trabajo
Antes de implementar algo grande:
1. analizar el proyecto actual
2. identificar qué se reutiliza
3. proponer arquitectura
4. proponer tablas mínimas
5. implementar por fases

Si una decisión técnica tiene tradeoffs, explícalos antes de ejecutar cambios grandes.

## Prioridades
1. Arquitectura correcta
2. Escalabilidad razonable
3. Branding dinámico bien resuelto
4. Base de datos clara
5. Auth y roles mínimos
6. Panel interno funcional
7. Mantener buena UX

## Multi-academia
Cada academia debe poder tener como mínimo:

- nombre
- slug
- logo
- color principal
- color secundario
- color de acento
- título principal
- eslogan o subtítulo
- estado activo/inactivo

El objetivo es que la app se personalice automáticamente según la academia, sin tocar código manualmente para cada cliente.

## Roles previstos
Preparar la base para estos roles:

- superadmin
- academy_admin
- teacher
- student

En la primera fase, basta con que funcione bien:
- superadmin
- estructura mínima para perfiles y roles

## Branding dinámico
El branding debe resolverse con una estrategia reusable y limpia.

Reglas:
- usar configuración por academia desde base de datos
- evitar colores hardcodeados por academia en componentes
- preferir variables CSS o sistema equivalente centralizado
- permitir cargar:
  - logo
  - colores
  - título
  - subtítulo/eslogan

## Panel interno
Debe existir una base para un panel interno de superadmin donde se pueda:

- ver academias
- crear academia
- editar branding
- subir logo
- activar/desactivar academia

No hace falta hacer todavía un panel enorme ni complejo.

## Auth
El proyecto debe quedar preparado para login real usando Supabase Auth.

Reglas:
- separar cliente de navegador y cliente de servidor
- proteger rutas privadas
- no exponer secretos
- mantener buena estructura para futura ampliación de permisos

## Base de datos
La primera versión debe priorizar tablas mínimas y bien diseñadas.

La arquitectura debe dejar preparado el camino para:
- academias
- perfiles
- relación usuario-academia
- branding
- vocabulario por academia
- progreso por alumno
- futuras listas/cursos/grupos

## Datos actuales
`data/vocabulary.json` puede seguir usándose como semilla, demo o base inicial.

No asumir que el JSON será la solución final para academias reales.

La base de datos deberá poder sustituir progresivamente al JSON sin rehacer toda la interfaz.

## Diseño y UX
Mantener la línea visual moderna actual:
- limpia
- mobile-first
- dark mode
- usable
- consistente

No degradar el diseño actual por introducir backend.

## Estructura deseada del código
Priorizar separación clara entre:
- `app/`
- `components/`
- `lib/`
- `types/`
- `services/` si hace falta
- utilidades de branding
- utilidades de auth
- utilidades de Supabase

Evitar meter lógica compleja directamente dentro de páginas visuales.

## Variables de entorno
Usar variables de entorno para Supabase.

Esperadas:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Si se necesita alguna más, documentarla claramente.

## Forma de trabajar en este proyecto
Cuando se pida una evolución importante, seguir este orden:

### Fase 1
- análisis del código actual
- arquitectura propuesta
- tablas mínimas recomendadas
- estrategia de branding dinámico
- plan de implementación por fases

### Fase 2
- integración base de Supabase
- clientes de navegador/servidor
- auth mínima
- perfiles/roles mínimos
- academias
- branding dinámico base

### Fase 3
- panel interno de superadmin
- CRUD básico de academias
- subida de logo
- edición de colores y textos
- preview básica

### Fase 4
- evolución futura:
  - profesores
  - alumnos
  - progreso persistente
  - vocabulario por academia
  - cursos o grupos

## Comportamiento esperado del asistente
Cuando trabajes en este proyecto:

- entiende primero el proyecto antes de editar
- explica arquitectura antes de cambios grandes
- implementa por fases
- reutiliza lo ya construido cuando tenga sentido
- no propongas soluciones desordenadas
- no añadas complejidad innecesaria
- mantén TypeScript estricto
- mantén el proyecto compatible con Vercel
- conserva una buena experiencia móvil
- si algo conviene refactorizar antes de seguir, dilo claramente

## Qué valorar antes de tocar código
Antes de implementar, evalúa:
- qué ya existe y sirve
- qué debe migrarse de localStorage a base de datos
- qué debe quedarse todavía local en una fase inicial
- cómo aislar branding, auth y datos
- cómo preparar el proyecto para varias academias sin rehacer todo

## Regla importante sobre decisiones
Si una decisión puede hacerse de forma rápida pero mala, o algo más lenta pero correcta, priorizar la correcta siempre que no suponga rehacer todo sin necesidad.

## Resultado esperado
Este proyecto debe evolucionar a una base sólida para vender una plataforma personalizada a academias de inglés, partiendo de la app actual, pero sin quedarse limitado a una simple demo de vocabulario.