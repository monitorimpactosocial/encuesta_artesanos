function nowIso_() {
  return Utilities.formatDate(new Date(), APP_CFG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function todayIso_() {
  return Utilities.formatDate(new Date(), APP_CFG.TIMEZONE, 'yyyy-MM-dd');
}

function uuid_() {
  return Utilities.getUuid();
}

function sha256Hex_(value) {
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value || ''), Utilities.Charset.UTF_8);
  return raw.map(function(b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function normalizeText_(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function normalizeKey_(value) {
  return normalizeText_(value).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function parseJsonSafe_(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch (e) { return fallback; }
}

function asBool_(value) {
  if (value === true || value === 1) return true;
  var t = normalizeKey_(value);
  return ['si','sí','true','1','x','yes','y'].indexOf(t) >= 0;
}

function asNumber_(value) {
  if (value === null || value === undefined || value === '') return null;
  var n = Number(String(value).replace(/\./g, '').replace(',', '.'));
  return isFinite(n) ? n : null;
}

function getOrCreateSheet_(sheetName) {
  var ss = getBackendSpreadsheet_();
  var sh = ss.getSheetByName(sheetName);
  if (!sh) sh = ss.insertSheet(sheetName);
  return sh;
}

function setFrozenAndFilter_(sheetName) {
  var sh = getOrCreateSheet_(sheetName);
  if (sh.getMaxRows() > 1) sh.setFrozenRows(1);
  var range = sh.getDataRange();
  if (range.getNumRows() > 0 && range.getNumColumns() > 0) {
    try {
      if (!sh.getFilter()) range.createFilter();
    } catch (e) {}
  }
}

function ensureHeaders_(sheetName, headers) {
  var sh = getOrCreateSheet_(sheetName);
  if (!headers || !headers.length) return sh;
  var current = [];
  if (sh.getLastColumn() > 0) current = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(normalizeText_);
  var needs = current.length === 0 || current.join('|') !== headers.join('|');
  if (needs) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    if (sh.getLastColumn() > headers.length) {
      sh.deleteColumns(headers.length + 1, sh.getLastColumn() - headers.length);
    }
  }
  sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0F3D33').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  return sh;
}

function syncHeaders_(sheetName, headers) {
  var sh = getOrCreateSheet_(sheetName);
  if (!headers || !headers.length) return sh;
  var current = [];
  if (sh.getLastColumn() > 0) current = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(normalizeText_);
  var finalHeaders = current.slice();
  headers.forEach(function(h) {
    if (finalHeaders.indexOf(h) < 0) finalHeaders.push(h);
  });
  if (finalHeaders.length === 0) finalHeaders = headers.slice();
  sh.getRange(1, 1, 1, finalHeaders.length).setValues([finalHeaders]);
  sh.getRange(1, 1, 1, finalHeaders.length).setFontWeight('bold').setBackground('#0F3D33').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  return sh;
}

function getHeaders_(sheetName) {
  var sh = getOrCreateSheet_(sheetName);
  if (sh.getLastColumn() === 0) return [];
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(normalizeText_);
}

function getRowsAsObjects_(sheetName) {
  var sh = getOrCreateSheet_(sheetName);
  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];
  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(normalizeText_);
  var values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
  return values.map(function(row, idx) {
    var obj = { __rowNum: idx + 2 };
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
}

function appendObject_(sheetName, obj, preferredHeaders) {
  var headers = getHeaders_(sheetName);
  if (!headers.length && preferredHeaders && preferredHeaders.length) {
    ensureHeaders_(sheetName, preferredHeaders);
    headers = preferredHeaders.slice();
  }
  Object.keys(obj || {}).forEach(function(k) {
    if (headers.indexOf(k) < 0) headers.push(k);
  });
  syncHeaders_(sheetName, headers);
  var row = headers.map(function(h) {
    var v = obj[h];
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });
  getOrCreateSheet_(sheetName).appendRow(row);
}

function updateRowByNumber_(sheetName, rowNumber, obj) {
  var headers = getHeaders_(sheetName);
  Object.keys(obj || {}).forEach(function(k) {
    if (headers.indexOf(k) < 0) headers.push(k);
  });
  syncHeaders_(sheetName, headers);
  var row = headers.map(function(h) {
    var v = obj[h];
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });
  getOrCreateSheet_(sheetName).getRange(rowNumber, 1, 1, headers.length).setValues([row]);
}

function replaceSheetData_(sheetName, headers, rows) {
  var sh = getOrCreateSheet_(sheetName);
  sh.clearContents();
  if (!headers || !headers.length) return;
  var data = [headers].concat(rows || []);
  sh.getRange(1, 1, data.length, headers.length).setValues(data);
  sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0F3D33').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  autoResizeSafe_(sh, headers.length);
}

function autoResizeSafe_(sh, nCols) {
  try {
    sh.autoResizeColumns(1, Math.min(nCols || sh.getLastColumn(), 40));
  } catch (e) {}
}

function getConfigValue_(key, fallback) {
  var rows = getRowsAsObjects_(APP_CFG.SHEETS.CONFIG);
  var k = normalizeKey_(key);
  for (var i = 0; i < rows.length; i++) {
    if (normalizeKey_(rows[i].clave) === k) return rows[i].valor;
  }
  return fallback;
}

function setConfigValue_(key, value, description) {
  var rows = getRowsAsObjects_(APP_CFG.SHEETS.CONFIG);
  var k = normalizeKey_(key);
  for (var i = 0; i < rows.length; i++) {
    if (normalizeKey_(rows[i].clave) === k) {
      updateRowByNumber_(APP_CFG.SHEETS.CONFIG, rows[i].__rowNum, { clave: key, valor: value, descripcion: description || rows[i].descripcion || '' });
      return;
    }
  }
  appendObject_(APP_CFG.SHEETS.CONFIG, { clave: key, valor: value, descripcion: description || '' }, ['clave','valor','descripcion']);
}

function activeEdition_() {
  return normalizeText_(getConfigValue_('active_edition', '2026')) || '2026';
}

function auditLog_(actor, role, action, entity, entityId, payload) {
  appendObject_(APP_CFG.SHEETS.AUDIT, {
    event_ts: nowIso_(),
    actor: actor || 'system',
    role: role || '',
    action: action || '',
    entity: entity || '',
    entity_id: entityId || '',
    payload_json: payload ? JSON.stringify(payload) : ''
  }, ['event_ts','actor','role','action','entity','entity_id','payload_json']);
}

function publicLinks_() {
  var ssId = PropertiesService.getScriptProperties().getProperty('BACKEND_SPREADSHEET_ID') || APP_CFG.BACKEND_SPREADSHEET_ID_DEFAULT;
  var folderId = PropertiesService.getScriptProperties().getProperty('PHOTOS_FOLDER_ID') || APP_CFG.PHOTOS_FOLDER_ID_DEFAULT;
  return {
    spreadsheetId: ssId,
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/' + ssId + '/edit',
    photosFolderId: folderId,
    photosFolderUrl: 'https://drive.google.com/drive/folders/' + folderId,
    repositoryUrl: APP_CFG.REPOSITORY_URL,
    webAppUrl: getBaseUrl_()
  };
}

function edadGrupo_(edad) {
  var e = asNumber_(edad);
  if (e === null) return 'Sin dato';
  if (e < 15) return 'Menor de 15';
  if (e <= 17) return '15 a 17';
  if (e <= 29) return '18 a 29';
  if (e <= 44) return '30 a 44';
  if (e <= 59) return '45 a 59';
  if (e <= 64) return '60 a 64';
  return '65 y más';
}

function inc_(map, key, by) {
  key = normalizeText_(key) || 'Sin dato';
  map[key] = (map[key] || 0) + (by || 1);
}

function mapToItems_(map) {
  return Object.keys(map || {}).map(function(k) { return { label: k, value: map[k] }; }).sort(function(a, b) {
    return b.value - a.value || String(a.label).localeCompare(String(b.label));
  });
}

function pct_(num, den) {
  den = Number(den || 0);
  if (!den) return 0;
  return Math.round((Number(num || 0) / den) * 1000) / 10;
}
