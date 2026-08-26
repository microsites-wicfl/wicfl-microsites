# PROJECT BRIEF — WICFL Microsites

**Última actualización:** 2026-08-26
**Para:** el agente que retome este proyecto sin haber estado en la conversación original.

Este archivo existe para que puedas arrancar mañana sin preguntarle nada a Vic.
Contiene el contexto completo: de dónde salió el proyecto, qué se decidió, qué se
peleó, y qué falta.

---

## 1. De dónde salió esto

El 2026-08-24 Kevin Walker (owner) le escribió a Vic pidiendo su opinión sobre montar
**100+ microsites de seguros altamente segmentados** para WICFL, usando Cloudflare como
plataforma. Kevin ya había investigado y llegó a una arquitectura razonable por su cuenta:
template → GitHub → Cloudflare Pages → dominio propio.

Kevin asignó a **Pavel** como lead del proyecto, y le pidió a Vic solo la arquitectura
inicial, para que Vic siga enfocado en WAGS.

Ejemplos de nichos que Kevin quiere atacar:
Stuart Flood Insurance · Port St. Lucie Homeowners · Florida Roofing Contractor Insurance ·
South Florida Landlord · Waterfront Home Insurance · Seguro de Casa Florida ·
Seguro para Contratistas · sitios comerciales en español para Miami/Broward.

Cada microsite: 15–25 páginas iniciales, creciendo a 40–50 si rankea.

---

## 2. El riesgo que Vic puso sobre la mesa (y que cambió el plan)

**La política de spam de Google nombra este patrón textualmente.** Bajo doorway abuse:

> "Having multiple domain names or pages targeted at specific regions or cities that
> funnel users to one page."

El spam update de junio 2026 lo aplicó contra negocios locales y home services.
Además hay un segundo problema menos dramático: 100 dominios nuevos son 100 sitios con
autoridad cero, sin backlinks, sin Google Business Profile, sin reseñas. En búsqueda
local eso es lo que decide rankings, no la calidad del sitio.

**Conclusión que Vic le vendió a Kevin:** construir la fábrica sí, pero probar con pocos
sitios antes de escalar. Kevin aceptó y de hecho fue más lejos de lo que Vic propuso:
arrancar con **2 sitios** (uno en inglés, uno en español) y usar el **sitio #3** como
prueba explícita de repetibilidad.

---

## 3. Feedback de Vic al plan de Kevin (todo aceptado)

Kevin mandó un plan de equipo el 2026-08-25. Vic respondió con siete cambios:

1. **Workers en vez de Pages.** Kevin había vuelto a poner Pages.
2. **Dos gates, no uno.** El más importante. Ver sección 5.
3. **El sitio #3 tiene que generarse, no construirse a mano.** Si los tres se hacen a
   mano, el #3 sale más rápido de todos modos porque Pavel ya lo hizo dos veces. Eso mide
   la curva de aprendizaje de Pavel, no la fábrica. Por eso el config schema y el comando
   de scaffold se movieron a Fase 2.
4. **Nadie tenía asignado el contenido.** Sigue abierto. Es la línea de costo dominante.
5. **La regla de diferenciación como restricción del proyecto, con gate automático de CI.**
6. **Cerrar las dos decisiones en ruta crítica:** quote de GoTo y dueño de la cuenta de Cloudflare.
7. **Señales locales (GBP) y un número concreto para "evaluate performance".**

El hilo que conecta 2, 3 y 7: Kevin escribió un buen plan de **secuencia** pero sin
**criterios de paso**. Sabía qué sigue después de qué, no qué tiene que ser cierto para avanzar.

---

## 4. Arquitectura decidida

Detalle completo en `docs/ARCHITECTURE.md`. Resumen:

| Decisión | Elección |
|---|---|
| Hosting | Cloudflare Workers con Static Assets |
| Framework | Astro |
| Repos | Un monorepo |
| Dominios | Cloudflare Registrar (at-cost, API en beta desde abril 2026) |
| Agrupación | Pods de ~25 sitios por Worker |
| Contrato | `site.config.json` schema |
| Guardrail | Gate de CI que bloquea deploy por similaridad de contenido entre sitios |

---

## 5. Los dos gates (lo más importante del plan)

Son dos preguntas distintas que se resuelven en tiempos completamente distintos.
**El criterio completo y actualizado vive en `docs/SCHEDULE.md`**; esto es el resumen.

**Gate A — ¿funciona la fábrica?** · 13 nov 2026 · Pavel solo
Cuatro criterios, todos obligatorios. Los dos que mandan se verifican con un comando: el diff
de Pavel toca únicamente `sites/<slug>/**`, y regenerar el sitio desde su config reproduce lo
que se publicó. Los otros dos son tiempo de fábrica ≤2 días hábiles con las esperas de vendor
excluidas, y cero código de Vic con cada pregunta registrada. Si falla, regresa a Fase 5.

