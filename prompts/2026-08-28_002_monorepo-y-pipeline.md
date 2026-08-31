# 2026-08-28_002 — Esqueleto del monorepo y pipeline de deploy

**Backlog:** W-012, W-014, W-098 (parcial)
**Fase:** 1
**Reporte esperado:** `reports/2026-08-28_002_monorepo-y-pipeline.md`

## Contexto

Este repo es la **fábrica** de microsites de seguros para WICFL. No es un sitio, es el
sistema que genera sitios. Hasta hoy solo tiene documentación y sistema de trabajo.

Antes de tocar nada, lee en este orden:

1. `CLAUDE.md` — reglas duras del proyecto
2. `PROJECT_BRIEF.md` — contexto completo, no estuviste en la conversación original
3. `docs/ARCHITECTURE.md` — decisiones cerradas y su razonamiento
4. `prompts/00_GUIA_GLOBAL.md` — cómo se trabaja aquí

**Por qué este prompt existe ahora.** La cuenta de Cloudflare está bloqueada esperando el
correo de empresa de Kevin (W-092). GitHub **no** tiene esa dependencia: en la bitácora del
25 de agosto quedó documentado que un repo puede arrancar en la cuenta personal de Vic y
transferirse después a la org sin pérdida (se lleva issues, PRs, historial, webhooks, secrets
y deploy keys, y deja redirects automáticos para que `clone`, `fetch` y `push` sigan
funcionando; lo único que cambia son los minutos de Actions mientras esté ahí). Así que la
estructura del monorepo y todo lo que no requiere credenciales de Cloudflare se puede
construir hoy, y el lunes solo se conecta.

**Estado del repo:** git desde el 2026-08-26, árbol limpio, `git fsck` sin hallazgos.
Corre `git status` antes de empezar y confirma que esté limpio. Si no lo está, **detente y
repórtalo**.

## Objetivo

Al terminar, el monorepo tiene su estructura completa, un workspace funcional, el template
de Astro arrancando en local, y los workflows de CI escritos y validados sintácticamente,
con todo lo que depende de credenciales de Cloudflare claramente marcado como pendiente y
documentado en un solo lugar.

Criterio de "terminado": alguien con el repo clonado corre dos comandos y ve el template
renderizado en su navegador, sin cuenta de Cloudflare ni dominio.

## Restricciones

- **No reabras decisiones de `docs/ARCHITECTURE.md`.** Astro, Cloudflare Workers con Static
  Assets, monorepo y pods de ~25 están cerrados. Nunca Pages.
- **No crees ni configures nada en Cloudflare.** No hay cuenta todavía y no debe crearse con
  un correo personal. Donde haga falta un account id, un zone id o un token, deja un
  placeholder explícito y anótalo en la sección de pendientes.
- **No toques `packages/config-schema/`** si ya existe. Es del prompt 001 y es el contrato.
  Si no existe todavía, crea únicamente el directorio con un `README.md` de una línea que
  diga que su contenido lo define el prompt 001. No inventes el schema aquí.
- **El operador solo toca config y markdown.** Si una decisión de estructura obliga a Pavel
  a editar un componente para lanzar un sitio, esa decisión está mal.
- **Nada de secretos en el repo.** Ni tokens, ni ids de cuenta, ni `.env` con valores reales.
- Si algo del prompt contradice `CLAUDE.md`, **detente y repórtalo.** No lo resuelvas tú.

## Pasos

1. Lee todo lo listado en Contexto y corre `git status`.

2. **Estructura del monorepo**, según `docs/ARCHITECTURE.md`:

   ```
   packages/template/        tema Astro compartido: layouts, componentes
   packages/config-schema/   el contrato (prompt 001, no lo toques)
   sites/                    un directorio por sitio, vacío por ahora
   scripts/                  ya existe
   .github/workflows/
   ```

   Usa workspaces (npm o pnpm, tú decides y justificas). `package.json` raíz con los scripts
   de conveniencia que el equipo va a usar todos los días.

