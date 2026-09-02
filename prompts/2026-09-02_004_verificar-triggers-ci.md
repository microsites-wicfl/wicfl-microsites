# 2026-09-02_004 — Verificar que el pipeline de verdad se dispara

**Backlog:** W-012, W-014
**Fase:** 1
**Reporte esperado:** `reports/2026-09-02_004_verificar-triggers-ci.md`

## Contexto

Lee `AGENTS.md` completo antes de tocar nada.

El repo ya está en `https://github.com/microsites-wicfl/wicfl-microsites`, rama `main`, 37
commits, sin force push. Los tres workflows aparecen como activos. **Y Actions reporta cero
corridas.**

**Por qué esto no se puede dejar así.** El flujo completo de Pavel a partir del 21 de
septiembre es: crear una rama, hacer push de markdown, abrir un pull request, recibir una URL
de preview y revisar su trabajo ahí. Todo eso corre sobre el trigger `pull_request`, que se
escribió en el prompt 002, se validó como YAML y **nunca se ha ejecutado ni una vez**. Un
pipeline que nadie ha visto correr es indistinguible de no tener pipeline, y el handoff se lo
promete a Pavel como si funcionara.

Además quedó sin comprobar que los guards `if: ${{ false }}` de `deploy.yml` y `preview.yml` se
comporten como se espera **dentro** de un run. Hoy solo sabemos que no hubo runs, que es una
forma débil de saberlo.

**Hipótesis sobre los cero runs, para que no la des por hecha.** El reporte anterior propuso
que el último commit era de documentación y por eso no coincidió con los filtros. Eso no es
cómo funciona: en un evento `push`, GitHub evalúa el filtro contra el conjunto de commits del
push, y ese push traía `package.json`, `packages/**` y `sites/**`. La hipótesis más consistente
es que **en el primer push a un repositorio vacío no hay base contra la cual calcular un diff**,
y sin diff no hay paths que evaluar. Sería un artefacto de una sola vez y no habría nada que
arreglar. **Tu trabajo es determinar cuál es, con evidencia, no asumir ninguna.**

## Objetivo

Saber, con corridas reales pegadas en el reporte, si el pipeline se dispara solo cuando debe.
Al terminar tiene que estar contestado, con evidencia y no con teoría:

1. ¿El workflow es válido y pasa en verde cuando corre?
2. ¿El trigger `pull_request` se dispara y aplica bien el filtro de paths?
3. ¿Los jobs de `deploy.yml` y `preview.yml` quedan efectivamente omitidos dentro de un run?
4. ¿Los cero runs del push inicial fueron un artefacto de una sola vez, o hay un defecto real
   en los filtros?

## Restricciones

- **No modifiques ningún workflow todavía.** Primero mide, después se decide. Si concluyes que
  hace falta un cambio de YAML, **anótalo en el reporte y no lo apliques**: eso lo evalúa cowork.
- **No habilites `deploy.yml` ni `preview.yml`**, ni crees secretos, ni toques Cloudflare.
- **Nada se mergea a `main`** en este prompt. El pull request de prueba se cierra sin mergear.
- No hagas force push ni reescribas historia.
- Si algo contradice `CLAUDE.md`, detente y repórtalo.

## Pasos

1. `git status` limpio y `git fetch origin`. Confirma que local y remoto coinciden.

2. **Confirma que Actions está habilitado** a nivel de organización y de repositorio, y que no
   hay una política que bloquee las corridas. Pega lo que encuentres. Si está deshabilitado,
   ese es el hallazgo completo: detente ahí y repórtalo, porque lo demás no aplica.

3. **Despacha `ci.yml` manualmente** con `workflow_dispatch`, que el workflow ya declara.
   Esto no prueba los triggers, y no pretende hacerlo: prueba que el workflow es válido y que
   pasa en verde. Espera a que termine y pega el resultado real. Si falla, pega el log del
   error completo y **no lo arregles a ciegas**.

4. **Prueba el trigger del que depende Pavel.** Crea una rama `ci/verify-triggers`, haz un
   cambio mínimo y reversible en un archivo que sí coincide con los filtros, por ejemplo un
   comentario en `packages/template/src/pages/index.astro`, y abre un pull request contra
   `main`.

   Sobre ese pull request comprueba y pega:
   - Que `ci.yml` se disparó y con qué resultado
   - Que `preview.yml` se disparó y que su job quedó **omitido** por el guard, que es lo
     esperado. Un job omitido y un workflow que no corre se ven parecidos desde fuera y no son
     lo mismo: distínguelos explícitamente
   - Que `deploy.yml` **no** se disparó, porque su trigger es `push` a `main`

5. **Cierra el pull request sin mergear y borra la rama**, local y remota. `main` queda
   exactamente como estaba.

6. **Concluye sobre los cero runs del push inicial**, con el razonamiento apoyado en lo que
   observaste en los pasos 3 y 4, y di explícitamente qué no pudiste determinar.

## Criterio de aceptación

- [ ] Consta el estado de Actions en org y repo
- [ ] Hay una corrida de `ci.yml` con resultado real pegado en el reporte
- [ ] Hay un pull request de prueba con evidencia de qué se disparó y qué no
- [ ] Está distinguido explícitamente "job omitido" de "workflow que no corrió"
- [ ] El pull request quedó cerrado sin mergear y la rama borrada en local y remoto
- [ ] `main` quedó intacta y `git status` limpio
- [ ] Ningún workflow fue modificado

## Formato del reporte

Escribe `reports/2026-09-02_004_verificar-triggers-ci.md` con:

- **Qué se hizo**
- **Las cuatro preguntas** — una sección por pregunta del objetivo, con la evidencia que la
  contesta. Si alguna quedó sin contestar, dilo así en vez de inferirla
- **Verificación** — output real de las corridas
- **Lo que tocaste fuera de lo pedido** — si no hubo, dilo explícitamente
- **Lo que no pudiste verificar**
- **Dónde dudaste**
- **Qué te sorprendió del repo**
- **Lo que no se hizo** — y por qué
- **Próximos pasos sugeridos** — incluido cualquier cambio de YAML que creas necesario, que
  aquí se propone y no se aplica
- **Commits** — hashes y mensajes

No escribas la sección `## Revisión de cowork`.

Después del reporte, agrega tu entrada a `BITACORA.md` **al inicio del archivo**. En
`BACKLOG.md`, **cierra W-012 solo si `ci.yml` corrió en verde y el trigger `pull_request`
quedó demostrado**; si no, déjalo como avance con el estado exacto. No toques nada más de esos
dos archivos.

## Commit message

```
test(ci): verify workflow triggers with a throwaway pull request

Advances W-012, W-014.
```
