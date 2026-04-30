# Encuesta a Artesanos · Isla Hermosa · Paracel S.A.

Aplicación web para relevamiento de artesanos de Isla Hermosa, preparada sobre Google Apps Script, Google Sheets y Google Drive. Integra las mejores piezas funcionales de los aplicativos de colaboradores y pescadores: formulario por metadatos, captura de GPS, fotos comprimidas, guardado local de borradores, usuarios, auditoría, tablero gerencial, base analítica sin PII y exportación de respuestas.

## Recursos configurados

| Recurso | Valor |
|---|---|
| Repositorio | https://github.com/monitorimpactosocial/encuesta_artesanos.git |
| Spreadsheet backend | https://docs.google.com/spreadsheets/d/1bNA0oHXbQEU0WkVqsa-iKefXHRdWwQNiE7MvEazPq40/edit |
| ID Spreadsheet | `1bNA0oHXbQEU0WkVqsa-iKefXHRdWwQNiE7MvEazPq40` |
| Carpeta Drive para fotos | https://drive.google.com/drive/folders/11FlYCQ0Bzr7bXPkt1Ya_d3FLgOrKFcM- |
| ID Carpeta | `11FlYCQ0Bzr7bXPkt1Ya_d3FLgOrKFcM-` |

## Credenciales iniciales

| Usuario | Contraseña | Rol |
|---|---:|---|
| `admin` | `123` | Administrador |
| `diego` | `456` | Administrador |
| `user` | `123` | Visualizador |

Las contraseñas se hashean con SHA-256 al ejecutar `runSetup()` o `setupBackend()`. Deben cambiarse después del primer despliegue.

## Archivos principales

| Archivo | Función |
|---|---|
| `Config.gs` | Parámetros generales, IDs del Sheet y carpeta Drive, hojas, campos PII, campos de fotos y GPS. |
| `Seed.gs` | Cuestionario completo de artesanos, catálogos, usuarios y edición 2026. |
| `Setup.gs` | Inicialización del backend, creación/sincronización de hojas y reconstrucción analítica. |
| `Auth.gs` | Login, logout, cambio de contraseña, sesiones y administración de usuarios. |
| `Survey.gs` | Formulario por metadatos, validaciones, envío, carga de fotos, GPS, flags de calidad. |
| `Admin.gs` | Dashboard, búsqueda de respuestas, exportación CSV y base analítica. |
| `App.gs` | `doGet`, `doPost`, endpoint interno y carga de la interfaz. |
| `AppIndex.html` | Plantilla HTML servida por Apps Script. |
| `Styles.html` | Estilo visual Paracel, responsive y preparado para móvil. |
| `Client.html` | SPA del formulario, dashboard, login, fotos, GPS y guardado local. |
| `MANUAL_OPERATIVO_ARTESANOS.md` | Manual operativo para encuestadores y supervisores. |
| `index.html` | Landing opcional para GitHub Pages. |

## Despliegue recomendado en Apps Script

1. Abrir el Google Sheet backend.
2. Ir a **Extensiones → Apps Script**.
3. Crear los archivos `.gs` y `.html` con los mismos nombres del paquete y pegar el contenido.
4. Verificar que `appsscript.json` reemplace al manifiesto del proyecto.
5. Ejecutar una vez la función:

```javascript
runSetup()
```

6. Aceptar permisos de Google Sheets y Drive.
7. Ir a **Implementar → Nueva implementación → Aplicación web**.
8. Configurar:
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: según el entorno operativo. Para campo, normalmente **Cualquier usuario con el enlace**.
9. Copiar la URL pública de la aplicación web.
10. Probar carga de una entrevista con foto y GPS.

## Estructura esperada del Google Sheet

El setup crea o sincroniza estas hojas:

| Hoja | Contenido |
|---|---|
| `CONFIG` | Parámetros de edición activa, permisos de carga pública y límites operativos. |
| `USUARIOS` | Usuarios, roles, hash de contraseña y banderas de cambio obligatorio. |
| `EDICIONES` | Edición activa 2026. |
| `CUESTIONARIO` | Metadatos de preguntas, secciones, tipos de entrada y reglas de visibilidad. |
| `CATALOGOS` | Opciones normalizadas para listas, botones y casillas múltiples. |
| `RESPUESTAS` | Base wide con una columna por variable, GPS, fotos, derivados y flags. |
| `BASE_ANALITICA` | Base wide sin campos personales sensibles. |
| `RESPUESTAS_LONG` | Base larga para Looker Studio o análisis multivariado. |
| `AUDITORIA` | Trazabilidad de acciones administrativas y envíos. |
| `FOTOS` | Registro de archivos subidos a Drive. |
| `DIRECTORIO_ARTESANOS` | Directorio depurado con identificación mínima de seguimiento. |

## Instrumento integrado

El instrumento contiene 9 módulos:

1. Control operativo y georreferenciación.
2. Identificación de la persona artesana.
3. Composición del hogar, vivienda y servicios.
4. Educación, salud y protección social.
5. Actividad artesanal y capacidades productivas.
6. Producción, ventas e ingresos.
7. Organización, formalización y financiamiento.
8. Condiciones de trabajo, ambiente y riesgos.
9. Vinculación, expectativas y cierre.

## Funcionalidades críticas

- Captura de `gps_encuesta` obligatoria.
- Captura adicional de `gps_taller`.
- Fotos: general, vivienda, taller, producto principal, producto secundario, documento y otros.
- Compresión client-side de fotografías antes de subir a Drive.
- Guardado local de borrador en el dispositivo, útil en campo ante cortes de señal.
- Validación de consentimiento informado.
- Flags automáticas de calidad:
  - edad fuera de rango,
  - entrevista demasiado corta o demasiado larga,
  - GPS faltante,
  - tipo de artesanía faltante,
  - inconsistencia entre pertenencia indígena y etnia,
  - consentimiento no afirmativo,
  - ausencia total de fotos.
- Reconstrucción automática de `BASE_ANALITICA` y `RESPUESTAS_LONG`.
- Dashboard con KPIs y distribuciones por comunidad, sexo, tipo de artesanía, canal de venta, ingreso, prioridad de apoyo y calidad del dato.

## Publicación en GitHub

Con `clasp` instalado:

```bash
npm install -g @google/clasp
clasp login
cp .clasp.example.json .clasp.json
```

Editar `.clasp.json` con el `scriptId` real del proyecto Apps Script y luego ejecutar:

```bash
clasp push
```

El repositorio GitHub puede alojar el código y, opcionalmente, activar GitHub Pages con `index.html` como página informativa que redirija o enlace a la Web App de Apps Script.

## Mantenimiento

- Reaplicar el cuestionario y catálogos: `syncQuestionnaireMetadata(token)` desde la vista Administración o `seedAll()` desde el editor.
- Reconstruir bases analíticas: botón **Reconstruir analítica** o función `rebuildAnalytics()`.
- Cambiar contraseña: iniciar sesión y usar `changePassword()` o editar `USUARIOS`, vaciar `password_hash`, cargar `password_temporal` y ejecutar `hashSeedUsers_()`.
- Revisar calidad: filtrar `calidad_estado = Revisar` en `RESPUESTAS`.

## Nota técnica

Esta versión no modifica directamente el repositorio remoto ni el Google Sheet desde el paquete local. El archivo `.zip` contiene todo el código listo para copiar a Apps Script o versionar en GitHub.
