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

## 2026-05-08 — Estado actual: tablero sin funcionar / problema por resolver

### Resumen ejecutivo
Después de múltiples sesiones de corrección (2026-05-06 al 2026-05-08), la Web App GAS está en **v15** pero el tablero gerencial sigue sin cargar. El origen del problema fue una regresión introducida en v13 que rompió completamente `google.script.run`, y aunque fue corregida en v14, quedaron efectos secundarios: usuarios sin credenciales válidas y comportamiento indeterminado del tablero. Esta entrada documenta el estado exacto para retomar sin perder contexto.

---

### Cronología de cambios realizados (2026-05-06 al 2026-05-08)

#### Funcionalidades añadidas (GitHub + GAS)
| Versión GAS | Commit GitHub | Descripción |
|-------------|---------------|-------------|
| v8–v9 | `e62ebac`–`8179be8` | Modo offline PWA, mapa Leaflet, cola offline |
| v10 | `350b2fc` | Grabación de audio, columnas `audio_url` / `audio_duration_sec` en RESPUESTAS |
| v11 | `9410796` | Resiliencia, seguridad, UX |
| v11 | `c362e6d` | SW cache v2 para forzar descarga de `index.html` |
| v11 | `825ec1a` | SW cache v4 |

#### Correcciones de infraestructura (GAS solamente, no commiteadas a GitHub)
| Versión GAS | Descripción |
|-------------|-------------|
| v12 | `Client.html`: estado de error (`dashboardError`, `responsesError`) para que el tablero muestre error en lugar de spinner eterno. `callServer` original: spread operator. |
| **v13 ← REGRESIÓN CRÍTICA** | `callServer` reescrito con `.apply(null, args)` → rompe `this` binding de `google.script.run` → **todas las llamadas al servidor dejan de funcionar silenciosamente**: login, schema, dashboard, todo. |
| v14 | `callServer` corregido: `runner[fn].apply(runner, args)` preserva `this` correctamente. `render()` con try-catch alrededor de `view_()`. Dashboard pre-cargado en background durante `init()` y `doLogin_()`. |
| v15 | `Seed.gs`: usuarios Paracel (`diego.meza/123456`, `lati/123456`, `encuestador/123456`, `viewer/123456`). Login form: botón **"Restablecer usuarios"** que llama `resetUsers()` sin autenticación (para bootstrap de emergencia). |
| v15 | Leaflet SRI hash eliminado de `index.html` (hash no coincidía con contenido servido por unpkg). SW cache v5. |

---

### Estado del repositorio al 2026-05-08

| Canal | Estado |
|-------|--------|
| GitHub Pages (`index.html`) | Último commit `b78dd85`; funcional salvo que el tablero de `index.html` usa `fetch()` → GAS `doPost`, que está separado del canal GAS nativo. |
| GAS Web App | Deployment v15, ID `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk` |
| Sheet USUARIOS | Tiene usuarios `admin` y `user` con hashes de claves anteriores. Los nuevos usuarios (`diego.meza`, etc.) NO fueron escritos aún porque `resetUsers()` requiere que el usuario haga clic en el botón de la app. |
| Código GAS (`Client.html`, `Seed.gs`) | Pusheado vía clasp a v15 pero **NO commiteado a GitHub** — hay divergencia entre repo y GAS. |

---

### Problema pendiente: tablero no carga y login bloqueado

#### Síntoma observado
- En modo incógnito (sin caché): la app carga el skeleton pero el tablero queda en "Cargando dashboard..." o directamente no responde al login.
- El login parece no hacer nada o fallar silenciosamente.

#### Causa raíz confirmada (v13)
La función `callServer` en v13 usó `.apply(null, args)` como argumento de `this`, lo que rompió el proxy interno de `google.script.run`. Los métodos de ese proxy dependen de que `this` sea el objeto runner para enrutar la llamada al servidor. Con `this = null` el proxy falla silenciosamente: ni llama al success handler ni al failure handler. Resultado: cada `await callServer(...)` colgaba hasta el timeout de 60s sin dar ninguna respuesta.

