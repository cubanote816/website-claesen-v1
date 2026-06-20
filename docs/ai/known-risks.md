# Riesgos Conocidos — Claesen Verlichting Web v1

Última actualización: 2026-06-02 — análisis estático + inspección en producción.

---

## SECCIÓN 1: Bugs confirmados en producción (vivos ahora mismo)

Estos bugs fueron verificados directamente en `https://claesen-verlichting.be/v1/`.

### PROD-001 — /v1/fr/ devuelve 403 Forbidden
**Severidad:** CRÍTICO  
**Verificado:** 2026-06-02 via WebFetch  
**Estado del fix:** CLA-113 In Progress — `chmod 755` vía LFTP pusheado (`c42f1bb`), resultado del deploy pendiente de smoke test  
**Síntoma:** La ruta francesa `/v1/fr/` devuelve HTTP 403. El sitio en francés es inaccesible. `/v1/en/` y `/v1/de/` sirven 200 con el mismo build.  
**Impacto:** Todos los usuarios francófonos (mercado belga importante) no pueden acceder al sitio.

**Árbol de causas a investigar (de más a menos probable):**

1. **Permisos de directorio en servidor** — `fr/` creado con umask restrictivo (700 o 750) y no corregido. El `chmod 755` del deploy (`c42f1bb`) resuelve esto si el servidor permite chmod vía SFTP.
2. **Configuración Nginx/Apache** — Regla `deny`, `location` que no cubre `/v1/fr/`, falta de `try_files`, alias o rewrite roto solo para esa ruta. Explicaría por qué `en/` y `de/` funcionan pero `fr/` no.
3. **Owner incorrecto** — El directorio `fr/` puede tener owner diferente al process user del servidor web, haciendo el chmod inefectivo.
4. **index.html ausente o corrupto** — El mirror `--only-newer` podría haber omitido `fr/index.html` en algún deploy si el archivo no se detectó como "nuevo".
5. **Caché del servidor/CDN** — Una respuesta 403 cacheada puede persistir aunque se corrija la causa real.

**Protocolo de investigación si el chmod no resuelve:**
- Comparar permisos y owner de `/v1/en/`, `/v1/fr/`, `/v1/de/` en el servidor (requiere acceso SSH o panel de hosting)
- Revisar logs de acceso del servidor web para el 403 (Apache: `access.log`, Nginx: `access.log`)
- Revisar configuración del vhost: `location /v1/fr/`, `.htaccess` en `/v1/fr/`, reglas `deny`
- Verificar que `/v1/fr/index.html` existe en el servidor y tiene permisos 644

**Archivos relacionados:** `.github/workflows/deploy.yml`, configuración del servidor web
**Ticket:** CLA-113

### PROD-002 — Textos en holandés visibles en la versión inglesa
**Severidad:** ALTO  
**Verificado:** 2026-06-02 via WebFetch en `/v1/en/`  
**Síntomas confirmados:**
- Botón: `"Plan een lichtstudie in"` (holandés) — debería decir `"Schedule a light study"`
- Nota formulario: `"* Wij nemen binnen 24 uur contact met u op om uw wensen te bespreken."` (holandés)  
**Causa:** Strings hardcodeados en `ServicesSection.astro:82-93` y `QuickOfferteSection.astro:89` — no están en el sistema i18n.  
**Impacto:** Experiencia rota para usuarios en EN, FR, DE.  
**Archivos:** `src/components/sections/ServicesSection.astro`, `src/components/sections/QuickOfferteSection.astro`  
**Ticket sugerido:** WEB-BUG-I18N-001

### PROD-003 — Página 404 custom no se sirve
**Severidad:** MEDIO  
**Verificado:** 2026-06-02 via WebFetch en `/v1/404`  
**Síntoma:** La URL `/v1/404` devuelve 404 genérico del servidor, no la página custom `SpotlightError.tsx`.  
**Causa:** La página 404 de Astro se activa para rutas no encontradas, pero el servidor puede estar interceptando antes. Además, `SpotlightError.tsx` tiene `href="/"` hardcodeado (ignora base path `/v1`).  
**Impacto:** Usuarios perdidos ven error genérico del hosting en lugar de experiencia de marca.  
**Archivo:** `src/components/SpotlightError.tsx:63`, `src/pages/404.astro`  
**Ticket sugerido:** WEB-BUG-404-001

