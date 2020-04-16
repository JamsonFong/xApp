/**
 * “首页”JS组件(easyui组件)
 * @Author JamsonFong
 */
define(function(require,exports,module){
	var U=require('xframework'),
		app=require('../app');
		
	exports=app.createComponent(module);
	exports.tids={
			id:"app-data",
			toolbar:"app-data-toolbar",
			searchForm:"app-data-search-form",
			pagination:"app-data-pagination"
	};
	exports.template='<div id="app-data" >'+
    		 	'<div id="app-data-toolbar" class="toolbar" >'  + 
    		 		'<div style="padding:2px 5px;">'+
    		 			'<div><form id="app-data-search-form"></form></div>'+
    		 		'</div>' +               
    		 	'</div>'   + 
    		 	'<div id="app-data-pagination" class="pagination"></div>'+
    		 '</div>';
	exports.title="列表浏览器";
	exports.iconCls='fa-database';
	exports.serviceOptions={
		idField:'data_id',
		id:0,
		url:{
			createUrl:"/resource/data/create",
			saveUrl:"/resource/data",
			readUrl:"/resource/data/",
			updateUrl:"/resource/data/",
			deleteUrl:"/resource/data/",
			searchUrl:"/resource/data"
		},   
		fields:[
			{ title: "数据ID", field: 'data_id', width: 80 },
			{ title: "数据名称", field: 'data_name', width: 180 },
            { title: "数据描述", field: 'description', width: 300 }
		]
	};
	exports.dataService=null,
    exports.onBeforeLoad=function(e){
    	var cThis=this;
    	this.dataService={};
    	//this.dataService=boneframe.createDataService(this.serviceOptions);    	
    };
    exports.onAfterLoad=function(e){
    	var cThis=this;    
		cThis.pagination=$('#'+cThis.tids.pagination).pagination({
	        total: 0,
	        pageSize: 20,
	        pageNumber: 1,
	        pageList: [10, 20, 25, 30, 50, 75, 100],
	        showRefresh: false,
	        onSelectPage: function (pageNumber, pageSize) {
	        	cThis.dataService.pageNum = pageNumber;
	        	cThis.dataService.pageSize = pageSize;
	        	cThis.loadData();
	        }	        
	    });
		cThis.datagrid=$("#"+cThis.tids.id).datagrid({
	        iconCls: 'icon-grid',
	        methord: 'get',
	        sortName: cThis.serviceOptions.idField,
	        sortOrder: 'asc',
	        idField: cThis.serviceOptions.idField,
	        columns: [cThis.serviceOptions.fields],
	        border:false,
	        fit: true,
	        pagination: false,
	        singleSelect: true,
	        rownumbers: true,
	        toolbar: "#"+cThis.tids.toolbar,
	        footer: "#"+cThis.tids.pagination,
	        onSelect: function (index, row) {
	        	cThis.dataService.selected=row;
	        }
	    });
		cThis.searchForm=$("#"+cThis.tids.searchForm).form({});
		$.parser.parse('#'+cThis.tids.id);
    };
    exports.onInit=function(e){
    	this.loadData(); 
		for(var i in this.tids.toolBtns){ this.bind(i); }
		$(".permission").each(function(i,item){
			var $btn=$(item);
			if($btn.hasClass("easyui-linkbutton")){ $btn.linkbutton("disable").unbind("click"); }
			else $btn.css("display","none");
    		return;
    	});
    };
    exports.bind=function(name){
    	var cThis=this,$btn=$("#"+this.tids.toolBtns[name]);    	
		$btn.click(function(){
			var fn=cThis[name];
			if(U.isFunction(fn)){ 
				fn.call(cThis);
			}
		});
	}
    exports.loadData=function(){
    	var cThis=this;
    	this.dataService.seleted=null;
    	if(this.isLoaded()){
	    	this.datagrid.datagrid('clearSelections');
	    	/*
	    	this.datagrid.datagrid("loading");
	    	this.dataService.browse(function(res){
	    		if(res.errorCode==0){
		    		cThis.datagrid.datagrid({ data: res.data.list });
		    		cThis.pagination.pagination('refresh', { total: res.data.total, pageNumber: this.pageNum });
		    		cThis.datagrid.datagrid("loaded");
	    		}else{
		    		jsf.msgAlert(res.msg);
	    		}
	    	});*/
    	}
    },
    exports.add=function(){
    	var cThis=this;
    	this.dataService.create({
    		data_id:(++this.dataService.id),
    		data_name:'数据'+this.dataId
    	},function(res){
    		cThis.loadData();
    	});	
    };
    exports.read=function(){
    	var cThis=this;
    	if(this.dataService.selected){ 
    		this.dataService.read(
    			this.dataService.selected[this.idField],
    			function(res){    				
    				cThis.loadData();
    		});
    	}
    };
    exports.edit=function(){
    	this.dataService.update(this.dataService.selected[this.idField],{id:(this.dataService.id),data_name:'数据'+this.dataService.id});
    	this.loadData();
    },
    exports.remove=function(){
    	if(this.dataService.selected) this.dataService.delete(this.dataService.selected[this.idField]);
    	this.loadData();
    };
    exports.browse=function(){
    	this.dataService.searchParams={};
    	this.loadData();
    };
    exports.refresh=exports.browse;
    exports.clear=function(){
    	this.searchForm.form('reset');
    };
    exports.search=function(){
    	this.dataService.searchParams={
    			
    	};
    	this.loadData();
    };
    exports['import']=function(){
    	console.log('import...');
    };
    exports['export']=function(){
    	console.log('export...');
    }	
    exports.loadComponent=function(target,pos){	
		target.setPosition(pos);
		app.openTab(target);
	}
	exports.unloadComponent=function(target,pos){
		app.closeTab(target);		
		target.setPosition(null);
	}
    return exports;
});	