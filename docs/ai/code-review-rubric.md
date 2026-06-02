# Rúbrica de Revisión de Código — Claesen Verlichting Web v1

Usar esta rúbrica al revisar cualquier PR o diff antes de aprobar.

## Regla principal

Un diff que rompe cualquiera de los contratos en `website-contracts.md` no puede mergearse sin aprobación explícita del usuario y documentación del riesgo.

## Checklist de revisión

### 1. Scope del ticket

```
[ ] Los cambios corresponden únicamente al ticket activo
[ ] No hay cambios de "oportunidad" no relacionados
[ ] No hay TODOs o código comentado nuevo
[ ] No hay archivos añadidos que no sean necesarios para el ticket
```

### 2. Rutas y navegación

```
[ ] No se eliminaron ni renombraron páginas existentes
[ ] Las rutas en dist/ coinciden con lo esperado (npm run build)
[ ] Los links internos usan import.meta.env.BASE_URL, no /v1/ hardcodeado
[ ] Los anchors (#section) apuntan a IDs que existen en la página
[ ] El language switcher sigue funcionando para los 4 idiomas
```

### 3. i18n

```
[ ] Las claves nuevas existen en nl, en, fr, de
[ ] No hay strings de UI hardcodeados en componentes
[ ] El idioma 'nl' tiene todas las claves (es el fallback)
[ ] No se cambió el valor de defaultLang
[ ] La estructura de objetos en ui.ts no rompió TypeScript
```

### 4. Astro y React

```
[ ] Componentes React tienen la directiva client:* correcta:
    - client:load → interacción inmediata necesaria (nav, cookie)
    - client:visible → interacción cuando se ve (portfolio, forms)
    - client:only → solo cliente, sin SSR (404 page)
[ ] No se añadió client:load donde client:visible es suficiente
[ ] Las props de Astro tienen tipos definidos (interface Props)
[ ] No hay imports de módulos de servidor en componentes React
[ ] No hay window/document en código que se ejecuta en SSR
```

### 5. Imágenes y assets

```
[ ] Las imágenes nuevas están optimizadas (< 500KB)
[ ] Las imágenes en src/assets/ usan <Image> de astro:assets
[ ] Las imágenes en public/ tienen paths correctos con BASE_URL
[ ] No se eliminaron assets referenciados por código existente
[ ] Los alt texts son descriptivos (no vacíos ni genéricos)
```

### 6. API e integración

```
[ ] No se cambió la interfaz Project en types/portfolio.ts
    (si se cambió: verificar compatibilidad con el backend)
[ ] No se cambió el endpoint de consultations
[ ] El caché estático sigue funcionando si PUBLIC_USE_STATIC_CACHE=true
[ ] No hay console.log nuevo con datos de usuario o URLs de API
[ ] No hay secretos hardcodeados
```

### 7. Seguridad

```
[ ] No se añadió dangerouslySetInnerHTML nuevo sin justificación
[ ] Los inputs de formulario tienen validación de tipo correcto
[ ] No se añadieron dependencias con vulnerabilidades conocidas
[ ] Los links externos tienen rel="noopener noreferrer" si abren en nueva pestaña
[ ] No hay eval(), innerHTML asignación directa o document.write()
```

### 8. Performance

```
[ ] No se añadió preload="auto" en resources pesados
[ ] Las animaciones de Framer Motion tienen duración razonable (< 1s)
[ ] No se añadieron polyfills innecesarios
[ ] El bundle no creció desproporcionadamente (nueva dependencia justificada)
```

### 9. Accesibilidad básica

```
[ ] Imágenes informativas tienen alt descriptivo
[ ] Botones tienen texto visible o aria-label
[ ] Inputs de formulario tienen <label> asociado
[ ] El contraste de texto nuevo no es inferior al actual
[ ] No se removió semántica HTML sin reemplazarla
```

### 10. Build y deploy

```
[ ] npm run build pasa sin errores
[ ] No se modificó .github/workflows/deploy.yml sin ticket de infra
[ ] No se modificó astro.config.mjs sin considerar el impacto en rutas
[ ] No se añadieron dependencias a package.json sin actualizar package-lock.json
[ ] No se incluyeron archivos de dist/, .astro/, node_modules/ en el commit
```

## Banderas rojas (requieren discusión antes de merge)

Si el diff contiene cualquiera de estos, detener la revisión y discutir con el usuario:

- Cambio en `astro.config.mjs` → puede romper todas las rutas
- Cambio en `src/i18n/ui.ts` que elimina claves → puede romper componentes
- Cambio en `src/types/portfolio.ts` → puede romper la integración con el backend
- Cambio en `.github/workflows/deploy.yml` → afecta el único pipeline de producción
- Adición de dependencia > 50KB (minificada) → impacto en bundle
- Cualquier referencia a variables de entorno nuevas no documentadas
- Modificación de `public/assets/hero-video.mp4` o `hero-bg.jpg` → son assets pesados

## Formato del feedback de revisión

Al dar feedback, especificar:

```
BLOQUEA: [descripción del problema] — [archivo:línea] — [por qué es un bloqueante]
SUGIERE: [descripción de la mejora] — [no es bloqueante]
APRUEBA: [comentario positivo si corresponde]
```
