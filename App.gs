function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function doGet(e) {
  var t = HtmlService.createTemplateFromFile('AppIndex');
  t.serverContext = JSON.stringify({
    token: (e && e.parameter && e.parameter.token) ? e.parameter.token : '',
    v: '1.0.0',
    appName: APP_CFG.APP_NAME
  });
  return t.evaluate()
    .setTitle(APP_CFG.ORG_NAME + ' · ' + APP_CFG.APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doPost(e) {
  var FN_WHITELIST = {
    login: login,
    logout: logout,
    changePassword: changePassword,
    getBootstrap: getBootstrap,
    getSurveySchema: getSurveySchema,
    submitSurvey: submitSurvey,
    getDashboardSummary: getDashboardSummary,
    listResponses: listResponses,
    getResponseDetail: getResponseDetail,
    rebuildAnalytics: rebuildAnalytics,
    listUsers: listUsers,
    saveUser: saveUser,
    getFieldMapData: getFieldMapData,
    saveDwellingAssignments: saveDwellingAssignments,
    getSpreadsheetLinks: getSpreadsheetLinks,
    syncQuestionnaireMetadata: syncQuestionnaireMetadata,
    exportResponsesCsv: exportResponsesCsv
  };
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    var fn = FN_WHITELIST[body.fn];
    if (!fn) throw new Error('Función no permitida: ' + body.fn);
    var result = fn.apply(null, body.args || []);
    return ContentService.createTextOutput(JSON.stringify({ __result: result })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ __error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