3. **Template base de Astro que arranca.** No necesita diseño terminado: necesita correr.
   Un layout, una página índice, y que `astro dev` levante. El diseño completo es W-021.

4. **Un sitio de ejemplo desechable** en `sites/_example/`, con el guion bajo para que quede
   claro que no es un sitio real. Sirve para que el template tenga algo que renderizar y para
   que los workflows tengan algo contra qué correr. Documenta que se borra cuando exista el
   sitio #1.

5. **Workflows de GitHub Actions:**
   - Build con **filtros de path**, para que un cambio en un sitio no reconstruya los 100.
     Este es el punto entero del monorepo; si el workflow reconstruye todo, está mal.
   - Un job de validación que corra en cada PR.
   - El deploy a Cloudflare queda escrito pero **desactivado o con placeholders marcados**,
     porque no hay cuenta. Deja clarísimo qué secret hay que crear y dónde.

6. **Preview deploy por rama (W-098), la parte que se puede hoy.** Deja el workflow escrito
   y documenta exactamente qué falta para conectarlo. Este es el mecanismo por el que Pavel
   hace push de markdown y recibe una URL con su sitio renderizado; sin él escribe tres
   semanas a ciegas. Explica el flujo tal como lo va a vivir él, no en términos de YAML.

7. **`docs/SETUP.md` nuevo**, en inglés porque lo leen Kevin y Pavel: cómo clonar, instalar y
   correr en local, en pasos que alguien en rampa técnica pueda seguir sin ayuda. Incluye una
   sección **"Pending until the Cloudflare account exists"** con la lista exacta de lo que
   falta conectar. Esa lista es el entregable más valioso de este prompt: es lo que se ejecuta
   el día que llegue el correo de W-092.

8. **Verifica de verdad, con output real pegado en el reporte:** que la instalación corre, que
   el dev server levanta, que el build produce salida, y que los YAML son válidos.

## Criterio de aceptación

- [ ] `git status` limpio al empezar y al terminar
- [ ] La estructura de directorios coincide con `docs/ARCHITECTURE.md`
- [ ] Instalar y levantar el dev server funciona desde cero, con output pegado en el reporte
- [ ] El build produce salida estática
- [ ] Los workflows son YAML válido y el build está filtrado por path
- [ ] `packages/config-schema/` intacto si ya existía
- [ ] Cero secretos, ids de cuenta o tokens en el repo
- [ ] `docs/SETUP.md` existe y su sección de pendientes lista todo lo que bloquea Cloudflare
- [ ] Nada quedó a medias sin estar anotado en el reporte

## Formato del reporte

Escribe `reports/2026-08-28_002_monorepo-y-pipeline.md` con:

- **Qué se hizo** — archivos creados y modificados
- **Decisiones tomadas** — gestor de paquetes, estructura del workspace, forma del filtro de
  path, y cualquier bifurcación que hayas resuelto, cada una con su razonamiento
- **Verificación** — el output real de instalar, levantar y construir
- **Lo que queda bloqueado por Cloudflare** — la lista exacta, que es lo que se ejecuta el día
  que llegue el correo de empresa
- **Tensiones que encontraste** — cualquier punto donde la estructura empuje contra una regla
  de `CLAUDE.md`, en especial la de que el operador solo toca config y markdown
- **Lo que no se hizo** — y por qué
- **Próximos pasos sugeridos** — incluidos items de backlog que creas que faltan
- **Commits** — hashes y mensajes

Después del reporte, agrega tu entrada a `BITACORA.md` y marca en `BACKLOG.md` el avance de
W-012, W-014 y W-098 con refs a prompt, report y commit. **No cierres W-014 ni W-098**: no
pueden cerrarse sin la cuenta de Cloudflare. No toques nada más de esos dos archivos.

## Commit message

```
feat(repo): monorepo skeleton, Astro template and CI pipeline

Advances W-012, W-014, W-098. Cloudflare wiring pending on W-092.
```
