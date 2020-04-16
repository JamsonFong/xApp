/**
 * “首页”JS组件(easyui组件)
 * @Author JamsonFong
 */
define(function(require,exports,module){	
    var role=require('./role'),
        xframework=require('xframework');
	var c=xframework.createComponent('role.editor',module);
	c.tids={
		id:"data-editor"
	};
	c.title="数据编辑器";
	c.iconCls='fa-database';
	c.serviceOptions={
		idField:'data_id',
		id:0,
		url:{
			createUrl:"/resource/data/create",
			saveUrl:"/resource/data",
			readUrl:"/resource/data/",
			updateUrl:"/resource/data/",
			searchUrl:"/resource/data"
		},   
		fields:[
			{ title: "数据ID", field: 'data_id', width: 80 },
			{ title: "数据名称", field: 'data_name', width: 180 },
            { title: "数据描述", field: 'description', width: 300 }
		]
	};
	c.onBeforeLoad=function(e){
    	var cThis=this;
    	//this.dataService=jsFrame.createDataService(this.serviceOptions);    	
    };
    c.onAfterLoad=function(e){
    	var cThis=this;
		cThis.formId='#Sys-User-frmEditor',
		cThis.roleComboboxId='#Sys-User-role_id',
		cThis.rAddBtnId="#Sys-User-role_id-btn",
		cThis.submitId="#Sys-User-frmEditor-submit",
		cThis.descId='#Sys-User-description';
		cThis.canelId='#Sys-User-frmEditor-cancel';
		
		cThis.pTree=$(cThis.treeId).tree();	
		cThis.rAddBtn=$(cThis.rAddBtnId).linkbutton();
		cThis.rCombobox=$(cThis.roleComboboxId).combobox({
			//data:cThis.dataProxy.GetRoleCombobox(),
			valueField:'role_id',
			textField:'role_name',
			onSelect:function(record){
				if(record && record.role_id){
					//cThis.pTree.tree("loadData",cThis.dataProxy.GetRolePrivileges(record.role_id));
				}
			}
		});
		cThis.rForm=$(cThis.formId).form({
			onLoadSuccess: function (data) {
				if (data.privileges) {
					cThis.pTree.tree("loadData",data.privileges);
	            }
			}
		});		
		console.log("cancel button init...");
		cThis.btnCancel=$(cThis.canelId);
		cThis.btnCancel.click(function(){
			console.log("click cancel...");
			cThis.unload();
		});
		$.parser.parse('#'+cThis.tids.id);
    }
    c.onInit = function (e){
		parent.onInit.call(this,arguments);
		
    }
    
    c.onBeforeUnload=function(e){
    	
    	e.pause();
		$.messager.confirm('确认','您确定要关闭“'+this.title+'”',function(r){
			if (r){
				e.resume();
			}else{
				e.cancel();
			}
		});/**/
    }
    
	return c;	
});	