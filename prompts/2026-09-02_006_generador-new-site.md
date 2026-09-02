# 2026-09-02_006 — El generador: de config a sitio construido

**Backlog:** W-026
**Fase:** 2, Bloque A
**Reporte esperado:** `reports/2026-09-02_006_generador-new-site.md`

## Contexto

Lee `AGENTS.md` completo antes de tocar nada. Luego `docs/ARCHITECTURE.md`,
`docs/SITE_CONFIG_SCHEMA.md` y `docs/CONTENT_STANDARDS.md`.

Hoy el repo tiene las dos mitades y ninguna conexión entre ellas. Existe un contrato cerrado
en `packages/config-schema/`, existe un template de Astro que renderiza una página fija, y
existe `sites/_example/site.config.json` que valida contra el contrato y **que nadie consume**.
El template no lee config. La validación de CI comprueba que el JSON está bien formado y nada
más.

**Esto es la pieza que faltaba, y de ella cuelga todo lo demás.** Sin generador, el schema es
un documento, la validación de CI es un linter de JSON, el fixture bilingüe no ejercita nada, y
Gate A no se puede evaluar: su segundo criterio dice literalmente que regenerar el sitio desde
su config tiene que reproducir lo que se publicó, y hoy no existe el verbo "regenerar".

**Alcance deliberadamente mínimo y tosco.** Está decidido en `docs/ARCHITECTURE.md` y no se
reabre: este generador solo renderiza el template desde config, y se reescribe durante los
pilotos. No es el momento de que quede bonito. Es el momento de que exista y de que el camino
config → sitio esté probado de punta a punta.

**Estado del repo:** `main` remoto y local sincronizados, CI verde, árbol limpio.

## Objetivo

Existe un comando que toma el slug de un sitio, lee su `site.config.json` y su contenido en
markdown, y produce un sitio construido y propio de ese sitio. El fixture `_example` se
construye con él, el resultado contiene datos que vienen del config, y CI construye únicamente
los sitios que cambiaron.

## Preguntas de diseño que TIENES que resolver

Cada una necesita decisión y razonamiento escrito en el reporte. No las contestes por lo que
sea más rápido de programar.

1. **¿Un build de Astro por sitio, o un build que produce todos los sitios a la vez?**
   Los datos que deciden: cada sitio es un dominio independiente, se agrupan en pods de ~25
   Workers, y el portafolio va a llegar a 100. Considera qué pasa cuando un config malo entra:
   ¿rompe su propio sitio o rompe el build de los demás?

2. **¿Cómo llega el config al template?** Variable de entorno, archivo generado, argumento de
   Astro, otra cosa. La restricción dura: el operador nunca edita el template para lanzar un
   sitio.

3. **¿Dónde vive el output de cada sitio y cómo se llama?** Lo va a consumir el deploy de
   Workers de W-014, que hoy está desactivado. Elige algo que no haya que renombrar después.

4. **¿Cómo se mapea el markdown de `sites/<slug>/content/` a páginas?** Versión mínima, pero
   escrita: qué archivo produce qué ruta. Ojo con `docs/CONTENT_STANDARDS.md`, que prohíbe
   generar páginas por ciudad desde `serviceArea`. Si tu mapeo permite eso, está mal.

5. **¿El generador es determinista?** El segundo criterio de Gate A es que regenerar desde
   config reproduzca lo publicado. Di explícitamente qué podría hacer que dos corridas con el
   mismo input produzcan output distinto (timestamps, orden de archivos, hashes) y qué hiciste
   al respecto.

## Restricciones

- **No reabras decisiones de `docs/ARCHITECTURE.md`.** Astro, Workers, monorepo y pods están
  cerrados. El generador es mínimo a propósito.
- **El operador solo toca config y markdown.** Si generar un sitio obliga a editar cualquier
  cosa fuera de `sites/<slug>/`, el diseño está mal. Esto no es una preferencia: es requisito
  duro del framework y es el criterio principal de Gate A.
- **No copies el template dentro de cada sitio.** Cien copias del template es exactamente la
  trampa que el monorepo existe para evitar.
- **Nada de diseño.** Sin design system, sin CSS elaborado, sin componentes de marketing. Eso
  es W-021 y no es este prompt.
