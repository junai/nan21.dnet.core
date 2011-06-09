Ext.ns("dnet.base");

dnet.base.AbstractDcvForm = Ext.extend( Ext.form.FormPanel, {
	
	 _elems_: null
	,_is_filter_: false
	,_controller_: null
    ,_mainViewName_: "main"
    ,_resourceBundle_:{}
    ,_noInsert_ : null
    ,_noUpdate_ : null
    ,_noEdit_ : null

	,_dcViewType_:"edit-form"

	,initComponent: function(config) {
		if (this._noInsert_ == null) this._noInsert_ = [];
		if (this._noUpdate_ == null) this._noUpdate_ = [];
		if (this._noEdit_ == null) this._noEdit_ = [];

		this._elems_ =  new Ext.util.MixedCollection();
		this._startDefine_();

		/* define elements */
		if (this._beforeDefineElements_()  !== false ) {
		   this._defineElements_();
           this._afterDefineElements_();
		}
		/* build the ui, linking elements */
		if (this._beforeLinkElements_()  !== false) {
		   this._linkElements_();
           this._afterLinkElements_();
		}
		this._setupHelpers_();
        this._endDefine_();

		var cfg = {
	       layout:"fit"
	      ,frame:true
	      ,border:true
	      ,trackResetOnLoad: true
	      ,buttonAlign:"left"	     
	      ,defaults:{
	      	   labelAlign:"right"
	      	  ,labelWidth:90
	      	  ,border:true
	      	  ,buttonAlign:"left"
	      	}

	     ,items:[ this._elems_.get(this._mainViewName_) ]
		}
		Ext.apply(cfg,config);
        Ext.apply(this,cfg);
		dnet.base.AbstractDcvForm.superclass.initComponent.call(this);
		// On field value change
		this.on({  scope: this ,change: this._onChange_  });
		// On checkbox check
		this.on({  scope: this ,check: this._onCheck_  });
		this._controller_.store.on("write", function(store, action, result, txResult, rs) {
				this.updateBound(this._controller_.getRecord());
			} , this);
		this.on({  scope: this ,afterrender: function() { 
			this.updateBound(this._controller_.getRecord()); 
		}   });
	}

    ,_startDefine_: function () {}
    ,_endDefine_: function () {}
    ,_getController_: function() { return this._controller_;}
    ,_getElement_: function(name) {
		try { 
			return Ext.getCmp( this._elems_.get(name).id);
		} catch(e) { if (console) { console.log(name+':'+ e.message);} }
		}
    ,_getElementConfig_: function(name) {  return this._elems_.get(name); }
	,onBind:function(record) { this.updateBound(record); this._afterBindRecord_(record);}
	,onUnbind:function(record) { this.updateBound(); }
	,afterEdit:function(record) { this.updateBound(record); }
	,afterReject:function(record) { this.updateBound(record);  }
	,_afterBindRecord_:function(record) {}
	,updateBound:function(record) {
		if (!record) {
				this.disable();
				 this.form.items.each(function(f){
			            f.setRawValue(null);
			        });
				//this.form.reset();
				}
		else {
			if(this.disabled) {this.enable();}
			this.form.loadRecord(record);
			this._applyContextRules_(record);
		}
	}

	,_defineElements_: function () {}
    	,_beforeDefineElements_: function () {return true;}
    	,_afterDefineElements_: function () {}

    ,_linkElements_: function () {}
    	,_beforeLinkElements_: function () {return true;}
    	,_afterLinkElements_: function () {}


	,_setupHelpers_: function() {
		this._elems_.each(function(item, idx, len) {
				if (item["disabled"] === true) { this._noEdit_[this._noEdit_.length] = item.name;}
			} , this);
	}

	,_applyContextRules_: function(record) {
		var c = null; // component might not be rendered yet
		if (record.data._p_record_status == "insert") {
			 for(var i=0; i< this._noUpdate_.length; i++) {
			 	 c= this._getElement_(this._noUpdate_[i]); if (c) c.enable();
			 }
			 for(var i=0; i< this._noInsert_.length; i++) {
			 	 c=this._getElement_(this._noInsert_[i]); if (c) c.disable();
			 }
			 for(var i=0; i< this._noEdit_.length; i++) {
			 	 c=this._getElement_(this._noEdit_[i]); if (c) c.disable();
			 }
		} else {
			 for(var i=0; i< this._noInsert_.length; i++) {
			 	c=this._getElement_(this._noInsert_[i]); if (c) c.enable();
			 }
			 for(var i=0; i< this._noUpdate_.length; i++) {
			 	 c=this._getElement_(this._noUpdate_[i]); if (c) c.disable();
			 }
			 for(var i=0; i< this._noEdit_.length; i++) {
			 	 c=this._getElement_(this._noEdit_[i]); if (c) c.disable();
			 }
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

	,_onChange_: function (field, newVal, oldVal) {
		if (newVal != oldVal) {
			this._controller_.getRecord().set(field.dataIndex, field.getValue());
			this._controller_.dataModified();
		}
	}
	,_onCheck_: function ( field, isChecked) {// alert(this._controller_.getRecord().get(field.dataIndex));
		if (this._controller_.getRecord().get(field.dataIndex) != isChecked) {
            this._controller_.getRecord().set(field.dataIndex, isChecked );
			this._controller_.dataModified();
		}
	}
	,_isValid_: function() { 

		if (this.getForm().isValid()) {
			return true;
		} else {
			Ext.Msg.show({
	          title: 'Invalid data'
	         ,msg: 'Form contains invalid data.<br>Please correct values then try again. '
	         ,buttons: {ok:'OK'} //, cancel:'Details'
	         ,scope:this
	         ,icon: Ext.MessageBox.ERROR
	      });
	      return false;
		}
	}
});