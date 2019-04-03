/**
 * EventNode Module
 * @version 1.0.0
 * @author JamsonFong
 * @email 873047028@qq.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 * *
 */

define(function (require, exports, module) {
	var U = require('./util');
	var config = require('./config');

	var Status = {
		CANCELLED: -10,
		UNEXECUTED: 0,
		EXECUTED: 20
	}
	var _queue = U.createHashTable();
	var _contextId = 0;
	var currentOrigin = location.protocol + '//' + location.host;


	/**
	 * 事件流上下文
	 */
	function Context() {
		this.contextId = 'eq' + (++_contextId);
		this.first = null;
		this.current = [];
		this.data = U.createHashTable();
		this.error = null;
		this.paused = false;
		this.fnFail = [];
		this.cancelled = false;
		this.fnFinal = [];
		this.result = null;
		this.last = null;
		_queue.add(this.contextId, this);
	}
	Context.prototype.destroy= function(){
		if(this.contextId) _queue.remove(this.contextId);
		if(this.data) this.data.clear();
		if(this.fnFail) this.fnFail.splice(0);
		if(this.fnFail) this.fnFinal.splice(0);
		if(this.current) this.current.splice(0);
		for(var i in this){
			this[i] = null;
			delete this[i];
		}
	}

	/**
	 * 增加事件流分支
	 */
	function addBranches(node, fnExec, fnCond, cancellable) {
		var branch = null;
		if (fnExec instanceof EventNode) {
			fnExec.setContext(node.context);
			branch = fnExec;
		} else if (U.isFunction(fnExec) || (U.isString(fnExec) && node.target.hasMethod(fnExec))) {
			branch = new EventNode(node.target, node.context, fnExec);
		} else throw new Error("Invalid Arguments.");

		if (branch) {
			if (U.isBoolean(fnCond) || U.isFunction(fnCond)) branch.fnCond = fnCond;
			if (U.isBoolean(cancellable)) branch.cancellable = cancellable;
			node.branches.push(branch);
		}

	}
	/**
	 * 构建下一个事件节点
	 */
	function buildNextNode(first, fnExec, fnCond, cancellable) {
		if (fnExec instanceof EventNode) {
			if (U.isBoolean(fnCond) || U.isFunction(fnCond)) fnExec.fnCond = fnCond;
			first.context.last._next = fnExec;
			first.context.last = fnExec.context.last ? fnExec.context.last : fnExec;
			for (var i in fnExec.context.fnFail) {
				var fn = fnExec.context.fnFail[i];
				first.context.fnFail.push(fn);
			}
			for (var i in fnExec.context.fnFinal) {
				var fn = fnExec.context.fnFinal[i];
				first.context.fnFinal.push(fn);
			}
			fnExec.setContext(first.context);
		} else if (U.isFunction(fnExec) || (U.isString(fnExec) && first.target.hasMethod(fnExec))) {
			first.context.last._next = new EventNode(first.target, first.context, fnExec);
			first.context.last = first.context.last._next;
			if (U.isBoolean(cancellable)) first.context.last.cancellable = cancellable;
			if (U.isBoolean(fnCond) || U.isFunction(fnCond)) first.context.last.fnCond = fnCond;
		} else if (U.isString(fnExec)) throw new Error("The method or event is not in the component.");
		else throw new Error("Invalid Arguments.");
	}
	/**
	 * 事件流节点
	 * @method EventNode
	 */
	function EventNode(target, context, event) {
		this.event = U.isString(event) ? event : (U.isFunction(event) ? U.getFuncName(event) : '(anonymous)');
		this.target = target;
		this.fnCond = true;
		if (U.isFunction(event)) {
			this.fnExec = event;
		} else if ((target && event && U.isString(event) && target.hasMethod(event))) {
			this.fnExec = target.getMethod(event);
		} else {
			this.event = '(anonymous)';
			this.fnExec = function () { };
		}
		if (context != null && context instanceof Context) {
			this.context = context;
		} else {
			this.context = new Context();
			this.context.first = this;
			this.context.current.push(this);
			this.context.last = this;
		}
		this.branches = [];
		this.status = Status.UNEXECUTED;
		this.cancellable = true;
		this._next = null;
	}
	var E = EventNode.prototype;
	function next(arrExec, arrCond, cancellable) {
		if (this._last == null) this._last = this;
		if (U.isArray(arrExec) && U.isArray(arrCond) && arrExec.length == arrCond.length) {
			for (var i = 0; i < arrExec.length; i++) {
				buildNextNode(this, arrExec[i], arrCond[i], cancellable);
			}
		} else if (U.isArray(arrExec)) {
			for (var i = 0; i < arrExec.length; i++) {
				var item = arrExec[i];
				if (U.isArray(item) && item.length == 2) {
					buildNextNode(this, item[0], item[1], cancellable);
				} else {
					throw new Error('Invalid arguments.');
				}
			}
		} else buildNextNode(this, arrExec, arrCond, cancellable);
		return this;
	};
	E.next = function (arrExec, arrCond) { return next.call(this, arrExec, arrCond, true); return this; };
	E.then = function (arrExec, arrCond) { return next.call(this, arrExec, arrCond, false); return this; };
	E.setContext = function (context) {
		if(this.context === context) return;
		if(this.context){
			this.context.destroy();
		}
		this.context = context;
		if (this._next) {
			this._next.setContext(context);
		}
		if (this.branches.length > 0) {
			for (var i = 0; i < this.branches.length; i++) {
				this.branches[i].setContext(context);
			}
		}
	}
	E.cancel = function () {
		if (this.context.cancelled == false) {
				this.context.paused = false;
				this.context.cancelled = true;
				// this.context.first.cancel();
				for(var i in this.context.current){
					var node = this.context.current[i];
					node.cancel();
				}
				if(this._next) this._next.cancel();
				window.postMessage({
					contextId: this.context.contextId,
					type: "AppEvent"
				}, currentOrigin);
		} else {
			if (this._next) {
				this._next.status = this._next.status == Status.UNEXECUTED && this._next.cancellable ? Status.CANCELLED : this._next.status;
				this._next.cancel();
			}
			if (this.branches.length > 0) {
				for (var i = 0; i < this.branches.length; i++) {
					var node = this.branches[i];
					node.status = node.status == Status.UNEXECUTED && node.cancellable ? Status.CANCELLED : node.status;
					node.cancel();
				}
			}
		}
	};
	E.pause = function () {
		this.context.paused = true;
	};
	E.resume = function () {		
		var destroy = this.context.paused && (this === this.target.currentEvent.node);
		this.context.paused = false;
		window.postMessage({
			contextId: this.context.contextId,
			type: "AppEvent"
		}, currentOrigin);
		if(destroy){ this.destroy(); }
	};
	E.popCurrent = function () {
		return this.context.current.pop();
	}
	E.peekCurrent = function () {
		return this.context.current.length > 0 ? this.context.current[this.context.current.length - 1] : null;
	}
	E.pushCurrent = function (current) {
		this.context.current.push(current);
	}
	E.setData = function (key, data) {
		if (arguments.length < 2) throw new Error("Missing arguments.");
		if (this.context.data.containsKey(key)) {
			var item = this.context.data.getValue(key);
			for (var i in data) { item[i] = data[i]; }
			this.context.data.add(key, item);
		} else {
			this.context.data.add(key, data);
		}
		return this;
	}
	E.getData = function (key) {
		if (arguments.length < 1) throw new Error("Missing arguments.");
		data = this.context.data.getValue(key);
		return data;
	}
	E.fail = function (fn) {
		if (U.isFunction(fn)) this.context.fnFail.push(fn);
		return this;
	}
	E.final = function (fn) {
		if (U.isFunction(fn)) this.context.fnFinal.push(fn);
		return this;
	}
	E.destroy = function(){	
		this.branches.splice(0);
		for(var p in this){
			this[p] = null;
			delete this[p];
		}
	}
	E.run = function () {
		window.postMessage({
			contextId: this.context.contextId,
			type: "AppEvent"
		}, currentOrigin);
	};

	var dataScope = {
		CHAIN: 1,
		COMPONENT: 2,
		RESULT: 3
	};
	function EventWrap(node) {
		this.node = node;
		this.target = node.target;
	}
	var EW = EventWrap.prototype;
	EW.next = function (arrExec, arrCond) {
		if (U.isArray(arrExec) && U.isArray(arrCond) && arrExec.length == arrCond.length) {
			for (var i = 0; i < arrExec.length; i++) {
				addBranches(this.node, arrExec[i], arrCond[i], true);
			}
		} else if (U.isArray(arrExec)) {
			for (var i = 0; i < arrExec.length; i++) {
				var item = arrExec[i];
				if (U.isArray(item) && item.length == 2) {
					addBranches(this.node, item[0], item[1], true);
				} else {
					throw new Error('Invalid arguments.');
				}
			}
		} else addBranches(this.node, arrExec, arrCond, true);
		return this;
	};
	EW.then = function (arrExec, arrCond) {
		if (U.isArray(arrExec) && U.isArray(arrCond) && arrExec.length == arrCond.length) {
			for (var i = 0; i < arrExec.length; i++) {
				addBranches(this.node, arrExec[i], arrCond[i], false);
			}
		} else if (U.isArray(arrExec)) {
			for (var i = 0; i < arrExec.length; i++) {
				var item = arrExec[i];
				if (U.isArray(item) && item.length == 2) {
					addBranches(this.node, item[0], item[1], false);
				} else {
					throw new Error('Invalid arguments.');
				}
			}
		} else addBranches(this.node, arrExec, arrCond, false);
		return this;
	};
	EW.isCancelled = function () { return this.node.context.cancelled; };
	EW.fail = function (fn) { this.node.fail(fn); return this; };
	EW.final = function (fn) { this.node.final(fn); return this; };
	EW.cancel = function () { this.node.cancel(); return this; };
	EW.pause = function () { this.node.pause(); return this; };
	EW.resume = function () { this.node.resume(); return this; };
	EW.setData = function (data, scope) {
		if (arguments.length < 1) throw new Error("Missing arguments.");
		var params = [data, scope];
		this.node.setData.apply(this.node, arguments);
		return this;
	};
	EW.getData = function (prop, scope) {
		if (arguments.length < 1 || prop == null || prop == "") return null;
		var result = null;
		var params = [prop, scope];
		return this.node.getData.apply(this.node, params);
	};
	EW.execute = function (node) {
		if (node instanceof EventNode) {
			node.setContext(this.node.context);
			this.next(node);
		}
		else throw new Error("The argument 'node' should be a EventNode object.");
	}

	function checkCondition(node) {
		if (U.isBoolean(node.fnCond)) return node.fnCond;
		else if (U.isFunction(node.fnCond)) return node.fnCond.call(node.target);
		else return false;
	}

	function fireEvent(node) {
		var next = null, flag = '', bCond = true, event = node.event, result = null;
		try {
			bCond = checkCondition(node);
			if (bCond) {
				if (node.cancellable && node.context.cancelled) {
					flag = '×';
				} else {
					node.target.currentEvent = new EventWrap(node);
					var result = node.context.result;
					result = node.fnExec.call(node.target, result);
					if(!node.context.paused) node.target.currentEvent = null;
					if (result) node.context.result = result;
					if (node.event) flag = '√';
					node.status = Status.EXECUTED;
				}
			}
			node.popCurrent();
			if (node._next) { next = node._next; }
			else { next = node.popCurrent(); }
		} catch (err) {
			flag = '×';
			node.context.current = [];
			node.status = Status.CANCELLED;
			node.cancel();
			node.context.error = err;
		}
		if (config.debug && node.event && node.event.indexOf('_') != 0
		  && node.event != "(anonymous)"
			&& bCond && U.isFunction(node.target.getName)) {
			console.log('{' + node.target.getName() + '}.' + event + '=>[' + flag + ']');
		}
		return next;
	}



	function processEvents(e) {
		var origin = e.origin || e.originalEvent.origin;
		if (origin != currentOrigin) return;
		if (e.data.type != "AppEvent") return;
		var id = e.data.contextId;
		var context = _queue.getValue(id);
		if (context) {
			var current = context.current.length > 0 ? context.current[context.current.length - 1] : null;
			var next = fireEvent(current);
			if (current.branches.length > 0) {
				for (var i = current.branches.length - 1; i >= 0; i--) {
					current.pushCurrent(next);
					next = current.branches[i];
				}
			}
			if (next) {
				current.pushCurrent(next);
				if (!context.paused) {
					current.destroy();
					current = null;					
					window.postMessage({
						contextId: id,
						type: "AppEvent"
					}, currentOrigin);
				}
			} else {
				if (current.context.error) {
					if (current.context.fnFail.length > 0) {
						for (var i in current.context.fnFail)
							context.fnFail[i](current.context.error);
					} else throw current.context.error;
				}
				if (current.context.fnFinal.length > 0) {
					for (var i in current.context.fnFinal)
						context.fnFinal[i]();
				}		
				current.destroy();
				current = null;		
				context.destroy();
				_queue.remove(id);
				// console.log({contexts:_queue, size:_queue.getSize()});
				context = null;
			}
		}
	}

	window.addEventListener("message", processEvents, false);
	/**
	 * 创建事件
	 */
	exports.createEvent = function (target, event) {
		return new EventNode(target, null, event);
	}
	exports.DataScope = dataScope;
	return exports;
});
