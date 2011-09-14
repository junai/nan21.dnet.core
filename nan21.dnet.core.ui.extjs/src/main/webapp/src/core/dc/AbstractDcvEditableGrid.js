Ext.ns("dnet.base");

dnet.base.AbstractDcvEditableGrid = Ext.extend( Ext.grid.EditorGridPanel, {

	 _columns_: null
	,_elems_ : null
	,_controller_: null
	,_noExport_: false
	,_noImport_: false
	,_noLayoutCfg_: false
	,_exportWindow_: null
	,_importWindow_: null
	,_layoutWindow_: null

	,initComponent: function(config) {
		this._elems_ =  new Ext.util.MixedCollection();
        this._columns_ =  new Ext.util.MixedCollection();
		this._startDefine_();
		/* define columns */
        if (this._beforeDefineColumns_()  !== false ) {
		   this._defineColumns_();
           this._afterDefineColumns_();
		}
        this._columns_.each(this._postProcessColumn_, this);
		this._defineDefaultElements_();
		this._endDefine_();


		var cfg = {
			 columns: this._columns_.getRange()
		    ,forceFit: true,clicksToEdit:1,loadMask:true , border:true,frame:true
		    ,stripeRows:true
		    ,buttonAlign:"left"	    
		    ,viewConfig: {emptyText:Dnet.translate("msg", "grid_emptytext")  }
   			,keys: [
				{
                	key : Ext.EventObject.ENTER
                	,scope:this
					,handler: function() {
						 var rec = this.getSelectionModel().getSelected();
						 var rowIndex = this.store.indexOf(rec);
						 var cm = this.getColumnModel();
						 //TODO: find the first editable cell from the column model 
						 this.startEditing(rowIndex, 1);
					}
				}
			]
		  // ,tbar:[this._elems_.get("_btnLoad_"),"-",this._elems_.get("_btnSave_"),"-", this._elems_.get("_btnAdd_"),this._elems_.get("_btnRemove_"),"-",this._elems_.get("_btnCopy_"),"-",this._elems_.get("_btnExport_")]
		   ,bbar:{xtype:"paging", store: this._controller_.store, displayInfo:true, pageSize:this._controller_.tuning.fetchSize }
			,sm: new Ext.grid.RowSelectionModel({singleSelect: false
				,listeners: {
		             "rowselect": {scope: this,fn: function (sm, idx, rec) { 
					 		//if(this._controller_.getRecord() != rec) {this._controller_.setRecord(idx);}
					 	} } //, buffer:100
		            ,"rowdeselect": {scope: this,fn: function (sm, idx, rec) {  
//			         		if(this._controller_.getRecord() == rec) {
//			         		  if (sm.getSelections().length > 0 ) {
//			         		    this._controller_.setRecord(sm.getSelections()[0]);
//			         		  } else {
//			         		    this._controller_.setRecord(null);
//			         		  }
//			         		}
			         	}  }// , buffer:100
		            ,"selectionchange": {scope: this,fn:function(sm) { 
		            		this._controller_.setSelectedRecords( sm.getSelections() );
		            	} }//, buffer:100 
//		            ,"beforerowselect": {scope: this,fn:function(sm) { 
//		            	if(dnet.base.DcActionsStateManager.isPrevRecDisabled(this._controller_)) {return false;}   
//	            	}   }
		            
		            
				  }
			 })
			,store: this._controller_.store

		}
		
 

		var bbitems = [];
		if (!this._noLayoutCfg_) {
		  bbitems = [ "-",this._elems_.get("_btnLayout_")];
		}

		if (!this._noImport_) {
          if (bbitems.length == 0 ) { bbitems[0] = "-"; }
		  bbitems[bbitems.length]= [ this._elems_.get("_btnImport_")];
		}
        if (!this._noExport_) {
          if (bbitems.length == 0 ) { bbitems[0] = "-"; }
		  bbitems[bbitems.length]= [ this._elems_.get("_btnExport_")];
		}

		if (bbitems.length > 0 ) {
			cfg["bbar"]["items"] = bbitems;
        }

		Ext.apply(cfg,config);
        Ext.apply(this,cfg);
		dnet.base.AbstractDcvEditableGrid.superclass.initComponent.call(this);
		this._controller_.store.on("load", this._onStoreLoad_, this);
		this.on("afteredit", this._afterEdit_, this);
//		this._controller_.on("afterDoNew", function(dc) {
//			this.getSelectionModel().suspendEvents();
//			this.getSelectionModel().selectLastRow(false);
//			this.getView().focusRow(this.store.getCount() );
//            this.getSelectionModel().resumeEvents();
//		}, this);
		this._controller_.on("selectionChange",function(evnt) {
			var s = evnt.dc.getSelectedRecords();
			if (s != this.getSelectionModel().getSelections() ) {
				this.getSelectionModel().suspendEvents();
				this.getSelectionModel().selectRecords(s,false);
				this.getSelectionModel().resumeEvents();
			}
		} , this);
		 
	}

    ,_getElement_: function(name) {  return Ext.getCmp( this._elems_.get(name).id); }
    ,_getElementConfig_: function(name) {  return this._elems_.get(name); }

    ,_get_: function(name) { return this._getElement_(name);} 
    ,_getConfig_: function(name) {  return this._elems_.get(name); }
    
    ,_startDefine_: function () {}
    ,_endDefine_: function () {}

    ,_defineColumns_: function () {}
    	,_beforeDefineColumns_: function () {return true;}
    	,_afterDefineColumns_: function () {}

	,_defineElements_: function () {}
    	,_beforeDefineElements_: function () {return true;}
    	,_afterDefineElements_: function () {}

   	,_defineDefaultElements_: function () {
        this._elems_.add("_btnExport_",{xtype:"button", id:Ext.id(), disabled: true,
			text:Dnet.translate("dcvgrid", "exp_btn"), tooltip: Dnet.translate("dcvgrid", "exp_title"), iconCls: 'icon-action-export', handler: this._doExport_, scope:this } );
		this._elems_.add("_btnImport_",{xtype:"button", id:Ext.id(),
			text:Dnet.translate("dcvgrid", "imp_btn"), tooltip: Dnet.translate("dcvgrid", "imp_title"), iconCls: 'icon-action-import', handler: this._doImport_, scope:this } );
		this._elems_.add("_btnLayout_",{xtype:"button", id:Ext.id(),
			text:Dnet.translate("dcvgrid", "btn_perspective_txt"), tooltip: Dnet.translate("dcvgrid", "btn_perspective_tlp"), iconCls: 'icon-action-customlayout', handler: this._doLayoutManager_, scope:this } );
	}
    ,_doImport_: function() {
	   if(this._importWindow_ == null)  {
          this._importWindow_ = new dnet.base.DataImportWindow();
          this._importWindow_._grid_ = this;
	   }
       this._importWindow_.show();
	}
	,_doExport_: function() {
	   if(this._exportWindow_ == null)  {
          this._exportWindow_ = new dnet.base.DataExportWindow();
          this._exportWindow_._grid_ = this;
	   }
       this._exportWindow_.show();
	}
	,_doLayoutManager_: function() {
	   if(this._layoutWindow_ == null)  {
          this._layoutWindow_ = new dnet.base.GridLayoutManager();
          this._layoutWindow_._grid_ = this;
	   }
       this._layoutWindow_.show();
	}

	,_onStoreLoad_: function(store,records,options) {
         if(!this._noExport_) {
             if( store.getCount()>0) {
	         	this._getElement_("_btnExport_").enable();
			 } else {
				this._getElement_("_btnExport_").disable();
			 }
		 }
         if(store.getCount()>0) {
        	 if (this.selModel.getCount() == 0 ) {
            	 this.selModel.selectFirstRow();
             } else {
            	 //this._controller_.setRecord(this.selModel.getSelected());
            	 this._controller_.setSelectedRecords(this.selModel.getSelections());
             }
         }
	}
	,_afterEdit_: function(e) {
       // this._controller_.dataModified(); 
		//this._getElement_("_btnSave_").enable();
	}
	
	,_postProcessColumn_ : function(item, idx, len) {
		if (item.header == undefined) {
			Dnet.translateColumn(this._trl_, this._controller_.ds._trl_,item);
		}
	}
		/* get value from resource bundle for the specified key*/
	,_getRBValue_: function(k) {
		if (this._trl_ != null && this._trl_[k]) { return this._trl_[k]; }
		if (this._controller_._trl_ != null && this._controller_._trl_[k]) {
			return  this._controller_._trl_[k];
		} else {
			return k; 
		}
	}
	,_getBuilder_: function() {
		if (this._builder_ == null) {
			this._builder_ = new dnet.base.DcvEditableGridBuilder({dcv: this});
		}	
		return this._builder_;
	}
});



