# Mapa de Contexto — Claesen Verlichting Web v1

Última actualización: 2026-06-02. Basado en exploración directa del repositorio.

## Stack técnico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Astro (SSG) | v5.17.1 |
| UI runtime | React | v19.2.4 |
| Estilos | TailwindCSS (Vite plugin) | v4.1.18 |
| Animaciones | Framer Motion | v12.34.0 |
| Iconos | Lucide React | v0.563.0 |
| HTTP client | Axios | v1.13.5 |
| Fuente display | Unbounded (@fontsource) | v5.2.8 |
| Fuente body | Inter (@fontsource) | v5.2.8 |
| Node | — | 20 (en CI) |

## Configuración Astro

- **Base path:** `/v1` (configurable via `ASTRO_BASE_PATH`)
- **Site:** `https://claesen-verlichting.be` (configurable via `ASTRO_SITE_URL`)
- **Build output:** `dist/`
- **Assets:** `dist/assets_astro/`
- **i18n:** defaultLocale `nl`, locales `[nl, en, fr, de]`, sin prefijo en default
- **View Transitions:** `<ClientRouter />` activo (Astro transitions)

## Variables de entorno relevantes (solo nombres, nunca valores)

| Variable | Obligatoria | Descripción |
|----------|------------|-------------|
| `PUBLIC_API_URL` | Sí | URL base del backend API |
| `PUBLIC_API_BASE_URL` | No | URL alternativa del API |
| `PUBLIC_USE_STATIC_CACHE` | Sí en prod | `'true'` activa caché estático |
| `ASTRO_SITE_URL` | No | Override de `site` en astro.config |
| `ASTRO_BASE_PATH` | No | Override de `base` en astro.config |
| `FTP_USERNAME` | Solo en CI | Usuario SFTP para deploy |
| `FTP_PASSWORD` | Solo en CI | Contraseña SFTP para deploy |
| `FTP_SERVER` | Solo en CI | Host SFTP para deploy |

## Arquitectura de datos

```
Build time:
  scripts/sync-content.js
    → GET backend.claesen-verlichting.be/v1/website/projects
    → Descarga imágenes de proyectos
    → Escribe public/v1-media/projects-static.json

Runtime (navegador):
  ModernPortfolio.tsx
    → portfolioService.getProjects()
    → Si PUBLIC_USE_STATIC_CACHE=true: fetch /v1-media/projects-static.json
    → Si no: GET API /projects
```

## Rutas de la aplicación

| Ruta | Archivo | Idioma | Estado |
|------|---------|--------|--------|
| `/v1/` | `src/pages/index.astro` | NL (default) | ✅ OK |
| `/v1/en/` | `src/pages/[lang]/index.astro` | EN | ✅ OK |
| `/v1/fr/` | `src/pages/[lang]/index.astro` | FR | ⚠️ **403 en producción** |
| `/v1/de/` | `src/pages/[lang]/index.astro` | DE | ✅ OK |
| `/v1/privacy` | `src/pages/privacy.astro` | NL solo | ✅ OK |
| `/v1/terms` | `src/pages/terms.astro` | NL solo | ✅ OK |
| `/v1/cookies` | `src/pages/cookies.astro` | NL solo | ✅ OK |
| `/v1/[lang]/privacy` | `src/pages/[lang]/privacy.astro` | EN/FR/DE | Sin contenido localizado |
| `/v1/[lang]/terms` | `src/pages/[lang]/terms.astro` | EN/FR/DE | Sin contenido localizado |
| `/v1/[lang]/cookies` | `src/pages/[lang]/cookies.astro` | EN/FR/DE | Sin contenido localizado |
| `/v1/404` | No existe como ruta explícita | — | Sirve 404 del servidor, no SpotlightError |

## Secciones de la landing (en orden de renderizado)

```
LandingPage.astro
├── Layout.astro (nav + cookie consent + view transitions)
│   └── ClassicNav.astro          → Navegación fija, 4 idiomas, scroll spy
│
├── #home                         → Hero (video + imagen fallback)
├── #why-us     WhyUsSection      → 5 USP cards
├── #projects   PortfolioSection  → Grid filtrable + modal galería
├── #quick-offerte QuickOfferte   → Formulario simplificado 3 campos
├── #services   ServicesSection   → 4 servicios + CTA (⚠️ texto hardcoded NL)
├── #about      AboutSection      → Texto historia + imagen
├── #trust      TrustSection      → Stats + marquee logos clientes
├── #team-gallery TeamGallery     → 3 fotos del equipo
├── #contact    ContactSection    → Info + formulario completo
└── Footer.astro                  → Links + legal + redes sociales
```

## Componentes principales

