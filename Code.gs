/**
 * Creates a custom menu in Google Sheets when the spreadsheet opens.
 */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('FormBuilder')
      .addItem('Choose Image Folder', 'showPicker')
      .addItem('Create Form', 'makeForm')
      .addToUi();
}

/**
 * Displays an HTML-service dialog in Google Sheets that contains client-side
 * JavaScript code for the Google Picker API.
 */
function showPicker() {
  var html = HtmlService.createHtmlOutputFromFile('picker.html')
      .setWidth(600)
      .setHeight(425)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showModalDialog(html, 'Select a folder');
}

/**
 * Gets the user's OAuth 2.0 access token so that it can be passed to Picker.
 * This technique keeps Picker from needing to show its own authorization
 * dialog, but is only possible if the OAuth scope that Picker needs is
 * available in Apps Script. In this case, the function includes an unused call
 * to a DriveApp method to ensure that Apps Script requests access to all files
 * in the user's Drive.
 *
 * @return {string} The user's OAuth 2.0 access token.
 */
function getOAuthToken() {
  DriveApp.getRootFolder();
  return ScriptApp.getOAuthToken();
}

/**
 * Fill in the url to the folder
 *  Function to be called from the client side script in picker.html
 *  google.script.run.myFunct(data)
 */
function popFromFolderId(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  
  var folder = DriveApp.getFolderById(id);
  var photos = folder.getFilesByType('image/png')
  while(photos.hasNext()){
    var file = photos.next();
    name = file.getName();
    url  = file.getUrl();
    desc = file.getDescription();
    id = file.getId();
    sheet.appendRow([name, id, url, desc])
  }
}

function makeForm() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  
  // Create spreadsheet to receive the data
  var recip = SpreadsheetApp.create(ss.getName()+"-data");
  
  // Create form with same name as source sheet
  FormApp.getActiveForm();
  var form = FormApp.create(ss.getName())
    .setTitle(ss.getName())
    .setAcceptingResponses(true)
    .setDescription("Generated Form About Images")
    .setCollectEmail(true)
    .setAllowResponseEdits(true)
    .setLimitOneResponsePerUser(true)
    .setProgressBar(true)
    .setRequireLogin(true)
    .setDestination(FormApp.DestinationType.SPREADSHEET, recip.getId());
  
  var SCALE_CHOICES = ["None","Nominal","Ordinal","Interval","Ratio"];
  var QUESTION_ROWS = ["Question 1", "Question 2", "Question 3"];
  
  var last_row = sheet.getLastRow();
  var values = sheet.getSheetValues(1, 1, last_row, 3);
  
  for(row = 0; row < last_row; row++){
    var img = DriveApp.getFileById(values[row][1]);
    form.addPageBreakItem()
    .setTitle(img.getName());
    
    form.addImageItem()
      .setImage(img.getBlob())
      .setTitle(values[row][0])
      .setAlignment(FormApp.Alignment.CENTER);
    
    form.addGridItem()
    .setTitle("What scale is used in the display to answer the following questions?")
    .setRows(QUESTION_ROWS)
    .setColumns(SCALE_CHOICES)
    .setRequired(true);
  }
}
