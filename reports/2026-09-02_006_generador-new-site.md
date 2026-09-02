# Reporte — 2026-09-02_006: generador de config a sitio

## Qué se hizo

Se añadió `npm run build:site -- <site-directory>`. Valida primero `sites/<site-directory>/site.config.json` contra el schema cerrado y, solo si es válido, invoca el único template Astro compartido con el config y `content/` de ese sitio. El output queda en `dist/sites/<site-directory>/`.

El template ahora lee el config recibido y deja en todas las páginas marca, ciudad, teléfono de tracking y licencia; usa también el título y la descripción SEO. El fixture tiene `content/index.md` y `content/about-fixture.md`, que generan `/` y `/about-fixture/`. No se copió ningún template dentro de `sites/`.

CI ahora valida todos los configs y luego descubre una matriz: cambios en un sitio construyen solo ese sitio; cambios en inputs compartidos (template, schema, scripts, paquetes o workflow) reconstruyen todos los sitios porque los afectan a todos.

## Las cinco decisiones de diseño

### 1. Un build por sitio

Se eligió una invocación de Astro por sitio. Cada sitio es un dominio independiente y los Workers se agruparán en pods de aproximadamente 25: un config malo debe detener exclusivamente el artefacto de ese dominio, no los otros 99. La validación global de configs conserva visibilidad del contrato, pero la construcción y su fallo quedan aislados por matriz.

### 2. Config por variables de entorno de proceso

El generador pasa rutas absolutas de config y contenido mediante `WICFL_SITE_CONFIG` y `WICFL_SITE_CONTENT` al proceso de Astro. No se genera ni modifica un archivo dentro del template, por lo que el operador crea o cambia un sitio solo dentro de `sites/<site-directory>/`; el template permanece compartido y versionado una sola vez.

### 3. Output `dist/sites/<site-directory>/`

Cada build escribe un directorio estático propio, ignorado por Git, bajo `dist/sites/`. Es una frontera explícita por sitio que un futuro Worker Static Assets puede consumir directamente sin renombrar el artefacto ni mezclar dominios del mismo pod.

### 4. Markdown a rutas por ruta relativa

`sites/<site-directory>/content/index.md` produce `/`; cualquier otro `.md` produce la misma ruta relativa con slash final: `content/about.md` da `/about/` y `content/guides/flood.md` daría `/guides/flood/`. El generador no consulta `geo.serviceArea` para generar archivos ni rutas, así que no crea páginas de ciudades por sustitución.

### 5. Determinismo

La enumeración de markdown se ordena antes de crear rutas y el renderer no introduce timestamps, IDs aleatorios ni hashes de contenido. Dos builds consecutivos de `_example` tuvieron hashes SHA-256 idénticos para `index.html` y `about-fixture/index.html`. Astro podría incorporar hashes si en el futuro se añaden assets con bundling; Gate A deberá repetir esta comprobación sobre el artefacto completo cuando exista ese tipo de asset.

## Verificación

Estado inicial: árbol limpio, pero `main` local tenía el commit local `9f0d1ff` (solo el prompt 006) que todavía no estaba en `origin/main`; no se reescribió ni descartó. Se incluyó de forma normal en el push posterior.

`npm run build:site -- _example` construyó dos páginas en `dist/sites/_example/`. El HTML de `/index.html` contiene `Example Flood Insurance`, `Stuart, FL`, `+17720000000`, `PLACEHOLDER-FL-LICENSE`, el título `Example Flood Insurance for Stuart Homeowners` y la descripción SEO del config.

Se creó temporalmente un config incompleto y el comando salió con código 1 antes de llamar a Astro:

```text
Configuration for _invalid-config-test is invalid; no site was built.
...site.config.json invalid
must have required property 'domain'
```

`npm run check` validó los dos ejemplos de schema y `_example`; `npm run build` terminó con dos páginas construidas. La comparación de hashes entre dos builds consecutivos no produjo diferencias. `git diff --check` no produjo salida.

