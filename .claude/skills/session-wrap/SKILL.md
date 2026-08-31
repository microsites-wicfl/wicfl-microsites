---
name: session-wrap
description: "Cierre de día del proyecto WICFL Microsites. Revisa lo que pasó, deja BITACORA y BACKLOG al día, verifica que el repo esté limpio y nombra la siguiente acción. Usar cuando se pida: cerrar el día, session wrap, wrap de la sesión, cierre de sesión, resumen del día, o cuando la sesión esté por terminar."
---

# Session wrap

Cierre de día. Su propósito no es resumir: es que **nada de lo que pasó hoy dependa de que
alguien se acuerde mañana**. Si el wrap es lo único que salva el día, el día ya se perdió a
medias. La bitácora se escribe conforme pasan las cosas; esto verifica y cierra.

Corre todo desde el bridge del escritorio, sobre `C:\Users\vitor\Coding\WICFL Microsites`.

## Pasos

**1. Reconstruir el día contra el repo, no contra la memoria.**

```
git log --oneline --since="today 00:00"
git status --short
ls reports/
```

Cualquier cosa que pasó y no dejó rastro en commits, reportes o bitácora es exactamente lo
que este wrap existe para rescatar.

**2. `BITACORA.md`.** Una entrada por día, al **inicio** del archivo, que es cronológico
inverso. Ese error ya se cometió dos veces; verifícalo con `grep -n "^## 2026" BITACORA.md`.

Lo que va en la entrada: qué se decidió y **por qué**, qué se descubrió que no sabíamos,
qué se rompió y cómo se arregló, y las lecciones que valen para el siguiente. Lo que NO va:
la lista de archivos tocados, que ya está en los commits.

**3. `BACKLOG.md`.** Que refleje la realidad de hoy: items cerrados con refs a prompt,
reporte y commit; items nuevos que salieron de reportes o de la conversación; dueños y
prioridades que cambiaron. **Solo cowork crea o reprioriza items**, así que si un reporte del
ejecutor sugirió uno, aquí es donde se evalúa y se crea.

**4. Verificar que el repo quede limpio.**

```
rm -f .git/index.lock .git/HEAD.lock
git status --short      # tiene que salir vacío
git fsck --no-progress  # sin hallazgos
find .git/objects -name 'tmp_obj_*' -delete
```

Nada se queda sin commitear. Si el borrado falla por permisos, pide
`device_request_delete_permission` en vez de dejarlo así.

**5. Documentos vivos que se desincronizan solos.** El master file publicado y el tracker
`WICFL-microsite-schedule.xlsx` no se actualizan por su cuenta. Si hoy cambió una fecha, un
gate, un dueño o un item, revísalos. El master file se republica pasando su URL en el
parámetro `url`, y su fuente se commitea en el mismo movimiento.

**6. Cerrar con cuatro cosas, en el chat, cortas.**

- Qué se movió hoy
- Qué quedó a medias y en qué estado exacto
- Qué está bloqueado y de quién depende
- **La siguiente acción**, una sola, la que se ejecuta primero mañana

## Regla

Si algo quedó a medias, se dice. Un wrap que reporta un día limpio cuando no lo fue es peor
que no hacer wrap, porque construye confianza en un estado que no existe.
