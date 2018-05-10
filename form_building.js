function makeForm() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  
  var form = createFormWithBacking(); 
  var values = sheet.getSheetValues(1, 1,
    sheet.getLastRow(), sheet.getLastColumn());
  
  var populated_form = populateFormWithValues(form, values);
}

function populateFormWithValues(form, values){
  var img_id_col = 1;
  
  for(row = 0; row < values.length; row++){
    var img = DriveApp.getFileById(values[row][img_id_col]);
    form.addPageBreakItem()
    .setTitle(img.getName());
    
    form.addImageItem()
      .setImage(img.getBlob())
      .setTitle(values[row][0])
      .setAlignment(FormApp.Alignment.CENTER);
    
    // Select every other value for Q's and Choices
    var questions = [];
    var choices = [];
    for( i = 0; i < values.length; i=i+2 ){ questions.push(values[row][i]); }
    for( i = 1; i < values.length; i=i+2 ){ choices.push(values[row][i]); }

    // Filter out empties
    questions = questions.filter(is_truthy);
    choices = choices.filter(is_truthy);
    
    // Bail if questions and choices don't line up
    if(questions.length !== choices.length){
      throw new Error("Number of choices sets and number of questions don't match.");
    }
    
    form.addGridItem()
    .setTitle("What scale is used in the display to answer the following questions?")
    .setRows(questions)
    .setColumns(choices)
    .setRequired(true); 
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
