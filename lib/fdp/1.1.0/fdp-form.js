/**
 * @fileOverview fdp's form module definition based on Cellula.
 * @description: defines form module
 * @namespace: FDP
 * @version: 1.1.0
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
		type: 'SINGLE',
		validateAll : undefined,
		element: undefined,
		submitButton: undefined,
		autoSubmit: true,
		isDisabled: false,
		disabledClass: 'mblue',
		transcript: {},
		collection: null,
		itemList: undefined,
		tableView: undefined,
		paging : undefined,
		onFormValidated: undefined,
		//ajaxLoadingBox: undefined,
		init : function(cfg) {
			this._super(cfg);
			if (!this.key) this.key = this.__cid__;
			this._bindAll('search', 'doSearch', 'dataDispatch', 'prepare');
			this.collection = new Coll({ type : FormItem });
			if (this.rootNode) {
				this.element = $('form', this.rootNode);
				this.submitButton = $('input[type=submit]', this.rootNode);
			}
			if (this.isDisabled) this.disabled(true);
			if (this.paging) {
				this.follow(this.paging);
				this.paging.follow(this);
				if (this.tableView) {
                    this.paging.follow(this.tableView);
                    this.tableView.follow(this.paging);
                    this.tableView.follow(this);
                    this.follow(this.tableView);
                }
			}
			this.createFormItems() && this.registerEvents();
            this.trans();
		},
		disabled: function(flag) {
			if (flag) {
				this.submitButton.attr('disabled', 'disabled');
				this.submitButton.parent().addClass('mi-button-' + this.disabledClass + '-disabled');
			} else {
				this.submitButton.removeAttr('disabled');
				this.submitButton.parent().removeClass('mi-button-' + this.disabledClass + '-disabled');
			}
		},
		registerEvents: function() {
			//var evt = this.type == 'single' ? this.submit : this.doSearch;
			//$(this.rootNode).submit(this.type == 'single' ? this.prepare : this.doSearch);
			$(this.rootNode).on('submit', this.prepare);
		},
		createFormItems: function() {
			if (!this.itemList || !$.isPlainObject(this.itemList)) return;
			
			util.each(this.itemList, function(item) {
				item.register('FORMITEM:TRIGGERFORM', this);
				this.register('FORMITEM:VALIDATEING', item);
				this.collection.push(item);
			}, this);
			
			return this.itemList;
		},
        trans: function() {
            var _self = this;
            util.each(_self.collection.get(), function(item) {
                _self.transcript[item.key] = false;
            });
        },
		prepare: function(e) {
			e.preventDefault();
			this.validate(e); // validate all FormItem...
		},
		submit: function(opt) {
			if (opt.validate) {
                //submit...
				window.console && console.log( this.getData() );
                if (this.type == 'SEARCH') this.doSearch();
			}
		},
		validate: function(e) {
			//this.transcript = {};
            this.trans();
			this.emit('FORMITEM:VALIDATEING'); //call formItem's validate
		},
		objLen: function(a) {
			var i;
			var count = 0;
			for (i in a) {
			    if (a.hasOwnProperty(i)) {
			        count++;
			    }
			}
			return count;
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
				case 'TRIGGERFORM':
					var k = targ['key'],
						v = targ['validate'],
						tg = arguments[1]['tg'];
					this.transcript[k] = v;
					// TODO:
					//if (this.collection.size() == this.objLen(this.transcript)) {
						util.each(this.transcript, function(v, i) {
							if (v === false) {
								this.validateAll = false;
								return 'break';
							} else this.validateAll = true;
						}, this, 'break');
						if (this.validateAll) this.disabled(false);
						if (tg === 'FORM') {
							var opts = {
								validate: this.validateAll, 
								form: this.element
							};
							if (this.autoSubmit)
                                this.submit(opts);
							else
								this.onFormValidated && this.onFormValidated.call(this, opts);
						}
					//}
					if (this.isDisabled) {
						// validate is `true` and item isn't required
						var p, req, vld;
						var flag = false;
						var colls = this.collection.get();
						for (p = 0, len = colls.length; p < len; p++) {
							var req = colls[p].required,
								vld = colls[p].validate;
							if (!req && vld) continue;
							if (!req && !vld) { 
								flag = vld;
								if (!flag) break;
							}
							if (req) {
								flag = vld;
								if (!flag) break;
							}
						}
						this.disabled(!flag);
						window.console && console.log( flag );
					}
					break;
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

			if ((isEvent || (!isEvent && !e) )) {// trigger by event // direct operation
				this.emit('PAGINATOR:GETDEFAULTPAGE');
				this.emit('PAGINATOR:GETCOLLECTION');
				pageDefault = this.pageDefault;
				cll = this.pageCollection;
				size = cll.get('size');
				sizeData = size.get();
                sv = util.values(sizeData)[0];
				postData = util.mix(this.getData(), util.isEmpty(sv) ? pageDefault.size : sv, pageDefault.number || {});
			} else {
				if (!isEvent && e) {// triggered by paginator
					postData = util.mix({}, this.getData(), e);
				}
			}
			if (postData) this.search(postData);
		},
		customSearch: function(data) {
			// ...
            window.console && console.log(data);
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
				//console.log('data stuct error!');
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
		}
	}).inherits(Cell);
	
	// addForm API
	Form.build = function(name, param) {
		if (typeof name !== 'string') throw new Error('`name` is expect a String type parameters.');
		if ($.isPlainObject(param)) {
			return new Class(name, param, 'NEW').inherits(FDP.Form);
		}
		return null;
	};
	
	module.exports = Form;

});