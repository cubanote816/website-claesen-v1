# Checklists de Testing — Claesen Verlichting Web v1

## Comandos disponibles (verificados en package.json)

```bash
npm run dev           # Servidor de desarrollo local en http://localhost:4321/v1/
npm run build         # Build de producción → dist/
npm run preview       # Preview del build en http://localhost:4321/v1/
npm run sync          # Sincroniza proyectos del backend (requiere API disponible)
npm run sync:prod     # Sync en modo producción
npm run sync:dev      # Sync en modo desarrollo
npm run build:dev     # sync:dev + astro build --mode development
npm run build:prod    # sync:prod + astro build --mode production
```

**Comandos ausentes (recomendados para añadir):**
- `npm run lint` — no existe; recomendado: `eslint` + `@typescript-eslint`
- `npm run typecheck` — no existe; recomendado: `astro check` o `tsc --noEmit`
- `npm run test` — no existe; no hay suite de tests automatizados

## Checklist mínimo antes de cualquier commit

```
[ ] npm run build  →  sin errores, sin warnings críticos
[ ] git diff --stat  →  solo archivos del scope del ticket
[ ] Ningún .env ni secreto en los cambios
```

## Checklist de cambio de código (antes de merge a main)

### Build
```
[ ] npm run build  pasa sin errores
[ ] dist/ contiene las rutas esperadas:
    dist/index.html
    dist/en/index.html
    dist/de/index.html
    dist/privacy/index.html
    dist/terms/index.html
    dist/cookies/index.html
```

### Rutas (manual con npm run preview)
```
[ ] /v1/            carga correctamente (NL)
[ ] /v1/en/         carga correctamente (EN)
[ ] /v1/de/         carga correctamente (DE)
[ ] /v1/privacy     carga correctamente
[ ] /v1/terms       carga correctamente
[ ] /v1/cookies     carga correctamente
[ ] Ruta inexistente → página 404 (no error del servidor)
```

### i18n
```
[ ] Cambiar idioma NL→EN: todos los textos cambian
[ ] Cambiar idioma NL→FR: todos los textos cambian
[ ] Cambiar idioma NL→DE: todos los textos cambian
[ ] No hay texto en holandés visible en versión EN/FR/DE
    (revisar especialmente: ServicesSection CTA, QuickOfferte nota, CookieConsent)
[ ] Switch de idioma mantiene posición de scroll
[ ] Switch de idioma desde /v1/en/ apunta a /v1/ (no a /en/)
```

### Portfolio
```
[ ] Grid de proyectos carga (requiere red o caché estático disponible)
[ ] Filtros sport/industrial/public funcionan
[ ] Clic en proyecto abre modal
[ ] Modal muestra imagen, título, ubicación, año
[ ] Navegación de imágenes en modal (flechas + teclado)
[ ] ESC cierra el modal
[ ] Swipe en móvil navega imágenes
```

### Formularios
```
[ ] QuickOfferte: submit funciona (o muestra error si API no disponible)
[ ] ContactForm: validación de campos required funciona
[ ] ContactForm: submit muestra estado "enviando" y luego success/error
[ ] Formulario no se puede enviar dos veces (botón se deshabilita)
```

### Navegación
```
[ ] Logo en nav lleva a #home
[ ] Links de nav hacen scroll suave a la sección correcta
[ ] Nav se opacifica al hacer scroll hacia abajo
[ ] Nav se vuelve transparente al volver al top
[ ] Scroll spy activa el link correcto según sección visible
[ ] Mobile: hamburger abre/cierra menú
[ ] Mobile: link en menú cierra el menú y hace scroll
[ ] Mobile: menú no permite scroll del body cuando está abierto
```

### CTA y links
```
[ ] Botón "Offerte Aanvragen" en nav lleva a #contact
[ ] Botón hero "Vraag offerte aan" lleva a #contact
[ ] Botón hero "Bekijk Projecten" lleva a #projects
[ ] Botón showreel abre modal de video
[ ] Links del footer son funcionales (no "#")
[ ] Links de redes sociales tienen href real (actualmente LinkedIn/Instagram/Twitter son "#")
```

### Responsive (manual)
```
[ ] Mobile 375px: hero visible y botones accesibles
[ ] Mobile 375px: nav hamburger funciona
[ ] Mobile 375px: grid de proyectos es 2 columnas
[ ] Tablet 768px: layout se adapta correctamente
[ ] Desktop 1280px+: layout en su forma completa
```

### Performance (manual con DevTools)
```
[ ] LCP (Largest Contentful Paint) < 3s en 3G simulado
[ ] No hay requests fallidos en Network tab
[ ] El video hero no bloquea la primera pintura visible
[ ] Las imágenes del portfolio tienen tamaño razonable (<500KB por imagen)
```

### Cookie consent
```
[ ] Banner aparece en primera visita (tras ~1.5s)
[ ] "Accept All" cierra el banner y guarda cookie
[ ] "Decline" cierra el banner y guarda cookie
[ ] Segunda visita: banner NO aparece
[ ] Banner se cierra con botón X
```

## Checklist de cambio de i18n específicamente

```
[ ] La clave nueva existe en los 4 idiomas: nl, en, fr, de
[ ] El valor en cada idioma es una traducción real (no copia del NL)
[ ] El componente usa t['clave'] no texto hardcodeado
[ ] npm run build pasa
[ ] Preview en /v1/en/ muestra el texto en inglés correcto
```

## Checklist antes de deploy a producción

Ver `docs/ai/production-readiness.md` para el checklist completo de deploy.

## Checklist de smoke test post-deploy

```
[ ] https://claesen-verlichting.be/v1/ carga y muestra el hero
[ ] https://claesen-verlichting.be/v1/en/ carga en inglés
[ ] https://claesen-verlichting.be/v1/de/ carga en alemán
[ ] https://claesen-verlichting.be/v1/fr/ — ⚠️ actualmente 403 (PROD-001)
[ ] El portfolio muestra proyectos (caché estático)
[ ] El formulario de contacto no da error de red visible
[ ] La consola del navegador no muestra errores críticos
[ ] La consola no muestra datos de API ni env vars (CODE-004)
```
