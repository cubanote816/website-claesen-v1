# AI Harnesses — Claesen Verlichting Web v1

Documentación operativa para agentes de IA. Lee este archivo primero en cada sesión.

## Regla de arranque

Antes de tocar cualquier archivo:

1. Lee `handoff.md` (raíz) — estado actual, ticket activo, bloqueantes
2. Lee este `README.md` — índice y orientación
3. Lee `AGENTS.md` (raíz) — reglas del repositorio
4. Lee `.agents/rules/00-project-startup.md` — protocolo Antigravity
5. Lee el documento específico para tu tarea (ver tabla abajo)

## Índice de harnesses

| Archivo | Para qué sirve | Cuándo leerlo |
|---------|---------------|---------------|
| `project-protocol.md` | Reglas de trabajo: ticket, plan, GO, commit | Siempre, antes de editar |
| `context-map.md` | Stack, rutas, componentes, pipeline completo | Al iniciar tarea técnica |
| `website-contracts.md` | Qué no se puede romper en este repo | Antes de cambiar cualquier archivo |
| `testing-checklists.md` | Comandos de verificación y checks manuales | Antes de cerrar ticket |
| `production-readiness.md` | Checklist de deploy y smoke test | Antes de merge a main |
| `code-review-rubric.md` | Criterios de revisión de código | Al revisar PR o diff |
| `known-risks.md` | Bugs activos, deuda técnica, riesgos | Al diagnosticar o planificar |
| `prompt-templates.md` | Prompts reutilizables por tipo de tarea | Al preparar contexto |
| `commands-runbook.md` | Comandos npm y GitHub Actions reales | Al ejecutar builds/deploys |
| `handoff-strategy.md` | Cómo mantener `handoff.md` actualizado | Al cerrar ticket o hacer handoff |

## Guía rápida: ¿qué leer según mi tarea?

| Tarea | Documentos a leer |
|-------|------------------|
| Corregir bug de i18n | `context-map.md` → `known-risks.md` → `website-contracts.md` |
| Corregir bug de producción | `known-risks.md` → `production-readiness.md` → `commands-runbook.md` |
| Añadir nueva sección | `context-map.md` → `website-contracts.md` → `testing-checklists.md` |
| Deploy a producción | `production-readiness.md` → `commands-runbook.md` |
| Revisar PR / diff | `code-review-rubric.md` → `website-contracts.md` |
| SEO o performance | `known-risks.md` → `website-contracts.md` |
| Investigar bug | `known-risks.md` → `context-map.md` |

## Relación entre archivos raíz y docs/ai/

```
handoff.md          → Memoria viva: estado actual del proyecto
AGENTS.md           → Reglas portables del repositorio (para cualquier agente)
.agents/rules/      → Reglas persistentes de Antigravity
docs/ai/            → Harnesses detallados por dominio
```

`handoff.md` es la única fuente de verdad sobre el estado actual.
Los archivos `docs/ai/` son conocimiento estructural que cambia poco.
Cuando entren en conflicto, `handoff.md` prevalece.

## Proyecto en una línea

Sitio web corporativo para **Claesen Verlichting** (especialista belga en iluminación exterior desde 1936).
Stack: Astro v5 SSG + React v19 + TailwindCSS v4. Deploy LFTP/SFTP en `/v1`.
