function getCatalogMap_() {
  var rows = getRowsAsObjects_(APP_CFG.SHEETS.CATALOGS);
  var map = {};
  rows.forEach(function(r) {
    var cat = normalizeText_(r.catalogo);
    if (!cat) return;
    if (!map[cat]) map[cat] = [];
    map[cat].push({ codigo: normalizeText_(r.codigo), etiqueta: normalizeText_(r.etiqueta), orden: Number(r.orden || 9999) });
  });
  Object.keys(map).forEach(function(cat) {
    map[cat].sort(function(a,b){ return (a.orden || 9999) - (b.orden || 9999) || a.etiqueta.localeCompare(b.etiqueta); });
  });
  return map;
}

function getSurveySchema() {
  var SCHEMA_CACHE_KEY = 'artesanos_schema_v1';
  var sc = CacheService.getScriptCache();
  var cachedJson = sc.get(SCHEMA_CACHE_KEY);
  if (cachedJson) { try { return JSON.parse(cachedJson); } catch(e) {} }

  var qRows = getRowsAsObjects_(APP_CFG.SHEETS.QUESTIONNAIRE);
  if (!qRows.length) {
    seedCatalogs();
    seedQuestionnaire();
    qRows = getRowsAsObjects_(APP_CFG.SHEETS.QUESTIONNAIRE);
  }
  var catalogs = getCatalogMap_();
  qRows.sort(function(a,b){
    return Number(a.section_order || 0) - Number(b.section_order || 0) || Number(a.question_order || 0) - Number(b.question_order || 0);
  });
  var sectionsMap = {};
  var sections = [];
  qRows.forEach(function(q) {
    var sid = normalizeText_(q.section_id);
    if (!sectionsMap[sid]) {
      sectionsMap[sid] = { id: sid, order: Number(q.section_order || 0), label: normalizeText_(q.section_label), questions: [] };
      sections.push(sectionsMap[sid]);
    }
    var opt = parseJsonSafe_(q.options_json, null);
    var options = [];
    if (opt && opt.catalog && catalogs[opt.catalog]) {
      options = catalogs[opt.catalog].map(function(x) { return { value: x.etiqueta, label: x.etiqueta, codigo: x.codigo }; });
    } else if (Array.isArray(opt)) {
      options = opt.map(function(x) { return typeof x === 'object' ? x : { value: x, label: x }; });
    }
    sectionsMap[sid].questions.push({
      section_order: Number(q.section_order || 0),
      section_id: sid,
      section_label: normalizeText_(q.section_label),
      question_order: Number(q.question_order || 0),
      field_name: normalizeText_(q.field_name),
      label: normalizeText_(q.label),
      input_type: normalizeText_(q.input_type) || 'text',
      required: asBool_(q.required),
      options: options,
      visible_if: parseJsonSafe_(q.visible_if, null),
      contains_pii: asBool_(q.contains_pii),
      include_in_analytics: asBool_(q.include_in_analytics),
      help_text: normalizeText_(q.help_text)
    });
  });
  var result = {
    app: {
      appName: APP_CFG.APP_NAME,
      orgName: APP_CFG.ORG_NAME,
      activeEdition: activeEdition_(),
      photoFields: APP_CFG.PHOTO_FIELDS,
      geoFields: APP_CFG.GEO_FIELDS,
      links: publicLinks_()
    },
    sections: sections,
    catalogs: catalogs
  };
  try {
    var json = JSON.stringify(result);
    if (json.length < 90000) sc.put(SCHEMA_CACHE_KEY, json, 60);
  } catch(e) {}
  return result;
}

