/*
 * PublisherService
 * inpaas.devpublisher.service.publisher
 * 
 */ 
/*global require*/
/*globals scriptContext */
/*eslint-env nashorn */
(function(scope) {
	'use strict';
	
	var dao = require("inpaas.devpublisher.dao.publisher");
	
	function _list() {
		return dao.listAll();
	} 
	
	function _get(key, remoteId) {
		return dao.get(key, remoteId);
	}
	
	function _set(app) {
		dao.updateApp(app);
	}

	function _release(data) {
		var app = _get(data["key"], data["remoteId"]);
		if(app == null) throw "error.publisher.appnotfound";
		
		if (!/^[0-9]+?\.[0-9]+?\.[0-9]+?$/g.test(data["version"]))
			throw "error.release.invalidversion";
		
		if(data.modules != null) {
			_set({
				id: app.id,
				modules: data.modules
			});
		}

		new (Java.type("br.com.inpaas.app.packer.PackageManagerBusinessDelegate"))(scriptContext).publishApplication(app.id, data["version"], data["changelog"]);
	}
	
	scope["list"] = _list;
	scope["get"] = _get;
	scope["set"] = _set;
	scope["release"] = _release;

	/*global module:false*/
  	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
		module.exports = scope;
    }

	return scope;
	
})({ });