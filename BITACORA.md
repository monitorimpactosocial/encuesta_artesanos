# Bitacora operativa - Encuesta Artesanos Isla Hermosa

## 2026-05-05 - Revision inicial de continuidad

### Contexto revisado
- Carpeta de trabajo: `ENCUESTA_ARTESANOS_ISLA_HERMOSA/encuesta_artesanos_app`.
- Repositorio local: rama `main`, limpio, sincronizado con `origin/main`.
- Ultimo commit: `1bf1d2f feat: super version - visible_if fix, photo compression, admin setup btn, full dashboard, all input types`.
- Remoto configurado: `https://github.com/monitorimpactosocial/encuesta_artesanos.git`.
- Documentacion existente antes de esta bitacora: `README.md` y `MANUAL_OPERATIVO_ARTESANOS.md`.
- No existia una bitacora formal en el paquete; se crea este archivo para continuidad operativa.

### Estado funcional observado
- Backend Apps Script preparado con archivos `Config.gs`, `Setup.gs`, `Auth.gs`, `Survey.gs`, `Admin.gs`, `Utils.gs`, `Seed.gs`, `App.gs`, `AppIndex.html`, `Client.html` y `Styles.html`.
- `Config.gs` contiene IDs reales por defecto para Google Sheet backend y carpeta Drive de fotos.
- `Setup.gs` incluye `runSetup()`, `setupBackend()`, `fixEverything()`, `syncQuestionnaireMetadata()` y reconstruccion de bases analiticas.
- `Auth.gs` siembra y hashea usuarios iniciales: `admin/123`, `diego/456`, `user/123`; deben cambiarse tras el despliegue.
- `Survey.gs` cubre esquema por metadata, GPS, fotos, derivados, flags de calidad, directorio y envio de respuestas.
- `Admin.gs` cubre dashboard, filtros, listado de respuestas, exportacion CSV y reconstruccion de `BASE_ANALITICA` y `RESPUESTAS_LONG`.
- `index.html` es una SPA standalone para GitHub Pages con `GAS_EXEC_URL` apuntando a una Web App real:
  `https://script.google.com/macros/s/AKfycbzXOgVnbp9-9b-_gWrUOc825jnHSXHugagq74tez8IOCI0_2qmPirR0dEQIBqDnO0IP/exec`.

### Hallazgos relevantes
- La raiz `ENCUESTA_ARTESANOS_ISLA_HERMOSA` no es repo Git; el repo esta dentro de `encuesta_artesanos_app`.
- No hay `.clasp.json` local, solo `.clasp.example.json` con placeholder `PEGAR_SCRIPT_ID_DEL_PROYECTO_APPS_SCRIPT`; por tanto no se pudo confirmar desde el paquete local cual es el proyecto Apps Script vinculado.
- El ultimo commit `1bf1d2f` modifico solamente `index.html`, no `Client.html`.
- Apps Script sirve `AppIndex.html`, que a su vez incluye `Client.html`; por lo tanto las mejoras de la super version pueden estar disponibles en GitHub Pages/standalone, pero no necesariamente en la Web App nativa de Apps Script si `Client.html` no fue actualizado o desplegado con los mismos cambios.
- El panel admin de `index.html` muestra una accion de "Inicializar / Reparar sistema", pero internamente llama a `syncQuestionnaireMetadata()`, no a `runSetup()` ni `setupBackend()`. Eso sirve si las hojas base y usuarios ya existen; no reemplaza una primera inicializacion completa desde el editor Apps Script.
- Hay mojibake visible en varios textos versionados (`AplicaciÃ³n`, `ContraseÃ±a`, etc.). Debe corregirse antes de usar la interfaz en campo o compartir documentacion.

### Riesgos / pendientes de verificacion
- Confirmar si la Web App real asociada al `GAS_EXEC_URL` tiene desplegados los archivos `.gs` y `.html` actuales.
- Confirmar si `runSetup()` ya fue ejecutado contra el Sheet `1bNA0oHXbQEU0WkVqsa-iKefXHRdWwQNiE7MvEazPq40`.
- Probar login real con `admin/123` o `diego/456` solo en entorno controlado, y luego forzar cambio de credenciales.
- Probar envio real de una encuesta con consentimiento, GPS y una foto comprimida.
- Probar dashboard, listado de respuestas, exportacion CSV y reconstruccion analitica luego de cargar al menos una respuesta de prueba.
- Decidir si la version principal sera:
  1. GitHub Pages standalone consumiendo `doPost` por fetch a `GAS_EXEC_URL`, o
  2. Apps Script nativo con `google.script.run`.
