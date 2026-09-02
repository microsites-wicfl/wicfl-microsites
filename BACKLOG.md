# BACKLOG — WICFL Microsites

Items priorizados. **Solo cowork crea items nuevos.** El agente ejecutor puede cerrar el
item que su prompt cerraba, con refs a prompt/report/commit, pero no crea ni reprioriza.

Formato de id: `W-NNN` · Última actualización: 2026-08-26 (revisión de arquitectura: git, Gate B, recorte de Fase 2, CRM)

---

## Bloqueadores

| id | Item | Dueño | Debido | Bloquea |
|---|---|---|---|---|
| W-008 | **Assets de marca de Walker**: logo, contacto aprobado, disclosures requeridos, license numbers | Kevin | 2026-09-04 | Sitio #1 no puede publicar sin esto. *(aporte de Pavel)* |
| W-095 | **Quién revisa el contenido de Pavel antes de publicar** | Kevin | 2026-09-04 | Pavel es escritor, SEO lead y project lead. Sin segundo par de ojos, nadie valida claims de cobertura ni compliance de Florida. Una revisión por sitio, no un cuello de botella |

---

## Fase 0 — Decisiones de Kevin (24–28 ago 2026)

**Priorizado el 2026-08-28.** No se le manda a Kevin la lista completa: se satura y no
contesta ninguna. Solo **W-092 y W-093** salen ahora, porque son las dos únicas que bloquean
la creación de cuentas. El resto se empuja después, en orden: W-006 (afecta la validación de
nichos que Pavel arranca esta semana), W-008 y W-095 (bloquean publicar, no construir), y
W-005 con W-100 (se piden juntas, con la propuesta ya escrita).

| id | Item | Dueño | Debido | Bloquea |
|---|---|---|---|---|
| W-003 | Nicho y mercado en inglés para sitio #1 | **Pavel propone**, Kevin aprueba | 2026-08-28 | W-016. **Reasignado el 26-ago:** Kevin es owner, no ejecutor. Pavel ya hace la validación SEO en W-016, así que él trae el nicho con evidencia y Kevin lo aprueba junto con el dominio en W-007 |
| W-004 | Nicho y mercado en español para sitio #2 | **Pavel propone**, Kevin aprueba | 2026-08-28 | Igual que W-003 |
| W-005 | Número concreto para Gate B | Kevin **aprueba**, Vic propone | 2026-08-28 | Gate B es indecidible sin él. **El modelo ya está en `docs/GATE_B_MODEL.md`**: Kevin solo llena tres celdas (comisión promedio por póliza, tasa de cierre de llamada a venta, y qué retorno anual por sitio justifica seguir). Un número que hay que aprobar se aprueba; uno que hay que inventar se pospone hasta que los datos lo inventen solos |
| W-100 | **Definir qué cuenta como "llamada calificada" y cómo se registra** | Kevin + Vic | 2026-09-25 | **Hueco encontrado el 26-ago.** El bar de Gate B se mide en llamadas calificadas y nadie ha dicho qué califica. La definición determina qué tiene que capturar el tracking, y el tracking se cablea antes del launch del 9 de octubre. Incluye disposición de llamadas en GoTo y etiquetado semanal, no trimestral: nadie clasifica 120 días de llamadas de memoria en marzo |
| W-006 | ¿Los sitios piloto tienen su propio Google Business Profile? | Kevin | 2026-08-28 | Puede cambiar qué nichos son viables |
| W-007 | Dominios aprobados para sitios #1 y #2 | Kevin | 2026-09-04 | W-011. Se aprueban DESPUÉS de W-016 |
| W-093 | **Datos de pago de la empresa** para el billing de Cloudflare y GoTo | Kevin | 2026-09-04 | Único pendiente de Kevin en ruta crítica. **Acotado el 26-ago:** el vault lo monta Vic. **Con el buzón ya creado (W-092), la vía es que Vic cree la cuenta y le pase a Kevin la pantalla de billing para que capture la tarjeta él mismo.** La cuenta corre en free mientras tanto; el plan de $5 solo hace falta antes de que existan sitios reales |
| W-094 | ~~¿Walker ya tiene org de GitHub?~~ **Cerrado el 26-ago: la creamos nosotros.** Vic la levanta bajo el correo de W-092. Ver W-012 | Vic | — | Ya no bloquea nada |

