/**
 * unfinished
 */
define(function(require,exports,module){
    var App = require('../../core/app');
    var Navigation = App.Component.newClass({
        _className: "Page.Navigation",
        _render:function($layout){
            this._tagTargetId = this.generateTagId();
            this._backBtnId = this.generateTagId();
            this._pathId = this.generateTagId();
            var tpl =  '<div id="' + this._tagTargetId + '" class="easyui-layout" fit="true">'+                        
                            '<div class="north" region="north"  style="height:0px;" border="false">' +
                                '<span id="'+ this._backBtnId +'" class="easyui-linkbutton" style="width:60px;margin:5px; 30px;"></span>' +
                                '<span id="'+ this._pathId +'"  ></span>' +
                            '</div>' +
                        '</div>';
            $tab.tabs('add',{
                title: this.title,
                content: tpl,
                border:false,
                selected:true,
                closable: typeof(this.closable) === "undefined"? false : this.closable,
                iconCls:"fa "+this.iconCls+" fa-lg"
            });		
            var tab=cThis._tabs.tabs('getSelected');
            var index=cThis._tabs.tabs('getTabIndex',tab);
            this._tabIndex = index;
        },
        getPath: function(){
            var path = this.translate("PAGE_YOUR_LOCATION")+":";
            
            return path;
        },
        push:function(page){

        },
        pop:function(){

        }
    });
});