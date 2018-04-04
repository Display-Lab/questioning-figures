/**
 * IMPORTANT: Set the Script property PICKER_KEY with the API key obtained
 * from the Google Developers Console.
 *
 * File > Project properties > Script properties
 */

function pickerKey() {
  var key = PropertiesService.getScriptProperties().getProperty("PICKER_KEY");
  return(key);
}
