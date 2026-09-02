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
