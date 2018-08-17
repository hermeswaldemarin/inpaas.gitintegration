/**
 * Auto-generated comment stub
 *
  * @inpaas.key inpaas.devstudio.dao.source
 * @inpaas.name SourceDao
 * @inpaas.type patterntype.businessdelegate
 * @inpaas.engine Nashorn
 * @inpaas.anonymous false
*/

/*
 * SourceDao
 * inpaas.devstudio.dao.source
 *
 * @author jvarandas  
 */ 
(function(scope) {
 
  var bd = require("inpaas.core.entity.dao");
  var sourceControlDao = require("inpaas.sourcecontrol.dao.sourcecontrol"); 
 
  function encode(data, complete) { 
    if (data == null) throw "error.script.notfound";

    var t = {};
    t.id = data["id_pattern"]; 
    t.key = data["ds_key"];
    t.name = data["ds_patternname"]; 
    t.type = data["id_patterntype"];
    t.module = data["id_module"];
    t.final = "Y" == data["do_finalversion"];
    
    if (complete) {
      // this.db = data;
      t.code = data["tx_patternsource"] + '\r\n\r\n';
      t.anon = ("Y" == data["do_allowanon"]);

      t.createdAt = data["dt_created"] ? data["dt_created"].getTime() : null;
      t.lastUpdated = data["dt_updated"] ? data["dt_updated"].getTime() : null;
      
      t.version = data["ds_recordthumbprint"];

      var user = bd.getDao("CORE_USER").findByPrimaryKey(data["id_userupdated"] || data["id_usercreated"] || 1);
      t.updatedBy = user ? user.ds_users : "Unknown";
    }

    return t;
  }

  function decode(o) {
    var d = {};

    d["id_pattern"] = o.id;
    d["ds_key"] = o.key;
    d["ds_patternname"] = o.name;
    d["id_patterntype"] = o.type;
    d["tx_patternsource"] = o.code.trim();
    d["do_allowanon"] = o.anon ? "Y" : "N";
    d["do_finalversion"] = o.final ? "Y" : "N"; 

    if (o.module != null)
      d["id_module"] = o.module;

    return d;
  }


  function fn_find_source(moduleId) {
    var sourcePackages = {};
    var sources = [];

    var sourceList = bd.getDao("CORE_PATTERN").filter({ "id_module": moduleId }).find("devstudio.query.source.bymodule");
    sourceList.forEach(function(data) {
      var s = encode(data);
      var spkg = s.key.substring(0, s.key.lastIndexOf("\."));

      if (!sourcePackages[spkg]) 
        sourcePackages[spkg] = [];

      sourcePackages[spkg].push(s);
    });

    return sourcePackages;
  }

  function fn_get_source(sourceId) {
    var sourceData; 

    if (!isNaN(sourceId)) { 
      sourceData = bd.getDao("CORE_PATTERN").findByPrimaryKey(sourceId);
    } else {
      sourceData = bd.getDao("CORE_PATTERN").findByUniqueKey(sourceId);
    }

    if (sourceData == null) return null;

    var app = bd.getDao("CORE_APPLICATION").filter("id_pattern").equalsTo(sourceId).find("SELECT CORE_APPLICATION.DS_KEY, CORE_APPLICATION.DO_DEVELOPER FROM CORE_APPLICATION INNER JOIN CORE_MODULE ON (CORE_MODULE.ID_APPLICATION = CORE_APPLICATION.ID_APPLICATION) INNER JOIN CORE_PATTERN ON (CORE_PATTERN.ID_MODULE = CORE_MODULE.ID_MODULE) WHERE ID_PATTERN = #id_pattern# ").first();
    if (app.do_developer != "Y") {
      // var PermissionException = Java.type("br.com.inpaas.businessdelegate.exception.PermissionException");
      return { 
        "error": "error.permission.design.denied"
      };
    }        

    return encode(sourceData, true);
  } 

  function fn_set_source(id, object) {
    if (isNaN(id)) throw "error.invalidid";
    var data = decode(object);

    var c = fn_get_source(id); 
    if (c == null) throw "error.notfound";

    if (object.version != c.version) throw "error.version.concurrentupdate"; 

    var nextVersion = Number(c.version.substring(c.version.indexOf(".") + 1)) + 1;
    data["nr_minorversion"] = nextVersion.toString();

    var r = bd.getDao("CORE_PATTERN").update(data);
    if (r == 0) throw "error.notfound";

    sourceControlDao.sendSourceToSourceControl(data.id_pattern, "", data.id_module);
    
    var source = fn_get_source(id);
    delete source["code"];

    try {
      Java.type("br.com.inpaas.scripting.cache.ScriptSourceCache").getInstance().expire(source.key);
    } catch(e) {
      // logging.error("Error at Source Cache: {}", e);
    }

    return source;  
  }  

  function fn_remove_source(id) {
    if (isNaN(id)) throw "error.invalidid";

    var c = fn_get_source(id);
    if (c == null) throw "error.notfound";

    var r = bd.getDao("CORE_PATTERN").delete(id);
    if (r == 0) throw "error.notfound";

    return {
      "message": require("inpaas.core.l10n").translate("message.dynaform.delete.success"),
      "id": id          
    };


  }


  function fn_create_source(object) {
    if (object["module"] == null) throw "error.module.notfound";
    if (object["code"] == null) {

      var c= "/*";
      c += "\n * " + object["name"];
      c += "\n * " + object["key"];
      c += "\n * ";
      c += "\n */\n";

      var templateKey = 'inpaas.devstudio.templates.businessdelegate';
      if (object["type"] == 1) 
        templateKey = 'inpaas.devstudio.templates.restservice';
      
      var templateData = require('inpaas.core.entity.dao')
        .getDao('CORE_PATTERN')
        .filter('ds_key').equalsTo(templateKey)
        .find('SELECT TX_PATTERNSOURCE as "code" FROM CORE_PATTERN WHERE DS_KEY = #ds_key#')
        .first();
      
      if (templateData) {
        c += templateData.code;
      }
  
      c = c.replace(/#source_key#/g, object["key"]);
      
      object["code"] = c;
    }

    var data = decode(object);

    data["id_patternengine"] = 1;
    data["id_module"] = object["module"];

    var r = bd.getDao("CORE_PATTERN").insert(data);
    if (r == 0) throw "error.notfound";

    sourceControlDao.sendSourceToSourceControl(data.id_pattern, "", data.id_module);
    
    return fn_get_source(data["id_pattern"]);
  }    

  function fn_find_validators() {
    var sources = [];
    bd.getDao("CORE_PATTERN").filter({ "id_patterntype": 5 }).sort({ "ds_patternname": 1 }).find().forEach(function(d) {
      sources.push({
        "id": d.id_pattern,
        "name": d.ds_patternname,
        "key": d.ds_key
      });

    });

    return Java.asJSONCompatible(sources);

  }

  function findByText(text, modules) {
    bd.getDao("CORE_PATTERN").filter("ds_key").like("%"+text+"%").or("ds_patternname").like("%"+text+"%").fetch(function(data) {

      var s = encode(data);

      var spkg = s.module;            
      if (!modules[spkg]) return;

      if (!modules[spkg].sources) modules[spkg].sources = [];

      modules[spkg].sources.push(s);
    });      
  }

  function fn_find_history(id) {
    var current = fn_get_source(id);
    if (current == null) return;

    var EntityAudit = Java.type("br.com.inpaas.entity.trace.EntityAudit");

    var history = new EntityAudit(scriptContext).findDataTrace({
      "entity": "CORE_PATTERN",
      "id": id
    }, 1, 100);

    var v = current.code;
    var list = [];
    for(var i = 0; i < history.list.length; i++) {
      var hist = history.list[i];
      var code = hist.data['core_pattern.tx_patternsource'] || hist.data['tx_patternsource'];
      var module = hist.data['id_module'] ||  hist.data['core_pattern.id_module'];
      if (code == v) continue;

      list.push({
        'date': hist.timestamp,
        'user': hist.user.name,
        'code': code,
        'module': module
      });
      
      v = code;
    }
    
    history.list = Java.asJSONCompatible(list);

    return history;

  }

  scope["findByText"] = findByText;
  scope["find"] = fn_find_source;
  scope["get"] = fn_get_source;
  scope["set"] = fn_set_source;
  scope["create"] = fn_create_source;
  scope["remove"] = fn_remove_source;

  scope["history"] = fn_find_history;

  scope["findEntityValidators"] = fn_find_validators;


  // export (require, amd, nashorn-load, ECMA)
  if (typeof module !== undefined && typeof module.exports !== undefined){
    module.exports = scope;
  }

  return scope;

  
})({ });