- Si se mantiene Apps Script nativo, hay que portar la super version de `index.html` a `Client.html`/`Styles.html` o asegurar que `Client.html` tenga paridad funcional.

### Proximos pasos recomendados
1. Corregir mojibake en documentacion e interfaz (`README.md`, `MANUAL_OPERATIVO_ARTESANOS.md`, `Config.gs`, `App.gs`, `Client.html`, `index.html` y textos semilla).
2. Definir el canal operativo principal: GitHub Pages standalone o Web App nativa de Apps Script.
3. Si se usara Apps Script nativo, sincronizar `Client.html` con las mejoras ya aplicadas en `index.html`.
4. Crear `.clasp.json` con el `scriptId` real o confirmar manualmente el proyecto Apps Script abierto desde el Sheet.
5. Ejecutar `runSetup()` desde Apps Script para primera inicializacion completa, o `fixEverything()` si ya existen hojas pero se requiere reparacion.
6. Desplegar nueva version de Apps Script y registrar en esta bitacora: URL `/exec`, deployment ID, version y fecha.
7. Hacer QA end-to-end: bootstrap, login, formulario, visibilidad condicional, roster de hogar, GPS, foto, envio, auditoria, dashboard, respuestas, CSV y bases analiticas.
8. Cambiar credenciales iniciales y registrar solo el hecho del cambio, nunca las contrasenas nuevas.

### Resultado de esta pasada
- Bitacora creada.
- Estado local y repo contrastados.
- Proximos pasos documentados para retomar sin perder contexto.

## 2026-05-05 - Incidente: app web no admite login

### Reporte recibido
- El usuario informa que la app web no funciona y todavia no admite login.

### Hipotesis iniciales a verificar
- Diferencia entre `index.html` standalone y `Client.html` servido por Apps Script.
- Posible fallo de comunicacion del wrapper GitHub Pages con `doPost` de Apps Script.
- Posible backend no inicializado: hoja `USUARIOS` ausente, vacia o no hasheada.
- Posible Web App desplegada con version anterior a los cambios locales.
- Posible problema de serializacion/respuesta del login entre Apps Script y cliente.

### Diagnostico aplicado
- Se confirmo que `index.html` usa `fetch()` contra `GAS_EXEC_URL`; ese camino es fragil para login desde GitHub Pages porque depende de comunicacion cross-origin con Apps Script.
- Se confirmo que la Web App nativa de Apps Script usa `Client.html` con `google.script.run`, que es el canal mas confiable para login y sesiones.
- Se confirmo que `login()` solo ejecutaba `hashSeedUsers_()`; si la hoja `USUARIOS` estaba vacia o no inicializada, no creaba los usuarios iniciales.

### Correcciones locales realizadas
- `Auth.gs`: se agrego `ensureAuthReady_()` para asegurar cabeceras de `USUARIOS` y `AUDITORIA`, sembrar usuarios iniciales si no existen y hashear temporales antes de validar login.
- `Auth.gs`: `login()` ahora llama a `ensureAuthReady_()` antes de buscar el usuario.
- `index.html`: cuando se sirve desde GitHub Pages (`*.github.io`), ahora muestra la Web App nativa de Apps Script embebida en un iframe y ofrece boton para abrirla en pestana nueva. Esto evita depender de `fetch()` cross-origin para login.

### Verificacion local
- `index.html`: validacion sintactica del JavaScript embebido con `node --check` por stdin, sin errores.
- `Auth.gs`: validacion sintactica por stdin con `node --check`, sin errores.

### Pendiente para liberar
- Subir cambios al repositorio y desplegar/actualizar Apps Script con `Auth.gs`.
- Confirmar que la URL de Web App usada por `GAS_EXEC_URL` sigue vigente.
- Probar login real despues del deploy con usuarios seed controlados y cambiar credenciales iniciales.
