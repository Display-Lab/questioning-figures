// Default constants
var CHOICES_EXMPL = ["Choice A","Choice B","Choice C","Choice D","Choice E"];
var QUESTION_EXMPL = ["Question 1", "Question 2", "Question 3"];
var HEADERS = ["img_name", "img_id", "img_url", "img_desc", "Q1", "choices 1","Q2","choices 2"];

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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  
  var data =[];
  var start_row = last_row - num_rows + 1;
  var start_col = 5;
  var rng = sheet.getRange(start_row, start_col, num_rows, 6);
  
  for(var r = 0; r < num_rows; r++){
    var row_data = [];
    for( var q = 0; q < QUESTION_EXMPL.length; q++ ){
      row_data.push(QUESTION_ROWS[q]);
      row_data.push(CHOICES_EXMPL.toString());
    }
    data.push(row_data);
  }
  
  rng.setValues(data);
}
