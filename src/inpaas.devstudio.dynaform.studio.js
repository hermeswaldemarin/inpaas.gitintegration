/**
 * Auto-generated comment stub
 *
  * @inpaas.key inpaas.devstudio.dynaform.studio
 * @inpaas.name StudioFormImpl
 * @inpaas.type patterntype.form
 * @inpaas.engine Nashorn
 * @inpaas.anonymous false
*/

(function(){
  var DynaFormBusinessDelegate = Java.extend(Java.type("br.com.inpaas.forms.businessdelegate.DynaFormBusinessDelegate")); 
  var sourceControlDao = require("inpaas.sourcecontrol.dao.sourcecontrol");
  var instance = new DynaFormBusinessDelegate(scriptContext, form) {
    'get': function(id) {

      var app = require("inpaas.core.entity.dao").getDao("CORE_APPLICATION").filter("id_formulario").equalsTo(id).find("SELECT CORE_APPLICATION.DS_KEY, CORE_APPLICATION.DO_DEVELOPER FROM CORE_APPLICATION INNER JOIN CORE_MODULE ON (CORE_MODULE.ID_APPLICATION = CORE_APPLICATION.ID_APPLICATION) INNER JOIN FORMULARIO ON (FORMULARIO.ID_MODULE = CORE_MODULE.ID_MODULE) WHERE ID_FORMULARIO = #id_formulario# ").first();
      if (app == null) return null;

      if (app.do_developer != "Y") { 
        var PermissionException = Java.type("br.com.inpaas.businessdelegate.exception.PermissionException");
        throw new PermissionException("error.permission.design.denied");
      }

      var data = _super.get(id);
      if (data['id_permission']) {
        var perm = require("inpaas.core.entity.dao").getDao("CORE_PERMISSION").findByPrimaryKey(data['id_permission']);
        
        data['id_permission'] = perm['ds_key'];
      }
      
      return data;
      
    },
    'delete' : function(id) {
      var FormBusinessDelegate = Java.type("br.com.inpaas.forms.businessdelegate.FormBusinessDelegate");
      var formBd = new FormBusinessDelegate(scriptContext);
      formBd.delete(id);
    },
    'beforeSet': function(data, id) {
      if (data['id_permission']) {
        var perm = require("inpaas.core.entity.dao").getDao("CORE_PERMISSION").findByUniqueKey(data['id_permission']);
        data['id_permission'] = perm['id_permission'];
      
      
      return data;
      // throw 'error.bla!';
    }
  },
        afterSet: function(data) {
          var formId = data['record-id'];
          sourceControlDao.sendFormToSourceControl(formId, "", data['id_module']);
          return data;
        }
  };

  var _super = Java.super(instance);
  return instance;
})();