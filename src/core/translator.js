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
	var Translator = Class.newClass({
		_className: "Translator",
		_constructor: function (options) {
			if (options) {
				this.dir = options.dir;
				this.lang = options.lang || navigator.language || navigator.userLanguage;
			}
			this.dir = this.dir || 'assets/i18n';
			this.lang = this.lang || 'zh-CN';
		},
		use: function use(ln, callback) {
			var t = this;
			if (ln == this.ln) {
				if (callback) callback(this.language);
			} else {
				require.async(this.dir + '/' + ln, function (l) {
					t.ln = ln;
					if (l) t.language = l;
					t = null;
					if (callback) callback(l);
				});
			}
		},
		translate: function (key) {
			var txt = this.language ? this.language[key] : '';
			return txt ? txt : '';
		}
	});

	var _default = new Translator();
	Translator.setInstance = function (translator) {
		_default = translator;
	}
	Translator.getInstance = function () {
		return _default;
	}
	return Translator;
});