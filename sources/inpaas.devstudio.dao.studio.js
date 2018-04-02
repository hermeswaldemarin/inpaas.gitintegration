/**
 * Auto-generated comment stub
 *
  * @inpaas.key inpaas.devstudio.dao.studio
 * @inpaas.name StudioDao
 * @inpaas.version 0.13
 * @inpaas.type patterntype.businessdelegate
 * @inpaas.engine Nashorn
 * @inpaas.anonymous false
 * @inpaas.final false
*/

/*
 * StudioDao
 * inpaas.devstudio.dao.studio
 *
 * @author jvarandas
 */
(function(scope) {
     
      
  	var bd = require("inpaas.core.entity.dao");
  	var l10n = require("inpaas.core.l10n");
    
  	function Source(data, complete) {
      	this.id = data["id_pattern"];
      	this.key = data["ds_key"];
      	this.name = data["ds_patternname"];
      	this.type = data["id_patterntype"];
      
      	if (complete) {
          	this.db = data;
          	this.sourceCode = data["tx_patternsource"];
          	this.allowAnon = ("Y" == data["do_allowanon "]);
          
          	this.createdAt = data["dt_created"];
          	this.lastUpdated = data["dt_updated"];
        }
      
      	return this;
    }
  
  	function LabelData(data) {
      	this.id = data["id_label"];
      	this.key = data["ds_key"];
      	this.value = data["ds_description"];

      	return this;
    }
  
  	function NotificationType(data) {
      	this.id = data["id_notificationtype"];
      	this.key = data["ds_key"];
      	this.name = data["ds_notificationtype"];
      	this.icon = data["ds_icon"]
      
      	return this;
    }
  
  	function UserGroup(data) {
      	this.id = data["id_usergroup"];
      	this.key = data["ds_key"];
      	this.name = data["ds_usergroup"];
      
      	return this;
    }  
  
  	function ScheduledTask(data) {
      	this.id = data["id_scheduler"];
      	this.key = data["ds_key"];
      	this.name = data["ds_scheduler"];
      
      	return this;
    }
  
  	function Mailing(data) {
      	this.id = data["id_mailing"];
      	this.key = data["ds_key"];
      	this.name = data["ds_mailing"];

      	return this;
    }
  
	function fn_find_sources(moduleId) {
      	var sourcePackages = {};
      	var sources = [];
      	
		var sourceList = bd.getDao("CORE_PATTERN").filter({ "id_module": moduleId }).find("devstudio.query.source.bymodule");
        sourceList.forEach(function(data) {
          	var s = new Source(data);
          	var spkg = s.key.substring(0, s.key.lastIndexOf("\."));
          	
          	if (!sourcePackages[spkg]) 
              	sourcePackages[spkg] = [];
          
          	sourcePackages[spkg].push(s);
        });
      
      	return sourcePackages;
    }
  
  	function fn_get_script(sourceId) {
      	var sourceData;
 
      	if (!isNaN(sourceId)) {
      		sourceData = bd.getDao("CORE_PATTERN").findByPrimaryKey(sourceId);
        } else {
          	sourceData = bd.getDao("CORE_PATTERN").findByUniqueKey(sourceId);
        }
       
      	return new Source(sourceData, true);
    }
 
  	function fn_get_script_source(sourceId) {
      	var sourceData;

      	if (!isNaN(sourceId)) {
      		sourceData = bd.getDao("CORE_PATTERN").findByPrimaryKey(sourceId);
        } else {
          	sourceData = bd.getDao("CORE_PATTERN").findByUniqueKey(sourceId);
        }
      
      	return sourceData["tx_patternsource"];
    }  
  
  	function fn_find_forms(moduleId) {
		var formPackages = {};
      	var formList = bd.getDao("FORMULARIO").filter({ "id_module": moduleId }).sort({ "ds_formulario": 1 }).find();
      
      	formList.forEach(function(data) {
          	var f = {
          		"id": data["id_formulario"],
          		"key": data["ds_key"],
          		"name": data["ds_formulario"],
          		"source": data["id_pattern"],
          		"type": "v1"
          	}
          	
          	var fpkg = f.key.substring(0, f.key.lastIndexOf("\."));
          	
          	if (!formPackages[fpkg]) 
              	formPackages[fpkg] = [];
          
          	formPackages[fpkg].push(f);
        });
        
        var formsV2 = bd.getDao("CORE_FORMV2").filter({ "id_module": moduleId }).find("SELECT id_formv2, ds_key, ds_labeltitle FROM CORE_FORMV2 WHERE ID_MODULE = #id_module# AND JSON_VALUE(TX_STRUCTURE, '$.include') IS NULL ORDER BY ds_key");
        
        formsV2.forEach(function(data) {
			var f = {
          		"id": data["id_formv2"],
          		"key": data["ds_key"],
          		"name": l10n.translate( data["ds_labeltitle"] ),
          		"type": "v2"
          	}
          	
          	var fpkg = f.key.substring(0, f.key.lastIndexOf("\."));
          	
          	if (!formPackages[fpkg]) 
              	formPackages[fpkg] = [];
          
          	formPackages[fpkg].push(f);
    	});
      
      	return formPackages;
    }
  
  	function fn_find_labels(moduleId) {
      
      	var labels = [];
      	
		var labelList = bd.getDao("CORE_LABEL").filter({ "id_module": moduleId }).find("devstudio.query.label.bymodule");
        labelList.forEach(function(data) {
          	labels.push(new LabelData(data));
        });
      
      	return labels;      	
    }
  
  	function fn_find_notifs(moduleId) {
      	var notifs = [];
      	
		var notifList = bd.getDao("CORE_NOTIFICATIONTYPE").filter({ "id_module": moduleId }).find("devstudio.query.notification.bymodule");
        notifList.forEach(function(data) {
          	notifs.push(new NotificationType(data));
        });
      
      	return notifs;         	 
    }
    
  	function fn_find_usergroups(moduleId) {
      	var userGroups = [];
      	
		var notifList = bd.getDao("CORE_USERGROUP").filter({ "id_module": moduleId }).find("devstudio.query.usergroup.bymodule");
        notifList.forEach(function(data) {
          	userGroups.push(new UserGroup(data));
        });
      
      	return userGroups;         	 
    }      	  

  	function fn_find_tasks(moduleId) {
      	var tasks = [];
      	
		var taskList = bd.getDao("CORE_SCHEDULER").filter({ "id_module": moduleId }).find("devstudio.query.task.bymodule");
        taskList.forEach(function(data) {
          	tasks.push(new ScheduledTask(data));
        });
      
      	return tasks;         	 
    }      	  
  
  	function fn_find_mailing(moduleId) {
      	var mailings = [];
      	
		var mailingList = bd.getDao("CORE_MAILING").filter({ "id_module": moduleId }).find("devstudio.query.mailing.bymodule");
        mailingList.forEach(function(data) {
          	mailings.push(new Mailing(data));
        });
      
      	return mailings;         	 
    }      	  
  
    
  	scope["findSources"] = fn_find_sources
    scope["get"] = fn_get_script
    scope["getSource"] = fn_get_script_source
    
  	scope["findForms"] = fn_find_forms
  	scope["findLabels"] = fn_find_labels
  	scope["findNotifications"] = fn_find_notifs
  	scope["findUserGroups"] = fn_find_usergroups
  	scope["findTasks"] = fn_find_tasks
  	scope["findMailing"] = fn_find_mailing

    // export (require, amd, nashorn-load, ECMA)
  	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
		module.exports = scope;
    }

	return scope;

  
  
  
})({ })