| Componente | Tipo | Hidratación | Responsabilidad |
|-----------|------|------------|----------------|
| `Layout.astro` | Astro | — | HTML base, meta tags, fonts, ClientRouter |
| `ClassicNav.astro` | Astro | — | Nav fija, scroll spy, language switcher, mobile menu |
| `LandingPage.astro` | Astro | — | Ensamblado de secciones, hero |
| `ModernPortfolio.tsx` | React | `client:visible` | Grid de proyectos + filtros + estado |
| `ModernProjectCard.tsx` | React | (dentro de ModernPortfolio) | Tarjeta de proyecto con hover |
| `ProjectGalleryModal.tsx` | React | (dentro de ModernPortfolio) | Modal galería con navegación por teclado |
| `ContactForm.tsx` | React | `client:visible` | Formulario de contacto con validación |
| `CookieConsent.tsx` | React | `client:load` | Banner de cookies (⚠️ hardcodeado en EN) |
| `VideoModal.tsx` | React | `client:load` | Modal del showreel |
| `PageHeader.tsx` | React | `client:visible` | Header animado de sección |
| `Footer.astro` | Astro | — | Footer con links y redes sociales |
| `SpotlightError.tsx` | React | `client:only="react"` | Página 404 interactiva (⚠️ hardcodeada EN) |

## Sistema i18n

**Archivo central:** `src/i18n/ui.ts`
- 4 objetos de traducción: `nl`, `en`, `fr`, `de`
- Acceso: `t['clave']` donde `t = ui[lang]`
- `defaultLang = 'nl'`
- Fallback: `ui[lang] || ui[defaultLang]`

**Archivo legal:** `src/i18n/legal.ts`
- Solo contiene traducciones para NL
- Páginas `privacy`, `terms`, `cookies` solo disponibles en NL

**Strings sin i18n (bugs activos):**
- `ServicesSection.astro:82` — `h4` y `button` hardcodeados en NL
- `QuickOfferteSection.astro:89` — nota `*Wij nemen...` hardcodeada NL
- `CookieConsent.tsx` — todo hardcodeado en EN
- `SpotlightError.tsx` — todo hardcodeado en EN
- `ProjectGalleryModal.tsx:186-187` — "leer más/menos" por if/else, no desde i18n

## Servicios y tipos

| Archivo | Responsabilidad |
|---------|----------------|
| `src/services/api.ts` | Cliente Axios base, interceptores, manejo de errores |
| `src/services/portfolio.ts` | Obtención de proyectos (API o caché estático) |
| `src/services/consultation.ts` | Envío de formularios de contacto/offerte |
| `src/types/portfolio.ts` | Tipos: Project, GalleryImage, ProjectsResponse, etc. |
| `src/types/consultation.ts` | Tipos del formulario de consulta |
| `src/utils/storage.ts` | getToken/removeToken (heredado de panel admin) |

## Pipeline de build y deploy

```
Trigger: push a main | backend_update webhook | workflow_dispatch
        ↓
1. Checkout + Node 20 + npm ci
        ↓
2. sync:prod → GET API → public/v1-media/projects-static.json
        ↓
3. build:prod → astro build → dist/
        cp -r public/v1-media dist/v1-media
        ↓
4. Deploy LFTP/SFTP a sftp://HOST:2222
   - mkdir -p /v1/v1-media/
   - put projects-static.json
   - mirror -R --only-newer --parallel=2 ./dist /v1
   (NO --delete, NO chmod explícito → riesgo de permisos)
```

**Secretos de CI requeridos:** `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER`
**Secrets opcionales:** `PUBLIC_API_URL` (tiene fallback hardcodeado)

## Assets estáticos

```
public/
├── assets/
│   ├── hero-bg.jpg          → Imagen fallback del hero
│   ├── hero-bg.png          → Alternativa PNG
│   ├── hero-video.mp4       → Video del hero (preload="auto" ⚠️)
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── brand_logo.png
│   ├── brand-logo-dark.png  → Logo usado en nav y footer
│   ├── logo.png
│   ├── owners.jpg           → Imagen para AboutSection
│   ├── logo_partner/        → ~40 logos de clientes (PNG/JPG)
│   └── team/                → imágenes del equipo (installation, engineering, logistics)
```

**Ausente pero referenciado:**
- `/v1/og-image.jpg` — referenciado en meta og:image pero no existe en public/

## Scripts de utilidad

| Script | Función |
|--------|---------|
| `scripts/sync-content.js` | Sincroniza proyectos e imágenes del backend a `public/v1-media/` |
| `scripts/test-api.js` | Script de diagnóstico de API |
| `scripts/test-local-api.js` | Script de prueba de API local |
