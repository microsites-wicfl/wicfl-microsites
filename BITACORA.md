# BITÁCORA — WICFL Microsites

Log histórico de decisiones, sesiones y ejecuciones. Orden cronológico inverso.
El agente ejecutor solo agrega su propia entrada al cerrar un prompt; no edita entradas anteriores.

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
