# Reporte 020: revisión adversarial de WICFL Studio A1

**El ejecutor no escribió reporte.** En ~35 segundos agregó el job de CI (`555c7f4`, correcto) y
declaró "25/25 pruebas" como revisión: eso es correr la suite existente, no revisarla. No hubo
tabla por punto, ni pruebas nuevas, ni bitácora. Este reporte lo escribe cowork con la revisión
punto por punto que el prompt pedía, hecha contra el código.

## Revisión punto por punto

| Punto | Resultado | Evidencia |
|---|---|---|
| Límite de escritura: `..`, `%2e%2e`, doble codificación, `\`, mayúsculas, unicode, slug con `_`, rutas largas | No es problema | El router decodifica **una vez por segmento** y `paths.js` exige `[a-z0-9]` con `-`/`_` internos por segmento, `.md` y ≤3 niveles: `%252e` queda como `%2e` y se rechaza por el `%`; `\`, mayúsculas y unicode no pasan la regex. El slug nunca se decodifica y tiene su propia regex. Cubierto por las pruebas 11 y 12 (13 casos directos + 8 por HTTP). |
| Acceso | No es problema | La identidad viene de `ctx.access`, que pone Cloudflare, no de headers; sin Access, `getIdentity` no existe o da vacío → 401 antes de cualquier llamada a GitHub (prueba 1). Con `ALLOWED_EMAILS` vacío entra cualquiera que Access deje pasar: es el diseño (Access es la barrera primaria); el README pide llenar ambas. |
| Pérdida de trabajo: dos guardados a la vez | No es problema | El segundo usa un `sha` viejo → GitHub 409 → "Esta página cambió mientras la editabas" (prueba 13). |
| Pérdida de trabajo: descartar mientras se edita | Comportamiento aceptable | El guardado posterior no encuentra borrador, lee de `main`, crea uno nuevo y guarda. Se pierde lo descartado, que es lo que "descartar" significa. |
| Pérdida de trabajo: `main` avanza con borrador abierto | No es problema en A1 | Las lecturas salen del borrador; el compare de tres puntos solo lista lo que cambió el borrador. Integrar `main` al borrador es de A3 (Publicar). |
| Pérdida de trabajo: página borrada en el borrador | No es problema | 404 "Esa página no existe"; no se recrea sola (prueba 12). |
| **Estado de vista previa: "falló" por un check ajeno al sitio** | **Problema real, introducido por el job de CI de este mismo prompt** | El job `Test WICFL Studio` corre también en los commits de los borradores de Pavel. Si algún día fallara, **todo** sitio con borrador mostraría "La vista previa falló", sin culpa del sitio. Mismo caso con `Build <otro-sitio>` cuando cambian archivos compartidos. **Pruebas nuevas 23 y 24, rojas → verdes.** Arreglo: `preview.js` solo considera `Preview <slug>`, `Build <slug>`, `Validate all site configurations` y `Discover sites…`. |
| Estado de vista previa: "lista" sin estarlo | No es problema | "Lista" exige el check `Preview <slug>` **del commit actual** en `success` y la URL del comentario; un comentario viejo con el check nuevo en curso da "preparando" con la URL anterior (prueba 22). |
| Interfaz: XSS | No es problema | Todo lo que viene del repo (marca, dominio, rutas, texto de la página, motivo del fallo) pasa por `esc()`, que escapa `& < > " '`. La URL de la vista previa sale de una regex que solo acepta `https://…workers.dev`. |
| Interfaz: doble clic en Guardar | No es problema | El botón se deshabilita durante el guardado. |
| Interfaz: diálogo de salir sin guardar | Verificado | Recorrido en Chromium real en el reporte 019 (quedarse y salir). |
| Supuestos del GitHub falso vs. el real | Coinciden en lo que importa | 409 por `sha` en contents, 422 al crear/borrar una ref existente/inexistente, compare de tres puntos, matching-refs, check-runs por commit; resolución de `..` agregada al falso en el 019. Paginación: comentarios y check runs piden 100, suficiente para un PR por sitio. |
| Consola: el test de error de GitHub imprime el detalle interno (hallazgo del ejecutor) | No es problema | Es el `console.error` del Worker: en producción va a los logs de Cloudflare, que es donde tiene que estar; al usuario le llega el mensaje genérico (prueba 16). |

## Verificación

`npm test --prefix apps/studio`: **27 pruebas, 0 fallas** (25 + las dos nuevas). Salida antes
del arreglo: pruebas 23 y 24 en rojo; después, verdes. Job de CI `Test WICFL Studio` agregado
por el ejecutor en `555c7f4`, revisado: correcto y acotado.

## Revisión de cowork

**2026-09-22 · Aprobado con hallazgos, sobre el trabajo del ejecutor:** el job de CI queda.
La revisión adversarial no se hizo; la hizo cowork (tabla de arriba) y encontró un problema real
que el propio cambio de CI introducía. Queda para la siguiente A2/A3: el ejecutor sigue sin
escribir reportes ni bitácora, y cualquier cosa que no sea un cambio chico la resuelve en menos
de un minuto sin hacerla.
