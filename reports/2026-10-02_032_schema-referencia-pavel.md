# 2026-10-02_032 — Schema alineado con la referencia de Pavel

**Backlog:** W-125
**Fase:** 6
**Reporte esperado:** `reports/2026-10-02_032_schema-referencia-pavel.md`

## Qué se hizo

- Cambié el identificador de la agencia local a `/#insurance-agency` en publisher, provider, about y parentOrganization.
- La agencia asociada ahora se emite como `Organization` con únicamente `@id`, nombre y URL; eliminé sus campos ya inutilizados del contrato y de ambos configs que los tenían.
- Tipifiqué `areaServed`, agregué `addressCountry: "US"` para direcciones presentes y emití `inLanguage` como idioma regional.
- Agregué el nodo de página conectado al sitio, agencia y migas cuando aplica; `/contact/` emite `ContactPage`.
- Ajusté el `Service` y las migas de portada/idioma alterno según la referencia.
- Actualicé la prueba de schema para recorrer todas las rutas generadas de los dos sitios y cubrir la clasificación directa de condado.

## Decisiones tomadas

- La portada se reconoce por su ruta (`/` o `/<idioma>/`) para impedir migas en cualquier idioma, sin depender de una convención adicional de IDs.
- Una página de contacto alterna se identifica por su ID terminado en `/contact`, equivalente a la condición del contacto primario.

## Verificación

`npm run validate:configs` validó los dos ejemplos y ambos sitios. `npm run check:types` terminó con 0 errores, 0 warnings y 0 hints. `node --test scripts/schema.test.mjs` pasó: 1 prueba, 1 exitosa, 0 fallas.

JSON-LD renderizado — portada de Stuart:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": "https://stuarthomeownersinsurance.com/#website", "url": "https://stuarthomeownersinsurance.com/", "name": "Stuart Homeowners Insurance (Demo)", "inLanguage": "en-US", "publisher": { "@id": "https://stuarthomeownersinsurance.com/#insurance-agency" } },
    { "@type": "InsuranceAgency", "@id": "https://stuarthomeownersinsurance.com/#insurance-agency", "name": "Stuart Homeowners Insurance (Demo)", "url": "https://stuarthomeownersinsurance.com/", "telephone": "+17722470106", "email": "info@stuarthomeownersinsurance.com", "areaServed": [{ "@type": "City", "name": "Stuart" }, { "@type": "Place", "name": "Port Salerno" }, { "@type": "Place", "name": "Palm City" }], "logo": "https://stuarthomeownersinsurance.com/logo.svg", "parentOrganization": { "@id": "https://www.walkerinsuranceagency.com/#organization" } },
    { "@type": "Organization", "@id": "https://www.walkerinsuranceagency.com/#organization", "name": "Walker Insurance Agency", "url": "https://www.walkerinsuranceagency.com/" },
    { "@type": "WebPage", "@id": "https://stuarthomeownersinsurance.com/#webpage", "url": "https://stuarthomeownersinsurance.com/", "name": "Stuart Homeowners Insurance", "description": "Get homeowners insurance in Stuart, FL for high-value, waterfront, coastal and difficult-to-insure homes. Explore coverage options and request a quote.", "inLanguage": "en-US", "isPartOf": { "@id": "https://stuarthomeownersinsurance.com/#website" }, "about": { "@id": "https://stuarthomeownersinsurance.com/#insurance-agency" } }
  ]
}
```

JSON-LD renderizado — `/contact/` de Stuart:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": "https://stuarthomeownersinsurance.com/#website", "url": "https://stuarthomeownersinsurance.com/", "name": "Stuart Homeowners Insurance (Demo)", "inLanguage": "en-US", "publisher": { "@id": "https://stuarthomeownersinsurance.com/#insurance-agency" } },
    { "@type": "InsuranceAgency", "@id": "https://stuarthomeownersinsurance.com/#insurance-agency", "name": "Stuart Homeowners Insurance (Demo)", "url": "https://stuarthomeownersinsurance.com/", "telephone": "+17722470106", "email": "info@stuarthomeownersinsurance.com", "areaServed": [{ "@type": "City", "name": "Stuart" }, { "@type": "Place", "name": "Port Salerno" }, { "@type": "Place", "name": "Palm City" }], "logo": "https://stuarthomeownersinsurance.com/logo.svg", "parentOrganization": { "@id": "https://www.walkerinsuranceagency.com/#organization" } },
    { "@type": "Organization", "@id": "https://www.walkerinsuranceagency.com/#organization", "name": "Walker Insurance Agency", "url": "https://www.walkerinsuranceagency.com/" },
    { "@type": "BreadcrumbList", "@id": "https://stuarthomeownersinsurance.com/contact/#breadcrumb", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://stuarthomeownersinsurance.com/" }, { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://stuarthomeownersinsurance.com/contact/" }] },
    { "@type": "ContactPage", "@id": "https://stuarthomeownersinsurance.com/contact/#webpage", "url": "https://stuarthomeownersinsurance.com/contact/", "name": "Get a Home Insurance Quote in Stuart, FL", "description": "Request a home insurance quote in Stuart, FL from Walker Insurance Agency. Explore coverage options for homeowners, coastal and high-value properties.", "inLanguage": "en-US", "isPartOf": { "@id": "https://stuarthomeownersinsurance.com/#website" }, "about": { "@id": "https://stuarthomeownersinsurance.com/#insurance-agency" }, "breadcrumb": { "@id": "https://stuarthomeownersinsurance.com/contact/#breadcrumb" } }
  ]
}
```

