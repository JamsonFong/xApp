/**
 * Action Module
 * @version 1.0.0
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018~2019 www.jamson.cn. All rights reserved.
 * *
 */
define(function (require, exports, module) {
	var U = require('./util'),
		Class = require('./class'),
		E = require('./events');
	var Action = Class.newClass({
		_calssName : "Action",
		_constructor: function(fn, params) {
			this.params = params;
			this.interceptors = [];
			this.fnExecute = U.isFunction(fn) ? fn : function () { };
		},
		/**
		 * 运行当前Action实例
		 */
		run : function (comp, action) {
			if (comp instanceof Action.Component) {
				if (comp.hasMethod(action)) return;
				E.createEvent(comp)
					.next("onCheckSession")
					.next(function(){return action;})
					.next("onCheckPermision")
					.next(function () {
						var method = comp.getMethod(action);
						method.call(comp);
					})
					.run();
			} else {
				throw new Error("The comp should be a Component!");
			}
		}
	});

	

	return Action;
});