El push sin force terminó así:

```text
To https://github.com/microsites-wicfl/wicfl-microsites.git
   107f906..0700bde  main -> main
```

CI verde: run [`33667480670`](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/33667480670), evento `push`, SHA `0700bde88c78869bc119ebe69e4f4511d6dcae01`. Pasaron `Validate all site configurations`, `Discover sites to build` y `Build _example`.

## Tensiones que encontraste

El parámetro del comando es el nombre del directorio del sitio, no el valor `slug` interno: el fixture usa el directorio especial `_example` y su slug válido de schema es `example-flood`. Se documentó el parámetro como `<site-directory>` para evitar que un operador intente editar el config o el template para salvar esa diferencia. Los sitios reales deben mantener ambos alineados como convención operativa futura.

## Lo que tocaste fuera de lo pedido

Se actualizó `docs/SETUP.md` porque describía un output obsoleto (`packages/template/dist/`) y no podía enseñar el nuevo comando sin inducir a error. No hubo cambios de diseño, Cloudflare, deploy ni preview.

## Lo que no pudiste verificar

No se verificó una matriz con múltiples sitios reales porque solo existe `_example`. Sí se verificó que, para este cambio compartido, la matriz descubre y construye `_example`; la selección de un único sitio ante un diff de contenido queda cubierta por la lógica de rutas de cambios y necesita su primera comprobación con Site #1.

## Dónde dudaste

Se evaluó generar un archivo temporal dentro del template para entregar config y contenido, pero introduciría estado compartido y facilitaría que un build contaminara otro. Las variables de entorno eliminan esa dependencia y preservan el requisito de operación solo dentro de `sites/<site-directory>/`.

## Qué te sorprendió del repo

El estado declarado como sincronizado tenía un commit local adicional, aunque era exclusivamente el nuevo prompt. También GitHub anotó que `actions/checkout@v4` y `actions/setup-node@v4` aún apuntan a Node 20 y fueron forzadas a Node 24 por deprecación; fue una advertencia, no afectó la corrida verde.

## Lo que no se hizo

No se añadió diseño, CSS elaborado, ruteo bilingüe, `hreflang`, deploy de Workers ni previews. Esos alcances pertenecen a W-021, W-022, W-014 y W-098 respectivamente.

## Preguntas para Pavel

¿Confirma que la convención operativa debe exigir que el nombre de `sites/<site-directory>/` sea igual a `site.config.json.slug` para sitios reales? El fixture necesita conservar su excepción `_example`.

## Próximos pasos sugeridos

1. Al crear Site #1, probar en CI un cambio solo de markdown para confirmar la selección de una sola entrada de matriz.
2. Definir en W-014 cómo cada `dist/sites/<site-directory>/` se asigna al Worker y dominio de su pod.
3. Añadir el ruteo bilingüe y `hreflang` de W-022 antes de usar alternates reales.

## Commits

- `0700bde` — `feat(generator): build a site from its config`

---

## Revisión de cowork

**Fecha:** 2026-09-02 · **Veredicto: aprobado con hallazgos.** El entregable queda; salen dos
cosas para el Bloque A, una de ellas con fecha límite real.

Revisado contra el diff de `0700bde`, leyendo `build-site.mjs`, `site-data.mjs`,
`changed-sites.mjs`, `BaseLayout.astro`, `[...slug].astro` y `ci.yml`.

### Qué hizo bien

**El template no se copió a ningún lado.** `sites/_example/` contiene tres archivos: el config
y dos markdown. Cero código. Esa era la trampa principal y la esquivó por diseño, no por suerte:
el config viaja por variables de entorno al proceso de Astro, así que el template sigue existiendo
una sola vez en el repo.

