# 2026-10-07_038 — El schema `Service` no duplica la ciudad cuando el Service name ya la trae

**Backlog:** W-125 (schema por página)
**Fase:** 3 (lanzamiento de Stuart, 9 de octubre)
**Reporte esperado:** `reports/2026-10-07_038_service-name-sin-ciudad-duplicada.md`

## Contexto

Una página con `serviceName` en su frontmatter emite una entidad `Service` en su JSON-LD
(`packages/template/src/lib/site-data.mjs`, hacia la línea 150):

```js
name: `${page.serviceName} in ${config.geo.city}`,
serviceType: page.serviceName,
```

El manual le pide al operador escribir solo el servicio ("Flood Insurance"). Pavel, razonablemente,
escribió el nombre completo en las siete páginas de Stuart, y eso ya está en `main`:

```
serviceName: "Flood Insurance in Stuart, FL"
serviceName: "Coastal Home Insurance in Stuart, FL"
serviceName: "Homeowners Insurance Stuart, FL"      (sin "in")
...
```

Resultado, visto en la copia publicada de Stuart: `Service.name` = **"Flood Insurance in Stuart, FL
in Stuart"** y `serviceType` = "Flood Insurance in Stuart, FL". No se ve en la página, pero es lo
que lee Google. Studio ya cambió su texto de ayuda para pedir el nombre sin la ciudad (cambio de
cowork, aparte), pero un campo de texto libre no puede depender de que el operador lo recuerde en
cada sitio: el template tiene que tolerar las dos formas.

## Objetivo

Sea cual sea la forma en que el operador escriba el Service name, el schema sale una sola vez con
la ciudad:

| `serviceName` en la página | `serviceType` | `name` (ciudad Stuart, estado FL) |
|---|---|---|
| `Flood Insurance` | `Flood Insurance` | `Flood Insurance in Stuart` |
| `Flood Insurance in Stuart, FL` | `Flood Insurance` | `Flood Insurance in Stuart` |
| `Flood Insurance in Stuart` | `Flood Insurance` | `Flood Insurance in Stuart` |
| `Homeowners Insurance Stuart, FL` | `Homeowners Insurance` | `Homeowners Insurance in Stuart` |
| `Flood Insurance in Stuart, Florida` | `Flood Insurance` | `Flood Insurance in Stuart` |
| `Stuart Flood Insurance` | `Stuart Flood Insurance` | `Stuart Flood Insurance` (la ciudad ya está; no se agrega otra vez) |

## Restricciones

- Solo `packages/template/src/lib/site-data.mjs` y pruebas en `scripts/schema.test.mjs` (más
  fixtures bajo `sites/_example/` si hacen falta). Nada en `apps/studio/`, `sites/stuart-homeowners/`
  ni workflows.
- **Regla del 6-oct (guardia en `schema.test.mjs`): ninguna prueba nombra ni afirma el contenido
  de un sitio real.** Las pruebas de este cambio van contra `_example` o contra la función pura.
- No cambies el `@id`, el `areaServed`, el `provider` ni ninguna otra entidad del grafo.
- No toques el contenido de Stuart: el arreglo es que el template lo tolere.
- `npm run check` no puede necesitar navegador.

## Pasos

1. Extrae una función pura y exportada en `site-data.mjs`, por ejemplo
   `serviceNames(serviceName, geo)`, que devuelva `{ serviceType, name }`:
   - recorta espacios; quita del **final** del texto, sin distinguir mayúsculas, un sufijo de
     lugar formado por `in` opcional, la ciudad (`geo.city`), y opcionalmente una coma y el estado
     en cualquiera de sus formas (`geo.state` como abreviatura, o el nombre completo del estado si
     el config lo tiene; para `FL` acepta también `Florida`), con punto final opcional;
   - lo que queda es `serviceType`. Si después de recortar queda vacío (el operador escribió solo
     la ciudad), usa el texto original como `serviceType`;
   - `name` es `` `${serviceType} in ${geo.city}` ``, **salvo** que `serviceType` ya contenga la
     ciudad como palabra completa en otra posición (caso "Stuart Flood Insurance"): entonces
     `name` es `serviceType` tal cual.
   - Escapa la ciudad al construir la expresión regular (hay ciudades con punto o apóstrofo:
     "St. Lucie", "Sewall's Point").
2. Úsala en la entidad `Service`.
3. Pruebas: una tabla con los seis casos de arriba contra la función pura, más dos con una ciudad
   que tenga punto y espacio (`Port St. Lucie`) para comprobar el escape. Y en el fixture
   `_example`, deja al menos una página cuyo `serviceName` incluya la ciudad del fixture y afirma
   el `name` resultante en el HTML construido.
4. `npm run check` completo, con su salida en el reporte.
5. Commit, push, y espera **todos** los workflows del push ("Validate and build" y "Publish site
   Workers"; este cambio toca `packages/template/**`, así que se republican los sitios).
6. Después de "Publish site Workers" en verde, comprueba la copia publicada de Stuart y pega en el
   reporte el `name` y el `serviceType` de la entidad `Service` de estas dos páginas:
   - `https://wicfl-stuart-homeowners-published.wicfl-microsites.workers.dev/flood-insurance/`
   - `https://wicfl-stuart-homeowners-published.wicfl-microsites.workers.dev/homeowners-insurance-stuart-fl/`
   Deben ser "Flood Insurance in Stuart" / "Flood Insurance" y "Homeowners Insurance in Stuart" /
   "Homeowners Insurance". (Leer la copia publicada no es afirmar contenido en una prueba: va en
   el reporte, no en `scripts/`.)

## Criterio de aceptación

- [ ] Los seis casos de la tabla y los dos de escape pasan como pruebas de la función pura.
- [ ] `npm run check` en verde, sin navegador; la guardia de sitios reales sigue pasando.
- [ ] "Validate and build" y "Publish site Workers" en verde en el commit del push.
- [ ] El reporte trae el `name` y `serviceType` reales de las dos páginas publicadas de Stuart.
- [ ] Ningún archivo fuera de `packages/template/src/lib/site-data.mjs`, `scripts/schema.test.mjs`,
      `sites/_example/` y `reports/` cambió (más `BITACORA.md`/`BACKLOG.md` si registras tu entrada).

## Formato del reporte

El de `prompts/TEMPLATE.md`.

*(Cowork agrega al final una sección `## Revisión de cowork` con su veredicto. No la escribas tú.)*

## Commit message

```
fix(template): Service schema name no longer repeats the city when the operator already wrote it

Refs W-125
```
