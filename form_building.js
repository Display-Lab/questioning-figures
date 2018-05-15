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

function addImageToFormByID(form, img_id, title){
  var img = DriveApp.getFileById(img_id);
  
  form.addImageItem()
    .setImage(img.getBlob())
    .setTitle(title)
    .setAlignment(FormApp.Alignment.CENTER);
  return(form)
}

function addImageQuestionsToForm(form, row_vals){

    // Select every other value for Q's and Choices
    var questions = [];
    var choices = [];

    for( i = QUESTION_START_COL; i <= row_vals.length; i=i+2 ){
      questions.push(row_vals[i]);
    }
    for( i = CHOICE_START_COL; i <= row_vals.length; i=i+2 ){ 
      choices.push(row_vals[i]); 
    }

    // Filter out empties

    questions = questions.filter(isTruthy);
    choices = choices.filter(isTruthy);
    
    // Bail if questions and choices don't line up
    if(questions.length !== choices.length){
      var msg = "Number of choices sets and number of questions don't match."
      msg = msg + "\n" + questions + "\n" + choices;
      throw new Error(msg);
    }

    for( i=0; i< questions.length; i++){
      form.addCheckboxItem()
        .setTitle(questions[i])
        .setChoiceValues(choices[i].split(";"))
        .setRequired(true); 
    }
}

function populateFormWithValues(form, values){
  for(row = 0; row < values.length; row++){
    var img_id = values[row][IMG_ID_COL];
    var img_name = values[row][IMG_NAME_COL];

    if(isTruthy(img_id)){
      form.addPageBreakItem().setTitle(img_name);
      addImageToFormByID(form, img_id, img_name);
      addImageQuestionsToForm(form, values[row]);
    }
  }   
  return(form);
}

function isTruthy(x){return Boolean(x);}

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
