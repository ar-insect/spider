/**
 * @fileOverview FDP's paging module definition based on Cellula.
 * @description: defines Paginator module
 * @namespace: FDP
 * @version: 1.1.0
 */
define(function(require, exports, module) {

	var FDP = require('./fdp-namespace');

	var Cellula = require('cellula');
	var $ = require('$');
	
	var Select = require('select');
	
	var util = Cellula._util, 
		Class = Cellula.Class, 
		Element = Cellula.Element, 
		Cell = Cellula.Cell, 
		Coll = Cellula.Collection;
	
	var SizeElement = new Class('SizeElement', {
		value: undefined,
		save: function(val) {
			return this.set(new Function("return {size : {sizeDefault:" + this.value + "}}").call(this));
		},
        init: function(conf) {
            this._super(conf);
			this.set({
				size: {
                    sizeDefault: 20
                }
			});
        }
    }).inherits(Element);
    
    var NumberElement = new Class('NumberElement', {
    	value: undefined,
    	save: function() {
    		return this.set(new Function("return {number : {currentPage:" + this.value + "}}").call(this));
    	},
    	init: function(conf) {
    		this._super(conf);
			this.set({
				number: {
					currentPage: 1
				}
			});
    	}
    }).inherits(Element);
    
    var PageElement = new Class('PageElement', {
    	save: function() {
    		window.console && console.log('save page element data');
    	},
    	items: {},
		options: {},
    	init: function(conf) {
    		this._super(conf);
			this.set({
				sizePerPage : 20,
				totalItems : null,
				current : 1
			});
    	}
    }).inherits(Element);
    
	var Paginator = FDP.Paginator = new Class('Paginator', {
		hideClass: 'fn-hide',
		sizeSelect: undefined,
		collection : undefined,
		pageDefault : {
			 size : {
			 	sizeDefault: 20
			 },
			 number: {
			 	currentPage: 1
			 },
			 page : {
				 first : 1, // optional
				 last : null, // optional
				 prev : null, // optional
				// prevDis: null,
				 next : null, // optional
				 //nextDis: null,
				 totalItems : null,
				 totalPages : null, // optional
				 current : null,
				 currentArray : null // optional
			 },
			 sizeDefault : 20,
			 sizeOptions : [10, 20, 50]
		},
		pageTpl : '<span class="mi-paging-info fn-ml15">每页</span>' +
				  '<select name="size" id="J_size">' +
				  '$-{#options}<option $-{#selected}selected $-{/selected} value="$-{num}">$-{num}</option>$-{/options}' +
				  '</select>' +
				  '<span class="mi-paging-info mi-paging-which"><input type="text" name="number" value="$-{current}"></span>' +
				  '<a href="javascript:;" class="mi-paging-item mi-paging-goto"><span class="paging-text">跳转</span></a>' +
				  '<span class="mi-paging-info fn-ml15"><span class="paging-text mi-paging-bold">$-{current}/$-{totalPages}</span>页</span>' +
				  '$-{#pre}<a href="javascript:;" class="mi-paging-item mi-paging-prev fn-mr10"><span class="paging-text">上一页</span><span class="mi-paging-icon"></span></a>$-{/pre}' +
				  '$-{#preDis}<span class="mi-paging-item mi-paging-prev mi-paging-prev-disabled fn-mr10"><span class="paging-text">上一页</span><span class="mi-paging-icon"></span></span>$-{/preDis}' +
				  '$-{#next}<a href="javascript:;" class="mi-paging-item mi-paging-next"><span class="paging-text">下一页</span><span class="mi-paging-icon"></span></a>$-{/next}' +
				  '$-{#nextDis}<span class="mi-paging-item mi-paging-next mi-paging-next-disabled"><span class="paging-text">下一页</span><span class="mi-paging-icon"></span></span>$-{/nextDis}'
		,
		typeEnum : {
			'first' : '\\bfirst\\b',
			'last' : '\\blast\\b',
			'prev' : '\\bprev\\b',
			'next' : '\\bnext\\b',
			'goto' : '\\bgoto\\b'
			//'current' : '\\bcurrent\\b'
            //'number' : '(\\D*)(\\d+)(\\D*)'
		},
		init : function(cfg) {
			this._super(cfg);
			this._bindAll('changeSize', 'paginate');
			this.collection = new Coll(); // type default Element
			this.collection.push(new SizeElement({key:'size'}));
			this.collection.push(new NumberElement({key: 'number'}));
			this.collection.push(new PageElement({key: 'page'}));
			//this.render();
		},
		receiver: function(e) {
			if (!e) return;
			var targ = e.target, evt = e.name.split(':')[1];
			switch (evt) {
				case 'PAGINGRENDER':
					this.render(arguments[1]);
					break;
				case 'GETDEFAULTPAGE':
					this.getDefault();
					break;
				case 'GETCOLLECTION':
					this.getCollection();
					break;
				case 'SYSTEMERROR':
					//util.addClass(this.rootNode, this.hideClass);
                    this.error();
					break;
				case 'NORESULT':
					//util.addClass(this.rootNode, this.hideClass);
                    this.show(false);
					break;
			}
		},
		getDefault : function() {
			this.emit('FORM:SETPAGEDEFAULT', this.pageDefault);
		},
		getCollection: function() {
			this.emit('FORM:SETPAGECOLLECTION', this.collection);
		},
		getOperationType : function(name) {
			for (var n in this.typeEnum) {
				if (new RegExp(this.typeEnum[n]).test(name))
					return n;
			}
		},
		calcNumber : function(t) {
			var type = this.getOperationType(t.className), p = this.collection.get('page'), c = parseInt(p.get('current')), l = parseInt(p.get('totalPages'));
			if (type === undefined) {
				return /(\D*)(\d+)(\D*)/.exec(t.innerHTML) ? /(\D*)(\d+)(\D*)/.exec(t.innerHTML)[2] : undefined;
			}
			// if(type === 'first') return 1;
			if (type === 'last')
				return l;
			if (type === 'prev')
				return c - 1 > 1 ? c - 1 : 1;
			if (type === 'next')
				return c + 1 < l ? c + 1 : l;

			return 1;
		},
		operate : function(ct) {
			var number = this.collection.get('number'), gotoNum = this.calcNumber(ct);
			if (number && gotoNum) {
                number.value = gotoNum;
                return number.save();
				//return number.set(util.keys(number.get())[0], gotoNum);
			}
			return false;
		},
		paginate : function(e) {
			if (e && e.preventDefault) {
				e.preventDefault();
			}
			var cll = this.collection;
			if (this.getOperationType(e.currentTarget.className) === 'goto') {
				var pd = this.pageDefault;
				var gp = $('input[name=number]', this.rootNode);
				var size = cll.get('size'), sv = util.values(size.get())[0];
                var number = cll.get('number');
                var page = cll.get('page'), tp = util.values(page.get())[3];
				// 不符合规则的页码
                if (isNaN(parseInt(gp.val())) || parseInt(gp.val()) < 1) {
					gp.val( util.values(pd.number)[0] );
					number.value = util.values(pd.number)[0];
				} else {
					number.value = tp < gp.val() ? tp : gp.val();
				}
				number.save();
				if (util.isEmpty(sv))
                    size.set({size: this.pageDefault.size});
                    //size.value = this.pageDefault.size;
				//size.save(); ?
				this.emit('FORM:DOSEARCH', util.mix({}, util.values(size.get())[0], util.values(number.get())[0]));
			} else {
				if (this.operate(e.currentTarget)) {
					var size = cll.get('size'), sv = util.values(size.get())[0];
                    var number = cll.get('number');
					if (util.isEmpty(sv))
                        size.set({size: this.pageDefault.size});
                        //size.value = this.pageDefault.size;
					//size.save(); ?
					this.emit('FORM:DOSEARCH', util.mix({}, util.values(size.get())[0], util.values(number.get())[0]));
				}
			}
		},
        // 每页多少条记录
		changeSize : function(e) {
			var size = this.collection.get('size');
			size.value = this.sizeSelect.getValue();
			size.save();
			this.emit('FORM:DOSEARCH', util.mix({}, util.values(size.get())[0], this.pageDefault.number || {}));
		},
		prepareTplConfig : function(data) {
			var pageEl = this.collection.get('page');
			
			if (data)
				pageEl.set(data);
			
			var current = parseInt(pageEl.get('current')), 
                total = parseInt(pageEl.get('totalItems')),
                pds = this.pageDefault.size,
                sv = util.values(this.collection.get('size').get())[0],
                size = parseInt(util.isEmpty(sv) ? util.values(pds)[0] : util.values(sv)[0]),
                m = total % size,
                pages = (total - m) / size + (m > 0 ? 1 : 0),
                sd = this.pageDefault.sizeDefault,
                half = (sd - 1) / 2,
                tplCfg;

			if (current < 1)
				current = 1;
			if (current > pages)
				current = pages;

			pageEl.set({
				totalPages : pages
			});

			tplCfg = {
				size : size,
				pre : current !== 1,
				preDis: !(current !== 1),
				next : current !== pages,
				nextDis: !(current !== pages),
				options : [],
				totalItems : total,
				startItem : (current - 1) * size + 1,
				endItem : current * size > total ? total : current * size,
				totalPages : pages,
				totalShow : pages > sd ? (pages - half > current ? true : false) : false,
				ellipsis : pages > sd ? (pages - half - 1 > current ? true : false) : false,
				items : [
				//{num:5,currentClass:false}
				],
				current : current
			};

			for (var i = 1, l = (pages > sd ? sd : pages), h = half; i <= l; i++) {
				var num = 1;
				if (pages > sd) {
					if (current > half && current <= pages - half)
						num = current - h, h--;
					if (current > pages - half)
						num = pages - sd + i;
					if (current <= half)
						num = i;
				} else {
					num = i;
				}

				tplCfg.items.push({
					num : num,
					currentClass : current === num ? true : false
				});
			}

			if (util.isArray(this.pageDefault.sizeOptions)) {
				for (var i = 0, op = this.pageDefault.sizeOptions; i < op.length; i++) {
					tplCfg.options.push({
						num : op[i],
						selected : size === op[i]
					});
				}
			}
			
			return tplCfg;
		},
		error : function() {
			this.show(false);
		},
        show: function(flag) {
            if (flag) $(this.rootNode).removeClass(this.hideClass);
            else $(this.rootNode).addClass(this.hideClass);
        },
		registerEvents: function(conf) {
			if (this.sizeSelect) this.sizeSelect.onSelect = this.changeSize;
            $('.mi-paging-goto', this.rootNode).on('click', this.paginate);
            $('.mi-paging-item', this.rootNode).on('click', this.paginate);
            if (conf.preDis) $('.mi-paging-item.mi-paging-prev', this.rootNode).unbind('click');
            if (conf.nextDis) $('.mi-paging-item.mi-paging-next', this.rootNode).unbind('click');
		},
		render : function(data) {
			//data = data.result.paging;
			if (!util.isEmpty(data)) {
				//console.log(data);
				var sel, root = this.rootNode;
                var pageConf = this.prepareTplConfig(data);
				root.innerHTML = util.parseTpl(this.pageTpl, pageConf);
                window.console && console.log( pageConf );
				sel = $('select[name=size]', root);
				if (sel.length) { this.sizeSelect = new Select({ width : 58, size : 3, zIndex : 1 }).apply(sel[0]); }
                //if (pageConf.totalPages == 1) { this.show(false); return; }
                this.show(true);
                //util.removeClass(root, this.hideClass);
				this.registerEvents(pageConf);
			}
		}
	}).inherits(Cell);

    // addPaginator API
    Paginator.build = function(name, param) {
        if (typeof name !== 'string') throw new Error('`name` is expect a String type parameters.');
        if ($.isPlainObject(param)) {
            return new Class(name, param, 'NEW').inherits(FDP.Paginator);
        }
        return null;
    };

	module.exports = Paginator;
}); 