
define(function (require, exports, module) {
    var E = require('../../core/events');
    var config = require('../../core/config');
    var App = require('../../core/app');

    var S ={
		Created:0,
		Loaded:10,
		Unloaded:20
	};
    var Page = App.Component.newClass({
        _className: "Page",
        _constructor: function (options) {
            arguments.callee.super._constructor.call(this, options);
            this._hostPage = null;
            this._lastTagTarget = null;
            this._pages = [];
            this._status = S.Created;
        },        	
		_showLoading : function(){
			if(this._$mask) this._$mask.css('display','block');
			if(this._$maskMsg) this._$maskMsg.css('display','block');
		},
		_hideLoading : function(){		
			if(this._$mask) this._$mask.css('display','none');
			if(this._$maskMsg) this._$maskMsg.css('display','none');
		},	
        _render: function ($parent,region,$btn,$path) { 
            this._tagTargetId = this.generateTagId(); 
            var maskId = $btn? this.generateTagId():'0';
            var maskMsgId =$btn? this.generateTagId():'0';
            var tpl = '<div id="' + this._tagTargetId + '">'+ 
                        '<div region="center" border="false">' +
                            (this.template ? this.template : '') + 
                        '</div>' + ($btn ?               
		    	        '<div id="'+ maskId +'" class="datagrid-mask" style="display:none;"></div>'+
                        '<div id="'+ maskMsgId +'" class="datagrid-mask-msg" style="display: none; left: 50%; height: 16px; margin-left: -96.5px; line-height: 16px;">' +
                            '{{ "APP_PAGE_LOADING" | translate}}':'' )+
                        '</div>'+
                    '</div>';
            $parent.layout("add",{
                region:region,   
                border:false,         
                height:"100%",
                content: this._preprocess(tpl)
            });
            this._region = region;
            this._$parent = $parent;    

            this._tagTarget = $("#"+this._tagTargetId).layout({fit:true});  
            if($btn){
                var page = this;
                this._$backBtn = $btn;
			    this._$backBtn.css("display","none");
                this._$backBtn.bind('click',function(){ page.pop(); });		
                this._hostPage = this; 
                this._$path = $path; $path.text(page.title);
                this._$mask = $("#"+maskId);
                this._$maskMsg = $("#"+maskMsgId);
            }
            this._hostPage._lastTagTarget = this._tagTarget;
            var cThis = this;
            $('[permission]').each(function(index,el){
                var pKey = $(el).attr('permission');
                if(!cThis.context.getPermission(pKey)){
                    $(el).css('display','none');
                }
            });
        },
        _remove:function(){
            if(this._tagTarget){
                this._tagTarget=null;
                this._$parent.layout("remove",this._region);
            }
        },
        _onUnloadChildren:function(){
            var event = this.currentEvent;
            var host = this;
            for(var i = this._pages.length - 1; i >= 0; i--){
                var item = this._pages[i];
                (function(page){                    
                    event                
                    .next(function(){
                        page.currentEvent = this.currentEvent;
                        page.onBeforeUnload();
                        if(config.debug){  console.log('{'+page.getName()+'}.onBeforeUnload=>[√]'); }
                        page.currentEvent = null;
                    })
                    .next(function(){
                        host._pages.pop();
                        page._hostPage = null;
                        page._remove();
                        if(host._pages.length>0){
                            var p = host._pages[host._pages.length-1];
                            host._lastTagTarget = p._tagTarget;
                        }else if(host._$backBtn) {
                            host._$backBtn.css("display","none");
                        }
                    })
                    .next(function(){                        
                        page.currentEvent = this.currentEvent;
                        page.onUnloaded();
                        if(config.debug){  console.log('{'+page.getName()+'}.onUnloaded=>[√]'); }
                        page.currentEvent = null;
                    });
                })(item);
            }
        },
        /*================ 实例事件  =============*/
        onBeforeLoad:function(){},
        onLoaded:function(){},
        onBeforeUnload:function(){},
        onUnloaded:function(){},
        onCheckSession:function(){},
        onCheckPermission:function(){},

        /*=================== 实例方法 ===============*/
        push: function (page) {
            if(page instanceof Page) {
                var cThis = this;
                E.createEvent(page)
                .next(function(){           
                    cThis._hostPage._showLoading();     
                })    
                .next("onBeforeLoad")
                .next(function(){
                    var host = cThis._hostPage;
                    if(host == null || host == page) return;
                    page._hostPage = host;
                    page.context = cThis.context; 
                    page._render(host._lastTagTarget,'south');
                    host._pages.push(page); 
                    var path = host.title;
                    for(var i in host._pages){
                        path += " > " + host._pages[i].title;
                    }
                    if(cThis._$backBtn) {  
                        cThis._$backBtn.css("display",""); 
                    }
                    host._$path.text(path);
                    page._status = S.Loaded;
                })
                .next("onLoaded")
                .then(function(){
                    cThis._hostPage._hideLoading();
                })
                .run();                             
            }else{
                throw new Error("The page does not match with the type of Page.");
            }
        },
        pop: function () {
            if(this._hostPage == null) return;
            var host = this._hostPage;
            var page = null;
            if(host._pages.length>0){
                page = host._pages[host._pages.length-1];
            }
            if(page){
                E.createEvent(page)
                .next("onBeforeUnload")
                .next(function(){
                    host._pages.pop();
                    page._hostPage = null;
                    page._remove();
                    if(host._pages.length>0){
                        var p = host._pages[host._pages.length-1];
                        host._lastTagTarget = p._tagTarget;
                        var path = host.title;
                        for(var i in host._pages){
                            path += " > "+host._pages[i].title;
                        }
                        host._$path.text(path);
                    }else if(host._$backBtn) {
                        host._$backBtn.css("display","none");
                        host._$path.text(host.title);
                    }
                    page._status = S.Unloaded;
                })
                .next("onUnloaded")
                .run();
            }
            
        }
    });

    Page.Status = S;
    return Page;
});