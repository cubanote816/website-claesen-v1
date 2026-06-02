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

## Issues de producción activos

Ver `docs/ai/known-risks.md` SECCIÓN 1 para los bugs confirmados en producción que afectan la experiencia actual.

Resumen rápido:
- PROD-001: `/v1/fr/` → 403 Forbidden
- PROD-002: Textos NL en versión EN
- PROD-003: Página 404 custom no se sirve
- PROD-004: Logo partner con nombre vacío
- PROD-005: Sin hreflang tags
