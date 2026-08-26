# BACKLOG — WICFL Microsites

Items priorizados. **Solo cowork crea items nuevos.** El agente ejecutor puede cerrar el
item que su prompt cerraba, con refs a prompt/report/commit, pero no crea ni reprioriza.

Formato de id: `W-NNN` · Última actualización: 2026-08-25 (GoTo, contenido y disponibilidad resueltos)

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
| W-005 | Número concreto para Gate B | Kevin + Vic | 2026-08-28 | Gate B es indecidible sin él |
| W-006 | ¿Los sitios piloto tienen su propio Google Business Profile? | Kevin | 2026-08-28 | Puede cambiar qué nichos son viables |
| W-007 | Dominios aprobados para sitios #1 y #2 | Kevin | 2026-09-04 | W-011. Se aprueban DESPUÉS de W-016 |
| W-092 | Correo de empresa que será dueño de la cuenta de Cloudflare, y quién es el segundo Super Administrator | Kevin | 2026-08-28 | W-010. Bloquea la mañana del lunes 31 |
| W-093 | Vault compartido de contraseñas y tarjeta de empresa para billing | Kevin | 2026-08-28 | W-010 |
| W-094 | ¿Walker ya tiene org de GitHub o se crea una nueva? | Kevin | 2026-08-28 | W-012 |

---

## Fase 1 — Infraestructura y validación (31 ago – 4 sep 2026)

| id | Item | Dueño | Notas |
|---|---|---|---|
| W-010 | Crear cuenta Cloudflare con correo de empresa, 2 Super Admins, Pavel como Administrator, 2FA, recovery codes en vault compartido | Vic | Ver `docs/ACCOUNTS_AND_ACCESS.md`. NUNCA con correo personal |
| W-012 | Crear org de GitHub y monorepo, configurar accesos | Vic | |
| W-013 | Configurar zonas, DNS y SSL | Vic | Depende de W-011 |
| W-014 | Levantar pipeline de deploy con Workers Static Assets + GitHub Actions | Vic | |
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

| id | Item | Dueño | Notas |
|---|---|---|---|
| W-020 | Definir el `site.config.json` schema + validación | Vic + Pavel | **El artefacto más importante del proyecto.** Pavel revisa y rompe antes de cerrarlo |
| W-021 | Template base de Astro: layouts, componentes, design system | Vic | |
| W-022 | Ruteo bilingüe en/es con `hreflang` | Vic | Se construye ahora, no se retrofitea |
| W-023 | SEO técnico: sitemap, robots, canonical, schema.org InsuranceAgency | Vic | Generado desde config |
| W-024 | Número de tracking como campo de config, ruteado a GoTo | Vic | **Desbloqueado.** GoTo confirmó $0.99/número/mes el 25-ago. Se compran directo en GoTo |
| W-025 | Analytics (GA4 + GTM) y captura de leads al CRM, con sitio de origen en cada lead | Vic | |
| W-026 | Comando `new-site`: genera un sitio desde su config | Vic | **Versión mínima y tosca a propósito.** Solo renderiza el template desde config. Se reescribe durante los pilotos. Ver decisión en `docs/ARCHITECTURE.md` |
| W-027 | Gate de CI de diferenciación: bloquea deploy por similaridad entre sitios | Vic | Cuesta ~1 día y protege el portfolio permanentemente |
| W-029 | **Checklist de QA y launch**: técnico, SEO, contenido, mobile, conversión, tracking, deploy | Pavel + Vic | *(aporte de Pavel)* Todo lo automatizable va a CI, no a criterio humano |
| W-028 | Sesión de handoff con Pavel + documentación escrita | Vic + Pavel | Criterio de salida: Pavel genera un sitio vacío sin ayuda |

---

## Fase 3 y 4 — Sitios piloto · Pavel

| id | Item | Notas |
|---|---|---|
| W-030 | Sitio #1 en inglés, generado desde config, launch 9 oct | Arranca el reloj de 120 días de Gate B. **Fecha confirmada el 25-ago** |
| W-031 | Sitio #2 en español, launch 30 oct | **Pavel escribe el español nativo.** Nunca traducido ni generado desde brief en inglés |
| W-032 | Registrar horas de ambos como línea base de Gate A | |

---

## Fase 5 a 10

| id | Item | Notas |
|---|---|---|
| W-040 | Retro: catalogar todo lo que fue manual en sitios #1 y #2, y regresarlo al framework | 2–6 nov |
| W-041 | **Gate A**: sitio #3 generado por Pavel solo, ≤5 días hábiles, cero código de Vic | 13 nov |
| W-050 | Automatizar registro de dominio vía Cloudflare Registrar API | API en beta: solo registra, no renueva ni transfiere |
| W-051 | Automatizar zona, DNS y attach de custom domain | |
| W-052 | Automatizar alta en Search Console y envío de sitemap | |
| W-053 | Automatizar provisioning del número de tracking | |
| W-054 | Comando end-to-end: config entra, sitio vivo sale | |
| W-060 | Reporte mensual: impresiones, clics, llamadas, cotizaciones y ventas por sitio | Corre en paralelo desde 12 oct |
| W-070 | **Gate B**: decisión comercial de Kevin contra el número de W-005 | 12 feb 2027 |

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
