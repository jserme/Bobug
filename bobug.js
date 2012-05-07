"use strict";
var Bobug = {};

//multi language  support
Bobug.lang = {};

Bobug.lang.en = {
	'log_console': 'Log Console',
	'collapse': 'Collapse',
	'expand': 'Expand',
	'pause': 'Pause',
	'clear': 'Clear',
	'run': 'run',
	'customize': 'Custom'
};

Bobug.lang.zh = {
	'log_console': '控制台',
	'collapse': '收起',
	'expand': '展开',
	'pause': '暂停',
	'clear': '清除',
	'run': '运行',
	'customize': '自定义'
};

(function(ns, undefined) {
	var uid = 0,

	slice = Array.prototype.slice,

	_$ = function(id) {
		return (typeof id == 'string') ? document.getElementById(id) : id;
	},

	each = function(arry, callback) {
		for (var i = 0; i < arry.length; i++) {
			callback(arry[i], i);
		}
	},

	hide = function(el) {
		el.style.display = 'none';
	},

	show = function(el) {
		el.style.display = 'block';
	},

    trim = function( str ) {
        return str.replace(/^\s*|\s*$/g, '')
    },

	//support multi copy
	$extend = function() {
		var args = slice.call(arguments),
		target = args.shift();

		each(args, function(v, i) {
			for (var key in v) {
				target[key] = v[key];
			}
		});

		return target;
	},

	addEvent = function(o, e, f) {
		o.addEventListener ? o.addEventListener(e, f, false) : o.attachEvent('on' + e, function() {
			f.call(o);
		});
	},

	mstpl = function(str, data) {
		if (!data) {
			return false;
		}

		var cache = {};
		var _inner = function(str, data) {
			var fn = ! /\W/.test(str) ? cache[str] = cache[str] || mstmpl(document.getElementById(str).innerHTML) : new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" +

			"with(obj){p.push('" +

			str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');");

			return data ? fn(data) : fn;
		};
		return _inner(str, data);
	},

	defaultSource = 'Bobug';

	//op
	// showPanel 
	// limit  
	function model(op) {
		this.uid = uid++;
		$extend(this, op);
	}

	model.prototype = {
		_logs: [],

		run: function(str) {
			//first
			var type = 'log',
			rst;

			try {
				rst = eval('(' + str + ')');
			} catch(e) {
				rst = e;
				type = 'error';
			}

			this.log([str, '<br/>', rst].join(''), type, defaultSource + ' Run');
		},

		putLog: function() {
			if (this._paused) {
				return false;
			}
			var args = slice.call(arguments),
			self = this;
			each(args, function(v, i) {
				//when we reach the limit ,first delete one log from the beigin 
				if (self.limit && self._logs.length == self.limit) {
					a.shift();
				}
				self._logs.push(v);
				if (self.filter(v)) self.fire('put', v);
			});
		},

		sort: function(sortFunc) {
			return this._logs.sort(sortFunc);
		},

		_filters: [],

		addFilter: function(type, func) {
			this._filters.push({
				type: type,
				func: func
			});
		},

		removeFilter: function(type) {
			var tmp = [];
			each(this._filters, function(v, i) {
				if (v.type !== type) {
					tmp.push(v);
				}
			});

			this._filters = [];
		},

		filter: function(log) {
			var tag = true;
			each(this._filters, function(v, i) {
				if (v.func(log)) tag = false;
			});

			return tag;
		},

		getLogs: function(len, func) {
			var rst = [],
			logsLen = this._logs.length,
			len = len > logsLen ? logsLen: len;
			for (var i = logsLen - 1; i >= 0 && len != 0; i--) {
				if (func(this._logs[i])) {
					rst.push(this._logs[i]);
					len--;
				}
			}

			return rst;
		},

		pause: function() {
			this._paused = true;
		},

		start: function() {
			this._paused = false;
		},

		clear: function() {
			this._logs = [];
			this.fire('clear');
		},

		log: function(msg, catalog, source) {
			var d = new Date();

			this.putLog({
				//force to be a string
				msg: msg + '',
				catalog: catalog,
				source: source,
				_time: [[d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-'), [d.getHours(), d.getMinutes(), d.getSeconds()].join(':'), d.getMilliseconds()].join(' ')
			});
		},

		//simple custom events 
		_evts: [],

		fire: function() {
			var args = slice.call(arguments),
			evt = args.shift(),
			self = this;

			each(this._evts, function(v, i) {
				if (v.e == evt) {
					v.f.apply(self, args);
				}
			});
		},

		each: function(func) {
			each(this._logs, function(v, i) {
				func(v, i);
			});
		},

		on: function(evt, callback) {
			this._evts.push({
				e: evt,
				f: callback
			});
		}
	};

	var view = function(o) {
		$extend(this, o);
		this.init();
	};

	view.prototype = {
		isRender: false,
		isShow: false,
		isExpland: true,
		el: null,

		init: function() {
			var self = this;
			this.model.on('put', function(log) {
				self.appendLog(log);
			});
			this.model.on('clear', function() {
				self.clear();
			});
		},

		appendLog: function(log) {
			if (!this.isRender) {
				return false;
			}
			var consolePan = this.getEl('console'),
			logEl = document.createElement('div');

			logEl.className = 'bobug-console-entry bobug-console-entry-' + log.catalog;

			logEl.innerHTML = mstpl(this.templates.entry, log);

			consolePan.appendChild(logEl);

			logEl.scrollIntoView();
		},

		templates: { //{{{
			box: '<div id="bobug_<%=uid%>" class="bobug-console-content">\
                    <div class="bobug-console-hd">\
                        <h4 class="bobug-console-title">\
                            <%=Lang.log_console%>\
                        </h4>\
                        <input type="button" id="collapse_<%=uid%>" class="bobug-console-button bobug-console-collapse" value="<%=Lang.collapse%>" />\
                    </div>\
                    <div class="bobug-console-bd" style="height: 258px; " id="console_<%=uid%>">\
                    </div>\
                    <div class="bobug-console-command"  id="command_<%=uid%>">\
                        <textarea id="cmd_<%=uid%>" ></textarea>\
                    </div>\
                    <div class="bobug-console-ft" id="footer_<%=uid%>">\
                        <div class="bobug-console-controls">\
                            <label for="pause_<%=uid%>" class="bobug-console-pause-label">\
                                <input type="checkbox" class="bobug-console-checkbox bobug-console-pause" value="1" id="pause_<%=uid%>">\
                                <%=Lang.pause%>\
                            </label>\
                            <input type="button" value="<%=Lang.run%>" class="bobug-console-button bobug-console-run " id="run_<%=uid%>">\
                            <button type="button" id="clear_<%=uid%>" class="bobug-console-button bobug-console-clear">\
                                <%=Lang.clear%>\
                            </button>\
                        </div>\
                        <div class="bobug-console-filters-categories" id="catalog_<%=uid%>">\
                            <label class="bobug-console-filter-label">\
                                <input type="checkbox" id="info_<%=uid%>"  value="info" checked  class="bobug-console-filter bobug-console-filter-info">\
                                info\
                            </label>\
                            <label class="bobug-console-filter-label">\
                                <input type="checkbox" id="error_<%=uid%>"  value="error" checked class="bobug-console-filter bobug-console-filter-error">\
                                error\
                            </label>\
                            <label class="bobug-console-filter-label">\
                                <input type="checkbox" id="warn_<%=uid%>"  value="warn" checked class="bobug-console-filter bobug-console-filter-warn">\
                                warn\
                            </label>\
                            <label class="bobug-console-filter-label">\
                                <input type="input" id="custom_<%=uid%>"  placeholder="<%=Lang.customize%>" value="" class="bobug-console-filter-custom">\
                            </label>\
                        </div>\
                    </div>\
                </div>',
			entry: '<p class="bobug-console-entry-meta">\
                            <span class="bobug-console-entry-src"><%=source%></span>\
                            <span class="bobug-console-entry-cat"><%=catalog%></span>\
                            <span class="bobug-console-entry-time"><%=_time%></span>\
                        </p>\
                        <pre class="bobug-console-entry-content"><%=msg%></pre>'
		}, //}}}
		events: {
			'click pause': 'togglePause',
			'click run': 'runCommand',
			'click info': 'filterInfo',
			'click error': 'filterError',
			'click warn': 'filterWarn',
			'keyup custom': 'filterCustom',
			'click clear': 'clear',
			'click collapse': 'togglePanel',
			'keydown command': 'canRun'
		},

		eventsFuncBuilder: function() {
			var self = this;
			self.togglePause = function() {
				this.checked ? self.model.pause() : self.model.start();
			};

			self.togglePanel = function() {
				if (self.isExpland) {
					hide(self.getEl('console'));
					hide(self.getEl('command'));
					hide(self.getEl('footer'));

					this.value = self.model.Lang.expand;

					self.isExpland = false;
				} else {
					show(self.getEl('console'));
					show(self.getEl('command'));
					show(self.getEl('footer'));

					this.value = self.model.Lang.collapse;

					//the last el should into view
					self.getEl('console').lastChild && self.getEl('console').lastChild.scrollIntoView();

					self.isExpland = true;
				}
			};

			self.runCommand = function() {
				var cmd = self.getEl('cmd').value;
				self.model.run(cmd);
			};

			self.canRun = function(e) {
				var e = e || window.event;
				if (e.ctrlKey && e.keyCode == 13) {
					e.preventDefault();
					self.runCommand();
					return false;
				}
			};

			self.filterInfo = function() {
				var isFilterInfo = !this.checked;
				//if we got the filter case
                if( isFilterInfo ) {
                    self.model.addFilter('filterInfo', function(log) {
                        if (log.catalog == 'info') return true;
                        return false;
                    });
                } else {
                    self.model.removeFilter('filterInfo');
                }

                self.reRenderLogs();
			};

			self.filterError = function() {
				var isFilterError = !this.checked;
				//if we got the filter case
                if( isFilterError ) {
                    self.model.addFilter('filterError', function(log) {
                        if (log.catalog == 'error') return true;
                        return false;
                    });
                } else {
                    self.model.removeFilter('filterError');
                }

                self.reRenderLogs();
			};

			self.filterWarn = function() {
				var isFilterWarn = !this.checked;
				//if we got the filter case
                if( isFilterWarn ) {
                    self.model.addFilter('filterWarn', function(log) {
                        if (log.catalog == 'warn') return true;
                        return false;
                    });
                } else {
                    self.model.removeFilter('filterWarn');
                }

                self.reRenderLogs();
			};

			//TODO
			self.filterCustom = function() {
                var val = trim(this.value);

                if( val ) {
                    self.model.addFilter('filterCustomStr', function(log) {
                        if (log.msg.indexOf( val ) == -1 ) return true;
                        return false;
                    });
                } else {
                    self.model.removeFilter('filterCustomStr');
                }

                self.reRenderLogs();
			};

			self.clear = function() {
				self.getEl('console').innerHTML = '';
			};
		},

		getEl: function(str) {
			return _$(str + '_' + this.model.uid);
		},

		reRenderLogs: function() {
			this.clear();
            var self = this;
            this.model.each(function( v, i){
                if( self.model.filter(v) ) {
                    self.appendLog( v );        
                }
            });

			self.getEl('console').lastChild && self.getEl('console').lastChild.scrollIntoView();
		},

		delegateEvents: function() {
			var uid = this.model.uid,
			e, o;

			this.eventsFuncBuilder();

			for (var key in this.events) {
				e = key.split(' ')[0];
				o = this.getEl(key.split(' ')[1]);

				addEvent(o, e, this[this.events[key]]);
			}
		},

		show: function() {
			this.render();
			show(this.el);
			this.isShow = true;
		},

		hide: function() {
			hide(this.el);
			this.isShow = false;
		},

		render: function() {
			if (this.isRender) {
				return false;
			}

			if (!this.el) {
				this.el = document.createElement('div');
			}

			this.el.style.cssText = 'width:500px;display:none';
			this.el.innerHTML = mstpl(this.templates.box, this.model);

			this.isRender = true;

			if (!this.container) {
				this.container = document.body;
			}

			this.container.appendChild(this.el);

			this.delegateEvents();
		}
	};

	ns.model = new model({
		limit: 200
	});

	ns.view = new view({
		model: ns.model
	});

	$extend(ns, {
		show: function() {
			this.view.show();
		},

		hide: function() {
			this.view.hide();
		},

		log: function(msg, catalog, source) {
			this.model.log(msg, catalog || 'log', source || defaultSource);
		},

		info: function(msg, source) {
			this.log(msg, 'info', source || defaultSource);
		},

		warn: function(msg, source) {
			this.log(msg, 'warn', source || defaultSource);
		},

		error: function(msg, source) {
			this.log(msg, 'error', source || defaultSource);
		},

		setLang: function(lang) {
			$extend(this.model, {
				Lang: $extend({}, ns.lang[lang])
			});
		},

		getLogs: function() {
			var args = slice.call(arguments),
			len = args.shift(),
			secondArg = args.shift(),
			thirdArg = args.shift(),
			func;

			if (secondArg == undefined) {
				func = function(log) {
					return true;
				};
			}

			if (typeof secondArg == 'function') {
				func = secondArg;
			} else if (typeof secondArg == 'string') {
				func = function(log) {
					if (log.catalog == secondArg) return true;
					return false;
				};
			}

			//third argument is avilable
			if (thirdArg != undefined) {
				func = function(log) {
					if (log.catalog == secondArg && log.source == thirdArg) return true;
					return false;
				};
			}

			return this.model.getLogs(len, func);
		},

		run: function(str) {
			this.model.run(str);
		},

		clear: function() {
			this.model.clear();
		},

		loadJs: function(src) {
			var s = document.createElement('script');
			s.src = src;
			document.head.insertBefore(s, document.head.lastChild);
		}
	});

	ns.setLang('en');
})(Bobug);

