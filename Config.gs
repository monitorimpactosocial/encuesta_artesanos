var APP_CFG = {
  APP_NAME: 'Encuesta a Artesanos · Isla Hermosa',
  APP_SHORT_NAME: 'Artesanos Isla Hermosa',
  ORG_NAME: 'Paracel S.A.',
  PROJECT_NAME: 'Monitor de Impacto Social',
  REPOSITORY_URL: 'https://github.com/monitorimpactosocial/encuesta_artesanos.git',
  BACKEND_SPREADSHEET_ID_DEFAULT: '1bNA0oHXbQEU0WkVqsa-iKefXHRdWwQNiE7MvEazPq40',
  PHOTOS_FOLDER_ID_DEFAULT: '11FlYCQ0Bzr7bXPkt1Ya_d3FLgOrKFcM-',
  TIMEZONE: 'America/Asuncion',
  SESSION_HOURS: 12,
  TOKEN_HOURS: 24 * 30,
  SHEETS: {
    CONFIG: 'CONFIG',
    USERS: 'USUARIOS',
    EDITIONS: 'EDICIONES',
    QUESTIONNAIRE: 'CUESTIONARIO',
    CATALOGS: 'CATALOGOS',
    RESPONSES: 'RESPUESTAS',
    ANALYTIC: 'BASE_ANALITICA',
    LONG: 'RESPUESTAS_LONG',
    AUDIT: 'AUDITORIA',
    PHOTOS: 'FOTOS',
    DIRECTORY: 'DIRECTORIO_ARTESANOS'
  },
  PII_FIELDS: [
    'nombre_completo_raw','nombre_completo','cedula_raw','cedula','telefono','direccion_referencia',
    'nro_casa','correo','nombre_contacto_emergencia','telefono_contacto_emergencia','observaciones_identificacion'
  ],
  LONG_FIELDS: [
    'sexo','edad','edad_grupo','jefatura_hogar','nacionalidad','estado_civil','idioma_principal',
    'pertenece_comunidad_indigena','etnia','comunidad','departamento','distrito','barrio_localidad',
    'tipo_vivienda','tenencia_vivienda','material_paredes','material_piso','material_techo',
    'fuente_agua_principal','luz_electrica','tiene_bano','desague_sanitario','combustible_cocinar','tiene_internet',
    'nivel_educativo','sabe_leer_escribir','discapacidad_hogar','seguro_medico','acceso_salud',
    'tipo_artesania_principal','oficio_principal','materia_prima_principal','origen_materia_prima','anos_experiencia',
    'dedicacion_artesania','lugar_trabajo','trabaja_solo_o_grupo','participa_asociacion','asociacion_nombre',
    'ruc_o_registro','registro_marca','capacitacion_recibida','necesita_capacitacion','principal_canal_venta',
    'vende_por_redes','participa_ferias','ingreso_artesania_banda','ingreso_total_hogar_banda','principal_fuente_ingreso',
    'acceso_credito','necesita_financiamiento','barreras_comercializacion','interes_programa_paracel','prioridad_apoyo'
  ],
  PHOTO_FIELDS: ['foto_general','foto_vivienda','foto_taller','foto_producto_principal','foto_producto_secundario','foto_documento','foto_otros'],
  GEO_FIELDS: ['gps_encuesta','gps_taller']
};

var BACKEND_SS_CACHE_ = null;
var BACKEND_SS_ID_CACHE_ = '';

function getBackendSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('BACKEND_SPREADSHEET_ID') || APP_CFG.BACKEND_SPREADSHEET_ID_DEFAULT;
  if (!id) throw new Error('BACKEND_SPREADSHEET_ID no configurado. Ejecute setupBackend(spreadsheetId, photosFolderId).');
  if (BACKEND_SS_CACHE_ && BACKEND_SS_ID_CACHE_ === id) return BACKEND_SS_CACHE_;
  BACKEND_SS_ID_CACHE_ = id;
  BACKEND_SS_CACHE_ = SpreadsheetApp.openById(id);
  return BACKEND_SS_CACHE_;
}

function getPhotosFolder_() {
  var fid = PropertiesService.getScriptProperties().getProperty('PHOTOS_FOLDER_ID') || APP_CFG.PHOTOS_FOLDER_ID_DEFAULT;
  if (!fid) throw new Error('PHOTOS_FOLDER_ID no configurado. Ejecute setupBackend(spreadsheetId, photosFolderId).');
  return DriveApp.getFolderById(fid);
}

function getBaseUrl_() {
  return ScriptApp.getService().getUrl() || '';
}
