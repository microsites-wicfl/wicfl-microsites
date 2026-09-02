# 2026-09-02_007 — El template de verdad: markdown real y design system

**Backlog:** W-021, W-107
**Fase:** 2, Bloque A
**Reporte esperado:** `reports/2026-09-02_007_template-y-markdown.md`

## Contexto

Lee `AGENTS.md` completo antes de tocar nada. Luego `docs/ARCHITECTURE.md`,
`docs/SITE_CONFIG_SCHEMA.md` y `docs/CONTENT_STANDARDS.md`.

El generador de W-026 ya construye un sitio desde su config: `npm run build:site -- _example`
produce `dist/sites/_example/`, el template consume el config por variables de entorno y CI
construye por matriz solo los sitios que cambiaron. Lo que produce todavía es HTML sin estilo,
con un renderer de markdown escrito a mano.

**Los dos items van juntos a propósito.** Reemplazar el pipeline de markdown y diseñar el
sistema visual son el mismo trabajo: no tiene sentido estilizar un HTML que está a punto de
cambiar de forma.

**Quién va a usar esto.** Pavel escribe el contenido de los sitios a partir del 21 de
septiembre y **no escribe HTML ni edita componentes**. Todo lo que necesite expresar tiene que
salir de markdown y del config. Esa es la prueba real de este prompt.

**Estado del repo:** `main` sincronizado, CI verde, árbol limpio.

## Objetivo

Un sitio generado se ve como un sitio de seguros local creíble, su contenido sale de markdown
completo, y Pavel puede producir cualquier página del piloto sin tocar código.

## Lo primero, porque son correcciones y no mejoras

Las dos salieron de la revisión de W-026 y son cortas:

1. **El pie de página muestra el teléfono en formato de máquina.** Renderiza
   `contact.trackingPhone`, que es E.164, así que un visitante ve `+17720000000`. El schema
   tiene `contact.displayPhone` con `(772) 000-0000` exactamente para eso y hoy no se usa en
   ninguna parte. Va `displayPhone` como texto visible y `trackingPhone` dentro del
   `href="tel:"`.

2. **`contact.address` no se renderiza.** `docs/CONTENT_STANDARDS.md` tiene la consistencia de
   NAP como regla permanente: nombre, dirección y teléfono deben coincidir exactamente con el
   Google Business Profile, y la inconsistencia suprime rankings locales de forma activa. Hoy
   la plantilla publica dos de los tres.

## Markdown real, W-107

El renderer propio de `packages/template/src/lib/site-data.mjs` solo maneja párrafos, `h2`,
`h3` y saltos de línea. **No hay enlaces, listas, negritas, imágenes ni tablas.**

Esto tiene que salir. `docs/ARCHITECTURE.md` justifica la elección de Astro citando sus
content collections, así que hoy estamos pagando el framework sin usar la parte que lo
justificaba. Y en concreto: una página de coberturas de seguros es, en la práctica, una lista
con enlaces. Si Pavel escribe una lista y le sale un párrafo con guiones, lo descubre él, y la
respuesta va a ser pedir que alguien toque el template.

Usa el pipeline de markdown de Astro. El contenido de cada sitio vive fuera del template, en
`sites/<slug>/content/`, así que resuelve cómo hacer que Astro lo lea desde ahí y **explica la
decisión**. Como mínimo deben funcionar: encabezados, listas ordenadas y sin ordenar, enlaces,
negrita y cursiva, citas, bloques de código y tablas.

Decide también si el markdown lleva frontmatter y qué campos, y qué pasa si falta. Hoy el
título de la página sale del primer `#` del archivo, que funciona pero es frágil.

## Design system, W-021

**Qué clase de sitio es este.** Un seguro local se vende por credibilidad, no por
sofisticación visual. El sitio compite contra agregadores nacionales pulidos y su ventaja es
parecer una agencia real de esa ciudad, con una persona detrás. Diseña para que se lea confiable
y claro, no moderno ni startup. Evita el aspecto de plantilla genérica: degradados de héroe,
tarjetas redondeadas flotantes, iconos decorativos sin función.

**Restricciones duras:**

- **Cero JavaScript por defecto.** Está en `docs/ARCHITECTURE.md`: los Core Web Vitals son una
  salida del build, no un proyecto aparte. Si algo necesita JS, justifícalo en el reporte.
- **La variación por sitio sale del config y de ningún otro lado.** El schema define
  `theme.variant` con tres valores (`coastal`, `civic`, `warm`) y `theme.accentColor` en hex.
  Esos son los dos únicos grados de libertad. Nada de CSS por sitio, nada de overrides.
- **El número de licencia y el teléfono van en todas las páginas.** Compliance de publicidad de
  seguros de Florida.
- **El teléfono es el elemento de conversión.** Estos sitios existen para generar llamadas y
  Gate B se mide en llamadas calificadas. Que sea prominente y tocable en móvil, sin ser
  agresivo.
