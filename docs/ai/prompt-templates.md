# Prompt Templates — Claesen Verlichting Web v1

Prompts reutilizables por tipo de tarea. Copiar y adaptar según el ticket activo.

---

## 1. Iniciar contexto al comenzar sesión

```
Lee en este orden:
1. handoff.md — estado actual del proyecto
2. docs/ai/README.md — índice de harnesses
3. docs/ai/context-map.md — stack y arquitectura
4. docs/ai/known-risks.md — bugs activos

El ticket activo es: [CLA-XXX — descripción]
La tarea es: [descripción de la tarea]

Antes de hacer nada, respóndeme con:
- Rama actual
- Ticket activo
- Archivos que vas a tocar
- Archivos que NO vas a tocar
- Riesgos que identificas
- Si necesitas más contexto antes de empezar
```

---

## 2. Preparar y ejecutar un ticket

```
Ticket activo: [CLA-XXX — título]

Tarea: [descripción específica de lo que hay que hacer]

Antes de editar cualquier archivo:
1. Confirma que entendiste el scope exacto del ticket
2. Lista los archivos que vas a modificar y los que no
3. Identifica qué contratos de website-contracts.md se aplican
4. Muéstrame el plan y espera mi GO explícito

Restricciones:
- Solo cambios dentro del scope del ticket
- No corregir bugs de oportunidad no incluidos
- build debe pasar antes del commit
- handoff.md debe actualizarse antes del commit
```

---

## 3. Corregir un bug de i18n

```
Bug de i18n a corregir: [descripción del bug]
Archivos afectados: [lista de archivos]
Idiomas afectados: [EN/FR/DE/todos]

Proceso:
1. Localiza el string hardcodeado en el componente
2. Añade la clave en src/i18n/ui.ts para los 4 idiomas: nl, en, fr, de
3. Reemplaza el string hardcodeado con t['nueva.clave']
4. npm run build para verificar
5. Verifica en preview que /v1/en/ muestra el texto en inglés

No inventes traducciones — usa texto descriptivo como placeholder
si no tienes la traducción exacta y márcalo con un comentario TODO.
```

---

## 4. Revisar un PR o diff

```
Revisa el siguiente diff usando docs/ai/code-review-rubric.md

Presta especial atención a:
1. ¿Hay strings hardcodeados que deberían estar en i18n?
2. ¿Todos los paths de assets usan BASE_URL?
3. ¿Hay console.log nuevos con datos sensibles?
4. ¿Los cambios respetan los contratos de website-contracts.md?
5. ¿El build pasaría?

Formato de respuesta:
BLOQUEA: [problema] — [archivo:línea] — [razón]
SUGIERE: [mejora no bloqueante]
APRUEBA: [si no hay bloqueantes]

Diff a revisar:
[pegar el diff aquí]
```

---

## 5. Preparar deploy a producción

```
Voy a hacer deploy de los cambios del ticket [CLA-XXX].
Antes de hacer push a main, ejecuta el checklist de docs/ai/production-readiness.md

Específicamente verifica:
1. npm run build pasa sin errores
2. git diff --stat solo muestra archivos del scope del ticket
3. No hay secretos ni valores de .env en los cambios
4. handoff.md está actualizado con el estado post-ticket
5. Los smoke tests de producción están listos para ejecutar

Si algún punto falla, detente y reporta antes de continuar.
```

---

## 6. Investigar un bug

```
Bug a investigar: [descripción del síntoma]
Visto en: [URL o contexto donde aparece]
Reproducible: [sí/no/a veces]

Para investigar:
1. Lee docs/ai/known-risks.md — ¿está ya documentado?
2. Lee docs/ai/context-map.md — ¿qué componente/servicio es responsable?
3. Busca en el código el componente más probable
4. NO hagas cambios todavía — solo diagnóstica

Respóndeme con:
- ¿Está ya en known-risks.md? ¿Con qué ID?
- Archivo(s) y línea(s) donde está el problema
- Causa raíz probable
- Impacto (qué usuarios/idiomas/funcionalidades afecta)
- Solución propuesta (sin implementar)
- ¿Necesita un ticket nuevo o entra en uno existente?
```

---

## 7. Cambio de contenido (texto, imagen)

```
Cambio de contenido solicitado:
- Texto actual: "[texto actual]"
- Texto nuevo: "[texto nuevo]"
- Idiomas afectados: [nl/en/fr/de/todos]
- Sección: [nombre de sección o componente]

Proceso:
1. Localiza la clave en src/i18n/ui.ts
2. Si el texto está hardcodeado → primero añade la clave al sistema i18n
3. Actualiza los valores en los idiomas correspondientes
4. Si el cambio afecta al texto visible en otros idiomas → actualiza todos
5. Si es una imagen: verifica que el asset existe en public/assets/
6. npm run build + preview para confirmar
```

---

## 8. Revisar SEO o performance

```
Revisión de [SEO/performance] para el ticket [CLA-XXX]

Para SEO, verificar en src/layouts/Layout.astro:
- <title> → correcto y localizado?
- <meta name="description"> → localizado y descriptivo?
- <meta property="og:image"> → apunta a imagen existente?
- <link rel="canonical"> → existe y es correcto?
- <link rel="alternate" hreflang> → existen para los 4 idiomas?

Para performance, verificar:
- preload="auto" en resources pesados (actualmente en hero video — TECH-008)
- Tamaño de imágenes nuevas
- Impacto de dependencias nuevas en bundle

Documenta los hallazgos sin implementar. Si encuentras issues nuevos,
añádelos a docs/ai/known-risks.md con el formato correcto.
```

---

## 9. Cerrar un ticket

```
El ticket [CLA-XXX] está completo. Antes de marcarlo Done en Linear:

1. Confirma: npm run build pasa
2. Confirma: git diff --stat solo muestra archivos del scope
3. Confirma: handoff.md está actualizado con:
   - Ticket completado
   - Nuevos bugs resueltos (si aplica)
   - Próximos pasos actualizados
4. Confirma: si se resolvió un riesgo de known-risks.md, está marcado como resuelto
5. Haz el commit con el formato: "CLA-XXX: descripción"

Después del commit y push, dame:
- Hash del commit
- Archivos modificados (git diff --stat resultado)
- ¿Algún pendiente para el siguiente ticket?

Solo entonces marcaré el ticket como Done.
```

---

## 10. Diagnóstico del 403 en /v1/fr/

```
Bug PROD-001: /v1/fr/ devuelve 403 Forbidden en producción.

Contexto:
- La ruta existe en el build (dist/fr/index.html se genera)
- El deploy usa LFTP con sftp:chmod-ignore yes
- El mirror -R no tiene --chmod explícito
- Directorios con permisos incorrectos pueden dar 403

Para investigar opciones de fix (SIN IMPLEMENTAR todavía):
1. ¿Se puede añadir chmod explícito en el comando LFTP?
2. ¿Se puede hacer mkdir con permisos correctos antes del mirror?
3. ¿Se puede verificar los permisos actuales del directorio fr/ en el servidor?

Responde con 3 opciones de fix ordenadas de menor a mayor riesgo,
con el impacto en el workflow de deploy y los archivos que habría que cambiar.
El ticket para implementar la solución es: [a crear]
```
