# BITÁCORA — WICFL Microsites

Log histórico de decisiones, sesiones y ejecuciones. Orden cronológico inverso.
El agente ejecutor solo agrega su propia entrada al cerrar un prompt; no edita entradas anteriores.

---

## 2026-08-26 · Revisión de arquitectura externa, seis hallazgos

**Quién:** Vic + arquitecto revisor + cowork

Vic pidió una revisión independiente del repo completo. Seis hallazgos, todos válidos.
**Dos eran errores míos y quedan reconocidos aquí para no repetirlos.**

**1. No había repo de git. Error mío.** Yo lo había dejado fuera a propósito, argumentando que
crear el monorepo era W-012. El argumento estaba mal: W-012 es la **org de GitHub**, no el git
local. Sin git no había historia ni respaldo, y peor, `00_GUIA_GLOBAL.md` le exigía al ejecutor
cerrar items "con refs a commit" cuando eso era imposible. **Corregido:** `git init` y commit
cero con los 22 archivos, hoy.

**2. `CLAUDE.md` estaba desincronizado. Error mío.** Actualicé backlog, bitácora, docs, xlsx y
master file cuando se cerraron W-001, W-002 y W-009, y olvidé el archivo que **todo agente lee
primero**. Un ejecutor literal se habría detenido a avisar de un bloqueador inexistente.
**Corregido:** bloqueadores reales listados, cerrados marcados como "no los vuelvas a levantar",
y nota de que ahora hay git.

**3. Aritmética de Gate B rota. Hallazgo más filoso de la revisión.** El gate prometía 120 días
de datos de ambos pilotos, pero el sitio #2 lanza el 30 de octubre y sus 120 días caen el 27 de
febrero, quince días **después** del gate del 12 de febrero. El sitio #1 sí cerraba a tiempo, el
6 de febrero. **Corregido: Gate B se mueve a la semana del 1 de marzo de 2027**, y la Fase 10 al
8 de marzo. Dos semanas y media contra una espera de cuatro meses es ruido; decidir construir
veinte sitios con datos más delgados de lo que nos prometimos, no.

**4. Fase 2 subestimada.** Diez items en nueve días hábiles, con Pavel de sombra restando
velocidad. **Corregido, y no recortando alcance:** se separó por deadline real. Solo la mitad de
Fase 2 está amarrada al handoff del 18 de septiembre (Bloque A: schema, template, ruteo bilingüe,
generador, handoff). La otra mitad está amarrada al launch del 9 de octubre (Bloque B: SEO
técnico, tracking, analytics y CRM, gate de CI, checklist de QA) y se construye durante Fase 3
con Pavel ya operando. Salvedad: el gate de diferenciación debe existir **antes de que se
publique el primer contenido**, principios de octubre, no antes del handoff.

**5. El CRM no estaba decidido en ningún lado.** W-025 decía "captura de leads al CRM" y el
schema tiene bloque `crm`, pero nadie lo nombró. Abierto como **W-096**, dependencia de Kevin.
Pregunta concreta: ¿la misma instancia de HighLevel que WAGS, una subcuenta, u otra cosa?

**6. Gate A tenía hueco de definición.** "≤5 días hábiles" no decía si escribir el contenido
contaba dentro. Si cuenta, nadie pasa. Si no cuenta, cinco días mide casi nada.
**Corregido y endurecido, no solo aclarado:** dos relojes. El criterio del gate es **tiempo de
fábrica ≤2 días hábiles**, desde contenido aprobado y config lleno hasta sitio vivo que pasa QA,
con cero código de Vic. El tiempo total transcurrido queda como métrica informativa contra la
línea base de los sitios #1 y #2. Y **Pavel elige el nicho del #3 él mismo**, porque correr el
loop completo sin ayuda es parte de lo que se mide.

**Nota técnica:** `git init` corrió desde el bridge del escritorio, que no puede borrar archivos.
Quedaron archivos `tmp_obj_*` huérfanos en `.git/objects/`. Git los ignora, pero conviene
limpiarlos con `git gc --prune=now` desde una terminal local antes del primer push.

**Lección:** cuando un dato cambia, la lista de archivos a actualizar tiene que incluir
`CLAUDE.md` de forma refleja. Es el único que un agente lee sin que nadie se lo pida, así que es
donde una desincronización cuesta más.

---

## 2026-08-25 (noche) · GoTo resuelto, roles cerrados, arranque

**Quién:** Vic + cowork

