# PROJECT BRIEF — WICFL Microsites

**Última actualización:** 2026-08-25
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

Son dos preguntas distintas que se resuelven en tiempos completamente distintos:

**Gate A — ¿funciona la fábrica?** · 13 nov 2026 · Pavel
Pasa si el sitio #3 se genera desde config y sale en 5 días hábiles o menos, con cero
código escrito por Vic. Si falla, regresa a Fase 5.

**Gate B — ¿los sitios producen negocio?** · 12 feb 2027 · Kevin
Pasa si los sitios #1 y #2 pegan el número de llamadas calificadas definido en la
actividad 0.7, medido a 120 días de cada launch. Si falla, no se escala.

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
- **Los números de tracking son la mayor incógnita.** GoTo no publica precio por DID.
  El rango de comparativos terceros es $6,000–$18,000/año a 100 números, contra ~$1,900/año
  si se compran los números aparte y se reenvían al mismo GoTo.

El costo real del proyecto es el **contenido**: ~$100,000 a 100 sitios a $50/página.

---

## 7. Estado actual y qué sigue

**Fase 0 (24–28 ago 2026):** alineación y decisiones. Casi todo es de Kevin.

Bloqueadores activos, ambos de Kevin:
- Quote escrito de GoTo por número mensual
- Dueño del contenido asignado + escritor nativo de español

Lo primero que se ejecuta en cuanto Fase 0 cierre está en `BACKLOG.md` bajo "Fase 1".

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
