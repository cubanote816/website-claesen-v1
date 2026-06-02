# AGENTS.md — Claesen Verlichting Web v1

Reglas del repositorio para todos los agentes de IA.

## Lectura obligatoria al iniciar sesión

En este orden, antes de cualquier acción:

1. `handoff.md` — estado actual, ticket activo, bugs críticos, próximos pasos
2. `docs/ai/README.md` — índice de harnesses y guía por tipo de tarea
3. `docs/ai/context-map.md` — stack, rutas, componentes, pipeline
4. `docs/ai/known-risks.md` — bugs activos y deuda técnica

Si la tarea es técnica, leer además:
- `docs/ai/website-contracts.md` — qué no se puede romper
- `docs/ai/commands-runbook.md` — comandos reales disponibles

## Reglas de trabajo

### Sin ticket → sin edición

No se modifica ningún archivo sin un ticket Linear activo (`In Progress`) en el workspace de Claesen Verlichting.

Esto incluye: código, assets, configuración, scripts y documentación.
La única excepción es la lectura de archivos para diagnóstico.

### Plan antes de editar

Antes de modificar cualquier archivo, presentar al usuario:
- Ticket activo (ID + título)
- Archivos que se van a tocar
- Archivos que NO se van a tocar
- Riesgos identificados

Esperar aprobación explícita antes de proceder.

### Scope estricto

Implementar únicamente lo que el ticket activo describe.
Si se descubre un bug durante el trabajo: documentarlo en `docs/ai/known-risks.md`, no corregirlo en el mismo ticket.

### Verificación antes de commit

```bash
git diff --stat    # confirmar scope
npm run build      # confirmar que el build pasa (si se tocó código)
```

### Formato de commit

```
CLA-XXX: descripción concisa en imperativo

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### Actualizar handoff.md antes del commit

`handoff.md` debe reflejar el estado post-ticket antes del commit.

## Reglas de seguridad

- No leer `.env` completo ni copiar sus valores
- No incluir secretos, tokens ni passwords en ningún archivo
- No modificar `.env` ni `.env.*`
- No hacer commit de archivos en `dist/`, `.astro/`, `node_modules/`
- No hacer `git push --force` a `main` sin aprobación explícita

## Archivos de solo lectura (requieren ticket explícito para editar)

```
src/                    → código de la aplicación
public/                 → assets estáticos
astro.config.mjs        → configuración del framework
package.json            → dependencias
.github/workflows/      → pipeline de CI/CD
```

## Respuesta al arranque (antes de empezar cualquier tarea)

Todo agente debe responder al iniciar con:

```
Rama actual: [rama]
Ticket activo: [ID — título] o "ninguno"
Bugs críticos activos: [top 3 de handoff.md]
¿Puedo editar?: [sí, si hay ticket activo] / [no, sin ticket no hay edición]
Próximo paso: [según handoff.md]
```
