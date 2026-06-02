# Runbook de Comandos — Claesen Verlichting Web v1

## Comandos npm disponibles

Verificados en `package.json`. Solo ejecutar comandos que existen aquí.

### Desarrollo

```bash
# Servidor local en http://localhost:4321/v1/
npm run dev

# Build de producción → genera dist/
npm run build

# Preview del build generado → http://localhost:4321/v1/
npm run preview
```

### Sincronización de contenido (backend → local)

```bash
# Sync genérico (detecta modo por contexto)
npm run sync

# Sync en modo desarrollo (puede usar endpoints de dev)
npm run sync:dev

# Sync en modo producción (usa PUBLIC_API_URL de .env.production)
npm run sync:prod
```

El sync:
1. Conecta al backend `PUBLIC_API_URL/projects`
2. Descarga metadatos de proyectos
3. Descarga imágenes asociadas
4. Escribe `public/v1-media/projects-static.json`
5. Guarda imágenes en `public/v1-media/`

### Builds completos (sync + build)

```bash
# Build dev: sync:dev + astro build --mode development
npm run build:dev

# Build prod: sync:prod + astro build --mode production
npm run build:prod
```

### Utilidades de diagnóstico

```bash
# Prueba la conexión con la API remota
node scripts/test-api.js

# Prueba la conexión con una API local
node scripts/test-local-api.js
```

## Comandos de verificación (usar antes de commit)

```bash
# Ver qué archivos cambiaron
git status

# Ver el diff completo de cambios
git diff

# Ver solo el resumen de archivos cambiados (para verificar scope)
git diff --stat

# Build limpio para verificar que no hay errores
npm run build

# Ver las últimas líneas del log de build (si falla)
npm run build 2>&1 | tail -50
```

## Flujo de trabajo local completo

```bash
# 1. Asegurarse de estar en main y al día
git checkout main
git pull origin main

# 2. Crear rama para el ticket (recomendado)
git checkout -b cubanote816/cla-XXX-descripcion

# 3. Hacer cambios...

# 4. Verificar build
npm run build

# 5. Revisar scope del diff
git diff --stat

# 6. Staging selectivo (no usar git add -A)
git add src/components/sections/ServicesSection.astro
git add src/i18n/ui.ts
# etc.

# 7. Commit con formato correcto
git commit -m "$(cat <<'EOF'
CLA-XXX: descripción concisa en imperativo

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"

# 8. Push
git push origin cla-XXX-descripcion
```

## GitHub Actions — Pipeline de deploy

**Archivo:** `.github/workflows/deploy.yml`

### Triggers

| Trigger | Cuándo se activa |
|---------|-----------------|
| `push` a `main` | Automático en cada push |
| `repository_dispatch: backend_update` | El backend notifica que hay contenido nuevo |
| `workflow_dispatch` | Manual desde GitHub UI |

### Pasos del pipeline

```
1. Checkout Code          → git checkout
2. Setup Node.js 20       → con caché de npm
3. Install dependencies   → npm ci
4. Sync Backend Content   → npm run sync:prod
5. Build Project          → npm run build:prod + cp v1-media a dist
6. Deploy via LFTP        → mirror a sftp://$FTP_HOST:2222/v1
```

### Ejecutar deploy manual

```
GitHub → repositorio → Actions
→ "Build and Deploy Astro to FTP"
→ "Run workflow" (esquina superior derecha)
→ Branch: main
→ "Run workflow"
```

### Ver logs del deploy

```
GitHub → Actions → último run de "Build and Deploy Astro to FTP"
→ Job: build-and-deploy
→ Expandir paso fallido para ver el error
```

### Secrets de CI requeridos

Configurados en: `GitHub → Settings → Secrets and variables → Actions`

| Secret | Descripción |
|--------|-------------|
| `FTP_USERNAME` | Usuario SFTP del hosting |
| `FTP_PASSWORD` | Contraseña SFTP |
| `FTP_SERVER` | Hostname del servidor |
| `PUBLIC_API_URL` | URL del backend (opcional, tiene fallback) |

## Comandos LFTP del deploy (para referencia)

El deploy hace esencialmente esto:

```bash
lftp -c "
  set sftp:auto-confirm yes;
  set sftp:chmod-ignore yes;
  set sftp:connect-program 'ssh -o StrictHostKeyChecking=no';
  set net:timeout 60;
  set net:max-retries 10;
  open -u $FTP_USER,'$FTP_PASS' sftp://$FTP_HOST:2222;
  mkdir -p /v1/v1-media/ || true;
  put -O /v1/v1-media/ ./dist/v1-media/projects-static.json;
  mirror -R --only-newer --parallel=2 --verbose --no-perms ./dist /v1;
  quit;
"
```

**Notas importantes del deploy:**
- `--only-newer`: solo sube archivos más nuevos que los del servidor
- Sin `--delete`: los archivos eliminados del build NO se borran del servidor
- `sftp:chmod-ignore yes`: los permisos de archivos no se modifican (puede causar PROD-001)
- `--parallel=2`: 2 uploads en paralelo (conservador para evitar errores)

## Comandos que NO existen (no inventar)

```bash
npm run lint        # NO EXISTE
npm run test        # NO EXISTE
npm run typecheck   # NO EXISTE
npm run format      # NO EXISTE
```

Si se necesitan, hay que añadirlos con un ticket dedicado.
