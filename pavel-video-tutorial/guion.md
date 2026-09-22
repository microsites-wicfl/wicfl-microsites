# Guión — Tutorial completo del operador (para Pavel)

Video de reemplazo para la junta que Pavel pidió. Cubre los dos caminos para publicar contenido
en WICFL Microsites: el formulario (el camino simple, para el 90% del trabajo real) y GitHub
directo (el camino de respaldo, para lo que el formulario todavía no hace). No explica qué es
git ni qué es un branch — solo los pasos, en el orden exacto en que se hacen.

**Cómo usar este documento:** es narración lista para grabar voz encima. Cada bloque tiene el
texto a decir y, debajo, la pantalla que debe estar en cámara en ese momento (`[PANTALLA: ...]`)
y, cuando existe, el archivo de captura ya preparado (`[CAPTURA: nombre-archivo.jpg]`). Los
bloques marcados `[CAPTURA PENDIENTE]` necesitan que tú grabes esa pantalla primero — el porqué
está explicado al final del documento, en "Capturas pendientes".

Duración estimada leyendo a ritmo normal: **13–16 minutos**.

---

## 0. Intro (≈40 seg)

**Decir:**

> Hola Pavel. Este video reemplaza la junta que pediste — es mejor tenerlo grabado porque vas a
> volver a esto más de una vez, y así no dependes de acordarte de lo que se dijo en una llamada.
>
> Te voy a mostrar cómo publicar contenido en los microsites de Walker Insurance. Hay dos
> caminos: uno simple, con un formulario, que vas a usar casi siempre. Y uno de respaldo,
> directo en GitHub, para las cosas que el formulario todavía no hace — crear una página nueva
> desde cero, o publicar varias páginas de un sitio nuevo de una sola vez.
>
> No hace falta que sepas qué es git ni qué es un "branch" para seguir este video. Te muestro
> exactamente qué hacer clic, en qué orden. Vamos.

**[PANTALLA: slide de título o cara a cámara]**

---

## 1. Lo esencial antes de tocar nada (≈50 seg)

**Decir:**

> Antes de los clics, dos reglas que valen para todo lo que vas a hacer.
>
> Primero: tú solo tocas el contenido de tu sitio — sus páginas en markdown, y un puñado de
> campos de marca y SEO. Nunca tocas el código del template, ni el de otro sitio. Si en algún
> momento sientes que necesitas editar algo fuera de la carpeta de tu sitio para lograr lo que
> quieres, para — eso es una señal de que algo le falta al sistema, no algo que tengas que
> resolver tú mismo. Avísale a Vic.
>
> Segundo: nada que publiques se va directo a producción. Todo pasa primero por un "pull
> request" — un borrador que corre revisiones automáticas y te da un link de preview en vivo
> antes de que nadie más lo vea. Vas a ver esa palabra un par de veces en el video; no necesitas
> entenderla a fondo, solo saber que es el paso intermedio antes de publicar de verdad, y que
> nada queda en vivo hasta que alguien aprieta "Merge."

**[PANTALLA: cara a cámara, o un diagrama simple: "tu sitio → borrador → preview → publicado"]**

---

## 2. Camino simple: el formulario (≈5–6 min)

**Decir:**

> Este es tu camino principal. Se llama `content-form`, vive en su propia dirección web, y no
> necesitas saber nada de GitHub para usarlo.

### 2.1 Entrar

**Decir:**

> Entra a esta dirección — la vas a tener guardada en tus favoritos:
> `wicfl-content-form-w111.wicfl-microsites.workers.dev`. Te va a pedir una contraseña — es la
> contraseña compartida del equipo para este formulario. Si no la tienes, pídesela a Vic; nunca
> se manda por chat, vive en el vault del proyecto.

**[CAPTURA PENDIENTE: pantalla de login del formulario, campo de contraseña vacío]**

### 2.2 Editar una página que ya existe

**Decir:**

