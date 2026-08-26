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

| id | Item | Dueño | Debido | Bloquea |
|---|---|---|---|---|
| W-003 | Nicho y mercado en inglés para sitio #1 | Kevin | 2026-08-28 | W-016 |
| W-004 | Nicho y mercado en español para sitio #2 | Kevin | 2026-08-28 | W-016 |
| W-005 | Número concreto para Gate B | Kevin **aprueba**, Vic propone | 2026-08-28 | Gate B es indecidible sin él. **El modelo ya está en `docs/GATE_B_MODEL.md`**: Kevin solo llena tres celdas (comisión promedio por póliza, tasa de cierre de llamada a venta, y qué retorno anual por sitio justifica seguir). Un número que hay que aprobar se aprueba; uno que hay que inventar se pospone hasta que los datos lo inventen solos |
| W-100 | **Definir qué cuenta como "llamada calificada" y cómo se registra** | Kevin + Vic | 2026-09-25 | **Hueco encontrado el 26-ago.** El bar de Gate B se mide en llamadas calificadas y nadie ha dicho qué califica. La definición determina qué tiene que capturar el tracking, y el tracking se cablea antes del launch del 9 de octubre. Incluye disposición de llamadas en GoTo y etiquetado semanal, no trimestral: nadie clasifica 120 días de llamadas de memoria en marzo |
| W-006 | ¿Los sitios piloto tienen su propio Google Business Profile? | Kevin | 2026-08-28 | Puede cambiar qué nichos son viables |
| W-007 | Dominios aprobados para sitios #1 y #2 | Kevin | 2026-09-04 | W-011. Se aprueban DESPUÉS de W-016 |
| W-092 | Correo de empresa que será dueño de la cuenta de Cloudflare, y quién es el segundo Super Administrator | Kevin | 2026-08-28 | W-010. Bloquea la mañana del lunes 31 |
| W-093 | Vault compartido de contraseñas y tarjeta de empresa para billing | Kevin | 2026-08-28 | W-010 |
| W-094 | ¿Walker ya tiene org de GitHub o se crea una nueva? | Kevin | 2026-08-28 | W-012 |
| W-096 | **¿Qué CRM usa WICFL?** ¿La misma instancia de HighLevel que WAGS, una subcuenta, u otra cosa? | Kevin | 2026-09-04 | W-025. Aparece a media Fase 2 y nadie lo había nombrado |

---

## Fase 1 — Infraestructura y validación (31 ago – 4 sep 2026)

| id | Item | Dueño | Notas |
|---|---|---|---|
| W-010 | Crear cuenta Cloudflare con correo de empresa, 2 Super Admins, Pavel como Administrator, 2FA, recovery codes en vault compartido | Vic | Ver `docs/ACCOUNTS_AND_ACCESS.md`. NUNCA con correo personal |
| W-012 | Crear org de GitHub y monorepo, configurar accesos | Vic | |
| W-013 | Configurar zonas, DNS y SSL | Vic | Depende de W-011 |
| W-014 | Levantar pipeline de deploy con Workers Static Assets + GitHub Actions | Vic | Incluye los preview deploys por rama de W-098. Montarlos después cuesta el doble |
| W-015 | Cerrar `docs/ARCHITECTURE.md` en su versión de handoff | Vic | |
| W-016 | **Validación SEO del nicho antes de comprar dominio**: keywords, search intent, competencia en SERP, ángulo local real | Pavel | *(aporte de Pavel)* Si el nicho está dominado por agregadores sin ángulo local, se descarta y Kevin elige otro. **Bloquea W-007 y W-011** |
| W-017 | **Provisionar accesos a Pavel**: Cloudflare Administrator, GitHub, GoTo, GA4, Search Console | Vic | **Movido al 31 de agosto.** Pavel arranca de tiempo completo ese día; esperar accesos hasta el 2 de septiembre son dos días perdidos |
| W-011 | Registrar dominios de sitios #1 y #2 vía Cloudflare Registrar | Vic | Depende de W-007, que ahora depende de W-016 |

---

## Track paralelo — Rampa técnica de Pavel (31 ago – 18 sep 2026)

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
| W-020 | Definir el `site.config.json` schema + validación | Vic + Pavel | **El artefacto más importante del proyecto.** Pavel revisa y rompe antes de cerrarlo |
| W-021 | Template base de Astro: layouts, componentes, design system | Vic | |
| W-022 | Ruteo bilingüe en/es con `hreflang` | Vic | Se construye ahora, no se retrofitea |
| W-026 | Comando `new-site`: genera un sitio desde su config | Vic | **Versión mínima y tosca a propósito.** Solo renderiza el template desde config. Se reescribe durante los pilotos. Ver decisión en `docs/ARCHITECTURE.md` |
| W-098 | **Preview deploy por rama**: Pavel hace push de markdown y recibe una URL con su sitio renderizado | Vic | **Hueco encontrado el 26-ago.** Sin esto Pavel escribe tres semanas a ciegas o te pide a ti que se lo enseñes, que es justo la dependencia que el handoff existe para cortar. Se monta junto con W-014 |
| W-029 | **La lista** del checklist de QA y launch: técnico, SEO, contenido, mobile, conversión, tracking, deploy | Pavel + Vic | *(aporte de Pavel)* Es la definición de "listo para publicar" de Pavel. Si no existe el 21 de septiembre, escribe sin saber contra qué y la lista se acaba escribiendo el 8 de octubre para empatar con lo que ya construyó. Medio día, sobre todo trabajo suyo |
| W-028 | Sesión de handoff con Pavel + documentación escrita | Vic + Pavel | Criterio de salida: Pavel genera un sitio vacío sin ayuda. **Correrlo el 17, no el 18**, para que una falla deje un día |

### Bloque B — obligatorio para el launch del sitio #1, 9 de octubre

Se construye durante la Fase 3, con Pavel ya operando. Si alguno se desborda, se recorre
dentro de octubre sin tocar el handoff ni el 21 de septiembre.

| id | Item | Dueño | Notas |
|---|---|---|---|
| W-023 | SEO técnico: sitemap, robots, canonical, schema.org InsuranceAgency | Vic | El template del Bloque A no debe impedirlo |
| W-024 | Número de tracking como campo de config, ruteado a GoTo | Vic | GoTo confirmado a $0.99/número |
| W-025 | Analytics (GA4 + GTM) y captura de leads al CRM, con sitio de origen en cada lead | Vic | **Depende de W-096**, el CRM no está decidido |
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
| W-090 | Confirmar con Cloudflare el alta masiva de zonas en plan free | A los ~25 dominios, no a los 90 |
| W-091 | Evaluar si conviene hub-and-spoke en vez de portfolio de dominios | Solo si Gate B falla |

---

## Done

| id | Item | Cerrado | Resultado |
|---|---|---|---|
| W-002 | Dueño del contenido y escritor de español | 2026-08-25 | Kevin asignó el rol de contenido a Pavel, **y Pavel escribe español nativo.** Elimina la contratación que creíamos necesaria antes de finales de octubre. Se revisa en Gate B por el techo de escala |
| W-009 | Disponibilidad de Pavel | 2026-08-25 | Confirmada con dedicación al proyecto. **La Fase 3 queda fija el 21 de septiembre y Gate B el 12 de febrero** |
| W-001 | Quote escrito de GoTo por número mensual | 2026-08-25 | **$0.99 por número.** $1,188/año a 100 números, por debajo de la ruta de forwarding. Se compran directo en GoTo, se descarta Twilio. Ver `docs/COST_MODEL.md` |
