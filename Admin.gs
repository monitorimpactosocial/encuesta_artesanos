function getDashboardSummary(sessionToken, filters) {
  var actor = requireRole_(sessionToken, ['admin','editor','viewer']);
  filters = filters || {};
  var rows = filterResponseRows_(getRowsAsObjects_(APP_CFG.SHEETS.RESPONSES), filters);
  var total = rows.length;
  var bySexo = {}, byEdad = {}, byComunidad = {}, byTipo = {}, byMateria = {}, byCanal = {}, byIngreso = {}, byCap = {}, byPrioridad = {}, byCalidad = {}, byAsoc = {}, byFormal = {}, byInteres = {};
  var photos = 0, gpsOk = 0, mujeres = 0, hombres = 0, indigenas = 0, internet = 0, digital = 0;
  var edadSum = 0, edadN = 0, durSum = 0, durN = 0, hogarSum = 0, hogarN = 0;

  rows.forEach(function(r) {
    inc_(bySexo, r.sexo);
    inc_(byEdad, r.edad_grupo || edadGrupo_(r.edad));
    inc_(byComunidad, r.comunidad);
    inc_(byTipo, r.tipo_artesania_principal);
    inc_(byMateria, r.materia_prima_principal);
    inc_(byCanal, r.principal_canal_venta);
    inc_(byIngreso, r.ingreso_artesania_banda);
    inc_(byCap, r.necesita_capacitacion);
    inc_(byPrioridad, r.prioridad_apoyo);
    inc_(byCalidad, r.calidad_estado || 'Sin dato');
    inc_(byAsoc, r.participa_asociacion);
    inc_(byFormal, r.ruc_o_registro);
    inc_(byInteres, r.interes_programa_paracel);

    if (normalizeKey_(r.sexo) === 'femenino') mujeres++;
    if (normalizeKey_(r.sexo) === 'masculino') hombres++;
    if (normalizeKey_(r.pertenece_comunidad_indigena) === 'si') indigenas++;
    if (normalizeKey_(r.tiene_internet) === 'si') internet++;
    if (normalizeKey_(r.vende_por_redes) === 'si') digital++;
    if (normalizeKey_(r.gps_completo) === 'si' || (r.gps_encuesta_lat && r.gps_encuesta_lng)) gpsOk++;
    photos += Number(r.cantidad_fotos || 0);
    var e = asNumber_(r.edad); if (e !== null) { edadSum += e; edadN++; }
    var d = asNumber_(r.duracion_min); if (d !== null) { durSum += d; durN++; }
    var h = asNumber_(r.total_miembros || r.total_miembros_calc); if (h !== null) { hogarSum += h; hogarN++; }
  });

  auditLog_(actor.username, actor.role, 'dashboard_summary', 'responses', '', { count: total });
  return {
    total: total,
    kpi: {
      total: total,
      mujeres: mujeres,
      hombres: hombres,
      pctMujeres: pct_(mujeres, total),
      pctIndigena: pct_(indigenas, total),
      pctInternet: pct_(internet, total),
      pctVentaDigital: pct_(digital, total),
      pctGps: pct_(gpsOk, total),
      fotos: photos,
      edadPromedio: edadN ? Math.round((edadSum / edadN) * 10) / 10 : '',
      duracionPromedio: durN ? Math.round((durSum / durN) * 10) / 10 : '',
      tamanoHogarPromedio: hogarN ? Math.round((hogarSum / hogarN) * 10) / 10 : ''
    },
    charts: {
      sexo: mapToItems_(bySexo), edad: mapToItems_(byEdad), comunidad: mapToItems_(byComunidad),
      tipo: mapToItems_(byTipo), materia: mapToItems_(byMateria), canal: mapToItems_(byCanal), ingreso: mapToItems_(byIngreso),
      capacitacion: mapToItems_(byCap), prioridad: mapToItems_(byPrioridad), calidad: mapToItems_(byCalidad),
      asociacion: mapToItems_(byAsoc), formalizacion: mapToItems_(byFormal), interes: mapToItems_(byInteres)
    },
    filters: buildFilterOptions_(rows),
    rowsPreview: rows.slice(-10).reverse().map(publicResponsePreview_)
  };
}

function buildFilterOptions_(rows) {
  var fields = ['edicion','comunidad','sexo','tipo_artesania_principal','materia_prima_principal','participa_asociacion','calidad_estado'];
  var out = {};
  fields.forEach(function(f) { out[f] = {}; });
  rows.forEach(function(r) { fields.forEach(function(f) { inc_(out[f], r[f]); }); });
  fields.forEach(function(f) { out[f] = mapToItems_(out[f]); });
  return out;
}