> Una vez adentro, vas a ver dos selectores arriba: primero elige el sitio, después la página
> que quieres editar.
>
> Debajo aparecen dos tipos de campos. Arriba, el nombre de marca y los campos de SEO — título,
> descripción, palabra clave principal y secundarias. Son los únicos campos de configuración del
> sitio que este formulario te deja tocar; todo lo demás — dominio, teléfono, licencia,
> analytics — sigue siendo trabajo de Vic.
>
> Debajo de eso, un cuadro de texto grande con el markdown de la página que elegiste. Es texto
> simple: dos numerales para un título — así, `## Título` — una línea en blanco entre párrafos,
> y para un link a otra página del mismo sitio, corchetes con el texto y paréntesis con la
> dirección: `[texto del link](/otra-pagina/)`.
>
> Edita lo que necesites directamente ahí.

**[CAPTURA PENDIENTE: formulario con un sitio y una página ya seleccionados, mostrando los
campos de marca/SEO arriba y el cuadro de markdown debajo, con contenido real visible]**

**Decir:**

> Cuando termines, haz clic en **"Publish draft."** Esto crea el borrador por ti —
> automáticamente, sin que tengas que tocar nada más.

**[CAPTURA PENDIENTE: el botón "Publish draft" visible, justo antes de hacer clic]**

**Decir:**

> El formulario te va a mostrar un link al pull request que acaba de crear, algo como
> `.../pull/12`. Ábrelo. Ahí vas a ver exactamente la misma pantalla de revisiones y de preview
> que te muestro más adelante en la parte de GitHub — esa parte no cambia, el formulario solo te
> ahorró los pasos previos.
>
> Y esto es importante: **el formulario nunca publica nada por su cuenta.** Alguien —tú mismo, o
> Vic si prefieres una segunda mirada— tiene que entrar a ese pull request y apretar el botón
> verde de "Merge" una vez que las revisiones automáticas estén en verde y el preview se vea
> bien. Eso lo cubro en detalle en la parte de GitHub, porque es el mismo paso para los dos
> caminos.

**[CAPTURA PENDIENTE: el link al pull request que el formulario muestra después de publicar el borrador]**

### 2.3 Crear un sitio nuevo desde cero

**Decir:**

> El mismo formulario también arranca un sitio nuevo desde cero — esto es nuevo desde hace unos
> días, así que probablemente no lo hayas visto todavía. Antes, si Kevin confirmaba un sitio
> nuevo, alguien tenía que crear la carpeta a mano en GitHub. Ya no.
>
> En la misma pantalla, con tu sesión iniciada, hay un selector que dice **"Mode"** arriba de los
> campos. Cámbialo de **"Edit existing site"** a **"Create new site."** Los campos de edición
> desaparecen y aparecen los de creación de un sitio nuevo.

**[CAPTURA PENDIENTE: el selector "Mode" mostrando las dos opciones, "Edit existing site" y
"Create new site"]**

**Decir:**

> Todos estos campos son obligatorios. Te los explico rápido, en el orden en que aparecen:
>
> **Site slug** — el identificador del sitio en la dirección del repo, por ejemplo
> `port-st-lucie`. Solo minúsculas, números y guiones. No es el dominio real — ese lo pone Vic
> después.
>
> **Brand name** — el nombre de marca tal como debe verse en el encabezado del sitio y en los
> resultados de búsqueda.
>
> **Product** — un menú con el catálogo fijo de productos: Flood, Homeowners, Renters, Landlord,
> Umbrella, Contractor, Commercial property, General liability, Windstorm, Condo.
>
> **Audience** — a quién le habla el sitio: Homeowner, Renter, Landlord, Contractor, Business
> owner, o Condo owner.
>
> **City** y **County** — la ciudad y el condado reales del nicho que Kevin ya aprobó.
>
> **Primary language** — English o Spanish. Si el sitio va en español, recuerda la regla de
> siempre: se escribe en español desde el inicio, nunca se traduce de un borrador en inglés.
>
> **Theme** — Coastal, Civic o Warm. Es la paleta visual del sitio.
>
> **SEO title**, **SEO description**, **Primary keyword** y **Secondary keywords** — igual que en
> el modo de edición. Las palabras clave secundarias van una por línea.
>
> **Local proof type** y **Local proof** — qué tipo de evidencia local respalda este sitio, y la
> evidencia en sí, específica y verificable. No pongas algo genérico acá — esto alimenta
> directamente qué tan distinto se ve el sitio frente a uno genérico.
>
> **Unique section title** y **Why this section is unique** — qué hace a este sitio distinto de
> un agregador cualquiera, y por qué.
>
> Y por último, **Home page markdown** — el contenido real de la página de inicio, escrito por
> ti. El formulario arma automáticamente los datos técnicos de esa página por ti; no los escribas
> a mano.

