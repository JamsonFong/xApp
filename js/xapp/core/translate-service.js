/**
 * 语言管理模块 负责加载以及翻译模板语言。
 * 
 * @version 1.0.0
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 * *
 */
define(function (require, exports, module) {
	var Class = require('./class');
	var TranslateService = Class.newClass({
			_className: "TranslateService",
			_constructor : function(options) {	
				if(options) {	
					this.dir = options.dir;
					this.lang = options.lang || navigator.language || navigator.userLanguage;
				}
				this.dir = this.dir || 'assets/i18n';
				this.lang = this.lang || 'en';
			},
			use : function use(ln, callback) {
				var t = this;
				if(ln == this.ln){ 
					if (callback) callback(this.language);
				}else {
					require.async(this.dir + '/' + ln, function (l) {
						t.ln = ln;
						if (l) t.language = l;
						if (callback) callback(l);
					});
				}
			},
			translate : function (key) {
				var txt = this.language ? this.language[key] : '';
				return txt ? txt : '';
			}
		});
	
	var _default = new TranslateService();
	TranslateService.setInstance = function (translator) {
		_default = translator;
	}
	TranslateService.getInstance = function () {
		return _default;
	}
	return TranslateService;
});