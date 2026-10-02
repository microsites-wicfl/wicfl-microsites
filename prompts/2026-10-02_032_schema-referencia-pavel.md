# 2026-10-02_032 — Schema: ajustar el grafo a la referencia de Pavel

**Backlog:** W-125
**Fase:** 6
**Reporte esperado:** `reports/2026-10-02_032_schema-referencia-pavel.md`

## Contexto

El prompt 031 dejó un `@graph` por página generado por `siteGraphJsonLd`
(`packages/template/src/lib/site-data.mjs`): `WebSite`, la agencia del micrositio, la agencia
asociada, `BreadcrumbList` y `Service` opcional. Pavel (SEO) entregó su referencia escrita
(`_drafts/microsite-1-structure/Stuart Homeowners Insurance Schema v2.docx`, fuera de git). La
estructura coincide: el micrositio es la agencia local con su propio teléfono y correo, y Walker
Insurance Agency es la organización que está detrás. Este prompt cierra las diferencias de
detalle. Lo esencial de la referencia está copiado abajo; no necesitas abrir el documento.

Reglas de Pavel que mandan:

- Un solo `InsuranceAgency` por sitio. Walker **no** es otro `InsuranceAgency`: es `Organization`.
- El teléfono y el correo del schema son los que muestra el sitio, nunca los generales de Walker.
- El schema solo describe lo que el sitio muestra. **La dirección no se agrega solo para el
  schema.** Kevin decidió el 2026-09-23 que los sitios no muestran dirección postal, así que
  Stuart sigue sin `address`. No agregues `contact.address` a ningún sitio real.

## Objetivo

El JSON-LD generado coincide con la referencia de Pavel en tipos, identificadores y relaciones,
sigue saliendo solo del config y el frontmatter, y la prueba permanente lo protege.

## Restricciones

- Todo lo construido en inglés.
- No toques `apps/studio/`, `apps/lead-api/` ni `sites/stuart-homeowners/content/`.
- Sin cambios visibles en las páginas. Solo `<script type="application/ld+json">`.
- Sin dependencias nuevas. Sin datos inventados: nada de `sameAs`, `image`, `openingHours`,
  `priceRange`, `geo`, `aggregateRating`.
- Las URLs usan el dominio real (`https://${site.domain}`), como el canonical.
- El `FAQPage` se queda como script aparte, sin cambios.
- Conserva el escape de `<`.

## Pasos

1. **Identificador de la agencia.** `@id` pasa de `/#agency` a `/#insurance-agency` en todas las
   referencias (`publisher`, `provider`, `about`).

2. **Walker como `Organization`.** La entidad asociada pasa a `@type: "Organization"` con solo
   `@id` (`<agency.url sin slash final>/#organization`), `name` y `url`. Ya no emite `telephone`
   ni `address`. Quita `agency.telephone` y `agency.address` del schema de config
   (`site.config.schema.json`), de los ejemplos, de `sites/_example/site.config.json` y de
   `sites/stuart-homeowners/site.config.json`: un dato que nada usa no se guarda.

3. **`areaServed` con tipo.** Cada lugar de `geo.serviceArea` sale como objeto:
   - igual a `geo.city` → `{ "@type": "City", "name": ... }`;
   - igual a `geo.county` o a `"<geo.county> County"` (sin distinguir mayúsculas) →
     `{ "@type": "AdministrativeArea", "name": ... }`;
   - cualquier otro → `{ "@type": "Place", "name": ... }`.
   Conserva el orden y el texto del config.

4. **`address`, si el config la trae,** lleva `addressCountry: "US"`. (Solo aplica a `_example`.)

5. **Idioma.** `inLanguage` sale como `en-US` o `es-US` (el código de idioma más `-US`), en
   `WebSite` y en la página.

6. **Entidad de página.** Agrega a cada página un nodo:
   - `@type` `ContactPage` si la página es la de contacto (la misma condición que hoy decide
     dónde va el formulario, `page.id === "contact"`, también en el idioma alterno), y `WebPage`
     en las demás;
   - `@id` `<url de la página>#webpage`, `url`, `name` (el título de la página, sin el sufijo
     de marca), `description` si existe, `inLanguage`;
   - `isPartOf` → `/#website`, `about` → `/#insurance-agency`;
   - `breadcrumb` → `{ "@id": "<url>#breadcrumb" }` cuando la página tiene migas.

7. **`Service`.**
   - `name` = `"<serviceName> in <geo.city>"`; `serviceType` = `serviceName`;
   - `areaServed` = `{ "@type": "City", "name": geo.city, "containedInPlace": { "@type": "AdministrativeArea", "name": "<geo.county> County" } }`;
   - `provider` → `/#insurance-agency`; `url`, `description` como hoy.

