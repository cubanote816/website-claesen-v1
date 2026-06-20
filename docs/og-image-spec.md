# OG Image — Specificatie voor de klant

> **Voor wie:** Claesen Verlichting  
> **Waarom:** Beeld dat automatisch verschijnt bij het delen van de website op LinkedIn, Facebook, WhatsApp en X.  
> **Blokkeert:** smoke test op productieserver (og:image is momenteel een tijdelijke placeholder)

---

## Wat hebben we nodig?

**Een hoge-resolutie foto van een van uw projecten** — bij voorkeur een nachtopname van een verlicht stadion of industriële installatie.

| Vereiste | Detail |
|---|---|
| Formaat | JPG of PNG |
| Minimale afmeting | 1200 × 630 pixels |
| Oriëntatie | Horizontaal (landscape) |
| Kwaliteit | Scherpste foto die beschikbaar is |
| Inhoud | Geen tekst op de foto — logo en tagline worden er later op geplaatst |

**Geschikte voorbeelden:** KVC Westerlo, RSC Anderlecht, C-mine Genk of een ander project waarvan een kwalitatieve foto beschikbaar is.

---

## Optioneel: volledige merkafbeelding

Als u een afbeelding met logo + foto + tagline wenst, bezorgt u ons ook:

- Logo in SVG of PNG met transparante achtergrond (witte versie indien beschikbaar)
- Bevestiging van de tagline — standaard voorstel: *"Dé Belgische specialist in terreinverlichting"*

Het eindresultaat ziet er dan als volgt uit:

```
┌──────────────────────────────────────────┐  1200px
│                                          │
│   [nachtfoto verlicht project]           │
│            + donkere overlay             │
│                                          │  630px
│  [Logo Claesen]                          │
│  Dé Belgische specialist in              │
│  terreinverlichting                      │
└──────────────────────────────────────────┘
```

---

## Waar komt de afbeelding terecht?

Zodra de afbeelding is aangeleverd, wordt ze geplaatst op:

- `public/assets/og-image.jpg`
- Alle pagina's: `/v1/`, `/v1/en/`, `/v1/fr/`, `/v1/de/`
- Elke projectpagina gebruikt zijn eigen projectfoto als og:image

---

## Deadline

Vóór de smoke test op de productieserver. Zonder deze afbeelding verschijnt bij het delen van de website een generieke achtergrondfoto in plaats van een representatief merkbeeld.

---

*Technische notitie (intern): vervang `src/layouts/Layout.astro` regel `const ogImage = ogImageProp || \`${SITE_URL}${basePath}/assets/hero-bg.jpg\`` door `og-image.jpg` zodra het bestand aanwezig is in `public/assets/`.*
