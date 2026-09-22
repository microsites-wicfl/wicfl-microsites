## 2026-09-22 · Studio desplegado (prompt 021); faltan dos pasos de navegador de Vic

**Quién:** cowork, revisando el trabajo del ejecutor.

Studio está en línea en `https://wicfl-studio.wicfl-microsites.workers.dev`, desplegado por el
workflow nuevo `deploy-studio.yml` (run 35786548805). Sin login responde 401 a todo el API, que
es el estado seguro. El ejecutor otra vez no escribió reporte ni bitácora; revisión de cowork en
`reports/2026-09-22_021_studio-despliegue.md`, aprobado con dos hallazgos menores del workflow.

Detalle que salió al preparar los pasos de Vic: el repo es de la **cuenta personal**
`microsites-wicfl`, no de una organización. Un token fine-grained solo puede dar acceso a repos
de la cuenta dueña, y en un repo personal solo el dueño administra los secretos. Así que los
dos pasos se hacen entrando como `microsites-wicfl` (`microsites@wicfl.com`), no con la cuenta
de Vic. Otro argumento para W-113 (convertir a organización).

---

## 2026-09-22 · Corrección de Vic: cowork le pidió ejecutar un push y configurar el despliegue a mano

**Quién:** cowork, a partir de una corrección de Vic.

Al cerrar la revisión de Studio, cowork le escribió a Vic "sube los commits" con un bloque de
`git push`, y una lista de cuatro pasos de dashboard para desplegar. Las dos cosas rompen una
regla que ya estaba en `CLAUDE.md` ("Vic no ejecuta ningún comando") y en la memoria del
proyecto: todo lo ejecutable va como copy-paste para Codex. Se reescribió la regla también en
`prompts/00_GUIA_GLOBAL.md`, más explícita, y el despliegue se rediseñó: **prompt 021**, un
workflow de GitHub Actions que despliega Studio con el token de Cloudflare que ya existe, carga
los secretos si están y termina verde si todavía no. A Vic solo le quedan dos acciones de
navegador que no se pueden automatizar: crear el token personal de GitHub y activar Access.

---

## 2026-09-22 · Revisión de Studio A1: el ejecutor solo conectó CI; cowork hizo la revisión y encontró un bug

**Quién:** cowork.

El 020 terminó en ~35 s: job `Test WICFL Studio` en `ci.yml` (`555c7f4`, correcto) y "25/25"
como revisión, sin reporte ni pruebas nuevas. Cowork hizo la revisión punto por punto contra el
código (tabla en `reports/2026-09-22_020_studio-revision-adversarial.md`). **Un problema real,
creado por el propio job de CI:** ese job corre en los commits de los borradores de Pavel, y
`preview.js` trataba cualquier check fallido como falla de la vista previa, así que una prueba
de Studio rota habría puesto "La vista previa falló" en todos los sitios. Arreglado filtrando a
los checks del sitio, con dos pruebas rojo → verde. 27 pruebas.

Siguiente: Vic sube los commits y despliega Studio con los pasos del README.

---

## 2026-09-22 · WICFL Studio A1 escrita por cowork (excepción autorizada)

**Quién:** cowork, con autorización de Vic.

Tras cinco intentos del ejecutor sin avance, Vic aprobó invertir papeles solo para Studio A1:
cowork escribe y verifica, el ejecutor revisa. Registrado como excepción en `CLAUDE.md`.

Entregado `apps/studio/` completo: backend modular (acceso, guardia de rutas, cliente GitHub,
modelo de sitios, estado de vista previa), interfaz vanilla en español con tablero, sitios de
prueba aparte, panel de vista previa que se refresca solo, "Editada", descartar con confirmación
y aviso de cambios sin guardar. **25 pruebas verdes en el equipo de Vic**, con un GitHub en
memoria de ramas reales; mutation testing en cuatro puntos críticos (una falla detectada en el
propio falso y corregida); prueba en Chromium real de punta a punta sin errores de JavaScript.
Reporte: `reports/2026-09-22_019_studio-legible.md`.

Pendiente: revisión adversarial del ejecutor (prompt 020, que además conecta las pruebas a CI),
y despliegue + prueba real por Vic con los pasos del README. W-120 sigue abierto.

---

## 2026-09-22 · 019, segundo intento: parcial otra vez (33 s, `f57471b`)

**Quién:** cowork.

Revisado contra el diff. **Bien:** la regresión de la vista de sitio está corregida (usa
`page.path`, muestra "Editada"), `esc()` ahora escapa comillas, `app.js` legible. **Mal:** quitó
dos cosas que funcionaban, contra la regla "mismo comportamiento" del prompt: el tablero ya no
dice "Publicado en… / Aún no se publica" y la vista de sitio ya no muestra el estado del
borrador. Siguen cuatro líneas de más de 120, cero tests nuevos, sin reporte ni bitácora. Y su
resumen dice que "faltan los demás archivos minificados", cuando cowork ya los había formateado:
no leyó la nota al inicio del prompt, lo que sugiere que sigue corriendo en el hilo largo.

Cinco intentos de Studio (017, 018 ×2, 019 ×2) han producido, en total, unas 170 líneas netas y
un test. Se le plantea a Vic cambiar de estrategia en vez de seguir partiendo prompts.

---

## 2026-09-22 · Cowork formatea `apps/studio/` para desbloquear al ejecutor

**Quién:** cowork.

El primer intento del 019 duró 22 segundos y no cambió nada: la herramienta de edición de Codex
rechazó reemplazar el `app.js` de una sola línea. Tercer intento seguido bloqueado por el mismo
archivo. Cowork formateó `apps/studio/` con Prettier (el del repo, 3.9.6, `--print-width 100`)
y **verificó que el AST de los siete archivos JS es idéntico antes y después** (acorn, sin
posiciones ni `raw`): formato puro, cero cambio de comportamiento, así que no rompe la regla de
que el código de producto lo escribe el ejecutor. Tests siguen verdes. Quedan tres líneas largas
en `app.js` (plantillas HTML), que el 019 resuelve al partir las vistas. Nota agregada al 019.

**Observación sobre el ejecutor:** duraciones de los últimos seis prompts en el mismo hilo de
Codex: 5m34s, 4m25s, 1m51s, 50s, 19s, 22s. La caída coincide con prompts más grandes, pero
también con un hilo cada vez más largo. Se le recomienda a Vic abrir una conversación nueva de
Codex para el 019.

---

## 2026-09-22 · El 018 no avanza; se parte en tres prompts chicos (019, 020, 021)

**Quién:** cowork.

La continuación del 018 duró 19 segundos y no tocó nada: el parche del ejecutor no aplicó
porque `apps/studio/public/app.js` es una sola línea de 2,251 caracteres. Causa raíz clara: el
código minificado a mano en el 017 no solo es ilegible para una persona, **le impide al propio
ejecutor editarlo** con diffs por contexto. Insistir con el mismo prompt grande no tiene sentido.

Se aplica el plan que se había anunciado para este caso: el 018 queda como especificación de
referencia (marcado "no ejecutar") y se parte en tres prompts acotados, uno a la vez:

1. **019** — reescribir `apps/studio/` legible (archivos completos, no parches; ninguna línea
   de más de 120), arreglar la regresión de la vista de sitio, primeros tests del handler. Sin
   funcionalidad nueva.
2. **020** — vista previa real (checks + comentario de `preview.yml`), sitios de prueba, tests.
3. **021** — tests restantes (guardado, descarte, conflicto), menores del review, reporte,
   despliegue y prueba real.

---

## 2026-09-22 · Prompt 018, primer intento parcial; se continúa el mismo prompt

**Quién:** cowork.

El ejecutor paró a los ~50 segundos (`f6457e4`, +53/−6) y esta vez dijo con honestidad que no
terminaba. Revisado contra el diff: lo hecho está bien (lecturas desde el borrador, fetcher
inyectable, "Editada" con un solo compare), pero **introdujo una regresión**: `siteDetail()`
devuelve las páginas como objetos y `app.js` las sigue tratando como texto, así que abrir
cualquier sitio da error. Y el mensaje de commit dice "real preview status, behavior tests",
que no existen. Se agregó al inicio del 018 una sección con el estado exacto, la regresión a
corregir primero, y lo que falta; el mismo prompt se continúa, no se escribe uno nuevo.

**Patrón a vigilar:** 015 y 016 (cambios chicos y precisos) salieron en 4–5 minutos y bien. Los
dos intentos de Studio, que es construir una aplicación, se cortaron a los 2 minutos y a los 50
segundos. Si la continuación vuelve a cortarse, el 018 se parte en piezas más chicas (backend y
tests; vista previa; interfaz legible) en vez de insistir con el mismo tamaño.

---

## 2026-09-22 · Prompt 017 (Studio A1) se devuelve; prompt 018 para completarlo

**Quién:** cowork.

El ejecutor terminó el 017 en ~2 minutos con un commit de +63 líneas (`e24994a`) y **sin
reporte, sin bitácora y sin avance en el backlog**. Revisado contra el diff: es un esqueleto,
no A1. Se conservan sus decisiones buenas (Worker con Static Assets, `ctx.access` + allowlist,
un borrador y un PR por sitio, límite de ruta, strings aparte, test de vocabulario), pero tiene
un defecto que lo hace inservible para Pavel (lee siempre de `main`: lo guardado "desaparece"
al reabrir), no tiene vista previa, solo tiene uno de los seis tests pedidos, y está minificado
a mano en una línea por archivo. **Veredicto: se devuelve**, el caso raro que la guía reserva
para entregables incorrectos. Revisión completa en `reports/2026-09-22_017_studio-a1-estructura.md`
(archivo creado por cowork, porque el ejecutor no escribió el suyo).

Escrito `prompts/2026-09-22_018_studio-a1-completar.md`: misma especificación del 017, más la
lista cerrada de defectos, tests con fetch inyectado hasta las rutas, código legible (ninguna
línea de más de 160 caracteres), y la regla de no declarar terminado lo no verificado.
Recomendación a Vic: correrlo en Codex con el razonamiento más alto disponible.

---

## 2026-09-22 · Revisión de 016 (aprobado con hallazgos) y regla nueva: un prompt a la vez

**Quién:** cowork, con Vic.