8. **Migas en la portada del idioma alterno** (hallazgo de la revisión del 031): la portada de
   cualquier idioma (`/` y `/es/`) no lleva `BreadcrumbList`. En las páginas del idioma alterno
   el primer elemento se llama "Inicio" cuando el idioma es `es`.

9. **Prueba permanente.** Actualiza `scripts/schema.test.mjs`:
   - exactamente un `InsuranceAgency` por página; la entidad asociada es `Organization` sin
     `telephone` ni `address`;
   - Stuart: la agencia **no** tiene `address`; su `telephone` es `+17722470106` y su `email`
     `info@stuarthomeownersinsurance.com`;
   - `areaServed` de Stuart: `Stuart` es `City`; un lugar que no es la ciudad ni el condado es `Place`;
     prueba la función directamente con `"Martin County"` y con `"Martin"` → `AdministrativeArea`;
   - cada página tiene un `WebPage` o `ContactPage` con `isPartOf` y `about` resueltos; `/contact/`
     es `ContactPage` y no tiene `Service`;
   - `coverage-fixture`: `Service.name` termina en `in <city>`, `serviceType` es el `serviceName`,
     y `areaServed` es `City` con `containedInPlace`;
   - `/es/` del fixture no tiene `BreadcrumbList`; una página interna en `es/` empieza en "Inicio";
   - se mantienen las comprobaciones del 031: JSON válido, `<` escapado, `@id` únicos, sin
     referencias colgando, `FAQPage` igual.

10. `npm run check` en verde. Commit, push y espera a **Publish site Workers**.

## Referencia de Pavel (lo esencial)

Agencia, tal como debe quedar para Stuart **sin** el bloque `address`:

```json
{
  "@type": "InsuranceAgency",
  "@id": "https://stuarthomeownersinsurance.com/#insurance-agency",
  "name": "<brand.name>",
  "url": "https://stuarthomeownersinsurance.com/",
  "logo": "https://stuarthomeownersinsurance.com/logo.svg",
  "telephone": "+17722470106",
  "email": "info@stuarthomeownersinsurance.com",
  "areaServed": [
    { "@type": "City", "name": "Stuart" },
    { "@type": "Place", "name": "Port Salerno" }
  ],
  "parentOrganization": { "@id": "https://www.walkerinsuranceagency.com/#organization" }
}
```

```json
{
  "@type": "Organization",
  "@id": "https://www.walkerinsuranceagency.com/#organization",
  "name": "Walker Insurance Agency",
  "url": "https://www.walkerinsuranceagency.com/"
}
```

```json
{
  "@type": "Service",
  "@id": "https://stuarthomeownersinsurance.com/flood-insurance/#service",
  "name": "Flood Insurance in Stuart",
  "serviceType": "Flood Insurance",
  "description": "<page description>",
  "provider": { "@id": "https://stuarthomeownersinsurance.com/#insurance-agency" },
  "areaServed": {
    "@type": "City",
    "name": "Stuart",
    "containedInPlace": { "@type": "AdministrativeArea", "name": "Martin County" }
  },
  "url": "https://stuarthomeownersinsurance.com/flood-insurance/"
}
```

```json
{
  "@type": "ContactPage",
  "@id": "https://stuarthomeownersinsurance.com/contact/#webpage",
  "url": "https://stuarthomeownersinsurance.com/contact/",
  "name": "<page title>",
  "isPartOf": { "@id": "https://stuarthomeownersinsurance.com/#website" },
  "about": { "@id": "https://stuarthomeownersinsurance.com/#insurance-agency" },
  "inLanguage": "en-US"
}
```

El teléfono se queda en formato E.164 (`+17722470106`); Pavel lo escribió con guiones y los dos
son válidos.

## Criterio de aceptación

- [ ] Un solo `InsuranceAgency` por página; Walker es `Organization` con nombre y URL.
- [ ] `areaServed` con tipo; `Service` con nombre, tipo y zona como en la referencia.
- [ ] `WebPage` en cada página y `ContactPage` en la de contacto, enlazadas al sitio y a la agencia.
- [ ] Stuart sin `address`.
- [ ] Sin `@id` duplicados ni referencias colgando.
- [ ] `npm run check` y Publish site Workers en verde.

## Formato del reporte

Escribe `reports/2026-10-02_032_schema-referencia-pavel.md` con las secciones de
`prompts/TEMPLATE.md`. En **Verificación** pega, completos y con formato, el JSON-LD de:

1. la portada de Stuart;
2. `/contact/` de Stuart;
3. `/coverage-fixture/` de `_example`.

## Commit message

```
feat(template): align schema graph with the SEO reference (W-125)
```
