# Reporte — Pruebas desacopladas de sitios reales

**Backlog:** W-099, W-125, W-103  
**Fase:** 3, lanzamiento de Stuart  
**Prompt:** `prompts/2026-10-06_037_pruebas-desacopladas-de-sitios-reales.md`

## Qué se hizo

- Se confirmó la falla real de PR #19: `AssertionError`, `true !== false`, en `scripts/schema.test.mjs:140`. La página de flood ahora emite `Service`, mientras la prueba antigua todavía afirmaba lo contrario.
- Se movieron al fixture `sites/_example/` las expectativas fijas de schema: agencia, organización asociada, logo, falta de dirección, teléfono, correo, áreas `City`/`AdministrativeArea`/`Place`, `ContactPage` y los casos positivo y negativo de `Service`.
- `schema.test.mjs` descubre los directorios reales en `sites/` y comprueba solo invariantes derivadas del config y del frontmatter de cada página. Acepta frontmatter YAML indentado.
- Se eliminaron las expectativas del gate contra el sitio real. Un sitio temporal cubre simultáneamente los tres marcadores de la descripción interna, las dos páginas de prueba y la política ausente.
- Las pruebas de analítica, incluidas las cinco conversiones del navegador, usan `_example` y valores leídos de su config.
- Se agregó una guardia que falla si cualquier `scripts/*.test.mjs` contiene literalmente el slug de un sitio real.
- Se añadió `content/contact.md` y un GTM válido al fixture para ejercer el contrato de `ContactPage` y analítica sin depender de un sitio publicado.

## Decisiones tomadas

- Conservé las aserciones detalladas de schema, pero las concentré en `_example`; eliminar afirmaciones habría reducido cobertura.
- Para sitios reales, el criterio de `Service` se deriva de su propio `serviceName` en frontmatter. El detector acepta indentación antes de la clave, porque el contenido del PR usa YAML con espacios iniciales.
- No se tocó la rama ni el PR #19. La verificación tomó únicamente `sites/stuart-homeowners/` desde `origin/pr/19/head` en un worktree temporal separado.

## Verificación

### Falla original de Actions

`gh run view 37362360635 --log-failed` devolvió:

```text
# Subtest: site schema graphs connect entities and preserve FAQPage
not ok 1 - site schema graphs connect entities and preserve FAQPage
AssertionError: Expected values to be strictly equal:

true !== false

TestContext.<anonymous> (scripts/schema.test.mjs:140:10)
```

Corresponde a la aserción que prohibía `Service` en la página de flood.

### Guardia y pruebas locales

```text
rg -n -i "stuart-homeowners" scripts --glob "*.test.mjs"
# sin resultados

node --test scripts/schema.test.mjs
# tests 3, pass 3, fail 0

npm run check:browser
# tests 1, pass 1, fail 0
```

`npm run check` se ejecutó por completo: configuración y tipos válidos, 30 pruebas de bloques/gate/theme, una prueba de analítica y tres de schema, todas verdes. La comprobación de tipos conservó una advertencia conocida del cargador de Astro sobre IDs duplicados del fixture durante sincronización; el resultado de Astro fue `0 errors`, `0 warnings`, `0 hints` y el comando terminó correctamente.

### Escenarios de copia limpia

Se creó un worktree temporal fuera del repo y se ejecutó `npm ci` antes de cada escenario de `npm run check`.

1. Main con el cambio (`866319b`):

```text
npm ci
added 409 packages, and audited 411 packages in 16s

npm run check
# tests 30, pass 30, fail 0
# analytics: tests 1, pass 1, fail 0
# schema: tests 3, pass 3, fail 0
```

2. Mismo árbol más `sites/stuart-homeowners/` de `origin/pr/19/head`:

```text
npm run check
# tests 30, pass 30, fail 0
# analytics: tests 1, pass 1, fail 0
# schema: tests 3, pass 3, fail 0
```

3. Escenario 2 más la lista de Pavel simulada: se eliminaron las dos páginas demo, se añadió `privacy-policy.md` con título correcto y más de 2,000 caracteres, se actualizaron área de servicio y SEO, y se usó un `logo.png` existente de prueba:

```text
npm run check
# tests 30, pass 30, fail 0
# analytics: tests 1, pass 1, fail 0
# schema: tests 3, pass 3, fail 0

node scripts/check-production-config.mjs stuart-homeowners
Production-readiness check passed for sites/stuart-homeowners/site.config.json.
```

## Lo que toqué fuera de lo pedido

Nada. Los cambios versionados se limitan a `scripts/*.test.mjs` y `sites/_example/`, además de este reporte.

## Lo que no pude verificar

No se verificó un nuevo preview del PR #19: el prompt prohíbe relanzar esos runs y no se alteró el PR. El siguiente guardado de Pavel en Studio incorporará el arreglo desde `main`.

## Dónde dudé

El prompt pide un PNG pequeño para la simulación. Para no crear un binario artificial, la copia temporal usó el PNG ya existente de `_example`; no se versionó ni se aplicó a Stuart real.

## Qué me sorprendió del repo

La nueva página de contacto del fixture hace que Astro emita advertencias de IDs duplicados durante `check:types`, incluida una para `index.md` que ya existía. No produce diagnósticos ni falla el comando, pero merece revisión separada del cache o del cargador de contenido antes de tomar la advertencia como normal.

## Lo que no se hizo

- No se modificó contenido, SEO, configuración ni assets de `sites/stuart-homeowners/` en `main`.
- No se cambió `packages/template/`, Studio, workflows ni el gate de producción.
- No se hicieron merge, rebase, update branch ni re-run del PR #19.

## Próximos pasos sugeridos

- Cowork debe revisar la advertencia de IDs duplicados del cargador de Astro para decidir si es un cache transitorio o un problema de la definición de colección.
- Pavel puede continuar su lista de lanzamiento en Studio. El próximo guardado debe generar un preview con estas pruebas desacopladas.

## Commits

- `866319b fix(tests): npm run check no longer asserts a real site's content`