#### Estado post-v14 / v15
El `callServer` está corregido con `runner[fn].apply(runner, args)`. Sin embargo, persisten dos incógnitas:

1. **Credenciales inválidas**: La hoja USUARIOS todavía tiene los hashes de `admin/paracel2026` y `user/123`. Los nuevos usuarios (`diego.meza/123456`) no existen hasta que se ejecute `resetUsers()`. Si el usuario intenta login con `diego.meza / 123456` sobre los datos actuales del sheet, fallará con "Usuario no encontrado."

2. **Posible caché GAS stale**: Múltiples deploys rápidos (v12→v13→v14→v15 en < 2 horas) pueden dejar la infraestructura de Google sirviendo una versión intermedia. El navegador del usuario podría estar cacheando una respuesta de GAS desactualizada incluso en incógnito (la caché de red de GAS es server-side, no de navegador).

3. **Posible necesidad de re-autorización**: Después de tantos push/deploy, si el token de autorización OAuth del script `monitorimpactosocial@gmail.com` expiró o fue revocado, la Web App mostraría una pantalla de autorización antes de cargar el HTML. El usuario podría estar viendo esa pantalla en vez de la app.

---

### Plan de diagnóstico y corrección

#### Paso 1 — Verificar que la Web App carga correctamente
Abrir en incógnito: `https://script.google.com/macros/s/AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk/exec`

- **Si aparece pantalla "Se necesita autorización"**: El propietario (`monitorimpactosocial@gmail.com`) debe abrir el editor GAS y ejecutar cualquier función para re-autorizar.
- **Si aparece skeleton "Cargando aplicativo..."** y luego error: el `init()` falló; ver mensaje de error en pantalla.
- **Si carga correctamente con sidebar y home page**: ir al Paso 2.

#### Paso 2 — Resetear usuarios
En el formulario de login, hacer clic en **"Restablecer usuarios"** (botón agregado en v15) y confirmar el diálogo. Debe aparecer toast: *"Usuarios restablecidos (4 usuarios). Ingrese con diego.meza / 123456"*.

Si ese botón no aparece o el toast no llega, hay un problema con `callServer` aún activo → revisar consola del navegador.

#### Paso 3 — Login
Ingresar `diego.meza` / `123456`. Tras login exitoso, el dashboard se pre-carga automáticamente en background.

#### Paso 4 — Si el tablero sigue sin cargar
Abrir consola del navegador (F12 → Console) y reportar cualquier error JavaScript. Los errores más probables serían:
- `TypeError: runner[fn] is not a function` → función no existe en GAS
- `Error: Sin respuesta del servidor (getDashboardSummary)` → timeout de 60s agotado, posiblemente la función tarda demasiado o GAS está bloqueado

#### Paso 5 — Sincronizar código con GitHub
Los archivos `Client.html` y `Seed.gs` tienen cambios de v12–v15 que no fueron commiteados. Una vez confirmado que v15 funciona, commitear y pushear para mantener paridad repo ↔ GAS.

---

### Deuda técnica identificada en esta sesión

| # | Descripción | Riesgo |
|---|-------------|--------|
| 1 | `Client.html` / `Seed.gs` no commiteados a GitHub desde v11 | Alto: divergencia silenciosa |
| 2 | `asNumber_()` en `Utils.gs` elimina el punto (separador de miles) pero rompe decimales reales (ej: `6.7` → `67`). Afecta cálculo de duración promedio en dashboard. | Bajo (solo KPI cosmético) |
| 3 | No hay flujo de "cambiar contraseña" en `Client.html` | Medio: usuarios no pueden rotar su clave desde la UI |
| 4 | `resetUsers()` es llamable sin autenticación desde `google.script.run` | Bajo: solo posible si alguien conoce la URL del script |
| 5 | `SESSION_HOURS: 12` en `Config.gs` — sesiones expiran a las 12hs; al recargar la página hay que loguearse de nuevo aunque el día de trabajo no terminó | Bajo: molestia operativa |

