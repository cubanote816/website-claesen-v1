# 00-project-startup — Regla de Arranque Antigravity
# Claesen Verlichting Web v1

Esta regla se ejecuta al inicio de CADA sesión, sin excepción.

## Paso 1 — Leer memoria

Lee estos archivos en orden antes de cualquier acción:

1. `handoff.md` (raíz)
2. `docs/ai/README.md`
3. `AGENTS.md`
4. El harness específico para la tarea (ver docs/ai/README.md → tabla de guía rápida)

No asumas nada sobre el estado del proyecto sin leer handoff.md primero.

## Paso 2 — Responder con el estado del sistema

Después de leer, responde siempre con este bloque antes de cualquier otra cosa:

```
## Estado del sistema — [fecha ISO]

Rama: [rama actual]
Ticket activo: [CLA-XXX — título] | [ninguno]
Área de trabajo: [módulo/sección relevante para la tarea]

Bugs críticos activos:
- [PROD-001 o el top 3 de handoff.md]
- [...]
- [...]

¿Puedo editar?: [SÍ — ticket CLA-XXX activo] | [NO — sin ticket activo]
Próximo paso: [según handoff.md o la tarea solicitada]
```

## Paso 3 — Protocolo según el tipo de tarea

### Si es una tarea de código o configuración:
1. Lee `docs/ai/context-map.md` para entender el componente afectado
2. Lee `docs/ai/website-contracts.md` para saber qué no romper
3. Lee `docs/ai/known-risks.md` para no reparar sobre bugs conocidos
4. Presenta el plan y espera GO explícito

### Si es una tarea de deploy:
1. Lee `docs/ai/production-readiness.md`
2. Lee `docs/ai/commands-runbook.md`
3. Ejecuta el checklist antes de cualquier push a main

### Si es una tarea de revisión o diagnóstico:
1. Lee `docs/ai/code-review-rubric.md`
2. Lee `docs/ai/known-risks.md`
3. Diagnostica sin editar

### Si es una tarea de documentación:
1. Lee `docs/ai/handoff-strategy.md`
2. Actualiza handoff.md al cerrar

## Reglas invariables

**No editar sin ticket Linear activo.**
Si el usuario pide un cambio sin ticket: crear el ticket primero, luego implementar.

**No mezclar scope.**
Un ticket = un commit. Cambios de oportunidad van a tickets separados.

**Build debe pasar antes del commit.**
Si `npm run build` falla, no hay commit.

**Nunca leer ni copiar valores de .env.**
Solo se leen nombres de variables, nunca sus valores.

**handoff.md es la memoria viva.**
Si handoff.md contradice tu memoria de sesiones anteriores, handoff.md tiene razón.

## Contexto del proyecto (referencia rápida)

```
Proyecto: Claesen Verlichting — sitio web corporativo (iluminación exterior, Bélgica)
Framework: Astro v5 SSG + React v19 + TailwindCSS v4
Idiomas: NL (default), EN, FR, DE
Base path: /v1
Deploy: GitHub Actions → LFTP/SFTP → claesen-verlichting.be/v1/
API: backend.claesen-verlichting.be/v1/website (caché estático en prod)
Linear: workspace claesen-verlichting, equipo "Claesen verlichting"
```

## Señales de alarma (detente y reporta)

Si encuentras alguno de estos durante tu trabajo, detente y reporta antes de continuar:

- Un archivo `.env` con secretos visibles en un diff
- Un commit que incluye `dist/`, `node_modules/` o `.astro/`
- Un push a `main` con `--force`
- Un cambio en `astro.config.mjs` que altere `base` o `i18n.defaultLocale`
- Un `dangerouslySetInnerHTML` nuevo sin sanitización
- Cualquier hardcodeo de una URL del backend en código de producción