*Historia de este criterio, porque va a volver a discutirse:* la primera versión decía "5 días
hábiles" sin aclarar si escribir el contenido contaba adentro. El 26-ago se excluyó el contenido
y se apretó a 2 días. Ese mismo día se cambió la unidad, porque dos días de reloj de pared miden
también la cola de emisión de certificados de Cloudflare, que va de quince minutos a 24 horas.
El tiempo quedó como tercer criterio; los verificables por comando son el gate.

**Gate B — ¿los sitios producen negocio?** · 5 mar 2027 · Kevin
Pasa si los sitios #1 y #2 pegan el número de llamadas calificadas de W-005, medido a 120 días
de cada launch. **Movido desde el 12 de febrero**: los 120 días del sitio #2, que lanza el 30 de
octubre, caen el 27 de febrero. El número todavía no existe, pero el modelo para derivarlo sí,
en `docs/GATE_B_MODEL.md`. Si falla, no se escala.

**Por qué separados:** un dominio nuevo tarda 3 a 6 meses en mostrar orgánico. Gate A se
resuelve en semanas. Colapsarlos es como un equipo termina con 20 sitios que despliegan
hermoso y no generan nada. Las fases 7 y 8 corren en paralelo justo para que la espera
no sea tiempo muerto.

---

## 6. Costos (verificados el 2026-08-24)

Detalle y fuentes en `docs/COST_MODEL.md`. Los tres números que importan:

- **La plataforma no es un costo.** Cloudflare Workers Paid son $5/mes por cuenta completa,
  no por sitio, y los requests a static assets son gratis e ilimitados. A 100 sitios toda
  la plataforma corre en ~$3,375/año.
- **El .com sube el 1 de noviembre de 2026**, de $10.26 a $10.97 wholesale, y es la
  primera de cuatro alzas anuales de ~7%.
- **Los números de tracking ya no son incógnita.** GoTo confirmó **$0.99 por número** el
  25-ago, o sea $1,188/año a 100 números. Los comparativos terceros los ponían entre $6,000 y
  $18,000/año. **Lección conservada: siempre pedir el quote escrito**, porque planear contra
  comparativos publicados habría sobrepresupuestado esa línea hasta en $15,000 al año, o peor,
  habría matado el escenario de 100 sitios por una restricción que no existía.

El costo real del proyecto es el **contenido**: ~$100,000 a 100 sitios a $50/página.

---

## 7. Estado actual y qué sigue

**Al 2026-08-26, Fase 0 cerrando.** No existe código de producto todavía. `BACKLOG.md` es la
fuente de verdad; esto es el recordatorio.

**Cerrado el 25-ago:** quote de GoTo ($0.99/número), dueño del contenido (Pavel, que además
escribe español nativo) y disponibilidad de Pavel (fechas fijas).

**Bloqueadores activos, los seis de Kevin y ninguno respondido:** W-092 (correo de empresa para
Cloudflare), W-093 (vault y tarjeta de empresa), W-094 (org de GitHub), W-096 (qué CRM usa
WICFL), W-008 (assets de marca) y W-095 (quién firma el contenido antes de publicar).

**El que corre reloj:** sin W-092 no hay cuenta de Cloudflare el lunes 31 de agosto, y Pavel
arranca su primer día de tiempo completo sin accesos.

**Lo primero que se ejecuta y no depende de Kevin:** `prompts/2026-08-25_001_site-config-schema.md`.

---

## 8. Contexto de relaciones y tono

- **Kevin** escucha argumentos técnicos si vienen con razonamiento y datos verificados.
  Aceptó los siete cambios de Vic sin fricción. No le hables en jerga: hay un glosario
  en el master file justo por eso.
- **Pavel** es contratista y es quien va a operar la fábrica. Su primera pregunta fue si
  Victor iba a escribir los sitios en HTML o él. La respuesta: Vic construye la fábrica,
  Pavel construye los sitios, y nadie escribe HTML a mano.
- **Vic** quiere alcance acotado. La Fase 2 termina con handoff documentado justo para
  que Vic salga de la ruta crítica y vuelva a WAGS.

---

## 9. Enlaces

- **Master file (referencia viva del equipo):** https://claude.ai/code/artifact/b1c34949-479b-48f6-a269-8522d4b2aa82
- **Calendario de actividades:** `WICFL-microsite-schedule.xlsx`
- Proyecto hermano: `../Walker Insurance Agency`
