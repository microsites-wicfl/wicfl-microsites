# 2026-10-02_034 — Gate de producción: contenido de arranque e imágenes de muestra

**Backlog:** W-121, W-103
**Fase:** 6
**Reporte esperado:** `reports/2026-10-02_034_gate-contenido-de-arranque.md`

## Contexto

Desde hoy, **Studio → New site** crea la portada con el esqueleto del diseño (W-121): secciones
ya armadas, tres imágenes de muestra (`/images/sample-hero.jpg`, `/images/sample-photo-1.jpg`,
`/images/sample-photo-2.jpg`, dibujos marcados "SAMPLE IMAGE") e instrucciones entre corchetes
donde va el texto, por ejemplo `## [Write the headline: who this site helps, and with what]`.
Las otras dos páginas de arranque traen la nota
`Replace this text with the real page before publishing.`

Studio ya avisa de esos restos en "Before this site can go live", pero eso es un aviso. El gate
real es `scripts/check-production-config.mjs` (W-103), que hoy solo revisa `site.config.json`.
Un sitio podría llegar a producción con una imagen de muestra o una instrucción sin reemplazar.

## Objetivo

El gate de producción también falla si alguna página del sitio conserva contenido de arranque.

## Restricciones

- Todo lo construido en inglés.
- No toques `apps/studio/`, `packages/template/` ni el contenido de ningún sitio.
- `sites/_*` sigue exento, igual que hoy.
- Mismos patrones que Studio (`apps/studio/src/siteconfig.js`, `starterLeftovers`). No inventes
  otros: si divergen, Studio diría "listo" y el deploy fallaría, o al revés.
- Sin dependencias nuevas.

## Pasos

1. En `scripts/check-production-config.mjs`, después de revisar el config, recorre
   `sites/<slug>/content/**/*.md` y reporta, por archivo:
   - **imagen de muestra:** el texto contiene `/images/sample-`;
   - **texto de arranque:** el texto contiene
     `Replace this text with the real page before publishing.` o cumple
     `/\[(?:Write|Name|Explain) [^\]\n]*\](?!\()/`.
   Cada hallazgo es una línea con la ruta del archivo y cuál de los dos es. Cualquier hallazgo
   hace fallar el gate, con el mismo código de salida que los placeholders del config.
2. Pruebas en `scripts/check-production-config.test.mjs`:
   - una página con `![x](/images/sample-hero.jpg)` falla;
   - una con `[Write the headline]` falla; una con la nota de arranque falla;
   - una con un link normal `[our guide](/flood/)` y una imagen real pasa;
   - un sitio `_example`-like (slug con `_`) sigue exento;
   - Stuart sigue dando exactamente los hallazgos que da hoy (solo los de "Demo" del config, o
     ninguno si Pavel ya los quitó): no debe aparecer ninguno nuevo de contenido.
3. Agrega una línea a `docs/QA_CHECKLIST.md`: ninguna imagen "SAMPLE IMAGE" y ningún texto entre
   corchetes en el sitio publicado.
4. `npm run check` en verde. Commit y push.

## Criterio de aceptación

- [ ] El gate falla con imagen de muestra o texto de arranque en cualquier página de un sitio real.
- [ ] Stuart no gana hallazgos nuevos.
- [ ] `npm run check` verde.

## Formato del reporte

Escribe `reports/2026-10-02_034_gate-contenido-de-arranque.md` con las secciones de
`prompts/TEMPLATE.md`. En **Verificación** pega la salida del gate contra Stuart y contra un
sitio temporal de prueba con los tres casos.

## Commit message

```
feat(gate): block production on starter content and sample images (W-121, W-103)
```
