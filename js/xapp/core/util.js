/**
 * 工具包
 * @version 1.0.0
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 * *
 */
define(function (require, exports, module) {
	if (!window.console)
		window.console = {
			log: function () { },
			error: function () { },
			info: function () { },
			warn: function () { },
			debug: function () { }
		};
	// 类型判断方法 构造工厂
	function isType(type) {
		return function (obj) {
			return {}.toString.call(obj) == "[object " + type + "]";
		}
	};
	exports.isType = isType;

	var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
	var baseElement = head.getElementsByTagName("base")[0];
	exports.isString = isType("String");
	exports.isFunction = isType("Function");
	exports.isObject = isType("Object");
	exports.isBoolean = isType("Boolean");
	exports.isNumber = isType("Number");
	exports.isArray = Array.isArray || isType("Array");
	exports.loadScript = function (url, fn) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		if (typeof (fn) != "undefined") {
			if (script.readyState) {
				script.onreadystatechange = function () {
					if (script.readyState == "loaded" || script.readyState == "complete") {
						script.onreadystatechange = null; if (isFunction(fn)) fn();
					}
				};
			} else {
				script.onload = function () {
					if (isFunction(fn)) fn();
					if (!config.debug) head.removeChild(script);
				};
				script.onerror = function () { throw new Error('Failed to load the file"' + url + '"!'); }
			}
		};
		script.src = url;
		addingScript = script;
		baseElement ? head.insertBefore(script, baseElement) : head.appendChild(script);
		addingScript = null;
	};

	exports.isUrl = function (url) {
		var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
			+ "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" // ftp的user@
			+ "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
			+ "|" // 允许IP和DOMAIN（域名）
			+ "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
			+ "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
			+ "[a-z]{2,6})" // first level domain- .com or .museum
			+ "(:[0-9]{1,4})?" // 端口- :80
			+ "((/?)|" // a slash isn't required if there is no file name
			+ "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
		var re = new RegExp(strRegex);
		if (url) return re.test(url);
		else return false;
	}
	/**
	 * ajaxGet 避免过分依赖第三方框架，如jquery
	 */
	exports.ajaxGet = function (opts) {
		if (exports.isObject(opts)) {
			var xhr = new XMLHttpRequest(),
				resTxt, json,
				dataType = opts['dataType'],
				url = opts['url'],
				error = opts['error'] || function () { },
				success = opts['success'] || function () { },
				data = opts['data'] || {};
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4 && xhr.status == 200) {
					resTxt = xhr.responseText;
					if (dataType == 'json') {
						try {
							json = eval('(' + resTxt + ')');
						} catch (e) {
							if (exports.isFunction(error)) error(xhr, resTxt, e);
						}
					} else json = resTxt;
					if (exports.isFunction(success)) success(json);
				}
			};

			for (var i in data) {
				var qMark = (url.indexOf('?') > -1);
				url += (qMark ? '&' : '?') + i + '=' + encodeURIComponent(data[i]);
			}
			xhr.open('get', url, true);
			xhr.send();
		}
	}

	exports.getCurrentScriptUrl = function () {
		if (addingScript) {
			return addingScript.src;
		}
		if (document.currentScript) {
			return document.currentScript.src;
		}
		return null;
	}
	exports.getFuncName = function (fn) {
		fn = fn || function () { };
		var re = /function\s*(\w*)/ig;
		var matches = re.exec(fn.toString());
		var fnName = matches[1] || '(anonymous)';
		return fnName;
	};
	exports.getAbsoluteUrl = function (url) {
		if (url.indexOf('http://') >= 0 || url.indexOf('https://') >= 0) {
			return url;
		} else if (url.indexOf('/') >= 0) {
			return location.protocol + '//' + location.host + (location.port ? ':' + location.port : '') + url;
		} else {
			return location.protocol + '//' + location.host + (location.port ? ':' + location.port : '') + '/' + location.pathname + '/' + url;
		}
	}

	function HashTable() {
		this.size = 0;
		this.entry = new Object();
		return this;
	}
	var T = HashTable.prototype;
	T.add = function (key, value) { if (!this.containsKey(key)) { this.size++; } this.entry[key] = value; }
	T.getValue = function (key) { return this.containsKey(key) ? this.entry[key] : null; }
	T.remove = function (key) { if (this.containsKey(key)) { var item = this.entry[key]; if (delete this.entry[key]) { this.size--; } return item; } else return null; }
	T.containsKey = function (key) { return this.entry.hasOwnProperty(key); }
	T.getValues = function () { var values = new Array(); for (var prop in this.entry) { values.push(this.entry[prop]); } return values; }
	T.getKeys = function () { var keys = new Array(); for (var prop in this.entry) { keys.push(prop); } return keys; }
	T.getSize = function () { return this.size; }
	T.clear = function () { this.size = 0; this.entry = new Object(); }
	exports.createHashTable = function () {
		return new HashTable();
	}
	exports.trim=function(str,s){		
		if(s){
			var index = str.indexOf(s);
			if(index == 0) str = str.substr(s.length);
			index = str.lastIndexOf(s);
			if(index + s.length == str.length) str = str.substr(0,index);
			return str;
		}
		return str.replace(/^\s+|\s+$/gm,'');
	}

	exports.hasMethod = function (comp, method) {
		var obj = comp;
		do {
			if (exports.isFunction(obj[method])) return true;
			obj = obj.__proto__;
		} while (typeof (obj) != "undefined" && obj != null);
		return false;
	}
	exports.getMethod = function (comp, name) {
		var method = null;
		var obj = comp;
		do {
			if (exports.isFunction(obj[name])) { method = obj[name]; break; }
			obj = obj.__proto__;
		} while (typeof (obj) != "undefined" && obj != null);
		if (method == null) throw new Error("The '" + name + "' is not a method of the object '" + comp.getName() + "'.");
		else return method;
	}
	exports.routeBack = function () { window.history.go(-1); }

	exports.createNewTagId = function (doc, ids) {
		if (exports.isString(ids)) {
			var id = ids;
			var newId = generateTagId();
			var tag = doc.getElementById(id);
			if (tag) tag.setAttribute('id', newId);
			return newId;
		} else {
			var arr = [];
			for (var j in ids) { arr[j] = exports.createNewTagId(doc, ids[j]); }
			return arr;
		}
	};
	
	var _tid = 0;function generateTagId() { return config.tagIdPrefix + (++_tid); }
	
	exports.copy = function(des, src){
		for (var prop in src) { 
			if(prop.indexOf("_")>=0 && des.hasOwnProperty(prop)) continue;
			des[prop] = src[prop]; 
		}
		return des;
	}

	return exports;
});
