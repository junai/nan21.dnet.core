Ext.define("dnet.core.dc.DataExportForm", {
	extend : "Ext.form.Panel",

	actionButton : null,
	_elems_ : null,
	_formats_ : [ "csv", "html", "xml", "json" ],

	_grid_ : null,

	initComponent : function(config) {
		this._elems_ = new Ext.util.MixedCollection();

		this.actionButton = this.initialConfig.actionButton;
		this.actionButton.setHandler(this.executeTask, this);

		this._buildItems_();

		var cfg = {
			frame : true,

			fieldDefaults : {
				labelAlign : 'right',
				labelWidth : 100,
				msgTarget : 'side'
			},
			defaults : {
				anchor : '-20'
			// anchor : '80%'
			},
			items : [ this._elems_.get("fld_format"),
					this._elems_.get("fld_columns"),
					this._elems_.get("fld_records") ]
		};
		Ext.apply(this, cfg);
		this.callParent(arguments);
		this.on("afterrender", this._on_format_changed_, this);
	},

	_getElement_ : function(name) {
		return Ext.getCmp(this._elems_.get(name).id);
	},

	_getElementConfig_ : function(name) {
		return this._elems_.get(name);
	},

	_on_format_changed_ : function(nv) { // return ;
		if (nv == "pdf") {
			this._getElement_("fld_columns_listvisible").setValue(true);
			this._getElement_("fld_columns_listall").disable();
			// this._getElement_("fld_columns_all").disable();

		} else {
			this._getElement_("fld_columns_listall").enable();
			// this._getElement_("fld_columns_all").enable();

		}
	},

	_buildItems_ : function() {

		this._elems_.add("fld_format", {
			fieldLabel : Dnet.translate("dcvgrid", "exp_format"),
			xtype : "combo",
			allowBlank : false,
			selectOnFocus : true,
			// width : 100,
			id : Ext.id(),
			triggerAction : "all",
			store : this._formats_,
			value : this._formats_[0],
			listeners : {
				"change" : {
					scope : this,
					fn : function(fld, nv, ov) {
						this._on_format_changed_(nv);
					}
				}
			}
		});

		this._elems_.add("fld_columns_listvisible", {
			boxLabel : Dnet.translate("dcvgrid", "exp_col_visible"),
			inputValue : 'v',
			name : "fld_columns",
			id : Ext.id(),
			checked : true
		});
		this._elems_.add("fld_columns_listall", {
			boxLabel : Dnet.translate("dcvgrid", "exp_col_all"),
			inputValue : 'l',
			name : "fld_columns",
			id : Ext.id()
		});

		this._elems_.add("fld_columns", {
			fieldLabel : Dnet.translate("dcvgrid", "exp_columns"),
			xtype : "radiogroup",
			// itemCls : "x-check-group-alt",
			style : "border-top:1px outset",
			columns : 1,
			id : Ext.id(),
			items : [ this._elems_.get("fld_columns_listvisible"),
					this._elems_.get("fld_columns_listall") ]
		});

		this._elems_.add("fld_records_selected", {
			boxLabel : Dnet.translate("dcvgrid", "exp_rec_sel"),
			inputValue : 's',
			name : "fld_records",
			id : Ext.id(),
			disabled : true
		});

		this._elems_.add("fld_records_allpage", {
			boxLabel : Dnet.translate("dcvgrid", "exp_rec_all"),
			inputValue : 'a',
			name : "fld_records",
			id : Ext.id(),
			checked : true
		});
		this._elems_.add("fld_records", new Ext.form.RadioGroup({
			fieldLabel : Dnet.translate("dcvgrid", "exp_records"),
			xtype : "radiogroup",
			style : "border-top:1px outset",
			columns : 1,
			id : Ext.id(),
			items : [

			this._elems_.get("fld_records_selected"),
					this._elems_.get("fld_records_allpage") ]
		}));

	},

	executeTask : function() {

		var ctrl = this._grid_._controller_;
		var url = Dnet.dsAPI(ctrl.dsName, this._getElement_("fld_format")
				.getValue());

		var filterData = ctrl.filter.data;
		var request = dnet.core.base.RequestParamFactory
				.findRequest(filterData);
		for ( var p in request.data) {
			if (request.data[p] == "") {
				request.data[p] = null;
			}
		}

		var data = Ext.encode(request.data);
		request.data = data;
		var params = {};
		var fcv = this._getElement_("fld_columns").getValue().fld_columns;

		if (this._getElement_("fld_records").getValue().fld_records == "c") {
			params["resultSize"] = 30;
			params["resultStart"] = 0;
		}

		var sortCols = "";
		var sortDirs = "";
		var first = true;
		ctrl.store.sorters.each(function(item, idx, len) {
			if (!first) {
				sortCols += ",";
				sortDirs += ",";
			}
			sortCols += item.property;
			sortDirs += item.direction || "ASC";
			first = false;
		}, this);

		params[Dnet.requestParam.SORT] = sortCols;
		params[Dnet.requestParam.SENSE] = sortDirs;

		if (fcv != "a") {
			var gridCm = this._grid_.columns;
			var cs = '';
			var cst = '';
			var csw = '';
			var cnt = 0;
			var len = gridCm.length;
			for ( var i = 0; i < len; i++) {
				if (fcv == "l" || !gridCm[i].hidden) {
					cs += (cnt > 0) ? "," : "";
					cs += gridCm[i].dataIndex;
					cst += (cnt > 0) ? "," : "";
					cst += gridCm[i].text.replace(",", " ");
					csw += (cnt > 0) ? "," : "";
					csw += gridCm[i].width;
					cnt++;
				}
			}
			params[Dnet.requestParam.EXPORT_COL_NAMES] = cs;
			params[Dnet.requestParam.EXPORT_COL_TITLES] = cst;
			params[Dnet.requestParam.EXPORT_COL_WIDTHS] = csw;

		}
		var opts = "adress=yes, width=710, height=450,"
				+ "scrollbars=yes, resizable=yes,menubar=yes";
		var v = window.open(url["exportdata"] + "&" + Dnet.requestParam.FILTER
				+ "=" + request.data + "&" + Ext.urlEncode(params), 'Export',
				opts);
		v.focus();
	}
});

Ext.define("dnet.core.dc.DataExportWindow", {
	extend : "Ext.Window",

	_grid_ : null,

	initComponent : function(config) {

		var btn = Ext.create('Ext.Button', {
			text : Dnet.translate("dcvgrid", "exp_run"),
			iconCls : 'icon-action-run'
		});

		var cfg = {
			title : Dnet.translate("dcvgrid", "exp_title"),
			border : true,
			width : 350,
			resizable : false,
			closeAction : "hide",
			closable : true,
			constrain : true,
			buttonAlign : "center",
			modal : true,
			items : new dnet.core.dc.DataExportForm({
				actionButton : btn,
				_grid_ : this._grid_
			}),
			buttons : [ btn ]
		};

		Ext.apply(cfg, config);
		Ext.apply(this, cfg);
		this.callParent(arguments);
	}

});