function submitSurvey(payload, sessionToken) {
  payload = payload || {};
  var values = payload.values || {};
  var gps = payload.gps || {};
  var photos = payload.photos || [];
  var session = getSession_(sessionToken || '');
  var publicAllowed = asBool_(getConfigValue_('allow_public_survey', 'SI'));
  if (!session && !publicAllowed) throw new Error('La carga pública está deshabilitada. Inicie sesión.');
  if (asBool_(getConfigValue_('require_consent', 'SI')) && normalizeKey_(values.consentimiento_informado) !== 'si') {
    throw new Error('No se puede guardar una entrevista sin consentimiento informado afirmativo.');
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    syncHeaders_(APP_CFG.SHEETS.RESPONSES, getResponseHeaders_());
    var headers = getHeaders_(APP_CFG.SHEETS.RESPONSES);
    var sourceUuid = normalizeText_(payload.source_uuid) || uuid_();
    var now = nowIso_();
    var startTs = normalizeText_(payload.start_ts);
    var endTs = normalizeText_(payload.end_ts) || now;
    var duration = computeDurationMinutes_(startTs, endTs);
    var row = {};
    headers.forEach(function(h) { row[h] = ''; });

    row.source_uuid = sourceUuid;
    row.source_status = 'submitted';
    row.source_version = normalizeText_(payload.source_version) || 'artesanos-v1.0.0';
    row.source_index = getOrCreateSheet_(APP_CFG.SHEETS.RESPONSES).getLastRow();
    row.edicion = normalizeText_(values.edicion) || activeEdition_();
    row.fecha_encuesta = normalizeText_(values.fecha_encuesta) || todayIso_();
    row.start_ts = startTs;
    row.end_ts = endTs;
    row.submission_ts = now;
    row.duracion_min = duration;
    row.modo_captura = session ? 'usuario_autenticado' : 'carga_publica';
    row.encuestador_usuario = session ? session.username : normalizeText_(values.encuestador);
    row.created_by = session ? session.username : normalizeText_(values.encuestador) || 'public';
    row.created_at = now;
    row.updated_at = now;

    Object.keys(values).forEach(function(k) {
      if (headers.indexOf(k) >= 0) {
        var v = values[k];
        row[k] = typeof v === 'object' ? JSON.stringify(v) : v;
      }
    });

    APP_CFG.GEO_FIELDS.forEach(function(field) {
      var g = gps[field] || parseJsonSafe_(values[field], null) || {};
      row[field] = g && Object.keys(g).length ? JSON.stringify(g) : row[field];
      row[field + '_lat'] = g.lat || g.latitude || '';
      row[field + '_lng'] = g.lng || g.longitude || '';
      row[field + '_accuracy'] = g.accuracy || '';
      row[field + '_ts'] = g.ts || g.timestamp || '';
    });

    var uploadInfo = uploadSurveyPhotos_(sourceUuid, photos, session ? session.username : normalizeText_(values.encuestador));
    uploadInfo.forEach(function(p) {
      row[p.field_name + '_id'] = p.file_id;
      row[p.field_name + '_url'] = p.file_url;
    });

    var audioUrl = '';
    var audioDurationSec = Number(payload.audio_duration_sec) || 0;
    if (payload.audio_base64 && String(payload.audio_base64).length > 0) {
      try {
        var audioBytes = Utilities.base64Decode(payload.audio_base64);
        var audioBlob = Utilities.newBlob(audioBytes, 'audio/webm',
          nowIso_().replace(/[:.]/g, '-') + '_' + sourceUuid + '_audio.webm');
        var audioFile = getPhotosFolder_().createFile(audioBlob);
        audioUrl = audioFile.getUrl();
      } catch(audioErr) { Logger.log('Audio upload error: ' + audioErr.message); }
    }
    row.audio_url = audioUrl;
    row.audio_duration_sec = audioDurationSec;
    row.vivienda_mapeada_id = normalizeText_(values.vivienda_mapeada_id);
    row.vivienda_mapeada_n = normalizeText_(values.vivienda_mapeada_n);
    row.vivienda_mapeada_lat = normalizeText_(values.vivienda_mapeada_lat);
    row.vivienda_mapeada_lng = normalizeText_(values.vivienda_mapeada_lng);
    row.vivienda_asignada_a = normalizeText_(values.vivienda_asignada_a) || (session ? session.username : '');
    row.vivienda_plan_estado = row.vivienda_mapeada_id ? 'visitada' : '';

    var cleaned = cleanAndDerive_(row);
    Object.keys(cleaned).forEach(function(k) { row[k] = cleaned[k]; });
    var flags = qualityFlags_(row);
    row.calidad_estado = flags.length ? 'Revisar' : 'OK';
    row.calidad_flags_json = JSON.stringify(flags);

    var ordered = headers.map(function(h) {
      var v = row[h];
      if (v === null || v === undefined) return '';
      if (typeof v === 'object') return JSON.stringify(v);
      return v;
    });
    getOrCreateSheet_(APP_CFG.SHEETS.RESPONSES).appendRow(ordered);
    upsertDirectory_(row);
    auditLog_(session ? session.username : 'public', session ? session.role : 'public', 'submit_survey', 'response', sourceUuid, { flags: flags.length, photos: uploadInfo.length });
    rebuildAnalytics();
    return { ok: true, source_uuid: sourceUuid, calidad_estado: row.calidad_estado, flags: flags, photos: uploadInfo.length, audio_url: audioUrl };
  } finally {
    lock.releaseLock();
  }
}

