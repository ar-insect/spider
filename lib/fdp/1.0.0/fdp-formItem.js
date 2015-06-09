/**
 * @fileOverview fdp's FormItem module definition based on Cellula.
 * @description: defines form module
 * @namespace: FDP
 * @version: 1.0.0
 */
define(function(require, exports, module) {

	var FDP = require('./fdp-namespace');

	var Cellula = require('cellula');
	var $ = require('$');
	
	var util = Cellula._util, Class = Cellula.Class, Element = Cellula.Element, Cell = Cellula.Cell, Coll = Cellula.Collection;
	
	var itemType = ['INPUT', 'SELECT', 'RADIO', 'CHECKBOX', 'TEXTAREA'];
	
	var FormItem = FDP.FormItem = new Class('FormItem', {
		type : 'input', // validated type is `input` `select` `radio` 'checkbox' `textarea` todo ...
		require : true,
		validate : false,
		hideClass : 'fn-hide',
		errorClass: 'mi-form-item-error',
		errorMessage: undefined,
		tipClass : 'mi-form-explain',
		label : undefined,
		tip : undefined,
		element : undefined,
		tipElement : undefined,
		name: undefined,
		value : undefined,
		beforeValidate: undefined,
		afterValidate: undefined,
		init : function(conf) {
			this._super(conf);
			this.key = this.key ? this.key : this.__cid__;
			this.type = this.type.toUpperCase();
			if (this.allowItemType()) throw new Error('formItem type is error!');
			this.setElement();
			this._bindAll('focus', 'blur');
			this.bindDefaultEvent();
		},
		revalidate: function(e) {
			this.triggerValidate(e);
		},
		allowItemType: function() {
			return $.inArray(this.type, itemType) == -1;
		},
		setElement : function() {
			var i, arr = [];
			var tipElement = this.rootNode && util.getElementsByClassName(this.tipClass, this.rootNode)[0];
			if (this.type == 'INPUT' || this.type == 'TEXTAREA' || this.type == 'SELECT') {
				this.element = this.rootNode && this.rootNode.getElementsByTagName(this.type);
				if (this.element.length == 1) {
					// single item
					this.element = this.element[0];
					this.name = this.element && this.element.name;
				} else {
					// multiple (item team)
					/*
					 * {
					 * 	ele: element,
					 *  name: name,
					 *  value: value
					 *  ...
					 * }
					 */
					for (i = 0, len = this.element.length; i < len; i++) {
						arr.push({
							ele: this.element[i],
							name: this.element[i].name,
							value: this.element[i].value
						});
					}
					this.element = arr;
				}
			}
			if (this.type == 'RADIO' || this.type == 'CHECKBOX') {
				this.element = $('[type=' + this.type + ']', this.rootNode);
				this.name = this.element && this.element[0].name;
			}
			if (tipElement) {
				this.tipElement = tipElement;
				this.tip = this.tipElement.innerHTML;
			}
		},
		getData : function() {
			var i, len, n, v, o = {}, data = {};
			if (util.isArray(this.element)) {
				for (i = 0, len = this.element.length; i < len; i++) {
					//o = null;
					n = this.element[i]['name'];
					v = this.element[i]['value'];
					o[n] = v;
					util.mix(data, o);
				}
			} else 
				data[this.name] = this.value;
			
			return data;
		},
		save : function(v) {
			var i, len;
			var arr = [];
			
			if (v === true) {
				this.validate = true;
				if (this.type == 'INPUT' || this.type == 'TEXTAREA') {
					if (util.isArray(this.element)) {
						for (i = 0, len = this.element.length; i < len; i++) {
							this.element[i]['value'] = util.trim(this.element[i]['ele'].value);
						}
					} else {
						this.value = this.element && util.trim(this.element.value);
					}
				} else if (this.type == 'SELECT') {
					this.value = this.element && this.element.options[this.element.selectedIndex].value;
				} else if (this.type == 'RADIO') {
					for (i = 0, len = this.element.length; i < len; i++) {
						if (this.element[i].checked) {
							this.value = this.element[i].value;
							break;
						}
					}
					//console.log(this.value);
				} else if (this.type == 'CHECKBOX') {
					for (i = 0, len = this.element.length; i < len; i++) {
						if (this.element[i].checked) {
							arr.push(this.element[i].value);
						}
					}
					this.value = arr.join(',');
					//console.log(this.value);
				} else {
					try {
						this.value = this.element && util.trim(this.element.value);
					} catch(e) {
						throw new Error('formItem type is error!');
					}
				}
			} else {
				// error...
				this.validate = false;
				//this.value = '';
			}
		},
        bindDefaultEvent : function() {
			if (this.type == 'INPUT' || this.type == 'TEXTAREA') {
				$(this.element).blur(this.blur);
				$(this.element).focus(this.focus);
			}
		},
		setDefaultTip : function() {
			this.tipElement.innerHTML = this.tip;
			util.removeClass(this.tipElement.parentNode, this.errorClass);
		},
		isEmpty : function(v) {
			return util.isEmpty(v);
		},
		rule: {
			/** This rule can be customized **/
			/** Must show that the return true or false **/
		},
		rollback: function() {
			var r = true;
			if (util.isObject(this.rule)) {
				util.each(this.rule, function(fn, k) {
					if (util.isFunction(fn)) {
						if (!fn.call(this)) { r = false; return 'break'; }
					}
				}, this, 'break');
			}
			return r;
		},
		/** This function is used to trigger a check **/
		triggerValidate : function() {
			var i, r, t, len;
			var value;
			var checked = false;
			// 验证之前触发 TODO
			if (this.beforeValidate && util.isFunction(this.beforeValidate)) this.beforeValidate.apply(this, arguments);
			
			if (this.require) {
				if (this.type == 'INPUT' || this.type == 'TEXTAREA' || this.type == 'SELECT') {
					// 验证是否为空
					t = this.type == 'SELECT' ? '请选择' : '请填写';
					if (util.isArray(this.element)) {
						//if (this.element[0].type.toUpperCase() == '')
						for (i = 0, len = this.element.length; i < len; i++) {
							if (this.isEmpty(this.element[i]['ele'].value)) {
								this.save(false);
								this.errorMessage =  t + this.label;
								this.error();
								return false;
								//break;
							}
						}
					} else {
						t = this.element.type.toUpperCase() == 'FILE' ? '请选择': t;
						value = this.element.value;
						if (this.isEmpty(value)) {
							this.save(false);
							this.errorMessage =  t + this.label;
							this.error();
							return false;
						}
					}
				}
				if (this.type == 'RADIO' || this.type == 'CHECKBOX') {
					util.each(this.element, function(item) {
						if (item.checked) {
							checked = true;
							return 'break';
						}
					}, this, 'break');
					if (!checked) {
						this.save(false);
						this.errorMessage = '请选择' + this.label;
						this.error();
						return false;
					}
				}
				// 验证rule规则
				r = this.rollback();
				if (!r) { this.save(false); this.error(); return false; }
			} else {
				if (this.type == 'INPUT' || this.type == 'TEXTAREA') {
					if (util.isArray(this.element)) {
						for (i = 0, len = this.element.length; i < len; i++) {
							if (!this.isEmpty(this.element[i]['ele'].value)) {
								r = this.rollback();
								if (!r) { this.save(false); this.error(); return false; }
								//break;
							}
						}
					} else {
						value = this.element.value;
						if (!this.isEmpty(value)) {
							// 如果value不为空则验证。
							r = this.rollback();
							if (!r) { this.save(false); this.error(); return false; }
						}
					}
				}
			}
			this.save(true);
			this.setDefaultTip();
			// 验证后触发 TODO
			if (this.afterValidate && util.isFunction(this.afterValidate)) this.afterValidate.apply(this, arguments);
		},
		error : function() {
			if (this.tipElement && !this.validate) {
				this.tipElement.innerHTML = this.errorMessage || (window.console && console.log('errorMessage is null.')) || '';
				util.addClass(this.tipElement.parentNode, this.errorClass);
			}
		},
		focus : function(e) {
			this.setDefaultTip();
		},
		blur : function(e) {
			this.triggerValidate(e);
		},
		receiver : function(e) {
			if (!e) return;
			var targ = e.target, evt = e.name.split(':')[1];
			switch (evt) {
				case 'VALIDATE':
					this.revalidate(e);
					break;
			}
		}
	}).inherits(Cell);

	module.exports = FormItem;

});