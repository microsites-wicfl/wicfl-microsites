# WICFL Studio A1

Aplicación de Pavel para ver sitios y guardar cambios en un borrador por sitio. Usa JavaScript
vanilla, sin CDN ni build de interfaz. Para probar: `npm test --prefix apps/studio`.

Despliegue real: crear un Worker Build conectado a este repositorio, con directorio raíz
`apps/studio`; cargar `GITHUB_TOKEN` como secreto y configurar `ALLOWED_EMAILS`. El token debe
tener Contents read/write, Pull requests read/write, Commit statuses read y Checks read. Activar
Cloudflare Access en el Worker con política por email antes de usarlo. El token actual de
content-form debe revisarse en GitHub antes de reutilizarse.
