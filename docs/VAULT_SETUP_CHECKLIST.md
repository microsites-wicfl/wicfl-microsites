# Checklist de setup — vault compartido (W-105)

**Para Vic, ejecución manual.** Cowork no puede montar esto: crear la cuenta del vault y mover
contraseñas ahí son dos de las pocas cosas que tiene prohibido hacer siempre, incluso si se le
pide explícitamente. Este documento es solo la guía de qué crear, en qué orden y cómo nombrarlo,
para que el montaje sea copiar y pegar, no decidir sobre la marcha.

**Por qué es urgente:** la única copia de la contraseña del buzón `microsites@wicfl.com` vive hoy
en el historial del chat de Zoom — buscable, indefinido, visible para cualquiera que se agregue al
hilo después. W-010 (la cuenta real de Cloudflare) no puede arrancar hasta que esto se resuelva.

## 0 · Elegir el vault

Bitwarden o 1Password, cualquiera sirve para esto. Diferencia práctica:

- **Bitwarden** — plan Families (gratis hasta 6 usuarios) o Teams si crece el equipo. Más barato
  para empezar.
- **1Password** — plan Teams, algo más pulido para compartir por "vaults" separados, pago desde
  el día uno.

Si no hay preferencia previa, Bitwarden Families alcanza para Vic + Kevin + Pavel sin costo y sin
tener que decidir esto ahora bajo presión.

## 1 · Crear la cuenta del vault

- Cuenta bajo un correo de la empresa si es posible (no uno personal de Vic), por la misma razón
  que `docs/ACCOUNTS_AND_ACCESS.md` da para Cloudflare: el dueño de la cuenta es, en los hechos,
  el dueño del activo.
- Activar 2FA en el vault mismo. Un vault sin 2FA es el mismo problema que está tratando de
  resolver, un nivel más arriba.
- Crear una carpeta/colección para el proyecto, por ejemplo **"WICFL Microsites"**, separada de
  cualquier cosa personal.

## 2 · Rotar la contraseña del buzón — antes de crear nada más

1. Entrar a `microsites@wicfl.com` con la contraseña que está en el chat de Zoom.
2. Cambiarla ahí mismo, en la configuración de la cuenta de correo.
3. Guardar la nueva en el vault, entrada:
   - **Nombre:** `WICFL — Buzón microsites@wicfl.com`
   - **Campos:** usuario (`microsites@wicfl.com`), contraseña nueva, nota con la fecha de
     rotación
4. La contraseña nueva no se vuelve a pegar en ningún chat, ni siquiera para confirmar que
   funciona — solo se prueba haciendo login.

## 3 · Cuando se cree la cuenta de Cloudflare (W-010)

Con el vault ya montado y el buzón rotado, W-010 sigue con la cuenta de Cloudflare. Cada dato
sensible que genere ese paso va al vault, no al chat:

- **Nombre:** `WICFL — Cloudflare (cuenta principal)`
  - Usuario: `microsites@wicfl.com`
  - Contraseña de la cuenta
- **Nombre:** `WICFL — Cloudflare (recovery codes 2FA)`
  - Los códigos de recuperación del 2FA, como nota segura, no como archivo suelto
- Compartir la colección **"WICFL Microsites"** del vault con Kevin (el segundo Super Admin, per
  `docs/ACCOUNTS_AND_ACCESS.md`) para que él también pueda entrar si Vic no está disponible — ese
  es exactamente el problema de "lockout" que la regla de dos Super Admins existe para evitar.
- Pavel entra como Administrator en Cloudflare (no Super Admin), así que no necesita acceso a
  estas dos entradas del vault a menos que el equipo decida lo contrario.

## 4 · Qué más va a terminar viviendo acá (no urgente, solo para que no sorprenda)

A medida que el proyecto avanza, otras credenciales van a necesitar el mismo tratamiento en vez
de circular por chat: la cuenta de GitHub de la organización si no usa SSO, GoHighLevel/CRM, GoTo
(aunque esa la administra Kevin), y cualquier API token de servicio que no sea el scoped token de
Cloudflare que ya usan los GitHub Actions. No hace falta crear esas entradas hoy — es solo la
lista de lo que va llegando.

## Cuándo está listo

Este ítem (W-105) se puede dar por cerrado en `BACKLOG.md` en cuanto exista el vault con al menos
la entrada del buzón rotado adentro. No hace falta esperar a que las de Cloudflare existan — esas
llegan con W-010, que es el siguiente paso, no parte de este.