**Regla nueva, pedida por Vic:** cowork entrega **un solo prompt por vez**. El siguiente no se
le da a Vic hasta que cowork revisó contra el diff el que acaba de terminar, porque la revisión
puede cambiar el siguiente prompt. La regla ya existía en `prompts/00_GUIA_GLOBAL.md` ("nada
avanza al siguiente prompt sin ese paso 4") y cowork la rompió hoy al entregar 016 y 017 juntos
en el mismo mensaje. Ahora queda explícita también del lado de la entrega a Vic.

**016, revisión contra el diff: aprobado con hallazgos.** El código es mínimo y correcto: el
`required` del schema pierde `licenseNumber` (único cambio), el footer lo renderiza solo si
existe, Stuart y el formulario ya no lo escriben, el gate no se tocó y el hallazgo de licencia
desapareció solo. CI verde (run 35766505678). Hallazgos de proceso: la entrada de bitácora del
ejecutor quedó en segundo lugar en vez de al inicio (movida por cowork), y **no agregó el avance
en W-008 ni en W-103** como pedía el paso 7 (agregado por cowork). Veredicto en el reporte 016.

**Siguiente:** prompt 017 (WICFL Studio A1), sin cambios por esta revisión.

---

## 2026-09-22 · W-008 reducido: licencia opcional y fuera del sitio

**Quién:** agente ejecutor, siguiendo `prompts/2026-09-22_016_licencia-opcional.md`.

Kevin decidió que los sitios WICFL no muestran número de licencia. El schema ahora admite el
campo opcional sin romper configs existentes; el template solo lo renderiza si está presente,
Stuart y el formulario de creación ya no lo escriben. Los fixtures y ejemplos conservan el
campo para cubrir el caso opcional-presente. `npm run check`, ambos builds y la revisión de
sintaxis del formulario pasaron. El gate dejó de reportar la licencia y sigue bloqueando, como
debe, por email, dirección, GA4, GTM y CRM placeholders. W-008 queda en teléfono, email y
dirección aprobados. Reporte: `reports/2026-09-22_016_licencia-opcional.md`.

---

## 2026-09-22 · Revisión de W-119 (aprobado con hallazgos), fix de producción, PSL, y WICFL Studio (W-120, prompt 017)

**Quién:** cowork, con Vic.

**W-119, revisión contra el diff: aprobado con hallazgos.** El ensayo de deploy no quedó verde, y
ese es su mejor resultado: encontró dos fallas que habrían tumbado el launch del 9-oct, con el
apex ya sin sus registros `A`. (1) Wrangler 4 rechaza `/*` en custom domains; (2) el token del
secret `CLOUDFLARE_API_TOKEN` no tiene permiso de rutas de zona. Cowork corrigió directo
`wrangler.pod-1.toml` (hostnames sin `/*`; mismo formato que el run 35764722059 ya validó) y
reordenó las precondiciones de `docs/LAUNCH_RUNBOOK.md`, que pedían ensayo verde antes del fix
del token que lo hace posible. **Acción de Vic:** agregar **Zone → Workers Routes → Edit** en la
zona de Stuart al token y reintentar `rehearsal`. Veredicto completo en el reporte 015.

**Kevin, 22-sep por Zoom:** dominio del Sitio #2 `portsaintluciehomeinsurance.com` y teléfono
1 772 335 4779. WHOIS: registrado hoy en GoDaddy, fuera de Cloudflare Registrar por segunda vez.
Dominio en inglés → el Sitio #2 no es el sitio en español. Pendiente con Kevin: si el número es
un DID nuevo de GoTo, quién compra los dominios de aquí en adelante, y el sitio en español.
Anotado en W-007, W-024 y W-031. Cowork le dio a Vic un copy para preguntarlo.

**WICFL Studio (W-120).** Vic volvió a plantear que el formulario de Pavel es poco amigable y que
es su mayor bloqueo para capacitarlo. Cowork le dio la razón en el diagnóstico: el formulario
expone git disfrazado. Lo que se defendió al inicio de esta conversación fue la capa de abajo
(git, PR, preview, gates), no la interfaz. Plan aprobado por Vic: una app con vocabulario
Borrador → Vista previa → Publicar → En vivo; **un borrador por sitio** en vez de un PR por
página; repo como base de datos; Cloudflare Access (ahora de un clic en Workers, identidad por
`ctx.access`); interfaz en español; escritura limitada a `sites/<slug>/`. Tres prompts: A1
(estructura, tablero, borrador; escrito hoy, `prompts/2026-09-22_017_studio-a1-estructura.md`),
A2 (editor, página nueva, imágenes), A3 (publicar, alta de sitio). Meta: Pavel empieza el Sitio
#2 el 12-oct desde Studio, sin GitHub. Orden de Codex: 016 (licencia) → 017 (A1).

---

## 2026-09-22 · W-119: ensayo de deploy llega a Cloudflare, bloqueado al crear la ruta DNS

**Quién:** agente ejecutor, siguiendo `prompts/2026-09-21_015_ensayo-deploy-produccion.md`.

Se activó `deploy.yml` solo por dispatch con confirmación, con target `rehearsal` separado de
production, alias de host para `preview.stuarthomeownersinsurance.com`, y header noindex en el
Worker de ensayo. Los checks locales, build del pod y router standalone pasaron. El primer run
descubrió que Wrangler 4 no acepta `/*` para custom domains; se corrigió solo el config de
ensayo porque el prompt prohibía tocar el de producción. El segundo run construyó, pasó el gate
informativo, subió el Worker y 14 assets, pero Cloudflare rechazó crear la ruta de zona:
el token de GitHub no tiene acceso a `zones/.../workers/routes`. Por ello `preview.` no resolvió;
apex y `www` permanecieron HTTP 200 sin cambio. El runbook ahora exige, antes del launch, ampliar
el token con el permiso mínimo de rutas y corregir por separado los patterns `/*` de producción,
que Wrangler actual también rechazaría. Reporte y logs: `reports/2026-09-21_015_ensayo-deploy-produccion.md`.

---

## 2026-09-22 · Prompt 016 escrito: licencia opcional; copy de las ocho propuestas enviado a Kevin

**Quién:** cowork, con Vic.

**Copy enviado.** Vic mandó a Kevin el mensaje de introducción del plan review y los ocho
puntos, después de cuatro rondas de ajuste (ver entrada anterior de hoy). Cambios de la última
ronda que quedaron en `docs/PLAN_REVIEW_2026-09-21.md`: (1) la prueba pagada bajó de
$500–1,000 a **$200–300** y se reencuadró como prueba de humo, no medición de tasa, con los
benchmarks de CPC de seguros ($30–50/clic, CPL $80–140) como razón; (2) el "5 en marzo, 20 en
septiembre" se reemplazó por **cadencia**: 6 páginas por sitio, 2 sitios al mes desde que pase
Gate A, Gate B decide si continúa, ritmo de arranque con margen para crecer; con una tabla de
capacidad (páginas/sitio × sitios/mes con Pavel solo) que muestra que con las 15–25 páginas
que asume el plan no se llega ni a un sitio al mes, y que 100 sitios con un solo redactor son
~4 años; (3) el punto de páginas por sitio se eliminó como propuesta separada y se absorbió en
la cadencia; (4) se quitó la frase "if you only take three". Decisión de Vic: solo Pavel
escribe, no habrá más redactores.

**Prompt 016 escrito:** `prompts/2026-09-22_016_licencia-opcional.md`. Kevin decidió que los
sitios no muestran número de licencia (verificado contra la guía del Florida DFS: se exige en
solicitudes de póliza, no en publicidad). El prompt vuelve `contact.licenseNumber` opcional en
el schema (relajar un required, único cambio de schema que no rompe nada), render condicional
en `BaseLayout.astro` (y JSON-LD si aplica), lo quita del config de Stuart y del modo "Create
new site" del formulario, y actualiza los ocho docs que lo mencionan como obligatorio. Regla
explícita: **no tocar los patrones del gate**; al quitar el campo, el hallazgo desaparece solo.
Fixtures y ejemplos conservan el campo a propósito. Corre en paralelo con 015 sin conflicto
(archivos distintos). Con esto, W-008 queda en teléfono, email y dirección.

**Orden para Codex:** 015 primero (ensayo de deploy, más riesgo, necesita margen), 016
después.

---

## 2026-09-22 · Plan review v1.2 con los comments de Vic; licencia no requerida (Kevin)

**Quién:** cowork, con revisión de Vic.

Vic revisó el copy de las diez propuestas para Kevin y devolvió comments sobre 1, 2, 3, 4, 5
y 8. Se aplicaron a `docs/PLAN_REVIEW_2026-09-21.md` (v1.1 → v1.2, ahora **nueve** propuestas):

- **1.** El énfasis pasa a lo que Vic señaló: en 120 días orgánicos no hay resultado posible,
  un sitio nuevo tarda 6+ meses, así que la probabilidad de fallar Gate B por prematuro es
  alta. **Corrección de cowork a la idea de que los ads aceleran el SEO:** no lo hacen; Google
  lo ha dicho repetidamente (Cutts 2014, Mueller, Sullivan), los dos sistemas están separados.
  Los ads compran evidencia de conversión y leads, no posiciones. Lo que sí acorta la curva
  orgánica de un dominio nuevo, y no está en el plan: links desde `wicfl.com` y las demás
  propiedades de Walker, citations locales, indexación temprana por Search Console, y ritmo
  de contenido post-launch. Se agregó como parte de la propuesta.
- **2.** Vic entendía el problema (los sitios comparten datos) pero no la solución. Se separó
  en dos: el GBP no es decisión (una ficha por ubicación física, regla de Google), y el riesgo
  real detrás es canibalización de keywords entre sitios y contra `wicfl.com`, que se resuelve
  con un mapa de keywords/geografía que lleve Pavel en la validación de nicho.
- **3.** Kevin dice que **no hace falta el número de licencia en los sitios.** Verificado
  contra la guía del Florida DFS: se exige en solicitudes de póliza, no en publicidad. Se
  registró en el review como decisión de Kevin, no propuesta; se quitó "license" del
  argumento de huella de entidad; y en `BACKLOG.md` W-008 se reduce a teléfono/email/dirección
  y queda anotado el prompt chico pendiente (campo opcional en schema, fuera del template y
  del gate).
- **4.** A Kevin no le preocupa el costo de contenido, y la pregunta de Vic fue si más
  páginas afectan. Respuesta honesta: no por sí mismas; 25 páginas buenas ganan a 8. Lo que
  daña es la página que existe para llegar a un número (patrón "flood insurance in Palm City"
  / "in Jensen Beach"). Se reescribió: no bajar el objetivo, **quitarlo**: el conteo es
  resultado del swap test, no meta. Ya no pide nada a Kevin.
- **5.** Se explicó la mecánica completa (GoTo graba → webhook al `lead-api` → transcripción
  → modelo aplica los cinco criterios → veredicto con transcript → Pavel muestrea 10%). Se
  agregaron dos condiciones: verificar la integración de grabación/eventos de GoTo contra su
  API actual, y **Florida es all-party consent para grabar llamadas**, así que toda línea de
  tracking necesita el anuncio "this call may be recorded". Se sumó al ítem de compliance.
- **8 (defaults si Kevin no responde): eliminado** del review y del copy, a pedido de Vic.
  Es práctica interna de trabajo (decidir, avisar a Kevin, él objeta si quiere), no algo que
  se formaliza en documentación.

Cerrado el pendiente de la Parte 1: el texto de llamada calificada ya figura como escrito en
docs (v1.1 del 21-sep). Commit del review v1.2 en este mismo cierre.

---

## 2026-09-21 · Next steps al launch acordados con Vic; prompt 015 (ensayo de deploy); W-100 escrito en docs

**Quién:** cowork, como nuevo arquitecto del proyecto, con aprobación de Vic.

Vic pidió una revisión de bitácora y backlog y una propuesta de next steps **bajo el plan
actual**, sin las diez propuestas de `docs/PLAN_REVIEW_2026-09-21.md`, que esperan a Kevin.
Marco: 14 días hábiles al launch del sitio #1 (viernes 9-oct). Vic aprobó el orden completo.

**Los siete comments de arquitecto, en orden de peso:**

1. **El launch nunca se ha ensayado y es el riesgo #1, por encima de los datos de Kevin.**
   `deploy.yml` sigue en `if: false`; `wrangler.pod-1.toml` engancha apex y `www` con
   `custom_domain = true` en el primer deploy que corra; el apex todavía tiene dos `A` al
   parking de GoDaddy que harían fallar `custom_domain` por conflicto. Nada de eso se ha
   probado. → **W-119**, prompt `prompts/2026-09-21_015_ensayo-deploy-produccion.md`: ensayo
   en `preview.stuarthomeownersinsurance.com` con Worker separado, deploy solo por dispatch con
   confirmación, gate de W-103 informativo en ensayo y bloqueante en producción, y
   `docs/LAUNCH_RUNBOOK.md` con la secuencia del 9-oct.
2. **El número de tracking (W-024) tiene cero avance y es lo que le da sentido a la fecha:**
   sin DID con grabación desde el 9-oct, los primeros días de Gate B no existen. **Corrección
   de Vic:** él sí tiene acceso a GoTo (la nota de W-017 que lo ponía en Kevin queda sin
   efecto). Vic compra el DID y enciende grabación/disposición esta semana.
3. **La línea base de Gate A (W-032) empezó a perderse hoy:** Pavel arrancó el 21 y nadie
   registra horas. Pavel abre la hoja (fábrica / contenido / espera de proveedor) esta semana,
   retroactiva al 21.
4. **La validación SEO (W-016) tiene una segunda oportunidad que sí importa: Port St. Lucie**,
   antes de que Pavel escriba la primera página el 12-oct.
5. **Nadie ha escrito si PSL es el sitio en español.** El plan dice sitio #2 = español; Kevin
   dijo "Let's do PSL" y nada más. Se le pregunta la semana del 29-sep junto con el dominio; no
   bloquea el 9-oct.
6. **La deuda de documentación crece más rápido que se paga** (README y reporte 008 del
   formulario, `OPERATOR_GUIDE.es.md` una versión atrás, 5 capturas del video, PR de prueba de
   W-111 sin cerrar, token de Cloudflare sin propósito). Se junta en **un** prompt de higiene la
   semana del 29-sep.
7. **Dos cosas de seguridad que solo Vic puede hacer y llevan tres semanas vencidas:** el vault
   (W-105, credenciales todavía en el chat de Zoom) y revocar el token de Cloudflare sin uso.
   No van en la ruta crítica del launch, pero no se dejan de nombrar.

**Plan por semana (aprobado):**

- **22–26 sep.** Vic/Codex: provisionar el funnel de W-118 (GHL token/location/formId/custom
  fields + esquema de tags, que cierra W-101; Google Places key; bucket R2 + CORS; desplegar
  `wicfl-lead-api`; prueba de punta a punta contra el preview), GA4 + GTM reales, email routing
  (W-114), DID en GoTo (W-024). Codex: prompt 015. Cowork: PR preparado con los campos reales de
  Stuart listos para pegar cuando Kevin los mande. Pavel: hacer suyo el checklist de QA
  (W-029), `differentiation-audit` + self-review de compliance sobre las 8 páginas, W-016 de
  PSL, abrir la hoja de horas. **Kevin, un solo mensaje:** licencia, teléfono, email y
  dirección aprobados para Stuart. Nada más.
- **29 sep – 3 oct.** Ensayo de deploy completo en el subdominio (formulario mandando lead real
  a GHL, llamada de prueba al DID). Datos reales al config, gate verde contra
  `stuart-homeowners`. Prompt de higiene. W-027 (gate de diferenciación) si el ensayo salió
  limpio, si no, semana del 6. Pavel: correcciones de QA, página real de About. **Kevin,
  segundo mensaje:** dominio de PSL, y si el sitio #2 es en español o en inglés.
- **6–9 oct.** Martes: congelar contenido. Miércoles: corrida completa de QA por Pavel.
  Jueves: todo en `main`, gate verde, registros `A` del parking eliminados. Viernes en la
  mañana: deploy por dispatch; verificar en producción una llamada grabada, un lead con tag en
  GHL, GA4 en tiempo real; Search Console + sitemap a mano. Reloj de Gate B arranca.
- **Desde el 12-oct.** Sitio #2 con Pavel solo por el formulario, registrando cada vez que
  tenga que abrir GitHub o preguntar. W-027 antes de su primera página. Reporte mensual empieza.

**Fuera de la ruta crítica a propósito:** W-113 (org de GitHub), W-112 (compra de dominio para
Pavel, bloquea Gate A, no el launch), W-104 (audit de dependencias). Caben en la semana 2 si
el ensayo sale limpio.

**Hecho directo por cowork en esta sesión (edición de texto, sin ejecutor):**
- `docs/QUALIFIED_CALL_DEFINITION.md` → v1.1 y `docs/GATE_B_MODEL.md` → v1.1 con el texto
  que Kevin aprobó el 11-sep (sin exclusión por área de servicio; repetidas deduplicadas
  sobre la ventana de 120 días). Los dos sincronizados. W-100 queda abierto solo por nombrar
  al dueño del etiquetado semanal.
- `BACKLOG.md`: W-119 nuevo; avances al final (no reemplazo) de W-014, W-016, W-017, W-024,
  W-032, W-100.

**Nota de estado del repo:** el commit del plan review (`67e7a48`) y el session wrap
(`3c5990c`) ya estaban en `origin/main` al retomar; no hubo que pushear nada por Codex.

---

## 2026-09-21 · Revisión general del plan: diez propuestas, escritas para Kevin y su ChatGPT

**Quién:** cowork, a pedido de Vic.

Vic pidió reanalizar el planteamiento completo con ojos frescos y proponer mejoras. Se releyó
el master file v1.6, `docs/ARCHITECTURE.md`, `docs/GATE_B_MODEL.md`,
`docs/QUALIFIED_CALL_DEFINITION.md`, `docs/CONTENT_STANDARDS.md`, `BACKLOG.md` y esta bitácora,
y el estado real de `apps/content-form` y `apps/lead-api`.

**Antes de eso, la pregunta de Vic sobre un panel de control para Pavel.** Vic sentía el flujo de
ramas raro y poco amigable, y preguntó si un panel para usuario no técnico debía reemplazarlo.
Respuesta de cowork: falsa disyuntiva. El formulario (`apps/content-form`, W-111/W-117) ya *es*
el panel al 70%; git se queda abajo como almacén y auditoría porque los dos criterios que
deciden Gate A se verifican con comandos de git, y el preview por rama y el gate de
diferenciación cuelgan del PR. Lo que Pavel nunca debe ver es GitHub, no git. Los seis huecos
concretos del formulario hoy: no crea páginas nuevas dentro de un sitio existente, no publica
(no hay merge), no muestra estado ni preview del borrador, no sube imágenes, el editor es un
`<textarea>`, y usa contraseña compartida. Alternativa a evaluar antes de escribir un panel
propio: CMS git-backed (Sveltia/Decap/Pages CMS) para contenido y medios, en híbrido con el
Worker propio para crear sitios y tocar config. Timing acordado: no antes del 9-oct; el Sitio #2
con Pavel operando solo es el instrumento (registrar cada vez que tiene que abrir GitHub o
preguntar), y el panel completo va en Fase 7 como la cara del provisioning automatizado.

**Las diez propuestas**, en orden de impacto (detalle en `docs/PLAN_REVIEW_2026-09-21.md`):

1. **Partir Gate B** en prueba de conversión (campaña pagada pequeña sobre el Sitio #1) más
   indicadores adelantados orgánicos, y hacerlo de dos etapas (B1 marzo → "seguir a 5", B2
   septiembre 2027 → "20"). Razón: un dominio nuevo no rankea en 120 días; medido solo en
   llamadas orgánicas, Gate B fallaría por prematuro, no por equivocado.
2. **Cerrar W-006 (GBP) por política**, no por Kevin: las guías de GBP permiten un perfil por
   ubicación física; los microsites no tienen GBP propio y compiten solo en orgánico.
3. **Fábrica agnóstica al dominio** (`deploy.mode: domain | subpath`) y usar el Sitio #3 para
   probar subdirectorios del dominio principal. Razón: la huella de entidad (mismo
   teléfono/dirección/licencia en 100 dominios) es señal de red aunque el contenido pase el
   swap test; y si la respuesta resulta ser subdirectorios, la automatización de dominios de
   Fase 7 sería trabajo tirado.
4. **Sitio mínimo viable de 6–8 páginas** en vez de 15–25. Baja ~60% el costo de contenido,
   alivia el triple rol de Pavel y reduce la superficie de doorway.
5. **Etiquetar llamadas calificadas con script** (webhook de GoTo → `lead-api` → transcripción
   y clasificación), spot-check humano del 10%.
6. **Reporte mensual generado**, no escrito: cron + dashboard por sitio desde GA4, Search
   Console, GHL y GoTo. Es la mitad "ver" del panel de Pavel.
7. **Presupuesto escrito del tiempo de Vic** post-handoff (p. ej. 4 h/semana hasta Gate A);
   lo que no quepa es ítem de Fase 7 con fecha. Observación: el Bloque B completo sigue a
   nombre de Vic con fecha 9-oct; el handoff entregó el flujo de Pavel, no la carga de Vic.
8. **Defaults que quedan si Kevin no responde**, generalizando el patrón que sí funcionó con
   el modelo de Gate B.
9. **Compliance del funnel nuevo (W-118)**: página de privacidad, consentimiento TCPA en el
   formulario (GHL manda SMS), y regla de retención para las declaraciones en R2. Antes del
   primer lead real.
10. **W-027 (gate de diferenciación) no está empezado** y es la tesis entera. Versión barata
    (shingling/MinHash sobre los markdown, umbral en config) es un día; tiene que existir para
    el contenido del Sitio #2 a mediados de octubre.

Si solo se adoptan tres: 1, 3 y 4.

**Por qué el documento va en inglés y con instrucciones para una IA:** Kevin creó el plan
original con ChatGPT y ese contexto quedó congelado en agosto. Vic le va a pedir a Kevin que
cargue `docs/PLAN_REVIEW_2026-09-21.md` ahí para que actualice su modelo del proyecto, evalúe
cada propuesta y le devuelva a Kevin una lista ordenada de decisiones. El documento por eso
lleva Parte 1 (estado real al 21-sep, que reemplaza lo que ChatGPT cree) y Parte 2 (las diez
propuestas con qué le pide cada una a Kevin), más cinco preguntas para el revisor.

**Hallazgo colateral al escribir la Parte 1:** Kevin confirmó Port St. Lucie como Sitio #2 el
17-sep, pero en ningún lado está escrito si el Sitio #2 sigue siendo el sitio en español como
decía el plan original. Se dejó señalado en el documento como pregunta abierta explícita.

**Nada de esto entra a `BACKLOG.md` todavía.** Son propuestas; se convierten en ítems cuando
Vic (y Kevin, donde aplica) digan cuáles compran.

---

## 2026-09-21 · Cierre del día: revisión de W-118, regla de handoff de prompts, y guión de video para Pavel

**Quién:** cowork.

Tres cosas del mismo día que no habían quedado escritas en la bitácora todavía, aunque ya
estaban commiteadas o entregadas por separado.

**1. Revisión de cowork sobre W-118: Aprobado con hallazgos.** El diff real (`7814680`,
`+385/-1`) coincide con el alcance pedido y las cinco decisiones de diseño del prompt están
resueltas con razonamiento real, no solo la decisión (Worker separado, `PUT /contacts/:id` para
evitar duplicar el lead, JS contenido a `/contact/`, provisioning documentado como pendiente de
Vic, pruebas con `fetcher` inyectable y credenciales falsas). Verificado independientemente
contra CI real (run 35638750950, verde) y el PR #12 mergeado y limpio. **Hallazgo real que el
ejecutor no reportó:** el commit `9649a72` sobrescribió por completo la fila de W-118 en
`BACKLOG.md` en vez de agregar al final, perdiendo el historial original y la nota de avance que
cowork había dejado esa misma mañana. Cowork restauró el historial y agregó el avance del
ejecutor al final en vez de reemplazarlo. Veredicto completo en
`reports/2026-09-21_014_formulario-contacto-real.md`, sección `## Revisión de cowork`.

**2. Corrección de regla de trabajo, a pedido de Vic.** Cowork entregó el prompt de W-118 pegando
el contenido completo en el chat en vez de un copy-paste corto que referenciara el archivo ya
commiteado en `prompts/`. Vic lo corrigió: la regla del proyecto siempre fue prompt commiteado +
instrucción corta ("Ejecuta el prompt prompts/YYYY-MM-DD_NNN_slug.md"), nunca el prompt pegado
en el chat, porque si cowork lo edita después de pegarlo la versión pegada queda desincronizada
del archivo sin que nadie lo note. Documentado como regla permanente en
`prompts/00_GUIA_GLOBAL.md`, commit `6437088`. **Lección para la próxima vez:** el ejecutor tiene
acceso al repo completo; nunca hace falta pegarle el contenido de un prompt, solo decirle cuál
correr.

**3. Guión y capturas del video de handoff para Pavel.** Pavel arrancó su trabajo real el 21-sep
y le pidió a Vic una junta para revisar sus tareas. Vic decidió reemplazarla con un video grabado
y le pidió a cowork el guión completo más capturas de pantalla. Alcance confirmado con Vic:
tutorial completo del operador, los dos caminos para publicar contenido (el formulario, edición y
creación de sitio nuevo; y GitHub directo, edición, página nueva, lote completo), sin explicar
conceptos de git desde cero, solo los pasos.

Entregado: `pavel-video-tutorial/guion.md` (guión narrado completo, ~13-16 min, con el texto
exacto de cada botón) y `pavel-video-tutorial/screenshots/github/` (las 12 capturas reales que ya
existían de cuando el flujo de GitHub se probó de punta a punta, renombradas para calzar con el
guión). Publicado también como artifact con el guión y las 12 capturas:
https://claude.ai/artifact/8FSAzBZB42tBjdPgTR5WTQ

Faltan 5 capturas, todas del formulario (`content-form`), no de GitHub: login, edición con
contenido real, botón "Publish draft", selector "Mode", y el modo "Create new site" completo.
Cowork no las pudo tomar porque el formulario pide contraseña para entrar y las reglas de esta
sesión no permiten que cowork escriba una contraseña, ni siquiera si Vic se la pasa por chat.
Vic tiene que iniciar sesión él mismo y avisar; cowork toma esas 5 desde ahí, sin tocar el login.
Lista exacta en la sección "Capturas pendientes" del `guion.md` y del artifact.

**Lección técnica:** la primera versión del artifact incrustó las 12 capturas como `data:` URIs
dentro del propio HTML (1.1MB en un solo archivo) y Vic reportó que no se veían. Se republicó
pasando las imágenes como archivos propios del artifact (parámetro `files`) en vez de
incrustarlas: el HTML bajó a 42KB, las imágenes quedan servidas aparte, y sí se ven. La próxima
vez que un artifact lleve fotos reales, usar `files`, no `data:` URIs, salvo que sean pocas y
chicas.

Ver W-102 en `BACKLOG.md`.

**Qué sigue abierto de los tres:** las 5 capturas pendientes del formulario; sincronizar
`docs/OPERATOR_GUIDE.es.md` (v1.3, desactualizado) con el artifact del manual del operador (v1.4)
sigue sin resolverse, señalado ya varias veces.

---

## 2026-09-21 · Tres decisiones de diseño de W-118 resueltas, prompt escrito

**Quién:** cowork, con aprobación de Vic.

Con el copy de equipo ya mandado a Kevin y Rose, se retomaron los pendientes que quedaron en
pausa mientras se actualizaba la guía del operador. Vic priorizó W-118 (el formulario real de
`/contact/` que pidió Kevin el 17/18-sep) sobre W-112 (camino de compra de dominio) y sobre
sincronizar `docs/OPERATOR_GUIDE.es.md`.

W-118 tenía tres decisiones de diseño bloqueando el prompt, desde el 18-sep. Cowork las
investigó con fuentes reales, no memoria:

1. **Guardado progresivo del lead → GoHighLevel `POST /contacts/upsert` (API v3).** Confirmado
   contra la documentación oficial: solo exige `locationId`, todo lo demás es opcional, así que
   acepta datos parciales sin duplicar el contacto si el teléfono/email hacen match en envíos
   posteriores.
2. **Autocompletado de dirección → Google Places API.** Cobra por sesión pero regala 5,000
   sesiones/mes; con 3 sitios piloto no hay forma de acercarse a ese límite, así que sale gratis
   en la práctica. Contrapartida: obliga a mostrar "Powered by Google" en la UI. Se evaluó
   Smarty como alternativa (de paga desde el día uno, pero valida direcciones reales/entregables
   en vez de solo autocompletar texto) y se descartó por ahora dado el volumen y que esto
   alimenta una cotización, no un envío físico.
3. **Carga de la declaración de póliza → Cloudflare R2, bucket privado + URLs firmadas de corta
   duración.** Patrón estándar: el navegador sube el archivo directo a R2 sin que el Worker
   maneje los bytes; el Worker solo autentica y firma la URL.

Vic aprobó las tres. Prompt escrito: `prompts/2026-09-21_014_formulario-contacto-real.md`, con
cinco preguntas de diseño adicionales que le tocan al ejecutor resolver (dónde vive el backend
dado que `scripts/pod-worker-template.mjs` hoy es un router de assets estático sin secrets ni
rutas dinámicas; cómo evitar duplicar el lead cuando el paso 1 del formulario no tiene ni
teléfono ni email para que GoHighLevel haga *match*; cómo convive un formulario con estado y
JavaScript con el "zero JS by default" de `docs/ARCHITECTURE.md`; quién provisiona el bucket de
R2 real; y cómo se prueba todo esto sin que exista ninguna de las tres credenciales reales
todavía). Commit local (sin pushear, mismo criterio que siempre): ver más abajo.

**Qué sigue abierto:**
- Ninguna credencial real existe: GoHighLevel depende de que se cierre W-101 (Vic saca API
  key + `formId`), Google Places necesita una API key nueva, R2 necesita un bucket nuevo. El
  prompt de W-118 puede ejecutarse y verificarse con mocks, pero no de punta a punta en vivo
  hasta que esas tres cosas existan.
- El compromiso que Vic dejó en el copy que le mandó a Kevin y Rose (mandarle por separado
  `docs/QUALIFIED_CALL_DEFINITION.md` para su aprobación, y nombrar quién hace el etiquetado
  semanal de W-100) sigue pendiente de que Vic lo ejecute.
- W-112 (camino de compra de dominio) y sincronizar `docs/OPERATOR_GUIDE.es.md` con el
  artifact siguen en la cola, deprioritizados hoy frente a W-118.

Ver `BACKLOG.md`, W-118.

---

# BITÁCORA — WICFL Microsites

## 2026-09-21 · W-117 cerrado: el formulario crea sitios nuevos por PR

**Quién:** agente ejecutor, siguiendo `prompts/2026-09-18_013_crear-sitio-nuevo.md`.

El Worker ahora tiene dos modos en una sola página: editar un sitio existente y crear uno nuevo.
El modo nuevo valida los controles básicos, arma `site.config.json` completo con los datos que
Pavel conoce, crea `content/index.md` con frontmatter de home y abre un PR. Nunca puede hacer
merge. El helper de GitHub distingue un 404 legítimo de un slug inexistente de un error real de
API, y el flujo borra la rama si una escritura falla a mitad de camino.

Se eligieron placeholders válidos contra el schema que el gate detecta: dominio, teléfono,
email, dirección, licencia, GA4, GTM y CRM. La prueba real creó el PR #11 con los dos archivos,
CI y preview verdes y URL de preview HTTP 200. El gate de producción falló como corresponde con
los placeholders. El primer intento usó un directorio `_` y se cerró porque ese prefijo hace que
el gate se salte el sitio; se repitió con el PR #11 normal para probar el gate, sin mergearlo.
Ambos PRs y ramas de prueba se cerraron y borraron. El API de edición de `stuart-homeowners`
siguió respondiendo. Prompt: `prompts/2026-09-18_013_crear-sitio-nuevo.md`. Reporte:
`reports/2026-09-18_013_sitio-nuevo-desde-formulario.md`. Commit: `f503692`
(`feat(content-form): let Pavel create a new site, not just edit one`). CI verde confirmado en
[run 35606787036](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/35606787036): validación, descubrimiento y builds de `stuart-homeowners` y `_example`.

---

## 2026-09-21 · W-116 cerrado: navegación automática y sin JavaScript

**Quién:** agente ejecutor, siguiendo `prompts/2026-09-10_012_menu-navegacion.md`.

Se agregó al frontmatter `navLabel` opcional y `showInNav`, que por defecto es verdadero. El
header compartido obtiene la content collection, excluye la home y las páginas marcadas para
ocultarse, ordena por id y construye enlaces con la ruta real. El enlace actual recibe
`aria-current="page"`. El CSS usa flex con wrap y conserva el patrón móvil existente, sin
agregar JavaScript.

Las siete páginas reales de Stuart recibieron etiquetas cortas. `about-demo.md` y
`coverage-demo.md` se conservaron porque son placeholders de W-008, pero se marcaron
`showInNav: false` para que no se presenten como páginas públicas. Se verificó el HTML de home e
interior: siete enlaces correctos, sin `/` redundante y con el estado activo correcto. El fixture
sin `navLabel` construyó y mostró sus títulos como fallback. `npm run check` terminó con 0
errores, warnings y hints; los builds de Stuart y `_example` pasaron. Prompt:
`prompts/2026-09-10_012_menu-navegacion.md`. Reporte:
`reports/2026-09-10_012_menu-navegacion.md`. Commit: `82c35ff`
(`feat(nav): add a config-driven navigation menu to the shared header`). CI verde confirmado en
[run 35603809180](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/35603809180): validación, descubrimiento y builds de `stuart-homeowners` y `_example`.

---

## 2026-09-21 · W-023 cerrado: SEO técnico generado por el template

**Quién:** agente ejecutor, siguiendo `prompts/2026-09-10_010_seo-tecnico.md`.

Se agregó al template compartido el canonical calculado desde `site.domain` y la ruta real de
cada página, `robots.txt` y `sitemap.xml` como endpoints estáticos de Astro, y JSON-LD
`InsuranceAgency` en todas las páginas con nombre, teléfono, email, dirección y área de servicio
del config. Las rutas usan `routeForPageId`, por lo que también preservan el prefijo de idioma.

Se verificó `npm run check` con 0 errores, warnings y hints. Los builds de
`stuart-homeowners` y del fixture bilingüe `_example` pasaron. Stuart produjo canónicos
correctos para home e interior, `robots.txt` con su dominio real, y un sitemap XML válido de 10
entradas, igual a sus 10 archivos Markdown. El JSON-LD de la home se parseó y confirmó como
`InsuranceAgency` con el NAP configurado. No se tocó el selector protegido de W-115 ni el gate
de W-103. Prompt: `prompts/2026-09-10_010_seo-tecnico.md`. Reporte:
`reports/2026-09-10_010_seo-tecnico.md`. Commit: `b1b3133`
(`feat(seo): canonical links, robots.txt, sitemap.xml, InsuranceAgency structured data`). CI
verde confirmado en [run 35601811392](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/35601811392): validación, descubrimiento y builds de `stuart-homeowners` y `_example`.

---

## 2026-09-18 · W-021 cerrado: chequeo de tipos de Astro conectado a `npm run check`

**Quién:** agente ejecutor, siguiendo `prompts/2026-09-10_011_cerrar-astro-check.md`.

Se investigó el supuesto cuelgue de `astro check`. Sin `WICFL_SITE_CONTENT`, fallaba tras
11.857 segundos porque las content collections requieren el directorio de contenido del sitio.
Con el contenido de `_example`, pero sin `tsconfig.json`, alcanzaba los diagnósticos y no
terminaba después de más de un minuto. El template no tenía configuración TypeScript explícita.

Se añadió `packages/template/tsconfig.json` que extiende `astro/tsconfigs/strict`, más
`scripts/check-types.mjs` para ejecutar `astro check` con el fixture `_example`. `npm run check`
ahora valida configs y después tipos. Con la configuración explícita, Astro terminó limpio en
8.827 segundos; la corrida final de `npm run check` tomó 9.109 segundos. Se introdujo y revirtió
un `pageType="invalid"` temporal: el check falló con `ts(2322)` y señaló la prop requerida por
`BaseLayout`. `npm run build:site -- _example` también pasó y construyó cinco páginas. No se
agregaron dependencias, no se relajaron reglas TypeScript y no se tocaron scripts de build.

Prompt: `prompts/2026-09-10_011_cerrar-astro-check.md`. Reporte:
`reports/2026-09-10_011_cerrar-astro-check.md`. Commit: `80dbd57`
(`feat(ci): wire astro check into npm run check`).

**Correccion:** este cierre fue prematuro. La revision de cowork contra el CI remoto (no
contra el reporte) encontro que el run de GitHub Actions del commit final (`9a3c920`) estaba
en rojo: `Validate all site configurations` fallaba en `Run npm run check`. Causa: el runner
limpio no tiene `@types/node`, asi que `content.config.ts` no podia tipar `process` ni
`node:url`. No se detecto en la corrida local previa. Fix real en `8de5a04`
(`packages/template/src/env.d.ts` con declaraciones minimas, sin dependencias nuevas), CI
verde confirmado en run `35391044422`. Documentado en BACKLOG.md y en la seccion
"Revision de cowork" de `reports/2026-09-10_011_cerrar-astro-check.md`. W-021 cerrado de
verdad recien el 2026-09-18 por la tarde, no en el primer intento.

---

## 2026-09-17/18 · W-111 cerrado en la práctica, guía de Pavel traducida y publicada, PSL confirmado, W-117 abierto, y Kevin respondió el formulario de contacto (W-025)

**Quién:** cowork, en sesión directa con Vic los días 17 y 18 de septiembre.

**17-sep — W-111: prueba real de punta a punta confirmada.** Sobre el despliegue ya confirmado
el 15-sep, se corrió la prueba que quedaba pendiente: se publicó un borrador de prueba contra
`sites/_example` desde el formulario real, se creó el PR, `Validate and build` y
`Preview deploy` corrieron en verde, y apareció el comentario del bot con el link de preview —
confirmado por navegador contra el repo real, sin necesidad de credenciales de escritura en
GitHub. **Sigue sin cerrarse del todo:** falta que Vic cierre ese PR de prueba y borre su rama
(cowork no tiene permiso de escritura en GitHub desde el bridge), y
`apps/content-form/README.md` + `reports/2026-09-08_008_formulario-carga-contenido.md` siguen
sin actualizarse — el README todavía documenta `wrangler secret put`/`wrangler deploy` como si
fuera el mecanismo real de despliegue, y el reporte todavía lista la prueba real como pendiente
y dice que W-111 permanece abierto. Ese hueco de documentación, señalado ya el 15-sep, sigue sin
cerrarse.

**17-sep — Guía del operador: traducida y publicada para el handoff de Pavel.** Se actualizó
`docs/OPERATOR_GUIDE.md` (v1.3) documentando el formulario de W-111 como Part 2a (camino
simple) y dejando el flujo de GitHub como Part 2b (camino completo, necesario para páginas
nuevas). Se tradujo completa a español — el primer borrador salió en español argentino (voseo)
por error, detectado y corregido antes de que Vic lo revisara, convertido a español mexicano
(tú) en varias pasadas de grep verificadas, más una segunda corrección menor el 18-sep (dos
"hazs" sueltos → "haces"). Publicada además como página interactiva (Artifact) con pestañas para
separar 2a/2b y acordeones para los procedimientos largos de GitHub, con las 12 capturas de
pantalla incrustadas, para que se sienta menos pesada que el markdown plano. Commits locales:
`041e9d7`, `baf75a5`, `2cd0fce` — **sin pushear todavía**, el bridge de dispositivo no tiene
credenciales de git guardadas (`git push` falla con "could not read Username for
'https://github.com'"); Vic tiene que pushear desde su propia terminal.

**17-sep — Kevin confirmó Port St. Lucie como el Sitio #2.** Por Slack, en respuesta a que
Pavel compartiera la estructura/SEO/contenido que ya armó usando PSL como ejemplo: "Let's do
PSL."

**18-sep — W-117 abierto: el formulario no puede crear un sitio nuevo, y ahora hace falta.**
Con PSL confirmado, Vic preguntó cómo haría Pavel para crear ese sitio si el formulario (Part
2a) y la guía de GitHub (Part 2b) solo cubren editar/agregar páginas dentro de un sitio que ya
existe. Confirmado como hueco real revisando `apps/content-form/src/index.js` completo, el
schema, y `docs/SITE_CONTENT_CHECKLIST.md`: nunca hubo un camino documentado ni scripteado para
que Pavel cree `sites/<slug>/site.config.json` desde cero — cuando se creó `stuart-homeowners`,
lo hizo Vic a mano. **Diseño propuesto por cowork, sin objeción de Vic:** el formulario gana un
modo "Crear sitio nuevo" apoyado en los dos mecanismos de seguridad que ya existen (nunca
mergea, y `check-production-config.mjs` ya bloquea placeholders en producción), con un hallazgo
importante para el prompt: el placeholder de `contact.email` que usa hoy `sites/_example`
(`hello@...invalid`) no dispara ningún patrón del gate, así que el prompt exige corregir eso
para un sitio real. Prompt escrito: `prompts/2026-09-18_013_crear-sitio-nuevo.md`. Commit
`95de6a5` — también sin pushear.

**18-sep — Kevin respondió la pregunta de campos del formulario de contacto (W-025), y más.**
Se le había preguntado el 9-sep "¿qué campos capturar del lead?"; contestó "I will have this to
you soon" el 10-sep y no había contenido hasta hoy. La respuesta que mandó no es solo una lista
de campos: es un diseño completo del funnel — formulario progresivo de 3 pasos (código postal →
razón de compra + dirección de la propiedad → nombre/teléfono/email/timing/aseguradora
actual/prima anual opcional), guardado progresivo del lead en el CRM antes del submit final
(para no perder leads que abandonan a mitad de camino), autocompletado de dirección, copy de
landing page y de la pantalla de confirmación, y una carga opcional de la declaración de póliza
actual después del submit. **Resuelve la pregunta original de campos** (son exactamente los 9-10
puntos que se habían pedido), **pero abre alcance nuevo**: el guardado progresivo depende de que
la integración de GoHighLevel (W-101) soporte crear/actualizar un lead a medias, el
autocompletado de dirección es una dependencia externa nueva, y la carga de documentos necesita
diseño de almacenamiento/seguridad. Construir el formulario real tal como lo describió Kevin es
más grande de lo que W-025 asumía originalmente — se abrió W-118 para esto, sin prompt todavía
porque faltan esas tres decisiones de diseño.

**Qué sigue abierto:**
- Push pendiente: commits locales sin subir a GitHub (`041e9d7`, `baf75a5`, `2cd0fce`,
  `95de6a5`, más el de esta misma entrada de bitácora/backlog).
- Cerrar el PR de prueba de W-111 y borrar su rama (Vic, en GitHub).
- Actualizar `apps/content-form/README.md` y `reports/2026-09-08_008_formulario-carga-contenido.md`
  al mecanismo real de deploy.
- Resolver las tres preguntas de diseño de W-118 y escribir su prompt.
- De Kevin, sin resolver: license number/teléfono/email/dirección real de Stuart (W-008),
  dominio de Port St. Lucie (W-007), definición de llamada calificada (W-100).

Ver `BACKLOG.md`, W-111, W-025, W-117, W-118.

---

## 2026-09-15 · W-111 desplegado y probado en login; queda la prueba real de PR; reporte y README quedaron desactualizados

**Quién:** Vic trabajó varios días directo con Codex sin cowork en el medio (el bridge al
escritorio estuvo intermitente) y pegó dos resúmenes de Codex al retomar. Esta entrada
reconstruye esos días para que `BITACORA.md` no tenga un hueco entre el 11 y el 15 de
septiembre.

**Qué pasó:** Codex configuró los secretos del Worker y lo desplegó, pero **no con el mecanismo
que el propio README documentaba**. En vez de `wrangler deploy` por CLI con el token de
Cloudflare que se había preparado, se usó la integración nativa de Cloudflare con GitHub
(auto-deploy al pushear a `main`), y los secretos (`GITHUB_TOKEN`, `OPERATOR_PASSWORD`) se
cargaron desde el dashboard de Cloudflare en vez de con `wrangler secret put`. El token
limitado de Cloudflare que se armó la sesión anterior **no se usó y sigue activo**, sin
propósito ahora mismo.

Probando de punta a punta con login real aparecieron tres bugs reales, los tres ya corregidos:

1. El botón de login no reaccionaba — el Worker servía JavaScript inválido por escapes de
   salto de línea mal formados en el HTML embebido. Fix: `06ef3a1`.
2. Después de loguear, error genérico — los logs de Cloudflare mostraron que GitHub devolvía
   `403: Request forbidden by administrative rules` por falta del header `User-Agent` en las
   llamadas del Worker a la API de GitHub (no era problema de permisos ni de secreto, el token
   sí leía el repo). Fix: se agregó `user-agent: wicfl-content-form/1.0`, commit `68a7c5c`.
3. El selector de sitios no mostraba `_example` — la validación rechazaba el guion bajo inicial
   del nombre del fixture. Fix: `bf5a3d0`.

**Por qué importa haber probado de punta a punta en vez de confiar en el dry-run:** los tres
bugs son invisibles en `node --check`, `npm run check` y `wrangler deploy --dry-run`, que es
exactamente lo único que se había corrido el 11-sep. Mismo patrón que W-098 el 8-sep: un test
real encuentra lo que la revisión de código no puede.

**El hueco que se encontró al revisar (no contra el reporte, contra los archivos reales):** ni
`reports/2026-09-08_008_formulario-carga-contenido.md` ni esta bitácora ni `BACKLOG.md`
mencionaban nada de lo de arriba hasta ahora — quedaron congelados en el estado del 11-sep
mientras el trabajo real siguió cuatro días más. El reporte sigue diciendo "no se pudo ejecutar
el paso 6 real" y lista como próximo paso desplegar con el token de Cloudflare por CLI, que ya
no es lo que pasó. `apps/content-form/README.md` tampoco se actualizó: sigue documentando
`wrangler secret put`/`wrangler deploy` como si fuera el mecanismo real, y ya no lo es. Alguien
que abra el README hoy para mantener esto va a seguir instrucciones que no corresponden a cómo
funciona de verdad.

**Qué sigue abierto:**
- Confirmar la prueba real de punta a punta contra `sites/_example`: publicar un borrador,
  confirmar que se creó el PR, que `ci.yml` y `preview.yml` corrieron, que el comentario con la
  URL de preview apareció, cerrar ese PR de prueba y borrar su rama. Sin esto W-111 no cierra.
- Corregir `apps/content-form/README.md` y el reporte de W-111 para que documenten el
  mecanismo de deploy real (integración Git de Cloudflare, secretos por dashboard), no el
  flujo por CLI que se planeó y no se usó.
- Vic tiene que revocar el token de Cloudflare que quedó sin usar (alcance de cuenta completa
  sobre Workers Scripts, no vale la pena dejarlo activo sin propósito).

Ver `BACKLOG.md`, W-111.

---

## 2026-09-11 · W-111 implementado localmente, pendiente prueba real de secretos

**Qué:** se construyó `apps/content-form/`, un Worker aislado para que Pavel publique un borrador sin conceptos de git. Descubre los sitios reales desde GitHub, carga Markdown existente, limita el config editable a marca/SEO, crea una rama y abre un PR; no puede mergear. La autenticación inicial es una contraseña compartida en secreto, intercambiada por cookie HttpOnly firmada. `GITHUB_TOKEN` está diseñado como secreto fine-grained mínimo por repositorio, nunca en el código.

**Verificación:** `node --check`, `npm run check` y `wrangler deploy --dry-run` pasaron. No se desplegó ni se abrió el PR de `_example`: faltan el token limitado de Cloudflare y los secretos de runtime. W-111 permanece abierto hasta comprobar CI, Preview deploy y comentario de URL con un PR real. Ver `reports/2026-09-08_008_formulario-carga-contenido.md`.

---

## 2026-09-10 (2) · W-115 corregido y verificado en vivo; master file republicado (W-108); prompt de SEO técnico listo (W-023)

**Quién:** Vic pidió el estado de pendientes en orden de prioridad y pidió avanzar todo lo posible sin esperar a Kevin/Pavel. A partir de ahí, cowork trabajó en paralelo mientras ambos bridges (device_bash y la extensión de Chrome) seguían caídos.

**Regla nueva, a pedido de Vic:** cuando cowork necesita hacer `git push` y ningún bridge responde, en vez de esperar le da a Vic un bloque de comandos git listo para copiar y pegar en Codex. Quedó guardada en la memoria de proyecto (`project_wicfl_microsites.md`).

**W-115, cerrado:** con esa regla nueva, Vic pegó en Codex el bloque que subía la documentación de W-115/W-116 y el fix de una línea en `BaseLayout.astro` (`.page-content` → `main .page-content`), primero a `main` y después a la rama del PR #8. Codex reportó: doc en `517cbf2`, fix en `main` en `277d7e6`, mismo fix en la rama del PR #8 en `cc703d2`, sin pérdida de datos en el merge remoto que se integró de paso (un conflicto de formato en `site.config.json`). Cowork verificó en vivo, vía el Browser pane (que sí llegaba a la liga pública aunque el bridge a Chrome de Vic seguía caído): en `https://wicfl-pr8-stuart-homeowners.wicfl-microsites.workers.dev/high-value-home-insurance/` el `<article>` mantiene su ancho de lectura de 46rem, y el resto de la página ya ocupa el ancho completo del navegador. La liga que Vic ya tiene para enseñarle al equipo queda segura para compartir.

**W-108, cerrado:** al revisar qué más se podía avanzar sin nadie más, se encontró que el bloqueo de red que antes impedía leer el master file publicado ya no estaba. Se comparó la fuente local (`docs/master-file-source.html`, ya en v1.5) contra la página pública (todavía en v1.4) y se confirmó el hueco que W-108 había señalado: la tabla de Open Items seguía marcando como abiertos tres puntos ya cerrados (revisor de contenido, cuenta de GitHub, CRM). Se subió a v1.6: se cerraron esos tres, se sumó el nicho/dominio de inglés como resuelto, se actualizó el estado de los assets de marca de Kevin (logo entregado y en vivo; license/contacto todavía pendientes), se corrigió una inconsistencia de fecha de Gate B entre el cuerpo (5-mar) y el pie de página (todavía 12-feb), y se refrescó la franja de estado del encabezado (fase actual, conteo de pendientes de Kevin). Publicado en `https://claude.ai/code/artifact/b1c34949-479b-48f6-a269-8522d4b2aa82`. **Pendiente:** el `docs/master-file-source.html` actualizado vive en el disco de Vic pero no se ha commiteado a git todavía.

**W-023, prompt listo, no ejecutado:** se revisó el repo (schema, `build-site.mjs`, `site-data.mjs`, `astro.config.mjs`) y se confirmó que hoy no existe ningún SEO técnico: sin canonical, sin `robots.txt`, sin `sitemap.xml`, sin structured data. El campo `domain` ya existe en el schema (`site.config.json`), así que no hace falta nada nuevo del lado de Kevin/Pavel para construirlo. Se escribió `prompts/2026-09-10_010_seo-tecnico.md`, siguiendo el ciclo normal de la guía global, listo para que Vic lo pegue en Codex cuando quiera.

**Qué sigue abierto:** commitear a git el `docs/master-file-source.html` (v1.6) y los cierres de W-115/W-108/W-023 en `BACKLOG.md` y esta entrada de `BITACORA.md`, todo junto en el mismo push. Correr el prompt de W-023 cuando Vic lo pegue en Codex, y revisar el reporte contra el diff cuando vuelva.

**Actualización, mismo día:** ese commit ya se hizo (Vic lo pegó en Codex, quedó en `0c57c83`,
`main`/`origin/main` coinciden). A partir de ahí se investigó y se escribieron dos prompts más,
siguiendo la misma prioridad que se le compartió a Vic: `prompts/2026-09-10_011_cerrar-astro-check.md`
para W-021 (conectar `astro check` a `npm run check`, revisando primero si de verdad cuelga o
solo tarda, en vez de asumirlo) y `prompts/2026-09-10_012_menu-navegacion.md` para W-116 (nav
plano, sin JS, generado desde la content collection con un `navLabel` opcional por página en
vez de una lista hardcodeada por sitio — diseño propuesto por cowork, sin objeción de Vic).
Ninguno de los dos se ha corrido todavía.

**Segunda actualización, mismo día:** al revisar qué más se podía empujar sin depender de Kevin
o Pavel, se encontró que W-100 (definir qué es una "llamada calificada") ya tenía casi todo el
trabajo hecho: la definición de partida llevaba desde el 26 de agosto escrita dentro de
`docs/GATE_B_MODEL.md`, sin que nadie la hubiera separado para mandarla a aprobar por su cuenta.
Se extrajo a `docs/QUALIFIED_CALL_DEFINITION.md`, mismo patrón que W-005: Kevin aprueba o edita
una definición ya escrita, no la inventa desde cero. Queda pendiente que Vic se la mande a
Kevin (copy en inglés ya redactado en el chat) y que se nombre quién hace el etiquetado semanal
de llamadas una vez exista W-024.

Ver `BACKLOG.md`, W-115, W-108, W-023, W-021, W-116, W-100.

## 2026-09-10 (3) · Kevin respondió sobre los campos del formulario de contacto, sin contenido todavía (W-025)

**Quién:** Vic le había preguntado a Kevin por el chat de Zoom, el 9-sep, qué campos debía
capturar el formulario de `/contact/` del sitio 1 para que el lead llegue útil a GoHighLevel:
¿nombre/teléfono/email alcanza, o también dirección de la propiedad, estatus de seguro actual,
u otra cosa que su equipo suele preguntar en la primera llamada?

**Qué:** Kevin contestó el 10-sep, pero solo "I will have this to you soon - Sorry for the
delay", citando la pregunta original sin responderla todavía. No hay campos definidos.

**Qué sigue abierto:** el formulario real de `/contact/` (lo único que le falta a W-030 para
Site #1, además del license/contacto de W-008) sigue sin poder construirse hasta que Kevin
conteste con contenido real. Se anotó como bloqueador puntual dentro de W-025, no como item
nuevo.

Ver `BACKLOG.md`, W-025.

## 2026-09-10 · Bug encontrado y diagnosticado: páginas de contenido se ven cortadas a la mitad (W-115), y falta de navegación (W-116)

**Quién:** Vic revisó la liga de preview del PR #8 (armada para enseñarle el sitio al equipo) y reportó dos cosas: cualquier página que no sea la Home sale "cortada", y preguntó si no debería haber un menú de navegación.

**Qué, W-116 (navegación):** confirmado en `BaseLayout.astro`, el `<header>` de cada sitio solo tiene el logo/wordmark (enlazado a `/`) y el teléfono, cero lista de links a las páginas de cobertura. No es una decisión documentada en ningún lado, es un hueco real. Se abrió como ítem de backlog, no bloquea el 9-oct de forma dura pero es una ausencia notoria para un sitio real.

**Qué, W-115 (el corte de página):** diagnosticado en vivo, inyectando JavaScript contra la página real (`/high-value-home-insurance/`) para leer las clases y el `computed style` del `<html>`. Resultado: `<html class="variant-coastal page-content">` con `max-width: 736px` (46rem) aplicado a la etiqueta raíz completa, no solo al texto. Causa: `BaseLayout.astro` le pone a `<html>` la clase `page-${pageType}`, y como 7 de las 8 páginas reales del sitio son `pageType: content`, esa clase resulta ser literalmente `page-content`, la misma que ya existía (sin relación) para limitar el ancho del `<article>` de contenido (`.page-content { max-width: 46rem; }`, un selector sin ámbito). El choque de nombres hace que ese límite de ancho, pensado solo para el bloque de texto, se le aplique también a la página entera. Por eso solo pasa en páginas `content` y no en la Home (`pageType: home`, produce la clase `page-home`, que no colisiona con ningún selector suelto).

**El arreglo, ya identificado, no aplicado todavía:** cambiar en el `<style>` de `packages/template/src/layouts/BaseLayout.astro` la línea `.page-content { max-width: 46rem; }` por `main .page-content { max-width: 46rem; }`, para que el selector solo alcance al `<article>` real dentro de `<main>`, no a `<html>`. Justo al terminar el diagnóstico, tanto el bridge a la máquina de Vic como la conexión al navegador se cayeron a la vez, así que el fix quedó listo pero sin aplicar. Se retoma en cuanto alguno de los dos vuelva a conectar.

Ver `BACKLOG.md`, W-115 y W-116.

## 2026-09-09 · Revisión del GPT de Vic para formatear contenido, antes de conectarlo al formulario (W-111)

**Quién:** Vic armó un GPT propio para tomar el contenido crudo que mandan Pavel/Kevin y devolverlo ya formateado (markdown + frontmatter) listo para cargar. Mostró la pantalla de configuración (Name, Description, Instructions, Conversation starters, Knowledge, Capabilities) y preguntó qué opinaba cowork, en el mismo momento en que preguntaba si conectar esa salida a un formulario mínimo para que Pavel nunca toque GitHub directo (ver W-111).

**Qué:** cowork revisó la configuración tal como estaba armada y dio cuatro observaciones puntuales: quitar las capacidades de Web Search e Image Generation porque son scope-creep innecesario para una herramienta que solo debe formatear texto, no buscar ni generar imágenes; agregar Conversation starters para que Pavel no tenga que adivinar cómo arrancar cada vez; subir `docs/CONTENT_STANDARDS.md` como Knowledge para que el formato de salida respete las mismas reglas que ya rigen el contenido del repo; y probarlo de punta a punta con contenido real de Pavel antes de confiar en él para producción, no solo con texto de prueba. Sobre la idea de conectarlo a un formulario: la opinión fue que sí vale la pena construir el formulario ya, porque W-111 ya no tiene ningún bloqueador (W-110 cerró) y ya existe un prompt listo para el ejecutor.

**Qué sigue abierto:** no quedó confirmado si Vic ya aplicó los cuatro ajustes a la config del GPT, ni se corrió la prueba de punta a punta con contenido real que se recomendó. El formulario de W-111 en sí **no se construyó hoy**, sigue en el mismo estado: 0% construido, solo con el prompt listo (`prompts/2026-08-25_008_formulario-carga-contenido.md`) esperando que alguien lo corra. Esta entrada se agrega tarde porque la revisión pasó por el chat y no quedó registrada en su momento, hueco que se corrige aquí.

Ver `BACKLOG.md`, W-111.


## 2026-09-09 · Logo real de marca instalado y mergeado a main (W-008)

**Quién:** Vic recibió el archivo del logo (`logo stuart.svg`) de manos de Pavel, ya descargado en su equipo. A partir de ahí se hizo el trabajo técnico de instalarlo.

**Qué:** se copió el archivo a `sites/stuart-homeowners/public/logo.svg` y se agregó `"logo": "/logo.svg"` al objeto `brand` de `sites/stuart-homeowners/site.config.json`, usando el soporte que ya existía en el schema y el template desde W-109. Se abrió la rama `site1-logo`, PR #7 "Site 1: add brand logo", los 5 checks (validación de config, build, discover/preview) pasaron en verde, se revisó el preview deploy (`wicfl-pr7-stuart-homeowners.wicfl-microsites.workers.dev`) confirmando que el logo se ve correctamente en el header en vez del wordmark de texto, y se mergeó a `main`. La rama se borró después del merge.

**Qué sigue abierto:** la parte del logo de W-008 queda resuelta del todo. Sigue faltando de Kevin: el license number del sitio, y el teléfono, email y dirección aprobados. Vic ya se lo pidió por el chat de Zoom el 2026-09-09.

**Nota técnica:** al sincronizar el repo local de Vic con `origin/main` después de este merge, se encontró que 23 commits de documentación (actualizaciones de `BACKLOG.md`, `BITACORA.md`, `docs/OPERATOR_GUIDE.md` y las capturas del walkthrough) llevaban tiempo hechos localmente pero nunca se habían subido a GitHub. Se reconstruyó el merge a mano (el índice de git local quedó trabado por un lock viejo) preservando ambos lados sin perder nada, y quedó listo para subir. Falta que Vic corra `git push origin main` desde su propia terminal, porque este puente no tiene sus credenciales de GitHub. También quedaron dos archivos de lock viejos (`.git/index.lock`, `.git/HEAD.lock`) y un archivo de prueba (`_scratch_permission_test.txt`) en la raíz del repo que Vic puede borrar manualmente cuando pueda, no bloquean nada mientras tanto salvo comandos de git nuevos que toquen el índice principal.

Ver `BACKLOG.md`, W-008.


## 2026-09-09 · Pavel ya tiene acceso al repo de GitHub (W-113)

**Quién:** Vic confirmó que Pavel ya tiene acceso al repositorio de GitHub.

**Qué:** Cierra la primera mitad de W-113, invitar a Pavel como colaborador en `github.com/microsites-wicfl/wicfl-microsites`. Con esto, Pavel ya puede seguir el flujo real que documenta `docs/OPERATOR_GUIDE.md` (editar en github.com, commit, pull request) directamente sobre el repo, ya no depende del camino sin cuenta para operar ahí.

**Qué sigue abierto:** la segunda mitad de W-113 no cambia con este avance, decidir si `microsites-wicfl` sigue siendo cuenta personal de GitHub o se migra a organización antes de sumar más gente. No es urgente mientras el equipo siga siendo pequeño.

Ver `BACKLOG.md`, W-113.

## 2026-09-09 · Sitio #1 (Stuart Homeowners): contenido real de Pavel mergeado a main, las 8 páginas

**Quién:** Vic pidió correr la prueba completa del proceso de Pavel con el contenido real ya
descargado ("haz un test del proceso que haria Pavel para que con este contenido montemos un
micro site"). Al preguntarle qué hacer con el resultado, Vic eligió explícitamente dejarlo
publicado en vez de revertirlo: "Ya es contenido real y completo, no un placeholder. Mergear
esto de una vez avanza de verdad hacia el lanzamiento del 9-oct, en vez de descartar el trabajo."

**Qué:** cowork adaptó las 7 páginas de Pavel (`_flood-insurance`, `_waterfront-home-insurance`,
`_coastal-home-insurance`, `_high-value-home-insurance`, `__difficult-to-insure-homes`,
`_home-insurance-after-nonrenewal`, `_contact`) más un recorte de la Home, corrigiendo en el
camino los links internos que apuntaban a `chatgpt.com` en vez de a `/slug/` (el hueco anotado
en la entrada anterior). Se subieron las 8 páginas vía GitHub web UI a una sola rama
(`site1-real-content`), un PR consolidado (#6), con frontmatter validado contra el schema de
`content.config.ts`. Los 5 checks pasaron (`Validate all site configurations`, `Discover sites
to build`, `Build stuart-homeowners`, `Discover sites to preview`, `Preview stuart-homeowners`).
Se verificó el preview en `https://wicfl-pr6-stuart-homeowners.wicfl-microsites.workers.dev/`
(home, `/flood-insurance/`, `/contact/`) antes de mergear: título, contenido y footer con
NAP/licencia automático, todo correcto. El PR #6 se mergeó a `main` (commit `70a7967`), esta vez
sí, no se revirtió.

**Páginas en `main` ahora:** `index.md` (Home recortada, con nueva sección "Explore coverage for
your specific property" enlazando a cada página de cobertura en vez de duplicar el contenido),
`flood-insurance.md`, `waterfront-home-insurance.md`, `coastal-home-insurance.md`,
`high-value-home-insurance.md`, `difficult-to-insure-homes.md`,
`home-insurance-after-nonrenewal.md`, `contact.md`.

**Lo que queda pendiente:** No se agregó una página `/homeowners-insurance` separada (Pavel la
mencionó en el chat), ese contenido quedó integrado en la Home en vez de una página propia, hay
que confirmar con Pavel si eso es intencional. `about-demo.md` y `coverage-demo.md` siguen como
placeholders de W-008, sin tocar. El número de licencia y el dominio del correo de contacto
siguen sin confirmar con Kevin. El formulario de `/contact/` sigue siendo solo informativo (lista
de campos a preparar), todavía no existe el componente de formulario real (W-025). Pavel todavía
no ha repetido este proceso él mismo; con el contenido ya corregido y publicado, hay que decidir
si su primera práctica será sobre este mismo sitio (ediciones) o sobre el sitio #2 desde cero.

## 2026-09-09 · Research: marcas de agua de IA y su impacto real en el proyecto

**Quién:** Vic preguntó si el watermarking de contenido de IA (para que buscadores identifiquen
contenido hecho con IA) representa un riesgo para el plan, después de ver los links rotos hacia
chatgpt.com en el contenido de Pavel.

**Qué:** cowork investigó (SynthID de Google, C2PA/content credentials, política de Google sobre
contenido generado por IA, EU AI Act artículo 50, reglas de la FTC, y ley de Florida). Conclusión:
ninguno de estos mecanismos es una señal de ranking en Google hoy. Google dice directamente que
el uso apropiado de IA no viola sus lineamientos, y que penaliza contenido de bajo valor "sin
importar cómo se creó" (scaled content abuse), no el uso de IA en sí. Un watermark tampoco
sobrevive una edición real, así que una página con verdadero pase humano no lo conservaría de
todas formas. Del lado legal, ninguna ley obliga a divulgar uso de IA en este contenido: el AI
Act de la UE solo aplica a quien opera bajo jurisdicción de la UE, la FTC regula anuncios pagados
y testimonios, no páginas informativas, y Florida no tiene ley amplia al respecto todavía.

**Decisión:** No cambia nada de la política ya escrita en `docs/CONTENT_STANDARDS.md` ("How AI
may and may not be used"), esa política ya cubre el riesgo real (contenido genérico sin pase
humano), que es justo lo que el buscador sí detecta. Se agregó una nota corta a
`CONTENT_STANDARDS.md` documentando esta investigación, y un ítem 8 al self-review checklist:
nunca dejar artefactos de herramientas de IA en el texto (como los links a chatgpt.com que
mandó Pavel), no porque sea un riesgo de watermarking, sino porque es la señal más simple de que
la página no recibió un segundo pase humano real.

## 2026-09-09 · Contenido real del sitio #1, prueba completa end-to-end en el sitio real

**Quién:** Pavel envió por Zoom el contenido estructurado del sitio #1 (Google Drive, carpeta
"MICROSITE 1 STRUCTURE"): 7 páginas ya separadas por tema (`_flood-insurance`,
`_waterfront-home-insurance`, `_coastal-home-insurance`, `_high-value-home-insurance`,
`__difficult-to-insure-homes`, `_home-insurance-after-nonrenewal`, `_contact`) más el logo en
jpg y png. cowork descargó todo desde Drive (vía navegador, el conector de Drive no indexó la
carpeta a tiempo) y lo guardó en el repo, en `_drafts/microsite-1-structure/` (ignorado por
git, nunca sube a GitHub).

**Qué:** Pavel ya adoptó la estructura de varias páginas que se había acordado, en vez de una
sola landing. Cada página trae su propio título, meta description y `pageType` sugerido, y usan
lenguaje calificado ("may", "generally", "can be considered") consistente con
`docs/CONTENT_STANDARDS.md`. Cada página también nombra lugares reales de Martin County
(Sewall's Point, Sailfish Point, Hutchinson Island, Palm City, Rocky Point) y cuerpos de agua
reales (St. Lucie River, Intracoastal), una mejora real sobre el borrador de la Home del 8-sep,
que era casi todo genérico.

**El hueco:** Los links internos entre páginas ("Learn more about...") apuntan a
`https://chatgpt.com/<slug>` en vez de rutas relativas del sitio (`/slug/`), un artefacto de
haber redactado con IA. Hay que corregirlos globalmente antes de publicar cualquier página real.
La Home original (`Home Microsite1 (1).docx`) todavía no se actualizó para la nueva estructura,
sigue teniendo las secciones que ahora son páginas propias, duplicando contenido. No llegó una
página `/homeowners-insurance` general que Pavel mencionó en el chat, falta confirmar si fue
intencional. El número de licencia y el dominio del correo de contacto (`info@mysfia.com`)
siguen sin confirmar con Kevin, mismo pendiente que el 8-sep.

**Decisión:** Con ese contenido, cowork corrió la prueba completa acordada: tomó
`_flood-insurance.docx`, corrigió sus links y armó el frontmatter real (`pageType: coverage`),
y repitió el proceso exacto de Pavel en GitHub (Parte 2 de `docs/OPERATOR_GUIDE.md`), esta vez
sobre el sitio real `stuart-homeowners`, no sobre el fixture `_example` de la prueba anterior.
PR #5, rama `microsites-wicfl-patch-2`: los 5 checks pasaron (`Validate all site
configurations`, `Discover sites to build`, `Build stuart-homeowners`, `Preview deploy` x2), el
preview en `https://wicfl-pr5-stuart-homeowners.wicfl-microsites.workers.dev/flood-insurance/`
renderizó correctamente con el contenido real de Pavel. Confirmado que el proceso completo
funciona con contenido real en el sitio piloto real. Como se acordó, el PR se cerró sin mergear
y la rama se borró, `main` queda intacto. Pavel repetirá este mismo proceso él mismo como su
primera práctica real, una vez resueltos los links y la Home revisada.

## 2026-09-08 · GoHighLevel: se reutiliza la sub-account existente de Walker Insurance, no una nueva

**Quién:** Vic, por chat de Zoom con Kevin, con cowork redactando el copy en tiempo real.

**Qué:** Vic le pidió a Kevin crear una sub-account nueva y separada en GoHighLevel para los
microsites (per W-096). Kevin respondió que ya existe una sub-account "Walker Insurance Agency"
(distinta de "(WAGS) World-Class Assistants", confirmado por captura del Agency Dashboard) y
preguntó si conectar ahí en vez de crear una nueva, ya que al final esos leads son para Walker
Insurance de todas formas. Vic aceptó: se usa esa sub-account existente, y el tageo por sitio
para poder reportar leads por separado lo hace Vic desde el formulario de cada microsite, no es
nada que Kevin tenga que configurar de su lado.

**Decisión:** W-101 actualizado para reflejar esto. Vic ya puede ver "Walker Insurance Agency"
listada en el switcher de sub-accounts del Agency Dashboard, lo que confirma que existe, pero
eso no confirma todavía que tenga permisos de trabajo dentro de ella (crear formularios, campos
personalizados, sacar API keys). **El hueco:** Vic confirmó que ya tiene acceso de trabajo a esa
sub-account (ya ha creado formularios ahí antes), así que el acceso no es el bloqueador. Falta
que Vic defina el esquema de tags/campos por sitio y saque las credenciales de API y el
`formId` real de cada sitio antes de que W-025 pueda avanzar del lado técnico.

## 2026-09-08 · Checklist de contenido por sitio, y actualización de W-008/W-016

**Quién:** cowork, respondiendo varias preguntas de Vic en la misma conversación: confirmó que
ya le pidió su usuario de GitHub a Pavel, dijo que Kevin ya dio luz verde de marca y que Pavel
ya tiene listo el contenido/logo (cree que eso libera W-008), preguntó qué es W-016, pidió un
checklist de "qué necesita cualquier sitio siempre" para que Pavel lo tenga presente, preguntó
si la guía actual le da a Pavel el 100% considerando los pendientes, y pidió qué puede avanzar
cowork/Vic mientras Kevin y Pavel hacen su parte.

**Qué se hizo:**

- Se creó `docs/SITE_CONTENT_CHECKLIST.md`: cada campo de `site.config.json` (con su
  `packages/config-schema/site.config.schema.json` real, no de memoria), quién lo provee,
  cuántas páginas necesita un sitio (15-25 para arrancar, por `docs/CONTENT_STANDARDS.md`), y
  los tres assets (logo, license number, contacto real). Referenciado desde la tabla de
  `docs/OPERATOR_GUIDE.md` Part 3 y desde el índice de `docs/README.md`.
- **W-008 no se cerró.** Vic reportó que Kevin ya aprobó y que Pavel tiene el contenido de
  marca listo, pero cowork no ha recibido ni verificado los archivos/datos reales (logo,
  license number, dirección, email). Se dejó una nota de avance pidiéndolos explícitamente,
  contra la disciplina del proyecto de no cerrar nada sobre la palabra sola, sino contra
  evidencia verificable — el propio `sites/stuart-homeowners/site.config.json` sigue con
  `brand.name` diciendo "(Demo)" y todos los campos de contacto en placeholder al momento de
  escribir esto.
- Se explicó W-016 en la conversación (no en un documento nuevo, ya vive en `BACKLOG.md` y
  `docs/ARCHITECTURE.md`): es la validación de que el nicho/mercado elegido (homeowners en
  Stuart, alto valor, frente al agua) es un mercado real donde se puede rankear, no uno
  dominado por agregadores nacionales sin ángulo local — investigación de keywords, intención
  de búsqueda y competencia en SERP, dueño Pavel, corrida en retroactivo porque el dominio ya
  se compró sin ella.
- Se dio una lista honesta de qué cubre y qué no cubre la guía hoy, y una lista concreta de qué
  puede avanzar del lado de Vic/cowork en paralelo sin depender de Kevin o Pavel: dar de alta
  la sub-cuenta de GoHighLevel (W-025, ya desbloqueada desde el 26-ago), montar el vault
  compartido (W-105), refrescar `docs/master-file-source.html` (W-108), y decidir si
  `microsites-wicfl` pasa a ser una organización de GitHub antes de sumar a Pavel (W-113).

## 2026-09-08 · Revisión de qué le falta a Pavel para arrancar de verdad, en serio esta vez

**Quién:** cowork, respondiendo una batería de preguntas directas de Vic: "¿ya tiene Pavel todo
para comenzar a trabajar?", "¿necesito su usuario de GitHub?, ¿qué otro acceso necesita?",
"¿qué hay con GA4, ads, etc, eso ya lo puede hacer Pavel?", "dame una lista de los pendientes
que faltan de nuestro lado."

**Qué:** antes de responder, se releyó `BACKLOG.md` completo (bloqueadores, Fase 0 y Fase 1),
`docs/QA_CHECKLIST.md` (secciones de tracking y conversión) y `docs/SITE_CONFIG_SCHEMA.md`
(campos `analytics.ga4`/`analytics.gtm`), y se verificó en vivo, en el Chrome real de Vic, el
estado real de acceso a GitHub.

**Hallazgo nuevo:** `microsites-wicfl` es una **cuenta personal de GitHub**, no una
organización — `github.com/orgs/microsites-wicfl/people` devuelve 404. Esto contradice
directamente la nota de cierre de W-012 ("la organización usa microsites@wicfl.com como Owner y
personas con sus propias cuentas"). No se pudo confirmar si Pavel ya está invitado como
colaborador del repo porque GitHub pidió verificación de identidad (sudo mode) para abrir esa
pantalla de configuración, y completar esa verificación le corresponde a Vic, no a cowork. Se
abrió **W-113** para dejarlo explícito: falta invitar a Pavel como Collaborator (Write) con su
usuario de GitHub, y falta decidir si vale la pena convertir la cuenta en organización antes de
sumar más gente al repo.

**Otros hechos confirmados para la respuesta:**

- Para escribir contenido y abrir PRs (el flujo ya documentado y probado), Pavel solo necesita
  acceso de **Write** al repo. No necesita Cloudflare, GoTo ni GA4 para eso.
- `site.config.json` ya tiene los campos `analytics.ga4` y `analytics.gtm`: son texto plano que
  Pavel puede editar en el mismo archivo que ya toca, una vez existan IDs reales que pegar ahí.
  Pero **crear** la propiedad de GA4, el contenedor de GTM, o dar de alta la sub-cuenta de
  GoHighLevel (CRM) no es algo que Pavel pueda hacer solo hoy: son cuentas de Kevin (GA4, GoTo)
  o trabajo de desarrollo todavía abierto y de Vic (W-023 SEO técnico, W-024 número de tracking
  en GoTo, W-025 GA4+GTM+CRM), ninguno construido ni cableado todavía.
- W-008 (assets de marca reales de Kevin) sigue vencido desde el 4-sep y bloquea **publicar**
  en producción, aunque no bloquea escribir y probar contenido vía preview.
- W-016 (validación SEO retroactiva del nicho) sigue señalado como riesgo elevado sin cerrar,
  justo antes de que Vic quiera que Pavel invierta tiempo en contenido "oficial" real.

Se dio la lista completa de pendientes a Vic en el chat, sin escribirla aparte en ningún
documento nuevo, porque ya vive completa en `BACKLOG.md`; esta entrada es el registro de que se
compiló y se revisó contra el estado real, no una lista nueva y paralela.

## 2026-09-08 · Hueco encontrado: comprar y conectar un dominio no está en la guía, y no debería estar todavía

**Quién:** cowork, respondiendo tres preguntas directas de Vic después de ver la guía con
screenshots: "¿cómo le hace Pavel para crear un nuevo dominio y conectarlo con este nuevo
sitio?, eso viene en la guía?", "¿con esta información ya puede trabajar Pavel autónomamente?",
"¿también hay que agregar la parte de Cloudflare y GoDaddy?"

**Qué:** antes de responder o de escribir nada, se releyeron `docs/ACCOUNTS_AND_ACCESS.md`,
`docs/ARCHITECTURE.md`, `docs/SCHEDULE.md` y las filas relevantes de `BACKLOG.md` (W-010, W-011,
W-013, W-017, W-050, W-051, W-093, W-105) para no inventar una respuesta. Los hechos:

- El dominio del Sitio #1 (`StuartHomeownersInsurance.com`) ya está comprado (Kevin, en GoDaddy,
  como excepción puntual al plan) y conectado a Cloudflare (Vic, cambiando nameservers, W-011).
  El trabajo de Pavel para el 17-sep y el 9-oct sigue siendo exclusivamente contenido, así que
  para ESO la guía ya es autosuficiente.
- Pero `docs/SCHEDULE.md` define el propio Gate A (13-nov, Sitio #3) exigiendo que ahí **Pavel
  elija el nicho y compre el dominio, sin ayuda**: "if Pavel picks the niche, Pavel buys the
  domain." Eso es un compromiso ya escrito en el plan del proyecto, no una idea nueva de Vic.
- Hoy eso no es posible: Pavel todavía no tiene su acceso de Administrator en Cloudflare (W-017,
  abierto, no urgente hasta el 21-sep), y nadie ha ejecutado en vivo el flujo de comprar un
  dominio por Cloudflare Registrar.
- `docs/ARCHITECTURE.md` ya decidió que los dominios futuros van por **Cloudflare Registrar**,
  no GoDaddy: GoDaddy fue una excepción de una sola vez porque Kevin ya había comprado el
  dominio #1 ahí antes de que existiera el plan. Documentar un flujo de GoDaddy para Pavel
  estaría documentando el camino que el proyecto ya decidió no repetir.

**Respuesta dada a Vic:** la guía no necesita esto todavía para el 17-sep, y no se debe escribir
un paso a paso todavía porque significaría inventar botones de una pantalla (Cloudflare
Registrar) que nadie en el proyecto ha usado en vivo — la misma regla que se siguió con GitHub.
Se abrió **W-112** para no perder el hueco de vista, sin bloquear nada del camino actual.

**Decisión pendiente de Vic:** qué registrador documentar de cara a Gate A (Cloudflare Registrar
per el plan, o replicar GoDaddy) y cuándo priorizar esta prueba en vivo, dado que no urge antes
del 21-sep pero sí antes del 13-nov.

## 2026-09-08 · Corrida en vivo del proceso de Pavel, con screenshots reales en la guía

**Quién:** cowork, en el Chrome real de Vic (`mcp__claude-in-chrome__*`), a pedido directo: "haz
nuevamente el proceso que debe hacer pavel, toma screenshots de los pasos para agregarlos en la
guia y sea mas facil entender el proceso."

**Qué:** con la extensión de Chrome conectada, se repitió de punta a punta el flujo de crear una
página nueva en el sitio de prueba `_example` (nunca en `stuart-homeowners`), capturando una
screenshot real en cada paso:

1. Listado de `sites/_example/content/` con el botón "Add file"
2. El dropdown abierto ("Create new file" / "Upload files")
3. La página de archivo nuevo con el campo "Name your file..." vacío
4. El nombre del archivo escrito: `windstorm-coverage-demo.md`
5. El editor real con el frontmatter y el contenido completo escrito (el mismo ejemplo de
   cobertura de viento que ya estaba en la guía como "worked example")
6. El diálogo "Commit changes" con las dos opciones de radio
7. La segunda opción (nueva rama) seleccionada, con el botón "Propose changes"
8. La página de comparación con el botón "Create pull request"
9. El PR con los checks corriendo (algunos en progreso, algunos ya en verde)
10. El PR con los 5 checks en verde y el comentario del bot con el link de preview
11. La página real, en vivo, en su URL, `/windstorm-coverage-demo/`, confirmando otra vez que el
    nombre del archivo se vuelve la URL sin tocar código
12. El PR cerrado con el botón "Delete branch" visible

El PR (#4) se cerró sin mergear y se borró la rama, exactamente como en las pruebas anteriores
de W-098, así que `main` queda intacto, sin el archivo de prueba. Las 12 imágenes se guardaron en
`docs/images/operator-guide/` y se insertaron en `docs/OPERATOR_GUIDE.md` junto a cada paso
correspondiente, tanto en "Editing a page that already exists" como en "Creating a brand-new
page", más una junto al worked example ya existente. El artifact "Microsite Field Guide" (misma
URL) se republicó con las mismas 12 imágenes incrustadas como data URIs en los mismos puntos del
trail visual.

**Nota:** el primer intento de conectar con el Chrome de Vic falló tres veces seguidas
("extension not connected"); Vic confirmó que había vuelto a abrir Chrome y en el siguiente
intento sí conectó. Documentado en caso de que vuelva a pasar: no hay nada que cowork pueda
hacer del lado del repo, solo esperar a que la extensión esté activa del lado de Vic.

**Decisión:** sigue sin cerrarse W-102. El criterio de cierre real sigue siendo que Pavel use la
guía en el handoff del 17-sep sin que Vic tenga que explicarle nada que ya debería estar ahí.

## 2026-09-08 · Agregado un ejemplo completo de markdown (data demo) para Pavel

**Quién:** cowork, a partir de otro pedido directo de Vic: "ocupamos poner ahi data demo para
que tenga contexto de como armar el file."

**Qué:** el contrato de frontmatter que ya estaba en la guía (título/descripción/pageType) es
correcto pero son solo tres líneas, no muestra cómo se ve una página terminada. Se agregó una
nueva subsección, "A worked example: what a finished page's markdown actually looks like", con
un archivo de ejemplo completo (frontmatter + intro + dos listas con viñetas + un link interno)
sobre cobertura de viento para Stuart, FL, seguido de un desglose que conecta cada parte del
ejemplo con una regla concreta de `docs/CONTENT_STANDARDS.md`: el detalle local real (lo que
busca el swap test), el lenguaje calificado en vez de absoluto (checklist item 3), el hecho de
que el número de licencia nunca se escribe a mano en el contenido (lo renderiza el template
desde `site.config.json`), y el link interno como ejemplo de cómo una página se enlaza desde
otra. Se agregó una advertencia explícita de que el texto es ilustrativo, no copy investigado o
aprobado, y que una página real tiene que ser escrita por Pavel, específica a ese mercado, tal
como exige Content Standards.

Se actualizaron ambos documentos: `docs/OPERATOR_GUIDE.md` y el artifact "Microsite Field Guide"
(misma URL), con el mismo ejemplo y el mismo desglose, adaptado al sistema visual existente
(bloque de código con sintaxis resaltada + cuatro tarjetas "why it's written this way").

**Pendiente, en curso:** Vic también pidió correr de nuevo el proceso real de Pavel tomando
screenshots de cada paso para insertarlos en la guía. Se intentó conectar con el Chrome real de
Vic (`mcp__claude-in-chrome__*`) y la extensión reportó "not connected" en tres intentos
seguidos. No se siguió reintentando indefinidamente. Queda bloqueado hasta que la extensión de
Chrome esté corriendo y conectada; en cuanto lo esté, se repite el flujo completo (crear una
página nueva en el sitio de prueba `_example`, capturar cada paso, insertar las imágenes en
ambos documentos, y limpiar el PR y el archivo de prueba al final, igual que en las pruebas
anteriores de W-098).

## 2026-09-08 · Republicado el artifact "Microsite Field Guide" con la mecánica de GitHub

**Quién:** cowork.

**Qué:** se republicó el artifact "Microsite Field Guide" (misma URL de siempre,
`https://claude.ai/code/artifact/3670bbad-9e8c-4683-9097-86b3ab4fac20`) reflejando el mismo
contenido agregado a `docs/OPERATOR_GUIDE.md` v1.1: un nuevo capítulo 02 ("Doing it: GitHub,
click by click, assuming nothing") con el glosario en lenguaje llano, el trail de pasos para
editar una página existente, el trail de pasos para crear una página nueva (con el bloque de
frontmatter de ejemplo y la advertencia de que ninguna página se enlaza sola), y la nota de qué
hacer si un check falla. Se preservó el sistema visual existente (Fraunces/Public Sans/IBM Plex
Mono, acento teal, theming claro/oscuro) reutilizando los componentes ya definidos (`.trail`,
`.note`) y agregando tres nuevos (`.glossary`/`.term`, `.codeblock`, `.note-warn`) en el mismo
lenguaje visual. Se renumeraron los capítulos 02→03 (Reference docs), 03→04 (Rules), 04→05
(Who to ask) y la barra de navegación superior.

**Decisión:** no se cierra W-102 con esto. El criterio de cierre sigue siendo que Pavel use la
guía en el handoff del 17-sep sin que Vic tenga que explicarle nada que la guía debería haber
cubierto.

**Nota pendiente, no bloqueante:** siguen sin subirse a `origin/main` dos commits locales de
antes de esta sesión de trabajo (`fec9c53`, `76539fb`, ambos solo documentación), más los tres
nuevos de esta sesión (`046a133`, `94185f6`, y este mismo si genera commit). Cowork no tiene
credenciales de git para hacer push desde este entorno (ver W-110 y la restricción confirmada
repetidamente). Se suben en cuanto Vic o Codex hagan el próximo push.

## 2026-09-08 · Guía de operación: agregada la mecánica de GitHub paso a paso

**Quién:** cowork, a partir de retroalimentación directa de Vic leyendo la guía publicada.

**Qué:** Vic señaló, correctamente, que `docs/OPERATOR_GUIDE.md` (y su versión publicada, la
"Microsite Field Guide") asumía que Pavel ya sabía usar GitHub: no explicaba el mecanismo dentro
de GitHub para editar una página ni para crear una nueva, y por lo tanto no era una guía
autosuficiente. Su objetivo explícito: "cualquier humano" debería poder ejecutar la misión de
Pavel usando solo la guía, sin que Vic tenga que explicarlo de nuevo.

Antes de escribir una sola palabra, se verificaron en vivo (no se inventó ningún detalle de UI)
los tres hechos técnicos que la guía necesitaba para ser precisa:

- El contrato exacto de frontmatter de una página (`packages/template/src/content.config.ts`):
  `title` requerido, `description` opcional, `pageType` requerido y limitado a
  `"home" | "content" | "coverage"`.
- La regla de enrutamiento (`packages/template/src/lib/site-data.mjs`,
  `routeFromId`): el nombre del archivo markdown (sin `.md`) se convierte automáticamente en la
  URL de la página — `flood-coverage.md` → `/flood-coverage/`. `index.md` es especial y sirve
  `/`.
- La ausencia total de un menú de navegación en `packages/template/src/layouts/BaseLayout.astro`:
  no existe ningún `<nav>` ni listado dinámico de páginas. Una página nueva es invisible salvo
  que otra página la enlace manualmente con markdown.
- Además, qué diferencia realmente `pageType: content` de `pageType: coverage` (una clase CSS,
  `.page-coverage` agrega un borde superior — no cambia el schema ni el build): para poder
  explicárselo a Pavel sin adivinar.

También se verificó en vivo, en el Chrome real de Vic ya autenticado en GitHub (sin crear ni
commitear nada), el flujo exacto de "Add file ▾" → "Create new file" y el campo "Name your
file...", para no describir botones que no existen.

Con esos hechos confirmados, se expandió `docs/OPERATOR_GUIDE.md` agregando un nuevo **Part 2**
("Doing it: GitHub, click by click, assuming nothing") entre el modelo mental (Part 1) y los
documentos de referencia (renumerados de Part 2/3/4 a Part 3/4/5). Part 2 incluye: un glosario
en lenguaje llano (repo, `main`, branch, commit, pull request, checks, merge); los pasos
exactos, botón por botón, para editar una página existente (pencil icon → editor → "Commit
changes..." → "Create a new branch for this commit and start a pull request" → "Propose
changes" → "Create pull request" → esperar los checks → abrir la URL de preview del comentario
del bot → autorevisión → "Merge pull request" → "Delete branch"); los pasos exactos para crear
una página nueva (el dropdown "Add file ▾" → "Create new file", el campo de nombre de archivo,
el bloque de frontmatter con ejemplo real, y la advertencia explícita de que ninguna página
nueva aparece en ningún menú — hay que enlazarla a mano desde otra página); y qué hacer si un
check sale en rojo (no adivinar, no tocar archivos fuera de `sites/<slug>/`, avisar a Vic con el
link del PR).

**El hueco:** exactamente el que Vic señaló — la guía v1.0 explicaba el modelo mental y las
reglas, pero no el mecanismo. Un operador sin experiencia previa en GitHub no podía, solo con
esa guía, completar el flujo real de principio a fin. Cerrado con la v1.1: cada paso de UI
citado fue verificado en vivo contra el repo real, no inventado.

**Próximo paso:** actualizar y republicar el artifact "Microsite Field Guide" (misma URL) para
reflejar este mismo contenido expandido, preservando su sistema visual existente. Sigue abierto
W-102 hasta que Pavel confirme, en el handoff del 17-sep, que la guía efectivamente le resolvió
estas dudas sin que Vic tuviera que explicarlo de nuevo — ese es su criterio real de cierre.

Log histórico de decisiones, sesiones y ejecuciones. Orden cronológico inverso.
El agente ejecutor solo agrega su propia entrada al cerrar un prompt; no edita entradas anteriores.

---

## 2026-09-08 · W-098 cerrado: la prueba real se repitió y esta vez sí funcionó de punta a punta

**Quién:** cowork, con el navegador de Vic (ya autenticado en GitHub) tras confirmar que W-110
sincronizó `main`.

**Qué:** exactamente la misma prueba de la mañana — editar `sites/_example/content/index.md`
directo en github.com, sin terminal, y abrir PR (#3) contra el repo real — pero esta vez con el
`preview.yml` real ya en GitHub. Resultado: `Preview deploy` **no se saltó**. Corrió sus dos
jobs, desplegó a `wicfl-pr3-_example.wicfl-microsites.workers.dev`, y comentó la URL en el PR con
el formato exacto que describe el workflow. Se visitó la URL directamente: el sitio renderizaba
el texto de prueba insertado, verbatim. Se cerró el PR y se confirmó que `preview-cleanup.yml`
corrió y borró el Worker — la misma URL devolvió 404 de Cloudflare segundos después. Rama
borrada.

**Decisión:** W-098 queda cerrado. Las cinco piezas que prometía (descubrir sitios cambiados,
validar, construir, desplegar a un Worker efímero, comentar la URL, limpiar al cerrar) están
verificadas contra el repo real, no contra una copia local — que era exactamente el hueco que
esta misma prueba encontró en la mañana. El camino de respaldo para Pavel (editar en
github.com, sin terminal, sin git instalado) queda confirmado funcional de punta a punta.

**El hueco:** ninguno nuevo. Es el cierre del ciclo abierto hoy: duda de Vic → prueba real →
hallazgo (W-110) → sincronización (Codex, prompt 009) → repetición de la prueba → confirmado.
Con esto, ya no hay reserva técnica pendiente para mandarle `docs/OPERATOR_GUIDE.md` (o su
versión en artifact) a Pavel.

---

## 2026-09-08 · W-110 cerrado: `main` sincronizado con GitHub (Prompt 009)

**Quién:** agente ejecutor (Codex), siguiendo `prompts/2026-09-08_009_sincronizar-main-con-origin.md`.

**Qué:** se verificó el árbol limpio, se hizo `git fetch origin` y se confirmó un fast-forward limpio: `origin/main` (`09732ab`) era ancestro de `main` (`03f2ff2`). Se ejecutó `git push origin main` sin force, rebase, merge ni reescritura. Tras un segundo fetch, ambos refs quedaron en `03f2ff2537e704c1696905439e28d831bb756a8e`.

**Verificación:** la corrida [Validate and build #34252815726](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/34252815726) terminó verde para ese SHA; validó los configs y construyó `_example` y `stuart-homeowners`. No se modificaron código, configuración, template ni workflows. Reporte: `reports/2026-09-08_009_sincronizar-main-con-origin.md`.

**Decisión y siguiente paso:** W-110 queda cerrado. Ya puede correr el prompt 008; W-098 permanece abierto hasta repetir su PR real y confirmar que el workflow de preview ahora sí despliega y comenta la URL en GitHub.

---

## 2026-09-08 · Prompt 009 para el ejecutor: empujar los 17 commits pendientes (W-110)

**Quién:** cowork, a petición de Vic — quiere que sea Codex quien haga el push, no él a mano,
porque Codex corre con sus credenciales reales y deja rastro en `reports/`.

**Qué:** primer intento de correr `prompts/2026-09-08_008_formulario-carga-contenido.md`
confirmó exactamente el hallazgo de la prueba del PR: Codex se detuvo en el paso 1 porque
`main` local (`dc76626`) no coincidía con `origin/main` (`09732ab`), tal como el prompt le pedía
hacer. Comportamiento correcto, no un error — el candado funcionó.

Se escribió `prompts/2026-09-08_009_sincronizar-main-con-origin.md`, exclusivamente para esa
sincronización: `git fetch`, verificar que es un fast-forward limpio (`git status` ya confirmaba
"ahead by 17 commits" sin mensaje de divergencia), `git push origin main` sin force, y cerrar
W-110. Restricciones explícitas de no usar `--force`, no hacer rebase/merge/amend, y no tocar
ningún archivo de código — es una operación de git pura. Si al correrlo el fast-forward ya no es
limpio (alguien más escribió a `origin/main` mientras tanto), el prompt le pide a Codex detenerse
y reportarlo, no resolverlo por su cuenta.

**El hueco:** ninguno nuevo. Es la ejecución directa de lo que W-110 ya pedía, ahora con el
ejecutor correcto (Codex, con credenciales) en vez de intentarlo desde el bridge de Cowork, que
no las tiene.

---

## 2026-09-08 · Prompt 008 para el ejecutor: formulario mínimo de carga de contenido (W-111)

**Quién:** cowork, siguiendo la conversación con Vic sobre si construir una interfaz de gestión
amigable.

**Qué:** Vic preguntó directamente qué opinaba cowork de construir una interfaz sobre el modelo
actual, dado que el flujo de git/PR — aunque probado y funcional (ver la entrada de arriba) — le
sigue pareciendo poco amigable para Pavel, y él mismo dijo no terminar de entenderlo del todo.
Respuesta de cowork: no un CMS completo ahora — es literalmente la Fase 7 que ya describe el
diagrama de `docs/ARCHITECTURE.md`, adelantarla completa cuesta semanas que compiten contra el
17-sep y el 9-oct. Sí vale la pena una versión mínima: una sola página donde Pavel llena los
campos del config y pega markdown, sin ningún concepto de git, que por detrás abre el mismo pull
request que hoy se abriría a mano. Vic estuvo de acuerdo ("lo del form creo que es buena idea").

Se abrió **W-111** y se escribió `prompts/2026-09-08_008_formulario-carga-contenido.md` para el
agente ejecutor, con las restricciones duras de siempre (el schema es el contrato, no toca el
template ni los workflows existentes, no automergea, token con alcance acotado) y una
dependencia explícita: no puede ejecutarse hasta que **W-110** esté cerrado, porque el prompt le
pide al ejecutor confirmar `main` sincronizado con `origin/main` como primer paso, y detenerse si
no lo está — exactamente el hueco que encontró la prueba de hoy.

**El hueco:** ninguno nuevo — este ítem es la respuesta directa a la fricción real que ya se
había documentado (Vic sin entender bien el flujo, la duda de si Pavel puede operar vía
terminal). Queda explícito en el backlog que **no bloquea el 21-sep**: el camino de respaldo
(editar en github.com sin terminal) ya está probado y sigue siendo válido mientras este
formulario no exista.

---

## 2026-09-08 · Prueba real de W-098 con un PR de verdad: el mecanismo funciona, pero GitHub corre código viejo (W-098, W-110)

**Quién:** cowork, a petición explícita de Vic — "hagamos el test antes de mandarle la guía a Pavel".

**Qué:** en vez de opinar sobre qué tan amigable es el flujo de Pavel, se corrió de verdad. Con el bridge conectado
al navegador de Vic (ya con sesión iniciada en GitHub), se editó `sites/_example/content/index.md` directo en
github.com — sin terminal, sin clonar nada, solo el editor web — y se usó el flujo "Create a new branch and start
a pull request" para abrir el PR #2 contra el repo real.

Resultado, con evidencia:
- **`Validate and build` corrió y pasó de punta a punta:** valida las configs de todos los sitios, descubre cuáles
  cambiaron, construye `_example`. Esta mitad del pipeline sí está viva en GitHub, tal como está documentada.
- **`Preview deploy` se saltó ("skipped").** El motivo no es un bug del workflow: el `preview.yml` que corre en
  GitHub hoy es una versión vieja, un stub que literalmente dice "Disabled branch preview until Cloudflare exists".
  La versión real — la que describe `BACKLOG.md` en W-098 como "Activado, no en `if: false`", con Worker efímero,
  comentario con URL y limpieza automática — existe solo en el `main` local de Vic. Nunca se subió.

Se confirmó por qué: `git log` muestra el local 15 commits adelante de `origin/main` (el último commit en GitHub
tiene 4 días). Ahí adentro va W-014 completo (pods, `wrangler.pod-1.toml`), la reescritura de W-098, W-109 (logo)
y la documentación actualizada de hoy (`OPERATOR_GUIDE.md`, `SETUP.md`). Todo eso es real y está bien construido —
ya se había verificado localmente — pero **invisible para GitHub, para Kevin, y para Pavel**, porque vive solo en
una laptop. Cowork intentó `git push` dos veces desde el bridge (antes y después de que Vic iniciara sesión en
Chrome) y ambas fallaron igual: `fatal: could not read Username for 'https://github.com'` — el bridge no tiene
credenciales de git, y eso es independiente de que Chrome tenga sesión iniciada. Hace falta que Vic lo empuje él
mismo, como ya ha hecho antes.

**El hueco:** `BACKLOG.md` describía W-098 y W-014 como si ya funcionaran en producción, y en el sentido que
importa — lo que corre cuando alguien más que Vic abre un PR — no era cierto todavía. Sin esta prueba, la primera
vez que eso se hubiera notado habría sido con Pavel operando solo el 21 de septiembre, viendo un mensaje de
"Disabled" en su primer pull request. Se abrió **W-110** para cerrar la sincronización, y se anotó en W-098 que no
se manda la guía ni se agenda el handoff del 17 hasta que el PR de prueba se repita en verde con el código real ya
en GitHub. El PR #2 se cerró y su rama se borró en cuanto se confirmó el hallazgo — no llegó a desplegar nada.

De paso, la prueba también contestó la duda de Vic sobre si Pavel necesita terminal: no. Todo el edit-branch-PR se
hizo desde el navegador, sin instalar nada. Eso sigue siendo cierto independientemente de W-110.

---

## 2026-09-04 · W-105: checklist del vault, no se pudo montar (correcto — no es tarea de cowork)

**Quién:** cowork, siguiendo con W-105 tras cerrar W-014

**Qué:** Vic pidió seguir con W-105 (montar el vault compartido, urgente desde el 1 de
septiembre, bloqueando W-010). Al revisar el repo se confirmó que sigue sin existir: no hay
ninguna nota de cierre en `BACKLOG.md` ni en entradas anteriores de esta bitácora, todas dicen
"lo monta Vic" sin confirmar que se haya hecho.

Cowork no puede montarlo: crear la cuenta del vault (Bitwarden o 1Password) y mover contraseñas
ahí dentro son dos acciones que tiene prohibidas siempre, incluso pedidas explícitamente. En vez
de intentarlo, se escribió `docs/VAULT_SETUP_CHECKLIST.md` — qué vault elegir, qué entradas crear
y cómo nombrarlas (buzón rotado primero, después las credenciales de Cloudflare que trae W-010),
y a quién compartir la colección (Kevin como segundo Super Admin, por la regla de
`docs/ACCOUNTS_AND_ACCESS.md`) — para que el montaje real sea ejecución mecánica para Vic, no una
decisión más que tomar bajo presión.

**El hueco:** este es distinto a los anteriores de la sesión — no es que falte una prueba externa
o el juicio de Pavel, es que la acción en sí no le corresponde a cowork ejecutarla. Sigue abierto
hasta que Vic lo monte; no se cierra por escribir la guía.

---

## 2026-09-04 · Pavel preguntó por el logo, y no existía manera de agregarlo (W-109)

**Quién:** cowork, a partir de una pregunta real de Pavel en el chat del equipo

**Qué:** Kevin le pasó el link del demo de Stuart Homeowners a Pavel. Su primera pregunta,
mirando el sitio: "How can we add the logo and the graphic elements?" Al revisar el template
para responder, la respuesta honesta era que no había manera: `BaseLayout.astro` renderizaba
`site.brand.name` como texto plano en el header y no existía ningún campo de logo en el schema,
ni ningún mecanismo para meter un archivo de imagen por sitio. No era un descuido raro — el
schema documenta a propósito que el theme se queda en tokens acotados (variante + color de
acento) para no abrir la puerta a CSS o componentes por sitio, y un logo nunca se había puesto
sobre la mesa hasta que Pavel lo preguntó viendo el resultado real.

Se cerró la parte técnica en el momento, en vez de dejarlo como "no se puede todavía":

- `brand.logo` opcional en el schema, ruta relativa (`/logo.svg`). Opcional a propósito: ningún
  config existente se rompe por no tenerlo.
- `BaseLayout.astro` renderiza `<img>` si existe, el wordmark de texto de siempre si no.
- `build-site.mjs` ahora copia `sites/<slug>/public/` sobre el output del build, así que el
  archivo del logo vive en el propio directorio del sitio del operador — no en el config (un
  JSON no es lugar para un binario) ni en el template compartido (seguiría siendo de un solo
  sitio si viviera ahí).

Probado de punta a punta: un SVG de prueba en `sites/_example/public/logo.svg` (queda ahí
permanente, mismo patrón que el fixture bilingüe), build limpio, el `<img>` aparece con el `src`
y `alt` correctos en el HTML generado. Se verificó también que `stuart-homeowners`, que no tiene
el campo, sigue renderizando exactamente el mismo wordmark de texto que antes — sin regresión.
`npm run check` y el build completo del pod, verdes.

**Bug de entorno encontrado en el camino, no de código:** el primer intento de build falló con
`EPERM: operation not permitted, unlink` sobre un archivo de una build anterior — el bridge del
escritorio no puede borrar sin permiso explícito del usuario, y `dist/` tenía residuos de builds
de sesiones previas. Se pidió permiso de borrado, se limpió `dist/` y el build corrió limpio.
Ya está anotado en `CLAUDE.md` como limitación conocida; se repitió acá.

**Lo que sigue bloqueado, y de quién:** el mecanismo ya existe; lo único que falta es que Kevin
entregue el archivo real del logo (W-008, vencido hoy). Se anotó la conexión en W-008 mismo para
que no se lea como dos problemas separados.

Commit pendiente de este mismo movimiento.

**El hueco:** de nuevo, ejecución por chat en vivo sin prompt/reporte formal — pero en este caso
particular vale la pena decirlo distinto: la pregunta llegó de Pavel, no de Vic, y la respuesta
completa (no solo la explicación, el código que la resuelve) salió antes de que Vic tuviera que
contestarle nada. Es exactamente el tipo de dependencia que el handoff busca cortar, aplicado
antes de que Pavel siquiera tenga acceso al repo.

---

## 2026-09-04 · `docs/OPERATOR_GUIDE.md`: la guía de Pavel, avance de W-102

**Quién:** cowork, a pedido de Vic

**Qué:** W-102 llevaba abierto desde el 28 de agosto con un diagnóstico ya escrito: la confusión
de Pavel no era técnica. Su propio documento de planeación proponía contenido generado desde
briefs de IA y sitios construidos a mano, o sea que se imaginaba un trabajo distinto al que este
framework asume. El ítem se separó en dos tiempos — orientación primero, capacitación técnica
después — porque la segunda parte dependía de que el schema y el repo existieran. Ya existen los
dos, así que hoy se escribieron ambas partes juntas en `docs/OPERATOR_GUIDE.md`:

- **La orientación** nombra directo las dos señas del documento de Pavel que chocan con la
  realidad del framework — contenido desde briefs, sitios armados a mano — y explica por qué
  ninguna de las dos era un error suyo: nadie se lo había dicho antes de que lo escribiera. Deja
  claro qué toca (`sites/<slug>/site.config.json` y su `content/`) y qué nunca toca (el template
  compartido, el schema, los scripts, los workflows, y el `sites/` de cualquier otro).
- **La guía técnica** describe los cinco pasos de una semana real durante el sitio #1 (brief →
  escribir markdown corriendo `differentiation-audit` por página → push de rama → preview
  automático → checklist de QA → merge), con una tabla de qué documento de referencia abrir para
  qué, en vez de repetir el contenido de `docs/SITE_CONFIG_SCHEMA.md`, `docs/CONTENT_STANDARDS.md`
  o `docs/QA_CHECKLIST.md` y arriesgar que se desincronicen.

**De paso, un hallazgo:** `docs/SETUP.md`, al que la nueva guía apunta para el pipeline de
deploy, seguía diciendo que los preview deploys estaban "intencionalmente desactivados" — cierto
hasta ayer, falso desde que W-098 los activó hoy mismo. Se actualizó para describir la realidad
actual: preview deploys en vivo, producción construida pero apagada a propósito
(`deploy.yml` en `if: false`) hasta que un sitio real no tenga datos de placeholder. Se agregaron
`OPERATOR_GUIDE.md`, `SETUP.md` y `QA_CHECKLIST.md` al índice de `docs/README.md`, que no los
tenía listados.

Commit pendiente de este mismo movimiento.

**El hueco:** esto no cierra W-102. El criterio real de cierre es si la guía responde las
preguntas de Pavel sin que Vic tenga que volver a explicarlo — y eso no se sabe hasta que Pavel
la lea, lo cual todavía no pasó. W-028 (la sesión de orientación en vivo, 17-sep) sigue abierta
también. Y de nuevo, ejecución por chat en vivo sin prompt/reporte formal.

---

## 2026-09-04 · Revisión contra el plan maestro: dónde estamos y qué falta

**Quién:** cowork, a pedido de Vic. Releyó el documento original del 24 de agosto (la respuesta
completa a Kevin sobre arquitectura, riesgo y costos) y lo cruzó contra el estado real del repo
hoy, no contra la memoria de la sesión — `BACKLOG.md`, `docs/ARCHITECTURE.md`,
`docs/SCHEDULE.md`, `docs/GATE_B_MODEL.md`, `docs/COST_MODEL.md` y `docs/master-file-source.html`
de punta a punta.

**Veredicto general: en camino, y en varios puntos más riguroso que el plan original.** Los siete
puntos técnicos del documento del 24 de agosto están construidos o deliberadamente diferidos con
una razón escrita. El modelo de costos se verificó y mejoró (GoTo salió cinco veces más barato de
lo que el rango de comparables temía). La secuencia de riesgo (fábrica + pilotos con gate, en vez
de ir directo a 100) no solo se mantuvo, se volvió más estricta: dos gates separados (A técnico,
B comercial) en vez de uno, con un modelo explícito para que el número de Gate B no se invente
después de ver los datos. Eso es exactamente lo que el documento original pedía y algo más.

### Los siete puntos, uno por uno

1. **Cloudflare Workers con Static Assets, no Pages.** Construido. Coincide.
2. **Astro sobre HTML plano.** Construido: content collections, i18n nativo, cero JS por
   defecto, build dirigido por config.
3. **Un monorepo, no 100 repos.** Construido. El schema de `site.config.json` es exactamente lo
   que el documento pedía que fuera: "el artefacto más importante del proyecto," congelado desde
   el 31 de agosto (W-020).
4. **Deploys y dominios automatizados vía API.** Diferido a propósito a la Fase 7
   (16 nov–11 dic), no construido todavía (W-050 a W-054). Esto es fiel a la decisión ya escrita
   en `docs/ARCHITECTURE.md` ("Generator timing": automatización pesada espera a después del
   sitio #3), no un hueco. Lo que sí construimos hoy fue la agrupación en pods de ~25 sitios por
   Worker que el documento original recomendaba (W-014, cerrado hoy). **Desviación real, ya
   documentada:** el dominio del sitio #1 se compró directo en GoDaddy, no vía Cloudflare
   Registrar como fijaba el plan; se conectó por nameservers, así que DNS/SSL/hosting siguen
   centralizados en Cloudflare, solo el registro en sí quedó afuera.
5. **Swap test como gate de CI.** Diferido a propósito a mediados de octubre (W-027), cuando
   exista contenido del sitio #2 contra el cual comparar. Mientras tanto, protección humana: la
   skill `differentiation-audit`, que corre por página mientras se escribe, no al final. Coincide
   con la razón que el propio documento da para el riesgo de doorway pages.
6. **Techo de automatización (~95% infraestructura, ~0% contenido).** Completamente asimilado:
   `docs/SCHEDULE.md` ya nombra que Pavel sostiene tres roles a la vez y que el contenido es el
   cuello de botella real, no la fábrica, y que eso se revisita en Gate B en vez de ser una
   sorpresa.
7. **Costos verificados.** El modelo de agosto tenía la pieza más grande del presupuesto sin
   confirmar (GoTo, con un rango de $6,000 a $18,000/año según comparables). Se resolvió el
   25 de agosto con cotización escrita de GoTo: **$0.99/número**, $1,188/año a 100 números, la
   quinta parte del piso del rango temido. `docs/COST_MODEL.md` está verificado y con fuente y
   fecha en cada línea, como pide el documento original. Sí conviene una re-verificación antes de
   cualquier compra real de dominios en volumen: el alza de Verisign de $10.97 a como tal ya
   está confirmada para el 1 de noviembre, faltan ocho semanas.

### División del trabajo: Opción A, en marcha

El documento proponía elegir entre Opción A (construimos la fábrica, Pavel la opera después) y
Opción B (asesoría, Pavel construye). Nunca hay una respuesta escrita de Kevin eligiendo una,
pero la ejecución real desde el 25 de agosto es Opción A sin ambigüedad: cowork construyó el
template, el schema, el generador, el pipeline de CI/CD, los gates de validación y ahora el
Worker de producción. Lo que el documento descartaba explícitamente (que nosotros seamos dueños
del contenido o de la operación diaria) también se respetó: W-095 decidió que Pavel se
autorrevisa, no que Vic o cowork revisen su contenido.

### Riesgos reales encontrados al cruzar contra el plan, no resueltos con solo mirar

**1. El riesgo central del documento (doorway pages) tiene un cabo suelto vivo.** El plan es
explícito: Pavel valida el nicho por SEO (W-016) *antes* de que se compre un dominio. En los
hechos, el nicho y el dominio del sitio #1 llegaron directo de Kevin por el chat de Zoom el
3 de septiembre y se aprobaron (W-007) sin que conste que W-016 haya corrido. Esto ya estaba
anotado como riesgo en la nota de W-007, pero W-016 mismo seguía sin ninguna nota de estado,
así que no era visible al mirar solo ese ítem. Se le agregó una nota hoy (ver abajo) para que no
dependa de leer W-007 para encontrarlo. Sigue siendo barato de arreglar ahora, corriendo la
validación en retroactivo antes de que Pavel escriba contenido real; se vuelve caro si se
descubre en Gate B con contenido ya publicado.

**2. W-006 (Google Business Profile para los pilotos) lleva 7 días vencido.** Debía resolverse
el 28 de agosto. El propio documento marca esta decisión como la que "puede cambiar qué nichos
son viables en absoluto," y ya se aprobó un nicho y un dominio sin que esté resuelta. No bloquea
nada hoy porque Pavel no escribe contenido hasta el 21 de septiembre, pero cuanto más tarde,
menos margen para elegir un nicho distinto si la respuesta cambia algo.

**3. W-010/W-105 (cuenta real de Cloudflare con gobierno) vence hoy y sigue bloqueada.** Fase 1
cierra hoy, 4 de septiembre, y la cuenta con dos Super Admins, 2FA y recovery codes en vault
compartido —la pieza que el propio `docs/ACCOUNTS_AND_ACCESS.md` llama "el activo del
negocio"— no está montada. No es una desviación nueva, ya estaba anotada, pero cruzarla contra
la fecha del plan la hace más urgente de lo que se veía item por item.

**4. `docs/master-file-source.html` (la página que de verdad leen Kevin y Pavel) está
desactualizada frente al `BACKLOG.md` real.** Su tabla de "Open items" todavía marca como
abiertos varios puntos que `BACKLOG.md` ya tiene cerrados: quién revisa el contenido (W-095,
cerrado 3-sep), si existe org de GitHub (W-094, cerrado 26-ago) y qué CRM usa WICFL (W-096,
cerrado 26-ago). Si Kevin abre esa página hoy, ve tres bloqueadores que ya no existen. Se agregó
**W-108** al backlog para refrescar esa tabla contra la realidad y republicar, en vez de dejarlo
como una desviación silenciosa entre "lo que dice la página" y "lo que dice el repo."

### Lo que se actualizó en el backlog a partir de esta revisión

- **W-016**: nota nueva, cruzando el hallazgo de arriba para que sea visible desde el ítem mismo.
- **W-006**: nota nueva, marcando el vencimiento y por qué importa cada día que pasa sin
  respuesta.
- **W-108** (nuevo): refrescar `docs/master-file-source.html` contra `BACKLOG.md` y republicar.
- Encabezado de `BACKLOG.md` actualizado a esta revisión.

**El hueco:** de nuevo, análisis y decisiones ejecutadas por chat en vivo sin prompt/reporte
formal — pero esta vez el propósito explícito de Vic era exactamente parar esa dependencia:
todo lo de arriba queda escrito acá y en `BACKLOG.md`, no solo en el contexto de esta
conversación.

---

## 2026-09-04 · W-014 cerrado: `wrangler.toml` real con arquitectura de pods

**Quién:** cowork, siguiendo con los pendientes que se pueden avanzar sin depender de Kevin ni
Pavel, con confirmación de Vic sobre el alcance (arquitectura de pod desde ya, no un Worker
simple a migrar después)

**Qué:** `docs/ARCHITECTURE.md` ya tenía decidido "pods de ~25 sitios por Worker" (no un Worker
por sitio, para no multiplicar deploys al escalar; no un Worker para todo, para que un mal deploy
no tumbe el portafolio completo). Faltaba construirlo. Se le preguntó a Vic si montarlo completo
desde ahora (con un solo sitio real todavía) o algo simple para Site #1 y migrar después; eligió
montarlo completo desde ahora.

Un binding de Workers Static Assets solo sirve un árbol de directorios, así que servir varios
sitios desde un mismo Worker necesita un script que decida cuál sitio responde en cada request.
Quedó así:

- `pods/pod-1.json` — qué slugs entran en cada pod. Hoy solo `stuart-homeowners`; sumar Site #2
  es agregar su slug acá.
- `scripts/build-pod.mjs` — construye cada sitio del pod y arma `dist/pods/<pod>/`.
- `scripts/pod-worker-template.mjs` — el Worker de enrutamiento: lee el header `Host`, lo mapea a
  un slug, reescribe la ruta y se la pasa a `env.ASSETS.fetch()`. Se verificó con un test
  standalone (mockeando `ASSETS.fetch`) que enruta bien por dominio raíz, `www` y mayúsculas del
  host, y devuelve 404 en un host no configurado.
- `wrangler.pod-1.toml` — el config real: nombre del Worker, el `worker.mjs` generado como
  `main`, el directorio de assets del pod, y un par de `[[routes]]` (raíz + `www`,
  `custom_domain = true`) por sitio del pod.
- `deploy.yml` — ahora construye y despliega el pod real en vez del placeholder `_example` que
  tenía desde antes de que existiera este pipeline; el gate de W-103 ahora revisa cada sitio que
  de verdad está en `pods/pod-1.json`. De paso se corrigió un bug pendiente desde el 2 de
  septiembre: los filtros de ruta de `deploy.yml` no coincidían con los de `ci.yml`
  (`package.json`, `package-lock.json`, `packages/config-schema/**` faltaban), lo que iba a
  permitir que un cambio de dependencias pasara CI en verde y se saltara la validación antes de
  un deploy real.

Se probó armando el pod de verdad (`npm run build:pod -- pod-1`) y corriendo el gate de W-103
contra `stuart-homeowners`: rechaza el sitio correctamente, porque todavía tiene licencia,
contacto y analytics de mentira mientras es el demo de Kevin. `deploy.yml` sigue en `if: false`
por esa misma razón — se activa cuando esos datos sean reales y Vic decida lanzar.

Un bug real se encontró y corrigió en el camino: la primera versión de
`scripts/pod-worker-template.mjs` repetía el marcador `__WICFL_POD_ROUTES__` dentro de un
comentario explicativo, y `String.replace()` solo reemplaza la primera coincidencia — el mapa de
rutas terminó inyectado en el comentario en vez de en el código, dejando el archivo generado con
sintaxis inválida. Se encontró al inspeccionar el `worker.mjs` generado, no al confiar en que el
build "pasó".

Commit `6298138` (código) + el de este cierre de bitácora/backlog, sin prompt/reporte formal.

**El hueco:** de nuevo, ejecución por chat en vivo sin prompt/reporte formal. Distinto de W-098:
acá lo que falta no es una prueba externa, es que Site #1 tenga datos reales — el pipeline técnico
ya está completo y verificado.

---

## 2026-09-04 · W-098: preview deploys por rama construidos y activados (falta probar con PR real)

**Quién:** cowork, siguiendo la instrucción de Vic de seguir con los pendientes que se pueden
avanzar sin depender de Kevin ni Pavel

**Qué:** Se reescribió `preview.yml` completo y se agregó `preview-cleanup.yml` nuevo. Con esto,
cuando Pavel abra un pull request con cambios de contenido, el workflow descubre qué sitios
cambiaron (mismo mecanismo que ya usa `ci.yml`), los construye, y despliega cada uno a su propio
Worker efímero (`wicfl-pr<N>-<slug>.wicfl-microsites.workers.dev`) usando el flag `--assets` de
wrangler, sin necesitar un `wrangler.toml` por sitio. La URL se comenta en el pull request y se
actualiza en el mismo comentario en cada push nuevo, no se repite. `preview-cleanup.yml` borra ese
Worker cuando el PR se cierra, para que no se acumulen contra el límite de 100 Workers de la
cuenta gratuita.

No lleva el gate de W-103 (validación de producción) a propósito: Pavel va a iterar
legítimamente con campos pendientes (analytics, teléfono, licencia) mientras escribe, y ese gate
solo debe bloquear el deploy real a producción.

Queda **activado** (no en `if: false`) porque Cloudflare ya está verificado funcionando de punta
a punta con el demo de Stuart, y la única forma real de confirmar que este flujo funciona
(descubrir → construir → desplegar → comentar → limpiar al cerrar) es con un pull request real —
la misma lección del smoke test del demo, que solo reveló los problemas reales (registro del
subdominio workers.dev, error 10007 de consistencia eventual) al correrlo de verdad y no antes.

Commit `cef4b6f`, sin prompt/reporte formal.

**El hueco:** falta probar con un pull request real para confirmar que el flujo completo funciona
de punta a punta; no se está dando por cerrado en BACKLOG.md todavía. Sigue además, como en cada
entrada de esta sesión, la ejecución por chat en vivo sin prompt/reporte formal.

---

## 2026-09-04 · W-022 y W-103 cerrados, avanzando en Bloque A sin convocar al equipo todavía

**Quién:** cowork, trabajando en pendientes de infraestructura mientras Vic decide cuándo mostrar
avance al equipo

**Qué:** Vic pidió seguir sacando pendientes del Bloque A (lo que Pavel necesita para el handoff
del 18 de septiembre) antes de convocar a nadie, y mostrar todo junto con instrucciones
específicas cuando esté listo. Se cerraron dos items:

**W-022, ruteo bilingüe.** Solo los locales no-primarios llevan prefijo de URL; ningún sitio
piloto real cambia de ruta porque ambos tienen `alternates: []`. Se ejercitó dándole a
`sites/_example` (ya configurado bilingüe desde antes) contenido real en español. Se encontró un
bug real en el camino: el glob loader de Astro colapsa `content/es/index.md` al id `"es"`, no
`"es/index"` como asumía la primera versión, lo que rompía tanto la ruta (quedaba `/es//`, con
doble slash) como el cruce de `hreflang` entre idiomas. Corregido y verificado con capturas del
HTML generado para las 5 páginas del fixture (home y about en ambos idiomas, coverage solo en
inglés a propósito, para probar también el caso sin contraparte).

**W-103, gate de validación de producción.** `scripts/check-production-config.mjs` rechaza
patrones de placeholder conocidos en el config de un sitio real antes de que llegue a un deploy
de producción; exento para `sites/_*`. Conectado en `deploy.yml`, no en `preview.yml`, porque
Pavel itera legítimamente con campos pendientes durante Fase 3. Probado contra el demo de
`stuart-homeowners` (falla, correctamente) y un config limpio de prueba (pasa).

Commit `b46f972`, sin prompt/reporte formal.

**El hueco:** sigue siendo ejecución por chat en vivo, sin prompt/reporte formal.

---

## 2026-09-04 · Demo de Stuart homeowners para Kevin, en preview

**Quién:** cowork, con aprobación de Vic en cada paso

**Qué:** con el dominio ya activo en Cloudflare, se armó `sites/stuart-homeowners/` para cumplir la
promesa hecha a Kevin de mostrarle una demo en cuanto el dominio estuviera listo, sin esperar a
W-008 (assets de marca reales) ni a la validación retroactiva de W-016. `site.config.json` usa el
nicho real que Kevin asignó (homeowners, alto valor, frente al agua, costero, Stuart FL) con marca,
teléfono, email y license number todos marcados sin ambigüedad como placeholder (`(Demo)` en el
nombre de marca, `PLACEHOLDER-FL-LICENSE-PENDING-W-008` en la licencia), siguiendo el mismo patrón
que ya usaba el fixture `_example`. El contenido de las 3 páginas explica en texto que es una demo
interna, no marketing publicado.

**Por qué no se sirve en el dominio real:** el checklist de `CONTENT_STANDARDS.md` pone el número de
licencia como punto #1, y W-008 bloquea explícitamente publicar el sitio #1 sin esos datos reales.
Publicar un license number inventado en el dominio público real, aunque sea "solo una demo", es
riesgo de publicidad engañosa. Se resolvió desplegando solo al subdominio de preview de Cloudflare
Workers (`*.workers.dev`, vía un `wrangler.stuart-homeowners.toml` sin rutas ni dominio custom) en
vez de apuntarlo a `stuarthomeownersinsurance.com`.

**De paso:** se encontró que `validate:configs` en `package.json` solo validaba
`sites/_example/site.config.json` a mano, así que CI nunca había validado ningún otro sitio,
incluyendo este nuevo. Se corrigió a un glob (`sites/*/site.config.json`) que cubre cualquier sitio
que exista.

**Qué falta:** Vic hace `git push`, luego dispara manualmente el workflow
`deploy-stuart-homeowners-demo.yml` desde GitHub Actions (workflow_dispatch, mismo patrón que el
smoke test), y comparte el link `*.workers.dev` resultante con Kevin.

**El hueco:** sigue siendo ejecución por chat en vivo, sin prompt/reporte formal.

---

## 2026-09-04 · StuartHomeownersInsurance.com activo en Cloudflare

**Quién:** Vic, con Kevin ejecutando el lado de GoDaddy; registrado por cowork

**Qué:** Kevin le dio a Vic acceso de delegado a su cuenta de GoDaddy (Delegate Access, sin
compartir contraseña). Con ese acceso, Vic cambió los nameservers del dominio de los de
GoDaddy (`ns77`/`ns78.domaincontrol.com`) a los que Cloudflare había asignado
(`ashley.ns.cloudflare.com` / `ram.ns.cloudflare.com`), desde Dominios → DNS → Servidores de
nombres → Cambiar servidores de nombres → Usaré mi propio servidor de nombres. La propagación
fue casi inmediata: el dashboard de Cloudflare ya muestra "Your domain is now protected by
Cloudflare" con SSL/TLS y proxy activos.

**Qué falta:** el dominio sigue registrado en GoDaddy, solo se movió el DNS. Los 2 registros A
todavía apuntan al parking de GoDaddy, hay que reemplazarlos cuando exista un Worker real para
este dominio (W-013/W-014), y borrar el CNAME `_domainconnect` que ya no sirve. También queda
revisar el modo de encriptación SSL/TLS antes de apuntar el dominio al Worker.

**El hueco:** sigue siendo ejecución por chat en vivo, sin prompt/reporte formal.

---

## 2026-09-03 · Zona de Cloudflare creada para StuartHomeownersInsurance.com

**Quién:** Vic, en vivo por el dashboard de Cloudflare; registrado por cowork

**Qué:** Con el dominio ya comprado por Kevin en GoDaddy (ver entrada anterior), Vic corrió
"Add a Site" en Cloudflare en vez de pedir acceso a la cuenta de GoDaddy, específicamente para
generar los nameservers propios del dominio sin tocar credenciales de Kevin. Se dejaron los
valores por defecto de política de bots de IA (Search=Allow, Agent=Allow, Training=Block en
páginas con ads, Block training en robots.txt=ON) y la importación automática de DNS. Cloudflare
detectó GoDaddy como registrador y asignó `ashley.ns.cloudflare.com` y `ram.ns.cloudflare.com`
para reemplazar `ns77.domaincontrol.com` / `ns78.domaincontrol.com`.

**Qué falta:** Mandar esos dos nameservers a Kevin para que los cambie él mismo en GoDaddy (ver
BACKLOG.md W-011). Solo después de que Kevin confirme el cambio, Vic da clic en "I updated my
nameservers" del lado de Cloudflare. Una vez propague, reemplazar los 2 registros A que hoy
apuntan al parking de GoDaddy por el Worker real, y borrar el CNAME `_domainconnect` que ya no
sirve para nada.

**El hueco:** igual que la entrada anterior, esto se está ejecutando por chat en vivo, sin
prompt/reporte formal en `prompts/`/`reports/`. Se documenta aquí para no perder el rastro.

---

## 2026-09-03 · Kevin destraba pago y dominio del sitio #1 (con un hueco de proceso)

**Quién:** Kevin, por el chat de Zoom; registrado por cowork

**Qué:** Kevin confirmó el método de pago capturado (W-093, cerrado) y anunció que
**StuartHomeownersInsurance.com ya está comprado** ("we own it"), con el nicho asignado
directo por él a Pavel: homeowners insurance en Stuart, enfocado en propiedades de alto valor,
frente al agua y costeras. Dijo que el número de teléfono único llega después (toca a W-024
cuando exista).

**El hueco:** `docs/ARCHITECTURE.md` fija el orden a propósito: W-016, la validación SEO de
Pavel, corre **antes** de comprar cualquier dominio, precisamente para no gastar en un mercado
dominado por agregadores sin ángulo local. No hay evidencia de que corriera antes de esta
aprobación; Kevin fue directo de decisión a compra. El nicho que llegó ya es específico
("alto valor, frente al agua, costero"), lo que baja el riesgo respecto al escenario que
`ARCHITECTURE.md` describe, pero no lo reemplaza. No es motivo para frenar nada, sí para que
Pavel corra W-016 en retroactivo esta semana: cuesta días hacerlo ahora, cuesta el Gate B
completo descubrirlo en marzo.

**Lo que esto desbloquea:** con dominio real existente, ya se puede avanzar la parte técnica de
W-011/W-013/W-014 que hasta hoy no tenía nada contra qué apuntar: agregar la zona en Cloudflare,
confirmar o cambiar nameservers, y escribir el `wrangler.toml` real con el nombre de Worker y la
ruta de este dominio. Es también lo que hace cobrable la promesa que se le hizo a Kevin en el
update de hoy: demo en vivo dentro de un día una vez que exista el primer dominio.

**Lo que falta confirmar:** con qué registrador se compró el dominio (determina si el siguiente
paso es solo apuntar nameservers a Cloudflare o algo más), y si Pavel ya está al tanto del nicho
asignado para empezar a escribir cuando arranque el 21 de septiembre.

**Refs:** W-093 cerrado; W-007 y W-003 avanzan con la nota de riesgo arriba; W-011 anota el
dominio pero sigue abierto hasta confirmar el registrador. Sin prompt/reporte formal, mismo
hueco de proceso ya anotado en las dos entradas anteriores de hoy.

---

## 2026-09-03 · W-095 decidido / W-021 avance — Autorrevisión de Pavel y rediseño del template

**Quién:** Vic + cowork, en conversación directa (mismo hueco de proceso anotado en la entrada
anterior de hoy: sin prompt ni reporte formal)

**Qué:** Vic decidió W-095 directamente en vez de esperar a Kevin: no hay más gente disponible,
así que Pavel se autorrevisa contra un checklist antes de publicar cada página, y puede pedirle
opinión informal a Kevin cuando algo sea ambiguo, sin que eso sea un gate oficial. Se agregó ese
checklist a `docs/CONTENT_STANDARDS.md` (licencia visible, NAP consistente, sin claims de
cobertura absolutos, naming de entidad correcto, sin precios firmes sin aprobar, swap test, y
sin interpretaciones legales que solo un agente licenciado debería afirmar). W-095 sale de los
bloqueadores de Kevin y pasa a Done con esa resolución.

Por separado, Vic pidió mejorar la estética del template compartido, que hasta hoy era serif
completo, plano, sin profundidad, y con las tres variantes diferenciadas solo por un tono de
fondo casi idéntico (el riesgo que W-021 ya había anotado el 2 de septiembre). Se rediseñó
`BaseLayout.astro`: tipografía sans para cuerpo y serif solo en encabezados, header sticky con
ícono y CTA de teléfono en píldora, footer a tres columnas, tabla y blockquote con más
jerarquía, y las tres variantes ahora difieren en forma y profundidad además de color (radios de
esquina, sombra, grosor de borde), no solo en el tinte de `--variant-surface`. Se verificó con un
build real: se clonó el repo público en un entorno Linux limpio (para no tocar el `node_modules`
de Windows de Vic, que no es compatible con este bridge), se instaló y se construyó el fixture
`_example`, y se capturaron pantallas de home, coverage y las tres variantes con Playwright antes
de aplicar el archivo al repo real. Las capturas se mandaron a Vic para su visto bueno.

**Verificación:** `npm run build` corrió limpio en el clon temporal; capturas de las tres
variantes muestran diferenciación real de forma (pill+sombra en coastal, esquinas cuadradas sin
sombra en civic, radio medio cálido en warm), no solo de color. No se corrió build en el árbol
real de Vic porque el bridge corre en una VM Linux separada de Windows y su `node_modules` tiene
binarios nativos de la plataforma equivocada (`@rollup/rollup-linux-x64-gnu` faltante); Vic
necesita correr `npm run build` o `npm run dev` en su propia máquina para regenerar `dist/` con
el nuevo diseño.

**Nota de proceso:** igual que la entrada anterior de hoy, este es trabajo de producto
(`packages/template`, `docs/CONTENT_STANDARDS.md`) hecho por chat directo vía el bridge, no por
el flujo `prompts/` → ejecutor → `reports/`. Se repite el hueco ya anotado hoy; no hay reporte
formal de este trabajo, esta entrada de bitácora es el único registro.

**Lección:** verificar un cambio de CSS/build en una copia limpia del repo, en vez de confiar en
que se ve bien solo por leer el código, encontró un problema real de inmediato: el CSS del
template pasó el umbral donde Astro deja de inlinearlo y empieza a servirlo como archivo externo
(`/_astro/*.css`), así que cualquier copia de las páginas construidas que no incluya esa carpeta
sale sin estilos. No afecta el build real (que sirve todo desde su propia raíz), pero sí explica
por qué copiar HTML suelto para comparar variantes falló en el primer intento.

**Refs:** sin commit ni prompt/reporte formal todavía; los tres archivos modificados
(`BACKLOG.md`, `docs/CONTENT_STANDARDS.md`, `packages/template/src/layouts/BaseLayout.astro`)
quedan comprometidos localmente al cierre de esta entrada, pendientes del commit de cowork y el
push de Vic.

---

## 2026-09-03 · W-014/W-098 avance — Cloudflare verificado de punta a punta, bug de secrets corregido

**Quién:** Vic + cowork, en conversación directa (no por el flujo de prompts/reports; ver nota
de proceso abajo)

**Qué:** Vic creó el API Token de Workers (plantilla "Edit Cloudflare Workers") y confirmó que
`CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` ya estaban en los secrets de GitHub. Al revisar
el repo antes de dar por bueno ese paso, cowork encontró que `deploy.yml` y `preview.yml` nunca
iban a autenticar aunque se activaran: al paso `npx wrangler deploy` le faltaba el bloque `env:`
que pasa esos dos secrets. Se corrigió en ambos workflows sin tocar su `if: ${{ false }}`.

Para probar los secrets de verdad (no solo que existieran) se agregó un workflow desechable de
solo `workflow_dispatch` (`smoke-test-deploy.yml`) con su propio `wrangler.smoke-test.toml`, que
despliega el fixture `_example` a un Worker de prueba. El primer intento reveló que la cuenta
nueva no tenía subdominio `workers.dev` registrado; Vic lo registró desde el dashboard
(`wicfl-microsites.workers.dev`). El segundo intento falló con `[code: 10007]` ("this Worker
does not exist"), consistente con un retraso de propagación justo después de crear el Worker por
primera vez. El tercer intento quedó en verde:
`https://wicfl-microsites-smoke-test.wicfl-microsites.workers.dev`. Con eso confirmado, se borró
el workflow desechable, su `.toml` y el Worker de prueba en el dashboard.

**Verificación:** run de GitHub Actions en verde del workflow desechable, con el log de
`wrangler deploy` mostrando la subida de los 3 assets y la URL del Worker. Log completo del
intento fallido por el subdominio faltante y del intento fallido por `[code: 10007]` disponibles
en el historial de Actions del repo (no se pegaron aquí; se resumen porque no quedó reporte
formal — ver nota de proceso).

**Nota de proceso:** este trabajo se hizo por chat directo entre Vic y cowork, operando el repo
vía el bridge del escritorio, no por el flujo `prompts/` → ejecutor → `reports/` que define
`prompts/00_GUIA_GLOBAL.md`. Es trabajo de producto (workflows de CI, `wrangler.toml`) y por
regla debería haber ido por ahí. No hay `reports/2026-09-03_*.md` con la verificación completa
pegada; esta entrada de bitácora es el único registro. Se anota como hueco de proceso, no se
repite: la próxima vez que haga falta iterar contra la cuenta real de Cloudflare (el deploy real
de W-014, cuando existan dominios), ese si debe ir por un prompt con reporte, aunque implique
más ida y vuelta con Vic para pegar logs de la consola de GitHub.

**Otro detalle del bridge:** el commit se hizo vía el bridge del escritorio, pero el bridge corre
en una VM Linux separada de Windows y no tiene las credenciales de git de Vic, así que
`git push` falló pidiendo usuario/contraseña. Vic ejecutó el push desde su propia terminal en
ambos commits. Confirma la limitación ya anotada en `CLAUDE.md` sobre lo que el bridge no puede
hacer solo.

**Lección:** un workflow con `if: ${{ false }}` puede ocultar un bug real indefinidamente —
`deploy.yml` llevaba desde el 31 de agosto sin el `env:` de los secrets y nadie lo iba a notar
hasta activarlo en producción, porque un job que nunca corre nunca falla. Vale la pena revisar el
contenido de un job desactivado, no solo su condición, antes de darlo por listo para activarse.

**Refs:** commits `997ae7a` (`feat(deploy): add disposable Cloudflare smoke test + fix missing
wrangler env secrets`) y `8cfe5ac` (`chore(deploy): remove disposable Cloudflare smoke test after
successful verification`). Sin prompt ni reporte formal — ver nota de proceso arriba.

---

## 2026-09-02 (cierre del día) · Session wrap

**Quién:** Vic + cowork

Día largo y productivo. **28 commits, siete prompts ejecutados, cinco items cerrados.** El
detalle de cada uno está en su reporte; esto es lo que vale conservar por encima de eso.

**El proyecto pasó de documentación a fábrica funcionando.** En la mañana el repo era markdown y
un schema. Al cierre existe un monorepo en GitHub con CI verde, un generador que convierte un
`site.config.json` en un sitio construido, y un template que renderiza markdown completo con
tres variantes que se eligen desde el config. El camino config → sitio está probado de punta a
punta contra el fixture.

**Cerrados hoy:** W-012 (org, repo y remoto), W-106 (`.gitattributes`), W-026 (generador y matriz
de CI) y W-107 (markdown real con content collections). W-092 lo había cerrado Kevin. W-021 queda
como avance.

**Lo más valioso del día no fue construir, fue medir.** El prompt 004 existía solo para ver correr
CI por primera vez, y encontró que `npm run check` estaba roto en Linux por un glob sin comillas
que bash expandía antes de que AJV lo viera. **El comando de validación diario del proyecto
funcionaba en la máquina de desarrollo y estaba roto en la única plataforma donde siempre va a
correr.** Sin ese prompt, lo descubría Pavel al abrir su primer pull request en septiembre.
Lección: un pipeline que nadie ha visto correr es indistinguible de no tener pipeline, y la
verificación merece su propio prompt aunque no produzca nada.

**La revisión contra el diff se pagó dos veces.** En W-020 encontró que ningún sitio piloto
ejercita el ruteo bilingüe, algo invisible en un reporte bien escrito. En W-026 encontró que la
plantilla mostraba el teléfono en E.164, o sea que un visitante habría visto `+17720000000`,
mientras `displayPhone` existía en el schema sin usarse.

**El incidente del prompt 007.** Se ejecutó, se revirtió con código y reporte, y se reejecutó con
código distinto sin reporte. Quedó trabajo en `main` sin registro durante un rato. Se detectó en
la revisión y se cerró pidiendo el reporte de lo que había realmente en el árbol, no restaurando
el reporte viejo, que describía código que ya no existía. **Regla que sale de esto: después de un
revert, el reporte se reescribe contra el estado real; no se resucita.**

**Riesgo nuevo que nadie estaba mirando.** Las tres variantes de diseño se diferencian solo en el
token de superficie, tres tonos claros casi iguales. A tres sitios da igual; a veinte, un
portafolio que comparte tipografía, retícula y estructura se lee como una red de plantillas, y el
gate de W-027 mide similitud de **contenido**, así que ese riesgo le pasa por debajo. Anotado en
W-021 para decidirlo antes de escalar.

**Del lado del equipo:** Kevin creó `microsites@wicfl.com` y con eso se destrabó todo. Vic creó
la cuenta de Cloudflare. Queda pendiente de Kevin solo el medio de pago.

**Lo que queda a medias, con su estado exacto:** el master file publicado sigue en v1.4 mientras
la fuente va en v1.5, bloqueado por el allowlist de red del entorno. Y hay dos commits de
revisión sin subir, porque el bridge del escritorio no tiene credenciales de GitHub y los sube el
siguiente prompt.

**Siguiente acción, una sola:** Vic monta el vault (W-105) y rota la contraseña del buzón, que es
el primer paso de W-010 y sigue pendiente desde que llegó por el chat de Zoom. Todo lo de
Cloudflare cuelga de ahí.

---

## 2026-09-02 · W-107 cerrado / W-021 avance — Markdown real y design system

**Quién:** agente ejecutor
**Qué:** se reemplazó el renderer manual por una content collection de Astro que lee markdown externo con frontmatter obligatorio. El template obtuvo tokens, tres variantes restringidas, layout responsive, NAP completo, teléfono visible con enlace E.164, licencia en todas las páginas y tipos home/content/coverage.

**Verificación:** `npm run check` validó los tres configs y `npm run build` generó tres páginas. El HTML contiene marca, dirección, teléfono humano, `tel:+17720000000`, licencia y markdown real. La prueba temporal `civic/#7A3E00` cambió clase y token sin código; el fixture se restauró. No se emitieron etiquetas `script`. CI verde: run `33670312569`.

**Lección:** el loader `glob` de Astro necesita una URL `file:` para contenido externo en Windows; `pathToFileURL` mantiene el límite entre template y sitio sin duplicar markdown.

**Refs:** prompt `prompts/2026-09-02_007_template-y-markdown.md`; reporte `reports/2026-09-02_007_template-y-markdown.md`; commit `478d7b2` (`feat(template): real markdown pipeline and design system`). W-107 cerrado; W-021 avanza y sigue abierto por el chequeo `astro check` pendiente.

---

## 2026-09-02 · W-026 — Generador aislado de config a sitio y matriz de CI

**Quién:** agente ejecutor
**Qué:** se añadió `npm run build:site -- <site-directory>`, que valida config antes de construir con el template Astro compartido, toma markdown externo y escribe `dist/sites/<site-directory>/`. El template muestra config y compliance en todas las páginas; CI valida configs, descubre los sitios afectados y los construye en matriz.

**Verificación:** `_example` produjo `/` y `/about-fixture/` con marca, ciudad, teléfono de tracking, licencia y SEO provenientes del config. Un config temporal inválido salió antes de Astro con el error de propiedad requerida. Dos builds seguidos dieron hashes idénticos. CI verde en el run `33667480670`: validación, descubrimiento y `Build _example` pasaron.

**Lección:** aislar builds por sitio evita que un config malo bloquee dominios independientes, mientras que cambios al template, schema o scripts sí deben reconstruir todos. Entregar config por variables de entorno evita un archivo generado compartido que podría contaminar otro build.

**Refs:** prompt `prompts/2026-09-02_006_generador-new-site.md`; reporte `reports/2026-09-02_006_generador-new-site.md`; commit `0700bde` (`feat(generator): build a site from its config`). W-026 cerrado.

---

## 2026-09-02 · W-012/W-106 — CI verde y finales de línea normalizados

**Quién:** agente ejecutor
**Qué:** se entrecomilló el glob de AJV sin cambiar la herramienta ni la validación, se añadió `.gitattributes` para LF y `*.xlsx binary`, y se subieron los cinco commits locales pendientes junto con el fix.

**Verificación:** los tres configs validaron localmente; `git add --renormalize .` seguido de `git diff --cached --ignore-all-space` no mostró cambios de contenido. El push a `main` disparó CI run `33665589246`, evento `push`, y terminó verde: `npm ci`, `npm run check` y `npm run build` pasaron.

**Lección:** un glob que llega intacto a AJV en PowerShell puede ser expandido por Bash antes de invocar la herramienta. Entrecomillarlo conserva la misma validación y la hace portable. En el mismo push, deploy no tuvo workflow run porque sus filtros no incluyen el root `package.json` ni `.gitattributes`; eso es distinto de un job omitido por guard y se deja para evaluación de cowork.

**Refs:** prompt `prompts/2026-09-02_005_arreglar-ci.md`; reporte `reports/2026-09-02_005_arreglar-ci.md`; commit `de4a5ef` (`fix(ci): quote the ajv glob and normalize line endings`). W-012 y W-106 cerrados; W-014 sigue abierto.

---

## 2026-09-02 · W-012/W-014 — Triggers de CI medidos con un PR desechable

**Quién:** agente ejecutor
**Qué:** se despachó `ci.yml` manualmente y se abrió el PR #1 con un cambio mínimo en una rama creada desde `origin/main`. El PR se cerró sin merge y se borró su rama local y remota.

**Verificación:** Actions ejecutó CI por `workflow_dispatch` y por `pull_request`, confirmando que el trigger de Pavel funciona. Ambos fallaron en `npm run check`: Bash expandió el glob de ejemplos y AJV rechazó los múltiples argumentos. `preview.yml` sí generó un run en el PR, pero su job quedó `skipped` por `if: ${{ false }}`; `deploy.yml` no tuvo run porque su trigger no es `pull_request`.

**Lección:** workflow ausente y job omitido son estados distintos: deploy no tuvo run; preview tuvo run y job omitido. La validación local en Windows no detectó que un glob de npm cambiaría de semántica en Bash.

**Refs:** prompt `prompts/2026-09-02_004_verificar-triggers-ci.md`; reporte `reports/2026-09-02_004_verificar-triggers-ci.md`. W-012 sigue abierto hasta corregir el script portátil y obtener CI verde.

---

## 2026-09-02 · W-012 — Push exitoso; CI no se disparó

**Quién:** agente ejecutor
**Qué:** con la membresía de `vitoriomanzarek` ya concedida, se hizo `git push -u origin main` sin force. La historia local llegó a `microsites-wicfl/wicfl-microsites` y GitHub confirmó `main` como rama por defecto.

**Verificación:** los workflows `Validate and build`, `Deploy Cloudflare Workers` y `Preview deploy` aparecen activos, pero GitHub Actions devolvió cero runs y el HEAD remoto no tiene check runs. Por tanto, deploy y preview no se ejecutaron, pero tampoco hubo CI verde que permita cerrar W-012.

**Lección:** que un workflow exista y esté activo no garantiza que el primer push lo dispare; hay que verificar el run real, especialmente cuando los filtros de paths excluyen el último commit de la rama.

**Refs:** prompt `prompts/2026-09-01_003_conectar-remoto.md`; reporte `reports/2026-09-01_003_conectar-remoto.md`. W-012 sigue abierto hasta que exista una corrida verde de CI.

---

## 2026-09-02 · W-012 — Remoto configurado, push bloqueado por permisos

**Quién:** agente ejecutor
**Qué:** se barrió la historia completa de 32 commits en busca de credenciales antes de cualquier push; no hubo coincidencias. La rama se renombró de `master` a `main` y se configuró `origin` para `microsites-wicfl/wicfl-microsites`.

**Verificación:** el primer `git push -u origin main` fue rechazado con HTTP 403: GitHub negó acceso a la cuenta autenticada `vitoriomanzarek`. `gh` confirmó que esa es la cuenta activa y que el token tiene scope `repo`, pero no hubo push, CI ni deploy que verificar.

**Lección:** un scope general de token no prueba que una organización otorgue escritura. Ante un rechazo de autorización, la acción correcta es detenerse sin cambiar identidades, permisos ni historia, y pedir que Vic resuelva el acceso.

**Refs:** prompt `prompts/2026-09-01_003_conectar-remoto.md`; reporte `reports/2026-09-01_003_conectar-remoto.md`. W-012 sigue abierto; no hubo force push ni reescritura de historia.

---

## 2026-08-31 · W-012/W-014/W-098 — Esqueleto del monorepo y pipeline local

**Quién:** agente ejecutor
**Qué:** se creó el workspace npm, el template Astro estático mínimo, el fixture bilingüe `sites/_example/`, CI con filtros de path y workflows de deploy/preview desactivados. Se añadió `docs/SETUP.md` con el flujo local y el checklist exacto para conectar Cloudflare cuando exista la cuenta.

**Decisiones:** las herramientas compartidas viven en la raíz para que los comandos de Pavel sean `npm run dev`, `npm run check` y `npm run build`; `_example` es bilingüe para ejercitar el único caso `en`/`es` que ninguno de los pilotos cubre; deploy y preview se escribieron con placeholders y `if: ${{ false }}` para no crear ni simular credenciales personales.

**Verificación:** `npm ci`, validación de los dos ejemplos del schema más `_example`, build estático, servidor local HTTP 200 y parseo de los tres YAML pasaron. El build generó `packages/template/dist/index.html`.

**Lección:** el filtro de paths evita gastar CI en documentación y, mientras no exista W-026, el build compartido no puede convertirse honestamente en una matriz de builds por sitio. Esa matriz debe añadirse con el generador, no anticiparse con un script ficticio.

**Refs:** prompt `prompts/2026-08-28_002_monorepo-y-pipeline.md`; reporte `reports/2026-08-28_002_monorepo-y-pipeline.md`; commit `1c37278` (`feat(repo): monorepo skeleton, Astro template and CI pipeline`). W-012, W-014 y W-098 avanzan; W-014 y W-098 siguen abiertos hasta conectar Cloudflare.

---

## 2026-08-31 · W-020 — Cierre del contrato site.config.json

**Quién:** agente ejecutor
**Qué:** se cerró el contrato validable de `site.config.json` en JSON Schema draft 2020-12, con ejemplos completos para Stuart flood en inglés y seguro de casa Miami en español.

**Decisiones:** `serviceArea` quedó como metadata y nunca genera páginas; `products` es un catálogo fijo soportado por template; la variación visual vive en un bloque `theme` acotado; NAP tiene una captura única y se reconcilia contra GBP en QA; differentiation queda estructurado para humanos mientras CI compara el contenido renderizado; license number, tracking phone y differentiation son obligatorios.

**Verificación:** ambos ejemplos validaron mediante `npx --yes ajv-cli validate --spec=draft2020`; también pasó `git diff --check`. AJV no soportó el formato `email` de forma integrada en modo estricto, así que se usó un patrón explícito sin añadir dependencias del proyecto.

**Lección:** el schema puede imponer forma y campos obligatorios, pero no puede afirmar que NAP coincide con una fuente remota ni que el contenido publicado es único. Esas garantías deben vivir respectivamente en QA de launch y en el gate de contenido renderizado.

**Refs:** prompt `prompts/2026-08-25_001_site-config-schema.md`; reporte `reports/2026-08-25_001_site-config-schema.md`; commit `ed3d425` (`feat(schema): close site.config.json contract with validation and examples`).

---

## 2026-08-26 (noche) · Se acota lo que se le pide a Kevin

**Quién:** Vic + cowork

Al preparar el mensaje para Kevin, Vic aplicó un criterio que vale conservar como regla:
**Kevin es owner, no ejecutor. Solo se le pide lo que nadie más puede hacer.** Bajo esa regla,
la lista de nueve pendientes se cayó a seis, y tres de ellos ni siquiera eran preguntas suyas.

**Lo que salió de su lista:**

- **W-094, la org de GitHub.** La creamos nosotros bajo el correo de empresa. Nunca fue una
  decisión de negocio, era una pregunta de inventario que resolvimos preguntándonos a nosotros.
- **W-003 y W-004, los nichos.** Pavel ya hace la validación SEO en W-016 y llega con keywords,
  SERP y ángulo local. Pedirle a Kevin que *elija* el nicho antes de eso lo pone a decidir sin
  datos y luego a Pavel a validar la decisión de su jefe, que es el peor orden posible. Ahora
  Pavel propone con evidencia y Kevin aprueba junto con el dominio en W-007.
- **W-093, el vault.** Lo monta Vic. De Kevin solo salen los datos de pago.

**Lo que se cerró:**

- **W-096, el CRM: GoHighLevel con una sub-account propia de WICFL**, no la instancia de WAGS.
  Sub-account y no instancia compartida importa: mantiene separados los leads, los pipelines y
  los reportes de las dos marcas, que es lo que hace legible el reporte por sitio de W-060.
  Desbloquea W-025 y abre **W-101**, dar de alta la sub-account y sacar credenciales de API,
  que es tarea de Vic y no pregunta a Kevin.
- **W-092 se reformuló.** No es "el correo dueño de la cuenta de Cloudflare", es **el correo
  desde el que se gestiona todo el proyecto**: Cloudflare, GitHub, GA4, Search Console y GoTo.
  Un solo correo de empresa, y con él Vic levanta todo.

**Lección:** una lista de pendientes dirigida a la persona equivocada se ve igual de urgente que
una bien dirigida, y consume la misma atención. Antes de mandar un pedido, la pregunta no es si
el item es real, sino si es de esa persona. Tres de nueve no lo eran, y dos ya tenían respuesta
de nuestro lado.

---

## 2026-08-26 (tarde) · Revisión de arquitectura y relevo de arquitecto

**Quién:** Vic + cowork (sesión nueva, releva a la sesión que armó el proyecto)

Vic pidió una revisión externa del repo antes de arrancar. Salieron seis hallazgos; la sesión
anterior aplicó los seis y devolvió dos preguntas abiertas. Esta entrada cubre la respuesta a
esas dos preguntas y lo que salió al verificar el estado real del repo.

**Limpieza de git ejecutada, no diferida.** El `git init` desde el bridge dejó 43 objetos
`tmp_obj_*` huérfanos, `.git/_stale/` con nueve locks y un archivo suelto. Se limpió con
permiso de borrado del usuario: `gc --prune=now`, `fsck` limpio, `.git` de 212K a 156K. El
Paso 0 que se había agregado al prompt 001 se retiró porque ya no aplicaba, y con él una
premisa incorrecta: los locks de cero bytes no bloqueaban el commit, git los sobreescribe con
rename. **Lección:** el bridge del escritorio sí puede borrar, solo hace falta pedir el permiso.
Diferir higiene de repo a "una terminal local" es diferirla a algo que no existe en este flujo.

**`AGENTS.md` apareció sin versionar como copia casi idéntica de `CLAUDE.md`**, con el nombre
del ejecutor como única diferencia. Quedó como puntero. Dos copias de las reglas duras se
desincronizan siempre, y cuando se desincronizan nadie sabe cuál manda. De paso se corrigió la
contradicción de fondo: `CLAUDE.md` decía que Vic no ejecuta ni comandos de lectura, y al mismo
tiempo un doc pedía correr git desde su terminal. Ahora dice quién sí toca el filesystem.

**Gate A: el número estaba bien, la unidad estaba mal.** Dos días hábiles de reloj de pared
miden también la cola de emisión de Universal SSL, que va de quince minutos a 24 horas según el
SLA publicado de Cloudflare. Pavel podía reprobar por el dominio que le tocó. El criterio ahora
son cuatro condiciones y las dos que mandan se resuelven con un comando, no con una discusión en
noviembre: su diff solo toca `sites/<slug>/**`, y regenerar desde config reproduce el sitio
publicado. Esa segunda es la que de verdad detecta una fábrica rota, porque un parche a mano
después de generar es invisible para un cronómetro. El tiempo baja a tercer criterio con las
esperas de vendor excluidas, y el cuarto registra cada pregunta que el handoff no contesta, para
que el gate alimente la Fase 5 en vez de solo pasar o fallar. Se abrió **W-097**: ensayar el
reloj completo la semana del 2 de noviembre contra un config de juguete. Gate A debería confirmar
algo que ya creemos, no descubrirlo.

**Bloque A: la partición era correcta, pero le faltaban dos cosas que no estaban en ningún
bloque.**

- **W-098, preview deploy por rama.** Pavel escribe markdown tres semanas seguidas del 21 de
  septiembre al 9 de octubre. Si la única forma de ver una página renderizada es correr el dev
  server de Astro, le estamos pidiendo `npm install` y una terminal a alguien con tres semanas
  de rampa técnica. Sin eso escribe a ciegas o depende de Vic para ver su trabajo, que es
  exactamente la dependencia que el handoff existe para cortar.
- **W-029 se partió.** La lista de QA es la definición de "listo para publicar" de Pavel y tiene
  que existir el 21 de septiembre. Si no, escribe tres semanas sin saber contra qué y la lista
  se acaba escribiendo el 8 de octubre para empatar con lo que ya construyó. Automatizarla es
  **W-099** y sí es Bloque B.

**El gate de diferenciación tenía el ancla mal en las dos direcciones.** Decía "antes de que se
publique el primer contenido, principios de octubre". Pero con un solo sitio vivo el gate de CI
no tiene contra qué comparar: su primera prueba real es el sitio #2, a mediados de octubre. Y al
revés, el valor del swap test es mientras se escribe. Si Pavel escribe veinte páginas y la
primera revisión corre el 5 de octubre, una falla significa reescribir tres semanas de trabajo
cuatro días antes del launch, y la presión de ese momento será aflojar el umbral, no reescribir.
La auditoría humana por página va en el handoff del 18 de septiembre; el gate de CI a mediados
de octubre.

**W-005 pasó de "inventar un número" a "aprobar un número".** Se escribió
`docs/GATE_B_MODEL.md`. El punto de fondo: break-even es el bar equivocado. El costo marginal de
un sitio es $26 al año, o sea que una sola póliza lo paga por una década y el gate pasaría aunque
el portafolio fuera un fracaso. Gate B es una prueba de **costo de oportunidad del tiempo de
Pavel**, no de rentabilidad de la plataforma. El bar se deriva de tres hechos que solo Kevin
tiene, y el doc trae las dos verificaciones de cordura: si el bar es inalcanzable contra el
volumen de búsqueda que Pavel encuentre en W-016, está diseñado para fallar; si es tan bajo que
Kevin no comprometería seis meses de Pavel por ese resultado, Gate B va a pasar hacia un proyecto
que nadie quería.

**Hueco nuevo, W-100: nadie ha definido qué es una "llamada calificada".** Todo Gate B se mide en
esa unidad. La definición determina qué tiene que capturar el tracking, y el tracking se cablea
antes del 9 de octubre, así que no es un detalle de marzo. Incluye disposición de llamadas en
GoTo y etiquetado semanal: nadie clasifica 120 días de llamadas de memoria.

**La memoria de proyecto estaba vacía.** El handoff de la sesión anterior afirmaba que existía
`project_wicfl_microsites.md` con el estado completo. `project_memory_read` devolvió cero
archivos. Se escribió desde cero en esta sesión. **Lección:** un handoff que afirma que algo
existe no es evidencia de que exista. Verificar antes de confiar, sobre todo cuando lo afirmado
es el respaldo de todo lo demás.

**Lo que sigue igual y sigue caliente:** Kevin no ha respondido ninguno de los seis bloqueadores.
Si el lunes 31 llega sin W-092, no hay cuenta de Cloudflare y Pavel arranca su primer día de
tiempo completo sin accesos. Y el prompt 001 sigue sin ejecutarse.

---

## 2026-08-26 (mediodía) · Revisión de arquitectura externa, seis hallazgos

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
## 2026-09-21 · W-118 avanza: formulario real y Worker aislado

**Quién:** agente ejecutor, siguiendo `prompts/2026-09-21_014_formulario-contacto-real.md`.

`/contact/` ya contiene el funnel de Kevin: ZIP, razón y dirección, y datos de contacto con
timing, aseguradora y prima opcional. El JS queda contenido en esa página. `apps/lead-api/`
centraliza GHL, Google Places y R2 para no meter secretos en los pods. Se probaron seis casos
mockeados, Wrangler en dry-run, `npm run check`, el build del pod y un preview real de Stuart.
No se cerró W-118: faltan credenciales de GHL/Google/R2, bucket, CORS y la prueba autorizada
contra servicios reales. Reporte: `reports/2026-09-21_014_formulario-contacto-real.md`.

---
