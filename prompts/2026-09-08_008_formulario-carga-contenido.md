# 2026-09-08_008 — Formulario mínimo de carga de contenido (sin git para Pavel)

**Backlog:** W-111
**Fase:** Paralela — no bloquea Fase 3 (Pavel, 21-sep). Ver la restricción de scope abajo.
**Reporte esperado:** `reports/2026-09-08_008_formulario-carga-contenido.md`

## Contexto

Lee `CLAUDE.md` completo antes de tocar nada. Luego `docs/ARCHITECTURE.md`,
`docs/SITE_CONFIG_SCHEMA.md`, `docs/CONTENT_STANDARDS.md`, `docs/OPERATOR_GUIDE.md` y
`docs/SETUP.md`. También la entrada de `BITACORA.md` del 2026-09-08 ("Prueba real de W-098 con
un PR de verdad") — de ahí sale este prompt.

**Cómo funciona hoy la carga de contenido.** Un sitio es `sites/<slug>/site.config.json` más
markdown en `sites/<slug>/content/*.md`. Publicar significa: editar esos archivos, subirlos en
una rama nueva, abrir un pull request. Un workflow de GitHub Actions (`preview.yml`) detecta qué
sitio cambió, lo valida, lo construye, lo despliega a un Worker efímero de Cloudflare, y comenta
la URL en el PR. Eso ya funciona — se verificó con un PR real el 8-sep — y **no requiere
terminal**: se puede hacer completo desde el editor web de github.com (`Commit changes...` →
`Create a new branch and start a pull request`).

**Por qué existe este prompt de todas formas.** Vic preguntó si construir una interfaz de
gestión amigable sobre este modelo. La respuesta de cowork: no un CMS completo — eso es
justo la Fase 7 que ya describe el diagrama de `docs/ARCHITECTURE.md`, y construirla ahora
completa compite contra el tiempo real antes del 17-sep y el 9-oct. Pero una versión mínima sí
vale la pena: quitarle a Pavel el vocabulario de git (rama, commit, pull request) sin tocar nada
de la arquitectura ni del pipeline.

**Lo que este formulario NO es:** no es un CMS, no reemplaza `preview.yml` ni `ci.yml`, no
aprueba ni mergea nada, no le da a Pavel ninguna capacidad que no tenga ya editando en
github.com. Es exclusivamente una puerta más simple hacia el mismo pull request que ya existe.

**Estado del repo al momento de escribir esto:** `main` local tiene commits que no están en
`origin/main` (ver W-110). **No empieces a ejecutar este prompt hasta confirmar que `git status`
está limpio y que tu `main` coincide con `origin/main` después de un `git fetch origin`.** Si no
coincide, para y repórtalo — no lo resuelvas tú mismo con un merge o rebase.

## Objetivo

Pavel entra a una sola página web, elige su sitio, escribe o pega el contenido de una página (o
edita campos de `site.config.json`), pulsa un botón tipo "Publicar borrador", y el resultado es
un pull request real y funcional contra este repo — el mismo que produciría hoy editando a mano
en github.com — sin que en ningún momento haya tenido que escribir un comando, crear una rama a
mano, o saber qué es un pull request.

## Restricciones

Estas son de `CLAUDE.md` y aplican con fuerza especial aquí:

- **El `site.config.json` schema es el contrato** (regla 3). El formulario no introduce ningún
  campo, formato o estructura que no exista ya en `packages/config-schema/site.config.schema.json`.
  Si un campo no está en el schema, el formulario no lo ofrece.
- **Ningún sitio se construye a mano** (regla 4). El formulario escribe exactamente los mismos
  dos tipos de archivo que Pavel escribiría a mano: `site.config.json` y markdown bajo
  `content/`. No genera HTML, no llama a ningún componente del template directamente.
- **No toques `packages/template/`, `scripts/build-*.mjs`, `ci.yml`, `preview.yml`,
  `preview-cleanup.yml`, `deploy.yml`, ni nada de `wrangler.*.toml` o `pods/`.** El formulario
  es un cliente nuevo que termina abriendo un PR igual que el editor web de GitHub; todo lo que
  pasa después de eso (validar, construir, previsualizar) sigue exactamente igual.
- **No auto-mergees nada.** Publicar un borrador crea o actualiza el PR. Fusionarlo sigue siendo
  una decisión humana deliberada — el checklist de autorevisión de W-095
  (`docs/CONTENT_STANDARDS.md`) y `differentiation-audit` siguen corriendo antes de mergear,
  exactamente como hoy.
- **Tokens con permisos acotados, nunca credenciales de cuenta completas** (regla 7, aplicada a
  GitHub además de Cloudflare). Si el formulario necesita autenticarse contra la API de GitHub
  para crear la rama/commit/PR, usa un token o GitHub App con el mínimo alcance necesario sobre
  este único repo (contenido + pull requests), guardado como secreto, nunca en código ni
  commiteado. Justifica en el reporte qué mecanismo elegiste y por qué.
- **Acceso acotado por sitio.** Aunque hoy solo hay un operador y un sitio real, no construyas
  algo que solo funcione para exactamente ese caso. Lee los sitios disponibles igual que
  `scripts/changed-sites.mjs` (cualquier carpeta bajo `sites/` con `site.config.json`). La
  autenticación de quién puede usar el formulario puede ser simple para esta escala (una
  contraseña compartida, Cloudflare Access, lo que decidas) — justifícalo, no lo dejes abierto
  al público.
- **No construyas un editor WYSIWYG.** Un `<textarea>` con una guía corta de sintaxis markdown
  soportada (la misma que ya renderiza el template) es suficiente para esta primera versión. Si
  ves que hace falta algo más rico, anótalo en "Próximos pasos sugeridos".
- **No actives `deploy.yml` ni toques nada de producción.**
- Si algo de esto contradice lo que encuentres en el repo, detente y repórtalo — no lo
  resuelvas por tu cuenta.

## Pasos

1. `git status` limpio y `git fetch origin`; confirma que `main` local coincide con
   `origin/main`. Si no, detente y repórtalo — no sigas.
2. Lee los documentos del contexto. Confirma tu entendimiento del contrato de
   `site.config.json` y de qué archivos escribe hoy un operador.
3. Decide y documenta la arquitectura de este formulario: dónde vive (sugerencia: un Cloudflare
   Worker o Pages Function, para quedarse en el mismo stack que ya usa el proyecto — pero no es
   obligatorio, decide tú y explica por qué), cómo se autentica contra GitHub para crear
   rama+commit+PR, y cómo se autentica el propio Pavel contra el formulario.
4. Construye la página: selector de sitio existente, campos editables del `site.config.json` de
   ese sitio (solo los que tiene sentido que un operador de contenido edite día a día — decide
   cuáles y justifica cuáles dejaste fuera), un editor de markdown por página (`textarea` +
   guía de sintaxis), y el botón de publicar.
5. Implementa el publish: crea o actualiza una rama con un nombre predecible (p. ej.
   `content/<slug>/<timestamp-o-slug-de-pagina>`), commitea los archivos cambiados, abre el pull
   request si no existe uno abierto para esa rama, o actualízalo si ya existe — mismo patrón que
   ya usa `preview.yml` para no duplicar el comentario de preview.
6. Verifica de punta a punta con un envío real: usa un sitio de prueba (no
   `stuart-homeowners`), publica un borrador desde el formulario, confirma que el PR se abrió
   correctamente, que `ci.yml` y `preview.yml` corrieron sobre él igual que si se hubiera
   editado a mano, y que la URL de preview apareció comentada. Pega el output real. Cierra el PR
   de prueba y borra la rama después de confirmar.
7. Sube a `main` sin force y pega el identificador de la corrida de CI.

## Criterio de aceptación

- [ ] El formulario lee la lista real de sitios desde `sites/*/site.config.json`
- [ ] Solo ofrece campos que existen en el schema; ninguno inventado
- [ ] Publicar un borrador abre o actualiza un pull request real, sin intervención manual de git
- [ ] Ese pull request dispara `ci.yml` y `preview.yml` sin ninguna modificación a esos archivos
- [ ] Nada se mergea automáticamente
- [ ] El token/credencial usado tiene el mínimo alcance necesario y no quedó commiteado
- [ ] Probado de punta a punta con un sitio de prueba, con output real pegado en el reporte
- [ ] `git status` limpio al terminar

## Formato del reporte

Escribe `reports/2026-09-08_008_formulario-carga-contenido.md` con:

- **Qué se hizo**
- **Decisiones de arquitectura** — dónde vive el formulario, cómo se autentica contra GitHub,
  cómo se autentica Pavel, y por qué
- **Verificación** — output real del paso 6 completo
- **Lo que tocaste fuera de lo pedido** — si no hubo, dilo explícitamente
- **Lo que no pudiste verificar**
- **Dónde dudaste** — cualquier punto donde este prompt era ambiguo
- **Qué te sorprendió del repo**
- **Lo que no se hizo** — y por qué
- **Preguntas para Pavel** — él es quien va a usar esto de verdad; qué necesitas que valide
  antes de darlo por bueno
- **Próximos pasos sugeridos**
- **Commits** — hashes y mensajes

No escribas la sección `## Revisión de cowork`.

Después del reporte, agrega tu entrada a `BITACORA.md` **al inicio del archivo** y actualiza
W-111 en `BACKLOG.md`, cerrándolo solo si quedó completo y verificado de punta a punta. No
toques nada más de esos dos archivos.

## Commit message

```
feat(operator-form): minimal no-git content submission form

Closes W-111.
```
