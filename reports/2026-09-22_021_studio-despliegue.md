# Reporte 021: despliegue de WICFL Studio desde GitHub Actions

**El ejecutor no escribió reporte, bitácora ni avance en el backlog** (cuarta vez seguida). Su
resumen en el chat: run verde [35786548805](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/35786548805),
URL `https://wicfl-studio.wicfl-microsites.workers.dev`, `GET /` 200 con
`<title>WICFL Studio</title>`, `GET /api/sites` 401. Commit `6768b2c`. Este archivo lo crea cowork
para dejar la revisión.

## Revisión de cowork

**2026-09-22 · Aprobado con hallazgos.** Revisado contra el diff de `6768b2c`.

- `deploy-studio.yml`: dispara por `push` a `main` en `apps/studio/**` o el propio workflow, y
  por `workflow_dispatch`; corre las pruebas antes; los secretos van por stdin con `printf`,
  nunca a logs; sin secretos escribe el aviso en el summary y termina verde. Lo pedido.
- **Hallazgo menor:** los secretos se cargan **antes** del deploy. Funciona porque el Worker ya
  existe desde este primer run; si algún día se borrara el Worker, el primer run con secretos
  podría fallar. Se corrige en el próximo prompt que toque el workflow (mover el paso después
  de "Deploy").
- **Hallazgo menor:** `npx wrangler` sin versión fija baja la última en cada run. Aceptable hoy.
- Verificación externa: cowork no puede alcanzar `*.workers.dev` desde su red (el proxy lo
  rechaza con 403 en el CONNECT, ni desde la nube ni desde el puente al equipo de Vic). Se toma la
  evidencia del ejecutor, que corre directo en la máquina de Vic.
- Confirmado contra la documentación de GitHub: el endpoint de check runs acepta tokens
  fine-grained con permiso **Checks: read**. El README lo pide.

**Pendiente para cerrar W-120 A1:** los dos pasos de navegador de Vic (token + secretos en la
cuenta `microsites-wicfl`; Access en el Worker), relanzar el workflow (Codex), y la prueba real
contra "Sitios de prueba → Example".