### PROD-004 — Logo de partner con nombre vacío en marquee
**Severidad:** MEDIO  
**Verificado:** 2026-06-02 via WebFetch  
**Síntoma:** El marquee de logos incluye una imagen rota: `![](/assets/logo_partner/.jpg)` — nombre de archivo vacío.  
**Causa:** El directorio `public/assets/logo_partner/` tiene algún archivo con nombre inválido o hay un archivo oculto que pasa el filtro de extensión en `TrustSection.astro`.  
**Impacto:** Imagen rota visible en la sección de clientes.  
**Archivo:** `src/components/sections/TrustSection.astro:17-27`  
**Ticket sugerido:** WEB-BUG-LOGO-001

### PROD-005 — Sin etiquetas hreflang en ninguna página
**Severidad:** ALTO (SEO)  
**Verificado:** 2026-06-02 — ausente en HTML inspeccionado  
**Síntoma:** No existe ninguna etiqueta `<link rel="alternate" hreflang>` en el `<head>`.  
**Impacto:** Google no sabe que existen versiones en EN/FR/DE. El sitio puede indexarse solo en NL o con contenido duplicado penalizado.  
**Archivo:** `src/layouts/Layout.astro`  
**Ticket sugerido:** WEB-SEO-001

---

## SECCIÓN 2: Bugs críticos detectados en código (no verificados visualmente)

### CODE-001 — Etiqueta `<video>` con HTML inválido
**Severidad:** CRÍTICO  
**Archivo:** `src/components/pages/LandingPage.astro:39-48`  
**Problema:** La etiqueta de apertura `<video>` no se cierra con `>` antes de `<source>`. La estructura es: `autoplay <source src="..." />` dentro del tag de apertura.  
**Impacto:** El video hero puede no reproducirse en navegadores estrictos con el parser HTML.

### CODE-002 — Paths de hero hardcodeados con `/v1/`
**Severidad:** ALTO  
**Archivos:** `src/components/pages/LandingPage.astro:35,47`  
**Problema:** `background-image: url('/assets/hero-bg.jpg')` y `src="/assets/hero-video.mp4"` — paths hardcodeados que ignoran `BASE_URL`.  
**Impacto:** Se rompe si el base path cambia en `astro.config.mjs`.

### CODE-003 — CookieConsent hardcodeado en inglés
**Severidad:** ALTO (i18n)  
**Archivo:** `src/components/CookieConsent.tsx`  
**Problema:** Textos `"We use cookies"`, `"Accept All"`, `"Decline"` hardcodeados en EN. No usa el sistema i18n. No recibe prop `lang`.  
**Impacto:** Usuarios NL/FR/DE ven el banner en inglés.

### CODE-004 — Console.log en producción expone API URL y env vars
**Severidad:** ALTO (seguridad)  
**Archivos:** `src/services/api.ts:8-9`, `src/services/consultation.ts:26`  
**Problema:** `console.log('API_BASE_URL:', API_BASE_URL)` y `console.log('Environment variables:', import.meta.env)` — se ejecutan en el navegador de cada visitante.  
**Impacto:** Cualquier persona con DevTools abierto ve la URL completa del backend y todas las variables de entorno públicas. Además `consultation.ts` loguea el payload completo (nombre, email, teléfono del usuario).

### CODE-005 — dangerouslySetInnerHTML sin sanitización
**Severidad:** MEDIO (seguridad)  
**Archivo:** `src/components/ProjectGalleryModal.tsx:179`  
**Problema:** `dangerouslySetInnerHTML={{ __html: getLocalized(project.description) }}` — el HTML de la descripción viene de la API sin pasar por ningún sanitizador.  
**Impacto:** Si la API es comprometida o un admin inyecta contenido malicioso, el sitio es vulnerable a XSS.

### CODE-006 — og-image.jpg referenciado pero ausente
**Severidad:** MEDIO (SEO)  
**Archivo:** `src/layouts/Layout.astro:37,44`  
**Problema:** `<meta property="og:image" content="/v1/og-image.jpg" />` — el archivo no existe en `public/`.  
**Impacto:** Cuando se comparte el sitio en redes sociales, no aparece ninguna imagen de preview.

