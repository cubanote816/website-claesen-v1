# Estrategia de Handoff — Claesen Verlichting Web v1

## Principio fundamental

`handoff.md` en la raíz del repositorio es la **única memoria viva global** del proyecto.
Es lo primero que lee cualquier agente al iniciar sesión.
Es lo último que se actualiza antes de cerrar un ticket.

## Estructura de handoff.md

`handoff.md` debe siempre contener:

1. **Estado actual** — rama, último ticket, último commit
2. **Ticket activo** — ID Linear, título, estado, link
3. **Stack** — referencia rápida (no el detalle, ese está en context-map.md)
4. **Bugs activos críticos** — los top 5 sin resolver con ID de known-risks.md
5. **Próximos pasos** — qué viene después del ticket activo
6. **Bloqueantes** — qué impide avanzar (si hay)
7. **Documentos de referencia** — links a los harnesses relevantes

## Cuándo actualizar handoff.md

**Obligatorio antes de cerrar cualquier ticket:**
- Actualizar "Último ticket completado"
- Actualizar "Ticket activo" (al nuevo o a "ninguno")
- Actualizar "Bugs activos" si se resolvió o descubrió alguno
- Actualizar "Próximos pasos"
- Actualizar "Bloqueantes" si cambiaron

**Obligatorio al descubrir un bug nuevo durante trabajo:**
- Añadir el bug a `docs/ai/known-risks.md` con su ID
- Referenciar el ID en handoff.md si es crítico

**Opcional pero recomendado:**
- Actualizar al iniciar un ticket nuevo (cambiar estado a In Progress)
- Actualizar si cambia algo estructural del proyecto (nueva dependencia, nueva ruta)

## Cuándo NO crear un nuevo handoff

No se crean `handoff.md` por rama. Solo existe uno en la raíz.
No se crean handoffs en `docs/` — el único es en la raíz.
No se crea un handoff nuevo para cada sesión — se actualiza el mismo.

## Resolución de conflictos entre documentos

Si `handoff.md` dice algo distinto a `docs/ai/`:

- **`handoff.md` prevalece** para el estado actual (ticket, bugs activos, próximos pasos)
- **`docs/ai/context-map.md` prevalece** para la arquitectura y el stack
- **`docs/ai/known-risks.md` prevalece** para la lista completa de riesgos
- **`docs/ai/website-contracts.md` prevalece** para las reglas invariables

Si hay contradicción real → actualizar el documento más antiguo para que coincida.

## Cuándo actualizar docs/ai/ (los harnesses)

Los harnesses cambian poco. Actualizar cuando:

| Harness | Actualizar cuando... |
|---------|---------------------|
| `context-map.md` | Cambia el stack, rutas, componentes principales, pipeline |
| `known-risks.md` | Se descubre un bug nuevo, se resuelve uno existente, cambia severidad |
| `website-contracts.md` | Se añade una restricción nueva, se relaja una existente con justificación |
| `testing-checklists.md` | Se añaden comandos, se descubren checks necesarios |
| `production-readiness.md` | Cambia el procedimiento de deploy, rollback o smoke test |
| `code-review-rubric.md` | Se aprende algo nuevo que debe revisarse siempre |
| `commands-runbook.md` | Se añaden/eliminan scripts de npm, cambia el workflow de CI |
| `prompt-templates.md` | Se descubren mejores formas de abordar tareas recurrentes |

## Longitud y formato de handoff.md

- Máximo ~100 líneas — debe leerse en 2 minutos
- No repetir info detallada que ya está en docs/ai/ — solo referenciar
- Usar estado explícito: `✅ resuelto`, `⚠️ activo`, `🔴 bloqueante`
- Fechas en ISO-8601: `2026-06-02`

## Handoff al finalizar el proyecto

Cuando el sitio esté listo para entrega final al cliente:

1. Actualizar `handoff.md` con estado "Entregado"
2. Documentar en `known-risks.md` los bugs que se dejan pendientes con justificación
3. Asegurarse de que `production-readiness.md` refleja el estado real del deploy
4. Crear un ticket de cierre en Linear: `WEB-HANDOFF-FINAL`
5. Commit: `CLA-XXX: finalize handoff documentation for client delivery`