---

## Fase 1 — Infraestructura y validación (31 ago – 4 sep 2026)

| id | Item | Dueño | Notas |
|---|---|---|---|
| W-010 | Crear cuenta Cloudflare con `microsites@wicfl.com`, 2 Super Admins, Pavel como Administrator, 2FA, recovery codes en vault compartido | Vic | **Desbloqueado el 2026-09-01.** Ver `docs/ACCOUNTS_AND_ACCESS.md`. **Primer paso, antes de crear nada: rotar la contraseña del buzón.** Llegó por el chat de Zoom, donde queda en el historial de forma indefinida y buscable, visible para cualquiera que se agregue al hilo después. La nueva no se comparte por chat: vive en el vault, junto con los recovery codes del 2FA |
| W-105 | **Montar el vault compartido** (Bitwarden o 1Password) y meter ahí la credencial rotada del buzón y los recovery codes | Vic | **Urgente desde el 2026-09-01:** hasta que exista, la única copia de las credenciales del proyecto está en un chat. Precede a W-010 |
| W-012 | Crear org de GitHub y monorepo, configurar accesos | Vic | **Avance 2026-09-02:** rama local renombrada a `main` y `origin` configurado para `microsites-wicfl/wicfl-microsites`; el push normal fue rechazado con HTTP 403 para la cuenta autenticada y no se forzó. Requiere acceso de escritura o identidad autorizada antes de cerrar. Prompt: `prompts/2026-09-01_003_conectar-remoto.md`; reporte: `reports/2026-09-01_003_conectar-remoto.md`. Avance previo: monorepo local, workspace npm y CI base en `1c37278`. |
| W-013 | Configurar zonas, DNS y SSL | Vic | Depende de W-011 |
| W-014 | Levantar pipeline de deploy con Workers Static Assets + GitHub Actions | Vic | **Avance 2026-08-31:** CI, deploy y preview workflows escritos en `1c37278`; deploy y preview siguen desactivados hasta W-092/W-010. Prompt: `prompts/2026-08-28_002_monorepo-y-pipeline.md`; reporte: `reports/2026-08-28_002_monorepo-y-pipeline.md`. Incluye los preview deploys por rama de W-098. Montarlos después cuesta el doble |
| W-015 | Cerrar `docs/ARCHITECTURE.md` en su versión de handoff | Vic | |
| W-016 | **Validación SEO del nicho antes de comprar dominio**: keywords, search intent, competencia en SERP, ángulo local real | Pavel | *(aporte de Pavel)* Si el nicho está dominado por agregadores sin ángulo local, se descarta y Kevin elige otro. **Bloquea W-007 y W-011** |
| W-017 | **Provisionar accesos a Pavel**: Cloudflare Administrator, GitHub, GoTo, GA4, Search Console | Vic | **Movido al 31 de agosto.** Pavel arranca de tiempo completo ese día; esperar accesos hasta el 2 de septiembre son dos días perdidos |
| W-011 | Registrar dominios de sitios #1 y #2 vía Cloudflare Registrar | Vic | Depende de W-007, que ahora depende de W-016 |

---

## Track paralelo — Rampa técnica de Pavel (31 ago – 18 sep 2026)

| id | Item | Dueño | Notas |
|---|---|---|---|
| W-102 | **Guía del operador + sesión de orientación con Pavel** | Vic | **Abierto el 28-ago.** Pavel se ve confundido y el diagnóstico no es técnico: su propio documento proponía contenido generado desde briefs y sitios construidos a mano, o sea que se imaginaba un trabajo distinto al que el framework asume. Una capacitación de herramientas no arregla eso. Va en dos tiempos: **orientación ahora** (qué es un sitio aquí, qué toca él, qué no toca nunca, cómo se ve una semana suya), sin herramientas y sin depender del schema; y **capacitación técnica después**, cuando existan el schema y el repo, que es material de W-028 adelantado, no trabajo extra |