**GoTo confirmó $0.99 por número.** Vía Kevin, de customer care: *"you are currently paying
$0.99 per standard phone number."* Son $1,188/año a 100 números, **por debajo** de la ruta de
forwarding con Twilio que habíamos costeado en ~$1,900. Se compran directo en GoTo y se descarta
Twilio. W-001 cerrado.

**Lección que vale conservar:** los comparativos terceros ponían el DID de GoTo entre $4.99 y
$14.99, o sea $6,000-$18,000/año a 100 números. El número real es como un quinto del piso de ese
rango. Planear contra comparativos publicados en vez de un quote escrito habría sobrepresupuestado
esa línea hasta en $15,000/año, o peor, habría matado el escenario de 100 sitios por una
restricción que no existe. **Siempre pedir el quote escrito.**

**Kevin asignó el rol de contenido a Pavel**, además de project lead y SEO lead. Y Pavel
**escribe español nativo**, lo que elimina la contratación que creíamos necesaria antes de
finales de octubre y produce mejor español que cualquier traducción. W-002 cerrado.

**Pavel confirmó dedicación al proyecto.** W-009 cerrado y **las fechas quedan fijas**: Fase 3 el
21 de septiembre, sitio #1 el 9 de octubre, Gate B el 12 de febrero.

**Lo que confirmar la disponibilidad NO resolvió, y quedó como riesgo abierto:** Pavel carga tres
roles. Funciona para 50-75 páginas de los pilotos; a 20 sitios son 400-500 páginas y el contenido
se vuelve cuello de botella. El modo de falla no es atraso, es contenido más delgado, que es
justo lo que penalizan las políticas de spam. Se revisa en Gate B y Kevin debe esperarlo, no
sorprenderse.

**Hueco nuevo, W-095: nadie revisa el contenido antes de publicar.** Pavel escribe, optimiza y
publica. En un sitio de seguros eso significa que nadie de Walker valida claims de cobertura,
disclosures ni compliance de publicidad de Florida. Vic propuso "todos revisan" y cowork lo
rechazó: todos revisan significa que nadie revisa, y además esa revisión necesita a alguien que
venda seguros en Florida, no a cualquiera. Una firma por sitio, con nombre.

**Decisiones operativas de cuentas:**
- **Cloudflare se crea con correo de empresa**, no personal. Mover dominios entre cuentas después
  es por dominio, no arrastra configuración (DNS, SSL, rutas de Worker se recrean), tiene ventana
  de caída y deja el dominio bloqueado 30 días. Vic opera todo; lo único que cambia es de quién
  es la casa.
- **GitHub sí puede arrancar en la cuenta de Vic.** La transferencia a una org es limpia: se lleva
  issues, PRs, wiki, stars, historial, webhooks, secrets y deploy keys, y deja redirects
  automáticos para que `clone`, `fetch` y `push` sigan funcionando. Único detalle: los minutos de
  Actions se cobran al dueño mientras esté ahí.
- Vault: Bitwarden o 1Password, lo monta Vic.

**Entregables:** master file en v1.2 y luego v1.3 (misma URL), calendario xlsx v1.1 con Fase 1b y
track paralelo de rampa, mensaje a Kevin pidiendo un solo correo de empresa para unificar todas
las cuentas.

**Arranque:** se escribió `prompts/2026-08-25_001_site-config-schema.md`. Es el primer trabajo
real del proyecto y no depende de correos, dominios, nichos ni assets de marca.

---

## 2026-08-25 (tarde) · Integración del research de Pavel

**Quién:** Vic + cowork
**Qué:** Pavel mandó `Walker_Insurance_Microsite_Factory_Preparation_Plan.docx` con su plan de
preparación personal. Se revisó y se integró al plan.

**Lo que se adoptó de su documento:**
- **W-016 · Validación SEO del nicho antes de comprar dominio.** El mejor aporte. Nuestro plan
  iba directo de "Kevin elige nicho" a "construir sitio", sin paso de validación. Si Kevin elige
  un nicho dominado por agregadores nacionales, quemamos el piloto y no nos enteramos hasta
  Gate B, cuatro meses después. Ahora W-016 bloquea W-007 y W-011.
- **W-029 · Checklist de QA y launch.** Hueco real: teníamos el gate de diferenciación pero nada
  que cubriera técnico, mobile, conversión, tracking y deploy antes de publicar.
- **W-008 · Assets de marca de Walker** (logo, contacto aprobado, disclosures, license numbers).
  Dependencia de Kevin que no estaba en el backlog y bloquea el sitio #1.
