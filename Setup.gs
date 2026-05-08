function runSetup() {
  var SPREADSHEET_ID = APP_CFG.BACKEND_SPREADSHEET_ID_DEFAULT;
  var PHOTOS_FOLDER_ID = APP_CFG.PHOTOS_FOLDER_ID_DEFAULT;
  return setupBackend(SPREADSHEET_ID, PHOTOS_FOLDER_ID);
}

function setupBackend(spreadsheetId, photosFolderId) {
  if (!spreadsheetId) throw new Error('Debe indicar spreadsheetId.');
  PropertiesService.getScriptProperties().setProperty('BACKEND_SPREADSHEET_ID', spreadsheetId);
  if (photosFolderId) PropertiesService.getScriptProperties().setProperty('PHOTOS_FOLDER_ID', photosFolderId);
  BACKEND_SS_CACHE_ = null;
  BACKEND_SS_ID_CACHE_ = '';

  ensureHeaders_(APP_CFG.SHEETS.CONFIG, CONFIG_HEADERS_);
  ensureHeaders_(APP_CFG.SHEETS.USERS, USER_HEADERS_);
  ensureHeaders_(APP_CFG.SHEETS.EDITIONS, EDITION_HEADERS_);
  ensureHeaders_(APP_CFG.SHEETS.QUESTIONNAIRE, QUESTIONNAIRE_HEADERS_);
  ensureHeaders_(APP_CFG.SHEETS.CATALOGS, CATALOG_HEADERS_);
  ensureHeaders_(APP_CFG.SHEETS.AUDIT, AUDIT_HEADERS_);
  ensureHeaders_(APP_CFG.SHEETS.PHOTOS, PHOTO_HEADERS_);
  ensureHeaders_(APP_CFG.SHEETS.DIRECTORY, ['respondente_id','nombre_completo','cedula','telefono','comunidad','tipo_artesania_principal','asociacion_nombre','ultima_actualizacion']);
  ensureHeaders_(APP_CFG.SHEETS.DWELLING_ASSIGNMENTS, DWELLING_ASSIGNMENT_HEADERS_);

  seedAll();
  syncHeaders_(APP_CFG.SHEETS.RESPONSES, getResponseHeaders_());
  rebuildAnalytics();

  Object.keys(APP_CFG.SHEETS).forEach(function(k) { setFrozenAndFilter_(APP_CFG.SHEETS[k]); });
  auditLog_('system','system','setup_backend','spreadsheet',spreadsheetId,{ photosFolderId: photosFolderId || '' });
  return { ok: true, spreadsheetId: spreadsheetId, photosFolderId: photosFolderId || '', links: publicLinks_() };
}

function fixEverything() {
  ensureHeaders_(APP_CFG.SHEETS.CONFIG, CONFIG_HEADERS_);
  ensureHeaders_(APP_CFG.SHEETS.USERS, USER_HEADERS_);
  ensureHeaders_(APP_CFG.SHEETS.EDITIONS, EDITION_HEADERS_);
  ensureHeaders_(APP_CFG.SHEETS.QUESTIONNAIRE, QUESTIONNAIRE_HEADERS_);
  ensureHeaders_(APP_CFG.SHEETS.CATALOGS, CATALOG_HEADERS_);
  ensureHeaders_(APP_CFG.SHEETS.AUDIT, AUDIT_HEADERS_);
  ensureHeaders_(APP_CFG.SHEETS.PHOTOS, PHOTO_HEADERS_);
  ensureHeaders_(APP_CFG.SHEETS.DWELLING_ASSIGNMENTS, DWELLING_ASSIGNMENT_HEADERS_);
  syncHeaders_(APP_CFG.SHEETS.RESPONSES, getResponseHeaders_());
  hashSeedUsers_();
  rebuildAnalytics();
  auditLog_('system','system','fix_everything','spreadsheet','',{ ok: true });
  return { ok: true };
}

function syncQuestionnaireMetadata(sessionToken) {
  var actor = requireRole_(sessionToken, ['admin']);
  seedCatalogs();
  seedQuestionnaire();
  syncHeaders_(APP_CFG.SHEETS.RESPONSES, getResponseHeaders_());
  rebuildAnalytics();
  auditLog_(actor.username, actor.role, 'sync_questionnaire_metadata', 'questionnaire', activeEdition_(), {});
  return { ok: true, headers: getResponseHeaders_().length };
}

function getResponseHeaders_() {
  var meta = [
    'source_uuid','source_status','source_version','source_index','edicion','fecha_encuesta',
    'start_ts','end_ts','submission_ts','duracion_min','modo_captura','encuestador_usuario',
    'gps_encuesta_lat','gps_encuesta_lng','gps_encuesta_accuracy','gps_encuesta_ts',
    'gps_taller_lat','gps_taller_lng','gps_taller_accuracy','gps_taller_ts',
    'audio_url','audio_duration_sec',
    'vivienda_mapeada_id','vivienda_mapeada_n','vivienda_mapeada_lat','vivienda_mapeada_lng',
    'vivienda_asignada_a','vivienda_plan_estado'
  ];
  APP_CFG.PHOTO_FIELDS.forEach(function(f) {
    meta.push(f + '_id');
    meta.push(f + '_url');
  });
  var qRows = getRowsAsObjects_(APP_CFG.SHEETS.QUESTIONNAIRE);
  if (!qRows.length) qRows = getQuestionnaireSeed_();
  var fields = [];
  qRows.sort(function(a,b){ return Number(a.section_order || 0) - Number(b.section_order || 0) || Number(a.question_order || 0) - Number(b.question_order || 0); })
    .forEach(function(q) {
      var f = normalizeText_(q.field_name);
      if (f && fields.indexOf(f) < 0) fields.push(f);
    });
  var derived = [
    'nombre_completo','cedula','respondente_id','edad_grupo','total_miembros_calc','n_mujeres_calc','n_hombres_calc',
    'ninos_0_14_calc','jovenes_15_29_calc','adultos_30_64_calc','adultos_mayores_65mas_calc',
    'cantidad_fotos','gps_completo','calidad_estado','calidad_flags_json','created_by','created_at','updated_at'
  ];
  var all = meta.slice();
  fields.concat(derived).forEach(function(h) { if (all.indexOf(h) < 0) all.push(h); });
  return all;
}

function getAnalyticHeaders_(responseHeaders) {
  var pii = APP_CFG.PII_FIELDS || [];
  return responseHeaders.filter(function(h) { return pii.indexOf(h) < 0; });
}
