# 2026-10-06_037 — Las pruebas de `npm run check` dejan de depender del contenido de los sitios reales

**Backlog:** W-099 (QA automatizado), W-125 (schema), W-103 (gate)
**Fase:** 3 (lanzamiento de Stuart, 9 de octubre). **Bloquea el lanzamiento.**
**Reporte esperado:** `reports/2026-10-06_037_pruebas-desacopladas-de-sitios-reales.md`

## Contexto

El borrador de Stuart (PR #19, rama `draft/stuart-homeowners`) no tiene vista previa desde el
2 de octubre. Primero fue el incidente de `playwright` (arreglado en `7185cb6`), después un
incidente de GitHub Actions. Hoy, con GitHub sano, el reintento falló de verdad:

- "Validate and build" run 37362360635, intento 3: job "Validate all site configurations",
  paso `npm run check`, **failure a los 12 s** (en `main` el mismo paso pasa en 13 s, así que
  cae en lo último que corre: `node --test scripts/schema.test.mjs`).
- "Preview deploy" run 37362360759, intento 3: `npm run check` failure en los dos previews.

**Causa:** varias pruebas de `scripts/*.test.mjs` afirman el contenido que Stuart tenía cuando
era un demo. Stuart es un sitio real que Pavel edita a diario desde Studio, así que cada tarea
de su lista de lanzamiento rompe una prueba, CI se pone rojo, no hay vista previa y Studio no
lo deja publicar. Lo que hoy se sabe que se rompe o se va a romper:

1. `scripts/schema.test.mjs`, al final del test "site schema graphs connect entities…":
   `assert.equal(graphFor("stuart-homeowners", "flood-insurance").some((entity) => entity["@type"] === "Service"), false);`
   El borrador ya le puso `serviceName` a `flood-insurance.md` (es exactamente lo que le pedimos
   a Pavel), así que esa página **sí** emite `Service`. Es, casi seguro, la falla de hoy.
2. Mismo test: `assert.deepEqual(stuartAgency.areaServed, [Stuart, Port Salerno, Palm City])`.
   La lista de Pavel cambia la zona de servicio a siete lugares.
3. Mismo test: `stuartAgency.logo === ".../logo.svg"`. Pavel puede subir el logo en PNG o WebP.
4. `scripts/check-production-config.test.mjs`, test "reports Stuart's internal copy, test
   pages, and missing privacy policy" (lo metió el prompt 036 y cowork lo aceptó en revisión:
   error de la revisión): afirma que existen `about-demo.md` y `coverage-demo.md`, que la
   descripción es interna y que falta la política. Se rompe en cuanto Pavel borre las páginas
   de prueba, corrija la descripción o cree la política. Es decir, en cuanto termine.
5. `scripts/analytics.test.mjs` y `scripts/analytics.browser.test.mjs`: construyen
   `stuart-homeowners` y afirman valores fijos (`GTM-TV5RN2DB`, `wicfl-quote-v1`,
   `stuart-homeowners`). Son de configuración y hoy no cambian, pero es el mismo defecto.

No se pudo leer el log del job (requiere sesión de GitHub). **Tu primer paso es leerlo** y
confirmar o corregir el diagnóstico antes de cambiar nada.

## Objetivo

Regla nueva, que queda escrita y aplicada: **ninguna prueba afirma el contenido ni la
configuración de un sitio real.** Un sitio real es cualquier directorio de `sites/` que no
empieza con `_`. Las pruebas ejercitan el template con fixtures (`_example`, o sitios temporales
con prefijo `_` creados y borrados por la propia prueba, como ya hace `scripts/theme.test.mjs`),
y sobre los sitios reales solo comprueban invariantes derivadas de su propio config y contenido.

Cuando termines, `npm run check` pasa en `main` **y** pasa con el contenido del PR #19, **y**
seguiría pasando después de que Pavel haga cada cosa de su lista.

## Restricciones

- Solo `scripts/*.test.mjs`, y si hace falta fixtures bajo `sites/_example/` (por ejemplo una
  página con `serviceName` y otra sin él). Nada en `packages/template/`, `apps/studio/`,
  `.github/workflows/` ni en `sites/stuart-homeowners/`.
- **No toques la rama `draft/stuart-homeowners` ni el PR #19.** No hagas merge, rebase ni
  "update branch". Solo léelos.
- No bajes cobertura: cada afirmación sobre el template que hoy se hace contra Stuart se mueve
  a un fixture, no se borra. Si alguna no se puede mover, dilo en el reporte.
- No corras `prompts/2026-10-02_033_deploy-automatico-produccion.md`.
- `npm run check` no puede necesitar navegador.

## Pasos

1. **Lee el log real.** `gh run view 37362360635 --log-failed` (o el job 112405542957). Pega en
   el reporte las líneas del `AssertionError`. Si la falla no es la del punto 1 de arriba,
   detente en el diagnóstico, repórtalo y adapta el resto.

