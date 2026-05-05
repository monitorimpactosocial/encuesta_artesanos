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

## 2026-05-05 - Commit y push de correcciones; estado actual del repo

### Acciones ejecutadas
- Verificado que los archivos `.gs` y `Client.html` locales no tienen mojibake (codificacion UTF-8 correcta en los archivos actuales).
- Commiteados y pusheados a `origin/main` los tres archivos pendientes: `Auth.gs`, `index.html`, `BITACORA.md`.
  - Commit: `a8b9d5b fix: login robusto + GitHub Pages con iframe embebido`
  - Push exitoso a `https://github.com/monitorimpactosocial/encuesta_artesanos.git`

### Estado del repo tras esta sesion
- Rama `main` limpia y sincronizada con `origin/main`.
- Ultimo commit: `a8b9d5b`.

### Pendientes criticos restantes (en orden de prioridad)
1. **Deploy Apps Script** — Abrir el proyecto Apps Script vinculado al Sheet `1bNA0oHXbQEU0WkVqsa-iKefXHRdWwQNiE7MvEazPq40`, copiar el contenido actualizado de `Auth.gs` y publicar nueva version de Web App. Registrar el deployment ID y URL `/exec` aqui.
2. **Verificar GAS_EXEC_URL** — Confirmar que `https://script.google.com/macros/s/AKfycbzXOgVnbp9-9b-_gWrUOc825jnHSXHugagq74tez8IOCI0_2qmPirR0dEQIBqDnO0IP/exec` sigue activa y corresponde al proyecto correcto.
3. **Probar login** — Con `admin/123` o `diego/456` en la Web App nativa (no en GitHub Pages standalone).
4. **Cambiar credenciales** — Inmediatamente despues de confirmar el login. Registrar solo el hecho, nunca las nuevas contrasenas.
5. **Parity Client.html / index.html** — Evaluar si se requiere portar mejoras adicionales (visible_if avanzado, compresion de fotos, etc.) a `Client.html`.
6. **QA end-to-end** — Formulario completo, GPS, foto, envio, dashboard, listado, CSV y reconstruccion analitica.

## 2026-05-05 - Deploy completo del nuevo proyecto Apps Script standalone

### Acciones ejecutadas
- Diagnostico del Sheet: CONFIG/USUARIOS/CUESTIONARIO/CATALOGOS vacios; RESPUESTAS con esquema incorrecto (de encuesta colaboradores).
- `clasp` autenticado como `monitorimpactosocial@gmail.com` (token activo en `.clasprc.json`).
- Proyecto Apps Script standalone creado con `clasp create`:
  - Script ID: `13Ex164UGgCecVYV8CrX80-FndLRmr5jjFlulpYt__iysrSePt3qYRAov`
  - URL editor: `https://script.google.com/d/13Ex164UGgCecVYV8CrX80-FndLRmr5jjFlulpYt__iysrSePt3qYRAov/edit`
- `clasp push` exitoso: 13 archivos subidos (todos los `.gs`, `.html` y `appsscript.json`).
- `appsscript.json` actualizado con `webapp` (ANYONE_ANONYMOUS, USER_DEPLOYING) y `executionApi`, timezone America/Asuncion, oauthScopes correctos.
- Web App desplegada via Apps Script API:
  - Deployment ID: `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk`
  - URL `/exec`: `https://script.google.com/macros/s/AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk/exec`
  - Version activa: 3 (version de produccion sin funciones de setup expuestas)
- `index.html`: `GAS_EXEC_URL` actualizado a la nueva URL.
- `.clasp.json` creado con el script ID real (reemplaza `.clasp.example.json`).

### Bloqueante pendiente (una accion manual del usuario)
La Web App muestra "Authorization needed" porque el propietario (`monitorimpactosocial@gmail.com`) aun no ha autorizado los scopes del nuevo proyecto (Sheets, Drive). La Execution API remota fue bloqueada (403) porque el token de clasp no incluye los scopes de ejecucion del script.

**Accion requerida: ejecutar `runSetup()` desde el editor del nuevo proyecto**
1. Abrir: `https://script.google.com/d/13Ex164UGgCecVYV8CrX80-FndLRmr5jjFlulpYt__iysrSePt3qYRAov/edit`
2. Seleccionar funcion `runSetup` en el dropdown.
3. Hacer clic en "Ejecutar".
4. Autorizar los permisos solicitados (Sheets + Drive) cuando aparezca el dialogo.
5. Confirmar que el log muestra `{ ok: true, spreadsheetId: ... }`.

Esto inicializa el Sheet (CONFIG, EDICIONES, USUARIOS, CUESTIONARIO, CATALOGOS, RESPUESTAS correcto) y autoriza el proyecto para que la Web App funcione sin la pantalla de autorizacion.

### Proximos pasos tras la ejecucion de runSetup()
1. Probar login en la Web App: `admin/123` y `diego/456`.
2. Cambiar contrasenas iniciales.
3. QA end-to-end del formulario.

## 2026-05-05 - Correcciones de formulario + Deploy v4

### Problemas reportados y corregidos
1. **Oficio o especialidad principal** — cambiado de `text` a `select` con catalogo `oficio_artesanal` (16 especialidades + Otro). Se agrego campo `oficio_principal_otro` visible solo cuando se selecciona "Otro".
2. **Materia prima principal → Otro** — agregado campo `materia_prima_principal_otro` visible solo cuando `materia_prima_principal = Otro`.
3. **GPS no funciona** — el iframe de GitHub Pages no tenia el atributo `allow="geolocation"`. Corregido en `index.html`.
4. **No se puede enviar sin GPS** — `gps_encuesta` tenia `required:true`. Cambiado a `required:false` con texto de ayuda explicativo.

### Archivos modificados
- `Seed.gs`: catalogo `oficio_artesanal` agregado, campos nuevos `oficio_principal_otro` y `materia_prima_principal_otro`, `gps_encuesta` no requerido.
- `index.html`: iframe con `allow="geolocation"`.

### Deploy
- clasp push: 13 archivos, exitoso.
- Version Apps Script: **v4** (creada `2026-05-05T14:22:31Z`).
- Deployment actualizado: mismo ID y URL `/exec` de siempre.
- Commit GitHub: `5e5f408 feat: oficio dropdown con Otro, materia prima otro, GPS iframe + deploy v4`.

### Accion requerida por el usuario
Despues de hacer login en la Web App, ir al panel Admin y ejecutar **"Sincronizar cuestionario"** (llama a `syncQuestionnaireMetadata()`). Esto re-siembra las hojas CUESTIONARIO y CATALOGOS con los nuevos campos y el catalogo `oficio_artesanal`.

### Pendientes
- Ejecutar `runSetup()` desde el editor Apps Script si aun no se hizo (autoriza OAuth).
- Probar login, luego sincronizar cuestionario, luego QA del formulario completo.
- Cambiar credenciales iniciales.