- **W-017 · Provisionar accesos a Pavel.**

**Dos banderas que se le regresaron:**
1. **Su plan de contenido era AI-generated a partir de briefs.** Choca de frente con
   `docs/CONTENT_STANDARDS.md` y con la política de scaled content abuse de Google, que aplica
   "no matter how it's created". Se le explicó con la cita y se reforzó la sección de uso de AI
   en el doc de estándares. Nadie se lo había dicho; no fue descuido suyo.
2. **Su rampa de aprendizaje no estaba en nuestro calendario.** El documento revela que va a
   aprender HTML/CSS, JavaScript básico, Astro, Git y Cloudflare en paralelo. Nuestro calendario
   asumía que el 21 de septiembre entraba a Fase 3 listo para operar. Se creó el track paralelo
   W-018/W-019 y se abrió W-009 para conocer su disponibilidad real antes de mover fechas con Kevin.

**Diferencia de criterio resuelta:** Pavel escribió que no hay que automatizar antes de que los
primeros sitios prueben el workflow. Se acordó punto medio y quedó registrado como decisión en
`docs/ARCHITECTURE.md`: generador mínimo desde el sitio #1, tosco a propósito, que se reescribe
durante los pilotos. La automatización pesada (dominios por API, provisioning) sí espera hasta
después del sitio #3.

**Lo que no se adoptó, porque ya existía:** content brief template (skill `microsite-brief`),
site configuration template (`docs/SITE_CONFIG_SCHEMA.md`) y content differentiation checklist
(skill `differentiation-audit` + W-027). Que Pavel llegara solo a los mismos tres entregables es
buena señal del diagnóstico compartido. Se le pidió que en vez de rehacerlos, los lea y diga qué
les falta, sobre todo al schema, que es el momento de romperlo.

**Lección:** el documento de Pavel también reveló su perfil real. Es fuerte en SEO y contenido,
donde su propia tabla lo pone como lead, y está en rampa en lo técnico. Eso convierte "Pavel solo
toca config y markdown" de preferencia de diseño en requisito duro del framework.

**Riesgo abierto:** la fecha de launch del sitio #1 (9 oct) queda en riesgo hasta cerrar W-009.
Corre el reloj de 120 días de Gate B, así que moverla mueve Gate B.

---

## 2026-08-25 · Setup del repo y sistema de trabajo

**Quién:** Vic + cowork
**Qué:** Se creó este repo con la documentación de arquitectura, el sistema de prompts/reports,
el backlog inicial y dos skills de proyecto. Todavía no hay código.

**Contexto:** Kevin propuso el proyecto el 2026-08-24 y mandó un plan de equipo el 2026-08-25.
Vic respondió con siete cambios y Kevin los aceptó. El detalle completo está en `PROJECT_BRIEF.md`.

**Decisiones cerradas en esta sesión:**
- Cloudflare Workers con Static Assets, no Pages
- Astro, no HTML plano
- Un monorepo, no un repo por sitio
- Pods de ~25 sitios por Worker
- Dos gates separados (técnico y comercial), no un solo hito de "proceso probado"
- El sitio #3 se genera desde config, no se construye a mano
- El gate de diferenciación de contenido vive en CI, no en la disciplina del equipo

**Costos verificados contra fuentes oficiales** (Cloudflare Workers pricing y limits,
Cloudflare Registrar, aviso de Verisign de noviembre 2026, GitHub Actions billing,
Twilio US voice, CallRail). Detalle en `docs/COST_MODEL.md`. El único número sin verificar
es el precio por DID de GoTo, que no es público.

**Entregables de la sesión:**
- Reply a Kevin con recomendaciones y modelo de costos (enviado, convertido a Google Doc por Kevin)
- Feedback al plan de equipo con siete cambios (enviado, aceptado)
- Master file como página web viva: https://claude.ai/code/artifact/b1c34949-479b-48f6-a269-8522d4b2aa82
- Calendario de actividades en xlsx con 10 fases, owners, fechas y los dos gates
- Este repo

**Pendiente al cierre:** los siete items de Fase 0 en `BACKLOG.md`, todos de Kevin.
Dos de ellos son bloqueadores duros (W-001 quote de GoTo, W-002 dueño del contenido).

**Lección para el siguiente:** Kevin responde bien a argumentos con datos verificados y
fuentes citadas. El feedback que más peso tuvo fue el estructural (separar los gates,
exigir que el sitio #3 se genere), no el de stack.
