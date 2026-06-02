# Production Readiness — Claesen Verlichting Web v1

Checklist obligatorio antes de cualquier merge a `main` que vaya a producción.

## Entorno de producción

| Item | Valor |
|------|-------|
| URL | `https://claesen-verlichting.be/v1/` |
| Base path | `/v1` |
| Deploy | GitHub Actions → LFTP/SFTP |
| Trigger automático | Push a `main` |
| Servidor | SFTP en puerto 2222 |
| Directorio remoto | `/v1` |

## Variables de entorno requeridas en CI

Solo nombres — nunca valores. Los valores viven en GitHub Secrets.

```
PUBLIC_API_URL      → URL del backend API
FTP_USERNAME        → Usuario SFTP
FTP_PASSWORD        → Contraseña SFTP
FTP_SERVER          → Host SFTP
```

Verificar que estos secrets están configurados en:
`GitHub → Settings → Secrets and variables → Actions`

## Checklist pre-merge

### Build

```
[ ] npm run build  ejecuta sin errores ni warnings críticos
[ ] dist/ contiene index.html, en/index.html, de/index.html
[ ] dist/v1-media/projects-static.json existe (si se hizo sync)
[ ] No hay archivos sensibles en dist/ (.env, credentials, etc.)
```

### Contenido

```
[ ] Los proyectos del portfolio se muestran (caché estático o API)
[ ] Las imágenes de los proyectos cargan (no broken images)
[ ] El logo brand-logo-dark.png carga en nav y footer
[ ] La imagen del hero carga (hero-bg.jpg)
[ ] Las imágenes del team cargan (installation, engineering, logistics)
```

### SEO

```
[ ] <title> correcto en las páginas principales
[ ] <meta name="description"> presente
[ ] <meta property="og:image"> apunta a imagen existente
    ⚠️ og-image.jpg actualmente NO existe en public/ (CODE-006)
[ ] Canonical URL correcta si se añadió
[ ] hreflang tags si se añadieron (actualmente ausentes — PROD-005)
```

### Performance

```
[ ] Hero video: preload no es "auto" (actualmente es "auto" — TECH-008)
[ ] Imágenes del portfolio optimizadas
[ ] No se añadieron dependencias pesadas sin justificación
```

### Seguridad

```
[ ] No hay console.log con datos sensibles en el código
    ⚠️ Actualmente api.ts y consultation.ts los tienen (CODE-004)
[ ] No hay secretos hardcodeados en el código
[ ] dangerouslySetInnerHTML solo se usa donde es necesario
[ ] Formularios tienen validación básica en cliente
```

### Deploy

```
[ ] GitHub Secrets: FTP_USERNAME, FTP_PASSWORD, FTP_SERVER están configurados
[ ] La rama main está al día con remote
[ ] No hay conflictos pendientes
[ ] El deploy anterior fue exitoso (revisar GitHub Actions último run)
```

## Procedimiento de deploy manual

El deploy es automático al push a `main`. Para un deploy manual:

1. Ir a GitHub → Actions → `Build and Deploy Astro to FTP`
2. Click en `Run workflow`
3. Seleccionar branch `main`
4. Click `Run workflow`
5. Monitorear el run en tiempo real

## Smoke test post-deploy (ejecutar inmediatamente después)

```
1. https://claesen-verlichting.be/v1/
   [ ] Página carga (código HTTP 200)
   [ ] Hero visible (video o imagen fallback)
   [ ] Nav con logo correcto
   [ ] Idioma: holandés

2. https://claesen-verlichting.be/v1/en/
   [ ] Página carga en inglés
   [ ] No hay texto holandés visible (excepto bugs conocidos: CODE-002, CODE-003)

3. https://claesen-verlichting.be/v1/de/
   [ ] Página carga en alemán

4. https://claesen-verlichting.be/v1/fr/
   [ ] ⚠️ PROD-001: actualmente devuelve 403 — documentar si cambia

5. Portfolio
   [ ] Proyectos se muestran (al menos 5)
   [ ] Filtro "Sport" funciona
   [ ] Modal de proyecto abre

6. Formulario
   [ ] ContactForm visible
   [ ] Campos se pueden completar
   [ ] Submit no da error de CORS visible

7. Footer
   [ ] Links legales funcionan (privacy, terms, cookies)

8. Consola del navegador
   [ ] Sin errores rojos críticos
   [ ] Sin errores de CORS
```

## Procedimiento de rollback

**No existe un script de rollback automatizado.** Proceso manual actual:

### Opción A — Revert del commit
```bash
git revert HEAD
git push origin main
# Esto dispara un nuevo deploy con el código anterior
```

### Opción B — Rollback via workflow_dispatch
Si el revert no es suficiente:
1. Identificar el commit anterior funcional con `git log`
2. Hacer `git reset --hard <commit-hash>`
3. `git push --force-with-lease origin main` (requiere aprobación del usuario)
4. Monitorear el deploy

### Opción C — Deploy de archivos específicos vía SFTP
Para rollback de emergencia de un archivo:
- Subir manualmente el archivo anterior vía cliente SFTP a la ruta `/v1/`
- Requiere credenciales FTP (ver GitHub Secrets)

**Recomendación:** Documentar la decisión de rollback en el ticket Linear correspondiente.

## Checklist de operación del servidor propio

Si el sitio corre en servidor propio (no hosting compartido), verificar adicionalmente:

### Configuración del servidor web (Nginx/Apache)

```
[ ] vhost configurado para servir /v1/ como raíz o alias correcto
[ ] try_files o DirectoryIndex configurado para SPA/SSG:
    Nginx: try_files $uri $uri/ /v1/$uri/index.html =404
    Apache: FallbackResource o RewriteRule equivalente
[ ] error_page 404 apunta a /v1/404.html (página custom de Astro)
[ ] Sin reglas deny que afecten rutas de idioma (/v1/en/, /v1/fr/, /v1/de/)
[ ] Permisos de directorios de idioma son 755 (no 700 ni 750)
[ ] Owner de directorios es el process user del servidor web
```

### Performance del servidor

```
[ ] Compresión Gzip o Brotli activa para text/html, text/css, application/javascript
[ ] Cache-Control: max-age=31536000, immutable para assets con hash (JS/CSS)
[ ] Cache-Control: no-cache para archivos HTML (para que deploy sea inmediato)
[ ] Headers de seguridad básicos: X-Content-Type-Options, X-Frame-Options
```

### TLS y disponibilidad

```
[ ] Certificado TLS válido y sin expirar en < 30 días
[ ] Redirección HTTP → HTTPS activa
[ ] Los 4 idiomas responden 200: /v1/, /v1/en/, /v1/fr/, /v1/de/
[ ] Monitoreo de uptime configurado para los 4 idiomas
```

### Logs del servidor

```
[ ] Acceso a logs de acceso (access.log) para verificar códigos HTTP
[ ] Acceso a logs de error (error.log) para diagnosticar 403/500
[ ] Rotación de logs configurada (logrotate o equivalente)
```

## Issues de producción activos

Ver `docs/ai/known-risks.md` SECCIÓN 1 para los bugs confirmados en producción que afectan la experiencia actual.

Resumen rápido:
- PROD-001: `/v1/fr/` → 403 Forbidden — CLA-113 In Progress (chmod 755 deployed, smoke test pendiente; puede requerir investigación de servidor si persiste)
- PROD-002: Textos NL en versión EN — CLA-114 Backlog
- PROD-003: Página 404 custom no se sirve — pendiente ticket
- PROD-004: Logo partner con nombre vacío — pendiente ticket
- PROD-005: Sin hreflang tags — CLA-117 Backlog