**[CAPTURA PENDIENTE: el formulario completo en modo "Create new site", con todos los campos
visibles — puede ser en dos capturas si no entra todo en una pantalla, arriba y abajo]**

**Decir:**

> Cuando termines, haz clic en **"Create site draft."** Esto crea los dos archivos que arrancan
> el sitio, en un borrador nuevo, y abre el pull request — igual que en el modo de edición. Te
> muestra el link apenas termina, y corre exactamente las mismas revisiones y preview que
> cualquier otro.
>
> Una cosa que tienes que saber: **crear el borrador no es lanzar el sitio.** Todo lo que Kevin
> todavía no te haya dado —dominio real, teléfono, email, dirección, número de licencia, IDs de
> Analytics— queda marcado como un dato de relleno reconocible a propósito, y el sistema va a
> rechazar publicarlo de verdad hasta que esos datos reales lo reemplacen. Y aunque el pull
> request se apruebe, el sitio todavía no está en línea del todo — falta que Vic lo agregue a su
> infraestructura y le asigne su dominio real. Lo que este modo te da es arrancar el sitio tú
> mismo, con tu propio conocimiento del nicho, en vez de esperar a que alguien más te cree la
> carpeta.

**[CAPTURA PENDIENTE: el botón "Create site draft" visible, y opcionalmente el link al pull
request que se genera después]**

**Decir:**

> Lo que este formulario **todavía no hace**: agregar una página nueva a un sitio que ya existe,
> ni publicar varias páginas de un sitio de una sola vez. Para esas dos cosas necesitas el
> segundo camino: GitHub directo.

---

## 3. Camino de respaldo: GitHub directo (≈6–7 min)

**Decir:**

> Esto es para dos casos puntuales: crear una página nueva dentro de un sitio que ya existe, o
> publicar de una vez todo el contenido real de un sitio nuevo — siete, ocho páginas juntas. No
> te voy a explicar qué es git como sistema. Solo los clics, en orden.
>
> Vas a ver la interfaz en inglés — así es GitHub — pero te digo qué hace cada botón mientras
> avanzamos.

### 3.1 Editar una página que ya existe (por GitHub, si alguna vez lo necesitas)

**Decir:**

> Primero, la versión más simple, por si el formulario no está disponible en algún momento:
> editar un archivo que ya existe.
>
> Ve a `github.com/microsites-wicfl/wicfl-microsites` e inicia sesión.

**Decir:**

> Entra a la carpeta de tu sitio, dentro de `content`, y haz clic en el archivo `.md` que quieres
> cambiar.

**[CAPTURA: gh-01-carpeta-content-add-file.jpg — el listado de la carpeta content]**

**Decir:**

> Arriba a la derecha de la vista del archivo hay un ícono de lápiz — "Edit this file." Haz clic
> ahí y edita el texto. Es markdown simple: dos numerales para un título, línea en blanco entre
> párrafos, corchetes y paréntesis para un link interno.
>
> Cuando termines, baja hasta el final de la página.

**[CAPTURA: gh-05-frontmatter-y-contenido.jpg — el editor con contenido real, como referencia de
cómo se ve el texto ya escrito]**

**Decir:**

> Vas a ver el cuadro de "Commit changes." Escribe un mensaje corto describiendo qué cambiaste —
> por ejemplo, "Update flood deductible figures."

**[CAPTURA: gh-06-dialogo-commit-opciones.jpg — el diálogo de commit con las dos opciones]**

**Decir:**

> Debajo hay dos opciones. **Asegúrate de que esté marcada la segunda: "Create a new branch for
> this commit and start a pull request."** No la primera — esa guarda directo, sin revisión.