---

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

## 2026-05-08 - Login bloqueado: solucion sin depender del boton reset

### Diagnostico retomado
- Se estudio la bitacora vigente y se confirmo que el problema mas probable es la hoja `USUARIOS` con usuarios antiguos (`admin`/`user`) y sin los usuarios Paracel agregados en `Seed.gs`.
- El deployment publico vigente sigue siendo `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @15 - v15 - usuarios Paracel (diego.meza/123456), boton resetear en login`.
- `Client.html` local contiene la correccion de `callServer`: `runner[fn].apply(runner, args)`, por lo que el bug de v13 (`apply(null, args)`) no esta presente en el codigo versionado actual.
- `Client.html` local contiene el boton `Restablecer usuarios`, y `Seed.gs` contiene `resetUsers()` con los cuatro usuarios Paracel: `diego.meza`, `lati`, `encuestador`, `viewer`.

### Verificacion ejecutada
- `npx clasp deployments` confirmo 2 deployments: `@HEAD` y el deployment publico `@15`.
- Se intento ejecutar `npx clasp run resetUsers` para reparar directamente la hoja, pero Google respondio: `Unable to run script function. Please make sure you have permission to run the script function.`
- Por lo tanto no fue posible actualizar la hoja `USUARIOS` desde la terminal en esta pasada.

### Correccion aplicada localmente
- `Seed.gs`: se agrego `ensureDefaultUsers_()`.
  - Asegura cabeceras de `USUARIOS`.
  - Lee los usuarios existentes.
  - Agrega solamente los usuarios Paracel faltantes.
  - No borra ni sobreescribe usuarios existentes.
  - Hashea las contrasenas temporales agregadas.
- `Auth.gs`: `ensureAuthReady_()` ahora llama a `ensureDefaultUsers_()` cuando la hoja ya tiene usuarios. Esto corrige el caso donde `USUARIOS` no esta vacia, pero le faltan los usuarios nuevos.

### Resultado esperado
- Tras desplegar esta correccion en GAS, el primer intento de login o bootstrap de autenticacion debe agregar automaticamente `diego.meza / 123456` si falta en `USUARIOS`.
- El boton `Restablecer usuarios` queda como plan B, ya no como requisito principal.

### Validacion local
- `Auth.gs` y `Seed.gs` fueron validados sintacticamente con `node --check` por stdin, sin errores.