### CODE-007 — Meta description y keywords en inglés para todos los idiomas
**Severidad:** MEDIO (SEO)  
**Archivo:** `src/layouts/Layout.astro:28-29`  
**Problema:** Las meta description y keywords están hardcodeadas en inglés independientemente del idioma de la página.  
**Impacto:** SEO degradado para búsquedas en NL/FR/DE.

### CODE-008 — OG URL apunta a dominio incorrecto
**Severidad:** MEDIO (SEO)  
**Archivo:** `src/layouts/Layout.astro:34`  
**Problema:** `<meta property="og:url" content="https://claesen.be/" />` — el sitio vive en `claesen-verlichting.be`.  
**Impacto:** Links en redes sociales pueden apuntar al dominio incorrecto.

### CODE-009 — Página 404 link apunta a "/" sin base path
**Severidad:** MEDIO  
**Archivo:** `src/components/SpotlightError.tsx:63`  
**Problema:** `href="/"` — en producción debería ser `/v1/`.  
**Impacto:** El botón "Back to Light" lleva a una URL 404 en producción.

### CODE-010 — Referencia a `window` en interceptor 401 (riesgo SSR)
**Severidad:** BAJO-MEDIO  
**Archivo:** `src/services/api.ts:53`  
**Problema:** `window.location.pathname.startsWith(...)` en el interceptor de respuesta Axios.  
**Nota:** Aunque Astro SSG no ejecuta esto en servidor, si el proyecto migra a SSR o se usan endpoints de servidor, este código explotará.

---

## SECCIÓN 3: Deuda técnica

### TECH-001 — Mapeo de imágenes duplicado 3 veces
**Archivo:** `src/services/portfolio.ts`  
**Problema:** La lógica de `formatImageUrl` + mapeo de gallery se repite idénticamente en `getProjects`, `getFeaturedProjects` y `getProject`.  
**Riesgo:** Un bug en el mapeo hay que corregirlo en 3 lugares.

### TECH-002 — QuickOfferte accede a inputs por placeholder
**Archivo:** `src/components/sections/QuickOfferteSection.astro:113-115`  
**Problema:** El script JS accede a los inputs con `querySelector('[placeholder="John Doe"]')` en lugar de usar atributos `name`.  
**Riesgo:** Si los placeholders cambian (p.ej. al traducir), el formulario deja de funcionar silenciosamente.

### TECH-003 — Language switcher duplicado
**Archivo:** `src/components/ClassicNav.astro:62-94` y `143-167`  
**Problema:** La misma lógica de construcción de rutas por idioma está duplicada para desktop y mobile.

### TECH-004 — Sin comandos de lint, test ni typecheck en package.json
**Estado actual:** No existen `npm run lint`, `npm run test`, `npm run typecheck`.  
**Riesgo:** No hay barrera automática para errores de tipos o estilo antes del deploy.

### TECH-005 — Descripciones de proyectos en NL en campo `en`
**Archivo:** `public/v1-media/projects-static.json` (generado)  
**Problema:** El campo `description.en` de muchos proyectos contiene texto en holandés sin traducir.  
**Riesgo:** Usuarios EN/FR/DE ven descripciones en holandés en los modales de proyectos.

### TECH-006 — Assets sin usar del starter Astro
**Archivos:** `src/components/Welcome.astro`, `src/assets/astro.svg`, `src/assets/background.svg`  
**Riesgo:** Bajo. Limpieza cosmética.

### TECH-007 — Footer: redes sociales sin URLs reales
**Archivo:** `src/components/Footer.astro:41-46`  
**Problema:** LinkedIn, Instagram y Twitter apuntan a `"#"`. Solo Facebook tiene URL real.  
**Riesgo:** Links no funcionales en producción.

### TECH-008 — Hero video con preload="auto"
**Archivo:** `src/components/pages/LandingPage.astro:44`  
**Problema:** `preload="auto"` descarga el MP4 completo en cada carga de página.  
**Impacto:** ~5-20MB de datos extra en la primera visita, especialmente costoso en móvil.

---

