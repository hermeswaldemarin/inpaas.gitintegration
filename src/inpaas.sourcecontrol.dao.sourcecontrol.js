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
  var ModuleBusinessDelegate = Java.type("br.com.inpaas.businessdelegate.ModuleBusinessDelegate");
  var PackageTypes = Java.type("br.com.inpaas.app.pkgs.PackageTypes");
  var Charset = Java.type('br.com.inpaas.fw.string.Charset');


  var moduleBd = new ModuleBusinessDelegate(scriptContext);
  var logger = require("inpaas.core.log").withLogger("inpaas.sourcecontrol.dao.sourcecontrol");


  function fn_insert_sc(objectId, type, comment, moduleId) {


    var module = moduleBd.get(moduleId);
    
    var fileContent = null;
    var fileName = '';
    var packageType = null;
      
    
    if(type === 'ZIP'){
      var packageData = require("inpaas.devstudio.publisher.release").download(objectId);
      fileContent = packageData.data;
      fileName = packageData.name;   
    }else{
      
      if(type === 'SOURCE'){
        packageType = PackageTypes.SOURCE_CODE;
      }else if(type === 'FORM'){
        packageType = PackageTypes.FORM;    
      }

      var returnedObject = packageType.getPacker(scriptContext).pack(module, objectId);
      var file = packageType.getMarshaller().apply(returnedObject);
      var name = packageType.getFileName(returnedObject);
      var group = packageType.getGroup();

      if(group != null) {
        fileName += group + "/" + name;
      } else {
        fileName += name;
      }

      fileContent = PackageTypes.getDataAsString(file);

      logger.warn(" return file {} {}", fileContent, fileName);   
    }

    var config = require("inpaas.core.entity.dao").getDao("SC_CONFIG").findByPrimaryKey(1);

    logger.warn(" config return {}", config);


    if(!config || !config.DS_GITREPO || !config.DS_BRANCHNAME)
      throw require("inpaas.core.l10n").translate("label.sourcecontrol.config.invalid");

    if(!comment || comment === '')
      comment = "Code Changed by Developer Studio";

    var sc = {

      "DS_FILENAME": fileName,
      "DO_SOURCETYPE": type,
      "DS_FILECONTENT": fileContent,
      "DS_GITREPO": config.DS_GITREPO,
      "DS_AUTHORNAME": scriptContext.getUserInfo().getUserName(),
      "DS_AUTHOREMAIL": scriptContext.getUserInfo().getUserEmail(),
      "DS_BRANCHNAME": config.DS_BRANCHNAME,
      "DS_ENVIRONMENTNAME": "localhost",
      "DS_COMMENT": comment
    };

    // Invoke the insert method with that object
    var rows = require("inpaas.core.entity.dao").getDao("SC_SOURCECONTROL").insert(sc);

    return null;
  }

  function sendFormToSourceControl(objectId, comment, moduleId) {
    return fn_insert_sc(objectId, "FORM", comment, moduleId);
  }

  function sendSourceToSourceControl(objectId, comment, moduleId) {
    return fn_insert_sc(objectId, "SOURCE", comment, moduleId);
  }

  function sendZipToSourceControl(moduleId, comment) {
    return fn_insert_sc(moduleId, "ZIP", comment, moduleId);
  }



  function sendEntityToSourceControl(objectId, comment, moduleId) {
    logger.warn("save entity {}", objectId)

    return null;
  }

  /*public exports*/
  scope["sendFormToSourceControl"] = sendFormToSourceControl;
  scope["sendSourceToSourceControl"] = sendSourceToSourceControl;
  scope["sendEntityToSourceControl"] = sendEntityToSourceControl;
  scope["sendZipToSourceControl"] = sendZipToSourceControl;


  return scope;

})(typeof module !== "undefined" ? module.exports : this);