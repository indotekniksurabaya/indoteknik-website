function doGet(e) {
  var template = HtmlService.createTemplateFromFile('index');
  var htmlOutput = template.evaluate()
    .setTitle('PT INDO TEKNIK EMPATBELAS | Kontraktor Spesialis Proteksi Kebakaran & ME')
    .setFaviconUrl('https://img.icons8.com/color/48/fire-hydrant.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=5.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  return htmlOutput;
}

function doPost(e) {
  try {
    var params = e.parameter;
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet ? spreadsheet.getActiveSheet() : null;
    var timestamp = new Date();
    var name = params.name || '';
    var company = params.company || '';
    var phone = params.phone || '';
    var email = params.email || '';
    var service = params.service || '';
    var message = params.message || '';
    
    if (sheet) {
      sheet.appendRow([timestamp, name, company, phone, email, service, message]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Permintaan penawaran berhasil dicatat.',
      timestamp: timestamp
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