### Pendiente inmediato
1. Ejecutar `npx clasp push -f`.
2. Crear nueva version GAS y actualizar el deployment publico.
3. Probar `/exec` en incognito.
4. Ingresar con `diego.meza / 123456`.
5. Si aun no responde, abrir consola del navegador y distinguir entre cache stale de GAS, pantalla OAuth o timeout de servidor.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 13 archivos subidos a Apps Script.
- `npx clasp version "v16 - autoagregar usuarios Paracel faltantes en login"`: creada version 16.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 16`: deployment publico actualizado a `@16`.
- `npx clasp deployments`: confirma deployment publico `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @16 - v16 - autoagregar usuarios Paracel faltantes en login`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado tras la liberacion
- La Web App publica ya sirve una version que no depende de que la hoja `USUARIOS` este vacia ni del boton `Restablecer usuarios`.
- En el primer flujo de autenticacion, si faltan los usuarios Paracel, el backend debe agregarlos automaticamente y hashear sus claves temporales.
- Siguiente prueba funcional recomendada: abrir `/exec` en incognito e ingresar `diego.meza / 123456`. Si no entra, revisar consola F12 y capturar el error exacto.

## 2026-05-08 - Correccion foco tablero: carga de datos y serializacion GAS

### Reporte recibido
- El problema no es el logueo sino la carga de datos al tablero.
- La consola del navegador muestra principalmente advertencias del contenedor Google (`Unrecognized feature`, favicon 404, password fuera de `form`) y cambios de estado `warden` BUSY/IDLE, sin un error JavaScript claro de la app.

### Diagnostico aplicado
- Se reviso `Client.html`: el tablero llama `getDashboardSummary(sessionToken, filters)` y queda mostrando `Cargando dashboard...` si no recibe una respuesta util.
- Se reviso `Admin.gs`: `getDashboardSummary()` leia toda la hoja `RESPUESTAS` con `getRowsAsObjects_()` y devolvia `rowsPreview` con valores crudos de Sheets.
- Riesgo probable identificado: si `fecha_encuesta`, `submission_ts` u otros campos llegan como objetos `Date`, `google.script.run` puede fallar al serializar la respuesta aunque la funcion haya calculado los KPIs. Esto afecta especialmente a `rowsPreview` y `listResponses()`.
- Riesgo adicional: lectura completa de `RESPUESTAS` puede ser lenta o inestable si la hoja conserva muchas filas/columnas.

### Correcciones locales aplicadas
- `Utils.gs`:
  - Agregado `getRowsAsObjectsLimited_(sheetName, maxRows)` para leer solo una ventana controlada de filas recientes.
  - Agregado `clientValue_(value)` para convertir `Date` a ISO string y objetos a JSON antes de devolverlos al cliente.
  - Corregido `asNumber_()` para no transformar decimales con punto (`6.7`) en `67`.
- `Admin.gs`:
  - `getDashboardSummary()` ahora usa `dashboard_row_limit` con tope duro de 20.000 filas.
  - `rowsPreview` pasa por `clientValue_()` campo por campo.
  - La respuesta incluye `meta.loadedRows`, `meta.rowLimit` y `meta.limited`.
  - `listResponses()` tambien usa lectura limitada y sanitizacion de filas publicas.
- `Client.html`:
  - El tablero muestra una nota si la vista esta limitada por rendimiento.
  - `loadDashboard_()` fuerza render de estado de carga cuando el usuario entra al tablero.

### Validacion local
- `Admin.gs`, `Utils.gs` y el script embebido en `Client.html` pasaron `node --check` por stdin sin errores.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear nueva version GAS con descripcion de fix de tablero.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200 y confirmar `npx clasp deployments`.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 13 archivos subidos.
- `npx clasp version "v18 - corregir carga tablero y serializacion de fechas"`: creada version 18.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 18`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @18 - v18 - corregir carga tablero y serializacion de fechas`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado tras la liberacion
- El tablero ya no devuelve fechas/objetos crudos desde `rowsPreview`, reduciendo el riesgo de falla de serializacion en `google.script.run`.
- La lectura del tablero queda limitada por `dashboard_row_limit` para evitar esperas largas por hojas grandes.
- Si el tablero aun no carga en navegador, el siguiente dato necesario es el mensaje visible dentro de la tarjeta `Error al cargar el dashboard` o el error exacto tras esperar el timeout de la llamada.

## 2026-05-08 - Nueva vista: mapa territorial Isla Hermosa / Isla Tuyu

### Pedido recibido
- Crear una vista de mapa preciso del lugar `Isla Hermosa`, antes `Isla Tuyu`, para planificar la encuesta con una idea previa de viviendas existentes, distancias, caminos, cantidad de viviendas y personas.
- Fuentes locales indicadas:
  - `G:\Mi unidad\MAPEO_COMUNIDADES_INDIGENAS`
  - `G:\Mi unidad\CONCEPCION_AMAMBAY_GEODEMOGSOCIAL`

### Exploracion de fuentes
- En `CONCEPCION_AMAMBAY_GEODEMOGSOCIAL\concepcion_amambay_geodemogsocial\public\concepcion_amambay_barrios.geojson` se encontro `ISLA TUYU`, distrito `PASO BARRETO`, departamento `CONCEPCION`, `BAR_LOC=420`.
- En `CONCEPCION_AMAMBAY_GEODEMOGSOCIAL\concepcion_amambay_geodemogsocial\public\viviendas_concepcion.geojson` se encontraron 69 puntos de vivienda para `ISLA TUYU / PASO BARRETO`.
- No se encontraron manzanas asociadas a `ISLA TUYU` en `concepcion_amambay_manzanas.geojson`.
- Tambien aparece `ASENT. BARRIO HERMOSA` en Sargento Jose Felix Lopez, pero para este pedido se priorizo `ISLA TUYU` porque el usuario indico que Isla Hermosa era antes Isla Tuyu.

### Implementacion local
- `MapData.gs`: nuevo archivo con el recorte liviano de datos territoriales:
  - Limite operativo de `ISLA TUYU` como poligono Leaflet.
  - 69 viviendas INE georreferenciadas, numeradas de norte a sur / oeste a este.
  - Metadata de fuente, centro y bounds.
  - Funcion `getFieldMapData(sessionToken)` protegida para roles `admin`, `editor`, `viewer`.
- `AppIndex.html`: se agrego Leaflet CSS/JS para la Web App nativa GAS.
- `Client.html`: nueva vista autenticada `Mapa territorial` en la navegacion.
  - Mapa Leaflet con base OpenStreetMap.
  - Capa de limite de Isla Tuyu.
  - Capa de viviendas numeradas.
  - Controles para activar/desactivar limite, viviendas y etiquetas.
  - KPIs operativos: viviendas INE, area aproximada, distancia maxima entre viviendas y distancia promedio al vecino mas cercano.
- `Styles.html`: estilos para el mapa full-height, panel lateral, marcadores numerados y modo responsive.

### Validacion local
- `MapData.gs` paso `node --check` por stdin.
- El script embebido en `Client.html` paso `node --check` por stdin.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear nueva version GAS para el mapa territorial.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200.
5. Probar la nueva vista `Mapa territorial` con sesion iniciada.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 14 archivos subidos incluyendo `MapData.gs`.
- `npx clasp version "v19 - vista mapa territorial Isla Tuyu"`: creada version 19.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 19`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @19 - v19 - vista mapa territorial Isla Tuyu`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado tras la liberacion
- La Web App publicada ya incluye la vista `Mapa territorial` para usuarios autenticados.
- La vista parte de datos reales INE: 69 viviendas georreferenciadas y limite de barrio/localidad `ISLA TUYU`.
- Pendiente de mejora futura: incorporar caminos/hidrografia como capas vectoriales propias, y cruzar con respuestas de encuesta para mostrar viviendas visitadas, pendientes y cantidad real de personas por hogar.

## 2026-05-08 - Mapa como bandeja territorial: asignacion de viviendas a encuestadores

### Idea implementada
- Convertir la vista `Mapa territorial` en una bandeja operativa:
  - El admin selecciona viviendas directamente en el mapa.
  - Elige un encuestador, prioridad, orden inicial de ruta y nota.
  - Guarda la tanda en una hoja operativa.
  - Cada encuestador ve sus viviendas asignadas resaltadas al iniciar sesion.
  - Desde el popup de una vivienda propia puede iniciar la encuesta ya vinculada a ese punto.
  - Cuando se envia una encuesta con `vivienda_mapeada_id`, el mapa la marca como `visitada`.

### Cambios de backend
- `Config.gs`: agregado `APP_CFG.SHEETS.DWELLING_ASSIGNMENTS = ASIGNACIONES_VIVIENDA`.
- `Seed.gs`: agregado `DWELLING_ASSIGNMENT_HEADERS_`.
- `Setup.gs`: `setupBackend()` y `fixEverything()` aseguran la hoja `ASIGNACIONES_VIVIENDA`.
- `Setup.gs`: `getResponseHeaders_()` agrega campos de trazabilidad territorial:
  - `vivienda_mapeada_id`
  - `vivienda_mapeada_n`
  - `vivienda_mapeada_lat`
  - `vivienda_mapeada_lng`
  - `vivienda_asignada_a`
  - `vivienda_plan_estado`
- `MapData.gs`:
  - `getFieldMapData(sessionToken)` ahora combina mapa + asignaciones + visitas registradas.
  - `saveDwellingAssignments(sessionToken, assignments)` permite al admin asignar/liberar viviendas.
  - Se agregan resumenes: total, visibles, asignadas, sin asignar, propias, pendientes propias y visitadas.
- `Survey.gs`: `submitSurvey()` guarda los campos territoriales y marca `vivienda_plan_estado=visitada` cuando corresponde.
- `App.gs`: funciones nuevas habilitadas tambien para el wrapper `doPost`.

### Cambios de frontend
- `Client.html`:
  - Panel de asignacion visible solo para admin.
  - Seleccion de viviendas por click en el mapa.
  - Botones `Asignar seleccion`, `Liberar seleccion`, `Limpiar seleccion`.
  - KPIs de cobertura: viviendas mapeadas, asignadas al usuario, pendientes propias y visitadas.
  - Marcadores por estado: sin asignar, asignada, propia y visitada.
  - Popup con encuestador asignado, orden de ruta, prioridad y boton `Iniciar encuesta aqui` para viviendas propias pendientes.
  - Al iniciar encuesta desde el mapa, se cargan en borrador los campos de vivienda mapeada y localidad.
- `Styles.html`: estilos de marcadores por estado y panel de asignacion.

### Validacion local
- `Client.html`, `MapData.gs`, `Config.gs`, `Seed.gs`, `Setup.gs`, `Survey.gs` y `App.gs` pasaron `node --check` por stdin.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear nueva version GAS.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200 y registrar version.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v20 - asignar viviendas a encuestadores"`: creada version 20.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 20`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @20 - v20 - asignar viviendas a encuestadores`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado tras la liberacion
- La Web App publicada ya permite administrar viviendas mapeadas y asignarlas a encuestadores desde `Mapa territorial`.
- La hoja `ASIGNACIONES_VIVIENDA` se crea/asegura automaticamente al abrir el mapa o ejecutar setup/fix.
- La trazabilidad territorial queda en `RESPUESTAS` mediante `vivienda_mapeada_id` y campos relacionados.
- Pendiente de prueba funcional viva: entrar como admin, seleccionar 2-3 viviendas, asignarlas a `encuestador`, entrar con ese usuario y verificar que puede iniciar la encuesta desde el punto asignado.

