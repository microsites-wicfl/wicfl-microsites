# Relevo del arquitecto — WICFL Microsites

**Escrito el viernes 2 de octubre de 2026 por el agente arquitecto saliente (cowork), para el
agente que entra el lunes 5.** Léelo completo antes de hacer nada. Después: `CLAUDE.md`,
`BACKLOG.md`, las dos entradas más recientes de `BITACORA.md` y `docs/LAUNCH_RUNBOOK.md`.

Si este documento y el repo se contradicen, manda el repo. Si este documento y la memoria del
agente se contradicen, manda este documento.

---

## 1. Dónde estamos, en una pantalla

- **Qué es:** la fábrica de microsites de seguros de Walker. No es un sitio: es el sistema que
  los genera desde un `site.config.json` y páginas en Markdown.
- **Sitio #1, Stuart (`stuarthomeownersinsurance.com`): se lanza el viernes 9 de octubre.** La
  parte técnica está terminada. Lo que falta es contenido de Pavel, una aprobación de Kevin y
  los pasos del día.
- **Sitio #2, Port St. Lucie (`portsaintluciehomeinsurance.com`):** Pavel lo empieza el lunes 12
  desde Studio → New site.
- **Sitio #3:** lo arma Pavel solo, como prueba de que la fábrica funciona sin ayuda (13 de
  noviembre). **La decisión comercial de Kevin** sobre escalar es en marzo de 2027.

### Fechas de la semana que entra

| Día | Qué pasa | Quién |
|---|---|---|
| Lun 5 y mar 6 | Pavel arma la portada de Stuart y deja el sitio listo en Studio | Pavel |
| Mar 6 | Revisión de Stuart y decisión: ¿sale con el diseño nuevo? | Vic + arquitecto |
| Mié 7 | Ensayo final de publicación; la revisión automática debe salir limpia | Vic + Claude Code |
| Vie 9 | Lanzamiento, por la mañana hora del este. `docs/LAUNCH_RUNBOOK.md`, pasos 1 a 8 | Vic |
| Vie 9 o sáb 10 | Encender las publicaciones automáticas al dominio real (prompt 033) | Claude Code |
| Lun 12 | Pavel empieza Port St. Lucie | Pavel |

---

## 2. Quién es quién y cómo se trabaja

- **Vic:** decide y habla con el equipo. **No ejecuta comandos, ni de lectura.** Solo se le piden
  pasos de navegador que necesitan a una persona.
- **Tú (arquitecto):** piensas, decides, escribes prompts y documentación, revisas, y escribes el
  código de **Studio** (`apps/studio/`). Mantienes `BITACORA.md` y `BACKLOG.md` sin que te lo pidan.
- **Claude Code (ejecutor desde el 29-sep; antes Codex):** todo el código fuera de Studio, y
  **todos los push**. Recibe una línea que apunta a un archivo de `prompts/`, y deja reporte en
  `reports/`.
- **Pavel:** SEO y contenido. Opera Studio por su cuenta. Vic quiere que sea autónomo: todo lo
  que necesite debe estar en el manual.
- **Kevin:** dueño. No lee mensajes largos y tarda en contestar. Solo se le pide lo que nadie
  más puede resolver.

### El ciclo, sin excepciones

1. Escribes el prompt en `prompts/YYYY-MM-DD_NNN_slug.md` (plantilla: `prompts/TEMPLATE.md`) y lo
   commiteas.
2. Le das a Vic **una sola línea** para pegar en Claude Code:
   `Read CLAUDE.md, then execute prompts/<archivo>. Write the report it asks for in reports/, commit, push and wait for every workflow the push triggers.`
3. Claude Code ejecuta, escribe `reports/…` y sube.
4. **Revisas contra el diff, no contra el reporte,** y contra el resultado real (sección 5).
   Escribes `## Revisión de cowork` al final del reporte.
5. Solo entonces sale el siguiente prompt. **Uno a la vez.**

Tus commits (docs y Studio) se quedan locales: los sube Claude Code con una línea como
`Read CLAUDE.md, then push the local commit <hash> on main (docs only). Do not execute any prompt. Confirm origin/main matches and list every workflow the push triggered with its conclusion.`

Todo commit termina con:

```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: <la liga de tu sesión>
```

### Cómo hablarle a cada quien

- **Con Vic:** español de México, sin voseo, corto. Nunca abras con un número de backlog o de
  prompt: primero di qué es la cosa, y el número va entre paréntesis.
- **Copy para el chat del equipo (Kevin, Pavel):** inglés, chat de Zoom, primera persona (lo
  manda Vic), saludo humano, pedir como pregunta ("Could you help me with this part?"), pasos
  numerados, sin rayas largas, sin saltos de línea dentro de un párrafo, y el tema antes de los
  puntos.
