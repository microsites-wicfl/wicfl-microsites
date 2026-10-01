# 2026-10-01_031 — Schema: entidades conectadas, migas de pan y Service por página

**Backlog:** W-125
**Fase:** 6

## Qué se hizo

- Se agregó `agency` opcional al contrato de `site.config.json`, con URL HTTPS, teléfono E.164 y dirección opcionales.
- El template genera un único JSON-LD `@graph` por página con `WebSite`, la agencia del micrositio, la agencia asociada cuando existe, migas de pan y `Service` opcional.
- Se agregó `serviceName` al frontmatter. Solo `coverage-fixture` lo declara; no se modificó contenido de Stuart.
- Stuart ahora referencia a Walker Insurance Agency. El fixture usa una agencia `.invalid`.
- Se añadió una prueba permanente de schema y se serializaron las dos pruebas que construyen `dist/`, evitando que se borren mutuamente sus builds durante `npm run check`.

## Decisiones tomadas

- El `@id` de la agencia asociada deriva de su URL canónica sin slash final y termina en `#organization`.
- Las migas usan el título de contenido, no el título HTML que incluye el nombre de marca. Las rutas alternas conservan su prefijo de idioma.
- `FAQPage` sigue como script separado: es una entidad de página condicional y ya se genera desde las preguntas visibles.

## Verificación

`npm run check` terminó verde: 26 pruebas aprobadas. Incluye tipos Astro sin errores ni advertencias, la prueba de GTM y la nueva prueba de schema. La prueba nueva construye ambos sitios y verifica JSON válido, `<` escapado, IDs definidos una vez, referencias conectadas, migas inglesas/españolas, `Service` opt-in, Walker y la continuidad de FAQPage.

### Portada de Stuart

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://stuarthomeownersinsurance.com/#website",
      "url": "https://stuarthomeownersinsurance.com/",
      "name": "Stuart Homeowners Insurance (Demo)",
      "inLanguage": "en",
      "publisher": { "@id": "https://stuarthomeownersinsurance.com/#agency" }
    },
    {
      "@type": "InsuranceAgency",
      "@id": "https://stuarthomeownersinsurance.com/#agency",
      "name": "Stuart Homeowners Insurance (Demo)",
      "url": "https://stuarthomeownersinsurance.com/",
      "telephone": "+17722470106",
      "email": "info@stuarthomeownersinsurance.com",
      "areaServed": ["Stuart", "Port Salerno", "Palm City"],
      "logo": "https://stuarthomeownersinsurance.com/logo.svg",
      "parentOrganization": { "@id": "https://www.walkerinsuranceagency.com/#organization" }
    },
    {
      "@type": "InsuranceAgency",
      "@id": "https://www.walkerinsuranceagency.com/#organization",
      "name": "Walker Insurance Agency",
      "url": "https://www.walkerinsuranceagency.com/",
      "telephone": "+14079777100",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "789 SW Federal Highway, Suite 201",
        "addressLocality": "Stuart",
        "addressRegion": "FL",
        "postalCode": "34994"
      }
    }
  ]
}
```

### Stuart `/flood-insurance/`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://stuarthomeownersinsurance.com/#website",
      "url": "https://stuarthomeownersinsurance.com/",
      "name": "Stuart Homeowners Insurance (Demo)",
      "inLanguage": "en",
      "publisher": { "@id": "https://stuarthomeownersinsurance.com/#agency" }
    },
    {
      "@type": "InsuranceAgency",
      "@id": "https://stuarthomeownersinsurance.com/#agency",
      "name": "Stuart Homeowners Insurance (Demo)",
      "url": "https://stuarthomeownersinsurance.com/",
      "telephone": "+17722470106",
      "email": "info@stuarthomeownersinsurance.com",
      "areaServed": ["Stuart", "Port Salerno", "Palm City"],
      "logo": "https://stuarthomeownersinsurance.com/logo.svg",
      "parentOrganization": { "@id": "https://www.walkerinsuranceagency.com/#organization" }
    },
    {
      "@type": "InsuranceAgency",
      "@id": "https://www.walkerinsuranceagency.com/#organization",
      "name": "Walker Insurance Agency",
      "url": "https://www.walkerinsuranceagency.com/",
      "telephone": "+14079777100",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "789 SW Federal Highway, Suite 201",
        "addressLocality": "Stuart",
        "addressRegion": "FL",
        "postalCode": "34994"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://stuarthomeownersinsurance.com/flood-insurance/#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://stuarthomeownersinsurance.com/" },
        { "@type": "ListItem", "position": 2, "name": "Flood Insurance", "item": "https://stuarthomeownersinsurance.com/flood-insurance/" }
      ]
    }
  ]
}
```

