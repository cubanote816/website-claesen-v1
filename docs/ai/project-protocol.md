# Protocolo de Trabajo — Claesen Verlichting Web

## Regla fundamental

**Sin ticket Linear activo → no se edita ningún archivo.**

Esto incluye: código, assets, documentación, configuración y scripts.
La única excepción es leer archivos para diagnóstico.

## Flujo obligatorio por ticket

### 1. Verificar ticket

Antes de empezar, confirmar en Linear:
- El ticket existe y está asignado
- El ticket está en estado `In Progress`
- El ticket corresponde a este repositorio (`claesen-verlichting` web, no backend ni otro proyecto)

Si el ticket no existe → crearlo antes de editar.
Si hay duda de scope → preguntar, no asumir.

### 2. Exploración en solo lectura

Antes de editar, leer:
- `handoff.md` — estado actual
- `docs/ai/context-map.md` — mapa del proyecto
- `docs/ai/known-risks.md` — riesgos y bugs activos
- Archivos relevantes para la tarea (nunca `.env`, nunca `node_modules`, nunca `dist`)

### 3. Presentar plan

Presentar al usuario antes de editar:
- Ticket Linear activo (ID + título)
- Rama actual
- Archivos que se van a modificar
- Archivos que se van a crear
- Archivos que NO se tocarán
- Riesgos identificados
- Cómo se verificará el resultado

Esperar aprobación explícita (`GO`, `sí`, `adelante`, `procede`).
Una respuesta ambigua no es GO.

### 4. Implementar solo el ticket activo

- Implementar únicamente lo que el ticket describe
- No corregir bugs de oportunidad no incluidos en el ticket
- No refactorizar código no relacionado
- No limpiar archivos no pedidos
- Si se descubre un bug nuevo: documentarlo en `known-risks.md` y crear ticket separado

### 5. Verificar antes de commit

Siempre ejecutar antes de commit:
```bash
git diff --stat          # confirmar que no se tocó código fuera de scope
npm run build            # build limpio (si el ticket toca código)
```

Si el build falla → no hacer commit, diagnosticar y corregir primero.

### 6. Actualizar memoria

Antes del commit, actualizar:
- `handoff.md` — nuevo estado, ticket completado, próximos pasos
- `docs/ai/known-risks.md` — si se resolvió un riesgo documentado

### 7. Commit dedicado

Formato obligatorio:
```
CLA-XXX: descripción concisa en imperativo

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Un commit por ticket. No mezclar cambios de distintos tickets.
No incluir `.env`, `dist/`, `.astro/`, `node_modules/`.

### 8. GO técnico antes de Done

Antes de mover el ticket a `Done` en Linear:
- Confirmar que el build pasa
- Confirmar que `git diff --stat` está limpio respecto al scope
- Confirmar que `handoff.md` está actualizado
- Reportar al usuario: ID Linear, archivos creados/modificados, hash del commit

Esperar confirmación del usuario antes de marcar Done.

## Qué no hacer nunca

- Leer `.env` completo ni copiar valores de secretos
- Modificar `.env` o `.env.*`
- Incluir tokens, passwords o API keys en documentación
- Hacer commit con `--no-verify`
- Hacer `git push --force` a `main`
- Mezclar cambios de documentación con cambios de código en el mismo commit
- Editar archivos fuera del scope del ticket activo
- Marcar Done sin GO técnico del usuario

## Archivos de solo lectura (nunca editar sin ticket explícito)

```
src/             → código de la aplicación
public/          → assets estáticos
astro.config.mjs → configuración del framework
package.json     → dependencias
.github/workflows/deploy.yml → pipeline de deploy
```
