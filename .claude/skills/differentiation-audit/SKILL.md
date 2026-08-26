---
name: differentiation-audit
description: "Corre el swap test sobre el contenido de un microsite WICFL antes de publicarlo. Detecta páginas que solo cambian el nombre de la ciudad y por lo tanto son doorway pages según Google. Usar cuando se pida: auditar contenido, revisar si un sitio pasa el swap test, comparar páginas entre sitios, revisar riesgo de doorway o de contenido duplicado antes de un launch."
---

# Auditoría de diferenciación

Este skill es la versión humana del gate de CI. Se usa **mientras se escribe el contenido**,
para no descubrir el problema cuando el deploy ya está bloqueado.

Lee `docs/CONTENT_STANDARDS.md` antes de empezar.

## Qué estás buscando

Google's spam policy nombra el patrón textualmente bajo doorway abuse:

> "Having multiple domain names or pages targeted at specific regions or cities that funnel
> users to one page."

El spam update de junio 2026 lo aplicó contra negocios locales. No es un riesgo teórico.

## El test

Para cada página, en este orden:

**1. El swap.** Sustituye mentalmente el nombre de la ciudad por otra ciudad de Florida.
Ahora lee la página completa. ¿Qué más tuvo que cambiar para que siga teniendo sentido?

- **Nada cambió** → doorway page. No publica.
- **Cambió el nombre y un par de zip codes** → doorway page con maquillaje. No publica.
- **Cambiaron datos de riesgo, referencias a regulación local, ejemplos, prueba social,
  y la página dejó de ser cierta** → pasa.

**2. El test del párrafo huérfano.** Toma cualquier párrafo suelto de la página. ¿Podrías
pegarlo en otro sitio del portfolio sin editar nada? Cuenta cuántos párrafos fallan.
Un sitio donde falla más del 40% del contenido no pasa.

**3. Comparación cruzada.** Compara contra los otros sitios que ya existen en `sites/`.
No compares solo estructura: compara frases. La similaridad estructural es esperada y está
bien. La similaridad de frases no.

## Qué reportar

Para cada página auditada:

| Página | Veredicto | Qué falla | Qué agregar |
|---|---|---|---|

Veredictos: **Pasa** / **Marginal** / **No publica**

En "Qué agregar" sé específico. "Más contenido local" no sirve. "Datos de la zona de flood
AE contra VE en esta costa, y qué implica para la prima" sí sirve.

## Al cerrar

- Cuenta cuántas páginas caen en cada veredicto
- Si más del 20% son "No publica", el problema no son esas páginas, es el enfoque del sitio.
  Dilo así.
- Si encuentras un patrón sistemático (por ejemplo, todas las páginas de producto usan la
  misma plantilla de copy), repórtalo como un problema del proceso, no de las páginas.
