/**
 * Auto-generated comment stub
 *
  * @inpaas.key inpaas.devstudio.dynaform.studio
 * @inpaas.name StudioFormImpl
 * @inpaas.version 0.21
 * @inpaas.type patterntype.form
 * @inpaas.engine Nashorn
 * @inpaas.anonymous false
 * @inpaas.final false
*/

(function(){
    var TO = Java.type("br.com.inpaas.fw.model.TO");

    var ValidatorException = Java.type("br.com.inpaas.entity.validator.ValidatorException");
  	var FormBusinessDelegate = Java.type("br.com.inpaas.forms.businessdelegate.FormBusinessDelegate");
  
    var DynaFormBusinessDelegate = Java.extend(Java.type("br.com.inpaas.forms.businessdelegate.DynaFormBusinessDelegate")); 

    var instance = new DynaFormBusinessDelegate(scriptContext, form) {
    	get: function(id) {
			
			var app = require("inpaas.core.entity.dao").getDao("CORE_APPLICATION").filter("id_formulario").equalsTo(id).find("SELECT CORE_APPLICATION.DS_KEY, CORE_APPLICATION.DO_DEVELOPER FROM CORE_APPLICATION INNER JOIN CORE_MODULE ON (CORE_MODULE.ID_APPLICATION = CORE_APPLICATION.ID_APPLICATION) INNER JOIN FORMULARIO ON (FORMULARIO.ID_MODULE = CORE_MODULE.ID_MODULE) WHERE ID_FORMULARIO = #id_formulario# ").first();

			if (app.do_developer != "Y") {
				// return null;
				
				var PermissionException = Java.type("br.com.inpaas.businessdelegate.exception.PermissionException");
				
				throw new PermissionException("error.permission.design.denied");
			}
    		
    		return _super.get(id);
    	},
        delete : function(id) {
			var formBd = new FormBusinessDelegate(scriptContext);
			formBd.delete(id);
        },
        afterSet: function(data){
        	
          
          try{
            	logging.error("StudioFormImpl::afterSet::scriptContext: " + scriptContext);  
          		var PackageManagerBusinessDelegate = Java.type("br.com.inpaas.app.packer.PackageManagerBusinessDelegate");
                var packageManagerBd = new PackageManagerBusinessDelegate(scriptContext);  
                var fileData = packageManagerBd.getPackageFile(data.id_formulario, "FORM" ); 

                var data = require("inpaas.http.client").
                post("http://localhost:8181/event-procucer/source-control/push", {
                    "fileName": fileData.name,
                    "sourceType": "SOURCE",
                    "fileContent": fileData.getDataAsString(),
                    "comment": "Comentário",
                    "adminUsername": "hermeswaldemarin",
                    "adminPassword": "hwnwal@830504",
                    "gitRepo": "https://github.com/hermeswaldemarin/inpaas.gitintegration.git",
                    "authorName": data.updatedBy,
                    "authorEmail": "hermes@touchpoints.com",
                    "branchName" : "master"
                });  
          }catch(e){
            logging.error("StudioFormImpl::afterSet::error", e);  
          }
          
           
          
          return _super.get(id);
        }
    };

    var _super = Java.super(instance);

    return instance;
})();