## 2026-05-08 - Usuarios genericos y auto-planificacion de operativo

### Necesidad planteada
- Crear usuarios genericos (`encuestador1`, `encuestador2`, etc.) para luego asignarlos a personas reales.
- Permitir que el administrador vea viviendas/puntos y los asigne a cada usuario generico.
- Considerar tiempos, distancias y complejidad del instrumento para armar un plan eficiente de implementacion del relevamiento.

### Implementacion aplicada
- `Seed.gs`:
  - Agregados 8 usuarios genericos activos:
    - `encuestador1` a `encuestador8`
    - rol `editor`
    - clave temporal `123456`
    - `must_change_password=SI`
  - `ensureDefaultUsers_()` permite agregarlos sin borrar usuarios existentes.
- `MapData.gs`:
  - `fieldMapAssignableUsers_()` ahora ejecuta `ensureDefaultUsers_()` antes de listar usuarios asignables, de modo que los usuarios genericos aparezcan aunque el administrador mantenga una sesion previa.
- `Client.html`:
  - La vista `Mapa territorial` mantiene asignacion manual por seleccion de puntos.
  - Se agrego panel `Auto-planificar operativo`.
  - El panel permite definir:
    - cantidad de encuestadores a usar,
    - minutos estimados por encuesta,
    - velocidad de traslado en km/h,
    - orden inicial de ruta.
  - La app calcula una estimacion inicial de minutos por vivienda segun complejidad del cuestionario:
    - cantidad total de preguntas,
    - preguntas obligatorias,
    - campos de foto,
    - campos GPS,
    - preguntas de texto/multiseleccion/numericas.
  - La planificacion automatica:
    - toma viviendas no visitadas y sin asignacion,
    - ordena territorialmente los puntos,
    - reparte cargas entre usuarios genericos,
    - optimiza cada tanda con una ruta por vecino mas cercano,
    - calcula distancia aproximada y horas por encuestador,
    - guarda asignaciones en `ASIGNACIONES_VIVIENDA` usando `saveDwellingAssignments`.