function filterResponseRows_(rows, filters) {
  filters = filters || {};
  var q = normalizeKey_(filters.q || '');
  return rows.filter(function(r) {
    if (filters.edicion && normalizeText_(r.edicion) !== normalizeText_(filters.edicion)) return false;
    if (filters.comunidad && normalizeText_(r.comunidad) !== normalizeText_(filters.comunidad)) return false;
    if (filters.sexo && normalizeText_(r.sexo) !== normalizeText_(filters.sexo)) return false;
    if (filters.tipo_artesania_principal && normalizeText_(r.tipo_artesania_principal) !== normalizeText_(filters.tipo_artesania_principal)) return false;
    if (filters.calidad_estado && normalizeText_(r.calidad_estado) !== normalizeText_(filters.calidad_estado)) return false;
    if (q) {
      var text = [r.respondente_id,r.nombre_completo,r.cedula,r.telefono,r.comunidad,r.tipo_artesania_principal,r.productos_principales,r.asociacion_nombre].map(normalizeKey_).join(' ');
      if (text.indexOf(q) < 0) return false;
    }
    return true;
  });
}

function publicResponsePreview_(r) {
  return {
    source_uuid: r.source_uuid,
    fecha_encuesta: r.fecha_encuesta,
    submission_ts: r.submission_ts,
    respondente_id: r.respondente_id,
    nombre_completo: r.nombre_completo,
    sexo: r.sexo,
    edad: r.edad,
    comunidad: r.comunidad,
    tipo_artesania_principal: r.tipo_artesania_principal,
    productos_principales: r.productos_principales,
    principal_canal_venta: r.principal_canal_venta,
    ingreso_artesania_banda: r.ingreso_artesania_banda,
    participa_asociacion: r.participa_asociacion,
    cantidad_fotos: r.cantidad_fotos,
    gps_completo: r.gps_completo,
    calidad_estado: r.calidad_estado,
    calidad_flags_json: r.calidad_flags_json
  };
}

function listResponses(sessionToken, filters, limit) {
  var actor = requireRole_(sessionToken, ['admin','editor','viewer']);
  limit = Math.min(Number(limit || 100), 1000);
  var rows = filterResponseRows_(getRowsAsObjects_(APP_CFG.SHEETS.RESPONSES), filters || {});
  rows.sort(function(a,b){ return String(b.submission_ts || '').localeCompare(String(a.submission_ts || '')); });
  auditLog_(actor.username, actor.role, 'list_responses', 'responses', '', { count: rows.length, limit: limit });
  return { rows: rows.slice(0, limit).map(publicResponsePreview_), total: rows.length, limited: rows.length > limit };
}

function getResponseDetail(sessionToken, sourceUuid) {
  var actor = requireRole_(sessionToken, ['admin','editor','viewer']);
  var rows = getRowsAsObjects_(APP_CFG.SHEETS.RESPONSES);
  for (var i = 0; i < rows.length; i++) {
    if (normalizeText_(rows[i].source_uuid) === normalizeText_(sourceUuid)) {
      auditLog_(actor.username, actor.role, 'get_response_detail', 'response', sourceUuid, {});
      return rows[i];
    }
  }
  throw new Error('Respuesta no encontrada.');
}

function rebuildAnalytics(sessionToken) {
  var actor = sessionToken ? requireRole_(sessionToken, ['admin','editor']) : { username: 'system', role: 'system' };
  var responseHeaders = getHeaders_(APP_CFG.SHEETS.RESPONSES);
  if (!responseHeaders.length) responseHeaders = getResponseHeaders_();
  var analyticHeaders = getAnalyticHeaders_(responseHeaders);
  var rows = getRowsAsObjects_(APP_CFG.SHEETS.RESPONSES);
  var analyticRows = rows.map(function(r) { return analyticHeaders.map(function(h) { return r[h] || ''; }); });
  replaceSheetData_(APP_CFG.SHEETS.ANALYTIC, analyticHeaders, analyticRows);

  var longHeaders = ['edicion','fecha_encuesta','respondente_id','source_uuid','campo','valor'];
  var longRows = [];
  rows.forEach(function(r) {
    APP_CFG.LONG_FIELDS.forEach(function(f) {
      if (r[f] !== null && r[f] !== undefined && String(r[f]) !== '') {
        longRows.push([r.edicion || '', r.fecha_encuesta || '', r.respondente_id || '', r.source_uuid || '', f, r[f]]);
      }
    });
  });
  replaceSheetData_(APP_CFG.SHEETS.LONG, longHeaders, longRows);
  auditLog_(actor.username, actor.role, 'rebuild_analytics', 'responses', '', { rows: rows.length, longRows: longRows.length });
  return { ok: true, rows: rows.length, analyticColumns: analyticHeaders.length, longRows: longRows.length };
}

function exportResponsesCsv(sessionToken, filters) {
  var actor = requireRole_(sessionToken, ['admin','editor','viewer']);
  var headers = getHeaders_(APP_CFG.SHEETS.RESPONSES);
  var rows = filterResponseRows_(getRowsAsObjects_(APP_CFG.SHEETS.RESPONSES), filters || {});
  var csvRows = [headers].concat(rows.map(function(r) { return headers.map(function(h) { return r[h] || ''; }); }));
  var csv = csvRows.map(function(row) {
    return row.map(function(v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
  }).join('\n');
  auditLog_(actor.username, actor.role, 'export_responses_csv', 'responses', '', { count: rows.length });
  return csv;
}

function getSpreadsheetLinks(sessionToken) {
  requireRole_(sessionToken, ['admin','editor','viewer']);
  return publicLinks_();
}
