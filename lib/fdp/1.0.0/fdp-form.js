/**
 * @fileOverview fdp's form module definition based on Cellula.
 * @description: defines form module
 * @namespace: FDP
 * @version: 1.0.0
 */
define(function(require, exports, module) {

	// dependence
	var $ = require('$');
	var Cellula = require('cellula');
	
	var FDP = require('./fdp-namespace');
	var FormItem = FDP.FormItem;
	
	var util = Cellula._util, 
		Class = Cellula.Class, 
		Element = Cellula.Element, 
		Cell = Cellula.Cell, 
		Coll = Cellula.Collection;
	
	var Form = FDP.Form = new Class('Form', {
		type: undefined,
		validateAll : false,
		submitBtn: null,
		//autoSubmit: true,
		collection: null,
		itemList: undefined,
		tableView: undefined,
		paging : undefined,
		//ajaxLoadingBox: undefined,
		init : function(cfg) {
			if (!this.key) this.key = this.__cid__;
			this._super(cfg);
			this._bindAll('search', 'doSearch', 'dataDispatch', 'submit');
			this.collection = new Coll({ type : FormItem });
			if (this.rootNode) this.submitBtn = $('input[type=submit]', this.rootNode);
			//this.disable(true);
			if (this.paging) {
				this.follow(this.paging);
				this.paging.follow(this);
				this.tableView && this.paging.follow(this.tableView);
				this.tableView && this.tableView.follow(this.paging);
				this.tableView && this.tableView.follow(this);
			}
			this.createItem();
			this.registerEvents();
		},
		registerEvents: function() {
			//var evt = this.type == 'single' ? this.submit : this.doSearch;
			$(this.rootNode).submit(this.type == 'single' ? this.submit : this.doSearch);
		},
		createItem: function() {
			util.each(this.itemList, function(item) {
				this.register('FORMITEM:VALIDATE', item);
				this.collection.push(item);
			}, this);
		},
		submit: function(e) {
			e.preventDefault();
			// validate all FormItem...
			this.validate();
			if (this.validateAll) {
				//submit...
				console.log( this.getData() );
			}
		},
		validate: function() {
			this.emit('FORMITEM:VALIDATE'); //call formItem's validate
			util.each(this.collection.get(), function(item) {
				this.validateAll = item.validate;
				if (!item.validate) return 'break';
			}, this, 'break');
			
			return this.validateAll;
		},
		disable : function() {
		},
		getData : function() {// returns all elements' data
			var t = {};
			util.each(this.collection.get(), function(v) {
				t = util.mix(t, v.getData());
			}, this);
			
			return t;
		},
		receiver: function(e) {
			if (!e) return;
			var targ = e.target, evt = e.name.split(':')[1];
			switch (evt) {
				case 'SETPAGEDEFAULT':
					this.pageDefault = arguments[1];
					break;
				case 'SETPAGECOLLECTION':
					this.pageCollection = arguments[1];
					break;
				case 'DOSEARCH':
					this.doSearch(arguments[1]);
					break;
				
			}
		},
		doSearch : function(e) {
			// TODO:
			// to deal with different framework's events handler
			var pageDefault, cll, size, sv, sizeData, postData, isEvent = false;
			if (e && e.preventDefault) {
				e.preventDefault();
				isEvent = true;
			}

			if ((isEvent || (!isEvent && !e) ) && this.validate()) {// trigger by event // direct operation
				this.emit('PAGINATOR:GETDEFAULTPAGE');
				this.emit('PAGINATOR:GETCOLLECTION');
				pageDefault = this.pageDefault;
				cll = this.pageCollection;
				size = cll.get('size');
				sizeData = size.get();
				sv = util.values(sizeData)[0];
				postData = util.mix(this.getData(), util.isEmpty(sv) ? pageDefault.size : sv, pageDefault.number || {});
			} else {
				if (!isEvent && e && this.validate()) {// triggered by paginator
					postData = util.mix({}, this.getData(), e);
				}
			}
			if (postData)
				this.search(postData);
		},
		customSearch: function(data) {
			// ...
		},
		search : function(data) {
			//console.log('search');
			this.customSearch.call(this, data);
		},
		dataDispatch: function(data) {
			/**
			 * data struct
			 * {
			 *     result:{
			 *         detail : [{...},{...}...]
			 *     },
			 *     paging:{
			 *        current: 1
			 *		  sizePerPage: 20
			 *		  totalItems: 6
			 *     }
			 * }
			 */
			//TODD:
			// data validate
			// ...
			// data stuct error
			if (!data.queryForm || !data.result || !data.result.paging) {//!(data.paging.size || data.paging.page || data.paging.number)
				//this.applyInterface('error');
				console.log('data stuct error!');
				return;
			}
			// TODO:
			// no result
			//if (data.result.length == 0) {
			//	console.log('no result.');
			//	return;
			//}
			// to table
			this.emit('TABLE:TABLERENDER', data.result.detail);
			// to paginator
			this.emit('PAGINATOR:PAGINGRENDER', data.result.paging);
			//this.applyInterface('render', data);
		}
	}).inherits(Cell);
	
	module.exports = Form;

});