| id | Item | Dueño | Notas |
|---|---|---|---|
| W-018 | Rampa: HTML/CSS para leer y diagnosticar, conceptos de Astro, workflow de Git, Cloudflare básico | Pavel | Alcance acotado: **no necesita escribir HTML**. Con dedicación completa confirmada el 25-ago, la ventana 31 ago – 18 sep es realista y la Fase 3 arranca el 21 de septiembre como estaba |
| W-019 | Sombra durante la construcción del framework (Fase 2) | Pavel | 8–18 sep, confirmado |

---

## Fase 2 — Framework (8–18 sep 2026) · Vic con Pavel de sombra

Diez items en nueve días hábiles no cabe, sobre todo con Pavel de sombra restando velocidad.
Lo que hicimos no es recortar alcance, es **separar por deadline real**: no todo lo de Fase 2
está amarrado al handoff del 18 de septiembre. La mitad está amarrada al launch del sitio #1,
el 9 de octubre, y Pavel puede construirla durante la Fase 3.

### Bloque A — obligatorio para el handoff del 18 de septiembre

Sin esto Pavel no puede empezar el sitio #1 el 21 de septiembre.

| id | Item | Dueño | Notas |
|---|---|---|---|
| W-020 | ~~Definir el `site.config.json` schema + validación~~ | Vic + Pavel | Cerrado 2026-08-31. Prompt: `prompts/2026-08-25_001_site-config-schema.md`; reporte: `reports/2026-08-25_001_site-config-schema.md`; commit: `ed3d425` (`feat(schema): close site.config.json contract with validation and examples`). Pavel revisa y rompe antes de congelarlo operacionalmente. |
| W-021 | Template base de Astro: layouts, componentes, design system | Vic | **Nota del 31-ago:** `npm run check` quedó reducido a validar configs porque `astro check` se colgaba en local. CI no se ve afectado (`npm run build` corre después y una plantilla rota falla ahí), pero el comando local ya no detecta errores de tipo antes de construir. Devolverlo al cerrar este item |
| W-022 | Ruteo bilingüe en/es con `hreflang` | Vic | Se construye ahora, no se retrofitea. **Hallazgo del 31-ago:** con el schema cerrado queda claro que **ningún piloto lo ejercita**: el sitio #1 es `en` sin alternates y el #2 es `es` sin alternates, o sea dos sitios monolingües independientes, no versiones uno del otro. `docs/SCHEDULE.md` dice que el sitio #2 valida el soporte bilingüe y **no es cierto**: valida contenido en español, que es otra cosa. Se construye igual porque define el ruteo del template, pero hay que ejercitarlo con el sitio `_example` del prompt 002 configurado bilingüe, o queda como código muerto que se estrena a escala |
| W-026 | Comando `new-site`: genera un sitio desde su config, **y la matriz de sitios cambiados en CI** | Vic | **Versión mínima y tosca a propósito.** Solo renderiza el template desde config. Se reescribe durante los pilotos. Ver decisión en `docs/ARCHITECTURE.md`. **Alcance ampliado el 31-ago al revisar W-012/W-014:** hoy CI construye el template compartido, no sitios, así que el filtro de path decide si corre el workflow pero no qué se construye. Eso es correcto mientras no exista build por sitio, pero el compromiso de arreglarlo vivía solo en un comentario de `ci.yml`. Un cambio en un sitio no debe construir los demás, y ese es el punto entero del monorepo: se descubre a los veinte sitios, no a los tres |
| W-098 | **Preview deploy por rama**: Pavel hace push de markdown y recibe una URL con su sitio renderizado | Vic | **Avance 2026-08-31:** workflow documentado y desactivado en `1c37278`; falta Cloudflare, secrets y URL de preview tras W-092/W-010. Prompt: `prompts/2026-08-28_002_monorepo-y-pipeline.md`; reporte: `reports/2026-08-28_002_monorepo-y-pipeline.md`. **Hueco encontrado el 26-ago.** Sin esto Pavel escribe tres semanas a ciegas o te pide a ti que se lo enseñes, que es justo la dependencia que el handoff existe para cortar. Se monta junto con W-014 |
| W-029 | **La lista** del checklist de QA y launch: técnico, SEO, contenido, mobile, conversión, tracking, deploy | Pavel + Vic | *(aporte de Pavel)* Es la definición de "listo para publicar" de Pavel. Si no existe el 21 de septiembre, escribe sin saber contra qué y la lista se acaba escribiendo el 8 de octubre para empatar con lo que ya construyó. Medio día, sobre todo trabajo suyo |
| W-028 | Sesión de handoff con Pavel + documentación escrita | Vic + Pavel | Criterio de salida: Pavel genera un sitio vacío sin ayuda. **Correrlo el 17, no el 18**, para que una falla deje un día |