function uploadSurveyPhotos_(sourceUuid, photos, username) {
  var out = [];
  if (!photos || !photos.length) return out;
  var folder = getPhotosFolder_();
  photos.forEach(function(p, idx) {
    if (!p || !p.dataBase64 || !p.fieldName) return;
    var field = normalizeText_(p.fieldName);
    if (APP_CFG.PHOTO_FIELDS.indexOf(field) < 0) return;
    var mime = normalizeText_(p.mimeType) || 'image/jpeg';
    var name = normalizeText_(p.name) || (field + '.jpg');
    var safeName = nowIso_().replace(/[:]/g,'-') + '_' + sourceUuid + '_' + field + '_' + name.replace(/[^a-zA-Z0-9_.-]+/g,'_');
    var bytes = Utilities.base64Decode(String(p.dataBase64).replace(/^data:[^,]+,/, ''));
    var blob = Utilities.newBlob(bytes, mime, safeName);
    var file = folder.createFile(blob);
    var info = {
      foto_id: uuid_(),
      source_uuid: sourceUuid,
      field_name: field,
      file_id: file.getId(),
      file_url: file.getUrl(),
      filename: safeName,
      mime_type: mime,
      size_bytes: bytes.length,
      uploaded_at: nowIso_(),
      uploaded_by: username || ''
    };
    appendObject_(APP_CFG.SHEETS.PHOTOS, info, PHOTO_HEADERS_);
    out.push(info);
  });
  return out;
}

function computeDurationMinutes_(startTs, endTs) {
  if (!startTs || !endTs) return '';
  var a = new Date(startTs).getTime();
  var b = new Date(endTs).getTime();
  if (!isFinite(a) || !isFinite(b) || b < a) return '';
  return Math.round(((b - a) / 60000) * 10) / 10;
}

function cleanAndDerive_(row) {
  var out = {};
  out.nombre_completo = normalizePersonName_(row.nombre_completo_raw || row.nombre_completo);
  out.cedula = normalizeDigits_(row.cedula_raw || row.cedula);
  out.respondente_id = out.cedula ? ('CI_' + out.cedula) : ('ART_' + normalizeKey_(out.nombre_completo).slice(0, 18) + '_' + String(row.source_uuid || '').slice(0, 8));
  out.edad_grupo = edadGrupo_(row.edad);

  var roster = parseJsonSafe_(row.miembros_hogar_json, []);
  if (Array.isArray(roster) && roster.length) {
    var t = { total: roster.length, mujeres: 0, hombres: 0, ninos: 0, jovenes: 0, adultos: 0, mayores: 0 };
    roster.forEach(function(m) {
      var sx = normalizeKey_(m.sexo || m.genero || '');
      var e = asNumber_(m.edad);
      if (sx === 'femenino' || sx === 'mujer') t.mujeres++;
      if (sx === 'masculino' || sx === 'hombre') t.hombres++;
      if (e !== null) {
        if (e <= 14) t.ninos++;
        else if (e <= 29) t.jovenes++;
        else if (e <= 64) t.adultos++;
        else t.mayores++;
      }
    });
    out.total_miembros_calc = t.total;
    out.n_mujeres_calc = t.mujeres;
    out.n_hombres_calc = t.hombres;
    out.ninos_0_14_calc = t.ninos;
    out.jovenes_15_29_calc = t.jovenes;
    out.adultos_30_64_calc = t.adultos;
    out.adultos_mayores_65mas_calc = t.mayores;
    if (!row.total_miembros) out.total_miembros = t.total;
    if (!row.n_mujeres) out.n_mujeres = t.mujeres;
    if (!row.n_hombres) out.n_hombres = t.hombres;
  }

  var fotoCount = 0;
  APP_CFG.PHOTO_FIELDS.forEach(function(f) { if (row[f + '_url']) fotoCount++; });
  out.cantidad_fotos = fotoCount;
  out.gps_completo = (row.gps_encuesta_lat && row.gps_encuesta_lng) ? 'SI' : 'NO';
  return out;
}