- **No habilites `deploy.yml` ni `preview.yml`**, no crees secretos, no toques Cloudflare.
- **No borres `sites/_example/`.** Es el fixture y se queda.
- Si algo contradice `CLAUDE.md`, detente y repórtalo.

## Pasos

1. `git status` limpio y `git fetch origin`. Confirma que local y remoto coinciden.

2. Resuelve las cinco preguntas de diseño. Escribe el razonamiento, no solo la decisión.

3. **Construye el generador** en `scripts/`. Como mínimo debe: validar el config contra el
   schema antes de hacer nada, fallar con un mensaje útil si no valida, y construir el sitio.
   Un config inválido tiene que detener el build, no producir un sitio a medias.

4. **Haz que el template consuma el config.** Mínimo, pero real y visible en el HTML: nombre de
   marca, ciudad, teléfono de tracking, número de licencia, y el título y descripción de SEO.
   El número de licencia y el teléfono de tracking deben quedar en todas las páginas, porque
   `docs/CONTENT_STANDARDS.md` lo exige por compliance de Florida.

5. **Dale contenido al fixture.** Uno o dos archivos markdown en `sites/_example/content/`,
   suficientes para demostrar el mapeo que decidiste en la pregunta 4. Contenido de relleno
   claramente marcado como fixture; no escribas copy de seguros que alguien pueda confundir
   con real.

6. **Agrega el build por sitio a los scripts de raíz** y **la matriz de sitios cambiados a
   `ci.yml`**, para que un cambio en un sitio construya solo ese sitio. Esto estaba prometido
   en un comentario del YAML desde el prompt 002 y es el punto entero del monorepo.

   Si al llegar aquí ves que la matriz se lleva más tiempo del razonable, **para y repórtalo en
   vez de dejarla a medias**: es preferible un generador terminado y la matriz en el siguiente
   prompt, que las dos cosas incompletas.

7. **Verifica de verdad, con output real pegado:**
   - El generador construye `_example` y el HTML resultante contiene los valores del config
   - Un config inválido lo detiene, con el mensaje de error
   - Dos corridas seguidas producen el mismo output, o quedó explicado por qué no
   - `npm run check` y el build siguen pasando en local
   - CI queda verde tras el push, con el identificador del run

8. Sube a `main` sin force y pega el resultado de la corrida.

## Criterio de aceptación

- [ ] Las cinco preguntas de diseño están resueltas, cada una con razonamiento
- [ ] Existe el comando y construye `_example` desde su config
- [ ] El HTML generado contiene marca, ciudad, teléfono de tracking, número de licencia y SEO,
      tomados del config
- [ ] Un config inválido detiene el build con mensaje útil
- [ ] **Generar un sitio no requiere editar nada fuera de `sites/<slug>/`**
- [ ] El template no fue copiado dentro de ningún sitio
- [ ] Existe el build por sitio, y la matriz de CI existe o su ausencia está justificada
- [ ] CI verde sobre `main`, con identificador de run
- [ ] `git status` limpio al terminar

## Formato del reporte

Escribe `reports/2026-09-02_006_generador-new-site.md` con:

- **Qué se hizo**
- **Las cinco decisiones de diseño** — una sección por pregunta, con su razonamiento
- **Verificación** — output real de todo lo del paso 7
- **Tensiones que encontraste** — en especial cualquier punto donde el generador empuje contra
  la regla de que el operador solo toca config y markdown
- **Lo que tocaste fuera de lo pedido** — si no hubo, dilo explícitamente
- **Lo que no pudiste verificar**
- **Dónde dudaste**
- **Qué te sorprendió del repo**
- **Lo que no se hizo** — y por qué
- **Preguntas para Pavel** — él va a operar esto sin escribir código. Qué necesitas que valide
- **Próximos pasos sugeridos** — tú no creas items de backlog, los anotas aquí
- **Commits** — hashes y mensajes

No escribas la sección `## Revisión de cowork`.

Después del reporte, agrega tu entrada a `BITACORA.md` **al inicio del archivo** y actualiza
W-026 en `BACKLOG.md`. Ciérralo solo si el generador funciona y CI quedó verde; si la matriz
quedó pendiente, márcalo como avance y di exactamente qué falta. No toques nada más de esos dos
archivos.

## Commit message

```
feat(generator): build a site from its config

Advances W-026.
```