**[CAPTURA: gh-07-rama-nueva-seleccionada.jpg — la segunda opción marcada, con el botón verde
"Propose changes"]**

**Decir:**

> Haz clic en **"Propose changes."**

**Decir:**

> Llegas a una pantalla de comparación. El título ya viene escrito con tu mensaje de commit —
> puedes dejarlo o mejorarlo. Haz clic en **"Create pull request."**

**[CAPTURA: gh-08-crear-pull-request.jpg — la pantalla "Open a pull request"]**

**Decir:**

> Ahora estás en la página del pull request. Espera un minuto o dos mientras corren las
> revisiones automáticas.

**[CAPTURA: gh-09-checks-corriendo.jpg — las revisiones corriendo, algunas en progreso]**

**Decir:**

> Cuando terminen, va a aparecer un comentario con un link de preview en vivo —algo como
> `wicfl-prNN-<sitio>.wicfl-microsites.workers.dev`. Haz clic ahí: es tu cambio exacto, en vivo,
> antes de que nadie más lo vea.

**[CAPTURA: gh-10-checks-verdes-link-preview.jpg — ambas revisiones en verde con el comentario
del link de preview]**

**Decir:**

> Revisa la página real.

**[CAPTURA: gh-11-preview-en-vivo.jpg — la página de preview renderizada]**

**Decir:**

> Si todo se ve bien y las dos revisiones están en verde, haz clic en el botón verde **"Merge
> pull request"** y después en el botón de confirmación que aparece debajo. GitHub te va a
> ofrecer un botón **"Delete branch"** — haz clic ahí también; ya cumplió su función.

**[CAPTURA: gh-12-cerrado-delete-branch.jpg — el botón "Delete branch" después de cerrar el PR]**

**Decir:**

> Y ya. Tu cambio está publicado.

### 3.2 Crear una página nueva

**Decir:**

> Esto es lo que el formulario todavía no hace, así que vas a usarlo seguido. Una página nueva es
> simplemente un archivo markdown nuevo.
>
> Ve a la carpeta `content` de tu sitio.

**[CAPTURA: gh-01-carpeta-content-add-file.jpg]**

**Decir:**

> Haz clic en el desplegable **"Add file"** cerca de arriba a la derecha, y después en
> **"Create new file."**

**[CAPTURA: gh-02-add-file-desplegable.jpg — el desplegable abierto con sus dos opciones]**

**Decir:**

> En el campo de nombre, escribe el nombre del archivo terminado en `.md` — palabras en minúscula
> separadas por guiones, sin espacios. Por ejemplo, `flood-coverage.md`.
>
> Este es el detalle más importante de todo el video: **ese nombre de archivo se convierte
> automáticamente en la dirección web de la página.** `flood-coverage.md` se convierte en la
> página en `/flood-coverage/`. No hay un campo separado para poner la URL en ningún lado — el
> nombre del archivo *es* la dirección, así que acértalo la primera vez.

**[CAPTURA: gh-04-nombre-archivo-escrito.jpg — el nombre de archivo ya escrito]**

**Decir:**

> Ahora, lo primero que tiene que aparecer en el archivo, antes de cualquier contenido real, es
> un bloque como este: tres guiones, algunos campos, tres guiones.

**[CAPTURA: gh-05-frontmatter-y-contenido.jpg]**

**Decir:**

> Tres campos, nada más:
>
> `title` — obligatorio. El título de la página.
>
> `description` — opcional, pero escríbelo siempre. Es lo que aparece en los resultados de
> búsqueda.
>
> `pageType` — obligatorio, y tiene que ser exactamente una de tres palabras: `home`, `content`,
> o `coverage`. Cada sitio tiene una sola página `home`, que es su portada — nunca crees una
> segunda. Para todo lo demás usa `content`, salvo que la página sea específicamente sobre qué
> cubre o no cubre un tipo de seguro, en cuyo caso usa `coverage`. Si no estás seguro entre
> `content` y `coverage`, usa `content` y pregúntale a Vic — es una decisión de estilo, no algo
> que rompa nada.
>
> No pongas nada más en ese bloque. Un campo que no exista ahí hace fallar la revisión automática
> — eso es esperado, no un error tuyo.
>
> Después del segundo grupo de tres guiones, escribe el contenido normal de la página.

