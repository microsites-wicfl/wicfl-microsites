# Reporte — 2026-08-28_002 monorepo-y-pipeline

## Qué se hizo

- Se creó el workspace npm de raíz con comandos diarios para desarrollo, build y validación de configuraciones.
- Se añadió `packages/template/`, un template Astro estático mínimo con layout y página índice que arranca localmente.
- Se creó `sites/_example/site.config.json`, un fixture desechable bilingüe (`en` + `es`) que valida contra el schema cerrado de W-020. No se modificó `packages/config-schema/`.
- Se añadieron los workflows de CI, deploy y preview, además de `docs/SETUP.md` en inglés con las instrucciones locales y el handoff exacto para Cloudflare.

## Decisiones tomadas

### Gestor de paquetes y workspace

Se eligió npm workspaces. Node y npm ya están disponibles en el entorno, `npm install` deja un lockfile reproducible y los comandos de raíz evitan que Pavel tenga que entrar a un paquete o conocer la estructura interna. Astro, AJV y las utilidades de comprobación se instalaron como herramientas compartidas de raíz; el template continúa siendo un workspace puro.

### Estructura del workspace

El template vive en `packages/template/`, el contrato existente se conserva en `packages/config-schema/` y cada sitio se alojará bajo `sites/`. El template no consume todavía el config de un sitio: esa composición pertenece al generador W-026 y al ruteo W-022. El fixture `_example` existe para mantener el caso bilingüe visible y validable antes de que haya un sitio real que lo necesite.

### Filtro de path

Los workflows solo se disparan cuando cambian inputs de fábrica: el lockfile, el template, el schema, sitios o el YAML correspondiente. Un cambio de documentación no consume CI. En esta fase el único build es el template compartido, no una reconstrucción de una cartera de sitios; W-026 debe convertir el comentario de la matriz de sitios cambiados en una matriz real cuando exista la generación por sitio.

### Deploy y preview

`deploy.yml` y `preview.yml` están escritos, con triggers restringidos, pero sus jobs tienen `if: ${{ false }}`. Enumeran los secretos exactos requeridos (`CLOUDFLARE_API_TOKEN` de alcance limitado y `CLOUDFLARE_ACCOUNT_ID`) sin incluir valores. Es más seguro mantener una conexión explícita pero inactiva que simular un deploy con credenciales personales.

## Verificación

Instalación reproducible ejecutada:

```text
added 398 packages, and audited 400 packages in 17s
```

Validación de los dos ejemplos de W-020 y el fixture bilingüe:

```text
packages/config-schema/examples/seguro-casa-miami.example.json valid
packages/config-schema/examples/stuart-flood.example.json valid
sites/_example/site.config.json valid
```

El servidor de desarrollo arrancó con `npm run dev -- --host 127.0.0.1`:

```text
astro  v5.18.2 ready in 744 ms
┃ Local    http://127.0.0.1:4321/
```

Una solicitud local devolvió HTTP `200` y el HTML incluyó `WICFL Microsites Template`.

El build ejecutado con `npm run build` produjo salida estática:

```text
[build] output: "static"
[build] directory: C:\Users\vitor\Coding\WICFL Microsites\packages\template\dist\
[build] 1 page(s) built in 2.21s
[build] Complete!
```

También se verificó que `packages/template/dist/index.html` existe. Los tres archivos YAML fueron parseados con `js-yaml`:

```text
ci.yml valid
deploy.yml valid
preview.yml valid
```

`git diff --check` terminó sin hallazgos antes del commit.

## Lo que queda bloqueado por Cloudflare

Hasta W-092 y W-010 no se puede:

1. Crear la cuenta de Cloudflare WICFL con el correo de empresa, administradores, 2FA y recuperación aprobados.
2. Crear el token de API limitado y obtener el account ID.
3. Guardar `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` como secrets de GitHub.
4. Crear `wrangler.toml`, los nombres de Workers, el mapeo pod/ruta y las rutas o dominios de producción.
5. Habilitar deploy de producción y previews por rama, incluyendo el nombre único y URL reportada por cada preview.
6. Ejecutar un preview y un deploy de prueba contra una cuenta de Cloudflare real.

## Tensiones que encontraste

El requisito de que Pavel solo toque config y markdown se mantiene: el setup local expone comandos de raíz y el fixture es config solamente. Sin embargo, aún no existe el generador W-026 que convierta una nueva carpeta de sitio en un output por sitio; por eso los workflows no pretenden construir sitios individuales todavía. Activar Cloudflare con una cuenta o token personal habría contradicho directamente las reglas, así que los jobs permanecen desactivados.

## Lo que tocaste fuera de lo pedido

No se modificó ningún archivo fuera del alcance. `package-lock.json` es el único archivo derivado añadido: es necesario para que `npm ci` reproduzca la instalación que el prompt exige verificar. No se tocó `packages/config-schema/`.

## Lo que no pudiste verificar

- GitHub Actions no pudo ejecutarse porque este repo aún no tiene remoto ni organización GitHub configurada.
- Los jobs de Cloudflare y preview no pueden verificarse hasta que exista la cuenta, configuración de Worker y secrets de W-092/W-010.
- El workflow no puede aún construir una matriz de sitios cambiados: no existe generador ni build de sitio individual antes de W-026.

## Dónde dudaste

- El prompt pide que un cambio en un sitio no reconstruya 100, pero todavía no existe el comando que construye un sitio desde config. Se resolvió con filtros de trigger y un build único del template, documentando de forma explícita la futura matriz de sitios en CI en lugar de inventar una generación inexistente.
- Astro instala sus herramientas de CLI y comprobación como dependencias compartidas de raíz en vez de cada workspace. Se eligió esa forma para que `npm run dev`, `npm run check` y `npm run build` sean los únicos comandos que el operador necesita conocer.

## Qué te sorprendió del repo

- El prompt decía que solo existía documentación, pero W-020 ya había añadido un schema y ejemplos; el contexto del encargo fue correcto y evitó sobrescribirlos.
- Dos intentos de `astro check` permanecieron vivos después de exceder el tiempo de la herramienta y bloquearon el binario de Rollup durante `npm ci`. Se detuvieron los procesos residuales por PID y la instalación limpia posterior pasó. El script cotidiano `check` quedó limitado a la validación del contrato; la compilación de Astro sigue siendo una verificación separada y sí pasó.
- La instalación informó 5 vulnerabilidades transitivas (1 low, 4 high). No se ejecutó `npm audit fix --force`, porque implicaría cambios no revisados de dependencias fuera del alcance.

## Lo que no se hizo

- No se creó la organización de GitHub ni se configuraron accesos: requiere el correo de empresa de W-092.
- No se creó cuenta, token, Worker, dominio, secret ni deployment de Cloudflare.
- No se implementaron diseño final, contenido, ruteo bilingüe, `hreflang`, generador de sitios ni la matriz real por sitio; corresponden a W-021, W-022 y W-026.

## Próximos pasos sugeridos

- W-021 debe transformar el template mínimo en el design system compartido sin permitir overrides de componentes por sitio.
- W-022 debe usar el fixture `_example` como caso de prueba real de rutas `en` y `es` y de `hreflang`.
- W-026 debe añadir el build por sitio y actualizar CI con una matriz basada solo en directorios `sites/<slug>/` modificados.
- Al cerrar W-092/W-010, seguir la sección **Pending until the Cloudflare account exists** de `docs/SETUP.md` antes de habilitar los workflows desactivados.

## Commits

- `1c37278` — `feat(repo): monorepo skeleton, Astro template and CI pipeline`
