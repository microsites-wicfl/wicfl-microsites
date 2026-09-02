# Reporte — 2026-09-02_007: template, markdown y design system

## Qué se hizo

Se reemplazó el renderer manual por una content collection de Astro que consume el markdown externo de `sites/<site-directory>/content/`. Se añadieron frontmatter obligatorio, tipos `home`, `content` y `coverage`, tokens compartidos, variantes `coastal`, `civic` y `warm`, layout responsive, foco de teclado y cero JavaScript.

Primero se corrigieron las superficies NAP: el teléfono visible usa `contact.displayPhone`, cada enlace usa `tel:` con `contact.trackingPhone`, y el pie muestra la dirección completa configurada junto con licencia, correo y teléfono en todas las páginas.

## Decisiones de diseño

Astro carga contenido externo con `glob({ base: pathToFileURL(WICFL_SITE_CONTENT + "/") })`. El generador sigue pasando rutas por entorno y Astro recibe una URL `file:` compatible con Windows; Pavel solo escribe config y markdown bajo su sitio, sin editar componentes ni duplicar contenido.

Cada archivo requiere frontmatter con `title` y `pageType`; `description` es opcional y usa la SEO del config si falta. `pageType` solo admite `home`, `content` o `coverage`. Un valor faltante o inválido falla el sync de Astro en vez de depender de un primer encabezado frágil.

Los tokens definen tinta, superficie, bordes, espacio y tipografía serif. El diseño usa estructura, bordes y jerarquía clara, no degradados, tarjetas flotantes ni iconos decorativos. El teléfono es prominente y táctil sin dominar la lectura. Las variantes cambian solo el token de superficie; el acento llega únicamente de `theme.accentColor` como `--site-accent`, sin CSS ni overrides por sitio. Portada, contenido y cobertura comparten layout y se diferencian por tratamiento estructural mínimo.

No se añadió JavaScript: la búsqueda de `<script` en las tres páginas generadas devolvió `False`.

## Verificación

`npm run check` terminó en 0 y validó los dos ejemplos de schema y `_example`. `npm run build` terminó en 0 y construyó `/`, `/about-fixture/` y `/coverage-fixture/`.

El HTML generado contiene:

```html
<html lang="en" class="variant-coastal page-home" style="--site-accent: #006D77;">
<a class="phone-link" href="tel:+17720000000">(772) 000-0000</a>
<address>123 Placeholder Avenue<br>Stuart, FL 34994</address>
<p>Florida license: PLACEHOLDER-FL-LICENSE</p>
```

También contiene título/descripcion SEO, marca y ciudad del config. El fixture renderizó `ul`, `ol`, `strong`, `em`, enlace, `blockquote`, `table` y `pre > code` reales.

Para probar variación sin código, el fixture se cambió temporalmente a `civic/#7A3E00`; el HTML resultante contenía `class="variant-civic page-home"` y `--site-accent: #7A3E00`. Luego se restauró `coastal/#006D77`, se reconstruyó y `git diff --check` no produjo salida.

El push sin force fue aceptado. CI verde: [run 33670312569](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/33670312569), con `Validate all site configurations`, `Discover sites to build` y `Build _example` exitosos.

## Tensiones que encontraste

El loader `glob` espera una URL `file:` y el generador entrega una ruta Windows. `pathToFileURL` conserva el límite entre template y sitio sin copiar markdown ni pedir cambios fuera de `sites/<site-directory>/`.

## Lo que tocaste fuera de lo pedido

Nada fuera del template compartido, el fixture `_example`, el reporte y las dos entradas de backlog solicitadas.

## Lo que no pudiste verificar

`astro check --root packages/template`, con las variables del fixture, no terminó dentro de 30 segundos. Por eso `npm run check` sigue validando contrato JSON y no tipos de Astro; la CI sí construyó las tres rutas.

## Dónde dudaste

La historia contenía una implementación anterior del mismo prompt y dos reverts sin motivo registrado. La instrucción actual autorizó ejecutarlo, así que se reconstruyó desde el estado revertido sin reescribir historia. W-021 queda abierto porque su nota exige restaurar `astro check` antes de cerrarlo.

## Qué te sorprendió del repo

Astro emitió una advertencia de Tailwind sobre una configuración `content` vacía aunque el template no importa Tailwind. GitHub Actions conserva una advertencia de deprecación de Node 20 en acciones de terceros; ninguna afectó CI.

## Lo que no se hizo

Quedan pendientes los checks opcionales: fallar si un producto declarado no tiene markdown de cobertura y validar contraste de `theme.accentColor`. No se añadió una imagen de fixture porque el criterio requerido no exigía un asset y no se añadió decoración fuera de alcance.

## Preguntas para Pavel

1. ¿Los campos `title`, `description` y `pageType` del frontmatter son claros para su flujo de escritura?
2. ¿Los tres tipos de página cubren la arquitectura inicial del piloto?

## Próximos pasos sugeridos

1. Restaurar o sustituir `astro check` sin colgarse antes de cerrar W-021.
2. Evaluar los checks opcionales con el primer producto real y paleta aprobada.
3. Revisar la advertencia de Tailwind como higiene separada.

## Commits

- `478d7b2` — `feat(template): real markdown pipeline and design system`