**Decir:**

> Cuando termines, baja y repite exactamente los mismos pasos que te mostré para editar una
> página: "Commit changes," la segunda opción de rama nueva, "Propose changes," "Create pull
> request," esperar las revisiones, revisar el preview, y mergear.
>
> Una sola cosa más a tener en cuenta con una página nueva: el sitio arma su menú de navegación
> automáticamente, así que en general no tienes que hacer nada extra para que la página aparezca
> enlazada. Si en algún caso ves que una página nueva no aparece en ningún menú, avísale a Vic —
> puede ser un caso puntual que valga la pena revisar.

### 3.3 Publicar un lote completo de páginas de una vez

**Decir:**

> Este es el caso de cuando lanzas todo el contenido real de un sitio nuevo junto — siete, ocho
> páginas — en vez de una por una. La idea es que las revisiones y el preview corran una sola vez
> para todo el lote, no una vez por página.
>
> Primero, escribe el frontmatter y el contenido de cada página en otro lado —un editor de texto,
> un documento, cualquier cosa fuera de GitHub— antes de tocar el navegador. Vas a pegar siete u
> ocho archivos seguidos, y componerlos ahí mismo en vivo es como se cuela un carácter suelto o
> un campo olvidado sin que nadie lo note.
>
> Con todo listo, ve a la carpeta `content` de tu sitio y crea la **primera** página exactamente
> igual que te mostré recién: "Add file," "Create new file," nombre, frontmatter, contenido.

**[CAPTURA: gh-01-carpeta-content-add-file.jpg / gh-02-add-file-desplegable.jpg]**

**Decir:**

> Baja hasta "Commit changes." Esta vez, selecciona la opción de rama nueva como siempre, pero
> antes de hacer clic, reemplaza el nombre de rama que GitHub sugiere por algo corto y
> reconocible — por ejemplo `site1-real-content`. Haz clic en el botón que crea la rama.

**[CAPTURA: gh-07-rama-nueva-seleccionada.jpg]**

**Decir:**

> Llegas a la misma pantalla de "Open a pull request" de siempre. **Pero esta vez todavía no
> crees el pull request** — todas las demás páginas todavía tienen que subirse a esa misma rama
> primero.
>
> Para cada página que falta, en vez de volver a la carpeta y hacer clic en "Add file," ve
> directo a esta dirección, cambiando el nombre de tu rama y el slug de tu sitio:
>
> `github.com/microsites-wicfl/wicfl-microsites/new/<tu-nombre-de-rama>/sites/<tu-sitio>/content`
>
> Es la misma pantalla de archivo nuevo de antes, solo que ahora apunta a tu rama en vez de a
> `main` — revisa la etiqueta chica junto al nombre del archivo, tiene que decir "in
> `<tu-rama>`," no "in main."
>
> Nombra el archivo, pega el contenido, y baja hasta "Commit changes" otra vez. Como la rama ya
> existe, esta vez GitHub va a mostrar por defecto la opción "Commit directly to the
> `<tu-rama>` branch." **Eso es lo que quieres ahora** — no toques los botones de radio, solo haz
> clic en "Commit changes."
>
> Repite esto para cada página que te falte.
>
> Cuando ya subiste todas, ve a esta otra dirección, con el nombre de tu rama:
>
> `github.com/microsites-wicfl/wicfl-microsites/compare/main...<tu-nombre-de-rama>?quick_pull=1`
>
> Ponle al pull request un título que describa todo el lote —por ejemplo, "Site 1: real content,
> 8 pages"— y en la descripción, lista cada página que incluye. Haz clic en "Create pull
> request."

**[CAPTURA: gh-08-crear-pull-request.jpg]**

**Decir:**

