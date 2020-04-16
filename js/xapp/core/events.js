/**
 * EventNode Module
 * @version 1.0.0
 * @author JamsonFong
 * @email 873047028@qq.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 * *
 */
define(function(require, exports ,module ){
	var U=require('./util'),
		Class = require('./class'),
		config=require('./config');	
	var Status = {
		CANCELLED : -10,
		UNEXECUTED : 0,
		EXECUTING : 10,
		EXECUTED: 20
	}

    var _events=U.createHashTable();
	

	/**
	 * 事件流上下文
	 */
	function Context(){
		this.first=null;
		this.current=[];
		this.data=U.createHashTable();	
		this.error=null;
		this.paused=false;
		this.fnFail=[];
		this.cancelled=false;
		this.fnFinal=[];
		this.result = null;
		this.last = null;
		this.promise=(typeof(Promise)!='undefined' && U.isFunction(Promise.resolve))?Promise.resolve():null;
	}
	
	/**
	 * 增加事件流分支
	 */	
	function addBranches(node,fnExec,fnCond,cancellable){
		var branch=null;
		if(fnExec instanceof EventNode){
			fnExec.setContext(node.context);
			branch=fnExec;
    	}else if( U.isFunction(fnExec) || (U.isString(fnExec) && node.target.hasMethod(fnExec))){ 			
    		branch=new EventNode(node.target,node.context,fnExec); 
    	}else throw new Error("Invalid Arguments.");
		
		if(branch){
    		if(U.isBoolean(fnCond) || U.isFunction(fnCond)) branch.fnCond=fnCond;
			if(U.isBoolean(cancellable)) branch.cancellable=cancellable;
			node.branches.push(branch);
		}
		
	}
	/**
	 * 构建下一个事件节点
	 */
	function buildNextNode(first,fnExec,fnCond,cancellable){    
		if(fnExec instanceof EventNode){
			if(U.isBoolean(fnCond) || U.isFunction(fnCond)) fnExec.fnCond=fnCond;
			first.context.last._next = fnExec;
			first.context.last = fnExec.context.last?fnExec.context.last:fnExec;
			for(var i in fnExec.context.fnFail){
				var fn = fnExec.context.fnFail[i];
				first.context.fnFail.push(fn);
			}
			for(var i in fnExec.context.fnFinal){
				var fn = fnExec.context.fnFinal[i];
				first.context.fnFinal.push(fn);
			}
			fnExec.setContext(first.context);
    	}else if( U.isFunction(fnExec) || (U.isString(fnExec) && first.target.hasMethod(fnExec))){ 
			first.context.last._next=new EventNode(first.target,first.context,fnExec);    			
			first.context.last=first.context.last._next;    			
			if(U.isBoolean(cancellable)) first._last.cancellable=cancellable;
			if(U.isBoolean(fnCond) || U.isFunction(fnCond)) first._last.fnCond=fnCond;
    	}else if(U.isString(fnExec)) throw new Error("The method or event is not in the component.");
    	else throw new Error("Invalid Arguments.");
	}
	/**
	 * 事件流节点
	 * @method EventNode
	 */
	function EventNode(target,context,event) {
		this.event=U.isString(event)?event:(U.isFunction(event)?U.getFuncName(event):'(anonymous)');
		this.target=target;
		this.fnCond=true;
		if(U.isFunction(event)){
			this.fnExec=event;
		}else if((target && event && U.isString(event) && target.hasMethod(event) )) {			
			this.fnExec = target.getMethod(event);
		}else{
			this.event = '(anonymous)';
			this.fnExec = function(){};
		}
		if (context != null && context instanceof Context) {
			this.context=context;
		} else {
			this.context=new Context();
			this.context.first = this;
			this.context.current.push(this);
			this.context.last = this;
		}		
		this.branches=[];
		this.status=Status.UNEXECUTED; 
		this.cancellable=true;
		this._next=null;
	}
	var E=EventNode.prototype;
	function next(arrExec,arrCond,cancellable){
    	if(this._last==null) this._last=this;
    	if(U.isArray(arrExec) && U.isArray(arrCond) && arrExec.length==arrCond.length){
    		for(var i=0;i<arrExec.length;i++){
				buildNextNode(this,arrExec[i],arrCond[i],cancellable);
    		}   
    	}else if(U.isArray(arrExec)){
    		for(var i=0;i<arrExec.length;i++){
    			var item=arrExec[i];
    			if(U.isArray(item) && item.length==2){
    				buildNextNode(this,item[0],item[1],cancellable);
    			}else{
    				throw new Error('Invalid arguments.');
    			}
    		}    
    	}else buildNextNode(this,arrExec,arrCond,cancellable);
		return this;
	};	
	E.next=function(arrExec,arrCond){return next.call(this,arrExec,arrCond,true); return this;};
	E.then=function(arrExec,arrCond){return next.call(this,arrExec,arrCond,false);return this;};
	E.setContext=function(context){
		this.context=context;
		if(this._next){
			this._next.setContext(context);
		}
		if(this.branches.length>0){
			for(var i=0;i<this.branches.length;i++){
  				this.branches[i].setContext(context);
  			}
		}
	}
	E.cancel=function(){
  		if(this.context.cancelled==false){
  			this.context.paused=false;
			this.context.cancelled=true;
			this.context.first.cancel();
  		}else{
	  		if(this._next){ 
	  			this._next.status=this._next.status==Status.UNEXECUTED&&this._next.cancellable?Status.CANCELLED:this._next.status;
	  			this._next.cancel();
	  		}
	  		if(this.branches.length>0){
	  			for(var i=0;i<this.branches.length;i++){
	  				var node=this.branches[i];
	  				node.status=node.status==Status.UNEXECUTED&&node.cancellable?Status.CANCELLED:node.status;
	  				node.cancel();
	  			}
	  		}
  		}
  	};
	E.pause=function(){
		this.context.paused=true;
	};
	E.resume=function(){
		this.context.paused=false;
	};
	E.popCurrent=function(){
		return this.context.current.pop();
	}
	E.peekCurrent=function(){
		return this.context.current.length>0?this.context.current[this.context.current.length-1]:null;
	}
	E.pushCurrent=function(current){
		this.context.current.push(current);
	}
	E.setData=function(key,data){
		if(arguments.length<2) throw new Error("Missing arguments.");
		if(this.context.data.containsKey(key)){
			var item=this.context.data.getValue(key);
			for(var i in data){item[i]=data[i];}
			this.context.data.add(key,item);
		}else{
			this.context.data.add(key,data);
		}
		return this;
	}
	E.getData=function(key){	
		if(arguments.length<1) throw new Error("Missing arguments.");
		data=this.context.data.getValue(key);
		return data;
	}
	E.fail=function(fn){
		if(U.isFunction(fn)) this.context.fnFail.push(fn);
		return this;
	}
	E.final=function(fn){
		if(U.isFunction(fn)) this.context.fnFinal.push(fn);
		return this;
	}	
	E.process=function(fn,fnErr){
    	if(this.context.promise){//支持微任务
    		this.context.promise=this.context.promise.then(fn);
    		if(U.isFunction(fnErr)) this.context.promise=this.context.promise.catch(fnErr); 
    		else this.context.promise=this.context.promise.catch(function(err){console.error(err);}); 
    	}else{//不支持微任务
    		this.context.timeoutId && clearTimeout(this.context.timeoutId);
    		this.context.timeoutId=setTimeout(fn,0);
    	}	    	
    };
    E.run=runEventStream;
    
    var dataScope={
    	CHAIN:1,
    	COMPONENT:2,
    	RESULT:3
    };
    function EventWrap(node){
    	this.node=node;
    	this.target=node.target;
    }
    var EW=EventWrap.prototype;
	EW.next=function(arrExec,arrCond){
    	if(U.isArray(arrExec) && U.isArray(arrCond) && arrExec.length==arrCond.length){
    		for(var i=0;i<arrExec.length;i++){
    			addBranches(this.node,arrExec[i],arrCond[i],true);
    		}   
    	}else if(U.isArray(arrExec)){
    		for(var i=0;i<arrExec.length;i++){
    			var item=arrExec[i];
    			if(U.isArray(item) && item.length==2){
    				addBranches(this.node,item[0],item[1],true);
    			}else{
    				throw new Error('Invalid arguments.');
    			}
    		}    
    	}else addBranches(this.node,arrExec,arrCond,true);
		return this;
	};
	EW.then=function(arrExec,arrCond){
		if(U.isArray(arrExec) && U.isArray(arrCond) && arrExec.length==arrCond.length){
    		for(var i=0;i<arrExec.length;i++){
    			addBranches(this.node,arrExec[i],arrCond[i],false);
    		}   
    	}else if(U.isArray(arrExec)){
    		for(var i=0;i<arrExec.length;i++){
    			var item=arrExec[i];
    			if(U.isArray(item) && item.length==2){
    				addBranches(this.node,item[0],item[1],false);
    			}else{
    				throw new Error('Invalid arguments.');
    			}
    		}    
    	}else addBranches(this.node,arrExec,arrCond,false);
		return this;
	};
	EW.isCancelled=function(){return this.node.context.cancelled;};
	EW.fail=function(fn){ this.node.fail(fn);return this;};
	EW.final=function(fn){ this.node.final(fn);return this;};
	EW.cancel=function(){ this.node.cancel();return this;};
	EW.pause=function(){ this.node.pause();return this;};
	EW.resume=function(){ this.node.resume();return this;};
	EW.setData=function(data,scope){ 
		if(arguments.length<1) throw new Error("Missing arguments.");
		var params=[data,scope];
		this.node.setData.apply(this.node,arguments);
		return this;
	};
	EW.getData=function(prop,scope){
		if(arguments.length<1 || prop==null || prop=="") return null;
		var result=null;
		var params=[prop,scope];
		return this.node.getData.apply(this.node,params);
	};
	EW.execute=function(node){
		if(node instanceof EventNode){
			node.setContext(this.node.context);
			this.next(node);
		}
		else throw new Error("The argument 'node' should be a EventNode object.");
	}
    
   
	function pause(node){
		node.context.timeoutId && clearTimeout(node.context.timeoutId);
		node.context.timeoutId = setTimeout(function(){ runEventStream.call(node);},10);
	}
	
	function checkCondition(node){
		if(U.isBoolean(node.fnCond)) return node.fnCond;
		else if(U.isFunction(node.fnCond)) return node.fnCond.call(node.target); 
		else return false;
	}
	
	function fireEvent(node){
		var next=null,err=null,flag='',bCond=true,event=node.event,result=null;
		try{
			bCond=checkCondition(node);
			if(bCond){
				if(node.cancellable && node.context.cancelled){
					flag='×';
				}else{ 
					node.target.currentEvent = new EventWrap(node);
					var result = node.context.result;
					result = node.fnExec.call(node.target,result);
					node.target.currentEvent = null;
					if(result) node.context.result = result;
					if(node.event) flag='√';
					node.status=Status.EXECUTED;	
				}
			}
			node.popCurrent();
			if(node._next){next=node._next;}
			else { next=node.popCurrent(); }
		}catch(e){
			flag='×';
			node.context.current=[];
			node.status=Status.CANCELLED;
			node.cancel();
			node.context.error=e;
		}
		if(config.debug && node.event && node.event!="(anonymous)" && node.event.indexOf('_')!=0 
		 && bCond && U.isFunction(node.target.getName)){ 
			console.log('{'+node.target.getName()+'}.'+event+'=>['+flag+']');
		}
		return next;
	}
	/**
	 * 执行事件流
	 * @param interger delay  
	 */
	function runEventStream(delay){
		var node=this;		
		delay = delay && delay > 0 ? delay : 0;
		function processEventNode(){
			var current=node.peekCurrent();
			if(current){
				if(current.context.paused) pause(current);
				else if(current.status==Status.UNEXECUTED || current.status==Status.CANCELLED){					
					var next=fireEvent(current);
					if(current.branches.length>0){						
						for(var i=current.branches.length-1;i>=0;i--){
							current.pushCurrent(next);
							next=current.branches[i];
						}
					}
					if(next){ 
						current.pushCurrent(next);
						next.process(processEventNode);
					}else{ 
						if(current.context.error){
							if(current.context.fnFail.length>0){ 
								for(var i in current.context.fnFail)								
									node.context.fnFail[i](current.context.error);
							}else throw current.context.error;
						}
						if(current.context.fnFinal.length>0){ 
							for(var i in current.context.fnFinal)								
								node.context.fnFinal[i]();
						}
					}
				}
			}			
		}
		//setTimeout(function(){
			this.process(processEventNode);
		//},delay);		
		return this;
	}		

	/**
	 * 创建事件
	 */
	exports.createEvent=function(target,event){
		return new EventNode(target,null,event);
	}
	exports.DataScope=dataScope;
	return exports;
});
