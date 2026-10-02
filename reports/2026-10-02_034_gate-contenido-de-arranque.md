# 2026-10-02_034 — Gate de contenido de arranque

**Backlog:** W-121, W-103
**Fase:** 6
**Reporte esperado:** `reports/2026-10-02_034_gate-contenido-de-arranque.md`

## Qué se hizo

- Extendí el gate W-103 para recorrer todos los archivos Markdown bajo `sites/<slug>/content/`.
- El gate reporta por ruta las imágenes de muestra y el texto de arranque, y falla con el mismo código de salida de los placeholders del config.
- Usé los mismos tres patrones de Studio: `/images/sample-`, la nota exacta de reemplazo y la expresión para instrucciones entre corchetes.
- Añadí pruebas para los tres casos bloqueados, contenido real, fixtures exentos y la ausencia de hallazgos nuevos de contenido en Stuart.
- Añadí el requisito correspondiente a la checklist de QA.

## Decisiones tomadas

- Los hallazgos de config y contenido se acumulan en una sola ejecución, para que una corrección no oculte el siguiente bloqueo de producción.
- La exención por slug iniciado con `_` permanece antes de leer config o contenido, igual que el gate anterior.

## Verificación

`npm run check` pasó: validación de configs, tipos con 0 errores, 27 pruebas base, analytics y schema. El aviso de Astro sobre el ID duplicado `index` del fixture `_example` ya existía y el resultado de diagnóstico siguió en 0 warnings.

Salida del gate contra Stuart:

```text
Production-readiness check failed for sites/stuart-homeowners/:
  - brand.name: "Stuart Homeowners Insurance (Demo)" looks like a demo marker
  - seo.title: "Stuart Homeowners Insurance | Internal Demo" looks like a demo marker
  - seo.primaryKeyword: "Stuart homeowners insurance demo" looks like a demo marker
  - seo.secondaryKeywords[1]: "Martin County high value home insurance demo" looks like a demo marker

This site still carries placeholder data or starter content. It cannot go to a real production deploy.
```

La prueba creó un sitio temporal con los tres casos de contenido y confirmó esta salida por ruta:

```text
Production-readiness check failed for sites/starter-content/:
  - content/index.md: sample image
  - content/index.md: starter text
  - content/contact.md: starter text

This site still carries placeholder data or starter content. It cannot go to a real production deploy.
```

También pasó contenido real con `[our guide](/flood/)` e `![A real home](/images/home.jpg)`, y un fixture con slug `_starter-fixture` quedó exento.

## Lo que tocaste fuera de lo pedido

Nada. Los cambios se limitaron al gate, sus pruebas, la checklist y el reporte solicitado.

## Lo que no pude verificar

No hubo verificaciones pendientes. La publicación de Workers se comprobará después del push.

## Dónde dudaste

No hubo ambigüedades que requirieran una decisión de producto.

## Qué me sorprendió del repo

Stuart aún conserva cuatro marcadores `Demo` en su configuración, pero no tenía ninguno de los nuevos residuos de contenido. El gate continúa bloqueándolo por los marcadores preexistentes.

## Lo que no se hizo

No se modificaron `apps/studio/`, `packages/template/` ni contenido de ningún sitio.

## Próximos pasos sugeridos

- Pavel debe reemplazar los marcadores `Demo` de Stuart antes de un deploy de producción.

## Commits

Pendiente al momento de redactar el reporte: se creará con el mensaje solicitado por el prompt.