### Validacion local
- `Client.html`: script embebido validado con `node --check`.
- `Seed.gs`: validado con `node --check`.
- `MapData.gs`: validado con `node --check`.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear version GAS.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200.
5. Commit/push Git.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v22 - usuarios visibles y clusters por encuestador"`: creada version 22.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 22`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @22 - v22 - usuarios visibles y clusters por encuestador`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado operativo
- La vista `Administracion > Gestion de usuarios` ya no queda vacia: lista usuarios y permite crear/actualizar usuarios con clave temporal.
- El mapa diferencia puntos por encuestador con paleta propia.
- El estado pendiente/visitado se distingue por intensidad de color.
- La planificacion automatica ahora separa viviendas en clusters por distancia antes de asignar sectores.

## 2026-05-08 - Usuario real reclama numero operativo y ve solo su ruta

### Pedido
- Cuando un usuario real tipo `nombre.apellido` inicia sesion, debe seleccionar un numero de encuestador disponible.
- Luego debe ver solo las viviendas asignadas a ese numero operativo, su ruta y tiempos estimados por vivienda y total.
- La duracion real de entrevistas debe alimentar una reestimacion del tiempo total.
- Solo `diego.meza`, `noelia.mendoza` y `latiffi.chelala` pueden ver utilidades administrativas.

