/**
 * 角色管理模块
 * @Author JamsonFong
 */
define(function(require,exports,module){
	var xframework=require('xframework'),
		parent=require('../list-browser/list-browser'),
        editor=require('./editor'),
		app=require('../app');
	
	exports=app.createComponent('role',module,parent);
	exports.tids={
		id:"app-role",
		toolbar:"app-role-toolbar",
		searchForm:"app-role-search-form",
        pagination:"app-role-pagination",
        //editor:"app-role-editor",
		toolBtns:{
			add:"app-role-add",		
			read:"app-role-read",
			edit:"app-role-edit",
			remove:"app-role-remove",
			browse:"app-role-refresh",
			clear:"app-role-clear",
			search:"app-role-search",
			"import":"app-role-import",
			"export":"app-role-export"
		}
	};
	exports.title="角色管理";
	exports.iconCls='fa-users';
	exports.serviceOptions={
		idField:'role_id',
		id:0,
		url:{
			createUrl:"/resource/role/create",
			saveUrl:"/resource/role",
			readUrl:"/resource/role/",
			updateUrl:"/resource/role/",
			deleteUrl:"/resource/role/",
			searchUrl:"/resource/role",
		},   
		fields:[
			{ title: "角色ID", field: 'role_id', width: 80 },
			{ title: "角色名称", field: 'role_name', width: 180 },
            { title: "角色描述", field: 'description', width: 300 }
		]
	};
	exports.onInit=function(){
		parent.onInit.call(this,arguments);
    	this.setRouteReg(/^\/role(\/[0-9]+){1}$/i);
    	this.enableRoute();
	};
	exports.add=function(){
        /*
		if(!this.count) this.count=0;
        xframework.routeTo('/role/'+(this.count++));*/
        //$("#app-role-editor").window("open");        
        //$("#app-role-editor").window("move",{left:0,top:$('#'+this.tids.pagination)[0].clientHeight});/* */       
        //console.log($("#"+this.tids.id));
        //$("#"+this.tids.id)[0].parentNode.parentNode.parentNode.append($('<div id="app-role-editor" class="easyui-window" data-options="constrain:true,border:false,noheader:true,inline:true,draggable:false,maximized:true,closed:true">    This window stay inside its parent</div>'));
        //$.parser.parse('#app-role-editor');

        xframework.ajaxGet({
            url: editor.templateUrl,
            error: function () { throw new Error('Loading content failed!'); },
            success: function (data) { 
            	editor.__innerData.template=data;
            	$('#app-role-editor').layout("add",{
                    region:"north",   
                    border:false,         
                    height:"100%",
                    content:editor.getTemplate()
                });
            	var btnCancel=$(editor.canelId);
            	editor.btnCancel.click(function(){
        			console.log("click cancel...");
        			editor.unload();
        		});
            }
        });	
        
	}
	
	
	
	return exports;
});	