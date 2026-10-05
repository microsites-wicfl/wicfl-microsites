# Reporte — Gate de huecos de lanzamiento

Fecha: 2026-10-05  
Prompt: `prompts/2026-10-05_036_gate-huecos-lanzamiento.md`

## Qué se hizo

Se amplió `scripts/check-production-config.mjs` para impedir que un micrositio llegue a producción cuando todavía contiene:

- Copy visible de uso interno: `internal`, `not published`, `template preview` o `microsite template`, además del marcador `demo` existente. La revisión se limita a `brand.name` y `seo.*`.
- Páginas Markdown de prueba por nombre, título o descripción. Los archivos cuyo nombre incluye `demo`, `test`, `sample`, `fixture` o `placeholder` se bloquean, salvo `index.md`.
- Una página obligatoria `content/privacy-policy.md`, con título exactamente `Privacy Policy`, contenido sustancial de al menos 1,500 caracteres después del frontmatter y sin contenido inicial o de prueba.

Los mensajes ahora identifican rutas bajo `content/` y explican la acción concreta que Pavel debe realizar en Studio. Las carpetas cuyo slug comienza con `_` siguen exentas para preservar los fixtures.

También se ampliaron las pruebas automatizadas para cubrir cada regla nueva y se actualizaron las expectativas del sitio real `stuart-homeowners`.

Commit de implementación: `262a770 fix(gate): production check also rejects internal SEO copy, test pages and a missing privacy policy`.

## Decisiones tomadas

- El detector de marcadores internos usa límites de palabra y solo se ejecuta en campos públicos configurables (`brand.name` y `seo.*`), evitando falsos positivos en `differentiation` y otros campos internos.
- El contenido de prueba se identifica tanto por nombre de archivo como por frontmatter para cubrir páginas que llegarían al sitemap aunque su ruta no revele el estado de borrador.
- Se exigió una política de privacidad real en vez de crear una de ejemplo: la responsabilidad de completarla sigue siendo de Pavel en Studio.

## Verificación

- `node --test scripts/check-production-config.test.mjs`: 10 pruebas aprobadas.
- `npm run check`: aprobado, con configuraciones, tipos, pruebas, analítica ligera y esquema en verde. Astro conservó su advertencia conocida de identificador duplicado `index` en el fixture `_example`; el comando terminó correctamente.
- `node scripts/check-production-config.mjs stuart-homeowners`: falló como debe. Señaló los marcadores demo e internos en `brand.name` y SEO, `content/about-demo.md`, `content/coverage-demo.md` y la ausencia de `content/privacy-policy.md`.
- `node scripts/check-production-config.mjs _example`: aprobado por exclusión explícita del fixture cuyo nombre inicia con `_`.
- [Validate and build, ejecución 37357878577](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/37357878577): `success`; incluyó pruebas de navegador, validación y builds de los dos sitios.
- [Publish site Workers, ejecución 37357878722](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/37357878722): `success`; publicó `_example` y `stuart-homeowners`.

## Lo que toqué fuera de lo pedido

Nada. Solo se modificaron los dos scripts de producción solicitados y este reporte. No se tocó contenido de sitios, Studio, plantilla, workflows ni despliegues.

## Lo que no pude verificar

No se verificó un despliegue de producción con contenido ya corregido: `stuart-homeowners` continúa bloqueado deliberadamente hasta que Pavel sustituya los datos de demostración, elimine las páginas de prueba y cree la política de privacidad desde Studio.

## Dónde dudé

El texto del prompt describe dos marcadores para la descripción SEO de Stuart, pero enumera tres patrones aplicables (`internal`, `not published` y `template preview`/`microsite template`). Se implementaron los tres patrones especificados; por eso esa descripción produce tres hallazgos, además del hallazgo `internal` del título SEO.

## Qué sorprendió

La revisión deja visible que dos páginas de demostración podían formar parte del sitemap y que faltaba una política de privacidad pese a que el formulario de cotización recopila datos personales. Ambos casos ahora impiden explícitamente un despliegue de producción.

## Lo que no se hizo

- No se editaron `about-demo.md`, `coverage-demo.md` ni los metadatos demo de Stuart.
- No se creó una política de privacidad ficticia.
- No se cambió la lógica de publicación ni se intentó desplegar un sitio que el gate rechaza.

## Próximos pasos

Pavel debe, desde Studio, reemplazar los textos demo e internos de Stuart, eliminar las páginas de prueba y crear una página con título exacto `Privacy Policy` y contenido legal final. Después, el gate debe volver a ejecutarse antes del próximo lanzamiento real.

## Revisión de cowork

**Veredicto: aceptado.** Revisado contra el diff de `262a770` y `56369fb`, no contra el reporte.

- El diff toca solo `scripts/check-production-config.mjs` y su prueba; el reporte va en su propio commit. Nada fuera de lo pedido, verificado con `git show --stat`.
- Reproducido en el shell del dispositivo: `node scripts/check-production-config.mjs stuart-homeowners` sale con los cuatro "demo" de siempre más la descripción interna (tres patrones, como pide el prompt), las dos páginas de prueba y la política ausente, con los mensajes exactos del prompt; `_example` sigue exento; `node --test scripts/check-production-config.test.mjs` 10/10.
- Workflows del push de `262a770`, verificados directo en la API de GitHub, no solo en el reporte: "Validate and build" 37357878577 success, "Publish site Workers" 37357878722 success. El push del reporte (`56369fb`) no toca rutas vigiladas y por eso no disparó nada: correcto.
- Detalle que acepto: el `seo.title` de Stuart ahora cae dos veces (demo e internal). Es ruido, no error, y desaparece cuando Pavel corrija el título.
- Lo que sigue, fuera de este prompt: Studio muestra su propia copia de estas reglas en "Before this site can go live" (`apps/studio/src/siteconfig.js`, `sites.js`) y hoy no ve las tres reglas nuevas. Lo alinea cowork en código de Studio.