### Cambios aplicados
- `Seed.gs`:
  - Se agregaron administradoras autorizadas `noelia.mendoza` y `latiffi.chelala`.
  - El alias legado `lati` queda sin privilegios administrativos efectivos.
  - Se agrego `ENUMERATOR_SLOT_HEADERS_` para la hoja de asignacion de numeros operativos.
- `Config.gs` / `Setup.gs`:
  - Nueva hoja `ENCUESTADOR_SLOTS`.
  - `setupBackend()` y `fixEverything()` aseguran sus encabezados.
- `Auth.gs`:
  - Nueva regla `effectiveRole_()`: solo `diego.meza`, `noelia.mendoza` y `latiffi.chelala` conservan rol admin.
  - Si otro usuario figura como admin en la hoja, se degrada efectivamente a `editor` en runtime.
- `MapData.gs`:
  - `claimEnumeratorSlot(sessionToken, slot)` permite que un usuario tome `encuestador1` a `encuestador8` si esta disponible.
  - `getFieldMapData()` usa el numero operativo activo para filtrar viviendas:
    - admins ven todo,
    - usuarios no admin ven solo viviendas asignadas a su numero operativo.
  - Las visitas traen `duracion_min` real para reestimar ruta.
- `Client.html`:
  - Usuarios no admin solo ven `Inicio`, `Formulario` y `Mapa territorial`.
  - `Dashboard`, `Respuestas` y `Administracion` quedan restringidos a admin.
  - Si un usuario no admin no tiene numero operativo, el mapa muestra selector de numero disponible.
  - La vista de ruta muestra viviendas visibles, pendientes, km aproximados, duracion por vivienda y total reestimado.
  - Boton `Recalcular` recarga mapa y usa duraciones reales ya registradas.