function normalizeDigits_(v) {
  return normalizeText_(v).replace(/\D+/g, '');
}

function normalizePersonName_(v) {
  return normalizeText_(v).toLowerCase().split(' ').map(function(p) {
    return p ? p.charAt(0).toUpperCase() + p.slice(1) : '';
  }).join(' ');
}

function qualityFlags_(row) {
  var flags = [];
  var edad = asNumber_(row.edad);
  if (edad !== null && (edad < 10 || edad > 100)) flags.push({ campo: 'edad', tipo: 'rango_atipico', detalle: 'Edad fuera del rango esperado.' });
  var dur = asNumber_(row.duracion_min);
  if (dur !== null && dur < 5) flags.push({ campo: 'duracion_min', tipo: 'muy_baja', detalle: 'Duración menor a 5 minutos.' });
  if (dur !== null && dur > 240) flags.push({ campo: 'duracion_min', tipo: 'muy_alta', detalle: 'Duración superior a 240 minutos.' });
  if (!row.gps_encuesta_lat || !row.gps_encuesta_lng) flags.push({ campo: 'gps_encuesta', tipo: 'faltante', detalle: 'No se capturó GPS de la entrevista.' });
  if (!row.tipo_artesania_principal) flags.push({ campo: 'tipo_artesania_principal', tipo: 'faltante', detalle: 'No se indicó tipo principal de artesanía.' });
  if (normalizeKey_(row.pertenece_comunidad_indigena) === 'no' && row.etnia) flags.push({ campo: 'etnia', tipo: 'consistencia', detalle: 'Tiene etnia informada, pero declara no pertenecer a comunidad indígena.' });
  if (normalizeKey_(row.consentimiento_informado) !== 'si') flags.push({ campo: 'consentimiento_informado', tipo: 'critico', detalle: 'Consentimiento no afirmativo.' });
  if (asNumber_(row.cantidad_fotos) === 0) flags.push({ campo: 'fotos', tipo: 'sin_fotos', detalle: 'No se adjuntó ninguna foto.' });
  return flags;
}

function upsertDirectory_(row) {
  var id = normalizeText_(row.respondente_id);
  if (!id) return;
  var rows = getRowsAsObjects_(APP_CFG.SHEETS.DIRECTORY);
  var obj = {
    respondente_id: id,
    nombre_completo: row.nombre_completo || '',
    cedula: row.cedula || '',
    telefono: row.telefono || '',
    comunidad: row.comunidad || '',
    tipo_artesania_principal: row.tipo_artesania_principal || '',
    asociacion_nombre: row.asociacion_nombre || '',
    ultima_actualizacion: nowIso_()
  };
  for (var i = 0; i < rows.length; i++) {
    if (normalizeText_(rows[i].respondente_id) === id) {
      updateRowByNumber_(APP_CFG.SHEETS.DIRECTORY, rows[i].__rowNum, obj);
      return;
    }
  }
  appendObject_(APP_CFG.SHEETS.DIRECTORY, obj, ['respondente_id','nombre_completo','cedula','telefono','comunidad','tipo_artesania_principal','asociacion_nombre','ultima_actualizacion']);
}