## SECCIÓN 4: Riesgos de servidor propio

El proyecto migró (o está en proceso de migrar) de hosting compartido/LFTP a servidor propio. El riesgo principal ya no es "LFTP deja permisos mal" sino "la configuración del servidor puede servir unos idiomas y bloquear otros".

### SERVER-001 — Configuración del vhost puede discriminar rutas de idioma
**Riesgo PRINCIPAL activo**  
**Evidencia:** `/v1/fr/` → 403, `/v1/en/` y `/v1/de/` → 200 con el mismo build.  
**Causas posibles:** `location` de Nginx sin cobertura de `/v1/fr/`, regla `deny` específica, falta de `try_files $uri $uri/ /v1/fr/index.html`, `.htaccess` con `deny from all`.  
**Investigar:** Logs del servidor, config del vhost, comparación directa de permisos entre directorios de idioma.

### SERVER-002 — Fallback 404 del servidor vs página 404 de Astro
**Riesgo:** Si el servidor no está configurado para redirigir rutas no encontradas a `/v1/404.html`, el servidor devuelve su propio 404 en lugar de la página custom SpotlightError.  
**Fix requerido:** Configurar en Nginx `error_page 404 /v1/404.html` o equivalente en Apache.

### SERVER-003 — Cache headers sin configurar
**Riesgo:** Sin cache headers explícitos, assets estáticos (JS, CSS, imágenes) no se benefician de caché del navegador. Impacto en performance.  
**Recomendado:** `Cache-Control: max-age=31536000, immutable` para assets con hash. `Cache-Control: no-cache` para HTML.

### SERVER-004 — Compresión Gzip/Brotli no verificada
**Riesgo:** Sin compresión, el JS/CSS del bundle se sirve sin comprimir. Impacto directo en LCP.

### SERVER-005 — Certificado TLS y renovación
**Riesgo:** Sin monitoreo del certificado, una expiración corta el HTTPS silenciosamente.

### SERVER-006 — Sin monitoreo de disponibilidad por idioma
**Riesgo:** Un 403 como el de `/v1/fr/` puede pasar desapercibido durante días sin monitoreo.  
**Recomendado:** Uptime monitor que verifique los 4 idiomas: `/v1/`, `/v1/en/`, `/v1/fr/`, `/v1/de/`.

## SECCIÓN 5: Riesgos de deploy (pipeline LFTP/SFTP)

### DEPLOY-001 — Deploy no destructivo: archivos obsoletos persisten
**Workflow:** `.github/workflows/deploy.yml`  
**Riesgo:** El flag `--only-newer` sin `--delete` significa que archivos eliminados del build no se borran del servidor. Con el tiempo, el servidor acumula assets obsoletos.

### DEPLOY-002 — Permisos de directorios en LFTP *(rebajado — mitigado en CLA-113)*
**Estado:** Mitigado parcialmente. `sftp:chmod-ignore yes` fue removido y se añadieron `chmod 755` explícitos en el deploy (`c42f1bb`). Si el 403 persiste, la causa raíz es SERVER-001 (config del servidor), no este riesgo.

### DEPLOY-003 — Paralelismo bajo en deploy
**Workflow:** `--parallel=2`  
**Riesgo:** Deploy lento con muchos assets. Puede causar timeouts en deploys grandes.

### DEPLOY-004 — Rollback sin procedimiento definido
**Estado:** No existe script ni documentación de rollback.  
**Riesgo:** En caso de deploy roto, el proceso de rollback es manual y no documentado.

---

## SECCIÓN 5: Decisiones pendientes del producto

| Decisión | Contexto |
|----------|---------|
| ¿Se activa el botón "Bekijk Showreel" en el hero? | Actualmente comentado en `LandingPage.astro:74-83` |
| ¿Se crean URLs reales para LinkedIn/Instagram/Twitter? | Requiere input del cliente |
| ¿Se embebe Google Maps real en ContactSection? | Actualmente usa foto Unsplash como placeholder |
| ¿Se traducen páginas privacy/terms/cookies a EN/FR/DE? | `legal.ts` solo tiene NL |
| ¿Se corrige el 403 de /fr/ con chmod en deploy? | Requiere acceso SSH al servidor para diagnóstico |
