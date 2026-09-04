---
title: Fixture de seguro de inundación de ejemplo
description: Página de inicio de fixture desechable en español, usada para ejercer el ruteo bilingüe sin contenido de marketing de seguros real.
pageType: home
---

Este es contenido de fixture desechable, solo para verificar el generador. No es asesoría de
seguros, ni una promesa de producto, ni copy de marketing público.

## Verificación de config a plantilla

La plantilla compartida lee la configuración aprobada de este sitio y este archivo markdown al
momento de construir, en la ruta `/es/`.

### Contraparte del fixture en inglés

Esta página es la contraparte en español de `content/index.md` (que se sirve en `/`). El
mecanismo de `hreflang` debe enlazar ambas versiones entre sí, más un enlace `x-default` hacia el
idioma principal.
