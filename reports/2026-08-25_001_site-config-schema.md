# Reporte — 2026-08-25_001 site-config-schema

## Qué se hizo

- Se creó `packages/config-schema/site.config.schema.json`, un JSON Schema draft 2020-12 estricto para el contrato completo de `site.config.json`.
- Se crearon y validaron dos configuraciones realistas: `packages/config-schema/examples/stuart-flood.example.json` y `packages/config-schema/examples/seguro-casa-miami.example.json`.
- Se reemplazó el borrador por la especificación final en `docs/SITE_CONFIG_SCHEMA.md`, incluyendo el contrato comentado, las decisiones y el proceso de evolución compatible.

## Las seis decisiones

### 1. serviceArea

**Decisión:** metadata de elegibilidad solamente; no genera rutas, páginas ni copy por ciudad.

**Por qué:** generar esas páginas codificaría el patrón de doorway pages que prohíbe el swap test. Las consultas de ciudades vecinas se atienden con una página que merezca existir por evidencia y contenido original, no por sustitución de nombres.

### 2. products

**Decisión:** enum fijo de productos que el template soporta explícitamente.

**Por qué:** así el template puede garantizar implementación de las páginas de cobertura. Un texto libre permitiría un sitio válido en apariencia pero incompleto en producción.

### 3. Variación de diseño

**Decisión:** bloque opcional `theme` en config, limitado a `variant` preconstruido y `accentColor`.

**Por qué:** mantiene al operador dentro de config y markdown, sin bifurcar CSS ni componentes por sitio. La variación adicional se incorpora primero al template compartido.

### 4. NAP

**Decisión:** una sola captura local de NAP en config; comparación con GBP como parte de QA de launch cuando exista un perfil.

**Por qué:** JSON Schema no puede validar honestamente contra una fuente remota. Duplicar NAP dentro del config crearía drift. El Place ID de GBP es opcional para habilitar la reconciliación de W-029.

### 5. differentiation

**Decisión:** estructura requerida para revisión humana; W-027 compara contenido renderizado, no las declaraciones.

**Por qué:** `localProof` y `uniqueSections` obligan a declarar evidencia real antes de generar. Solo el output publicado permite a CI detectar similitud y proteger contra el swap test.

### 6. Campos requeridos

**Decisión:** contacto, licencia, teléfono E.164 de tracking, analytics, CRM, SEO, productos, geografía, locale y diferenciación son requeridos.

**Por qué:** un sitio no debe validar sin disclosure legal, atribución de llamadas, enrutamiento de leads y evidencia declarada de diferenciación. Los placeholders claramente marcados permiten preparar la configuración antes de provisionar cuentas, pero no ocultan el trabajo pendiente de launch.

## Verificación

Comando ejecutado:

```sh
npx --yes ajv-cli validate --spec=draft2020 -s packages/config-schema/site.config.schema.json -d packages/config-schema/examples/stuart-flood.example.json -d packages/config-schema/examples/seguro-casa-miami.example.json
```

Output real:

```text
packages/config-schema/examples/stuart-flood.example.json valid
packages/config-schema/examples/seguro-casa-miami.example.json valid
```

También se ejecutó `git diff --check` sin hallazgos. La primera corrida de AJV reveló que la distribución de `ajv-cli` no incluye el formato `email` en modo estricto; el schema usa ahora un patrón explícito para que la validación sea portátil sin instalar dependencias del proyecto.

## Tensiones que encontraste

- La consistencia NAP contra Google Business Profile es una regla real, pero no se puede verificar mediante JSON Schema sin una integración remota que todavía no existe. Quedó explícitamente remitida al QA de launch de W-029, no simulada como una garantía del schema.
- Los placeholders hacen que una configuración sea validable antes de provisionar GA4, GTM, CRM y números reales. El schema no debe confundirse con permiso de publicar: los controles de launch deberán rechazar placeholders.
- `serviceArea` queda disponible para metadata, pero cualquier uso futuro que derive páginas o copy por área contradice `CONTENT_STANDARDS.md` y requeriría detenerse antes de implementarlo.

## Preguntas para Pavel

1. ¿El catálogo fijo de productos cubre los nichos que tu validación SEO considera viables para los dos pilotos, o falta alguno que el template deba soportar antes de congelarlo?
2. Para Stuart flood, ¿qué fuentes locales verificables pueden sostener el bloque de `localProof` sin recurrir a copy genérico?
3. Para Miami-Dade, ¿qué secciones originales en español responderían preguntas reales de propietarios y no serían una traducción de la versión en inglés?
4. ¿`serviceArea` basta como metadata de elegibilidad, o hay algún requisito legítimo de contenido que deba modelarse por separado y con evidencia propia, sin rutas por ciudad?
5. ¿Los límites de título, descripción y keywords son prácticos para tu flujo de investigación y redacción?
6. ¿Qué controles de revisión humana deben rechazar placeholders antes de que el sitio pase a QA de launch?

## Lo que no se hizo

- No se creó `package.json` ni se instalaron dependencias del proyecto; la validación usó `npx` directo, como exige el prompt.
- No se construyó template, generador, integración GBP/CRM/analytics ni gate de diferenciación. Corresponden a items posteriores.
- No se añadieron páginas por área de servicio ni campos de copy programático.

## Próximos pasos sugeridos

- W-021/W-026 deben consumir este contrato sin aceptar overrides de componentes o rutas.
- W-027 debe definir el umbral, corpus y salida accionable para comparar contenido renderizado entre sitios.
- W-029 debe incluir una verificación de NAP contra GBP y el rechazo de placeholders de producción.
- No se propone crear un item nuevo: los tres trabajos necesarios ya están representados en el backlog.

## Commits

- `ed3d425` — `feat(schema): close site.config.json contract with validation and examples`