### Bloque B — obligatorio para el launch del sitio #1, 9 de octubre

Se construye durante la Fase 3, con Pavel ya operando. Si alguno se desborda, se recorre
dentro de octubre sin tocar el handoff ni el 21 de septiembre.

| id | Item | Dueño | Notas |
|---|---|---|---|
| W-023 | SEO técnico: sitemap, robots, canonical, schema.org InsuranceAgency | Vic | El template del Bloque A no debe impedirlo |
| W-024 | Número de tracking como campo de config, ruteado a GoTo | Vic | GoTo confirmado a $0.99/número |
| W-101 | Alta de la sub-account de GoHighLevel para WICFL, con credenciales de API y mapeo de campos del lead | Vic | Sale de cerrar W-096. Necesita el correo de W-092. Bloquea W-025 |
| W-025 | Analytics (GA4 + GTM) y captura de leads al CRM, con sitio de origen en cada lead | Vic | **Desbloqueado el 26-ago: GoHighLevel con una sub-account propia de WICFL.** Falta solo el alta de la sub-account y sus credenciales de API |
| W-103 | **Modo de validación de producción: rechazar placeholders antes de publicar** | Vic | **Abierto el 31-ago al revisar W-020.** El schema valida la *forma*, no el contenido: `"licenseNumber": "PLACEHOLDER-FL-LICENSE"` y un GA4 `G-PLACEHOLDER` pasan la validación. Un sitio puede publicarse mostrando un número de licencia falso en todas sus páginas, que no es un bug cosmético sino un incumplimiento de publicidad de seguros en Florida. El ejecutor lo mandó al checklist humano de W-029; eso contradice la regla del propio proyecto de que todo lo automatizable va a CI. Es un segundo modo de validación que rechaza patrones conocidos (`PLACEHOLDER`, `PENDING_`, `G-PLACEHOLDER`, `GTM-PLACEHOLDER`, teléfonos con final `0000000`), cuesta cerca de una hora y corre antes de cada deploy. **Requisito añadido el 31-ago:** necesita exención explícita por ruta para `sites/_*`, porque el fixture `_example` lleva esos placeholders a propósito. Sin la exención, o el fixture rompe CI o alguien afloja el control para que pase, y aflojarlo es el desenlace peligroso |
| W-027 | Gate de CI de diferenciación: bloquea deploy por similaridad entre sitios | Vic | **Ancla corregida el 26-ago: antes del contenido del sitio #2, mediados de octubre.** Con un solo sitio vivo no tiene contra qué comparar. La protección durante el sitio #1 es humana y va en el handoff: Pavel corre la skill `differentiation-audit` por página conforme escribe |
| W-099 | **Automatizar** lo automatizable del checklist de W-029: llevarlo a CI en vez de a criterio humano | Vic | Se parte de W-029 el 26-ago. La lista es Bloque A porque es la definición de terminado; automatizarla es Bloque B porque solo apura, no desbloquea |

---

## Fase 3 y 4 — Sitios piloto · Pavel

| id | Item | Notas |
|---|---|---|
| W-030 | Sitio #1 en inglés, generado desde config, launch 9 oct | Arranca el reloj de 120 días de Gate B. **Fecha confirmada el 25-ago** |
| W-031 | Sitio #2 en español, launch 30 oct | **Pavel escribe el español nativo.** Nunca traducido ni generado desde brief en inglés |
| W-032 | Registrar horas de ambos como línea base de Gate A | Separar desde ya **tiempo de fábrica** de **tiempo de contenido** y de **esperas de vendor**. Si la línea base mezcla los tres, no es comparable contra Gate A |