- **Copy para Pavel en privado:** español y **breve**.
- **Todo lo que se construye va en inglés:** Studio, sitios, manual.

---

## 3. Lo que está hecho

- Plantilla de sitios con el diseño de Pavel: header, footer y 9 secciones de página
  (`packages/config-schema/blocks.mjs` es la gramática única para el build y para Studio).
- **Studio** (`https://wicfl-studio.wicfl-microsites.workers.dev`, detrás de Cloudflare Access):
  páginas, imágenes, logos, datos del sitio, sitio nuevo, vista previa por borrador y publicar.
- Formulario de cotización de 3 pasos que guarda el lead en GoHighLevel (sub-cuenta Walker
  Insurance) con **Contact source** = el slug del sitio. No pone tags.
- Analítica: GA4 `G-YBYQXRCBLN` y GTM `GTM-TV5RN2DB` (versión 3 publicada). El sitio solo carga
  GTM en su dominio real. Eventos: `quote_start`, `quote_step`, `generate_lead`,
  `policy_upload`, `phone_click`.
- Schema de SEO generado: un `InsuranceAgency` con los datos del sitio, Walker como
  `Organization`, zona de servicio con tipo, `WebPage`/`ContactPage`, migas de pan, `FAQPage` y
  `Service` cuando la página tiene **Service name**.
- **Sitio nuevo con el diseño de Pavel:** New site crea la portada con el esqueleto de
  secciones, instrucciones entre corchetes y tres imágenes de muestra. Studio y la revisión de
  producción bloquean mientras queden.
- Ensayo de publicación en `preview.stuarthomeownersinsurance.com`.
- Manual de Pavel, versión 2.5, en inglés y español: https://claude.ai/artifact/5ebz5VQL1Q7iFrLv9zJ6B5

---

## 4. Lo que falta, por dueño

### Pavel, para el martes 6 (todo en Studio; la lista está en el manual, "Getting Stuart ready to launch")

1. Guardar cualquier cambio en Stuart para recuperar su vista previa (ver el incidente, sección 6).
2. **Service name** en cada página de cobertura.
3. Un solo nombre de marca, sin "(Demo)", y quitar "demo" de los campos de SEO. Hoy son los
   únicos cuatro hallazgos que impiden publicar en producción.
4. Zona de servicio.
5. La portada con sus fotos y el logo blanco.
6. La política de privacidad, y mandársela a Kevin.
7. Borrar las dos páginas de prueba viejas (`about-demo`, `coverage-demo`).
8. Rich Results Test sobre la dirección de revisión
   (`wicfl-stuart-homeowners-published.wicfl-microsites.workers.dev`), no sobre el dominio real.

### Kevin

1. **Aprobar la política de privacidad.** Sin ella no se lanza: el formulario pide datos
   personales. Es lo más ajustado de todo el calendario.
2. **Número nuevo de GoTo para Port St. Lucie.** El que dio, (772) 335-4779, recibe llamadas
   desde julio: es una línea existente y mezclaría las llamadas del sitio con las de siempre.
3. Acceso de facturación en Google Cloud (rol Billing Account User para `microsites@wicfl.com`),
   para el autocompletado de direcciones. **No bloquea el lanzamiento.**

Lleva varios días sin contestar los puntos 2 y 3. Vic decide cuándo insistir.

### Vic

- Descartar el borrador de prueba "Testville Test Site" en Studio (lo creó el arquitecto para
  probar; es un clic en Discard draft).
- El día 9: el runbook completo.

### Tú, esta semana

1. **Lunes:** comprobar que la vista previa de Stuart ya sale y que Pavel avanza. Responder sus
   dudas con cambios al manual, no con explicaciones sueltas.
2. **Martes 6:** revisar Stuart contra `docs/QA_CHECKLIST.md` y contra el ejemplo. Correr la
   revisión de producción (`node scripts/check-production-config.mjs stuart-homeowners`): debe
   salir limpia.
3. **Miércoles 7:** ensayo final (runbook, precondición 5).
4. **Viernes 9:** acompañar el lanzamiento paso a paso. Después del paso 7, darle a Vic la línea
   del prompt 033.
5. **Después del lanzamiento:** una publicación mínima desde Studio para confirmar que llega al
   dominio real.

---

## 5. Cómo se verifica (lo que más importa de este documento)

1. **Después de cada push se revisan todos los workflows del commit:** "Validate and build",
   "Publish site Workers", y "Deploy WICFL Studio" si se tocó `apps/studio/`. Uno solo en verde
   no significa nada.
2. **"Pasa en la máquina de Vic" no es verificación.** Su `node_modules` tiene paquetes que el
   repo no declara. La reproducción válida es `npm ci` en una copia limpia, o el run de GitHub.
