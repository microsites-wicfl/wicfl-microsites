# 2026-09-01_003 — Conectar el remoto y subir el proyecto

**Backlog:** W-012
**Fase:** 1
**Reporte esperado:** `reports/2026-09-01_003_conectar-remoto.md`

## Contexto

Este repo es la **fábrica** de microsites de seguros para WICFL. Lee `AGENTS.md` completo
antes de tocar nada; te manda a `CLAUDE.md` y de ahí a `prompts/00_GUIA_GLOBAL.md`.

Kevin creó el buzón de empresa `microsites@wicfl.com` el 2026-09-01, lo que desbloqueó la
organización de GitHub. Vic ya creó la org **`microsites-wicfl`** y el repo vacío
**`wicfl-microsites`**. El repo local tiene 31 commits y todavía no tiene remoto.

**Por qué esto no es solo un `git push`.** Es el momento en que 31 commits que nunca salieron
de una máquina se vuelven un repo remoto. Es la última oportunidad barata de revisar la
historia completa antes de que exista en otro lado, y es el primer disparo real del pipeline
de CI que se escribió en el prompt 002 y que hasta hoy solo se validó como YAML.

## Objetivo

El proyecto vive en `https://github.com/microsites-wicfl/wicfl-microsites`, con la historia
completa, en la rama que los workflows esperan, y con una corrida de CI verde que lo demuestre.

## Restricciones

- **No reescribas la historia.** Nada de `rebase`, `squash`, `amend` ni `filter-branch` sobre
  los 31 commits existentes. Si encuentras algo que no debería estar ahí, **detente y
  repórtalo**: esa decisión no es tuya.
- **No hagas `push --force`** bajo ninguna circunstancia.
- **No crees ni configures nada en Cloudflare.** Esa cuenta la levanta Vic aparte.
- **Ningún secreto entra al repo**, ni en archivos ni en el mensaje de un commit.
- Si algo contradice `CLAUDE.md`, detente y repórtalo. No lo resuelvas tú.

## Pasos

1. `git status` y confirma árbol limpio. Si no lo está, detente y repórtalo.

2. **Barrido de secretos sobre la historia completa, antes del push.** Busca en todos los
   commits, no solo en el árbol actual, patrones de credenciales: tokens de Cloudflare, claves
   de API, contraseñas, `.env` con valores, cadenas tipo `sk-`, `ghp_`, `AKIA`, y cualquier
   cosa que parezca una contraseña asignada a una variable. Pega en el reporte el comando y su
   output real, aunque salga vacío. **Un resultado vacío es un hallazgo válido y hay que
   documentarlo.** Si encuentras algo, detente antes de hacer push.

3. **Renombra la rama a `main`.** Hoy se llama `master` y los tres workflows de
   `.github/workflows/` disparan sobre `branches: [main]`. Si haces push como `master`, CI no
   corre nunca y nadie se entera.

   ```
   git branch -m master main
   ```

4. **Conecta el remoto y sube.**

   ```
   git remote add origin https://github.com/microsites-wicfl/wicfl-microsites.git
   git push -u origin main
   ```

   Si el push es rechazado por historias no relacionadas, significa que el repo remoto se creó
   con algún archivo inicial. **No fuerces nada**: detente y repórtalo, Vic lo vacía desde la
   interfaz.

5. **Verifica que la corrida de CI haya pasado.** Es el primer disparo real de
   `.github/workflows/ci.yml`, que hasta hoy solo se validó como YAML. Si `gh` está disponible,
   úsalo; si no, dilo en el reporte y deja anotado que la verificación queda pendiente para Vic.
   Pega el resultado real.

   Si la corrida falla, **no la arregles a ciegas**: reporta el log del error y qué crees que
   lo causó. Que falle aquí es información valiosa, no un problema que esconder.

6. **Confirma que `deploy.yml` y `preview.yml` no se ejecutaron.** Tienen `if: ${{ false }}` a
   propósito porque no existe la cuenta de Cloudflare. Si alguno intentó correr, es un bug del
   prompt 002 y hay que reportarlo.

## Criterio de aceptación

- [ ] El barrido de secretos corrió sobre la historia completa, con output pegado en el reporte
- [ ] La rama local es `main` y el remoto la tiene como rama por defecto
- [ ] Los 31 commits están en el remoto, con la historia intacta y sin force push
- [ ] La corrida de CI pasó, o su falla está documentada con el log real
- [ ] `deploy.yml` y `preview.yml` no se ejecutaron
- [ ] No entró ningún secreto al repo

## Formato del reporte

Escribe `reports/2026-09-01_003_conectar-remoto.md` con:

- **Qué se hizo** — pasos ejecutados
- **Barrido de secretos** — comandos y output real, aunque esté vacío
- **Verificación** — output real del push y de la corrida de CI
- **Lo que tocaste fuera de lo pedido** — si no hubo, dilo explícitamente
- **Lo que no pudiste verificar**
- **Dónde dudaste** — cada punto donde este prompt fue ambiguo
- **Qué te sorprendió del repo**
- **Lo que no se hizo** — y por qué
- **Próximos pasos sugeridos** — tú no creas items de backlog, los anotas aquí
- **Commits** — hashes y mensajes

No escribas la sección `## Revisión de cowork`. Esa la agrega cowork después, contra el diff.

Después del reporte, agrega tu entrada a `BITACORA.md` **al inicio del archivo**, que es
cronológico inverso, y actualiza W-012 en `BACKLOG.md`. **Ciérralo solo si el push y CI
pasaron**; si algo quedó pendiente, márcalo como avance. No toques nada más de esos dos
archivos.

## Commit message

```
chore(repo): connect origin and push the factory

Advances W-012.
```
