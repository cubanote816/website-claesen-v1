# Contratos del Sitio Web — Claesen Verlichting Web v1

Reglas que no se pueden romper. Cualquier cambio que viole un contrato requiere aprobación explícita del usuario.

## Contratos de rutas

### No romper rutas públicas existentes
Las siguientes rutas deben seguir funcionando después de cualquier cambio:
- `/v1/` — landing NL
- `/v1/en/` — landing EN
- `/v1/de/` — landing DE
- `/v1/privacy` — política de privacidad
- `/v1/terms` — términos y condiciones
- `/v1/cookies` — política de cookies

**Verificar:** `npm run build` no debe producir errores. Las rutas deben aparecer en `dist/`.

### Respetar el base path `/v1`
Todo enlace interno, asset estático y referencia de imagen debe usar `import.meta.env.BASE_URL` o `${baseUrl}` — nunca paths hardcodeados con `/v1/`.

**Excepción conocida:** Existen paths hardcodeados en LandingPage.astro (bug CODE-002 documentado). No introducir nuevos.

### No alterar la estructura de i18n
- `src/i18n/ui.ts` es la fuente de verdad de todas las traducciones de UI
- Los 4 idiomas (`nl`, `en`, `fr`, `de`) deben mantenerse sincronizados: una clave añadida en `nl` debe añadirse en los otros 3
- El idioma default es `nl` — siempre debe tener todas las claves
- No añadir strings hardcodeados en componentes; siempre usar `t['clave']`

## Contratos de SEO

### No degradar meta tags existentes
`src/layouts/Layout.astro` define meta description, og tags y twitter tags.
- No eliminar ninguna etiqueta existente
- No cambiar el `<title>` sin actualizar las traducciones correspondientes
- Las URLs en og:url deben ser absolutas y correctas

### No romper la indexabilidad
- No añadir `<meta name="robots" content="noindex">` sin aprobación explícita
- No bloquear rutas en robots.txt sin aprobación

## Contratos de assets e imágenes

### No eliminar assets referenciados activamente
Los siguientes archivos están en uso directo y no deben eliminarse:
- `public/assets/hero-bg.jpg` — imagen fallback del hero
- `public/assets/hero-video.mp4` — video del hero
- `public/assets/brand-logo-dark.png` — logo en nav y footer
- `public/assets/favicon.ico` — favicon
- `public/assets/logo_partner/` — logos de clientes (marquee)
- `public/assets/owners.jpg` — foto en AboutSection
- `src/assets/team/installation.png`
- `src/assets/team/engineering.png`
- `src/assets/team/logistics.png`

### No añadir imágenes sin optimizar
- Preferir formatos WebP o AVIF para imágenes nuevas
- No añadir imágenes superiores a 2MB sin justificación
- El video `hero-video.mp4` no debe superarse en tamaño sin revisar el `preload`

## Contratos de integración con API/backend

### No cambiar el contrato de datos de `portfolio.ts`
- La interfaz `Project` en `src/types/portfolio.ts` define el contrato del backend
- Cambios en los campos de `Project` requieren verificación con el backend real
- El campo `gallery_images` es el array normalizado para el frontend; `gallery` y `api_gallery` son raw

### No romper el caché estático
- `public/v1-media/projects-static.json` es generado por `scripts/sync-content.js`
- No editar este archivo manualmente
- El formato esperado: `{ "projects": [...] }` con el schema de `Project`
- Si `PUBLIC_USE_STATIC_CACHE=true`, el frontend usa este archivo — cualquier cambio en el schema debe actualizarse aquí también

### No romper el formulario de contacto
- `ConsultationService.sendConsultation()` en `src/services/consultation.ts` envía datos al backend
- El payload requerido: `name`, `email`, `message`, `type`
- No cambiar los nombres de los campos sin verificar el endpoint de backend

## Contratos de deploy

### No modificar el workflow de deploy sin testing
- `.github/workflows/deploy.yml` controla el único pipeline de producción
- Cualquier cambio debe testearse en un branch antes de merge a `main`
- No añadir `--delete` al comando LFTP mirror sin revisar DEPLOY-001 en `known-risks.md`

### No hacer push directo a main con código roto
- El build debe pasar localmente (`npm run build`) antes del commit
- Un build roto en `main` dispara un deploy roto a producción automáticamente

### Variables de entorno: solo nombres, nunca valores
- No hardcodear URLs, tokens ni passwords en código
- Usar siempre variables de entorno o `import.meta.env.VARIABLE`
- No copiar valores de `.env` en documentación, comentarios ni logs

## Contratos de accesibilidad

### No degradar accesibilidad básica
- Toda imagen decorativa debe tener `alt=""` o `role="presentation"`
- Toda imagen informativa debe tener `alt` descriptivo
- No eliminar etiquetas `<label>` de formularios
- No reducir el contraste de texto respecto al estado actual

## Contratos de consistencia visual

### No cambiar el sistema de diseño sin justificación
Los tokens visuales están definidos en `src/styles/global.css`:
- `--color-obsidian: #0B0B0F` — fondo principal
- `--color-gunmetal: #1A1A22` — fondo de cards
- `--color-lux-gold: #FCD34D` — color de acento principal
- `--color-electric-amber: #F59E0B` — acento secundario
- `--color-cool-slate: #64748B` — texto secundario

No cambiar estos valores sin actualizar todos los componentes que los usan.

### No romper la tipografía
- `font-display` = Unbounded — solo para títulos h1/h2
- `font-body` = Inter — para todo el resto
- No añadir fuentes nuevas sin aprobación (peso en carga)

## Contratos de dependencias

### No añadir dependencias sin justificación
El proyecto ya incluye Framer Motion (animaciones) y Axios (HTTP).
Antes de añadir una dependencia nueva, verificar:
1. ¿Ya existe una dependencia que hace lo mismo?
2. ¿Cuánto pesa en el bundle?
3. ¿Tiene mantenimiento activo?

### No actualizar dependencias masivamente sin testing
Las actualizaciones de Astro, React y TailwindCSS pueden tener breaking changes.
Actualizar una a la vez, con build de verificación.
