// Default constants
var SCALE_CHOICES = ["None","Nominal","Ordinal","Interval","Ratio"];
var QUESTION_ROWS = ["Domain Question 1", "Domain Question 2", "Domain Question 3"];
var HEADERS = ["img_name", "img_id", "img_url", "img_desc", "question", "options"];

/**
 * Creates a custom menu in Google Sheets when the spreadsheet opens.
 */
function onOpen(e) {
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
  var num_rows = 0;
  while(photos.hasNext()){
    var file = photos.next();
    var name = file.getName();
    var url  = file.getUrl();
    var desc = file.getDescription();
    var img_id = file.getId();
    sheet.appendRow([name, img_id, url, desc])
    num_rows += 1;
  }
  
  defaultConfigFill(sheet.getLastRow(), num_rows);
}

/**
 * Fill in the configuration for generating a form
*/
function defaultConfigFill(last_row, num_rows){
  Logger.log("dumb");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  
  var data =[];
  var start_row = last_row - num_rows + 1;
  var start_col = 5;
  var rng = sheet.getRange(start_row, start_col, num_rows, 6);
  
  for(var r = 0; r < num_rows; r++){
    var row_data = [];
    for( var q = 0; q < QUESTION_ROWS.length; q++ ){
      row_data.push(QUESTION_ROWS[q]);
      row_data.push(SCALE_CHOICES.toString());
    }
    data.push(row_data);
  }
  
  rng.setValues(data);
}

function makeForm() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  
  var form = createFormWithBacking(); 
  var last_row = sheet.getLastRow();
  var values = sheet.getSheetValues(1, 1, last_row, 11);
  
  var populated_form = populateFormWithValues(form, values);
}

function populateFormWithValues(form, values){
  var img_id_col = 1;
  
  Logger.log("FormID: "+form.getId);
  Logger.log("FormTitle: "+form.getTitle);
  for(row = 0; row < values.length; row++){
    var img = DriveApp.getFileById(values[row][img_id_col]);
    form.addPageBreakItem()
    .setTitle(img.getName());
    
    form.addImageItem()
      .setImage(img.getBlob())
      .setTitle(values[row][0])
      .setAlignment(FormApp.Alignment.CENTER);
    
    var questions = [ values[row][4], values[row][6], values[row][8] ];
    var choices =   [ values[row][5], values[row][7], values[row][9] ];
    
    form.addGridItem()
    .setTitle("What scale is used in the display to answer the following questions?")
    .setRows(questions)
    .setColumns(choices)
    .setRequired(true); 
  }   
  
  return(form);
}

function createFormWithBacking(){
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
  
  return(form);
}