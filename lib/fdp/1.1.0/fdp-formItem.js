/**
 * @fileOverview fdp's FormItem module definition based on Cellula.
 * @description: defines form module
 * @namespace: FDP
 * @version: 1.1.0
 */
define(function(require, exports, module) {

	var FDP = require('./fdp-namespace');
	var Async = require('./async');
	var Cellula = require('cellula');
	var $ = require('$');
	
	var util = Cellula._util, Class = Cellula.Class, Element = Cellula.Element, Cell = Cellula.Cell, Coll = Cellula.Collection;
	
	var itemType = ['INPUT', 'SELECT', 'RADIO', 'CHECKBOX', 'TEXTAREA'];
	
	function allowItemType(type) {
		return $.inArray(type, itemType) == -1;
	}
	
	function Rule(name, oper, item) {
		this.name = name;
		// TODO support RegExp...
		if (oper instanceof RegExp) {
	        this.operator = function (opts, commit) {
	            var rslt = oper.test($(opts.element).val());
	            commit(rslt ? null : opts.rule, item.getMessage(opts, rslt));
	        };
    	} else if ($.isFunction(oper)) {
			this.operator = function(opts, commit) {
				// 如果是异步，则返回  undefined 进入下面的commit
				var rslt = oper.call(this, opts, function(result, msg) {
					commit( result ? null : opts.rule, msg || item.getMessage(opts, result));
				});
				// 同步则进入下面的 commit
				if (rslt !== undefined) {
					commit( rslt ? null : opts.rule, item.getMessage(opts, rslt));
				}
			};
		} else {
			throw new Error('The second argument must be a function.');
		}
	}
	
	var FormItem = FDP.FormItem = new Class('FormItem', {
		type : 'input', // item type is `input` `select` `radio` 'checkbox' `textarea` todo ...
		required : true,
        skipNull: false,
        validate : false,
		hideClass : 'fn-hide',
		errorClass: 'mi-form-item-error',
		//errorMessage: undefined,
		messages: {},
		tipClass : 'mi-form-explain',
		label : undefined,
		tip : undefined,
		element : undefined,
		tipElement : undefined,
		//name: undefined,
		value : undefined,
		beforeValidate: undefined,
		afterValidate: undefined,
		rules: {},
		init : function(conf) {
			this._super(conf);
			this.key = this.key ? this.key : this.__cid__;
			this.type = this.type.toUpperCase();
			this.setElement();
			this._bindAll('blur', 'focus', 'change');
			this.bindDefaultEvent();
			this.isRequired();
		},
		getOperator: function(name) {
			return this.rules[name].operator;
		},
		addRule: function(name, operator, message) {
			var _self = this;
			if (util.isObject(name)) {
				util.each(name, function(i, v) {
					if (util.isArray(v))
						_self.addRule(i, v[0], v[1]);
					else
						_self.addRule(i, v);
				});
				return _self;
			}
			
			if (operator instanceof Rule) {
				_self.rules[name] = new Rule(name, operator.operator, _self);
			} else {
				_self.rules[name] = new Rule(name, operator, _self);
			}
			
			_self.setMessage(name, message);
			
			return _self;
		},
		getMessage: function(options, isSuccess) {
			var ruleName = options.rule;
			var msgtpl;
			
			if (options.message) {// specifies a message
				if ($.isPlainObject(options.message)) {
					msgtpl = options.message[ isSuccess ? 'success' : 'failure'];
					
					typeof msgtpl === 'undefined' && ( msgtpl = messages[ruleName][ isSuccess ? 'success' : 'failure']);
				} else {
					msgtpl = isSuccess ? '' : options.message;
				}
			} else {// use default
				msgtpl = this.messages[ruleName][ isSuccess ? 'success' : 'failure'];
			}
			return msgtpl ? this.compileTpl(options, msgtpl) : msgtpl;
		},
		setMessage: function(name, msg) {
			var _self = this;
			if ($.isPlainObject(name)) {
				$.each(name, function(i, v) {
					_self.setMessage(i, v);
				});
				return _self;
			}
			
			if ($.isPlainObject(msg)) {
				_self.messages[name] = msg;
			} else {
				_self.messages[name] = {
					failure : msg
				};
			}
			return _self;
		},
		compileTpl: function(obj, tpl) {
			var result = tpl;
			
			var regexp1 = /\{\{[^\{\}]*\}\}/g, regexp2 = /\{\{(.*)\}\}/;
			
			var arr = tpl.match(regexp1);
			arr && $.each(arr, function(i, v) {
				var key = v.match(regexp2)[1];
				var value = obj[$.trim(key)];
				result = result.replace(v, value);
			});
			return result;
		},
		getRules: function() {
			var arr = [];
			util.each(this.rules, function(v, i) {
				arr.push(i);
			});
			return arr;
		},
		parseRule: function(str) {
			var match = str.match(/([^{}:\s]*)(\{[^\{\}]*\})?/);
			
			return {
	            name: match[1],
	            param: $.parseJSON(match[2])
	        };
		},
		getMsgOptions: function(param, ruleName) {
			var options = $.extend({}, param, {
		        element: this.element,
		        display: this.label,
		        rule: ruleName
		    });
		    
		    var message = undefined; // TODO
		    if (message && !options.message) {
		        options.message = {
		            failure: message
		        };
		    }
			
			return options;
		},
		setElement : function() {
			var i, eles = [];
			var type = this.type;
			var tipElement = this.rootNode && util.getElementsByClassName(this.tipClass, this.rootNode)[0];
			
			if (allowItemType(type)) throw new Error('formItem type is error!');
			
			if (type == 'INPUT' || type == 'TEXTAREA' || type == 'SELECT') {
				
				this.element = this.rootNode && this.rootNode.getElementsByTagName(type);
				
				if (this.element.length == 1) {
					// single item
					this.element = this.element[0];
				} else {
					// multiple (item team)
					for (i = 0, len = this.element.length; i < len; i++) {
						eles.push( this.element[i] );
					}
					this.element = eles;
				}
			}
			
			if (type == 'RADIO' || type == 'CHECKBOX') {
				this.element = $('[type=' + type + ']', this.rootNode);
				// 取第一个元素的 name
				//this.name = this.element && util.isArray(this.element) && this.element[0].name;
			}
			
			if (tipElement) {
				this.tipElement = tipElement;
				this.tip = this.tipElement.innerHTML;
			}
		},
		isEmpty: function(ele) {
			if (util.isArray(ele)) {
				for (var i = 0, len = ele.length; i < len; i++)
					if (ele[i].value == '') { break; return true; }
			} else {
				return ele.value == '';
			}

			return false;
		},
		getData : function() {
			var i, elen, vlen, n, v, o = {}, data = {};
			if (util.isArray(this.element) && util.isArray(this.value)) {
				elen = this.element.length;
				vlen = this.value.length;
				if (elen != vlen) return;
				for (i = 0; i < elen; i++) {
					//o = null;
					n = this.element[i].name;
					v = this.value[i];
					o[n] = v;
					util.mix(data, o);
				}
			} else 
				data[this.element.name] = this.value;
			
			return data;
		},
		save: function(v) {
			var i, len;
			var val = [];
			if (v === true) {
				if (this.type == 'INPUT' || this.type == 'TEXTAREA') {
					if (util.isArray(this.element)) {
						for (i = 0, len = this.element.length; i < len; i++) {
							//this.element[i]['value'] = util.trim(this.element[i]['ele'].value);
							val.push( util.trim(this.element[i].value) );
						}
					} else {
						val = util.trim(this.element.value);
					}
				} else if (this.type == 'SELECT') {
					val = this.element.options[this.element.selectedIndex].value;
				} else if (this.type == 'RADIO') {
					for (i = 0, len = this.element.length; i < len; i++) {
						if (this.element[i].checked) {
							val = this.element[i].value;
							break;
						}
					}
					//console.log(this.value);
				} else if (this.type == 'CHECKBOX') {
					for (i = 0, len = this.element.length; i < len; i++) {
						if (this.element[i].checked) {
							val.push(this.element[i].value);
						}
					}
					val = val.join(',');
					//console.log(this.value);
				} else {
					try {
						val = util.trim(this.element.value);
					} catch(e) {
						throw new Error('formItem type is error!');
					}
				}
				this.value = val;
				this.validate = true;
			} else {
				// error...
				if (v === false) this.validate = false;
			}
		},
        bindDefaultEvent : function() {
        	var type = this.type, element = this.element;
			if (type == 'INPUT' || type == 'TEXTAREA') {
				$(element).on('blur', this.blur);
				$(element).on('focus', this.focus);
			}
			/*if (type == 'TEXTAREA') { 
				$(element).on('change keyup', this.change); 
			}*/
			if (type == 'RADIO' || type == 'CHECKBOX' || type == 'SELECT') 
				$(element).on('change', this.change);
		},
		setDefaultTip : function(str) {
			this.tipElement.innerHTML = str || this.tip;
			util.removeClass(this.tipElement.parentNode, this.errorClass);
		},
		isRequired: function() {
			var _self = this;
			var i, r, t, len, value;
			var type = _self.type, checked = false;
			
			if (_self.required) {
				if (!_self.skipNull) _self.addRule('required', function(options) {
					if (type == 'INPUT' || type == 'TEXTAREA' || type == 'SELECT') {
						// 验证是否为空
						//t = type == 'SELECT' ? '请选择' : '请填写';
						if (this.isEmpty(options.element)) {
							return false;
						}
					}
					if (type == 'RADIO' || type == 'CHECKBOX') {
						util.each(options.element, function(item) {
							if (item.checked) {
								checked = true;
								return 'break';
							}
						}, this, 'break');
						if (!checked) return false;
					}
					return true;
				}, '请输入' + _self.label);
			} else {
                // 如果为空且非必须的字段则直接保存
				if (this.isEmpty(this.element)) {
					this.save(true);
					this.emit('FORMITEM:TRIGGERFORM', {tg: undefined});
				}
			}
		},
		triggerValidate: function() {
			var tg = arguments[1] ? arguments[1] : arguments[0];
			//var se = tg === 'FORM' ? 'TRIGGERFORM' : 'TRIGGERITEM';
			if (!this.required) { // 非必需字段且为空
				if (this.isEmpty(this.element)) { 
					this.setDefaultTip();
					this.save(true);
					this.emit('FORMITEM:TRIGGERFORM', {tg: tg});
					return;
				} else {
                    if (util.isEmpty(this.rules)) {
                        // 无自定义规则
                        this.setDefaultTip();
                        this.save(true);
                        this.emit('FORMITEM:TRIGGERFORM', {tg: tg});
                        return;
                    }
                    this.todo(tg);
                }
			} else {
				this.todo(tg);
			}
		},
		/** This function is used to trigger a check **/
		todo : function(tg) {
			var _self = this;
			var rules = this.getRules();
								
			if (!util.isArray(rules)) throw new Error("No validation rule specified or not specified as an array.");
			var tasks = [];
			
			$.each(rules, function (i, item) {
				var obj = _self.parseRule(item), ruleName = obj.name, param = obj.param;
				var ruleOperator = _self.getOperator(ruleName);
				if (!ruleOperator) throw new Error('Validation rule with name "' + ruleName + '" cannot be found.');
				var options = _self.getMsgOptions(param, ruleName);
				tasks.push(function(cb) {
	            	ruleOperator.call(_self, options, cb);
	            });
			});
			
			Async.series(tasks, function(err, results) {
				//console.log(err); // null or 'rule name'
            	_self.execute(err, results[results.length - 1], tg);
       		});
			
		},
		execute: function(err, rslt, tg) {
			if (typeof err == 'string') {
				this.save(false);
				this.emit('FORMITEM:TRIGGERFORM', {tg: tg});
				this.error(rslt);
				return;
			}
			if (err === null) {
				this.save(true);
				this.setDefaultTip(rslt);
				this.emit('FORMITEM:TRIGGERFORM', {tg: tg});
			}
		},
		error : function(msg) {
			if (this.tipElement && !this.validate) {
				this.tipElement.innerHTML = msg || (window.console && console.log('errorMessage is null.')) || '';
				util.addClass(this.tipElement.parentNode, this.errorClass);
			}
		},
		focus : function(e) {
			this.setDefaultTip();
		},
		blur : function(e) {
			this.triggerValidate(e);
		},
		change: function(e) {
			//var _self = this;
			this.triggerValidate(e);
		},
		receiver : function(e) {
			if (!e) return;
			var targ = e.target, evt = e.name.split(':')[1];
			switch (evt) {
				case 'VALIDATEING':
					this.triggerValidate(e, 'FORM');
					break;
			}
		}
	}).inherits(Cell);
	
	// addFormItem API
	FormItem.build = function(name, param) {
		if (typeof name !== 'string') throw new Error('`name` is expect a String type parameters.');
		if ($.isPlainObject(param)) {
			return new Class(name, param, 'NEW').inherits(FDP.FormItem);
		}
		return null;
	};
	
	module.exports = FormItem;

});
