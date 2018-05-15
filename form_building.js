// Constants for 2d value array access.
var IMG_NAME_COL = 0;
var IMG_ID_COL = 1;
var QUESTION_START_COL = 4;
var CHOICE_START_COL = 5;

function makeForm() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  
  var form = createFormWithBacking(); 
  var values = sheet.getSheetValues(2, 1,
    sheet.getLastRow(), sheet.getLastColumn());
  
  var populated_form = populateFormWithValues(form, values);
}

function populateFormWithValues(form, values){
  
  for(row = 0; row < values.length; row++){
    var img = DriveApp.getFileById(values[row][IMG_ID_COL]);
    form.addPageBreakItem()
    .setTitle(img.getName());
    
    form.addImageItem()
      .setImage(img.getBlob())
      .setTitle(values[row][IMG_NAME_COL])
      .setAlignment(FormApp.Alignment.CENTER);
    
    var questions = [];
    var choices = [];

    // Populate Questsions and Choices
    //   The spacing is every other column.
    for( i = QUESTION_START_COL; i <= values[row].length; i=i+2 ){
      questions.push(values[row][i]);
    }
    for( i = CHOICE_START_COL; i <= values[row].length; i=i+2 ){ 
      questions.push(values[row][i]);
    }

    // Filter out empties
    questions = questions.filter(is_truthy);
    choices = choices.filter(is_truthy);
    
    // Bail if questions and choices don't line up
    if(questions.length !== choices.length){
      var msg = "Number of choices sets and number of questions don't match."
      msg = msg + " # Q's:" + questions.length + " # C's:" + choices.length;
      throw new Error(msg);
    }

    for( i=0; i< questions.length; i++){
      form.addCheckboxItem()
        .setTitle(questions[i])
        .setChoiceValues(choices[i].split(";"))
        .setRequired(true); 
    }
  }   
  
  return(form);
}

function is_truthy(x){return Boolean(x);}

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
