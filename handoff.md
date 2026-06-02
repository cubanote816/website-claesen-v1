# Handoff — Claesen Verlichting Web v1

Memoria viva del proyecto. Actualizar al abrir y cerrar cada ticket.
Última actualización: 2026-06-02

---

## Estado actual

| Item | Valor |
|------|-------|
| Rama | `main` |
| Estado del repo | Limpio — hotfix pusheado, deploy en curso |
| Último ticket completado | CLA-112 — WEB-DOCS-AI-001 ✅ |
| Ticket activo | CLA-113 — In Progress — deploy en GitHub Actions |
| Fase del proyecto | Finalización y optimización antes de entrega al cliente |

---

## Ticket activo

**CLA-113 — WEB-BUG-FR-403 — Hotfix: /v1/fr/ devuelve 403 Forbidden**
Estado: `In Progress` — commit `c42f1bb` pusheado, deploy automático en curso
Scope: Solo `.github/workflows/deploy.yml` — removido `sftp:chmod-ignore yes`, añadidos `chmod 755` para rutas de idioma
Link: https://linear.app/claesen-verlichting/issue/CLA-113

**Smoke test pendiente:** `GET https://claesen-verlichting.be/v1/fr/` → debe pasar de 403 a 200

---

## Stack rápido

Astro v5 SSG + React v19 + TailwindCSS v4 + Framer Motion v12
Deploy: GitHub Actions → LFTP/SFTP → `claesen-verlichting.be/v1/`
i18n: NL (default), EN, FR, DE
API: `backend.claesen-verlichting.be/v1/website` (caché estático en producción)

Para detalles completos: `docs/ai/context-map.md`

---

## Bugs críticos activos (producción)

| ID | Descripción | Severidad | Ticket |
|----|-------------|-----------|--------|
| PROD-001 | `/v1/fr/` devuelve 403 Forbidden — francés inaccesible | 🔴 CRÍTICO | Pendiente crear |
| PROD-002 | Textos en holandés en versión inglesa (ServicesSection, QuickOfferte) | 🔴 CRÍTICO | Pendiente crear |
| PROD-003 | Página 404 custom no se sirve — servidor devuelve error genérico | ⚠️ MEDIO | Pendiente crear |
| PROD-004 | Logo partner con nombre vacío en marquee de clientes | ⚠️ MEDIO | Pendiente crear |
| PROD-005 | Sin etiquetas hreflang — SEO multiidioma roto | ⚠️ ALTO (SEO) | Pendiente crear |
| CODE-001 | `<video>` tag con HTML inválido en hero | 🔴 CRÍTICO | Pendiente crear |
| CODE-003 | CookieConsent hardcodeado en inglés para todos los idiomas | 🔴 CRÍTICO | Pendiente crear |
| CODE-004 | console.log expone API URL y datos de usuario en producción | ⚠️ ALTO | Pendiente crear |

Lista completa: `docs/ai/known-risks.md`

---

## Backlog ordenado (plan ajustado 2026-06-02)

**Criterio de oro: los 4 idiomas deben responder 200 antes de cualquier mejora visual.**

| # | Ticket | Título | Estado |
|---|--------|--------|--------|
| 1 | **CLA-113** | WEB-BUG-FR-403 — /v1/fr/ 403 (servidor + permisos) | `In Progress` — smoke test pendiente post-deploy |
| 2 | **CLA-114** | WEB-BUG-I18N-001 — Strings hardcodeados NL/EN | Backlog |
| 3 | **CLA-115** | WEB-SEC-LOGS-001 — Logs con env vars y payloads | Backlog |
| 4 | **CLA-116** | WEB-BUG-HERO-001 — HTML inválido video + paths /v1 | Backlog |
| 5 | **CLA-119** | WEB-FORM-001 — QuickOfferte: campos sin name, email falso | Backlog |
| 6 | **CLA-117** | WEB-SEO-001 — hreflang, canonical, OG, metadata | Backlog |
| 7 | **CLA-120** | WEB-SERVER-001 — Config servidor: cache, 404, TLS, monitoreo | Backlog |

---

## Bloqueantes

- **CLA-113 (PROD-001)**: si `chmod 755` no resuelve el 403, escalar a configuración del servidor web (Nginx/Apache vhost, logs, owner). Ver árbol de causas en `docs/ai/known-risks.md` PROD-001.
- **Sin lint/test/typecheck** — no hay barrera automática para errores antes del deploy.

---

## Documentos de referencia

| Para... | Leer... |
|---------|---------|
| Arquitectura y componentes | `docs/ai/context-map.md` |
| Bugs activos y deuda técnica | `docs/ai/known-risks.md` |
| Qué no romper | `docs/ai/website-contracts.md` |
| Comandos disponibles | `docs/ai/commands-runbook.md` |
| Checklist antes de deploy | `docs/ai/production-readiness.md` |
| Protocolo de trabajo | `docs/ai/project-protocol.md` |
| Reglas del repo | `AGENTS.md` |
| Regla de arranque Antigravity | `.agents/rules/00-project-startup.md` |