JSON-LD renderizado — `/coverage-fixture/` de `_example`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": "https://example-flood.invalid/#website", "url": "https://example-flood.invalid/", "name": "Example Flood Insurance", "inLanguage": "en-US", "publisher": { "@id": "https://example-flood.invalid/#insurance-agency" } },
    { "@type": "InsuranceAgency", "@id": "https://example-flood.invalid/#insurance-agency", "name": "Example Flood Insurance", "url": "https://example-flood.invalid/", "telephone": "+15305152668", "email": "hello@example-flood.invalid", "areaServed": [{ "@type": "City", "name": "Stuart" }, { "@type": "Place", "name": "Port Salerno" }, { "@type": "Place", "name": "Palm City" }, { "@type": "Place", "name": "Hobe Sound" }], "address": { "@type": "PostalAddress", "streetAddress": "123 Placeholder Avenue", "addressLocality": "Stuart", "addressRegion": "FL", "postalCode": "34994", "addressCountry": "US" }, "logo": "https://example-flood.invalid/logo.svg", "parentOrganization": { "@id": "https://example-agency.invalid/#organization" } },
    { "@type": "Organization", "@id": "https://example-agency.invalid/#organization", "name": "Example Licensed Insurance Agency", "url": "https://example-agency.invalid/" },
    { "@type": "BreadcrumbList", "@id": "https://example-flood.invalid/coverage-fixture/#breadcrumb", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example-flood.invalid/" }, { "@type": "ListItem", "position": 2, "name": "Coverage page fixture", "item": "https://example-flood.invalid/coverage-fixture/" }] },
    { "@type": "WebPage", "@id": "https://example-flood.invalid/coverage-fixture/#webpage", "url": "https://example-flood.invalid/coverage-fixture/", "name": "Coverage page fixture", "description": "Disposable coverage-page layout fixture with no real insurance content or claim.", "inLanguage": "en-US", "isPartOf": { "@id": "https://example-flood.invalid/#website" }, "about": { "@id": "https://example-flood.invalid/#insurance-agency" }, "breadcrumb": { "@id": "https://example-flood.invalid/coverage-fixture/#breadcrumb" } },
    { "@type": "Service", "@id": "https://example-flood.invalid/coverage-fixture/#service", "name": "Fixture coverage in Stuart", "serviceType": "Fixture coverage", "url": "https://example-flood.invalid/coverage-fixture/", "description": "Disposable coverage-page layout fixture with no real insurance content or claim.", "provider": { "@id": "https://example-flood.invalid/#insurance-agency" }, "areaServed": { "@type": "City", "name": "Stuart", "containedInPlace": { "@type": "AdministrativeArea", "name": "Martin County" } } }
  ]
}
```

## Lo que tocaste fuera de lo pedido

Nada. Los cambios se limitaron al generador, su contrato/configs, las rutas que le pasan el ID de página, la prueba permanente y el reporte solicitado.

## Lo que no pude verificar

La publicación remota sigue pendiente al momento de escribir este reporte; se verificará después del push.

## Dónde dudaste

No hubo ambigüedades que requirieran una decisión de producto.

## Qué me sorprendió del repo

La comprobación de tipos informa un aviso preexistente de Astro sobre un ID duplicado `index` en el fixture `_example`, aunque finaliza sin warnings en el resultado de diagnóstico.

## Lo que no se hizo

No se modificaron páginas visibles, `apps/studio/`, `apps/lead-api/` ni el contenido de Stuart, tal como exige el prompt.

## Próximos pasos sugeridos

- Cowork puede revisar el reporte y decidir si registra o corrige el aviso preexistente del fixture.

## Commits

Pendiente al momento de redactar el reporte: se creará con el mensaje solicitado por el prompt.

## Revisión de cowork

**Veredicto: aprobado.** El grafo coincide con la referencia v2 de Pavel.

Revisado contra el diff de `785be5f` y verificado en vivo (navegador integrado, `wicfl-stuart-homeowners-published…`):

- `/contact/`: `WebSite`, un solo `InsuranceAgency`, `Organization` (Walker, solo nombre y URL), `BreadcrumbList` y `ContactPage`. Cero referencias colgando.
- Portada: `WebSite`, `InsuranceAgency`, `Organization`, `WebPage`; sin migas. `inLanguage` `en-US`.
- Agencia: teléfono `+17722470106`, correo del sitio, logo absoluto, **sin `address`**, `areaServed` con tipo (`Stuart` City; `Port Salerno` y `Palm City` Place).

Publicado: `785be5f` en `origin/main`, Publish site Workers [run 37042207694](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/37042207694) verde. Las secciones "Lo que no pude verificar" y "Commits" del reporte se escribieron antes del push y quedaron desactualizadas; este es el dato real.

Pendientes fuera del código:

1. **Dirección:** Kevin decidió el 2026-09-23 que los sitios no la muestran. Vic le preguntó el 2-oct si quiere reconsiderarlo para Stuart; si dice que sí, basta `contact.address` en el config.
2. **Pavel:** llenar **Service name** en las páginas de cobertura, elegir un solo nombre de marca (su referencia usa "Stuart Florida Homeowners Insurance" y "Stuart Homeowners Insurance"), quitar "(Demo)" y completar la zona de servicio. Luego Rich Results Test.
3. `/homeowners-insurance/` está en la referencia de Pavel y no existe en Stuart.
4. Aviso de Astro por el ID `index` duplicado en `_example` (portadas `index.md` y `es/index.md`): preexistente, sin efecto en el build. Se deja anotado.
