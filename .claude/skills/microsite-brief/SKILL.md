---
name: microsite-brief
description: "Especifica un microsite nuevo de WICFL antes de generarlo. Produce el site.config.json completo, el mapa de páginas y el plan de diferenciación que hace que el sitio pase el swap test. Usar cuando se pida: brief de un sitio nuevo, spec de un microsite, definir un nicho, arrancar el sitio #N, o cuando alguien traiga un nicho y una ciudad y quiera saber qué se construye."
---

# Brief de un microsite WICFL

Este skill produce la especificación completa de un microsite **antes** de que exista una
sola línea de código. Su salida es lo que alimenta el comando `new-site`.

Lee `CLAUDE.md`, `docs/SITE_CONFIG_SCHEMA.md` y `docs/CONTENT_STANDARDS.md` antes de empezar.

## Regla que gobierna todo este skill

Un microsite solo se justifica si sobrevive el **swap test**: cambia el nombre de la ciudad
y pregúntate qué más tiene que cambiar. Si la respuesta es "nada", no estás especificando
un sitio, estás especificando una doorway page.

Tu trabajo no es rellenar campos. Es encontrar la razón por la que este sitio merece existir
por separado, y si no la encuentras, **decirlo**.

## Entradas mínimas

Si falta alguna, pídela antes de producir nada:

- Nicho de seguro (flood, homeowners, contractor liability, landlord, etc.)
- Ciudad o mercado objetivo
- Idioma primario (en / es)
- Audiencia (homeowner, contractor, landlord, business owner)

## Proceso

### 1. Investiga antes de escribir

No especifiques desde supuestos. Busca:

- Quién rankea hoy para el keyword principal en ese mercado, y por qué
- Qué tan competido está: agregadores nacionales, agencias establecidas, o vacío real
- Riesgos y regulaciones específicas de ese nicho en Florida (zonas de flood, requisitos de
  licencia para contratistas, reglas de wind mitigation, etc.)
- Qué hace distinto a ese mercado del mercado de al lado

Si la investigación dice que el nicho está dominado por aggregators con autoridad enorme
y no hay ángulo local real, **dilo antes de especificar el sitio**. Es información más
valiosa que un brief bonito.

### 2. Construye el plan de diferenciación primero

Antes del config, antes del mapa de páginas. Lista al menos tres cosas que serán ciertas
en este sitio y falsas en todos los demás del portfolio:

- Conocimiento específico del mercado (riesgo de storm surge en esa costa, edad del parque
  habitacional, requisitos de la aseguradora local, particularidades del county)
- Prueba local real (claims manejados ahí, reseñas de esa zona, relación con esa comunidad)
- Secciones únicas que ningún otro sitio del portfolio va a tener

Si no puedes llenar esto con contenido concreto, para. El problema no es el brief.

### 3. Produce el `site.config.json`

Completo, siguiendo `docs/SITE_CONFIG_SCHEMA.md`. El bloque `differentiation` se llena con
lo del paso 2, no con generalidades.

### 4. Produce el mapa de páginas

15 a 25 páginas iniciales. Para cada una:

| Página | URL | Keyword | Qué la hace única de este sitio |
|---|---|---|---|

La última columna es obligatoria y no acepta "menciona la ciudad". Si no puedes llenarla,
esa página no va en el lanzamiento inicial.

No especifiques la cola larga de 40 páginas. Eso se agrega solo cuando el sitio ya rankea.

### 5. Marca lo que falta

Cierra siempre con qué información necesitas de Kevin o del equipo para que el brief esté
completo: número de tracking, license number, dirección a mostrar, GBP propio o no.

## Si el sitio es en español

El contenido se escribe en español, nunca se traduce. Especifica el brief en español y
marca explícitamente que necesita escritor nativo. Un brief en inglés para un sitio en
español invita a que alguien lo traduzca, que es justo lo que no queremos.

## Formato de salida

Un documento markdown con estas cinco secciones, en este orden:

1. Lectura del mercado y veredicto (¿vale la pena este sitio?)
2. Plan de diferenciación
3. `site.config.json`
4. Mapa de páginas
5. Qué falta y de quién