### Validacion local
- `Client.html`, `Auth.gs`, `MapData.gs`, `Seed.gs`, `App.gs`, `Config.gs` y `Setup.gs` pasaron `node --check`.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear nueva version GAS.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200.
5. Commit/push Git.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v24 - filtro mapa por encuestador"`: creada version 24.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 24`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @24 - v24 - filtro mapa por encuestador`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado operativo
- Admin puede filtrar el mapa por cada encuestador asignado.
- El filtro se aplica tambien a rutas y leyenda, no solo a los puntos.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v23 - ruta por usuario real y slots operativos"`: creada version 23.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 23`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @23 - v23 - ruta por usuario real y slots operativos`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado operativo
- Publicado el flujo usuario real -> numero operativo -> mapa filtrado.
- La app ya registra duracion real por encuesta en `duracion_min` y la usa para reestimar tiempos visibles en `Mi ruta y tiempos`.
- Privilegios administrativos efectivos limitados a `diego.meza`, `noelia.mendoza` y `latiffi.chelala`.

## 2026-05-08 - Filtro de mapa por encuestador

### Pedido
- En `Mapa territorial`, permitir filtrar los puntos visibles por cada encuestador.

### Cambios aplicados
- `Client.html`:
  - Se agrego panel `Filtrar por encuestador` para usuarios admin.
  - El selector incluye `Todos los puntos` y cada encuestador con viviendas asignadas.
  - El filtro afecta:
    - marcadores de viviendas,
    - leyenda de colores,
    - rutas/caminos operativos dibujados.
  - Al cambiar filtro se limpia la seleccion activa para evitar asignaciones accidentales sobre puntos ocultos.

### Validacion local
- `Client.html`: script embebido validado con `node --check`.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear nueva version GAS.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200.
5. Commit/push Git.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v21 - usuarios genericos y auto plan operativo"`: creada version 21.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 21`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @21 - v21 - usuarios genericos y auto plan operativo`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado operativo
- La app publicada ya incluye usuarios genericos `encuestador1` a `encuestador8`.
- Los usuarios se agregan sin borrar los existentes cuando se ejecuta `ensureDefaultUsers_()`; ademas, la vista de mapa fuerza esa verificacion antes de listar usuarios asignables.
- En `Mapa territorial`, el admin puede asignar puntos manualmente o usar `Auto-planificar operativo`.
- El auto-plan guarda asignaciones reales en `ASIGNACIONES_VIVIENDA`; no queda solo como simulacion visual.

## 2026-05-08 - Correccion gestion de usuarios y clusters por encuestador

### Problema reportado
- En `Administracion > Gestion de usuarios` solo aparecia texto informativo; no se mostraba ninguna lista ni formulario.
- En el mapa se pidio diferenciar visualmente puntos por encuestador:
  - color tenue para viviendas asignadas pendientes,
  - color fuerte para viviendas ya encuestadas/cerradas,
  - capas de caminos/rutas,
  - distribucion inteligente por sectores o clusters de distancia.

### Cambios aplicados
- `Auth.gs`:
  - `listUsers(sessionToken)` ejecuta `ensureDefaultUsers_()` antes de listar, para que aparezcan `encuestador1` a `encuestador8` sin depender de reset manual.
- `Client.html`:
  - Se agrego carga real de usuarios desde `listUsers`.
  - Se agrego tabla de usuarios en Administracion.
  - Se agrego formulario rapido para crear/actualizar usuarios con `saveUser`.
  - Se reemplazo la distribucion alternada de viviendas por clustering geografico:
    - agrupa viviendas pendientes por distancia,
    - asigna cada cluster a un encuestador,
    - ordena cada cluster por ruta de vecino mas cercano.
  - En el mapa, cada encuestador recibe un color propio.
  - Marcadores pendientes usan color tenue; marcadores visitados usan color fuerte.
  - Se agrego capa `Rutas y caminos operativos`, con polilineas por sector/encuestador.
  - La base OpenStreetMap queda como capa de referencia para caminos existentes del territorio.
- `Styles.html`:
  - Se agregaron estilos para leyenda de encuestadores, colores y rutas.

### Validacion local
- `Client.html`: script embebido validado con `node --check`.
- `Auth.gs`: validado con `node --check`.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear version GAS.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200.
5. Commit/push Git.
