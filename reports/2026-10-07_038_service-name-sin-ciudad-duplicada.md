# Reporte 038: Service schema sin ciudad duplicada

**Backlog:** W-125
**Fase:** 3

## Qué se hizo

- Se extrajo `serviceNames(serviceName, geo)` en `packages/template/src/lib/site-data.mjs`.
- La función elimina un sufijo final de ciudad opcionalmente precedido por `in`, con estado abreviado o completo y punto final opcional. Para Florida acepta `FL` y `Florida`.
- La entidad `Service` ahora usa el `serviceType` normalizado y construye `name` una sola vez con la ciudad, salvo cuando el tipo ya contiene la ciudad en otra posición.
- Se añadió una tabla de seis casos de Stuart y dos casos de `Port St. Lucie`, incluyendo la comprobación de caracteres especiales del nombre de ciudad.
- El fixture `_example` ahora contiene un `serviceName` con ciudad y estado, y conserva la aserción del schema generado sin duplicación.

## Decisiones tomadas

- La normalización elimina únicamente un lugar al final del campo. Así, `Stuart Flood Insurance` permanece intacto, mientras que `Flood Insurance in Stuart, FL` queda como `Flood Insurance`.
- Se escapó el nombre de ciudad antes de formar expresiones regulares para que nombres como `Port St. Lucie` y `Sewall's Point` no cambien el significado del patrón.

## Verificación

- `node --test scripts/schema.test.mjs`: 4 pruebas, 4 pasaron.
- `npm run check`: configuración válida, 0 errores y 0 warnings de tipos; 30 pruebas de bloques/configuración, 1 prueba de analytics y 4 pruebas de schema pasaron.
- Pendiente de registrar después del push: conclusiones de todos los workflows y lectura de las dos entidades `Service` publicadas de Stuart.

## Lo que tocaste fuera de lo pedido

- Nada. Los cambios de esta ejecución se limitan al template, las pruebas de schema, el fixture `_example` y este reporte.

## Lo que no pudiste verificar

- Pendiente al momento de este commit: la propagación a la copia publicada, que depende de que `Publish site Workers` termine en verde.

## Dónde dudaste

- El config actual restringe el estado a `FL`, pero el requisito contempla config con nombre completo. La función conserva el estado tal como venga y agrega el alias `Florida` cuando recibe `FL`.

## Qué te sorprendió del repo

- La guardia existente ya evita que cualquier prueba mencione el slug de un sitio real; las nuevas pruebas permanecen totalmente aisladas en la función pura y el fixture `_example`.

## Lo que no se hizo

- No se modificó Studio, el contenido de Stuart, workflows, ni las demás entidades del JSON-LD.

## Próximos pasos sugeridos

- Ninguno para W-125 si la verificación posterior al deploy confirma las dos entidades publicadas.

## Commits

- Pendiente al momento de redactar: `fix(template): Service schema name no longer repeats the city when the operator already wrote it`.