- **Accesible.** Contraste suficiente, foco visible por teclado, jerarquía de encabezados
  correcta, y que se lea bien en móvil, que es donde va a llegar la mayoría del tráfico local.

**Qué construir:** los tokens del sistema (color, tipografía, espacio), las tres variantes, el
layout base con su encabezado y pie, y los tipos de página que un microsite de seguros necesita:
portada, página de contenido, y una página de cobertura. Nada más. El resto llega cuando los
pilotos lo pidan.

## Si te sobra tiempo, y solo entonces

`docs/SITE_CONFIG_SCHEMA.md` dice que el enum fijo de `products` existe para que **el template
pueda garantizar que existan las páginas de cobertura correspondientes**. Hoy nadie garantiza
nada: es una promesa sin dueño. Hacer que el build falle cuando un producto declarado en el
config no tiene su markdown de cobertura convierte esa promesa en una garantía.

Igual con `theme.accentColor`: el schema lo describe como "accesible, revisado contra los tokens
de contraste del template", y hoy no lo revisa nadie. Una comprobación de contraste en el build
cierra ese hueco.

**Las dos son opcionales en este prompt.** Si el trabajo principal se lleva el tiempo, párate y
repórtalas como pendientes. Prefiero un template terminado y estas dos después, que todo a medias.

## Restricciones

- No reabras decisiones de `docs/ARCHITECTURE.md`.
- **El operador solo toca config y markdown.** Si una decisión de diseño obliga a Pavel a editar
  un componente para lanzar un sitio, esa decisión está mal.
- No copies el template dentro de ningún sitio.
- No habilites `deploy.yml` ni `preview.yml`, no crees secretos, no toques Cloudflare.
- No borres `sites/_example/`.
- **No escribas copy de seguros que parezca real.** El contenido del fixture es de relleno y
  debe verse como tal. Nada de claims de cobertura ni de números de licencia que parezcan
  auténticos.
- Si algo contradice `CLAUDE.md`, detente y repórtalo.

## Pasos

1. `git status` limpio y `git fetch origin`.
2. Aplica las dos correcciones del teléfono y la dirección.
3. Reemplaza el pipeline de markdown y explica cómo hiciste que Astro lea contenido externo.
4. Construye el design system con sus tres variantes.
5. **Amplía el contenido del fixture** para ejercitar de verdad el markdown nuevo: listas,
   enlaces, tabla, cita, encabezados anidados. Sigue siendo relleno marcado como fixture.
6. Verifica, con output real pegado:
   - El build produce el sitio y el HTML contiene marca, ciudad, dirección, teléfono visible en
     formato humano, `tel:` con el E.164, licencia y SEO
   - Todos los elementos de markdown del paso 5 se renderizan correctamente
   - Cambiar `theme.variant` y `theme.accentColor` en el config cambia el resultado, sin tocar
     código
   - El HTML generado no carga JavaScript, o está justificado
   - `npm run check` y el build pasan en local
7. Sube a `main` sin force y pega el identificador de la corrida de CI.

## Criterio de aceptación

- [ ] `displayPhone` visible con `tel:` sobre `trackingPhone`, y la dirección renderizada
- [ ] Encabezados, listas, enlaces, énfasis, citas, código y tablas se renderizan
- [ ] Existen los tokens, las tres variantes y los tres tipos de página
- [ ] Cambiar el `theme` del config cambia el sitio sin tocar código, demostrado
- [ ] Licencia y teléfono en todas las páginas
- [ ] Cero JavaScript, o justificado
- [ ] CI verde sobre `main`, con identificador de run
- [ ] `git status` limpio al terminar

## Formato del reporte

Escribe `reports/2026-09-02_007_template-y-markdown.md` con:

- **Qué se hizo**
- **Decisiones de diseño** — cómo lee Astro el contenido externo, el frontmatter, los tokens,
  qué distingue a las tres variantes, y por qué el sitio se ve como se ve
- **Verificación** — output real de todo el paso 6
- **Tensiones que encontraste** — sobre todo donde el diseño empuje contra la regla de que el
  operador solo toca config y markdown
- **Lo que tocaste fuera de lo pedido** — si no hubo, dilo explícitamente
- **Lo que no pudiste verificar**
- **Dónde dudaste**
- **Qué te sorprendió del repo**
- **Lo que no se hizo** — y por qué, incluidas las dos opcionales si quedaron fuera
- **Preguntas para Pavel** — él escribe el contenido sin tocar código. Qué necesitas que valide
- **Próximos pasos sugeridos**
- **Commits** — hashes y mensajes

No escribas la sección `## Revisión de cowork`.

Después del reporte, agrega tu entrada a `BITACORA.md` **al inicio del archivo** y actualiza
W-021 y W-107 en `BACKLOG.md`, cerrándolos solo si quedaron completos. No toques nada más de
esos dos archivos.

## Commit message

```
feat(template): real markdown pipeline and design system

Closes W-107. Advances W-021.
```
