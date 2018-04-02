/*
 * StudioService
 * inpaas.devstudio.service.studio
 *
 * @author jvarandas
 */
(function(scope) {
	/*global require Java logging*/
  
	function fn_find_apps(validate) {
		return Java.asJSONCompatible(require("inpaas.devstudio.dao.application").findApps());
    }
    
    function fn_create_app(data) {
    	var application = {
    		title: data["name"],
    		key: data["key"],
    		version: "dev",
    		inactive: "N",
    		developer: "Y",
    		modules: [{
	          	title: data["name"] + " Main",
				key: data["key"] + ".main",
				menu: [{
					key: "menu." + data["key"],
		          	title: data["name"],
		          	icon: data["icon"] != null ? data["icon"] : "fa fa-cube"
		        }]
	        }]
		};
        
        var createdApp = require("inpaas.devstudio.dao.application").insertApp(application);

        if(data["package"] != null && data["package"].length > 0) {
        	var pkg = {
        		"name": "entity-model.xml",
        		"package": data["package"],
        		"module": createdApp.modules[0]["id"]
    		}
        	require("inpaas.devstudio.service.package").importPackage(pkg);
    	}

        
		return createdApp;
    }
    
    function fn_find_languages() {
		return Java.asJSONCompatible(require("inpaas.devstudio.dao.label").findLanguages());
    }
    
    function fn_find_formats() {
    	return Java.asJSONCompatible(require("inpaas.devstudio.dao.fieldformat").find());
    }
  
  	function fn_find_labels(moduleId, key, offset, limit) {
		return Java.asJSONCompatible(require("inpaas.devstudio.dao.label").find(moduleId, key, offset, limit));
    }

  	function fn_get_label(key) {
		return Java.asJSONCompatible(require("inpaas.devstudio.dao.label").get(key));
    }
    
    function fn_remove_label(id, moduleId) {
    	return Java.asJSONCompatible(require("inpaas.devstudio.dao.label").remove(id, moduleId));
	}


  	function fn_set_labels(labels) {
		return Java.asJSONCompatible(require("inpaas.devstudio.dao.label").set(labels));
    }


	function fn_get_module(moduleId) {
		var obj = require("inpaas.devstudio.dao.application").getModule(moduleId);
      	var studioDao = require("inpaas.devstudio.dao.studio");
      	var sourceDao = require("inpaas.devstudio.dao.source");
      	var templateDao = require("inpaas.devstudio.dao.template");
      	var entityService = require("inpaas.devstudio.service.entitymanagement");
		
      	obj["sources"] = sourceDao.find(moduleId);
      	obj["data-sources"] = entityService.map(moduleId);
      	obj["forms"] = studioDao.findForms(moduleId);
      	obj["templates"] = templateDao.find(moduleId);
      	
      	try {
      		// obj["http-services"] = require("inpaas.httpclient.service.client").find(moduleId);
  		} catch(e) {
			logging.info("Couldn't find the module http-services");
  		}
  
      	return Java.asJSONCompatible(obj);
    }
    
    function fn_create_module(data) {
    	var mod = {
          	title: data["name"],
			key: data["key"],
			menu: [{
				key: "menu." + data["key"],
	          	title: data["name"],
	          	icon: data["icon"] != null ? data["icon"] : "fa fa-cube"
	        }]
		};
        
        var createdModule = require("inpaas.devstudio.dao.application").insertModule(data["application"], mod);

        if(data["package"] != null && data["package"].length > 0) {
        	var pkg = {
        		"name": "entity-model.xml",
        		"package": data["package"],
        		"module": createdModule["id"]
    		}
        	require("inpaas.devstudio.service.package").importPackage(pkg);
    	}

        
		return createdModule;
    }
  
  	function fn_find_sources(params) {
		return require("inpaas.devstudio.dao.source").find(params);
    }
  
  	function fn_find_source_history(id) {
		return require("inpaas.devstudio.dao.source").history(id);      
    }

  	function fn_get_source(id) {
		return withMethods(require("inpaas.devstudio.dao.source").get(id));
    }

  	function fn_set_source(id, data) {
		var ret = withMethods(require("inpaas.devstudio.dao.source").set(id, data));
      
      	var PackageManagerBusinessDelegate = Java.type("br.com.inpaas.app.packer.PackageManagerBusinessDelegate");
        var packageManagerBd = new PackageManagerBusinessDelegate(scriptContext);      
      
      	var fileData = packageManagerBd.getPackageFile(id);          
        
  		logging.error("fn_set_source", fileData);
      	/*
      	var data = require("inpaas.http.client").
			post("http://localhost:8181/event-procucer/source-control/push", {
                "fileName": fileData.name,
                "sourceType": "SOURCE",
                "fileContent": fileData.data,
                "comment": "Comentário",
                "adminUsername": "hermeswaldemarin",
                "adminPassword": "hwnwal@830504",
                "gitRepo": "https://github.com/hermeswaldemarin/inpaas.gitintegration.git",
                "authorName": data.updatedBy,
                "authorEmail": "hermes@touchpoints.com",
                "branchName" : "master"
            });
      	
        */
      
      	return ret;

    }
    
    function fn_remove_source(id) {
		return require("inpaas.devstudio.dao.source").remove(id);

	}

    
    function withMethods(source) {
		try {
			if (source == null) return null; 
			
			if (source.type == 2) {
				var o = require(source.key);
				var methods = [];
				
				for(var k in o) {
					if (k.indexOf("_") === 0) continue;
				
					methods.push(k);
				}
				
				source.methods = methods;
			}	

		} catch(e) {
			source.methods = e;
		
		}    
		
		return Java.asJSONCompatible(source);
	}

  
  	function fn_create_source(data) {
		return Java.asJSONCompatible(require("inpaas.devstudio.dao.source").create(data));
    }
  
  	function fn_get_source_code(sourceId) {
		return require("inpaas.devstudio.dao.source").getCode(sourceId);
    }
    
    function getSettings(id) {
    	return require("inpaas.core.entity.dao").getModel("CORE_MODULE").encode(require("inpaas.core.entity.dao").getDao("CORE_MODULE").findByPrimaryKey(id));
	}

    function setSettings(id, settings) {
    	if (id == null) throw new Error("error.module.notfound");
    
    	var dbdata = require("inpaas.core.entity.dao").getModel("CORE_MODULE").decode(settings);
      
      	dbdata.id_module = id;
      	require("inpaas.core.entity.dao").getDao("CORE_MODULE").update(dbdata);
      
    	return null;
	}

	function fn_find_search(params) {
		var modules = {}, l10n = require("inpaas.core.l10n");
		
		require("inpaas.core.entity.dao").getDao("CORE_MODULE").fetch("SELECT ID_MODULE, DS_LABELKEY, DS_MODULE FROM CORE_MODULE WHERE EXISTS (SELECT 1 FROM CORE_APPLICATION WHERE ID_APPLICATION = CORE_MODULE.ID_APPLICATION AND DO_DEVELOPER = 'Y') ", function(data) {
		
			var id = data["id_module"] + "";
			modules[id] = {
				"title": l10n.translate(data["ds_labelkey"] || data["ds_module"])
			}
		
		});
 
		require("inpaas.devstudio.dao.source").findByText(params["text"], modules);
		require("inpaas.devstudio.dao.form").findByText(params["text"], modules);
		require("inpaas.devstudio.dao.formsv2").findByText(params["text"], modules);
		require("inpaas.devstudio.dao.template").findByText(params["text"], modules);		
		require("inpaas.devstudio.service.entitymanagement").findByText(params["text"], modules);		
		
		for(var k in modules) {
			if (Object.keys(modules[k]).length <= 1) delete modules[k];
			
			// modules[k].
		}
		
		return modules;
	}
     
    scope["findAnything"] = fn_find_search;
    
  	scope["findApps"] = fn_find_apps;
  	scope["createApp"] = fn_create_app;
  	
  	scope["findFormats"] = fn_find_formats;
  	scope["findLanguages"] = fn_find_languages;
    scope["findLabels"] = fn_find_labels;
    scope["getLabel"] = fn_get_label;
    scope["setLabels"] = fn_set_labels;
    scope["removeLabel"] = fn_remove_label;

  	scope["getModule"] = fn_get_module;
  	scope["createModule"] = fn_create_module;
    
    scope["findSources"] = fn_find_sources;
    scope["getSourceHistory"] = fn_find_source_history;
    scope["getSource"] = fn_get_source;
    scope["setSource"] = fn_set_source;
    scope["createSource"] = fn_create_source;
    scope["removeSource"] = fn_remove_source;
    
    scope["getSettings"] = getSettings;
    scope["setSettings"] = setSettings;
    
   	/*global module*/
  	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
		module.exports = scope;
    }

	return scope;

  
  
  
})({ })