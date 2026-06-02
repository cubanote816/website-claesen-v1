# Handoff — Claesen Verlichting Web v1

Memoria viva del proyecto. Actualizar al abrir y cerrar cada ticket.
Última actualización: 2026-06-02

---

## Estado actual

| Item | Valor |
|------|-------|
| Rama | `main` |
| Estado del repo | Limpio (sin cambios pendientes antes de este ticket) |
| Último ticket completado | CLA-112 — WEB-DOCS-AI-001 (este mismo) |
| Ticket activo | CLA-112 — En progreso |
| Fase del proyecto | Finalización y optimización antes de entrega al cliente |

---

## Ticket activo

**CLA-112 — WEB-DOCS-AI-001 — Crear AI harnesses del proyecto web**
Estado: `In Progress`
Scope: Solo documentación — `docs/ai/`, `handoff.md`, `AGENTS.md`, `.agents/rules/`
Link: https://linear.app/claesen-verlichting/issue/CLA-112

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

## Próximos pasos sugeridos

1. **Cerrar CLA-112** — commit de los harnesses que se están creando ahora
2. **WEB-BUG-I18N-001** — Corregir strings hardcodeados en NL (PROD-002, CODE-003): ServicesSection, QuickOfferte, CookieConsent, SpotlightError, ProjectGalleryModal
3. **WEB-BUG-VIDEO-001** — Corregir `<video>` tag malformado + preload="auto" (CODE-001, TECH-008)
4. **WEB-BUG-FR-403** — Investigar y corregir 403 en /v1/fr/ (PROD-001)
5. **WEB-SEO-001** — Añadir hreflang, canonical, meta description localizada, og-image (PROD-005, CODE-006, CODE-007)
6. **WEB-BUG-CONSOLE** — Eliminar console.log de producción (CODE-004)

---

## Bloqueantes

- **PROD-001 (403 FR)** requiere diagnóstico de permisos en el servidor — puede necesitar acceso SSH directo al hosting.
- **Sin lint/test/typecheck** — no hay barrera automática para errores antes del deploy. Añadir `npm run typecheck` sería valioso.

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
