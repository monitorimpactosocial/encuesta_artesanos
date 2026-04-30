function hashSeedUsers_() {
  var users = getRowsAsObjects_(APP_CFG.SHEETS.USERS);
  users.forEach(function(u) {
    var username = normalizeText_(u.username);
    var tmp = normalizeText_(u.password_temporal);
    var hasHash = normalizeText_(u.password_hash);
    if (username && tmp && !hasHash) {
      u.password_hash = sha256Hex_(username + '|' + tmp);
      u.password_temporal = '';
      updateRowByNumber_(APP_CFG.SHEETS.USERS, u.__rowNum, u);
    }
  });
}

function findUser_(username) {
  username = normalizeText_(username).toLowerCase();
  var users = getRowsAsObjects_(APP_CFG.SHEETS.USERS);
  for (var i = 0; i < users.length; i++) {
    if (normalizeText_(users[i].username).toLowerCase() === username) return users[i];
  }
  return null;
}

function login(username, password) {
  username = normalizeText_(username).toLowerCase();
  password = normalizeText_(password);
  if (!username || !password) throw new Error('Usuario y contraseña son obligatorios.');
  hashSeedUsers_();
  var user = findUser_(username);
  if (!user) throw new Error('Usuario no encontrado.');
  if (!asBool_(user.active)) throw new Error('Usuario inactivo.');
  var expected = normalizeText_(user.password_hash);
  var actual = sha256Hex_(username + '|' + password);
  if (expected !== actual) throw new Error('Contraseña incorrecta.');
  var token = uuid_();
  var expires = new Date(new Date().getTime() + APP_CFG.SESSION_HOURS * 60 * 60 * 1000).toISOString();
  CacheService.getScriptCache().put('SESSION_' + token, JSON.stringify({
    username: username,
    displayName: normalizeText_(user.display_name) || username,
    role: normalizeText_(user.role) || 'viewer',
    expiresAt: expires,
    mustChangePassword: asBool_(user.must_change_password)
  }), APP_CFG.SESSION_HOURS * 60 * 60);
  auditLog_(username, normalizeText_(user.role), 'login', 'user', username, {});
  return {
    token: token,
    username: username,
    displayName: normalizeText_(user.display_name) || username,
    role: normalizeText_(user.role) || 'viewer',
    mustChangePassword: asBool_(user.must_change_password),
    expiresAt: expires
  };
}

function getSession_(token) {
  token = normalizeText_(token);
  if (!token) return null;
  var raw = CacheService.getScriptCache().get('SESSION_' + token);
  if (!raw) return null;
  var obj = parseJsonSafe_(raw, null);
  if (!obj) return null;
  return obj;
}

function requireRole_(token, roles) {
  var s = getSession_(token);
  if (!s) throw new Error('Sesión expirada o no iniciada.');
  roles = roles || ['admin','editor','viewer'];
  if (roles.indexOf(s.role) < 0) throw new Error('Permisos insuficientes para esta operación.');
  return s;
}

function logout(token) {
  token = normalizeText_(token);
  if (token) CacheService.getScriptCache().remove('SESSION_' + token);
  return { ok: true };
}

function changePassword(token, currentPassword, newPassword) {
  var actor = requireRole_(token, ['admin','editor','viewer']);
  currentPassword = normalizeText_(currentPassword);
  newPassword = normalizeText_(newPassword);
  if (!newPassword || newPassword.length < 6) throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
  var user = findUser_(actor.username);
  if (!user) throw new Error('Usuario no encontrado.');
  var expected = normalizeText_(user.password_hash);
  var actual = sha256Hex_(actor.username + '|' + currentPassword);
  if (expected !== actual) throw new Error('Contraseña actual incorrecta.');
  user.password_hash = sha256Hex_(actor.username + '|' + newPassword);
  user.password_temporal = '';
  user.must_change_password = 'NO';
  updateRowByNumber_(APP_CFG.SHEETS.USERS, user.__rowNum, user);
  auditLog_(actor.username, actor.role, 'change_password', 'user', actor.username, {});
  return { ok: true };
}

function getBootstrap(token) {
  var session = getSession_(token);
  return {
    app: {
      appName: APP_CFG.APP_NAME,
      appShortName: APP_CFG.APP_SHORT_NAME,
      orgName: APP_CFG.ORG_NAME,
      projectName: APP_CFG.PROJECT_NAME,
      activeEdition: activeEdition_(),
      links: publicLinks_()
    },
    session: session,
    publicSurvey: asBool_(getConfigValue_('allow_public_survey', 'SI'))
  };
}

function listUsers(sessionToken) {
  var actor = requireRole_(sessionToken, ['admin']);
  var rows = getRowsAsObjects_(APP_CFG.SHEETS.USERS).map(function(u) {
    return {
      username: u.username,
      display_name: u.display_name,
      role: u.role,
      active: u.active,
      must_change_password: u.must_change_password,
      notes: u.notes
    };
  });
  auditLog_(actor.username, actor.role, 'list_users', 'user', '', { count: rows.length });
  return rows;
}

function saveUser(sessionToken, user) {
  var actor = requireRole_(sessionToken, ['admin']);
  user = user || {};
  var username = normalizeText_(user.username).toLowerCase();
  if (!username) throw new Error('username obligatorio.');
  var rows = getRowsAsObjects_(APP_CFG.SHEETS.USERS);
  var obj = {
    username: username,
    display_name: normalizeText_(user.display_name) || username,
    role: normalizeText_(user.role) || 'viewer',
    password_hash: normalizeText_(user.password_hash),
    password_temporal: normalizeText_(user.password_temporal),
    active: normalizeText_(user.active) || 'SI',
    must_change_password: normalizeText_(user.must_change_password) || (user.password_temporal ? 'SI' : 'NO'),
    notes: normalizeText_(user.notes)
  };
  if (obj.password_temporal) {
    obj.password_hash = sha256Hex_(username + '|' + obj.password_temporal);
    obj.password_temporal = '';
  }
  for (var i = 0; i < rows.length; i++) {
    if (normalizeText_(rows[i].username).toLowerCase() === username) {
      if (!obj.password_hash) obj.password_hash = rows[i].password_hash;
      updateRowByNumber_(APP_CFG.SHEETS.USERS, rows[i].__rowNum, obj);
      auditLog_(actor.username, actor.role, 'update_user', 'user', username, {});
      return { ok: true, updated: true };
    }
  }
  if (!obj.password_hash) throw new Error('Para crear un usuario debe indicar password_temporal.');
  appendObject_(APP_CFG.SHEETS.USERS, obj, USER_HEADERS_);
  auditLog_(actor.username, actor.role, 'create_user', 'user', username, {});
  return { ok: true, created: true };
}
