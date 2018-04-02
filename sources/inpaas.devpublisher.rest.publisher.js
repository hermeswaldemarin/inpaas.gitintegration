/*
 * publisher
 * inpaas.devpublisher.rest.publisher
 * 
 */ 
/*global require*/
/*global RESTService*/
/*eslint-env nashorn */
(function() {
	'use strict';
	
	function _listApps() {
		return require("inpaas.devpublisher.service.publisher").list();
	}
	
	function _getApp(data) {
		return require("inpaas.devpublisher.service.publisher").get(data["key"], data["remoteId"]);
	}
	
	function _setApp(data) {
		require("inpaas.devpublisher.service.publisher").set(data);
		
		return _getSuccessResponse("message.save.success", arguments);
	}
	
	function _releaseApp(data) {
		require("inpaas.devpublisher.service.publisher").release(data);
		
		return _getSuccessResponse("message.publisher.released", arguments);
	}
	
	function _getSuccessResponse(message, args) {
		var translated = require("inpaas.core.l10n").translate(message);
		return Java.asJSONCompatible({ message: translated, handledAt: new java.util.Date(), args: args});
	}

	RESTService.addEndpoint({ name: "listApps", method: "GET", path: "/apps" }, _listApps);
	RESTService.addEndpoint({ name: "getApp", method: "GET", path: "/apps/{key}" }, _getApp);
	RESTService.addEndpoint({ name: "setApp", method: "PUT", path: "/apps/{key}" }, _setApp);
	RESTService.addEndpoint({ name: "releaseApp", method: "POST", path: "/apps/{key}/release" }, _releaseApp);
	
})();