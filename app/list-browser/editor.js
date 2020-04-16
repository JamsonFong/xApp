/**
 * “首页”JS组件(easyui组件)
 * @Author JamsonFong
 */
boneframe.define('ui.editor',{
	parent:'component',
	route:"/index/data/editor",
	ids:{id:"app-data"},
	templateUrl:"{:url('Editor')}",
	title:"数据编辑器",
	iconCls:'fa-database',
	serviceOptions:{
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
	},
	type:'panel',
	dataService:null,
    onInstall:function(e){
    	
    },
    onBeforeLoadUI:function(e){
    	var cThis=this;
    	this.dataService=jsFrame.createDataService(this.serviceOptions);    	
    },
    onInitUI:function(e){
    	var editor=this;
		editor.formId='#Sys-User-frmEditor',
		editor.roleComboboxId='#Sys-User-role_id',
		editor.rAddBtnId="#Sys-User-role_id-btn",
		editor.submitId="#Sys-User-frmEditor-submit",
		editor.descId='#Sys-User-description';
		
		editor.pTree=$(editor.treeId).tree();	
		editor.rAddBtn=$(editor.rAddBtnId).linkbutton();
		editor.rCombobox=$(editor.roleComboboxId).combobox({
			data:editor.dataProxy.GetRoleCombobox(),
			valueField:'role_id',
			textField:'role_name',
			onSelect:function(record){
				if(record && record.role_id)
				editor.pTree.tree("loadData",editor.dataProxy.GetRolePrivileges(record.role_id));
			}
		});
		editor.rForm=$(editor.formId).form({
			onLoadSuccess: function (data) {
				if (data.privileges) {
					editor.pTree.tree("loadData",data.privileges);
	            }
			}
		});		
		$.parser.parse('#'+cThis.id);
    },
    onInit:function(e){
    	
    },
    add:function(){
    	
    },
    setData:function(){
    	
    },
    getData:function(){
    	
    }
		
});	