No contiene `Service`, porque la página no declara `serviceName`.

### `_example` `/coverage-fixture/`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://example-flood.invalid/#website",
      "url": "https://example-flood.invalid/",
      "name": "Example Flood Insurance",
      "inLanguage": "en",
      "publisher": { "@id": "https://example-flood.invalid/#agency" }
    },
    {
      "@type": "InsuranceAgency",
      "@id": "https://example-flood.invalid/#agency",
      "name": "Example Flood Insurance",
      "url": "https://example-flood.invalid/",
      "telephone": "+15305152668",
      "email": "hello@example-flood.invalid",
      "areaServed": ["Stuart", "Port Salerno", "Palm City", "Hobe Sound"],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Placeholder Avenue",
        "addressLocality": "Stuart",
        "addressRegion": "FL",
        "postalCode": "34994"
      },
      "logo": "https://example-flood.invalid/logo.svg",
      "parentOrganization": { "@id": "https://example-agency.invalid/#organization" }
    },
    {
      "@type": "InsuranceAgency",
      "@id": "https://example-agency.invalid/#organization",
      "name": "Example Licensed Insurance Agency",
      "url": "https://example-agency.invalid/",
      "telephone": "+15305550199",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "456 Fixture Avenue",
        "addressLocality": "Stuart",
        "addressRegion": "FL",
        "postalCode": "34994"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://example-flood.invalid/coverage-fixture/#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example-flood.invalid/" },
        { "@type": "ListItem", "position": 2, "name": "Coverage page fixture", "item": "https://example-flood.invalid/coverage-fixture/" }
      ]
    },
    {
      "@type": "Service",
      "@id": "https://example-flood.invalid/coverage-fixture/#service",
      "name": "Fixture coverage",
      "serviceType": "Fixture coverage",
      "url": "https://example-flood.invalid/coverage-fixture/",
      "description": "Disposable coverage-page layout fixture with no real insurance content or claim.",
      "provider": { "@id": "https://example-flood.invalid/#agency" },
      "areaServed": ["Stuart", "Port Salerno", "Palm City", "Hobe Sound"]
    }
  ]
}
```

## Lo que toqué fuera de lo pedido

- `package.json`: las pruebas de build ahora se ejecutan en serie para que no compartan y borren `dist/` de forma concurrente.
- `scripts/check-production-config.test.mjs`: prueba que un placeholder anidado dentro de `agency` sigue bloqueando producción.

## Lo que no pude verificar

El Rich Results Test externo lo corre Pavel como pidió el prompt. Publish site Workers sí quedó
verificado en verde para `3212244`:
[`36923565874`](https://github.com/microsites-wicfl/wicfl-microsites/actions/runs/36923565874).

## Dónde dudé

No hubo ambigüedad material. Elegí `#organization` para la agencia asociada, exactamente como establece el prompt, y omití el iframe/schema extra sin datos configurados.

## Qué me sorprendió del repo

Dos pruebas existentes ya construyen ambos sitios. Añadir otra prueba de build al mismo comando reveló que Node las ejecutaba en paralelo y una podía borrar los archivos de la otra. El check ahora es determinista.

## Lo que no se hizo

No se modificaron `apps/studio/`, `apps/lead-api/` ni el contenido de Stuart. Studio puede añadir su control de `serviceName` después sobre el mismo frontmatter.

## Próximos pasos sugeridos

- Pavel puede revisar estos tres grafos con Rich Results Test y decidir qué páginas reales de Stuart llevan `serviceName`.

## Commits

- `3212244` — `feat(template): connected schema graph, breadcrumbs and per-page Service (W-125)`.
- Publish site Workers run `36923565874` — success, con `_example` y `stuart-homeowners` publicados.