---

## Fase 5 a 10

| id | Item | Notas |
|---|---|---|
| W-040 | Retro: catalogar todo lo que fue manual en sitios #1 y #2, y regresarlo al framework | 2–6 nov |
| W-097 | **Ensayo de Gate A**: correr el reloj completo de la fábrica contra un config de juguete en un subdominio, sin comprar dominio ni escribir contenido | 2–6 nov, dentro de Fase 5. Hallar un hueco en el runbook el 4 de noviembre cuesta una tarde; hallarlo el 10 cuesta el gate |
| W-041 | **Gate A**: cuatro criterios, todos obligatorios. Ver `docs/SCHEDULE.md`. Los dos que mandan son verificables por comando: el diff de Pavel solo toca `sites/<slug>/**`, y regenerar desde config reproduce el sitio publicado | 13 nov |
| W-050 | Automatizar registro de dominio vía Cloudflare Registrar API | API en beta: solo registra, no renueva ni transfiere |
| W-051 | Automatizar zona, DNS y attach de custom domain | |
| W-052 | Automatizar alta en Search Console y envío de sitemap | |
| W-053 | Automatizar provisioning del número de tracking | |
| W-054 | Comando end-to-end: config entra, sitio vivo sale | |
| W-060 | Reporte mensual: impresiones, clics, llamadas, cotizaciones y ventas por sitio | Corre en paralelo desde 12 oct |
| W-070 | **Gate B**: decisión comercial de Kevin contra el número de W-005 | **5 mar 2027** (movido: los 120 días del sitio #2 caen el 27 de feb) |

---

## Watch (sin fecha, no bloquea nada todavía)

| id | Item | Cuándo importa |
|---|---|---|
| W-104 | **Cinco vulnerabilidades transitivas en el árbol de dependencias de build**, cuatro de severidad alta | Antes de que el pipeline construya sitios públicos. Reportadas el 31-ago al instalar el workspace. Exposición acotada: son dependencias de build y la salida de Astro es estática, así que nada de eso se sirve a los visitantes. No se corrió `npm audit fix --force`, que habría metido cambios de dependencias sin revisar. Revisar una por una y decidir |
| W-090 | Confirmar con Cloudflare el alta masiva de zonas en plan free | A los ~25 dominios, no a los 90 |
| W-091 | Evaluar si conviene hub-and-spoke en vez de portfolio de dominios | Solo si Gate B falla |

---

## Done

| id | Item | Cerrado | Resultado |
|---|---|---|---|
| W-002 | Dueño del contenido y escritor de español | 2026-08-25 | Kevin asignó el rol de contenido a Pavel, **y Pavel escribe español nativo.** Elimina la contratación que creíamos necesaria antes de finales de octubre. Se revisa en Gate B por el techo de escala |
| W-009 | Disponibilidad de Pavel | 2026-08-25 | Confirmada con dedicación al proyecto. **La Fase 3 queda fija el 21 de septiembre.** (Gate B se movió después al 5 de marzo por los 120 días del sitio #2; ver W-070) |
| W-092 | Correo de empresa que gestiona el proyecto | 2026-09-01 | **`microsites@wicfl.com`**, creado por Kevin. Desbloquea W-010, W-012, W-101 y toda la Fase 1. La credencial llegó por el chat de Zoom, así que **se rota en el primer login y la nueva vive solo en el vault**; ver W-010 |
| W-096 | Qué CRM usa WICFL | 2026-08-26 | **GoHighLevel con sub-account propia**, no la instancia de WAGS. Desbloquea W-025. Queda como tarea de Vic dar de alta la sub-account y sacar credenciales, no como pregunta a Kevin |
| W-001 | Quote escrito de GoTo por número mensual | 2026-08-25 | **$0.99 por número.** $1,188/año a 100 números, por debajo de la ruta de forwarding. Se compran directo en GoTo, se descarta Twilio. Ver `docs/COST_MODEL.md` |
