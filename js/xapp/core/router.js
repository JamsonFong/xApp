/**
 * 路由模块
 * @version 1.0.0
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 * *
 */
define(function (require, exports, module) {
	var U = require('./util'),
		E = require('./events'),
		config = require('./config');
	var routers = U.createHashTable();
	function Router(c, options) {
		//所属UI组件
		this._component = c;
		this._currentRoute = null;
		this._index = -1;
		this._text = 
		//路由路径正则表达式
		
		this.routeReg = reg ? new RegExp(reg, "i") : /^(\/[-_a-zA-Z0-9]*)+(\?[-_a-zA-Z0-9]+=[-_a-zA-Z0-9]+)?(&[-_a-zA-Z0-9]+=[-_a-zA-Z0-9]+)*$/i;
		this.pos = pos;
		this.replacement = replacement;
	}
	var T = Router.prototype;
	T.getRegExp = function () { return this.routeReg; }
	T.getComponent = function () { return this._comoponent; }
	T.setComponent = function (c) { this._component = c; }
	T.hashchange = function (route) {
		var rThis = this;
		var container = this._component;
		if (route == this._currentRoute) return;
		this._currentRoute = route;
		E.createEvent(container)
			.next("onBeforeHashchange")
			.next(function (e) {
				e.pause();
				var i = 0;
				var routeParams = [];
				var realRoute = route.replace(/\/([0-9]*)\/$/g, function (match, id, offset) {
					var str = match;
					if (rThis.replacements.length > i) {
						str = rThis.replacements[i++];
						routeParams.push(id);
					}
					return str;
				});
				var jsPath = config.basePath + realRoute;
				require.async(jsPath, function (component) {
					if (component) {
						component.pushParams("routeParams", routeParams);
						container.loadChild(e, "hash", component);
					}
					e.resume();
				});
			})
			.then(function (e) {
				if (e.isCancelled()) { U.routeBack(); }
			})
			.then("onAfterHashchange").run();

	};
	//启用路由
	T.enable = function () {
		var route = location.hash.slice(1) || '/';
		if (route == '/') route = config.defaultPage;
		var lstRoute = route.split(';');
		if (!routers.containsKey(this._component.getId())) {
			if (routers.getSize() == 0) {
				window.addEventListener('hashchange', onHashchange, false);
			}
			routers.add(this._component.getId(), this);
			for (var i = 0; i < lstRoute.length; i++) {
				if (this._currentRoute != route && this.routeReg.test(lstRoute[i])) this.hashchange(lstRoute[i]);
			}
		}
	};
	//关闭路由
	T.disable = function () {
		routers.remove(this._component.getId());
		if (router.getSize() == 0) {
			window.removeEventListener('hashchange', onHashchange);
		}
	};

	function onHashchange() {
		var r = location.hash.slice(1) || '/';
		if (r == '/') r = config.defaultRoute;
		if (r) {
			var lstRoute = r.split(';');
			var list = routers.getValues();
			for (var i = 0; i < list.length; i++) {
				var router = list[i];
				for (var j = 0; j < lstRoute.length; j++) {
					var route = lstRoute[j];
					if (router.routeReg.test(route)) {
						if (config.debug) console.log("component:" + router._component.getName() + ", route:" + route + ", hashchange:√");
						router.hashchange(route);
					} else {
						if (config.debug) console.log("component:" + router._component.getName() + ", route:" + route + ", hashchange:×");
					}
				}
			}
		}
	}

	return Router;
});