3. **Una función nueva de Studio se prueba en el Studio real,** no solo con sus pruebas.
4. **Las capturas son evidencia; los números no.** Abre la página y mírala.
5. **Antes de recomendar un cambio de rumbo, busca si ya se decidió.**
   `grep -n -i "<tema>" BITACORA.md BACKLOG.md`.

---

## 6. El incidente de esta semana

Del 30 de septiembre al 2 de octubre, **todas las vistas previas de Studio fallaron** y nadie lo
notó hasta que Pavel no pudo publicar.

- **Causa:** el cambio de analítica metió en `npm run check` una prueba que importaba
  `playwright`, que no estaba en `package.json`. En GitHub, `npm ci` no lo instala.
- **Por qué no se vio:** el ejecutor y el arquitecto miraron solo "Publish site Workers", que no
  corre `npm run check`. "Validate and build" estuvo en rojo siete commits.
- **Arreglo (`7185cb6`):** la prueba de navegador vive aparte (`npm run check:browser`, con su
  propio job). `npm run check` no puede depender de un navegador.
- **Detalle útil:** volver a correr un run de un borrador reutiliza el merge viejo. Para que un
  borrador tome un arreglo de `main` hace falta un guardado nuevo en Studio.

Detalle completo: `BITACORA.md`, entrada del 2 de octubre.

---

## 7. Prompts escritos y sin ejecutar

| Archivo | Qué hace | Cuándo |
|---|---|---|
| `prompts/2026-09-30_029_google-places-activar.md` | Enciende el autocompletado de direcciones | Cuando Kevin dé el acceso de facturación y Vic guarde la llave en `apps/lead-api/.env` |
| `prompts/2026-10-02_033_deploy-automatico-produccion.md` | Publicación automática al dominio real en cada push | **Solo después del lanzamiento.** Su primer paso lo comprueba |

Todos los demás, del 001 al 035, están ejecutados y revisados.

---

## 8. Decisiones cerradas: no las reabras sin un dato nuevo

