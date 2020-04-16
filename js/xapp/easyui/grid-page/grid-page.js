/**
 * “首页”JS组件(easyui组件)
 * @Author JamsonFong
 */
define(function(require,exports,module){
	var App = require('../../core/app');
	var Page = require('../page/page');
	
	var GridPage = Page.newClass({
		_className:"GridPage",
		_constructor:function(options){
			arguments.callee.super._constructor.call(this,options);
			if(!options || !options.tagIds){
				this.tagIds = {
					id:"app-data",
					toolbar:"app-data-toolbar",
					searchForm:"app-data-search-form",
					pagination:"app-data-pagination"
				};				
			}
			if(!options || !options.title)  this.title="数据表格浏览器";
			if(!options || !options.iconCls) this.iconCls='fa-database';
			if(!options || !options.template){
				this.template = '<div id="app-data" >'+
					'<div id="app-data-toolbar" class="toolbar" >'  + 						
						'<div style="padding:2px 5px;">'+
							'<div><form id="app-data-search-form"></form></div>'+
						'</div>' +               
					'</div>'   + 
					'<div id="app-data-pagination" class="pagination"></div>'+
				'</div>';
			}
			this._initDataSetting(options);
			this._pager = { pageNumber:1, pageSzie:20 };
		},
		_initDataSetting:function(options){
			if(!options || !options.dataSettings ){ this.dataSettings = { 				
				_allFields: App.createHashTable(),
				_visibleFields: App.createHashTable()
			};
			}else{
				this.dataSettings._allFields =  App.createHashTable();
				this.dataSettings._visibleFields = App.createHashTable();
			}
			if(this.dataSettings.fields) {
				for(var f in this.dataSettings.fields){
					var field = this.dataSettings.fields[f];
					field.width = field.width || 100;
					if(f.visible != false) this.dataSettings._visibleFields.add(field.field,field);	
					this.dataSettings._allFields.add(field.field,field);
					if(f.isKey == true && typeof(this.dataSettings.idField) == "undefined") this.dataSettings.idField = field.field;				
				}	
				if( typeof(this.dataSettings.idField) == "undefined" )	this.dataSettings.idField = this.dataSettings.fields[0].field;
			}	
			if( typeof(this.dataSettings.sortName) == "undefined") this.dataSettings.sortName = '';			
		},
		_render:function(){
			arguments.callee.super._render.apply(this,arguments);
			var cThis = this;
			cThis._pagination=$('#'+cThis.tagIds.pagination).pagination({
				total: 0,
				pageSize: cThis._pager.pageSize,
				pageNumber: cThis._pager.pageNumber,
				pageList: [10, 20, 25, 30, 50, 75, 100],
				showRefresh: false,
				onSelectPage: function (pageNumber, pageSize) {
					cThis._pager.pageNumber = pageNumber;
					cThis._pager.pageSize = pageSize;
					cThis.loadData();
				}	        
			});
			cThis._datagrid=$("#"+cThis.tagIds.id).datagrid({
				iconCls: 'icon-grid',
				methord: 'get',
				sortName: this.dataSettings.sortName,
				sortOrder: 'asc',
				idField: this.dataSettings.idField,
				columns: [this.dataSettings._visibleFields.getValues()],
				border:false,
				fit: true,
				pagination: false,
				singleSelect: true,
				rownumbers: true,
				toolbar: "#"+cThis.tagIds.toolbar,
				footer: "#"+cThis.tagIds.pagination,
				onSelect: function (index, row) {
					cThis.dataService.selected=row;
				}
			});
			cThis._searchForm=$("#"+cThis.tagIds.searchForm).form({});
		},
		loadData:function(){
			var cThis=this;
			// this.dataService.seleted=null;
			if(this._status == Page.Status.Loaded){
				this._datagrid.datagrid('clearSelections');
				/*
				this._datagrid.datagrid("loading");
				this._dataService.browse(function(res){
					if(res.errorCode==0){
						cThis._datagrid.datagrid({ data: res.data.list });
						cThis._pagination.pagination('refresh', { total: res.data.total, pageNumber: this.pageNum });
						cThis._datagrid.datagrid("loaded");
					}else{
						$.messager.alert(res.msg);
					}
				});*/
			}
		}


	});
    return GridPage;
});	