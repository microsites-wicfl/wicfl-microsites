# WICFL Lead API

Dedicated public-form Worker. It is intentionally separate from the generated static pod Workers:
one deployment holds the external-service secrets and accepts only the configured pilot origins.

Set these dashboard secrets before deploying: `GHL_API_TOKEN`, `GHL_LOCATION_ID`,
`GOOGLE_PLACES_API_KEY`, `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY`, and `ALLOWED_ORIGINS`. Set `LEAD_SITES` as a JSON object that maps
each site slug to its approved `leadSource`, real `formId`, and GoHighLevel custom-field IDs.
Do not put any of those values in this repository.

The R2 bucket must remain private and its CORS rules must allow only the pilot origins to PUT
the signed PDF/JPEG/PNG/WebP uploads. URLs expire after five minutes and sign `Content-Type`.