- **Sin dirección postal en ningún sitio.** Kevin, 23-sep, y otra vez el 2-oct ("No address on
  any site"). El schema sale sin `address` y el Rich Results Test puede marcarlo: se deja así.
- **Sin número de licencia en los sitios.**
- **El schema se genera, no se escribe.** Studio no tiene editor de schema. Lo único que decide
  el operador es qué página es un servicio.
- **El teléfono y el correo del schema son los del sitio,** no los generales de Walker.
- **La plantilla de un sitio nuevo da estructura, nunca texto.** Dos sitios con las mismas frases
  fallan la prueba de cambiar la ciudad.
- **Todo el producto en inglés.** El sitio en español del plan original sigue como pregunta
  abierta para Kevin (W-031).
- **Workers con Static Assets, un monorepo, ningún sitio a mano.** Ver `CLAUDE.md`.

---

## 9. Lo que quedó sin hacer o desactualizado

Lo digo tal cual, para que no construyas sobre algo que no existe:

- **`docs/master-file-source.html` (la página viva del equipo) y `WICFL-microsite-schedule.xlsx`
  no se tocan desde el 24 de septiembre.** No reflejan Studio, el diseño nuevo, la analítica ni
  el schema. `docs/SCHEDULE.md` todavía dice que el sitio #2 es en español. Hay que decidir con
  Vic si se actualizan o se retiran; hoy nadie del equipo los usa como referencia, usan el
  manual y los updates por chat.
- **`PROJECT_BRIEF.md` y partes de `prompts/00_GUIA_GLOBAL.md`** describen el arranque del
  proyecto. Sirven de historia, no de estado.
- **La prueba de punta a punta de la analítica** (GTM Preview, tiempo real en GA4) solo se puede
  hacer con el dominio real, el día 9. Lo mismo marcar `generate_lead` y `phone_click` como
  eventos clave: GA4 no deja hacerlo antes de que lleguen.
- **La grabación de llamadas del número de Stuart** no está confirmada. Se confirma con la
  llamada de prueba del lanzamiento.
- **Conteo semanal de llamadas para la decisión de marzo:** no existe. La integración de GoTo de
  `ovas-internal` ve la misma cuenta y sería la fuente natural, pero falta decidir si este
  proyecto lee de ahí o tiene su propia credencial. No se ha tocado su base de producción.
- **Imágenes de muestra huérfanas:** Studio no tiene botón para borrar imágenes. Un sitio creado
  con New site conserva sus tres `sample-*.jpg` aunque ya no se usen.
- **Menores:** hueco entre el eyebrow y el título en la banda de cotización; `astro dev` falla
  con rutas con espacios; aviso de Astro por el `index` duplicado en el sitio de práctica.

### Una pregunta para Vic que no alcancé a hacer

**El repositorio de GitHub es público** (`microsites-wicfl/wicfl-microsites`). No contiene
secretos: los `.env` están ignorados y los tokens viven en GitHub y Cloudflare. Pero la bitácora,
el backlog y los reportes sí se ven desde fuera, con decisiones internas, teléfonos y nombres.
Pregúntale si es a propósito. Cambiarlo a privado puede afectar los minutos gratuitos de
Actions, así que es una decisión, no un arreglo.

---

## 10. El entorno de trabajo y sus trampas

Esto es lo que más tiempo te va a ahorrar.

### El repo en la computadora de Vic

- Ruta: `C:\Users\vitor\Coding\WICFL Microsites`. En el shell del dispositivo:
  `$HOME/mnt/WICFL Microsites`.
- **Usa siempre `git --no-optional-locks`** para leer (`status`, `log`, `show`).
- **Después de cada commit tuyo quedan candados y temporales** que el shell no puede borrar sin
  permiso: `.git/HEAD.lock`, `.git/index.lock` y `.git/objects/**/tmp_obj_*`. Si se quedan,
  Claude Code no puede commitear. Cierra cada commit con:
  `rm -f .git/HEAD.lock .git/index.lock; find .git/objects -name "tmp_obj_*" -delete`
  y comprueba que no quede nada. **El permiso de borrado se vence cada vez que se reconecta el
  dispositivo:** si el `rm` falla con "Operation not permitted", pídelo de nuevo
  (`device_request_delete_permission`) antes de seguir.
- `.agents/` aparece siempre como no rastreado. Es una copia de las skills que dejó Codex. Las
  skills reales están en `.claude/skills/`. No lo toques.
- `_drafts/` está fuera de git. Ahí viven los documentos de Pavel
  (`_drafts/microsite-1-structure/`: portada, páginas de cobertura y su referencia de schema v1 y
  v2), las capturas de revisión y la copia de la fuente del manual (`_drafts/handbook/`).

### Qué corre dónde

- **En el shell del dispositivo sí corren:** las pruebas de Studio
  (`cd apps/studio && node --test "test/*.test.js"`), `node scripts/check-production-config.mjs <slug>`,
  y cualquier script de Node que no compile nativos.
- **No corre `astro build`:** el `node_modules` es de Windows y le falta el binario de Linux de
  rollup. Para ver un sitio construido, sube el cambio y míralo publicado.
- **Red:** desde el contenedor en la nube y desde el shell del dispositivo, `workers.dev`, la API
  de GitHub y los bancos de fotos devuelven 403. Lo que sí llega:
  - el **navegador integrado** abre los sitios publicados en `workers.dev` (sirve para revisar
    páginas y leer su schema con JavaScript);
  - **Chrome con la sesión de Vic** abre Studio (está detrás de Cloudflare Access) y puede leer
    la API pública de GitHub desde la página, para ver el estado de los workflows.
- **Imágenes:** no hay acceso a bancos de fotos. Las de muestra se dibujaron con Python (PIL).

### Direcciones

- Studio: `https://wicfl-studio.wicfl-microsites.workers.dev`
- Stuart, versión de revisión: `https://wicfl-stuart-homeowners-published.wicfl-microsites.workers.dev`
- Sitio de práctica: `https://wicfl-_example-published.wicfl-microsites.workers.dev`
  (`/blocks-fixture/` muestra todas las secciones; `/stuart-home-demo/` es la portada de ejemplo)
- Vista previa de un borrador: `https://wicfl-pr<N>-<slug>.wicfl-microsites.workers.dev`
- Ensayo en el dominio: `https://preview.stuarthomeownersinsurance.com`
- API de leads: `https://wicfl-lead-api.wicfl-microsites.workers.dev`

### El manual de Pavel

- Es un artifact: https://claude.ai/artifact/5ebz5VQL1Q7iFrLv9zJ6B5. Para cambiarlo, léelo
  primero con la herramienta Artifact y publícalo pasando esa misma liga; sin la liga se crea
  otro y la de Pavel se queda congelada.
- Su texto de referencia es `docs/OPERATOR_GUIDE.md`. Los dos se actualizan juntos.
- Copia de la fuente y sus capturas: `_drafts/handbook/`.

### Seguridad

- Nunca imprimas, copies ni pegues valores de un `.env`. Los secretos de la API de leads viven en
  `apps/lead-api/.env` (ignorado por git) y en los secretos de GitHub.
- Vic no pega llaves en el chat.
- Borrar archivos necesita permiso explícito. Los borrados en el navegador (descartar un
  borrador, borrar un contacto) los confirma Vic.
- `ovas-internal` es otro proyecto: solo lectura, y nada contra su base de producción sin que Vic
  lo apruebe.

---

## 11. La primera acción del lunes

Abrir Studio con la sesión de Vic y comprobar que **la vista previa de Stuart está lista** después
del último guardado de Pavel. Si falla, es lo primero que se arregla: sin vista previa Pavel no
puede publicar, y sin el trabajo de Pavel no hay lanzamiento el viernes.