2. **`scripts/schema.test.mjs`.** Mueve a `_example` (o a un sitio temporal `_schema-fixture`)
   todo lo que hoy se afirma con valores fijos de Stuart: `@id`, `url`, `logo`,
   `parentOrganization`, ausencia de `address`, `telephone`, `email`, `areaServed` con tipos,
   Walker como `Organization` sin teléfono ni dirección, `ContactPage`, y **los dos casos de
   `Service`: una página con `serviceName` lo emite y una sin él no**. El fixture necesita un
   config con `agency`, teléfono y correo reales en formato (no los de Stuart) y una zona de
   servicio que ejercite `City`, `AdministrativeArea` y `Place`.
   Después agrega un test genérico sobre **cada sitio real** (descúbrelos leyendo `sites/`,
   sin nombrar ninguno) que compruebe solo invariantes derivadas:
   - el grafo de cada página está conectado y tiene exactamente un `InsuranceAgency`;
   - `telephone` y `email` de la agencia son los de `contact` del config de ese sitio;
   - los nombres de `areaServed` son los de `geo.serviceArea` de ese config, en el mismo orden;
   - no hay `address`;
   - una página emite `Service` si y solo si su frontmatter tiene `serviceName`.

3. **`scripts/check-production-config.test.mjs`.** Borra el test que corre el script contra el
   `stuart-homeowners` real. Sus cuatro reglas ya están cubiertas por los tests con sitios
   temporales del prompt 036; confirma que es así y, si falta alguna (por ejemplo los tres
   patrones de la descripción interna en el mismo campo), agrégala con un sitio temporal.

4. **`scripts/analytics.test.mjs` y `scripts/analytics.browser.test.mjs`.** Que no nombren
   ningún sitio real: usa `_example` o un fixture temporal con un GTM con formato válido y un
   dominio de prueba, o lee los valores esperados del config del sitio que construyen. La prueba
   de navegador debe seguir comprobando los cinco eventos.

5. **Guardia.** Agrega un test corto (en el archivo que prefieras) que falle si algún
   `scripts/*.test.mjs` contiene el slug de un sitio real como literal. Descubre los slugs
   leyendo `sites/`; no los escribas en la guardia. Mensaje: `Tests must not depend on a real
   site's content: <archivo> mentions "<slug>". Use sites/_example or a temporary _fixture.`

6. **Prueba que el objetivo se cumple, sin tocar el borrador.** En un directorio temporal fuera
   del repo (o un `git worktree` que borres al final):
   a. `main` con tus cambios: `npm ci && npm run check` → verde.
   b. Lo mismo más el contenido del PR #19 (`git fetch origin pull/19/head` y trae solo
      `sites/stuart-homeowners/` de ese commit) → verde.
   c. Lo mismo que (b) más la lista de Pavel simulada: borra `about-demo.md` y
      `coverage-demo.md`; crea `privacy-policy.md` con título y 2,000 caracteres; cambia
      `geo.serviceArea` a `["Stuart","Sewall's Point","Sailfish Point","Hutchinson Island","Palm City","Rocky Point","Martin County"]`;
      cambia `seo.title`, `seo.description` y las palabras clave por texto sin "demo" ni
      "internal"; renombra el logo a `logo.png` y `brand.logo` a `/logo.png` (usa cualquier PNG
      pequeño) → `npm run check` verde **y** `node scripts/check-production-config.mjs stuart-homeowners` sale en 0.
   Pega en el reporte la salida final de los tres. `npm ci` en copia limpia, no el
   `node_modules` de la máquina de Vic.

7. Commit, push, y espera **todos** los workflows del push ("Validate and build" y "Publish
   site Workers" como mínimo). Lista cada run con id y conclusión.

8. **No relances los runs del PR #19:** un re-run reutiliza el merge viejo y volvería a fallar.
   El borrador toma el arreglo con el siguiente guardado en Studio; de eso se encarga cowork.

## Criterio de aceptación

- [ ] El reporte cita el `AssertionError` real del log.
- [ ] `grep -n "stuart" scripts/*.test.mjs` no devuelve nada.
- [ ] La guardia del paso 5 existe y pasa.
- [ ] Los tres escenarios del paso 6 en verde, con salida pegada.
- [ ] "Validate and build" y "Publish site Workers" en verde en el commit del push.
- [ ] Ningún archivo fuera de `scripts/`, `sites/_example/` y `reports/` cambió (más
      `BITACORA.md`/`BACKLOG.md` si registras tu entrada).

## Formato del reporte

El de `prompts/TEMPLATE.md`. En "Verificación" van el `AssertionError`, las tres salidas del
paso 6 y la lista de workflows del paso 7.

*(Cowork agrega al final una sección `## Revisión de cowork` con su veredicto. No la escribas tú.)*

## Commit message

```
fix(tests): npm run check no longer asserts a real site's content

Refs W-099, W-125, W-103
```
