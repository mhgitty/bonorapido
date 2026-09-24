# Bonorapido — setup checklist

Copied from Pokcas. Frontend in Spanish; Studio/backend unchanged (English).

Markets: root `/` = Spain (es-ES) · `/ar/` = Argentina (es-AR) · `/mx/` = Mexico (es-MX).
Sanity `market` values: `global`, `ar`, `mx`.

## Routes (and the CMS page slugs they read)
| URL | Sanity page slug (per market) |
|---|---|
| `/resenas/` · `/resenas/[casino]/` | page `resenas` |
| `/{ar,mx}/casinos-online/resenas/` | `casinos-online` › `resenas` |
| `/{ar,mx}/bonos-de-casino/` | `bonos-de-casino` |
| `/[mkt]/casinos-online/metodos-de-deposito/` | `casinos-online` › `metodos-de-deposito` |
| `/[mkt]/casinos-online/proveedores/` | `casinos-online` › `proveedores` |
| `/[mkt]/tragamonedas/` | `tragamonedas` |
| `/[mkt]/guias-casino/` | `guias-casino` |
| `/[mkt]/juegos-de-casino/[slug]/` | casinoGame doc, else page `juegos-de-casino` › slug |
| `/noticias/`, `/autor/[slug]/`, `/futbol/clasificaciones/[slug]/` | posts / authors / ligaStillinger |
| `/go/[code]/`, `/{ar,mx}/go/[code]/` | redirect docs (affiliate links) |

## Env vars (.env.local + Vercel)
```
NEXT_PUBLIC_SANITY_PROJECT_ID=<new project id>
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SITE_URL=https://bonorapido.com
REVALIDATE_SECRET=<random>
NEXT_PUBLIC_SANITY_PREVIEW_SECRET=<random>
SANITY_API_READ_TOKEN=<viewer token>
SANITY_WRITE_TOKEN=<editor token, optional – used by /api/normalize-blocks>
NEXT_PUBLIC_GA_ID=<new GA4 id, optional>
SPORTSMONKS_API_TOKEN=<optional – football tables>
```

## Still to replace
- `public/logo.webp`, `public/favicon.webp`, `public/og.png` (still Pokcas branding)

## GitHub Actions backup
Repo → Settings → Secrets and variables → Actions:
- Secret `SANITY_AUTH_TOKEN` (Viewer token)
- Variable `SANITY_PROJECT_ID`
