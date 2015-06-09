/**
 * @fileOverview fdp's table module definition based on Cellula.
 * @description: defines datatable module
 * @namespace: FDP
 * @version: 1.1.0
 */
define(function(require, exports, module) {

	var FDP = require('./fdp-namespace');

	var Cellula = require('cellula');
	var $ = require('$');
	
	var util = Cellula._util, 
		Class = Cellula.Class, 
		Element = Cellula.Element, 
		Cell = Cellula.Cell, 
		Coll = Cellula.Collection;

	var DataTable = FDP.DataTable = new Class('DataTable', {
		hideClass: 'fn-hide',
		tableTpl : {
			head : null,
			body : null
		},
		tips : {
			noResult : null,
			error : null
		},
		tipNodes : {},
		initTip : function() {
			for (var n in this.tips) {
				this.tipNodes[n] = this.getNode(this.tips[n]);
			}
		},
		init : function(cfg) {
			this._super(cfg);
			this.initTip();
			//this.registerEvents();
		},
		registerEvents: function() {
		},
		prepareTplConfig : function(data) {
		},
		show: function(bool) {
			var call = bool ? util.removeClass : util.addClass;
			call(this.rootNode, this.hideClass);
		},
		error : function() {
			this.show(false);
			util.removeClass(this.tipNodes.error, this.hideClass);
		},
		showNoResult : function() {
			this.show(false);
			util.removeClass(this.tipNodes.noResult, this.hideClass);
		},
		receiver: function(e) {
			if (!e) return;
			var targ = e.target, evt = e.name.split(':')[1];
			switch (evt) {
				case 'TABLERENDER':
					this.render(arguments[1]);
					break;
				case 'SYSTEMERROR':
					this.error(false);
					break;
			}
		},
		render : function(data) {
			var root = this.rootNode;
			util.addClass(this.tipNodes.error, this.hideClass);
			util.addClass(this.tipNodes.noResult, this.hideClass);

			if (data.length === 0) {
				this.showNoResult();
				this.emit('TABLEVIEW:NORESULT');
				return false;
			}
			
			var table = root.getElementsByTagName('table')[0],
                colgroup = root.getElementsByTagName('colgroup')[0],
				thead = table.getElementsByTagName('thead')[0],
				tbody = table.getElementsByTagName('tbody')[0],
				tpl = '';
            if (colgroup)
                table.removeChild(colgroup);
			if (thead)
				table.removeChild(thead);
			if (tbody)
				table.removeChild(tbody);

			data = this.prepareTplConfig(data);

			var div = document.createElement('div');
            div.innerHTML = '<table><colgroup>' + util.parseTpl(this.tableTpl.colgroup, data) + '</colgroup></table>';
            colgroup = div.getElementsByTagName('colgroup')[0];
            table.appendChild(colgroup);

            div.innerHTML = '<table><thead>' + util.parseTpl(this.tableTpl.head, data) + '</thead></table>';
			thead = div.getElementsByTagName('thead')[0];
			table.appendChild(thead);
			
			div.innerHTML = '<table><tbody>' + util.parseTpl(this.tableTpl.body, data) + '</tbody></table>';
			tbody = div.getElementsByTagName('tbody')[0];
			table.appendChild(tbody);
			this.show(true);
			this.registerEvents();
			//this.applyInterface('render', data);
		}
	}).inherits(Cell);

    // addtTable API
    DataTable.build = function(name, param) {
        if (typeof name !== 'string') throw new Error('`name` is expect a String type parameters.');
        if ($.isPlainObject(param)) {
            return new Class(name, param, 'NEW').inherits(FDP.DataTable);
        }
        return null;
    };

	module.exports = DataTable;

}); 