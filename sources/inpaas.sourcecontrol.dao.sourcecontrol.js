/**
 * Auto-generated comment stub
 *
  * @inpaas.key inpaas.sourcecontrol.dao.sourcecontrol
 * @inpaas.name SourceControlDao
 * @inpaas.type patterntype.businessdelegate
 * @inpaas.engine Nashorn
 * @inpaas.anonymous false
*/

/*
 * SourceControlDao
 * inpaas.sourcecontrol.dao.sourcecontrol
 * 
 */
(function SourceControlDao(scope) {
  'use strict';
  
  var PackageManagerBusinessDelegate = Java.type("br.com.inpaas.app.packer.PackageManagerBusinessDelegate");
  var packageManagerBd = new PackageManagerBusinessDelegate(scriptContext);
  var logger = require("inpaas.core.log").withLogger("inpaas.sourcecontrol.dao.sourcecontrol");
  
  
  function fn_insert_sc(objectId, type, comment) {
    
    var packageFile = packageManagerBd.getPackageFile(objectId, type);

    if(!comment || comment === '')
      comment = "Code Changed by Developer Studio";
    
    var sc = { 

      "DS_FILENAME": packageFile.getName(),
      "DO_SOURCETYPE": type,
      "DS_FILECONTENT": packageFile.getDataAsString(),
      "DS_GITREPO": "https://github.com/hermeswaldemarin/inpaas.gitintegration.git",
      "DS_AUTHORNAME": "usuariotestehermes",
      "DS_AUTHOREMAIL": "hermes@touchpoints.com",
      "DS_BRANCHNAME": "sourcecontrol",
      "DS_ENVIRONMENTNAME": "localhost",
      "DS_COMMENT": comment
    };
    
    logger.warn("teste {}", packageFile.getName())

    
    // Invoke the insert method with that object
    var rows = require("inpaas.core.entity.dao").getDao("SC_SOURCECONTROL").insert(sc);
    
    return null; 
  }
  
  function sendFormToSourceControl(objectId, comment) {
    return fn_insert_sc(objectId, "FORM", comment);
  }
  
  function sendSourceToSourceControl(objectId, comment) {
    return fn_insert_sc(objectId, "SOURCE", comment);
  }
  
  function sendEntityToSourceControl(objectId, comment) {
    logger.warn("save entity {}", objectId)
    
    return null;
  }
  
  /*public exports*/
  scope["sendFormToSourceControl"] = sendFormToSourceControl;
  scope["sendSourceToSourceControl"] = sendSourceToSourceControl;
  scope["sendEntityToSourceControl"] = sendEntityToSourceControl;
  
  return scope;

})(typeof module !== "undefined" ? module.exports : this);