dnet.base.AbstractDcvEditableGridCustEditor = Ext.extend( dnet.base.AbstractDcvEditableGrid, {
	 
//	initComponent: function(config) {		 
//		dnet.base.AbstractDcvEditableGridCustEditor.superclass.initComponent.call(this);
//	}
 
	 _getCustomCellEditor_: function(col, row, record) {
		return this.colModel.getCellEditor(col, row);
	}
	
	
	,startEditing : function(row, col){
        this.stopEditing();
        if(this.colModel.isCellEditable(col, row)){
            this.view.ensureVisible(row, col, true);
            var r = this.store.getAt(row),
                field = this.colModel.getDataIndex(col),
                e = {
                    grid: this,
                    record: r,
                    field: field,
                    value: r.data[field],
                    row: row,
                    column: col,
                    cancel:false
                };
            if(this.fireEvent("beforeedit", e) !== false && !e.cancel){
                this.editing = true;
                var ed = this._getCustomCellEditor_(col, row, r);
                if(!ed){
                    return;
                }
                if(!ed.rendered){
                    ed.parentEl = this.view.getEditorParent(ed);
                    ed.on({
                        scope: this,
                        render: {
                            fn: function(c){
                                c.field.focus(false, true);
                            },
                            single: true,
                            scope: this
                        },
                        specialkey: function(field, e){
                            this.getSelectionModel().onEditorKey(field, e);
                        },
                        complete: this.onEditComplete,
                        canceledit: this.stopEditing.createDelegate(this, [true])
                    });
                }
                Ext.apply(ed, {
                    row     : row,
                    col     : col,
                    record  : r
                });
                this.lastEdit = {
                    row: row,
                    col: col
                };
                this.activeEditor = ed;
                // Set the selectSameEditor flag if we are reusing the same editor again and
                // need to prevent the editor from firing onBlur on itself.
                ed.selectSameEditor = (this.activeEditor == this.lastActiveEditor);
                var v = this.preEditValue(r, field);
                ed.startEdit(this.view.getCell(row, col).firstChild, Ext.isDefined(v) ? v : '');

                // Clear the selectSameEditor flag
                (function(){
                    delete ed.selectSameEditor;
                }).defer(50);
            }
        }
    }
});