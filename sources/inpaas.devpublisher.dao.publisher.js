/*
 * PublisherDao
 * inpaas.devpublisher.dao.publisher
 * 
 */ 
/*global require*/
/*global Java*/
(function(scope) {
	'use strict';
	
	function handle(originDS, destinyDS, fieldMap) {
		for(var key in fieldMap) {
			if(originDS[key] != null) {
				destinyDS[fieldMap[key]] = originDS[key];
			}
		}
	}
	
	function encodeApp(data) { 
		var result;
		
		if (data.getClass().getSimpleName() === "ResultList") {
			result = [];
			data.forEach(function(i) { result.push(encodeApp(i)); });
			
		} else {
			result = {};
			handle(data, result, {
	    		"id_appstore": "id",
	    		"ds_appkey": "key",
	    		"ds_appname": "name",
	    		"ds_remoteid": "remoteId",
			});
			
			// Contents
			if(data["core_appcontent"] != null) {
				var modules = [];
				
				data["core_appcontent"].forEach(function(i) { 
					modules.push(i["id_module"]);
				});
				
				result.modules = modules;
			}
			
			// Current Release
			if(data["current_core_apprelease"] != null) {
				result.currentRelease = encodeRelease(data["current_core_apprelease"]);
			}
			
			// Previous Releases
			if(data["core_apprelease"] != null) {
				var releases = [];
				data["core_apprelease"].forEach(function(i) {
					releases.push(encodeRelease(i));
				});
				result.releases = releases;
				
			}

		}

      	return Java.asJSONCompatible(result);
    }
    
    function decodeApp(data) {
    	if(data == null) return null;
    	
    	var result = {};
    	
    	handle(data, result, {
    		"id": "id_appstore",
    		"key": "ds_appkey",
    		"name": "ds_appname",
    		"remoteId": "ds_remoteid",
		});
		
		if(data["modules"] != null) {
			var modules = [];
			
			data["modules"].forEach(function(i) {
				var m = {
					id_appstore: data["id"],
					id_module: i
				}
				modules.push(m);
			});
			
			result["core_appcontent"] = modules;
		}
		
		return Java.asJSONCompatible(result);
	}
	
	function encodeRelease(data) {
		var result;
		if (data.getClass().getSimpleName() === "ResultList") {
			result = [];
			data.forEach(function(i) { result.push(encodeRelease(i)); });
			
		} else {
			result = {};
			handle(data, result, {
	    		"id_apprelease": "id",
	    		"ds_version": "version",
	    		"tx_comment": "changelog",
	    		"dt_created": "releasedAt",
			});
		
		}
		
		return Java.asJSONCompatible(result);
	}
	
	function decodeRelease(data) {
    	if(data == null) return null;
    	
		var result = {};
		handle(data, result, {
    		"id": "id_apprelease",
    		"appId": "id_appstore",
    		"version": "ds_version",
    		"changelog": "tx_comment",
		});
		
		Java.asJSONCompatible(result);
	}
	
	function _getDao(entity) {
		return require("inpaas.core.entity.dao").getDao(entity);
	}
	
	function _getAppDao() {
		return _getDao("CORE_APPSTORE");
	}
	
	function _getReleaseDao() {
		return _getDao("CORE_APPRELEASE");
	}
	
	function _getContentDao() {
		return _getDao("CORE_APPCONTENT");
	}
	
	function _listAll() {
		return encodeApp(_getAppDao().find());
	}

	function _get(key, remoteId) {
		var appData;
		
		if(isNaN(key)) {
			appData = _getAppDao().filter({ "ds_appkey": key, "ds_remoteid": remoteId }).find().first();
			
		} else {
			appData = _getAppDao().findByPrimaryKey(key);
			
		}
		
		if(appData == null) return null;
		
		appData["core_appcontent"] = _getContentDao().filter({ "id_appstore": appData["id_appstore"] }).find();		
		appData["core_apprelease"] = _getReleaseDao().filter({ "id_appstore": appData["id_appstore"] }).find();
		appData["current_core_apprelease"] = _getReleaseDao().filter({ "id_apprelease": appData["id_currentrelease"] }).find().first();
		
		return encodeApp(appData);
	}
	
	function _updateApp(app) {
		var appData = decodeApp(app);
		
		if(appData == null) throw "error.publisher.appisnull";
		if(appData["id_appstore"] == null && appData["ds_appkey"] == null) throw "error.publisher.appnotfound";
		
		if(appData["id_appstore"] == null && appData["ds_appkey"] != null) {
			var current = _get(appData["ds_appkey"]);
			appData["id_appstore"] = current.id;
		}
		
		var appContent = appData["core_appcontent"];
		appData["core_appcontent"] = null;
		
		_getAppDao().update(appData);
		
		if(appContent != null) {
			_getContentDao().filter({ "id_appstore": appData["id_appstore"] }).delete();
			
			for(var k in appContent) {
				var data = appContent[k];
				
				data["id_appstore"] = appData["id_appstore"];
				data["nr_sequence"] = k;
				_getContentDao().insert(data);
			
			}

			
			appContent.forEach(function(i) {
			});
		}

	}
	
	function _insertRelease(release) {
		_getReleaseDao().insert(decodeRelease(release));
	}	


	scope["listAll"] = _listAll;
	scope["get"] = _get;
	scope["updateApp"] = _updateApp;
	scope["insertRelease"] = _insertRelease;	

	/*global module*/
  	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
		module.exports = scope;
    }

	return scope;
	
})({ });