**Un build por sitio, con el razonamiento correcto.** La decisión se justificó por aislamiento de
fallos y no por velocidad: un config malo detiene su propio artefacto y no los otros 99. Y ese
razonamiento se llevó hasta el YAML, con `fail-fast: false` en la matriz, que es la mitad que se
suele olvidar.

**Determinismo verificado de verdad, no afirmado.** Dos builds consecutivos, hashes SHA-256
idénticos por archivo. Y de paso nombró el riesgo futuro correcto: si más adelante hay assets con
bundling, Astro puede meter hashes y Gate A tendrá que repetir la comprobación sobre el artefacto
completo. Ese aviso vale más que la comprobación de hoy.

**La matriz de CI quedó hecha**, aunque el prompt daba permiso explícito de posponerla. Y quedó
bien: cambio en entradas compartidas construye todos los sitios, cambio en un sitio construye solo
ese, y si no puede calcular el diff cae a construir todo, que es el lado correcto en el que fallar.

**El mapeo de markdown no toca `serviceArea`.** Lo dijo explícitamente. Era la trampa de la
pregunta 4 y no cayó.

### Hallazgo 1: la plantilla muestra el teléfono en formato de máquina

El pie de página renderiza `site.contact.trackingPhone`, que es E.164: un visitante ve
`+17720000000`. El schema tiene `displayPhone` justo para esto, con `(772) 000-0000`, y ese campo
**no se usa en ninguna parte del template**. Lo correcto es mostrar `displayPhone` como texto
visible y usar `trackingPhone` en el `href="tel:"`.

Tampoco se renderiza `contact.address`, y `docs/CONTENT_STANDARDS.md` tiene la consistencia de NAP
como regla permanente: nombre, dirección y teléfono deben coincidir exactamente con el Google
Business Profile, y la inconsistencia suprime rankings locales activamente. Hoy la plantilla
publica dos de los tres, uno de ellos mal formateado.

No rompe nada hoy porque no hay sitio público. Se arregla en W-021, que es el siguiente item del
Bloque A y el que toca el template en serio. Queda anotado ahí como corrección obligatoria, no
como mejora.

### Hallazgo 2: el renderer de markdown es propio, y contradice la razón por la que elegimos Astro

`markdownToHtml` en `site-data.mjs` maneja párrafos, `h2`, `h3` y saltos de línea. **No maneja
enlaces, listas, negritas, imágenes ni tablas.** Un guion al inicio de una línea sale como texto.

Dos razones por las que esto no se queda:

Primero, `docs/ARCHITECTURE.md` justifica la elección de Astro citando explícitamente sus content
collections como una de las capacidades que lo hacían mejor que HTML plano. Este renderer las
esquiva, así que estamos pagando el framework y no usando la parte que lo justificaba.

Segundo, y más concreto: **Pavel escribe contenido de seguros a partir del 21 de septiembre.** Una
página de coberturas es, en la práctica, una lista con enlaces. Si escribe una lista y sale un
párrafo con guiones, lo descubre él, escribiendo, y la respuesta va a ser pedirle a Vic que toque
el template, que es exactamente la dependencia que el handoff existe para cortar.

Es aceptable como versión mínima de hoy y está dentro de lo que el prompt pedía. **No es aceptable
que llegue al 21 de septiembre.** Se abre como **W-107** con esa fecha límite.

### Observación menor

`localeCompare` para ordenar archivos depende del ICU del entorno. En la práctica con nombres
ASCII no va a variar entre Windows y el runner de Linux, pero si algún día un slug lleva acentos,
el orden podría diferir y con él el output. Un `sort()` simple sería inmune. No amerita item; queda
dicho por si aparece un desorden inexplicable.

### Actualizaciones de backlog por esta revisión

- **W-107** — nuevo: renderer de markdown real, con fecha límite del 18 de septiembre
- **W-021** — corrección obligatoria: `displayPhone` visible con `tel:` sobre `trackingPhone`, y
  la dirección en el template por la regla de NAP