> Espera las revisiones igual que siempre — esta vez van a ser más, porque construir un sitio
> entero con varias páginas nuevas necesita más pasos que una edición de una línea, pero es el
> mismo tipo de revisión y se comporta igual.
>
> Cuando termine, haz clic en el link de preview. Esta vez navega varias páginas, no mires solo
> una — abre la portada y al menos dos o tres de las páginas nuevas. Un lote de este tamaño puede
> tener un link interno roto aunque cada página individual haya pasado la revisión.

**[CAPTURA: gh-10-checks-verdes-link-preview.jpg / gh-11-preview-en-vivo.jpg]**

**Decir:**

> Si todo está en orden, mergea y borra la rama, igual que siempre.
>
> Una diferencia con un pull request de una sola página: el link de preview desaparece a los
> pocos minutos de mergear, como siempre, pero acá no hay otra URL en vivo a la que apuntar
> después hasta que el sitio esté publicado de verdad. Para ver qué se publicó, el link que queda
> es el pull request mismo — se guarda en GitHub para siempre y muestra exactamente qué cambió,
> página por página.

### 3.4 Si algo falla

**Decir:**

> Una última cosa, rápida. Si ves una marca roja junto a una de las revisiones automáticas en tu
> pull request, algo está mal — casi siempre un error de tipeo en el frontmatter, como un
> `title` que falta, o un `pageType` que no es una de las tres palabras permitidas.
>
> Haz clic en la marca roja, y después en "Details," para leer qué falló. Si el mensaje no te
> deja claro qué corregir, no adivines, y no empieces a editar archivos fuera de la carpeta de tu
> sitio para tratar de esquivarlo. Copia el error y mándaselo a Vic con el link al pull request.
> Un mensaje de error confuso es en sí mismo algo que vale la pena reportar.

---

## 4. Cierre (≈40 seg)

**Decir:**

> Resumen rápido: usa el formulario para casi todo — editar una página, actualizar marca y SEO,
> o arrancar un sitio nuevo desde cero. Usa GitHub directo solo cuando necesites crear una página
> nueva dentro de un sitio que ya existe, o publicar el lote completo de contenido de un sitio
> nuevo de una sola vez.
>
> En los dos caminos, nada se publica hasta que alguien apruebe el pull request con las
> revisiones en verde y el preview revisado.
>
> Cualquier duda sobre el sistema en sí —el template, la configuración, algo que esta guía no
> contestó— pregúntame a mí. Cualquier duda sobre marca, aprobación de un nicho o de un dominio,
> o presupuesto, pregúntale a Kevin.
>
> Este video queda grabado, así que vuelve a él cuando lo necesites — no hace falta que te
> acuerdes de todo de memoria la primera vez.

**[PANTALLA: cara a cámara]**

---

## Capturas pendientes

Doce de las capturas de este guión (todo el bloque de GitHub) ya están listas — son reales,
tomadas cuando ese flujo se probó de punta a punta contra el repo real, están en la carpeta
`screenshots/github/` junto a este archivo, con el mismo nombre que aparece en cada
`[CAPTURA: ...]` de arriba.

Las del formulario (`content-form`) no las pude capturar yo: esa herramienta pide una contraseña
para entrar, y por las reglas de esta sesión nunca escribo una contraseña por ti, ni siquiera si
me la pasas — tiene que ser algo que hagas tú mismo. Son 5, y con la sesión ya iniciada te toma
un par de minutos:

1. La pantalla de login, con el campo de contraseña vacío (opcional — es la única que no
   necesita sesión iniciada).
2. El formulario en modo edición, con un sitio y una página ya elegidos, mostrando los campos de
   marca/SEO arriba y el cuadro de markdown debajo con contenido real.
3. El botón **"Publish draft"** visible, justo antes de hacer clic.
4. El selector **"Mode"** mostrando las dos opciones, "Edit existing site" y "Create new site."
5. El formulario completo en modo **"Create new site,"** con los campos llenos (puede ser dos
   capturas, arriba y abajo, si no entra todo en una pantalla) — y el botón **"Create site
   draft."**

Si prefieres, dime cuando hayas iniciado sesión en el formulario y yo tomo estas cinco capturas
por ti navegando desde ahí — solo el login en sí tiene que hacerlo alguien, nunca yo.
