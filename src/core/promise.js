/**
 * Promise Module
 * @version 1.0.0
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018~2019 www.jamson.cn. All rights reserved.
 * *
 */
define(function (require) {
	var U = require('./util');
	if (typeof (Promise) === "undefined" || typeof (Promise.resolve) === "undefined") {
		//The browser does not support the Promise function.
		var currentOrigin = location.protocol + '//' + location.host;
		var _parentsAboutAll = U.createHashTable();
		var _childrenAboutAll = U.createHashTable();
		var _parentsAboutRace = U.createHashTable();
		var _childrenAboutRace = U.createHashTable();
		var _promises = U.createHashTable();
		var _id = 0;

		function PromiseEx(resolver) {
			if (!U.isFunction(resolver)) throw new Error("Promise resolver " + resolver + " is not a function");
			this["[[PromiseStatus]]"] = "pending";
			this["[[PromiseValue]]"] = undefined;
			this.resolver = resolver;
			this._pid = 'p' + (++_id);
			if (_id == Number.MAX_SAFE_INTEGER) id = 0;
			_promises.add(this._pid, this);
			sendMsg(this._pid);
		}
		PromiseEx.prototype.finally = function (onFinally) {
			var fn = {};
			if (!this._callbacks) this._callbacks = [];
			if (U.isFunction(onFinally)) { fn.onFinally = onFinally; this._callbacks.push(fn); }
			_promises.add(this._pid, this);
			if (this["[[PromiseStatus]]"] != "pending") { sendMsg(id); }
			return this;
		}
		PromiseEx.prototype.then = function (onFulfilled, onRejected) {
			var fn = {};
			if (!this._callbacks) this._callbacks = [];
			if (U.isFunction(onFulfilled)) { fn.onFulfilled = onFulfilled; }
			if (U.isFunction(onRejected)) { fn.onRejected = onRejected; }
			this._callbacks.push(fn);
			_promises.add(this._pid, this);
			if (this["[[PromiseStatus]]"] != "pending") { sendMsg(id); }
			return this;
		}
		PromiseEx.prototype.catch = function (onRejected) {
			return this.then(undefined, onRejected);
		}

		PromiseEx.all = all;
		PromiseEx.race = race;
		PromiseEx.resolve = resolve;
		PromiseEx.reject = reject;

		function buildRelationAboutAll(parent, iterable) {
			var arrC = _childrenAboutAll.getValue(parent._pid);
			if (!arrC) { arrC = U.createHashTable(); }
			for (var i in iterable) {
				var c = iterable[i];
				if (c instanceof PromiseEx) {
					arrC.add(c._pid, c);
					var arrP = _parentsAboutAll.getValue(c._pid);
					if (!arrP) { arrP = U.createHashTable(); }
					arrP.add(parent._pid, { parent: parent, index: i });
					_parentsAboutAll.add(c._pid, arrP);
				}
			}
			_childrenAboutAll.add(parent._pid, arrC);
		}

		function buildRelationAboutRace(parent, iterable) {
			var arrC = _childrenAboutRace.getValue(parent._pid);
			if (!arrC) { arrC = U.createHashTable(); }
			for (var i in iterable) {
				var c = iterable[i];
				if (c instanceof PromiseEx) {
					arrC.add(c._pid, c);
					var arrP = _parentsAboutRace.getValue(c._pid);
					if (!arrP) { arrP = U.createHashTable(); }
					arrP.add(parent._pid, parent);
					_parentsAboutRace.add(c._pid, arrP);
				}
			}
			_childrenAboutRace.add(parent._pid, arrC);
		}

		function removeRelationAboutAll(parent, child) {
			var arrC = _childrenAboutAll.getValue(parent._pid);
			if (arrC) {
				arrC.remove(child._pid);
			}
			var arrP = _parentsAboutAll.getValue(child._pid);
			if (arrP) {
				arrP.remove(parent._pid);
			}
		}
		function removeRelationAboutRace(parent, child) {
			_childrenAboutRace.remove(parent._pid);
			var arrP = _parentsAboutRace.getValue(child._pid);
			if (arrP) {
				arrP.remove(parent._pid);
			}
		}

		function all(iterable) {
			return new PromiseEx(function () {
				if (iterable.length > 0) {
					this["[[PromiseValue]]"] = new Array(iterable.length);
					buildRelationAboutAll(this, iterable);
				}
				for (var i in iterable) {
					var p = iterable[i];
					if (p instanceof PromiseEx) {
						if (p["[[PromiseStatus]]"] != "pending") {
							this["[[PromiseValue]]"][i] = p["[[PromiseValue]]"];
							sendMsg(this._pid);
						}
					} else {
						this["[[PromiseValue]]"][i] = p;
						sendMsg(this._pid);
					}
				}
			});
		}
		function race(iterable) {
			return new PromiseEx(function () {
				if (iterable.length > 0) {
					buildRelationAboutRace(this, iterable);
				}
				for (var i in iterable) {
					var p = iterable[i];
					if (p instanceof PromiseEx) {
						if (p["[[PromiseStatus]]"] != "pending") {
							this["[[PromiseValue]]"] = p["[[PromiseValue]]"];
							this["[[PromiseStatus]]"] = p["[[PromiseStatus]]"];
							sendMsg(this._pid);
						}
					} else {
						this["[[PromiseValue]]"] = p;
						sendMsg(this._pid);
					}
				}
			});
		}
		function resolve(value) {
			if (value instanceof PromiseEx) return value;
			else {
				var promise = this;
				if (promise instanceof PromiseEx) {
					promise["[[PromiseStatus]]"] = value instanceof Error ? "rejected" : "fulfilled";
					promise["[[PromiseValue]]"] = value;
					sendMsg(promise._pid);
				} else {
					promise = new PromiseEx(function (resolve) {
						try {
							resolve.call(this, value);
						} catch (err) {
							this["[[PromiseStatus]]"] = "rejected";
							this["[[PromiseValue]]"] = err;
							sendMsg(this._pid);
						}
					});
				}
				return promise;
			}
		}
		function reject(reason) {
			var promise = this;
			if (promise instanceof PromiseEx) {
				promise["[[PromiseStatus]]"] = "rejected";
				promise["[[PromiseValue]]"] = reason;
				sendMsg(promise._pid);
			} else {
				promise = new PromiseEx(function (resolve, reject) {
					try {
						reject.call(this, reason);
					} catch (err) {
						this["[[PromiseStatus]]"] = "rejected";
						this["[[PromiseValue]]"] = err;
						sendMsg(this._pid);
					}
				});
			}
			return promise;
		}

		function sendMsg(id) {
			if (window.postMessage) {
				window.postMessage({
					promiseId: id,
					type: "promiseMessage"
				}, currentOrigin);
			} else {
				setTimeout(function () {
					processPromise(id);
				}, 1);
			}
		}

		function processPromiseEx(e) {
			var origin = event.origin || event.originalEvent.origin;
			if (origin != currentOrigin) return;
			if (e.data.type != "promiseMessage") return;
			var id = e.data.promiseId;
			processPromise(id);
		}


		function processPromise(id) {
			var promise = _promises.getValue(id);
			if (promise) {
				if (promise["[[PromiseStatus]]"] === "pending") {
					processPending(promise);
				} else if (promise._allId) {
					var p = _promises.getValue(promise._allId);
					if (p._mode) {
						if (promise["[[PromiseStatus]]"] === "rejected" || p._mode === 'race') {
							p["[[PromiseValue]]"] = promise["[[PromiseValue]]"];
							p["[[PromiseStatus]]"] = promise["[[PromiseStatus]]"];
							delete p._mode;
						} else {
							p["[[PromiseValue]]"][promise._allIndex] = promise["[[PromiseValue]]"];
							delete promise._allIndex;
						}
						sendMsg(promise._allId);
					}
					delete promise._allId;
				} else {
					processSettled(promise);
				}
			}
		}

		function processPending(promise) {
			if (promise.resolver) {
				try {
					promise.resolver(resolve.bind(promise), reject.bind(promise));
				} catch (err) {
					promise["[[PromiseValue]]"] = err;
					promise["[[PromiseStatus]]"] = "rejected";
					sendMsg(promise._pid);
				}
				delete promise.resolver;
			} else {
				var childrenAll = _childrenAboutAll.getValue(promise._pid);
				if (childrenAll && childrenAll.getSize() === 0) {
					promise["[[PromiseStatus]]"] = "fulfilled";
					_childrenAboutAll.remove(promise._pid);
					sendMsg(promise._pid);
				}
				var childrenRace = _childrenAboutRace.getValue(promise._pid);
				if (childrenRace && childrenRace.getSize() > 0) {
					var children = childrenRace.getValues();
					for(var i in children){
						var c = children[i];						
						removeRelationAboutRace(promise,c);
					}
					sendMsg(promise._pid);
				}
			}
		}

		function processSettled(promise) {
			var fns = promise._callbacks ? promise._callbacks.shift() : null;
			if (fns && promise["[[PromiseStatus]]"] != "pending") {
				try {
					if (U.isFunction(fns.onFinally)) {
						fns.onFinally();
					} else if (U.isFunction(fns.onRejected) && (promise["[[PromiseStatus]]"] === "rejected" || promise["[[PromiseValue]]"] instanceof Error)) {
						fns.onRejected(promise["[[PromiseValue]]"]);
						promise["[[PromiseValue]]"] = undefined;
						promise["[[PromiseStatus]]"] = "fulfilled";
					} else if (U.isFunction(fns.onFulfilled) && promise["[[PromiseStatus]]"] === "fulfilled") {
						promise["[[PromiseValue]]"] = fns.onFulfilled(promise["[[PromiseValue]]"]);
					}
				} catch (err) {
					promise["[[PromiseValue]]"] = err;
					promise["[[PromiseStatus]]"] = "rejected";
				}
				sendMsg(promise._pid);
			}
			else {				
				_promises.remove(promise._pid);
				delete promise._callbacks;	
			}
			var flag1 = processAboutRace(promise);
			var flag2 = processAboutAll(promise);
			if (flag1 && flag2 && promise["[[PromiseValue]]"] && promise["[[PromiseStatus]]"] === "rejected") {
				console.error(promise["[[PromiseValue]]"]);
			}
		}

		function processAboutRace(promise){
			var flag = true;
			var parentRace = _parentsAboutRace.getValue(promise._pid);
			if(parentRace && parentRace.getSize()>0){
				var parents = parentRace.getValues();
				for(var i in parents){
					var p = parents[i];
					p["[[PromiseValue]]"] = promise["[[PromiseValue]]"];
					p["[[PromiseStatus]]"] = promise["[[PromiseStatus]]"];
					sendMsg(p._pid);				
				}
				_parentsAboutRace.remove(promise._pid);
				flag = false;
			}
			return flag;
		}
		function processAboutAll(promise){
			var flag = true;
			var parentAll = _parentsAboutAll.getValue(promise._pid);
			if(parentAll && parentAll.getSize()>0){
				var parents = parentAll.getValues();					
				for(var i in parents){
					var p = parents[i].parent;
					var index = parents[i].index;
					if(promise["[[PromiseStatus]]"] === "rejected"){
						p["[[PromiseValue]]"] = promise["[[PromiseValue]]"];
						p["[[PromiseStatus]]"] = "rejected";
					}else{	
						p["[[PromiseValue]]"][index] = promise["[[PromiseValue]]"];
					}
					removeRelationAboutAll(p,promise);
					sendMsg(p._pid);	
				}
				flag = false;
			}
			return flag;
		}

		if (window.postMessage) window.addEventListener("message", processPromiseEx, false);
		return PromiseEx;
	} else {
		return Promise;
	}
});