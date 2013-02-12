/*! yycjs-site - v0.1.0 - 2013-02-12
* http://yycjs.com
* Copyright (c) 2013 Eric Kryski; Licensed  */

/*
* CanJS - 1.1.3 (2012-12-11)
* http://canjs.us/
* Copyright (c) 2012 Bitovi
* Licensed MIT
*/
(function (window, $, undefined) {
	// ## can/util/can.js
	var can = window.can || {};
	if (typeof GLOBALCAN === 'undefined' || GLOBALCAN !== false) {
		window.can = can;
	}

	can.isDeferred = function (obj) {
		var isFunction = this.isFunction;
		// Returns `true` if something looks like a deferred.
		return obj && isFunction(obj.then) && isFunction(obj.pipe);
	};
	// ## can/util/array/each.js
	can.each = function (elements, callback, context) {
		var i = 0,
			key;
		if (elements) {
			if (typeof elements.length === 'number' && elements.pop) {
				if (elements.attr) {
					elements.attr('length');
				}
				for (key = elements.length; i < key; i++) {
					if (callback.call(context || elements[i], elements[i], i, elements) === false) {
						break;
					}
				}
			} else if (elements.hasOwnProperty) {
				for (key in elements) {
					if (elements.hasOwnProperty(key)) {
						if (callback.call(context || elements[key], elements[key], key, elements) === false) {
							break;
						}
					}
				}
			}
		}
		return elements;
	};

	// ## can/util/jquery/jquery.js
	// _jQuery node list._
	$.extend(can, $, {
		trigger: function (obj, event, args) {
			if (obj.trigger) {
				obj.trigger(event, args);
			} else {
				$.event.trigger(event, args, obj, true);
			}
		},
		addEvent: function (ev, cb) {
			$([this]).bind(ev, cb);
			return this;
		},
		removeEvent: function (ev, cb) {
			$([this]).unbind(ev, cb);
			return this;
		},
		// jquery caches fragments, we always needs a new one
		buildFragment: function (result, element) {
			var ret = $.buildFragment([result], $(element));
			return ret.cacheable ? $.clone(ret.fragment) : ret.fragment;
		},
		$: $,
		each: can.each
	});

	// Wrap binding functions.
	$.each(['bind', 'unbind', 'undelegate', 'delegate'], function (i, func) {
		can[func] = function () {
			var t = this[func] ? this : $([this]);
			t[func].apply(t, arguments);
			return this;
		};
	});

	// Wrap modifier functions.
	$.each(["append", "filter", "addClass", "remove", "data", "get"], function (i, name) {
		can[name] = function (wrapped) {
			return wrapped[name].apply(wrapped, can.makeArray(arguments).slice(1));
		};
	});

	// Memory safe destruction.
	var oldClean = $.cleanData;

	$.cleanData = function (elems) {
		$.each(elems, function (i, elem) {
			if (elem) {
				can.trigger(elem, "destroyed", [], false);
			}
		});
		oldClean(elems);
	};

	// ## can/util/string/string.js
	// ##string.js
	// _Miscellaneous string utility functions._  
	// Several of the methods in this plugin use code adapated from Prototype
	// Prototype JavaScript framework, version 1.6.0.1.
	// © 2005-2007 Sam Stephenson
	var undHash = /_|-/,
		colons = /\=\=/,
		words = /([A-Z]+)([A-Z][a-z])/g,
		lowUp = /([a-z\d])([A-Z])/g,
		dash = /([a-z\d])([A-Z])/g,
		replacer = /\{([^\}]+)\}/g,
		quote = /"/g,
		singleQuote = /'/g,

		// Returns the `prop` property from `obj`.
		// If `add` is true and `prop` doesn't exist in `obj`, create it as an 
		// empty object.
		getNext = function (obj, prop, add) {
			return prop in obj ? obj[prop] : (add && (obj[prop] = {}));
		},

		// Returns `true` if the object can have properties (no `null`s).
		isContainer = function (current) {
			return (/^f|^o/).test(typeof current);
		};

	can.extend(can, {
		// Escapes strings for HTML.
		esc: function (content) {
			// Convert bad values into empty strings
			var isInvalid = content === null || content === undefined || (isNaN(content) && ("" + content === 'NaN'));
			return ("" + (isInvalid ? '' : content)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(quote, '&#34;').replace(singleQuote, "&#39;");
		},


		getObject: function (name, roots, add) {

			// The parts of the name we are looking up  
			// `['App','Models','Recipe']`
			var parts = name ? name.split('.') : [],
				length = parts.length,
				current, r = 0,
				ret, i;

			// Make sure roots is an `array`.
			roots = can.isArray(roots) ? roots : [roots || window];

			if (!length) {
				return roots[0];
			}

			// For each root, mark it as current.
			while (roots[r]) {
				current = roots[r];

				// Walk current to the 2nd to last object or until there 
				// is not a container.
				for (i = 0; i < length - 1 && isContainer(current); i++) {
					current = getNext(current, parts[i], add);
				}

				// If we can get a property from the 2nd to last object...
				if (isContainer(current)) {

					// Get (and possibly set) the property.
					ret = getNext(current, parts[i], add);

					// If there is a value, we exit.
					if (ret !== undefined) {
						// If `add` is `false`, delete the property
						if (add === false) {
							delete current[parts[i]];
						}
						return ret;

					}
				}
				r++;
			}
		},
		// Capitalizes a string.
		capitalize: function (s, cache) {
			// Used to make newId.
			return s.charAt(0).toUpperCase() + s.slice(1);
		},

		// Underscores a string.
		underscore: function (s) {
			return s.replace(colons, '/').replace(words, '$1_$2').replace(lowUp, '$1_$2').replace(dash, '_').toLowerCase();
		},
		// Micro-templating.
		sub: function (str, data, remove) {
			var obs = [];

			obs.push(str.replace(replacer, function (whole, inside) {

				// Convert inside to type.
				var ob = can.getObject(inside, data, remove === undefined ? remove : !remove);

				if (ob === undefined) {
					obs = null;
					return "";
				}

				// If a container, push into objs (which will return objects found).
				if (isContainer(ob) && obs) {
					obs.push(ob);
					return "";
				}

				return "" + ob;
			}));

			return obs === null ? obs : (obs.length <= 1 ? obs[0] : obs);
		},

		// These regex's are used throughout the rest of can, so let's make
		// them available.
		replacer: replacer,
		undHash: undHash
	});
	// ## can/construct/construct.js
	// ## construct.js
	// `can.Construct`  
	// _This is a modified version of
	// [John Resig's class](http://ejohn.org/blog/simple-javascript-inheritance/).  
	// It provides class level inheritance and callbacks._
	// A private flag used to initialize a new class instance without
	// initializing it's bindings.
	var initializing = 0;


	can.Construct = function () {
		if (arguments.length) {
			return can.Construct.extend.apply(can.Construct, arguments);
		}
	};


	can.extend(can.Construct, {

		newInstance: function () {
			// Get a raw instance object (`init` is not called).
			var inst = this.instance(),
				arg = arguments,
				args;

			// Call `setup` if there is a `setup`
			if (inst.setup) {
				args = inst.setup.apply(inst, arguments);
			}

			// Call `init` if there is an `init`  
			// If `setup` returned `args`, use those as the arguments
			if (inst.init) {
				inst.init.apply(inst, args || arguments);
			}

			return inst;
		},
		// Overwrites an object with methods. Used in the `super` plugin.
		// `newProps` - New properties to add.  
		// `oldProps` - Where the old properties might be (used with `super`).  
		// `addTo` - What we are adding to.
		_inherit: function (newProps, oldProps, addTo) {
			can.extend(addTo || newProps, newProps || {})
		},
		// used for overwriting a single property.
		// this should be used for patching other objects
		// the super plugin overwrites this
		_overwrite: function (what, oldProps, propName, val) {
			what[propName] = val;
		},
		// Set `defaults` as the merger of the parent `defaults` and this 
		// object's `defaults`. If you overwrite this method, make sure to
		// include option merging logic.
		setup: function (base, fullName) {
			this.defaults = can.extend(true, {}, base.defaults, this.defaults);
		},
		// Create's a new `class` instance without initializing by setting the
		// `initializing` flag.
		instance: function () {

			// Prevents running `init`.
			initializing = 1;

			var inst = new this();

			// Allow running `init`.
			initializing = 0;

			return inst;
		},
		// Extends classes.
		extend: function (fullName, klass, proto) {
			// Figure out what was passed and normalize it.
			if (typeof fullName != 'string') {
				proto = klass;
				klass = fullName;
				fullName = null;
			}

			if (!proto) {
				proto = klass;
				klass = null;
			}
			proto = proto || {};

			var _super_class = this,
				_super = this.prototype,
				name, shortName, namespace, prototype;

			// Instantiate a base class (but only create the instance,
			// don't run the init constructor).
			prototype = this.instance();

			// Copy the properties over onto the new prototype.
			can.Construct._inherit(proto, _super, prototype);

			// The dummy class constructor.


			function Constructor() {
				// All construction is actually done in the init method.
				if (!initializing) {
					return this.constructor !== Constructor && arguments.length ?
					// We are being called without `new` or we are extending.
					arguments.callee.extend.apply(arguments.callee, arguments) :
					// We are being called with `new`.
					this.constructor.newInstance.apply(this.constructor, arguments);
				}
			}

			// Copy old stuff onto class (can probably be merged w/ inherit)
			for (name in _super_class) {
				if (_super_class.hasOwnProperty(name)) {
					Constructor[name] = _super_class[name];
				}
			}

			// Copy new static properties on class.
			can.Construct._inherit(klass, _super_class, Constructor);

			// Setup namespaces.
			if (fullName) {

				var parts = fullName.split('.'),
					shortName = parts.pop(),
					current = can.getObject(parts.join('.'), window, true),
					namespace = current,
					_fullName = can.underscore(fullName.replace(/\./g, "_")),
					_shortName = can.underscore(shortName);



				current[shortName] = Constructor;
			}

			// Set things that shouldn't be overwritten.
			can.extend(Constructor, {
				constructor: Constructor,
				prototype: prototype,

				namespace: namespace,

				shortName: shortName,
				_shortName: _shortName,

				fullName: fullName,
				_fullName: _fullName
			});

			// Make sure our prototype looks nice.
			Constructor.prototype.constructor = Constructor;


			// Call the class `setup` and `init`
			var t = [_super_class].concat(can.makeArray(arguments)),
				args = Constructor.setup.apply(Constructor, t);

			if (Constructor.init) {
				Constructor.init.apply(Constructor, args || t);
			}


			return Constructor;

		}

	});
	// ## can/observe/observe.js
	// ## observe.js  
	// `can.Observe`  
	// _Provides the observable pattern for JavaScript Objects._  
	// Returns `true` if something is an object with properties of its own.
	var canMakeObserve = function (obj) {
		return obj && (can.isArray(obj) || can.isPlainObject(obj) || (obj instanceof can.Observe));
	},

		// Removes all listeners.
		unhookup = function (items, namespace) {
			return can.each(items, function (item) {
				if (item && item.unbind) {
					item.unbind("change" + namespace);
				}
			});
		},
		// Listens to changes on `val` and "bubbles" the event up.  
		// `val` - The object to listen for changes on.  
		// `prop` - The property name is at on.  
		// `parent` - The parent object of prop.
		// `ob` - (optional) The Observe object constructor
		// `list` - (optional) The observable list constructor
		hookupBubble = function (val, prop, parent, Ob, List) {
			Ob = Ob || Observe;
			List = List || Observe.List;

			// If it's an `array` make a list, otherwise a val.
			if (val instanceof Observe) {
				// We have an `observe` already...
				// Make sure it is not listening to this already
				unhookup([val], parent._cid);
			} else if (can.isArray(val)) {
				val = new List(val);
			} else {
				val = new Ob(val);
			}

			// Listen to all changes and `batchTrigger` upwards.
			val.bind("change" + parent._cid, function () {
				// `batchTrigger` the type on this...
				var args = can.makeArray(arguments),
					ev = args.shift();
				args[0] = (prop === "*" ? [parent.indexOf(val), args[0]] : [prop, args[0]]).join(".");

				// track objects dispatched on this observe		
				ev.triggeredNS = ev.triggeredNS || {};

				// if it has already been dispatched exit
				if (ev.triggeredNS[parent._cid]) {
					return;
				}

				ev.triggeredNS[parent._cid] = true;
				// send change event with modified attr to parent	
				can.trigger(parent, ev, args);
				// send modified attr event to parent
				//can.trigger(parent, args[0], args);
			});

			return val;
		},

		// An `id` to track events for a given observe.
		observeId = 0,
		// A helper used to serialize an `Observe` or `Observe.List`.  
		// `observe` - The observable.  
		// `how` - To serialize with `attr` or `serialize`.  
		// `where` - To put properties, in an `{}` or `[]`.
		serialize = function (observe, how, where) {
			// Go through each property.
			observe.each(function (val, name) {
				// If the value is an `object`, and has an `attrs` or `serialize` function.
				where[name] = canMakeObserve(val) && can.isFunction(val[how]) ?
				// Call `attrs` or `serialize` to get the original data back.
				val[how]() :
				// Otherwise return the value.
				val;
			});
			return where;
		},
		$method = function (name) {
			return function () {
				return can[name].apply(this, arguments);
			};
		},
		bind = $method('addEvent'),
		unbind = $method('removeEvent'),
		attrParts = function (attr) {
			return can.isArray(attr) ? attr : ("" + attr).split(".");
		},
		// Which batch of events this is for -- might not want to send multiple
		// messages on the same batch.  This is mostly for event delegation.
		batchNum = 1,
		// how many times has start been called without a stop
		transactions = 0,
		// an array of events within a transaction
		batchEvents = [],
		stopCallbacks = [];

	var cid = 0;
	can.cid = function (object, name) {
		if (object._cid) {
			return object._cid
		} else {
			return object._cid = (name || "") + (++cid)
		}
	}


	var Observe = can.Observe = can.Construct({

		// keep so it can be overwritten
		bind: bind,
		unbind: unbind,
		id: "id",
		canMakeObserve: canMakeObserve,
		// starts collecting events
		// takes a callback for after they are updated
		// how could you hook into after ejs
		startBatch: function (batchStopHandler) {
			transactions++;
			batchStopHandler && stopCallbacks.push(batchStopHandler);
		},

		stopBatch: function (force, callStart) {
			if (force) {
				transactions = 0;
			} else {
				transactions--;
			}

			if (transactions == 0) {
				var items = batchEvents.slice(0),
					callbacks = stopCallbacks.slice(0);
				batchEvents = [];
				stopCallbacks = [];
				batchNum++;
				callStart && this.startBatch();
				can.each(items, function (args) {
					can.trigger.apply(can, args);
				});
				can.each(callbacks, function (cb) {
					cb;
				});
			}
		},

		triggerBatch: function (item, event, args) {
			// Don't send events if initalizing.
			if (!item._init) {
				if (transactions == 0) {
					return can.trigger(item, event, args);
				} else {
					batchEvents.push([
					item,
					{
						type: event,
						batchNum: batchNum
					},
					args]);
				}
			}
		},

		keys: function (observe) {
			var keys = [];
			Observe.__reading && Observe.__reading(observe, '__keys');
			for (var keyName in observe._data) {
				keys.push(keyName);
			}
			return keys;
		}
	},

	{
		setup: function (obj) {
			// `_data` is where we keep the properties.
			this._data = {};

			// The namespace this `object` uses to listen to events.
			can.cid(this, ".observe");
			// Sets all `attrs`.
			this._init = 1;
			this.attr(obj);
			this.bind('change' + this._cid, can.proxy(this._changes, this));
			delete this._init;
		},
		_changes: function (ev, attr, how, newVal, oldVal) {
			Observe.triggerBatch(this, {
				type: attr,
				batchNum: ev.batchNum
			}, [newVal, oldVal]);
		},
		_triggerChange: function (attr, how, newVal, oldVal) {
			Observe.triggerBatch(this, "change", can.makeArray(arguments))
		},

		attr: function (attr, val) {
			// This is super obfuscated for space -- basically, we're checking
			// if the type of the attribute is not a `number` or a `string`.
			var type = typeof attr;
			if (type !== "string" && type !== "number") {
				return this._attrs(attr, val)
			} else if (val === undefined) { // If we are getting a value.
				// Let people know we are reading.
				Observe.__reading && Observe.__reading(this, attr)
				return this._get(attr)
			} else {
				// Otherwise we are setting.
				this._set(attr, val);
				return this;
			}
		},

		each: function () {
			Observe.__reading && Observe.__reading(this, '__keys');
			return can.each.apply(undefined, [this.__get()].concat(can.makeArray(arguments)))
		},

		removeAttr: function (attr) {
			// Convert the `attr` into parts (if nested).
			var parts = attrParts(attr),
				// The actual property to remove.
				prop = parts.shift(),
				// The current value.
				current = this._data[prop];

			// If we have more parts, call `removeAttr` on that part.
			if (parts.length) {
				return current.removeAttr(parts)
			} else {
				if (prop in this._data) {
					// Otherwise, `delete`.
					delete this._data[prop];
					// Create the event.
					if (!(prop in this.constructor.prototype)) {
						delete this[prop]
					}
					// Let others know the number of keys have changed
					Observe.triggerBatch(this, "__keys");
					this._triggerChange(prop, "remove", undefined, current);

				}
				return current;
			}
		},
		// Reads a property from the `object`.
		_get: function (attr) {
			// break up the attr (`"foo.bar"`) into `["foo","bar"]`
			var parts = attrParts(attr),
				// get the value of the first attr name (`"foo"`)
				current = this.__get(parts.shift());
			// if there are other attributes to read
			return parts.length ?
			// and current has a value
			current ?
			// lookup the remaining attrs on current
			current._get(parts) :
			// or if there's no current, return undefined
			undefined :
			// if there are no more parts, return current
			current;
		},
		// Reads a property directly if an `attr` is provided, otherwise
		// returns the "real" data object itself.
		__get: function (attr) {
			return attr ? this._data[attr] : this._data;
		},
		// Sets `attr` prop as value on this object where.
		// `attr` - Is a string of properties or an array  of property values.
		// `value` - The raw value to set.
		_set: function (attr, value) {
			// Convert `attr` to attr parts (if it isn't already).
			var parts = attrParts(attr),
				// The immediate prop we are setting.
				prop = parts.shift(),
				// The current value.
				current = this.__get(prop);

			// If we have an `object` and remaining parts.
			if (canMakeObserve(current) && parts.length) {
				// That `object` should set it (this might need to call attr).
				current._set(parts, value)
			} else if (!parts.length) {
				// We're in "real" set territory.
				if (this.__convert) {
					value = this.__convert(prop, value)
				}

				this.__set(prop, value, current)
			} else {
				throw "can.Observe: Object does not exist"
			}
		},
		__set: function (prop, value, current) {

			// Otherwise, we are setting it on this `object`.
			// TODO: Check if value is object and transform
			// are we changing the value.
			if (value !== current) {
				// Check if we are adding this for the first time --
				// if we are, we need to create an `add` event.
				var changeType = this.__get().hasOwnProperty(prop) ? "set" : "add";

				// Set the value on data.
				this.___set(prop,

				// If we are getting an object.
				canMakeObserve(value) ?

				// Hook it up to send event.
				hookupBubble(value, prop, this) :
				// Value is normal.
				value);

				if (changeType == "add") {
					// If there is no current value, let others know that
					// the the number of keys have changed
					Observe.triggerBatch(this, "__keys", undefined);

				}
				// `batchTrigger` the change event.
				this._triggerChange(prop, changeType, value, current);

				//Observe.triggerBatch(this, prop, [value, current]);
				// If we can stop listening to our old value, do it.
				current && unhookup([current], this._cid);
			}

		},
		// Directly sets a property on this `object`.
		___set: function (prop, val) {
			this._data[prop] = val;
			// Add property directly for easy writing.
			// Check if its on the `prototype` so we don't overwrite methods like `attrs`.
			if (!(prop in this.constructor.prototype)) {
				this[prop] = val
			}
		},

		bind: bind,

		unbind: unbind,

		serialize: function () {
			return serialize(this, 'serialize', {});
		},

		_attrs: function (props, remove) {

			if (props === undefined) {
				return serialize(this, 'attr', {})
			}

			props = can.extend({}, props);
			var prop, self = this,
				newVal;
			Observe.startBatch();
			this.each(function (curVal, prop, toRemove) {
				newVal = props[prop];

				// If we are merging...
				if (newVal === undefined) {
					remove && self.removeAttr(prop);
					return;
				}
				if (self.__convert) {
					newVal = self.__convert(prop, newVal);
				}

				if (curVal !== newVal) {
					if (curVal instanceof can.Observe && newVal instanceof can.Observe) {
						unhookup([curVal], self._cid);
					}

					if (newVal instanceof can.Observe) {
						self._set(prop, newVal)
					}
					else if (canMakeObserve(curVal) && canMakeObserve(newVal)) {
						curVal.attr(newVal, toRemove)
					} else if (curVal != newVal) {
						self._set(prop, newVal)
					}
				}
				delete props[prop];
			})
			// Add remaining props.
			for (var prop in props) {
				newVal = props[prop];
				this._set(prop, newVal)
			}
			Observe.stopBatch()
			return this;
		},


		compute: function (prop) {
			var self = this,
				computer = function (val) {
					return self.attr(prop, val);
				};

			return can.compute ? can.compute(computer) : computer;
		}
	});
	// Helpers for `observable` lists.
	var splice = [].splice,
		list = Observe(

		{
			setup: function (instances, options) {
				this.length = 0;
				can.cid(this, ".observe")
				this._init = 1;
				this.push.apply(this, instances || []);
				this.bind('change' + this._cid, can.proxy(this._changes, this));
				can.extend(this, options);
				delete this._init;
			},
			_triggerChange: function (attr, how, newVal, oldVal) {

				Observe.prototype._triggerChange.apply(this, arguments)
				// `batchTrigger` direct add and remove events...
				if (!~attr.indexOf('.')) {

					if (how === 'add') {
						Observe.triggerBatch(this, how, [newVal, +attr]);
						Observe.triggerBatch(this, 'length', [this.length]);
					} else if (how === 'remove') {
						Observe.triggerBatch(this, how, [oldVal, +attr]);
						Observe.triggerBatch(this, 'length', [this.length]);
					} else {
						Observe.triggerBatch(this, how, [newVal, +attr])
					}

				}

			},
			__get: function (attr) {
				return attr ? this[attr] : this;
			},
			___set: function (attr, val) {
				this[attr] = val;
				if (+attr >= this.length) {
					this.length = (+attr + 1)
				}
			},
			// Returns the serialized form of this list.
			serialize: function () {
				return serialize(this, 'serialize', []);
			},

			splice: function (index, howMany) {
				var args = can.makeArray(arguments),
					i;

				for (i = 2; i < args.length; i++) {
					var val = args[i];
					if (canMakeObserve(val)) {
						args[i] = hookupBubble(val, "*", this)
					}
				}
				if (howMany === undefined) {
					howMany = args[1] = this.length - index;
				}
				var removed = splice.apply(this, args);
				can.Observe.startBatch()
				if (howMany > 0) {
					this._triggerChange("" + index, "remove", undefined, removed);
					unhookup(removed, this._cid);
				}
				if (args.length > 2) {
					this._triggerChange("" + index, "add", args.slice(2), removed);
				}
				can.Observe.stopBatch();
				return removed;
			},

			_attrs: function (items, remove) {
				if (items === undefined) {
					return serialize(this, 'attr', []);
				}

				// Create a copy.
				items = can.makeArray(items);

				Observe.startBatch();
				this._updateAttrs(items, remove);
				Observe.stopBatch()
			},

			_updateAttrs: function (items, remove) {
				var len = Math.min(items.length, this.length);

				for (var prop = 0; prop < len; prop++) {
					var curVal = this[prop],
						newVal = items[prop];

					if (canMakeObserve(curVal) && canMakeObserve(newVal)) {
						curVal.attr(newVal, remove)
					} else if (curVal != newVal) {
						this._set(prop, newVal)
					} else {

					}
				}
				if (items.length > this.length) {
					// Add in the remaining props.
					this.push.apply(this, items.slice(this.length));
				} else if (items.length < this.length && remove) {
					this.splice(items.length)
				}
			}
		}),

		// Converts to an `array` of arguments.
		getArgs = function (args) {
			return args[0] && can.isArray(args[0]) ? args[0] : can.makeArray(args);
		};
	// Create `push`, `pop`, `shift`, and `unshift`
	can.each({

		push: "length",

		unshift: 0
	},
	// Adds a method
	// `name` - The method name.
	// `where` - Where items in the `array` should be added.


	function (where, name) {
		var orig = [][name]
		list.prototype[name] = function () {
			// Get the items being added.
			var args = [],
				// Where we are going to add items.
				len = where ? this.length : 0,
				i = arguments.length,
				res, val, constructor = this.constructor;

			// Go through and convert anything to an `observe` that needs to be converted.
			while (i--) {
				val = arguments[i];
				args[i] = canMakeObserve(val) ? hookupBubble(val, "*", this, this.constructor.Observe, this.constructor) : val;
			}

			// Call the original method.
			res = orig.apply(this, args);

			if (!this.comparator || !args.length) {
				this._triggerChange("" + len, "add", args, undefined);
			}

			return res;
		}
	});

	can.each({

		pop: "length",

		shift: 0
	},
	// Creates a `remove` type method


	function (where, name) {
		list.prototype[name] = function () {

			var args = getArgs(arguments),
				len = where && this.length ? this.length - 1 : 0;

			var res = [][name].apply(this, args)

			// Create a change where the args are
			// `*` - Change on potentially multiple properties.
			// `remove` - Items removed.
			// `undefined` - The new values (there are none).
			// `res` - The old, removed values (should these be unbound).
			// `len` - Where these items were removed.
			this._triggerChange("" + len, "remove", undefined, [res])

			if (res && res.unbind) {
				res.unbind("change" + this._cid)
			}
			return res;
		}
	});

	can.extend(list.prototype, {

		indexOf: function (item) {
			this.attr('length')
			return can.inArray(item, this)
		},


		join: [].join,


		slice: function () {
			var temp = Array.prototype.slice.apply(this, arguments);
			return new this.constructor(temp);
		},


		concat: function () {
			var args = [];
			can.each(can.makeArray(arguments), function (arg, i) {
				args[i] = arg instanceof can.Observe.List ? arg.serialize() : arg;
			});
			return new this.constructor(Array.prototype.concat.apply(this.serialize(), args));
		},


		forEach: function (cb, thisarg) {
			can.each(this, cb, thisarg || this);
		},


		replace: function (newList) {
			if (can.isDeferred(newList)) {
				newList.then(can.proxy(this.replace, this));
			} else {
				this.splice.apply(this, [0, this.length].concat(can.makeArray(newList || [])));
			}

			return this;
		}
	});

	Observe.List = list;
	Observe.setup = function () {
		can.Construct.setup.apply(this, arguments);
		// I would prefer not to do it this way. It should
		// be using the attributes plugin to do this type of conversion.
		this.List = Observe.List({
			Observe: this
		}, {});
	}
	// ## can/model/model.js

	// ## model.js  
	// `can.Model`  
	// _A `can.Observe` that connects to a RESTful interface._
	// Generic deferred piping function
	var pipe = function (def, model, func) {
		var d = new can.Deferred();
		def.then(function () {
			var args = can.makeArray(arguments);
			args[0] = model[func](args[0]);
			d.resolveWith(d, args);
		}, function () {
			d.rejectWith(this, arguments);
		});

		if (typeof def.abort === 'function') {
			d.abort = function () {
				return def.abort();
			}
		}

		return d;
	},
		modelNum = 0,
		ignoreHookup = /change.observe\d+/,
		getId = function (inst) {
			// Instead of using attr, use __get for performance.
			// Need to set reading
			can.Observe.__reading && can.Observe.__reading(inst, inst.constructor.id)
			return inst.__get(inst.constructor.id);
		},
		// Ajax `options` generator function
		ajax = function (ajaxOb, data, type, dataType, success, error) {

			var params = {};

			// If we get a string, handle it.
			if (typeof ajaxOb == "string") {
				// If there's a space, it's probably the type.
				var parts = ajaxOb.split(/\s/);
				params.url = parts.pop();
				if (parts.length) {
					params.type = parts.pop();
				}
			} else {
				can.extend(params, ajaxOb);
			}

			// If we are a non-array object, copy to a new attrs.
			params.data = typeof data == "object" && !can.isArray(data) ? can.extend(params.data || {}, data) : data;

			// Get the url with any templated values filled out.
			params.url = can.sub(params.url, params.data, true);

			return can.ajax(can.extend({
				type: type || "post",
				dataType: dataType || "json",
				success: success,
				error: error
			}, params));
		},
		makeRequest = function (self, type, success, error, method) {
			var deferred, args = [self.serialize()],
				// The model.
				model = self.constructor,
				jqXHR;

			// `destroy` does not need data.
			if (type == 'destroy') {
				args.shift();
			}
			// `update` and `destroy` need the `id`.
			if (type !== 'create') {
				args.unshift(getId(self));
			}


			jqXHR = model[type].apply(model, args);

			deferred = jqXHR.pipe(function (data) {
				self[method || type + "d"](data, jqXHR);
				return self;
			});

			// Hook up `abort`
			if (jqXHR.abort) {
				deferred.abort = function () {
					jqXHR.abort();
				};
			}

			deferred.then(success, error);
			return deferred;
		},

		// This object describes how to make an ajax request for each ajax method.  
		// The available properties are:
		//		`url` - The default url to use as indicated as a property on the model.
		//		`type` - The default http request type
		//		`data` - A method that takes the `arguments` and returns `data` used for ajax.
		ajaxMethods = {

			create: {
				url: "_shortName",
				type: "post"
			},

			update: {
				data: function (id, attrs) {
					attrs = attrs || {};
					var identity = this.id;
					if (attrs[identity] && attrs[identity] !== id) {
						attrs["new" + can.capitalize(id)] = attrs[identity];
						delete attrs[identity];
					}
					attrs[identity] = id;
					return attrs;
				},
				type: "put"
			},

			destroy: {
				type: "delete",
				data: function (id) {
					var args = {};
					args.id = args[this.id] = id;
					return args;
				}
			},

			findAll: {
				url: "_shortName"
			},

			findOne: {}
		},
		// Makes an ajax request `function` from a string.
		//		`ajaxMethod` - The `ajaxMethod` object defined above.
		//		`str` - The string the user provided. Ex: `findAll: "/recipes.json"`.
		ajaxMaker = function (ajaxMethod, str) {
			// Return a `function` that serves as the ajax method.
			return function (data) {
				// If the ajax method has it's own way of getting `data`, use that.
				data = ajaxMethod.data ? ajaxMethod.data.apply(this, arguments) :
				// Otherwise use the data passed in.
				data;
				// Return the ajax method with `data` and the `type` provided.
				return ajax(str || this[ajaxMethod.url || "_url"], data, ajaxMethod.type || "get")
			}
		}



		can.Model = can.Observe({
			fullName: "can.Model",
			setup: function (base) {
				// create store here if someone wants to use model without inheriting from it
				this.store = {};
				can.Observe.setup.apply(this, arguments);
				// Set default list as model list
				if (!can.Model) {
					return;
				}
				this.List = ML({
					Observe: this
				}, {});
				var self = this,
					clean = can.proxy(this._clean, self);


				// go through ajax methods and set them up
				can.each(ajaxMethods, function (method, name) {
					// if an ajax method is not a function, it's either
					// a string url like findAll: "/recipes" or an
					// ajax options object like {url: "/recipes"}
					if (!can.isFunction(self[name])) {
						// use ajaxMaker to convert that into a function
						// that returns a deferred with the data
						self[name] = ajaxMaker(method, self[name]);
					}
					// check if there's a make function like makeFindAll
					// these take deferred function and can do special
					// behavior with it (like look up data in a store)
					if (self["make" + can.capitalize(name)]) {
						// pass the deferred method to the make method to get back
						// the "findAll" method.
						var newMethod = self["make" + can.capitalize(name)](self[name]);
						can.Construct._overwrite(self, base, name, function () {
							// increment the numer of requests
							this._reqs++;
							var def = newMethod.apply(this, arguments);
							var then = def.then(clean, clean);
							then.abort = def.abort;

							// attach abort to our then and return it
							return then;
						})
					}
				});

				if (self.fullName == "can.Model" || !self.fullName) {
					self.fullName = "Model" + (++modelNum);
				}
				// Add ajax converters.
				this._reqs = 0;
				this._url = this._shortName + "/{" + this.id + "}"
			},
			_ajax: ajaxMaker,
			_clean: function () {
				this._reqs--;
				if (!this._reqs) {
					for (var id in this.store) {
						if (!this.store[id]._bindings) {
							delete this.store[id];
						}
					}
				}
				return arguments[0];
			},

			models: function (instancesRawData, oldList) {

				if (!instancesRawData) {
					return;
				}

				if (instancesRawData instanceof this.List) {
					return instancesRawData;
				}

				// Get the list type.
				var self = this,
					tmp = [],
					res = oldList instanceof can.Observe.List ? oldList : new(self.List || ML),
					// Did we get an `array`?
					arr = can.isArray(instancesRawData),

					// Did we get a model list?
					ml = (instancesRawData instanceof ML),

					// Get the raw `array` of objects.
					raw = arr ?

					// If an `array`, return the `array`.
					instancesRawData :

					// Otherwise if a model list.
					(ml ?

					// Get the raw objects from the list.
					instancesRawData.serialize() :

					// Get the object's data.
					instancesRawData.data),
					i = 0;



				if (res.length > 0) {
					res.splice(0);
				}

				can.each(raw, function (rawPart) {
					tmp.push(self.model(rawPart));
				});

				// We only want one change event so push everything at once
				res.push.apply(res, tmp);

				if (!arr) { // Push other stuff onto `array`.
					can.each(instancesRawData, function (val, prop) {
						if (prop !== 'data') {
							res.attr(prop, val);
						}
					})
				}
				return res;
			},

			model: function (attributes) {
				if (!attributes) {
					return;
				}
				if (attributes instanceof this) {
					attributes = attributes.serialize();
				}
				var id = attributes[this.id],
					model = id && this.store[id] ? this.store[id].attr(attributes) : new this(attributes);
				if (this._reqs) {
					this.store[attributes[this.id]] = model;
				}
				return model;
			}
		},

		{

			isNew: function () {
				var id = getId(this);
				return !(id || id === 0); // If `null` or `undefined`
			},

			save: function (success, error) {
				return makeRequest(this, this.isNew() ? 'create' : 'update', success, error);
			},

			destroy: function (success, error) {
				return makeRequest(this, 'destroy', success, error, 'destroyed');
			},

			bind: function (eventName) {
				if (!ignoreHookup.test(eventName)) {
					if (!this._bindings) {
						this.constructor.store[this.__get(this.constructor.id)] = this;
						this._bindings = 0;
					}
					this._bindings++;
				}

				return can.Observe.prototype.bind.apply(this, arguments);
			},

			unbind: function (eventName) {
				if (!ignoreHookup.test(eventName)) {
					this._bindings--;
					if (!this._bindings) {
						delete this.constructor.store[getId(this)];
					}
				}
				return can.Observe.prototype.unbind.apply(this, arguments);
			},
			// Change `id`.
			___set: function (prop, val) {
				can.Observe.prototype.___set.call(this, prop, val)
				// If we add an `id`, move it to the store.
				if (prop === this.constructor.id && this._bindings) {
					this.constructor.store[getId(this)] = this;
				}
			}
		});

	can.each({
		makeFindAll: "models",
		makeFindOne: "model"
	}, function (method, name) {
		can.Model[name] = function (oldFind) {
			return function (params, success, error) {
				var def = pipe(oldFind.call(this, params), this, method);
				def.then(success, error);
				// return the original promise
				return def;
			};
		};
	});

	can.each([

	"created",

	"updated",

	"destroyed"], function (funcName) {
		can.Model.prototype[funcName] = function (attrs) {
			var stub, constructor = this.constructor;

			// Update attributes if attributes have been passed
			stub = attrs && typeof attrs == 'object' && this.attr(attrs.attr ? attrs.attr() : attrs);

			// Call event on the instance
			can.trigger(this, funcName);
			can.trigger(this, "change", funcName)


			// Call event on the instance's Class
			can.trigger(constructor, funcName, this);
		};
	});

	// Model lists are just like `Observe.List` except that when their items are 
	// destroyed, it automatically gets removed from the list.
	var ML = can.Model.List = can.Observe.List({
		setup: function () {
			can.Observe.List.prototype.setup.apply(this, arguments);
			// Send destroy events.
			var self = this;
			this.bind('change', function (ev, how) {
				if (/\w+\.destroyed/.test(how)) {
					var index = self.indexOf(ev.target);
					if (index != -1) {
						self.splice(index, 1);
					}
				}
			})
		}
	})

	// ## can/util/string/deparam/deparam.js

	// ## deparam.js  
	// `can.deparam`  
	// _Takes a string of name value pairs and returns a Object literal that represents those params._
	var digitTest = /^\d+$/,
		keyBreaker = /([^\[\]]+)|(\[\])/g,
		paramTest = /([^?#]*)(#.*)?$/,
		prep = function (str) {
			return decodeURIComponent(str.replace(/\+/g, " "));
		};


	can.extend(can, {

		deparam: function (params) {

			var data = {},
				pairs, lastPart;

			if (params && paramTest.test(params)) {

				pairs = params.split('&'),

				can.each(pairs, function (pair) {

					var parts = pair.split('='),
						key = prep(parts.shift()),
						value = prep(parts.join("=")),
						current = data;

					parts = key.match(keyBreaker);

					for (var j = 0, l = parts.length - 1; j < l; j++) {
						if (!current[parts[j]]) {
							// If what we are pointing to looks like an `array`
							current[parts[j]] = digitTest.test(parts[j + 1]) || parts[j + 1] == "[]" ? [] : {};
						}
						current = current[parts[j]];
					}
					lastPart = parts.pop();
					if (lastPart == "[]") {
						current.push(value);
					} else {
						current[lastPart] = value;
					}
				});
			}
			return data;
		}
	});
	// ## can/route/route.js
	// ## route.js  
	// `can.route`  
	// _Helps manage browser history (and client state) by synchronizing the 
	// `window.location.hash` with a `can.Observe`._  
	// Helper methods used for matching routes.
	var
	// `RegExp` used to match route variables of the type ':name'.
	// Any word character or a period is matched.
	matcher = /\:([\w\.]+)/g,
		// Regular expression for identifying &amp;key=value lists.
		paramsMatcher = /^(?:&[^=]+=[^&]*)+/,
		// Converts a JS Object into a list of parameters that can be 
		// inserted into an html element tag.
		makeProps = function (props) {
			var tags = [];
			can.each(props, function (val, name) {
				tags.push((name === 'className' ? 'class' : name) + '="' + (name === "href" ? val : can.esc(val)) + '"');
			});
			return tags.join(" ");
		},
		// Checks if a route matches the data provided. If any route variable
		// is not present in the data, the route does not match. If all route
		// variables are present in the data, the number of matches is returned 
		// to allow discerning between general and more specific routes. 
		matchesData = function (route, data) {
			var count = 0,
				i = 0,
				defaults = {};
			// look at default values, if they match ...
			for (var name in route.defaults) {
				if (route.defaults[name] === data[name]) {
					// mark as matched
					defaults[name] = 1;
					count++;
				}
			}
			for (; i < route.names.length; i++) {
				if (!data.hasOwnProperty(route.names[i])) {
					return -1;
				}
				if (!defaults[route.names[i]]) {
					count++;
				}

			}

			return count;
		},
		onready = !0,
		location = window.location,
		wrapQuote = function (str) {
			return (str + '').replace(/([.?*+\^$\[\]\\(){}|\-])/g, "\\$1");
		},
		each = can.each,
		extend = can.extend;

	can.route = function (url, defaults) {
		defaults = defaults || {};
		// Extract the variable names and replace with `RegExp` that will match
		// an atual URL with values.
		var names = [],
			test = url.replace(matcher, function (whole, name, i) {
				names.push(name);
				var next = "\\" + (url.substr(i + whole.length, 1) || can.route._querySeparator);
				// a name without a default value HAS to have a value
				// a name that has a default value can be empty
				// The `\\` is for string-escaping giving single `\` for `RegExp` escaping.
				return "([^" + next + "]" + (defaults[name] ? "*" : "+") + ")";
			});

		// Add route in a form that can be easily figured out.
		can.route.routes[url] = {
			// A regular expression that will match the route when variable values 
			// are present; i.e. for `:page/:type` the `RegExp` is `/([\w\.]*)/([\w\.]*)/` which
			// will match for any value of `:page` and `:type` (word chars or period).
			test: new RegExp("^" + test + "($|" + wrapQuote(can.route._querySeparator) + ")"),
			// The original URL, same as the index for this entry in routes.
			route: url,
			// An `array` of all the variable names in this route.
			names: names,
			// Default values provided for the variables.
			defaults: defaults,
			// The number of parts in the URL separated by `/`.
			length: url.split('/').length
		};
		return can.route;
	};

	extend(can.route, {

		_querySeparator: '&',
		_paramsMatcher: paramsMatcher,


		param: function (data, _setRoute) {
			// Check if the provided data keys match the names in any routes;
			// Get the one with the most matches.
			var route,
			// Need to have at least 1 match.
			matches = 0,
				matchCount, routeName = data.route,
				propCount = 0;

			delete data.route;

			each(data, function () {
				propCount++;
			});
			// Otherwise find route.
			each(can.route.routes, function (temp, name) {
				// best route is the first with all defaults matching

				matchCount = matchesData(temp, data);
				if (matchCount > matches) {
					route = temp;
					matches = matchCount;
				}
				if (matchCount >= propCount) {
					return false;
				}
			});
			// If we have a route name in our `can.route` data, and it's
			// just as good as what currently matches, use that
			if (can.route.routes[routeName] && matchesData(can.route.routes[routeName], data) === matches) {
				route = can.route.routes[routeName];
			}
			// If this is match...
			if (route) {
				var cpy = extend({}, data),
					// Create the url by replacing the var names with the provided data.
					// If the default value is found an empty string is inserted.
					res = route.route.replace(matcher, function (whole, name) {
						delete cpy[name];
						return data[name] === route.defaults[name] ? "" : encodeURIComponent(data[name]);
					}),
					after;
				// Remove matching default values
				each(route.defaults, function (val, name) {
					if (cpy[name] === val) {
						delete cpy[name];
					}
				});

				// The remaining elements of data are added as 
				// `&amp;` separated parameters to the url.
				after = can.param(cpy);
				// if we are paraming for setting the hash
				// we also want to make sure the route value is updated
				if (_setRoute) {
					can.route.attr('route', route.route);
				}
				return res + (after ? can.route._querySeparator + after : "");
			}
			// If no route was found, there is no hash URL, only paramters.
			return can.isEmptyObject(data) ? "" : can.route._querySeparator + can.param(data);
		},

		deparam: function (url) {
			// See if the url matches any routes by testing it against the `route.test` `RegExp`.
			// By comparing the URL length the most specialized route that matches is used.
			var route = {
				length: -1
			};
			each(can.route.routes, function (temp, name) {
				if (temp.test.test(url) && temp.length > route.length) {
					route = temp;
				}
			});
			// If a route was matched.
			if (route.length > -1) {

				var // Since `RegExp` backreferences are used in `route.test` (parens)
				// the parts will contain the full matched string and each variable (back-referenced) value.
				parts = url.match(route.test),
					// Start will contain the full matched string; parts contain the variable values.
					start = parts.shift(),
					// The remainder will be the `&amp;key=value` list at the end of the URL.
					remainder = url.substr(start.length - (parts[parts.length - 1] === can.route._querySeparator ? 1 : 0)),
					// If there is a remainder and it contains a `&amp;key=value` list deparam it.
					obj = (remainder && can.route._paramsMatcher.test(remainder)) ? can.deparam(remainder.slice(1)) : {};

				// Add the default values for this route.
				obj = extend(true, {}, route.defaults, obj);
				// Overwrite each of the default values in `obj` with those in 
				// parts if that part is not empty.
				each(parts, function (part, i) {
					if (part && part !== can.route._querySeparator) {
						obj[route.names[i]] = decodeURIComponent(part);
					}
				});
				obj.route = route.route;
				return obj;
			}
			// If no route was matched, it is parsed as a `&amp;key=value` list.
			if (url.charAt(0) !== can.route._querySeparator) {
				url = can.route._querySeparator + url;
			}
			return can.route._paramsMatcher.test(url) ? can.deparam(url.slice(1)) : {};
		},

		data: new can.Observe({}),

		routes: {},

		ready: function (val) {
			if (val === false) {
				onready = val;
			}
			if (val === true || onready === true) {
				can.route._setup();
				setState();
			}
			return can.route;
		},

		url: function (options, merge) {
			if (merge) {
				options = extend({}, curParams, options)
			}
			return "#!" + can.route.param(options);
		},

		link: function (name, options, props, merge) {
			return "<a " + makeProps(
			extend({
				href: can.route.url(options, merge)
			}, props)) + ">" + name + "</a>";
		},

		current: function (options) {
			return location.hash == "#!" + can.route.param(options)
		},
		_setup: function () {
			// If the hash changes, update the `can.route.data`.
			can.bind.call(window, 'hashchange', setState);
		},
		_getHash: function () {
			return location.href.split(/#!?/)[1] || "";
		},
		_setHash: function (serialized) {
			var path = (can.route.param(serialized, true));
			location.hash = "#!" + path;
			return path;
		}
	});


	// The functions in the following list applied to `can.route` (e.g. `can.route.attr('...')`) will
	// instead act on the `can.route.data` observe.
	each(['bind', 'unbind', 'delegate', 'undelegate', 'attr', 'removeAttr'], function (name) {
		can.route[name] = function () {
			return can.route.data[name].apply(can.route.data, arguments)
		}
	})

	var // A ~~throttled~~ debounced function called multiple times will only fire once the
	// timer runs down. Each call resets the timer.
	timer,
	// Intermediate storage for `can.route.data`.
	curParams,
	// Deparameterizes the portion of the hash of interest and assign the
	// values to the `can.route.data` removing existing values no longer in the hash.
	// setState is called typically by hashchange which fires asynchronously
	// So it's possible that someone started changing the data before the 
	// hashchange event fired.  For this reason, it will not set the route data
	// if the data is changing or the hash already matches the hash that was set.
	setState = can.route.setState = function () {
		var hash = can.route._getHash();
		curParams = can.route.deparam(hash);

		// if the hash data is currently changing, or
		// the hash is what we set it to anyway, do NOT change the hash
		if (!changingData || hash !== lastHash) {
			can.route.attr(curParams, true);
		}
	},
		// The last hash caused by a data change
		lastHash,
		// Are data changes pending that haven't yet updated the hash
		changingData;

	// If the `can.route.data` changes, update the hash.
	// Using `.serialize()` retrieves the raw data contained in the `observable`.
	// This function is ~~throttled~~ debounced so it only updates once even if multiple values changed.
	// This might be able to use batchNum and avoid this.
	can.route.bind("change", function (ev, attr) {
		// indicate that data is changing
		changingData = 1;
		clearTimeout(timer);
		timer = setTimeout(function () {
			// indicate that the hash is set to look like the data
			changingData = 0;
			var serialized = can.route.data.serialize();

			lastHash = can.route._setHash(serialized);
		}, 1);
	});
	// `onready` event...
	can.bind.call(document, "ready", can.route.ready);

	// extend route to have a similar property 
	// that is often checked in mustache to determine
	// an object's observability
	can.route.constructor.canMakeObserve = can.Observe.canMakeObserve;

	// ## can/control/control.js
	// ## control.js
	// `can.Control`  
	// _Controller_
	// Binds an element, returns a function that unbinds.
	var bind = function (el, ev, callback) {

		can.bind.call(el, ev, callback);

		return function () {
			can.unbind.call(el, ev, callback);
		};
	},
		isFunction = can.isFunction,
		extend = can.extend,
		each = can.each,
		slice = [].slice,
		paramReplacer = /\{([^\}]+)\}/g,
		special = can.getObject("$.event.special", [can]) || {},

		// Binds an element, returns a function that unbinds.
		delegate = function (el, selector, ev, callback) {
			can.delegate.call(el, selector, ev, callback);
			return function () {
				can.undelegate.call(el, selector, ev, callback);
			};
		},

		// Calls bind or unbind depending if there is a selector.
		binder = function (el, ev, callback, selector) {
			return selector ? delegate(el, can.trim(selector), ev, callback) : bind(el, ev, callback);
		},

		basicProcessor;


	var Control = can.Control = can.Construct(

	{
		// Setup pre-processes which methods are event listeners.
		setup: function () {

			// Allow contollers to inherit "defaults" from super-classes as it 
			// done in `can.Construct`
			can.Construct.setup.apply(this, arguments);

			// If you didn't provide a name, or are `control`, don't do anything.
			if (can.Control) {

				// Cache the underscored names.
				var control = this,
					funcName;

				// Calculate and cache actions.
				control.actions = {};
				for (funcName in control.prototype) {
					if (control._isAction(funcName)) {
						control.actions[funcName] = control._action(funcName);
					}
				}
			}
		},

		// Moves `this` to the first argument, wraps it with `jQuery` if it's an element
		_shifter: function (context, name) {

			var method = typeof name == "string" ? context[name] : name;

			if (!isFunction(method)) {
				method = context[method];
			}

			return function () {
				context.called = name;
				return method.apply(context, [this.nodeName ? can.$(this) : this].concat(slice.call(arguments, 0)));
			};
		},

		// Return `true` if is an action.
		_isAction: function (methodName) {

			var val = this.prototype[methodName],
				type = typeof val;
			// if not the constructor
			return (methodName !== 'constructor') &&
			// and is a function or links to a function
			(type == "function" || (type == "string" && isFunction(this.prototype[val]))) &&
			// and is in special, a processor, or has a funny character
			!! (special[methodName] || processors[methodName] || /[^\w]/.test(methodName));
		},
		// Takes a method name and the options passed to a control
		// and tries to return the data necessary to pass to a processor
		// (something that binds things).
		_action: function (methodName, options) {

			// If we don't have options (a `control` instance), we'll run this 
			// later.  
			paramReplacer.lastIndex = 0;
			if (options || !paramReplacer.test(methodName)) {
				// If we have options, run sub to replace templates `{}` with a
				// value from the options or the window
				var convertedName = options ? can.sub(methodName, [options, window]) : methodName;
				if (!convertedName) {
					return null;
				}
				// If a `{}` template resolves to an object, `convertedName` will be
				// an array
				var arr = can.isArray(convertedName),

					// Get the name
					name = arr ? convertedName[1] : convertedName,

					// Grab the event off the end
					parts = name.split(/\s+/g),
					event = parts.pop();

				return {
					processor: processors[event] || basicProcessor,
					parts: [name, parts.join(" "), event],
					delegate: arr ? convertedName[0] : undefined
				};
			}
		},
		// An object of `{eventName : function}` pairs that Control uses to 
		// hook up events auto-magically.
		processors: {},
		// A object of name-value pairs that act as default values for a 
		// control instance
		defaults: {}
	},

	{
		// Sets `this.element`, saves the control in `data, binds event
		// handlers.
		setup: function (element, options) {

			var cls = this.constructor,
				pluginname = cls.pluginName || cls._fullName,
				arr;

			// Want the raw element here.
			this.element = can.$(element)

			if (pluginname && pluginname !== 'can_control') {
				// Set element and `className` on element.
				this.element.addClass(pluginname);
			}

			(arr = can.data(this.element, "controls")) || can.data(this.element, "controls", arr = []);
			arr.push(this);

			// Option merging.
			this.options = extend({}, cls.defaults, options);

			// Bind all event handlers.
			this.on();

			// Get's passed into `init`.
			return [this.element, this.options];
		},

		on: function (el, selector, eventName, func) {
			if (!el) {

				// Adds bindings.
				this.off();

				// Go through the cached list of actions and use the processor 
				// to bind
				var cls = this.constructor,
					bindings = this._bindings,
					actions = cls.actions,
					element = this.element,
					destroyCB = can.Control._shifter(this, "destroy"),
					funcName, ready;

				for (funcName in actions) {
					// Only push if we have the action and no option is `undefined`
					if (actions.hasOwnProperty(funcName) && (ready = actions[funcName] || cls._action(funcName, this.options))) {
						bindings.push(ready.processor(ready.delegate || element, ready.parts[2], ready.parts[1], funcName, this));
					}
				}


				// Setup to be destroyed...  
				// don't bind because we don't want to remove it.
				can.bind.call(element, "destroyed", destroyCB);
				bindings.push(function (el) {
					can.unbind.call(el, "destroyed", destroyCB);
				});
				return bindings.length;
			}

			if (typeof el == 'string') {
				func = eventName;
				eventName = selector;
				selector = el;
				el = this.element;
			}

			if (func === undefined) {
				func = eventName;
				eventName = selector;
				selector = null;
			}

			if (typeof func == 'string') {
				func = can.Control._shifter(this, func);
			}

			this._bindings.push(binder(el, eventName, func, selector));

			return this._bindings.length;
		},
		// Unbinds all event handlers on the controller.
		off: function () {
			var el = this.element[0]
			each(this._bindings || [], function (value) {
				value(el);
			});
			// Adds bindings.
			this._bindings = [];
		},
		// Prepares a `control` for garbage collection
		destroy: function () {
			var Class = this.constructor,
				pluginName = Class.pluginName || Class._fullName,
				controls;

			// Unbind bindings.
			this.off();

			if (pluginName && pluginName !== 'can_control') {
				// Remove the `className`.
				this.element.removeClass(pluginName);
			}

			// Remove from `data`.
			controls = can.data(this.element, "controls");
			controls.splice(can.inArray(this, controls), 1);

			can.trigger(this, "destroyed"); // In case we want to know if the `control` is removed.
			this.element = null;
		}
	});

	var processors = can.Control.processors,
		// Processors do the binding.
		// They return a function that unbinds when called.  
		// The basic processor that binds events.
		basicProcessor = function (el, event, selector, methodName, control) {
			return binder(el, event, can.Control._shifter(control, methodName), selector);
		};

	// Set common events to be processed as a `basicProcessor`
	each(["change", "click", "contextmenu", "dblclick", "keydown", "keyup", "keypress", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup", "reset", "resize", "scroll", "select", "submit", "focusin", "focusout", "mouseenter", "mouseleave",
	// #104 - Add touch events as default processors
	// TOOD feature detect?
	"touchstart", "touchmove", "touchcancel", "touchend", "touchleave"], function (v) {
		processors[v] = basicProcessor;
	});

	// ## can/control/route/route.js

	// ## control/route.js  
	// _Controller route integration._
	can.Control.processors.route = function (el, event, selector, funcName, controller) {
		selector = selector || "";
		can.route(selector);
		var batchNum, check = function (ev, attr, how) {
			if (can.route.attr('route') === (selector) && (ev.batchNum === undefined || ev.batchNum !== batchNum)) {

				batchNum = ev.batchNum;

				var d = can.route.attr();
				delete d.route;
				if (can.isFunction(controller[funcName])) {
					controller[funcName](d);
				} else {
					controller[controller[funcName]](d);
				}

			}
		};
		can.route.bind('change', check);
		return function () {
			can.route.unbind('change', check);
		};
	};

	// ## can/view/view.js
	// ## view.js
	// `can.view`  
	// _Templating abstraction._
	var isFunction = can.isFunction,
		makeArray = can.makeArray,
		// Used for hookup `id`s.
		hookupId = 1,

		$view = can.view = function (view, data, helpers, callback) {
			// If helpers is a `function`, it is actually a callback.
			if (isFunction(helpers)) {
				callback = helpers;
				helpers = undefined;
			}

			var pipe = function (result) {
				return $view.frag(result);
			},
				// In case we got a callback, we need to convert the can.view.render
				// result to a document fragment
				wrapCallback = isFunction(callback) ?
				function (frag) {
					callback(pipe(frag));
				} : null,
				// Get the result.
				result = $view.render(view, data, helpers, wrapCallback);

			if (isFunction(result)) {
				return result;
			}

			if (can.isDeferred(result)) {
				return result.pipe(pipe);
			}

			// Convert it into a dom frag.
			return pipe(result);
		};

	can.extend($view, {
		// creates a frag and hooks it up all at once
		frag: function (result, parentNode) {
			return $view.hookup($view.fragment(result), parentNode);
		},

		// simply creates a frag
		// this is used internally to create a frag
		// insert it
		// then hook it up
		fragment: function (result) {
			var frag = can.buildFragment(result, document.body);
			// If we have an empty frag...
			if (!frag.childNodes.length) {
				frag.appendChild(document.createTextNode(''));
			}
			return frag;
		},

		// Convert a path like string into something that's ok for an `element` ID.
		toId: function (src) {
			return can.map(src.toString().split(/\/|\./g), function (part) {
				// Dont include empty strings in toId functions
				if (part) {
					return part;
				}
			}).join("_");
		},

		hookup: function (fragment, parentNode) {
			var hookupEls = [],
				id, func;

			// Get all `childNodes`.
			can.each(fragment.childNodes ? can.makeArray(fragment.childNodes) : fragment, function (node) {
				if (node.nodeType === 1) {
					hookupEls.push(node);
					hookupEls.push.apply(hookupEls, can.makeArray(node.getElementsByTagName('*')));
				}
			});

			// Filter by `data-view-id` attribute.
			can.each(hookupEls, function (el) {
				if (el.getAttribute && (id = el.getAttribute('data-view-id')) && (func = $view.hookups[id])) {
					func(el, parentNode, id);
					delete $view.hookups[id];
					el.removeAttribute('data-view-id');
				}
			});

			return fragment;
		},


		hookups: {},


		hook: function (cb) {
			$view.hookups[++hookupId] = cb;
			return " data-view-id='" + hookupId + "'";
		},


		cached: {},

		cachedRenderers: {},


		cache: true,


		register: function (info) {
			this.types["." + info.suffix] = info;
		},

		types: {},


		ext: ".ejs",


		registerScript: function () {},


		preload: function () {},


		render: function (view, data, helpers, callback) {
			// If helpers is a `function`, it is actually a callback.
			if (isFunction(helpers)) {
				callback = helpers;
				helpers = undefined;
			}

			// See if we got passed any deferreds.
			var deferreds = getDeferreds(data);

			if (deferreds.length) { // Does data contain any deferreds?
				// The deferred that resolves into the rendered content...
				var deferred = new can.Deferred(),
					dataCopy = can.extend({}, data);

				// Add the view request to the list of deferreds.
				deferreds.push(get(view, true))

				// Wait for the view and all deferreds to finish...
				can.when.apply(can, deferreds).then(function (resolved) {
					// Get all the resolved deferreds.
					var objs = makeArray(arguments),
						// Renderer is the last index of the data.
						renderer = objs.pop(),
						// The result of the template rendering with data.
						result;

					// Make data look like the resolved deferreds.
					if (can.isDeferred(data)) {
						dataCopy = usefulPart(resolved);
					}
					else {
						// Go through each prop in data again and
						// replace the defferreds with what they resolved to.
						for (var prop in data) {
							if (can.isDeferred(data[prop])) {
								dataCopy[prop] = usefulPart(objs.shift());
							}
						}
					}

					// Get the rendered result.
					result = renderer(dataCopy, helpers);

					// Resolve with the rendered view.
					deferred.resolve(result, dataCopy);

					// If there's a `callback`, call it back with the result.
					callback && callback(result, dataCopy);
				});
				// Return the deferred...
				return deferred;
			}
			else {
				// No deferreds! Render this bad boy.
				var response,
				// If there's a `callback` function
				async = isFunction(callback),
					// Get the `view` type
					deferred = get(view, async);

				// If we are `async`...
				if (async) {
					// Return the deferred
					response = deferred;
					// And fire callback with the rendered result.
					deferred.then(function (renderer) {
						callback(data ? renderer(data, helpers) : renderer);
					})
				} else {
					// if the deferred is resolved, call the cached renderer instead
					// this is because it's possible, with recursive deferreds to
					// need to render a view while its deferred is _resolving_.  A _resolving_ deferred
					// is a deferred that was just resolved and is calling back it's success callbacks.
					// If a new success handler is called while resoliving, it does not get fired by
					// jQuery's deferred system.  So instead of adding a new callback
					// we use the cached renderer.
					// We also add __view_id on the deferred so we can look up it's cached renderer.
					// In the future, we might simply store either a deferred or the cached result.
					if (deferred.state() === "resolved" && deferred.__view_id) {
						var currentRenderer = $view.cachedRenderers[deferred.__view_id];
						return data ? currentRenderer(data, helpers) : currentRenderer;
					} else {
						// Otherwise, the deferred is complete, so
						// set response to the result of the rendering.
						deferred.then(function (renderer) {
							response = data ? renderer(data, helpers) : renderer;
						});
					}
				}

				return response;
			}
		},


		registerView: function (id, text, type, def) {
			// Get the renderer function.
			var func = (type || $view.types[$view.ext]).renderer(id, text);
			def = def || new can.Deferred();

			// Cache if we are caching.
			if ($view.cache) {
				$view.cached[id] = def;
				def.__view_id = id;
				$view.cachedRenderers[id] = func;
			}

			// Return the objects for the response's `dataTypes`
			// (in this case view).
			return def.resolve(func);
		}
	});

	// Makes sure there's a template, if not, have `steal` provide a warning.
	var checkText = function (text, url) {
		if (!text.length) {

			throw "can.view: No template or empty template:" + url;
		}
	},
		// `Returns a `view` renderer deferred.  
		// `url` - The url to the template.  
		// `async` - If the ajax request should be asynchronous.  
		// Returns a deferred.
		get = function (url, async) {
			var suffix = url.match(/\.[\w\d]+$/),
				type,
				// If we are reading a script element for the content of the template,
				// `el` will be set to that script element.
				el,
				// A unique identifier for the view (used for caching).
				// This is typically derived from the element id or
				// the url for the template.
				id,
				// The ajax request used to retrieve the template content.
				jqXHR;

			//If the url has a #, we assume we want to use an inline template
			//from a script element and not current page's HTML
			if (url.match(/^#/)) {
				url = url.substr(1);
			}
			// If we have an inline template, derive the suffix from the `text/???` part.
			// This only supports `<script>` tags.
			if (el = document.getElementById(url)) {
				suffix = "." + el.type.match(/\/(x\-)?(.+)/)[2];
			}

			// If there is no suffix, add one.
			if (!suffix && !$view.cached[url]) {
				url += (suffix = $view.ext);
			}

			if (can.isArray(suffix)) {
				suffix = suffix[0]
			}

			// Convert to a unique and valid id.
			id = $view.toId(url);

			// If an absolute path, use `steal` to get it.
			// You should only be using `//` if you are using `steal`.
			if (url.match(/^\/\//)) {
				var sub = url.substr(2);
				url = !window.steal ? sub : steal.config().root.mapJoin(sub);
			}

			// Set the template engine type.
			type = $view.types[suffix];

			// If it is cached, 
			if ($view.cached[id]) {
				// Return the cached deferred renderer.
				return $view.cached[id];

				// Otherwise if we are getting this from a `<script>` element.
			} else if (el) {
				// Resolve immediately with the element's `innerHTML`.
				return $view.registerView(id, el.innerHTML, type);
			} else {
				// Make an ajax request for text.
				var d = new can.Deferred();
				can.ajax({
					async: async,
					url: url,
					dataType: "text",
					error: function (jqXHR) {
						checkText("", url);
						d.reject(jqXHR);
					},
					success: function (text) {
						// Make sure we got some text back.
						checkText(text, url);
						$view.registerView(id, text, type, d)
					}
				});
				return d;
			}
		},
		// Gets an `array` of deferreds from an `object`.
		// This only goes one level deep.
		getDeferreds = function (data) {
			var deferreds = [];

			// pull out deferreds
			if (can.isDeferred(data)) {
				return [data]
			} else {
				for (var prop in data) {
					if (can.isDeferred(data[prop])) {
						deferreds.push(data[prop]);
					}
				}
			}
			return deferreds;
		},
		// Gets the useful part of a resolved deferred.
		// This is for `model`s and `can.ajax` that resolve to an `array`.
		usefulPart = function (resolved) {
			return can.isArray(resolved) && resolved[1] === 'success' ? resolved[0] : resolved
		};



	can.extend($view, {
		register: function (info) {
			this.types["." + info.suffix] = info;



			$view[info.suffix] = function (id, text) {
				if (!text) {
					// Return a nameless renderer
					var renderer = function () {
						return $view.frag(renderer.render.apply(this, arguments));
					}
					renderer.render = function () {
						var renderer = info.renderer(null, id);
						return renderer.apply(renderer, arguments);
					}
					return renderer;
				}

				$view.preload(id, info.renderer(id, text));
				return can.view(id);
			}
		},
		registerScript: function (type, id, src) {
			return "can.view.preload('" + id + "'," + $view.types["." + type].script(id, src) + ");";
		},
		preload: function (id, renderer) {
			$view.cached[id] = new can.Deferred().resolve(function (data, helpers) {
				return renderer.call(data, data, helpers);
			});
			return function () {
				return $view.frag(renderer.apply(this, arguments))
			};
		}

	});

	// ## can/observe/compute/compute.js

	// returns the
	// - observes and attr methods are called by func
	// - the value returned by func
	// ex: `{value: 100, observed: [{obs: o, attr: "completed"}]}`
	var getValueAndObserved = function (func, self) {

		var oldReading;
		if (can.Observe) {
			// Set a callback on can.Observe to know
			// when an attr is read.
			// Keep a reference to the old reader
			// if there is one.  This is used
			// for nested live binding.
			oldReading = can.Observe.__reading;
			can.Observe.__reading = function (obj, attr) {
				// Add the observe and attr that was read
				// to `observed`
				observed.push({
					obj: obj,
					attr: attr
				});
			};
		}

		var observed = [],
			// Call the "wrapping" function to get the value. `observed`
			// will have the observe/attribute pairs that were read.
			value = func.call(self);

		// Set back so we are no longer reading.
		if (can.Observe) {
			can.Observe.__reading = oldReading;
		}
		return {
			value: value,
			observed: observed
		};
	},
		// Calls `callback(newVal, oldVal)` everytime an observed property
		// called within `getterSetter` is changed and creates a new result of `getterSetter`.
		// Also returns an object that can teardown all event handlers.
		computeBinder = function (getterSetter, context, callback) {
			// track what we are observing
			var observing = {},
				// a flag indicating if this observe/attr pair is already bound
				matched = true,
				// the data to return 
				data = {
					// we will maintain the value while live-binding is taking place
					value: undefined,
					// a teardown method that stops listening
					teardown: function () {
						for (var name in observing) {
							var ob = observing[name];
							ob.observe.obj.unbind(ob.observe.attr, onchanged);
							delete observing[name];
						}
					}
				},
				batchNum;

			// when a property value is changed
			var onchanged = function (ev) {
				if (ev.batchNum === undefined || ev.batchNum !== batchNum) {
					// store the old value
					var oldValue = data.value,
						// get the new value
						newvalue = getValueAndBind();
					// update the value reference (in case someone reads)
					data.value = newvalue;
					// if a change happened
					if (newvalue !== oldValue) {
						callback(newvalue, oldValue);
					}
					batchNum = batchNum = ev.batchNum;
				}


			};

			// gets the value returned by `getterSetter` and also binds to any attributes
			// read by the call
			var getValueAndBind = function () {
				var info = getValueAndObserved(getterSetter, context),
					newObserveSet = info.observed;

				var value = info.value;
				matched = !matched;

				// go through every attribute read by this observe
				can.each(newObserveSet, function (ob) {
					// if the observe/attribute pair is being observed
					if (observing[ob.obj._cid + "|" + ob.attr]) {
						// mark at as observed
						observing[ob.obj._cid + "|" + ob.attr].matched = matched;
					} else {
						// otherwise, set the observe/attribute on oldObserved, marking it as being observed
						observing[ob.obj._cid + "|" + ob.attr] = {
							matched: matched,
							observe: ob
						};
						ob.obj.bind(ob.attr, onchanged);
					}
				});

				// Iterate through oldObserved, looking for observe/attributes
				// that are no longer being bound and unbind them
				for (var name in observing) {
					var ob = observing[name];
					if (ob.matched !== matched) {
						ob.observe.obj.unbind(ob.observe.attr, onchanged);
						delete observing[name];
					}
				}
				return value;
			};
			// set the initial value
			data.value = getValueAndBind();
			data.isListening = !can.isEmptyObject(observing);
			return data;
		}

		// if no one is listening ... we can not calculate every time
		can.compute = function (getterSetter, context) {
			if (getterSetter && getterSetter.isComputed) {
				return getterSetter;
			}
			// get the value right away
			// TODO: eventually we can defer this until a bind or a read
			var computedData, bindings = 0,
				computed, canbind = true;
			if (typeof getterSetter === "function") {
				computed = function (value) {
					if (value === undefined) {
						// we are reading
						if (computedData) {
							// If another compute is calling this compute for the value,
							// it needs to bind to this compute's change so it will re-compute
							// and re-bind when this compute changes.
							if (bindings && can.Observe.__reading) {
								can.Observe.__reading(computed, 'change');
							}
							return computedData.value;
						} else {
							return getterSetter.call(context || this)
						}
					} else {
						return getterSetter.apply(context || this, arguments)
					}
				}

			} else {
				// we just gave it a value
				computed = function (val) {
					if (val === undefined) {
						// If observing, record that the value is being read.
						if (can.Observe.__reading) {
							can.Observe.__reading(computed, 'change');
						}
						return getterSetter;
					} else {
						var old = getterSetter;
						getterSetter = val;
						if (old !== val) {
							can.Observe.triggerBatch(computed, "change", [val, old]);
						}

						return val;
					}

				}
				canbind = false;
			}

			computed.isComputed = true;



			computed.bind = function (ev, handler) {
				can.addEvent.apply(computed, arguments);
				if (bindings === 0 && canbind) {
					// setup live-binding
					computedData = computeBinder(getterSetter, context || this, function (newValue, oldValue) {
						can.Observe.triggerBatch(computed, "change", [newValue, oldValue])
					});
				}
				bindings++;
			}

			computed.unbind = function (ev, handler) {
				can.removeEvent.apply(computed, arguments);
				bindings--;
				if (bindings === 0 && canbind) {
					computedData.teardown();
				}

			};
			return computed;
		};
	can.compute.binder = computeBinder;
	// ## can/view/scanner.js
	var newLine = /(\r|\n)+/g,
		tagToContentPropMap = {
			option: "textContent",
			textarea: "value"
		},
		// Escapes characters starting with `\`.
		clean = function (content) {
			return content.split('\\').join("\\\\").split("\n").join("\\n").split('"').join('\\"').split("\t").join("\\t");
		},
		reverseTagMap = {
			tr: "tbody",
			option: "select",
			td: "tr",
			th: "tr",
			li: "ul"
		},
		// Returns a tagName to use as a temporary placeholder for live content
		// looks forward ... could be slow, but we only do it when necessary
		getTag = function (tagName, tokens, i) {
			// if a tagName is provided, use that
			if (tagName) {
				return tagName;
			} else {
				// otherwise go searching for the next two tokens like "<",TAG
				while (i < tokens.length) {
					if (tokens[i] == "<" && reverseTagMap[tokens[i + 1]]) {
						return reverseTagMap[tokens[i + 1]];
					}
					i++;
				}
			}
		},
		bracketNum = function (content) {
			return (--content.split("{").length) - (--content.split("}").length);
		},
		myEval = function (script) {
			eval(script);
		},
		attrReg = /([^\s]+)[\s]*=[\s]*$/,
		// Commands for caching.
		startTxt = 'var ___v1ew = [];',
		finishTxt = "return ___v1ew.join('')",
		put_cmd = "___v1ew.push(",
		insert_cmd = put_cmd,
		// Global controls (used by other functions to know where we are).
		// Are we inside a tag?
		htmlTag = null,
		// Are we within a quote within a tag?
		quote = null,
		// What was the text before the current quote? (used to get the `attr` name)
		beforeQuote = null,
		// Whether a rescan is in progress
		rescan = null,
		// Used to mark where the element is.
		status = function () {
			// `t` - `1`.
			// `h` - `0`.
			// `q` - String `beforeQuote`.
			return quote ? "'" + beforeQuote.match(attrReg)[1] + "'" : (htmlTag ? 1 : 0);
		};

	can.view.Scanner = Scanner = function (options) {
		// Set options on self
		can.extend(this, {
			text: {},
			tokens: []
		}, options);

		// Cache a token lookup
		this.tokenReg = [];
		this.tokenSimple = {
			"<": "<",
			">": ">",
			'"': '"',
			"'": "'"
		};
		this.tokenComplex = [];
		this.tokenMap = {};
		for (var i = 0, token; token = this.tokens[i]; i++) {


			// Save complex mappings (custom regexp)
			if (token[2]) {
				this.tokenReg.push(token[2]);
				this.tokenComplex.push({
					abbr: token[1],
					re: new RegExp(token[2]),
					rescan: token[3]
				});
			}
			// Save simple mappings (string only, no regexp)
			else {
				this.tokenReg.push(token[1]);
				this.tokenSimple[token[1]] = token[0];
			}
			this.tokenMap[token[0]] = token[1];
		}

		// Cache the token registry.
		this.tokenReg = new RegExp("(" + this.tokenReg.slice(0).concat(["<", ">", '"', "'"]).join("|") + ")", "g");
	};

	Scanner.prototype = {

		helpers: [

		{
			name: /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
			fn: function (content) {
				var quickFunc = /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
					parts = content.match(quickFunc);

				return "function(__){var " + parts[1] + "=can.$(__);" + parts[2] + "}";
			}
		}],

		scan: function (source, name) {
			var tokens = [],
				last = 0,
				simple = this.tokenSimple,
				complex = this.tokenComplex;

			source = source.replace(newLine, "\n");
			source.replace(this.tokenReg, function (whole, part) {
				// offset is the second to last argument
				var offset = arguments[arguments.length - 2];

				// if the next token starts after the last token ends
				// push what's in between
				if (offset > last) {
					tokens.push(source.substring(last, offset));
				}

				// push the simple token (if there is one)
				if (simple[whole]) {
					tokens.push(whole);
				}
				// otherwise lookup complex tokens
				else {
					for (var i = 0, token; token = complex[i]; i++) {
						if (token.re.test(whole)) {
							tokens.push(token.abbr);
							// Push a rescan function if one exists
							if (token.rescan) {
								tokens.push(token.rescan(part));
							}
							break;
						}
					}
				}

				// update the position of the last part of the last token
				last = offset + part.length;
			});

			// if there's something at the end, add it
			if (last < source.length) {
				tokens.push(source.substr(last));
			}

			var content = '',
				buff = [startTxt + (this.text.start || '')],
				// Helper `function` for putting stuff in the view concat.
				put = function (content, bonus) {
					buff.push(put_cmd, '"', clean(content), '"' + (bonus || '') + ');');
				},
				// A stack used to keep track of how we should end a bracket
				// `}`.  
				// Once we have a `<%= %>` with a `leftBracket`,
				// we store how the file should end here (either `))` or `;`).
				endStack = [],
				// The last token, used to remember which tag we are in.
				lastToken,
				// The corresponding magic tag.
				startTag = null,
				// Was there a magic tag inside an html tag?
				magicInTag = false,
				// The current tag name.
				tagName = '',
				// stack of tagNames
				tagNames = [],
				// Declared here.
				bracketCount, i = 0,
				token, tmap = this.tokenMap;

			// Reinitialize the tag state goodness.
			htmlTag = quote = beforeQuote = null;

			for (;
			(token = tokens[i++]) !== undefined;) {
				if (startTag === null) {
					switch (token) {
					case tmap.left:
					case tmap.escapeLeft:
					case tmap.returnLeft:
						magicInTag = htmlTag && 1;
					case tmap.commentLeft:
						// A new line -- just add whatever content within a clean.  
						// Reset everything.
						startTag = token;
						if (content.length) {
							put(content);
						}
						content = '';
						break;
					case tmap.escapeFull:
						// This is a full line escape (a line that contains only whitespace and escaped logic)
						// Break it up into escape left and right
						magicInTag = htmlTag && 1;
						rescan = 1;
						startTag = tmap.escapeLeft;
						if (content.length) {
							put(content);
						}
						rescan = tokens[i++];
						content = rescan.content || rescan;
						if (rescan.before) {
							put(rescan.before);
						}
						tokens.splice(i, 0, tmap.right);
						break;
					case tmap.commentFull:
						// Ignore full line comments.
						break;
					case tmap.templateLeft:
						content += tmap.left;
						break;
					case '<':
						// Make sure we are not in a comment.
						if (tokens[i].indexOf("!--") !== 0) {
							htmlTag = 1;
							magicInTag = 0;
						}
						content += token;
						break;
					case '>':
						htmlTag = 0;
						// content.substr(-1) doesn't work in IE7/8
						var emptyElement = content.substr(content.length - 1) == "/";
						// if there was a magic tag
						// or it's an element that has text content between its tags, 
						// but content is not other tags add a hookup
						// TODO: we should only add `can.EJS.pending()` if there's a magic tag 
						// within the html tags.
						if (magicInTag || tagToContentPropMap[tagNames[tagNames.length - 1]]) {
							// make sure / of /> is on the left of pending
							if (emptyElement) {
								put(content.substr(0, content.length - 1), ",can.view.pending(),\"/>\"");
							} else {
								put(content, ",can.view.pending(),\">\"");
							}
							content = '';
						} else {
							content += token;
						}
						// if it's a tag like <input/>
						if (emptyElement) {
							// remove the current tag in the stack
							tagNames.pop();
							// set the current tag to the previous parent
							tagName = tagNames[tagNames.length - 1];
						}
						break;
					case "'":
					case '"':
						// If we are in an html tag, finding matching quotes.
						if (htmlTag) {
							// We have a quote and it matches.
							if (quote && quote === token) {
								// We are exiting the quote.
								quote = null;
								// Otherwise we are creating a quote.
								// TODO: does this handle `\`?
							} else if (quote === null) {
								quote = token;
								beforeQuote = lastToken;
							}
						}
					default:
						// Track the current tag
						if (lastToken === '<') {
							tagName = token.split(/\s/)[0];
							if (tagName.indexOf("/") === 0 && tagNames.pop() === tagName.substr(1)) {
								// set tagName to the last tagName
								// if there are no more tagNames, we'll rely on getTag.
								tagName = tagNames[tagNames.length - 1];
							} else {
								tagNames.push(tagName);
							}
						}
						content += token;
						break;
					}
				} else {
					// We have a start tag.
					switch (token) {
					case tmap.right:
					case tmap.returnRight:
						switch (startTag) {
						case tmap.left:
							// Get the number of `{ minus }`
							bracketCount = bracketNum(content);

							// We are ending a block.
							if (bracketCount == 1) {

								// We are starting on.
								buff.push(insert_cmd, "can.view.txt(0,'" + getTag(tagName, tokens, i) + "'," + status() + ",this,function(){", startTxt, content);

								endStack.push({
									before: "",
									after: finishTxt + "}));\n"
								});
							}
							else {

								// How are we ending this statement?
								last = // If the stack has value and we are ending a block...
								endStack.length && bracketCount == -1 ? // Use the last item in the block stack.
								endStack.pop() : // Or use the default ending.
								{
									after: ";"
								};

								// If we are ending a returning block, 
								// add the finish text which returns the result of the
								// block.
								if (last.before) {
									buff.push(last.before);
								}
								// Add the remaining content.
								buff.push(content, ";", last.after);
							}
							break;
						case tmap.escapeLeft:
						case tmap.returnLeft:
							// We have an extra `{` -> `block`.
							// Get the number of `{ minus }`.
							bracketCount = bracketNum(content);
							// If we have more `{`, it means there is a block.
							if (bracketCount) {
								// When we return to the same # of `{` vs `}` end with a `doubleParent`.
								endStack.push({
									before: finishTxt,
									after: "}));"
								});
							}

							var escaped = startTag === tmap.escapeLeft ? 1 : 0,
								commands = {
									insert: insert_cmd,
									tagName: getTag(tagName, tokens, i),
									status: status()
								};

							for (var ii = 0; ii < this.helpers.length; ii++) {
								// Match the helper based on helper
								// regex name value
								var helper = this.helpers[ii];
								if (helper.name.test(content)) {
									content = helper.fn(content, commands);

									// dont escape partials
									if (helper.name.source == /^>[\s]*\w*/.source) {
										escaped = 0;
									}
									break;
								}
							}

							// Handle special cases
							if (typeof content == 'object') {
								if (content.raw) {
									buff.push(content.raw);
								}
							} else {
								// If we have `<%== a(function(){ %>` then we want
								// `can.EJS.text(0,this, function(){ return a(function(){ var _v1ew = [];`.
								buff.push(insert_cmd, "can.view.txt(" + escaped + ",'" + tagName + "'," + status() + ",this,function(){ " + (this.text.escape || '') + "return ", content,
								// If we have a block.
								bracketCount ?
								// Start with startTxt `"var _v1ew = [];"`.
								startTxt :
								// If not, add `doubleParent` to close push and text.
								"}));");
							}

							if (rescan && rescan.after && rescan.after.length) {
								put(rescan.after.length);
								rescan = null;
							}
							break;
						}
						startTag = null;
						content = '';
						break;
					case tmap.templateLeft:
						content += tmap.left;
						break;
					default:
						content += token;
						break;
					}
				}
				lastToken = token;
			}

			// Put it together...
			if (content.length) {
				// Should be `content.dump` in Ruby.
				put(content);
			}
			buff.push(";");

			var template = buff.join(''),
				out = {
					out: 'with(_VIEW) { with (_CONTEXT) {' + template + " " + finishTxt + "}}"
				};

			// Use `eval` instead of creating a function, because it is easier to debug.
			myEval.call(out, 'this.fn = (function(_CONTEXT,_VIEW){' + out.out + '});\r\n//@ sourceURL=' + name + ".js");

			return out;
		}
	};

	// ## can/view/render.js
	// text node expando test
	var canExpando = true;
	try {
		document.createTextNode('')._ = 0;
	} catch (ex) {
		canExpando = false;
	}

	var attrMap = {
		"class": "className",
		"value": "value",
		"textContent": "textContent"
	},
		tagMap = {
			"": "span",
			table: "tr",
			tr: "td",
			ol: "li",
			ul: "li",
			tbody: "tr",
			thead: "tr",
			tfoot: "tr",
			select: "option",
			optgroup: "option"
		},
		attributePlaceholder = '__!!__',
		attributeReplace = /__!!__/g,
		tagToContentPropMap = {
			option: "textContent",
			textarea: "value"
		},
		bool = can.each(["checked", "disabled", "readonly", "required"], function (n) {
			attrMap[n] = n;
		}),
		// a helper to get the parentNode for a given element el
		// if el is in a documentFragment, it will return defaultParentNode
		getParentNode = function (el, defaultParentNode) {
			return defaultParentNode && el.parentNode.nodeType === 11 ? defaultParentNode : el.parentNode;
		},
		setAttr = function (el, attrName, val) {
			var tagName = el.nodeName.toString().toLowerCase(),
				prop = attrMap[attrName];
			// if this is a special property
			if (prop) {
				// set the value as true / false
				el[prop] = can.inArray(attrName, bool) > -1 ? true : val;
				if (prop === "value" && tagName === "input") {
					el.defaultValue = val;
				}
			} else {
				el.setAttribute(attrName, val);
			}
		},
		getAttr = function (el, attrName) {
			// Default to a blank string for IE7/8
			return (attrMap[attrName] ? el[attrMap[attrName]] : el.getAttribute(attrName)) || '';
		},
		removeAttr = function (el, attrName) {
			if (can.inArray(attrName, bool) > -1) {
				el[attrName] = false;
			} else {
				el.removeAttribute(attrName);
			}
		},
		pendingHookups = [],
		// Returns text content for anything other than a live-binding 
		contentText = function (input) {

			// If it's a string, return.
			if (typeof input == 'string') {
				return input;
			}
			// If has no value, return an empty string.
			if (!input && input !== 0) {
				return '';
			}

			// If it's an object, and it has a hookup method.
			var hook = (input.hookup &&

			// Make a function call the hookup method.


			function (el, id) {
				input.hookup.call(input, el, id);
			}) ||

			// Or if it's a `function`, just use the input.
			(typeof input == 'function' && input);

			// Finally, if there is a `function` to hookup on some dom,
			// add it to pending hookups.
			if (hook) {
				pendingHookups.push(hook);
				return '';
			}

			// Finally, if all else is `false`, `toString()` it.
			return "" + input;
		},
		// Returns escaped/sanatized content for anything other than a live-binding
		contentEscape = function (txt) {
			return (typeof txt == 'string' || typeof txt == 'number') ? can.esc(txt) : contentText(txt);
		},
		// a mapping of element ids to nodeList ids
		nodeMap = {},
		// a mapping of ids to text nodes
		textNodeMap = {},
		// a mapping of nodeList ids to nodeList
		nodeListMap = {},
		expando = "ejs_" + Math.random(),
		_id = 0,
		id = function (node) {
			if (canExpando || node.nodeType !== 3) {
				if (node[expando]) {
					return node[expando];
				}
				else {
					return node[expando] = (node.nodeName ? "element_" : "obj_") + (++_id);
				}
			}
			else {
				for (var textNodeID in textNodeMap) {
					if (textNodeMap[textNodeID] === node) {
						return textNodeID;
					}
				}

				textNodeMap["text_" + (++_id)] = node;
				return "text_" + _id;
			}
		},
		// removes a nodeListId from a node's nodeListIds
		removeNodeListId = function (node, nodeListId) {
			var nodeListIds = nodeMap[id(node)];
			if (nodeListIds) {
				var index = can.inArray(nodeListId, nodeListIds);

				if (index >= 0) {
					nodeListIds.splice(index, 1);
				}
				if (!nodeListIds.length) {
					delete nodeMap[id(node)];
				}
			}
		},
		addNodeListId = function (node, nodeListId) {
			var nodeListIds = nodeMap[id(node)];
			if (!nodeListIds) {
				nodeListIds = nodeMap[id(node)] = [];
			}
			nodeListIds.push(nodeListId);
		},
		tagChildren = function (tagName) {
			var newTag = tagMap[tagName] || "span";
			if (newTag === "span") {
				//innerHTML in IE doesn't honor leading whitespace after empty elements
				return "@@!!@@";
			}
			return "<" + newTag + ">" + tagChildren(newTag) + "</" + newTag + ">";
		};

	can.extend(can.view, {

		pending: function () {
			// TODO, make this only run for the right tagName
			var hooks = pendingHookups.slice(0);
			lastHookups = hooks;
			pendingHookups = [];
			return can.view.hook(function (el) {
				can.each(hooks, function (fn) {
					fn(el);
				});
			});
		},

		registerNode: function (nodeList) {
			var nLId = id(nodeList);
			nodeListMap[nLId] = nodeList;

			can.each(nodeList, function (node) {
				addNodeListId(node, nLId);
			});
		},

		unregisterNode: function (nodeList) {
			var nLId = id(nodeList);
			can.each(nodeList, function (node) {
				removeNodeListId(node, nLId);
			});
			delete nodeListMap[nLId];
		},


		txt: function (escape, tagName, status, self, func) {
			// call the "wrapping" function and get the binding information
			var binding = can.compute.binder(func, self, function (newVal, oldVal) {
				// call the update method we will define for each
				// type of attribute
				update(newVal, oldVal);
			});

			// If we had no observes just return the value returned by func.
			if (!binding.isListening) {
				return (escape || status !== 0 ? contentEscape : contentText)(binding.value);
			}

			// The following are helper methods or varaibles that will
			// be defined by one of the various live-updating schemes.
			// The parent element we are listening to for teardown
			var parentElement, nodeList, teardown = function () {
				binding.teardown();
				if (nodeList) {
					can.view.unregisterNode(nodeList);
				}
			},
				// if the parent element is removed, teardown the binding
				setupTeardownOnDestroy = function (el) {
					can.bind.call(el, 'destroyed', teardown);
					parentElement = el;
				},
				// if there is no parent, undo bindings
				teardownCheck = function (parent) {
					if (!parent) {
						teardown();
						can.unbind.call(parentElement, 'destroyed', teardown);
					}
				},
				// the tag type to insert
				tag = (tagMap[tagName] || "span"),
				// this will be filled in if binding.isListening
				update,
				// the property (instead of innerHTML elements) to adjust. For
				// example options should use textContent
				contentProp = tagToContentPropMap[tagName];


			// The magic tag is outside or between tags.
			if (status === 0 && !contentProp) {
				// Return an element tag with a hookup in place of the content
				return "<" + tag + can.view.hook(
				escape ?
				// If we are escaping, replace the parentNode with 
				// a text node who's value is `func`'s return value.


				function (el, parentNode) {
					// updates the text of the text node
					update = function (newVal) {
						node.nodeValue = "" + newVal;
						teardownCheck(node.parentNode);
					};

					var parent = getParentNode(el, parentNode),
						node = document.createTextNode(binding.value);

					parent.insertBefore(node, el);
					parent.removeChild(el);
					setupTeardownOnDestroy(parent);
				} :
				// If we are not escaping, replace the parentNode with a
				// documentFragment created as with `func`'s return value.


				function (span, parentNode) {
					// updates the elements with the new content
					update = function (newVal) {
						// is this still part of the DOM?
						var attached = nodes[0].parentNode;
						// update the nodes in the DOM with the new rendered value
						if (attached) {
							makeAndPut(newVal);
						}
						teardownCheck(nodes[0].parentNode);
					};

					// make sure we have a valid parentNode
					parentNode = getParentNode(span, parentNode);
					// A helper function to manage inserting the contents
					// and removing the old contents
					var nodes, makeAndPut = function (val) {
						// create the fragment, but don't hook it up
						// we need to insert it into the document first
						var frag = can.view.frag(val, parentNode),
							// keep a reference to each node
							newNodes = can.makeArray(frag.childNodes),
							last = nodes ? nodes[nodes.length - 1] : span;

						// Insert it in the `document` or `documentFragment`
						if (last.nextSibling) {
							last.parentNode.insertBefore(frag, last.nextSibling);
						} else {
							last.parentNode.appendChild(frag);
						}
						// nodes hasn't been set yet
						if (!nodes) {
							can.remove(can.$(span));
							nodes = newNodes;
							// set the teardown nodeList
							nodeList = nodes;
							can.view.registerNode(nodes);
						} else {
							can.remove(can.$(nodes));
							can.view.replace(nodes, newNodes);
						}
					};
					// nodes are the nodes that any updates will replace
					// at this point, these nodes could be part of a documentFragment
					makeAndPut(binding.value, [span]);

					setupTeardownOnDestroy(parentNode);
					//children have to be properly nested HTML for buildFragment to work properly
				}) + ">" + tagChildren(tag) + "</" + tag + ">";
				// In a tag, but not in an attribute
			} else if (status === 1) {
				// remember the old attr name
				var attrName = binding.value.replace(/['"]/g, '').split('=')[0];
				pendingHookups.push(function (el) {
					update = function (newVal) {
						var parts = (newVal || "").replace(/['"]/g, '').split('='),
							newAttrName = parts[0];

						// Remove if we have a change and used to have an `attrName`.
						if ((newAttrName != attrName) && attrName) {
							removeAttr(el, attrName);
						}
						// Set if we have a new `attrName`.
						if (newAttrName) {
							setAttr(el, newAttrName, parts[1]);
							attrName = newAttrName;
						}
					};
					setupTeardownOnDestroy(el);
				});

				return binding.value;
			} else { // In an attribute...
				var attributeName = status === 0 ? contentProp : status;
				// if the magic tag is inside the element, like `<option><% TAG %></option>`,
				// we add this hookup to the last element (ex: `option`'s) hookups.
				// Otherwise, the magic tag is in an attribute, just add to the current element's
				// hookups.
				(status === 0 ? lastHookups : pendingHookups).push(function (el) {
					// update will call this attribute's render method
					// and set the attribute accordingly
					update = function () {
						setAttr(el, attributeName, hook.render(), contentProp);
					};

					var wrapped = can.$(el),
						hooks;

					// Get the list of hookups or create one for this element.
					// Hooks is a map of attribute names to hookup `data`s.
					// Each hookup data has:
					// `render` - A `function` to render the value of the attribute.
					// `funcs` - A list of hookup `function`s on that attribute.
					// `batchNum` - The last event `batchNum`, used for performance.
					hooks = can.data(wrapped, 'hooks');
					if (!hooks) {
						can.data(wrapped, 'hooks', hooks = {});
					}

					// Get the attribute value.
					var attr = getAttr(el, attributeName, contentProp),
						// Split the attribute value by the template.
						// Only split out the first __!!__ so if we have multiple hookups in the same attribute, 
						// they will be put in the right spot on first render
						parts = attr.split(attributePlaceholder),
						goodParts = [],
						hook;
					goodParts.push(parts.shift(), parts.join(attributePlaceholder));

					// If we already had a hookup for this attribute...
					if (hooks[attributeName]) {
						// Just add to that attribute's list of `function`s.
						hooks[attributeName].bindings.push(binding);
					} else {
						// Create the hookup data.
						hooks[attributeName] = {
							render: function () {
								var i = 0,
									newAttr = attr.replace(attributeReplace, function () {
										return contentText(hook.bindings[i++].value);
									});
								return newAttr;
							},
							bindings: [binding],
							batchNum: undefined
						};
					}

					// Save the hook for slightly faster performance.
					hook = hooks[attributeName];

					// Insert the value in parts.
					goodParts.splice(1, 0, binding.value);

					// Set the attribute.
					setAttr(el, attributeName, goodParts.join(""), contentProp);

					// Bind on change.
					//liveBind(observed, el, binder,oldObserved);
					setupTeardownOnDestroy(el);
				});
				return attributePlaceholder;
			}
		},

		replace: function (oldNodeList, newNodes) {
			// for each node in the node list
			oldNodeList = can.makeArray(oldNodeList);

			can.each(oldNodeList, function (node) {
				// for each nodeList the node is in
				can.each(can.makeArray(nodeMap[id(node)]), function (nodeListId) {
					var nodeList = nodeListMap[nodeListId],
						startIndex = can.inArray(node, nodeList),
						endIndex = can.inArray(oldNodeList[oldNodeList.length - 1], nodeList);

					// remove this nodeListId from each node
					if (startIndex >= 0 && endIndex >= 0) {
						for (var i = startIndex; i <= endIndex; i++) {
							var n = nodeList[i];
							removeNodeListId(n, nodeListId);
						}

						// swap in new nodes into the nodeLIst
						nodeList.splice.apply(nodeList, [startIndex, endIndex - startIndex + 1].concat(newNodes));

						// tell these new nodes they belong to the nodeList
						can.each(newNodes, function (node) {
							addNodeListId(node, nodeListId);
						});
					} else {
						can.view.unregisterNode(nodeList);
					}
				});
			});
		},

		canExpando: canExpando,
		// Node mappings
		textNodeMap: textNodeMap,
		nodeMap: nodeMap,
		nodeListMap: nodeListMap
	});

	// ## can/view/ejs/ejs.js
	// ## ejs.js
	// `can.EJS`  
	// _Embedded JavaScript Templates._
	// Helper methods.
	var extend = can.extend,
		EJS = function (options) {
			// Supports calling EJS without the constructor
			// This returns a function that renders the template.
			if (this.constructor != EJS) {
				var ejs = new EJS(options);
				return function (data, helpers) {
					return ejs.render(data, helpers);
				};
			}
			// If we get a `function` directly, it probably is coming from
			// a `steal`-packaged view.
			if (typeof options == "function") {
				this.template = {
					fn: options
				};
				return;
			}
			// Set options on self.
			extend(this, options);
			this.template = this.scanner.scan(this.text, this.name);
		};


	can.EJS = EJS;


	EJS.prototype.

	render = function (object, extraHelpers) {
		object = object || {};
		return this.template.fn.call(object, object, new EJS.Helpers(object, extraHelpers || {}));
	};

	extend(EJS.prototype, {

		scanner: new can.view.Scanner({

			tokens: [
				["templateLeft", "<%%"], // Template
				["templateRight", "%>"], // Right Template
				["returnLeft", "<%=="], // Return Unescaped
				["escapeLeft", "<%="], // Return Escaped
				["commentLeft", "<%#"], // Comment
				["left", "<%"], // Run --- this is hack for now
				["right", "%>"], // Right -> All have same FOR Mustache ...
				["returnRight", "%>"]
			]
		})
	});


	EJS.Helpers = function (data, extras) {
		this._data = data;
		this._extras = extras;
		extend(this, extras);
	};

	EJS.Helpers.prototype = {

		// TODO Deprecated!!
		list: function (list, cb) {
			can.each(list, function (item, i) {
				cb(item, i, list)
			})
		}
	};

	// Options for `steal`'s build.
	can.view.register({
		suffix: "ejs",
		// returns a `function` that renders the view.
		script: function (id, src) {
			return "can.EJS(function(_CONTEXT,_VIEW) { " + new EJS({
				text: src,
				name: id
			}).template.out + " })";
		},
		renderer: function (id, text) {
			return EJS({
				text: text,
				name: id
			});
		}
	});


})(this, jQuery);
!function () {
	var base64Chars = new Array(
		'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
		'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
		'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
		'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
		'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
		'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
		'w', 'x', 'y', 'z', '0', '1', '2', '3',
		'4', '5', '6', '7', '8', '9', '+', '/'
	);

	var END_OF_INPUT = -1;

	var reverseBase64Chars = new Array();
	for (var i = 0; i < base64Chars.length; i++) {
		reverseBase64Chars[base64Chars[i]] = i;
	}

	var base64Str;
	var base64Count;
	function setBase64Str(str) {
		base64Str = str;
		base64Count = 0;
	}
	function readBase64() {
		if (!base64Str) return END_OF_INPUT;
		if (base64Count >= base64Str.length) return END_OF_INPUT;
		var c = base64Str.charCodeAt(base64Count) & 0xff;
		base64Count++;
		return c;
	}
	function encodeBase64(str) {
		setBase64Str(str);
		var result = '';
		var inBuffer = new Array(3);
		var lineCount = 0;
		var done = false;
		while (!done && (inBuffer[0] = readBase64()) != END_OF_INPUT) {
			inBuffer[1] = readBase64();
			inBuffer[2] = readBase64();
			result += (base64Chars[ inBuffer[0] >> 2 ]);
			if (inBuffer[1] != END_OF_INPUT) {
				result += (base64Chars [(( inBuffer[0] << 4 ) & 0x30) | (inBuffer[1] >> 4) ]);
				if (inBuffer[2] != END_OF_INPUT) {
					result += (base64Chars [((inBuffer[1] << 2) & 0x3c) | (inBuffer[2] >> 6) ]);
					result += (base64Chars [inBuffer[2] & 0x3F]);
				} else {
					result += (base64Chars [((inBuffer[1] << 2) & 0x3c)]);
					result += ('=');
					done = true;
				}
			} else {
				result += (base64Chars [(( inBuffer[0] << 4 ) & 0x30)]);
				result += ('=');
				result += ('=');
				done = true;
			}
			lineCount += 4;
			if (lineCount >= 76) {
				result += ('\n');
				lineCount = 0;
			}
		}
		return result;
	}

	function readReverseBase64() {
		if (!base64Str) return END_OF_INPUT;
		while (true) {
			if (base64Count >= base64Str.length) return END_OF_INPUT;
			var nextCharacter = base64Str.charAt(base64Count);
			base64Count++;
			if (reverseBase64Chars[nextCharacter]) {
				return reverseBase64Chars[nextCharacter];
			}
			if (nextCharacter == 'A') return 0;
		}
		return END_OF_INPUT;
	}

	function ntos(n) {
		n = n.toString(16);
		if (n.length == 1) n = "0" + n;
		n = "%" + n;
		return unescape(n);
	}

	function decodeBase64(str) {
		setBase64Str(str);
		var result = "";
		var inBuffer = new Array(4);
		var done = false;
		while (!done && (inBuffer[0] = readReverseBase64()) != END_OF_INPUT
			&& (inBuffer[1] = readReverseBase64()) != END_OF_INPUT) {
			inBuffer[2] = readReverseBase64();
			inBuffer[3] = readReverseBase64();
			result += ntos((((inBuffer[0] << 2) & 0xff) | inBuffer[1] >> 4));
			if (inBuffer[2] != END_OF_INPUT) {
				result += ntos((((inBuffer[1] << 4) & 0xff) | inBuffer[2] >> 2));
				if (inBuffer[3] != END_OF_INPUT) {
					result += ntos((((inBuffer[2] << 6) & 0xff) | inBuffer[3]));
				} else {
					done = true;
				}
			} else {
				done = true;
			}
		}
		return result;
	}

	var digitArray = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
	function toHex(n) {
		var result = ''
		var start = true;
		for (var i = 32; i > 0;) {
			i -= 4;
			var digit = (n >> i) & 0xf;
			if (!start || digit != 0) {
				start = false;
				result += digitArray[digit];
			}
		}
		return (result == '' ? '0' : result);
	}

	function pad(str, len, pad) {
		var result = str;
		for (var i = str.length; i < len; i++) {
			result = pad + result;
		}
		return result;
	}

	function encodeHex(str) {
		var result = "";
		for (var i = 0; i < str.length; i++) {
			result += pad(toHex(str.charCodeAt(i) & 0xff), 2, '0');
		}
		return result;
	}

	var hexv = {
		"00": 0, "01": 1, "02": 2, "03": 3, "04": 4, "05": 5, "06": 6, "07": 7, "08": 8, "09": 9, "0A": 10, "0B": 11, "0C": 12, "0D": 13, "0E": 14, "0F": 15,
		"10": 16, "11": 17, "12": 18, "13": 19, "14": 20, "15": 21, "16": 22, "17": 23, "18": 24, "19": 25, "1A": 26, "1B": 27, "1C": 28, "1D": 29, "1E": 30, "1F": 31,
		"20": 32, "21": 33, "22": 34, "23": 35, "24": 36, "25": 37, "26": 38, "27": 39, "28": 40, "29": 41, "2A": 42, "2B": 43, "2C": 44, "2D": 45, "2E": 46, "2F": 47,
		"30": 48, "31": 49, "32": 50, "33": 51, "34": 52, "35": 53, "36": 54, "37": 55, "38": 56, "39": 57, "3A": 58, "3B": 59, "3C": 60, "3D": 61, "3E": 62, "3F": 63,
		"40": 64, "41": 65, "42": 66, "43": 67, "44": 68, "45": 69, "46": 70, "47": 71, "48": 72, "49": 73, "4A": 74, "4B": 75, "4C": 76, "4D": 77, "4E": 78, "4F": 79,
		"50": 80, "51": 81, "52": 82, "53": 83, "54": 84, "55": 85, "56": 86, "57": 87, "58": 88, "59": 89, "5A": 90, "5B": 91, "5C": 92, "5D": 93, "5E": 94, "5F": 95,
		"60": 96, "61": 97, "62": 98, "63": 99, "64": 100, "65": 101, "66": 102, "67": 103, "68": 104, "69": 105, "6A": 106, "6B": 107, "6C": 108, "6D": 109, "6E": 110, "6F": 111,
		"70": 112, "71": 113, "72": 114, "73": 115, "74": 116, "75": 117, "76": 118, "77": 119, "78": 120, "79": 121, "7A": 122, "7B": 123, "7C": 124, "7D": 125, "7E": 126, "7F": 127,
		"80": 128, "81": 129, "82": 130, "83": 131, "84": 132, "85": 133, "86": 134, "87": 135, "88": 136, "89": 137, "8A": 138, "8B": 139, "8C": 140, "8D": 141, "8E": 142, "8F": 143,
		"90": 144, "91": 145, "92": 146, "93": 147, "94": 148, "95": 149, "96": 150, "97": 151, "98": 152, "99": 153, "9A": 154, "9B": 155, "9C": 156, "9D": 157, "9E": 158, "9F": 159,
		"A0": 160, "A1": 161, "A2": 162, "A3": 163, "A4": 164, "A5": 165, "A6": 166, "A7": 167, "A8": 168, "A9": 169, "AA": 170, "AB": 171, "AC": 172, "AD": 173, "AE": 174, "AF": 175,
		"B0": 176, "B1": 177, "B2": 178, "B3": 179, "B4": 180, "B5": 181, "B6": 182, "B7": 183, "B8": 184, "B9": 185, "BA": 186, "BB": 187, "BC": 188, "BD": 189, "BE": 190, "BF": 191,
		"C0": 192, "C1": 193, "C2": 194, "C3": 195, "C4": 196, "C5": 197, "C6": 198, "C7": 199, "C8": 200, "C9": 201, "CA": 202, "CB": 203, "CC": 204, "CD": 205, "CE": 206, "CF": 207,
		"D0": 208, "D1": 209, "D2": 210, "D3": 211, "D4": 212, "D5": 213, "D6": 214, "D7": 215, "D8": 216, "D9": 217, "DA": 218, "DB": 219, "DC": 220, "DD": 221, "DE": 222, "DF": 223,
		"E0": 224, "E1": 225, "E2": 226, "E3": 227, "E4": 228, "E5": 229, "E6": 230, "E7": 231, "E8": 232, "E9": 233, "EA": 234, "EB": 235, "EC": 236, "ED": 237, "EE": 238, "EF": 239,
		"F0": 240, "F1": 241, "F2": 242, "F3": 243, "F4": 244, "F5": 245, "F6": 246, "F7": 247, "F8": 248, "F9": 249, "FA": 250, "FB": 251, "FC": 252, "FD": 253, "FE": 254, "FF": 255
	};

	function decodeHex(str) {
		str = str.toUpperCase().replace(new RegExp("s/[^0-9A-Z]//g"));
		var result = "";
		var nextchar = "";
		for (var i = 0; i < str.length; i++) {
			nextchar += str.charAt(i);
			if (nextchar.length == 2) {
				result += ntos(hexv[nextchar]);
				nextchar = "";
			}
		}
		return result;
	}

	window.base64 = {
		decode: decodeBase64,
		encode: encodeBase64
	}
}();

/**
 * marked - a markdown parser
 * Copyright (c) 2011-2013, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){3,} *\n*/,
  blockquote: /^( *>[^\n]+(\n[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', /\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,}) *(\w+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!' + block.gfm.fences.source.replace('\\1', '\\2') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3]
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'list_start',
        ordered: isFinite(cap[2])
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      // Get bullet.
      if (this.options.smartLists) {
        bull = block.bullet.exec(cap[0])[0];
      }

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i+1])[0];
          if (bull !== b && !(bull[1] === '.' && b[1] === '.')) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item[item.length-1] === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: cap[1] === 'pre',
        text: cap[0]
      });
      continue;
    }

    // def
    if (top && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1][cap[1].length-1] === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([^\s]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1][6] === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += '<a href="'
        + href
        + '">'
        + text
        + '</a>';
      continue;
    }

    // url (gfm)
    if (cap = this.rules.url.exec(src)) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += '<a href="'
        + href
        + '">'
        + text
        + '</a>';
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? escape(cap[0])
        : cap[0];
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0][0];
        src = cap[0].substring(1) + src;
        continue;
      }
      out += this.outputLink(cap, link);
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<strong>'
        + this.output(cap[2] || cap[1])
        + '</strong>';
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<em>'
        + this.output(cap[2] || cap[1])
        + '</em>';
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<code>'
        + escape(cap[2], true)
        + '</code>';
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<br>';
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<del>'
        + this.output(cap[1])
        + '</del>';
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += escape(cap[0]);
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  if (cap[0][0] !== '!') {
    return '<a href="'
      + escape(link.href)
      + '"'
      + (link.title
      ? ' title="'
      + escape(link.title)
      + '"'
      : '')
      + '>'
      + this.output(cap[1])
      + '</a>';
  } else {
    return '<img src="'
      + escape(link.href)
      + '" alt="'
      + escape(cap[1])
      + '"'
      + (link.title
      ? ' title="'
      + escape(link.title)
      + '"'
      : '')
      + '>';
  }
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options) {
  var parser = new Parser(options);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length-1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return '<hr>\n';
    }
    case 'heading': {
      return '<h'
        + this.token.depth
        + '>'
        + this.inline.output(this.token.text)
        + '</h'
        + this.token.depth
        + '>\n';
    }
    case 'code': {
      if (this.options.highlight) {
        var code = this.options.highlight(this.token.text, this.token.lang);
        if (code != null && code !== this.token.text) {
          this.token.escaped = true;
          this.token.text = code;
        }
      }

      if (!this.token.escaped) {
        this.token.text = escape(this.token.text, true);
      }

      return '<pre><code'
        + (this.token.lang
        ? ' class="'
        + this.options.langPrefix
        + this.token.lang
        + '"'
        : '')
        + '>'
        + this.token.text
        + '</code></pre>\n';
    }
    case 'table': {
      var body = ''
        , heading
        , i
        , row
        , cell
        , j;

      // header
      body += '<thead>\n<tr>\n';
      for (i = 0; i < this.token.header.length; i++) {
        heading = this.inline.output(this.token.header[i]);
        body += this.token.align[i]
          ? '<th align="' + this.token.align[i] + '">' + heading + '</th>\n'
          : '<th>' + heading + '</th>\n';
      }
      body += '</tr>\n</thead>\n';

      // body
      body += '<tbody>\n'
      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];
        body += '<tr>\n';
        for (j = 0; j < row.length; j++) {
          cell = this.inline.output(row[j]);
          body += this.token.align[j]
            ? '<td align="' + this.token.align[j] + '">' + cell + '</td>\n'
            : '<td>' + cell + '</td>\n';
        }
        body += '</tr>\n';
      }
      body += '</tbody>\n';

      return '<table>\n'
        + body
        + '</table>\n';
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return '<blockquote>\n'
        + body
        + '</blockquote>\n';
    }
    case 'list_start': {
      var type = this.token.ordered ? 'ol' : 'ul'
        , body = '';

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return '<'
        + type
        + '>\n'
        + body
        + '</'
        + type
        + '>\n';
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return '<li>'
        + body
        + '</li>\n';
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return '<li>'
        + body
        + '</li>\n';
    }
    case 'html': {
      return !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
    }
    case 'paragraph': {
      return '<p>'
        + this.inline.output(this.token.text)
        + '</p>\n';
    }
    case 'text': {
      return '<p>'
        + this.parseText()
        + '</p>\n';
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}

/**
 * Marked
 */

function marked(src, opt) {
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-'
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());
/*
* CanJS - 1.1.3 (2012-12-11)
* http://canjs.us/
* Copyright (c) 2012 Bitovi
* Licensed MIT
*/
(function (can, window, undefined) {
	// ## can/view/mustache/mustache.js

	// # mustache.js
	// `can.Mustache`: The Mustache templating engine.
	// See the [Transformation](#section-29) section within *Scanning Helpers* for a detailed explanation 
	// of the runtime render code design. The majority of the Mustache engine implementation 
	// occurs within the *Transformation* scanning helper.
	// ## Initialization
	// Define the view extension.
	can.view.ext = ".mustache";

	// ### Setup internal helper variables and functions.
	// An alias for the context variable used for tracking a stack of contexts.
	// This is also used for passing to helper functions to maintain proper context.
	var CONTEXT = '___c0nt3xt',
		// An alias for the variable used for the hash object that can be passed
		// to helpers via `options.hash`.
		HASH = '___h4sh',
		// An alias for the function that adds a new context to the context stack.
		STACK = '___st4ck',
		// An alias for the most used context stacking call.
		CONTEXT_STACK = STACK + '(' + CONTEXT + ',this)',


		isObserve = function (obj) {
			return can.isFunction(obj.attr) && obj.constructor && !! obj.constructor.canMakeObserve;
		},


		isArrayLike = function (obj) {
			return obj && obj.splice && typeof obj.length == 'number';
		},

		// ## Mustache
		Mustache = function (options) {
			// Support calling Mustache without the constructor.
			// This returns a function that renders the template.
			if (this.constructor != Mustache) {
				var mustache = new Mustache(options);
				return function (data) {
					return mustache.render(data);
				};
			}

			// If we get a `function` directly, it probably is coming from
			// a `steal`-packaged view.
			if (typeof options == "function") {
				this.template = {
					fn: options
				};
				return;
			}

			// Set options on self.
			can.extend(this, options);
			this.template = this.scanner.scan(this.text, this.name);
		};


	// Put Mustache on the `can` object.
	can.Mustache = window.Mustache = Mustache;


	Mustache.prototype.

	render = function (object, extraHelpers) {
		object = object || {};
		return this.template.fn.call(object, object, {
			_data: object
		});
	};

	can.extend(Mustache.prototype, {
		// Share a singleton scanner for parsing templates.
		scanner: new can.view.Scanner({
			// A hash of strings for the scanner to inject at certain points.
			text: {
				// This is the logic to inject at the beginning of a rendered template. 
				// This includes initializing the `context` stack.
				start: 'var ' + CONTEXT + ' = []; ' + CONTEXT + '.' + STACK + ' = true;' + 'var ' + STACK + ' = function(context, self) {' + 'var s;' + 'if (arguments.length == 1 && context) {' + 's = !context.' + STACK + ' ? [context] : context;' + '} else {' + 's = context && context.' + STACK + ' ? context.concat([self]) : ' + STACK + '(context).concat([self]);' + '}' + 'return (s.' + STACK + ' = true) && s;' + '};'
			},

			// An ordered token registry for the scanner.
			// This needs to be ordered by priority to prevent token parsing errors.
			// Each token follows the following structure:
			//		[
			//			// Which key in the token map to match.
			//			"tokenMapName",
			//			// A simple token to match, like "{{".
			//			"token",
			//			// Optional. A complex (regexp) token to match that 
			//			// overrides the simple token.
			//			"[\\s\\t]*{{",
			//			// Optional. A function that executes advanced 
			//			// manipulation of the matched content. This is 
			//			// rarely used.
			//			function(content){   
			//				return content;
			//			}
			//		]
			tokens: [
			// Return unescaped
			["returnLeft", "{{{", "{{[{&]"],
			// Full line comments
			["commentFull", "{{!}}", "^[\\s\\t]*{{!.+?}}\\n"],
			// Inline comments
			["commentLeft", "{{!", "(\\n[\\s\\t]*{{!|{{!)"],
			// Full line escapes
			// This is used for detecting lines with only whitespace and an escaped tag
			["escapeFull", "{{}}", "(^[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}$)", function (content) {
				return {
					before: /^\n.+?\n$/.test(content) ? '\n' : '',
					content: content.match(/\{\{(.+?)\}\}/)[1] || ''
				};
			}],
			// Return escaped
			["escapeLeft", "{{"],
			// Close return unescaped
			["returnRight", "}}}"],
			// Close tag
			["right", "}}"]],

			// ## Scanning Helpers
			// This is an array of helpers that transform content that is within escaped tags like `{{token}}`. These helpers are solely for the scanning phase; they are unrelated to Mustache/Handlebars helpers which execute at render time. Each helper has a definition like the following:
			//		{
			//			// The content pattern to match in order to execute.
			//			// Only the first matching helper is executed.
			//			name: /pattern to match/,
			//			// The function to transform the content with.
			//			// @param {String} content   The content to transform.
			//			// @param {Object} cmd       Scanner helper data.
			//			//                           {
			//			//                             insert: "insert command",
			//			//                             tagName: "div",
			//			//                             status: 0
			//			//                           }
			//			fn: function(content, cmd) {
			//				return 'for text injection' || 
			//					{ raw: 'to bypass text injection' };
			//			}
			//		}
			helpers: [
			// ### Partials
			// Partials begin with a greater than sign, like {{> box}}.
			// Partials are rendered at runtime (as opposed to compile time), 
			// so recursive partials are possible. Just avoid infinite loops.
			// For example, this template and partial:
			// 		base.mustache:
			// 			<h2>Names</h2>
			// 			{{#names}}
			// 				{{> user}}
			// 			{{/names}}
			// 		user.mustache:
			// 			<strong>{{name}}</strong>
			{
				name: /^>[\s]*\w*/,
				fn: function (content, cmd) {
					// Get the template name and call back into the render method,
					// passing the name and the current context.
					var templateName = can.trim(content.replace(/^>\s?/, '')).replace(/["|']/g, "");
					return "can.Mustache.render('" + templateName + "', " + CONTEXT_STACK + ".pop())";
				}
			},

			// ### Data Hookup
			// This will attach the data property of `this` to the element
			// its found on using the first argument as the data attribute
			// key.
			// For example:
			//		<li id="nameli" {{ data 'name' }}></li>
			// then later you can access it like:
			//		can.$('#nameli').data('name');
			{
				name: /^\s*data\s/,
				fn: function (content, cmd) {
					var attr = content.match(/["|'](.*)["|']/)[1];
					// return a function which calls `can.data` on the element
					// with the attribute name with the current context.
					return "can.proxy(function(__){can.data(can.$(__),'" + attr + "', this.pop()); }, " + CONTEXT_STACK + ")";
				}
			},

			// ### Transformation (default)
			// This transforms all content to its interpolated equivalent,
			// including calls to the corresponding helpers as applicable. 
			// This outputs the render code for almost all cases.
			// #### Definitions
			// * `context` - This is the object that the current rendering context operates within. 
			//		Each nested template adds a new `context` to the context stack.
			// * `stack` - Mustache supports nested sections, 
			//		each of which add their own context to a stack of contexts.
			//		Whenever a token gets interpolated, it will check for a match against the 
			//		last context in the stack, then iterate through the rest of the stack checking for matches.
			//		The first match is the one that gets returned.
			// * `Mustache.txt` - This serializes a collection of logic, optionally contained within a section.
			//		If this is a simple interpolation, only the interpolation lookup will be passed.
			//		If this is a section, then an `options` object populated by the truthy (`options.fn`) and 
			//		falsey (`options.inverse`) encapsulated functions will also be passed. This section handling 
			//		exists to support the runtime context nesting that Mustache supports.
			// * `Mustache.get` - This resolves an interpolation reference given a stack of contexts.
			// * `options` - An object containing methods for executing the inner contents of sections or helpers.  
			//		`options.fn` - Contains the inner template logic for a truthy section.  
			//		`options.inverse` - Contains the inner template logic for a falsey section.  
			//		`options.hash` - Contains the merged hash object argument for custom helpers.
			// #### Design
			// This covers the design of the render code that the transformation helper generates.
			// ##### Pseudocode
			// A detailed explanation is provided in the following sections, but here is some brief pseudocode
			// that gives a high level overview of what the generated render code does (with a template similar to  
			// `"{{#a}}{{b.c.d.e.name}}{{/a}}" == "Phil"`).
			// *Initialize the render code.*
			// 		view = []
			// 		context = []
			// 		stack = fn { context.concat([this]) }
			// *Render the root section.*
			// 		view.push( "string" )
			// 		view.push( can.view.txt(
			// *Render the nested section with `can.Mustache.txt`.*
			// 			txt( 
			// *Add the current context to the stack.*
			// 				stack(), 
			// *Flag this for truthy section mode.*
			// 				"#",
			// *Interpolate and check the `a` variable for truthyness using the stack with `can.Mustache.get`.*
			// 				get( "a", stack() ),
			// *Include the nested section's inner logic.
			// The stack argument is usually the parent section's copy of the stack, 
			// but it can be an override context that was passed by a custom helper.
			// Sections can nest `0..n` times -- **NESTCEPTION**.*
			// 				{ fn: fn(stack) {
			// *Render the nested section (everything between the `{{#a}}` and `{{/a}}` tokens).*
			// 					view = []
			// 					view.push( "string" )
			// 					view.push(
			// *Add the current context to the stack.*
			// 						stack(),
			// *Flag this as interpolation-only mode.*
			// 						null,
			// *Interpolate the `b.c.d.e.name` variable using the stack.*
			// 						get( "b.c.d.e.name", stack() ),
			// 					)
			// 					view.push( "string" )
			// *Return the result for the nested section.*
			// 					return view.join()
			// 				}}
			// 			)
			// 		))
			// 		view.push( "string" )
			// *Return the result for the root section, which includes all nested sections.*
			// 		return view.join()
			// ##### Initialization
			// Each rendered template is started with the following initialization code:
			// 		var ___v1ew = [];
			// 		var ___c0nt3xt = [];
			// 		___c0nt3xt.___st4ck = true;
			// 		var ___st4ck = function(context, self) {
			// 			var s;
			// 			if (arguments.length == 1 && context) {
			// 				s = !context.___st4ck ? [context] : context;
			// 			} else {
			// 				s = context && context.___st4ck 
			//					? context.concat([self]) 
			//					: ___st4ck(context).concat([self]);
			// 			}
			// 			return (s.___st4ck = true) && s;
			// 		};
			// The `___v1ew` is the the array used to serialize the view.
			// The `___c0nt3xt` is a stacking array of contexts that slices and expands with each nested section.
			// The `___st4ck` function is used to more easily update the context stack in certain situations.
			// Usually, the stack function simply adds a new context (`self`/`this`) to a context stack. 
			// However, custom helpers will occasionally pass override contexts that need their own context stack.
			// ##### Sections
			// Each section, `{{#section}} content {{/section}}`, within a Mustache template generates a section 
			// context in the resulting render code. The template itself is treated like a root section, with the 
			// same execution logic as any others. Each section can have `0..n` nested sections within it.
			// Here's an example of a template without any descendent sections.  
			// Given the template: `"{{a.b.c.d.e.name}}" == "Phil"`  
			// Would output the following render code:
			//		___v1ew.push("\"");
			//		___v1ew.push(can.view.txt(1, '', 0, this, function() {
			// 			return can.Mustache.txt(___st4ck(___c0nt3xt, this), null, 
			//				can.Mustache.get("a.b.c.d.e.name", 
			//					___st4ck(___c0nt3xt, this))
			//			);
			//		}));
			//		___v1ew.push("\" == \"Phil\"");
			// The simple strings will get appended to the view. Any interpolated references (like `{{a.b.c.d.e.name}}`) 
			// will be pushed onto the view via `can.view.txt` in order to support live binding.
			// The function passed to `can.view.txt` will call `can.Mustache.txt`, which serializes the object data by doing 
			// a context lookup with `can.Mustache.get`.
			// `can.Mustache.txt`'s first argument is a copy of the context stack with the local context `this` added to it.
			// This stack will grow larger as sections nest.
			// The second argument is for the section type. This will be `"#"` for truthy sections, `"^"` for falsey, 
			// or `null` if it is an interpolation instead of a section.
			// The third argument is the interpolated value retrieved with `can.Mustache.get`, which will perform the 
			// context lookup and return the approriate string or object.
			// Any additional arguments, if they exist, are used for passing arguments to custom helpers.
			// For nested sections, the last argument is an `options` object that contains the nested section's logic.
			// Here's an example of a template with a single nested section.  
			// Given the template: `"{{#a}}{{b.c.d.e.name}}{{/a}}" == "Phil"`  
			// Would output the following render code:
			//		___v1ew.push("\"");
			// 		___v1ew.push(can.view.txt(0, '', 0, this, function() {
			// 			return can.Mustache.txt(___st4ck(___c0nt3xt, this), "#", 
			//				can.Mustache.get("a", ___st4ck(___c0nt3xt, this)), 
			//					[{
			// 					_: function() {
			// 						return ___v1ew.join("");
			// 					}
			// 				}, {
			// 					fn: function(___c0nt3xt) {
			// 						var ___v1ew = [];
			// 						___v1ew.push(can.view.txt(1, '', 0, this, 
			//								function() {
			//  								return can.Mustache.txt(
			// 									___st4ck(___c0nt3xt, this), 
			// 									null, 
			// 									can.Mustache.get("b.c.d.e.name", 
			// 										___st4ck(___c0nt3xt, this))
			// 								);
			// 							}
			// 						));
			// 						return ___v1ew.join("");
			// 					}
			// 				}]
			//			)
			// 		}));
			//		___v1ew.push("\" == \"Phil\"");
			// This is specified as a truthy section via the `"#"` argument. The last argument includes an array of helper methods used with `options`.
			// These act similarly to custom helpers: `options.fn` will be called for truthy sections, `options.inverse` will be called for falsey sections.
			// The `options._` function only exists as a dummy function to make generating the section nesting easier (a section may have a `fn`, `inverse`,
			// or both, but there isn't any way to determine that at compilation time).
			// Within the `fn` function is the section's render context, which in this case will render anything between the `{{#a}}` and `{{/a}}` tokens.
			// This function has `___c0nt3xt` as an argument because custom helpers can pass their own override contexts. For any case where custom helpers
			// aren't used, `___c0nt3xt` will be equivalent to the `___st4ck(___c0nt3xt, this)` stack created by its parent section. The `inverse` function
			// works similarly, except that it is added when `{{^a}}` and `{{else}}` are used. `var ___v1ew = []` is specified in `fn` and `inverse` to 
			// ensure that live binding in nested sections works properly.
			// All of these nested sections will combine to return a compiled string that functions similar to EJS in its uses of `can.view.txt`.
			// #### Implementation
			{
				name: /^.*$/,
				fn: function (content, cmd) {
					var mode = false,
						result = [];

					// Trim the content so we don't have any trailing whitespace.
					content = can.trim(content);

					// Determine what the active mode is.
					// * `#` - Truthy section
					// * `^` - Falsey section
					// * `/` - Close the prior section
					// * `else` - Inverted section (only exists within a truthy/falsey section)
					if (content.length && (mode = content.match(/^([#^/]|else$)/))) {
						mode = mode[0];
						switch (mode) {
							// Open a new section.
						case '#':
						case '^':
							result.push(cmd.insert + 'can.view.txt(0,\'' + cmd.tagName + '\',' + cmd.status + ',this,function(){ return ');
							break;
							// Close the prior section.
						case '/':
							return {
								raw: 'return ___v1ew.join("");}}])}));'
							};
							break;
						}

						// Trim the mode off of the content.
						content = content.substring(1);
					}

					// `else` helpers are special and should be skipped since they don't 
					// have any logic aside from kicking off an `inverse` function.
					if (mode != 'else') {
						var args = [],
							i = 0,
							hashing = false,
							arg, split, m;

						// Parse the helper arguments.
						// This needs uses this method instead of a split(/\s/) so that 
						// strings with spaces can be correctly parsed.
						(can.trim(content) + ' ').replace(/((([^\s]+?=)?('.*?'|".*?"))|.*?)\s/g, function (whole, part) {
							args.push(part);
						});

						// Start the content render block.
						result.push('can.Mustache.txt(' + CONTEXT_STACK + ',' + (mode ? '"' + mode + '"' : 'null') + ',');

						// Iterate through the helper arguments, if there are any.
						for (; arg = args[i]; i++) {
							i && result.push(',');

							// Check for special helper arguments (string/number/boolean/hashes).
							if (i && (m = arg.match(/^(('.*?'|".*?"|[0-9.]+|true|false)|((.+?)=(('.*?'|".*?"|[0-9.]+|true|false)|(.+))))$/))) {
								// Found a native type like string/number/boolean.
								if (m[2]) {
									result.push(m[0]);
								}
								// Found a hash object.
								else {
									// Open the hash object.
									if (!hashing) {
										hashing = true;
										result.push('{' + HASH + ':{');
									}

									// Add the key/value.
									result.push(m[4], ':', m[6] ? m[6] : 'can.Mustache.get("' + m[5].replace(/"/g, '\\"') + '",' + CONTEXT_STACK + ')');

									// Close the hash if this was the last argument.
									if (i == args.length - 1) {
										result.push('}}');
									}
								}
							}
							// Otherwise output a normal interpolation reference.
							else {
								result.push('can.Mustache.get("' +
								// Include the reference name.
								arg.replace(/"/g, '\\"') + '",' +
								// Then the stack of context.
								CONTEXT_STACK +
								// Flag as a helper method to aid performance, 
								// if it is a known helper (anything with > 0 arguments).
								(i == 0 && args.length > 1 ? ',true' : ',false') + (i > 0 ? ',true' : ',false') + ')');
							}
						}
					}

					// Create an option object for sections of code.
					mode && mode != 'else' && result.push(',[{_:function(){');
					switch (mode) {
						// Truthy section
					case '#':
						result.push('return ___v1ew.join("");}},{fn:function(' + CONTEXT + '){var ___v1ew = [];');
						break;
						// If/else section
						// Falsey section
					case 'else':
					case '^':
						result.push('return ___v1ew.join("");}},{inverse:function(' + CONTEXT + '){var ___v1ew = [];');
						break;
						// Not a section
					default:
						result.push(');');
						break;
					}

					// Return a raw result if there was a section, otherwise return the default string.
					result = result.join('');
					return mode ? {
						raw: result
					} : result;
				}
			}]
		})
	});

	// Add in default scanner helpers first.
	// We could probably do this differently if we didn't 'break' on every match.
	var helpers = can.view.Scanner.prototype.helpers;
	for (var i = 0; i < helpers.length; i++) {
		Mustache.prototype.scanner.helpers.unshift(helpers[i]);
	};


	Mustache.txt = function (context, mode, name) {
		// Grab the extra arguments to pass to helpers.
		var args = Array.prototype.slice.call(arguments, 3),
			// Create a default `options` object to pass to the helper.
			options = can.extend.apply(can, [{
				fn: function () {},
				inverse: function () {}
			}].concat(mode ? args.pop() : [])),
			// An array of arguments to check for truthyness when evaluating sections.
			validArgs = args.length ? args : [name],
			// Whether the arguments meet the condition of the section.
			valid = true,
			result = [],
			i, helper;

		// Validate the arguments based on the section mode.
		if (mode) {
			for (i = 0; i < validArgs.length; i++) {
				// Array-like objects are falsey if their length = 0.
				if (isArrayLike(validArgs[i])) {
					valid = mode == '#' ? valid && !! validArgs[i].length : mode == '^' ? valid && !validArgs[i].length : valid;
				}
				// Otherwise just check if it is truthy or not.
				else {
					valid = mode == '#' ? valid && !! validArgs[i] : mode == '^' ? valid && !validArgs[i] : valid;
				}
			}
		}

		// Check for a registered helper or a helper-like function.
		if (helper = (Mustache.getHelper(name) || (can.isFunction(name) && {
			fn: name
		}))) {
			// Use the most recent context as `this` for the helper.
			var context = (context[STACK] && context[context.length - 1]) || context,
				// Update the options with a function/inverse (the inner templates of a section).
				opts = {
					fn: can.proxy(options.fn, context),
					inverse: can.proxy(options.inverse, context)
				},
				lastArg = args[args.length - 1];

			// Add the hash to `options` if one exists
			if (lastArg && lastArg[HASH]) {
				opts.hash = args.pop()[HASH];
			}
			args.push(opts);

			// Call the helper.
			return helper.fn.apply(context, args) || '';
		}

		// Otherwise interpolate like normal.
		if (valid) {
			switch (mode) {
				// Truthy section.
			case '#':
				// Iterate over arrays
				if (isArrayLike(name)) {
					for (i = 0; i < name.length; i++) {
						result.push(options.fn.call(name[i] || {}, context) || '');
					}
					return result.join('');
				}
				// Normal case.
				else {
					return options.fn.call(name || {}, context) || '';
				}
				break;
				// Falsey section.
			case '^':
				return options.inverse.call(name || {}, context) || '';
				break;
			default:
				// Add + '' to convert things like numbers to strings.
				// This can cause issues if you are trying to
				// eval on the length but this is the more
				// common case.
				return '' + (name !== undefined ? name : '');
				break;
			}
		}

		return '';
	};


	Mustache.get = function (ref, contexts, isHelper, isArgument) {
		// Split the reference (like `a.b.c`) into an array of key names.
		var names = ref.split('.'),
			namesLength = names.length,
			// Assume the local object is the last context in the stack.
			obj = contexts[contexts.length - 1],
			// Assume the parent context is the second to last context in the stack.
			context = contexts[contexts.length - 2],
			lastValue, value, name, i, j,
			// if we walk up and don't find a property, we default
			// to listening on an undefined property of the first
			// context that is an observe
			defaultObserve, defaultObserveName;

		// Handle `this` references for list iteration: {{.}} or {{this}}
		if (/^\.|this$/.test(ref)) {
			// If context isn't an object, then it was a value passed by a helper so use it as an override.
			if (!/^object|undefined$/.test(typeof context)) {
				return context || '';
			}
			// Otherwise just return the closest object.
			else {
				while (value = contexts.pop()) {
					if (typeof value !== 'undefined') {
						return value;
					}
				}
				return '';
			}
		}
		// Handle object resolution (like `a.b.c`).
		else if (!isHelper) {
			// Reverse iterate through the contexts (last in, first out).
			for (i = contexts.length - 1; i >= 0; i--) {
				// Check the context for the reference
				value = contexts[i];

				// Make sure the context isn't a failed object before diving into it.
				if (value !== undefined) {
					for (j = 0; j < namesLength; j++) {
						// Keep running up the tree while there are matches.
						if (typeof value[names[j]] != 'undefined') {
							lastValue = value;
							value = value[name = names[j]];
						}
						// If it's undefined, still match if the parent is an Observe.
						else if (isObserve(value)) {
							defaultObserve = value;
							defaultObserveName = names[j];
							lastValue = value = undefined;
							break;
						}
						else {
							lastValue = value = undefined;
							break;
						}
					}
				}

				// Found a matched reference.
				if (value !== undefined) {
					if (can.isFunction(lastValue[name]) && isArgument && (!lastValue[name].isComputed)) {
						// Don't execute functions if they are parameters for a helper and are not a can.compute
						return lastValue[name];
					} else if (can.isFunction(lastValue[name])) {
						// Support functions stored in objects.
						return lastValue[name]();
					}
					// Add support for observes
					else if (isObserve(lastValue)) {
						return lastValue.attr(name);
					}
					else {
						// Invoke the length to ensure that Observe.List events fire.
						isObserve(value) && isArrayLike(value) && value.attr('length');
						return value;
					}
				}
			}
		}
		if (defaultObserve) {
			return defaultObserve.attr(defaultObserveName);
		}
		// Support helper-like functions as anonymous helpers
		if (obj !== undefined && can.isFunction(obj[ref])) {
			return obj[ref];
		}
		// Support helpers without arguments, but only if there wasn't a matching data reference.
		else if (value = Mustache.getHelper(ref)) {
			return ref;
		}

		return '';
	};


	// ## Helpers
	// Helpers are functions that can be called from within a template.
	// These helpers differ from the scanner helpers in that they execute
	// at runtime instead of during compilation.
	// Custom helpers can be added via `can.Mustache.registerHelper`,
	// but there are also some built-in helpers included by default.
	// Most of the built-in helpers are little more than aliases to actions 
	// that the base version of Mustache simply implies based on the 
	// passed in object.
	// Built-in helpers:
	// * `data` - `data` is a special helper that is implemented via scanning helpers. 
	//		It hooks up the active element to the active data object: `<div {{data "key"}} />`
	// * `if` - Renders a truthy section: `{{#if var}} render {{/if}}`
	// * `unless` - Renders a falsey section: `{{#unless var}} render {{/unless}}`
	// * `each` - Renders an array: `{{#each array}} render {{this}} {{/each}}`
	// * `with` - Opens a context section: `{{#with var}} render {{/with}}`
	Mustache._helpers = {};

	Mustache.registerHelper = function (name, fn) {
		this._helpers[name] = {
			name: name,
			fn: fn
		};
	};


	Mustache.getHelper = function (name) {
		return this._helpers[name]
		for (var i = 0, helper; helper = [i]; i++) {
			// Find the correct helper
			if (helper.name == name) {
				return helper;
			}
		}
		return null;
	};


	Mustache.render = function (partial, context) {
		// Make sure the partial being passed in
		// isn't a variable like { partial: "foo.mustache" }
		if (!can.view.cached[partial] && context[partial]) {
			partial = context[partial];
		}

		// Call into `can.view.render` passing the
		// partial and context.
		return can.view.render(partial, context);
	};

	// The built-in Mustache helpers.
	can.each({
		// Implements the `if` built-in helper.
		'if': function (expr, options) {
			if ( !! expr) {
				return options.fn(this);
			}
			else {
				return options.inverse(this);
			}
		},
		// Implements the `unless` built-in helper.
		'unless': function (expr, options) {
			if (!expr) {
				return options.fn(this);
			}
		},

		// Implements the `each` built-in helper.
		'each': function (expr, options) {
			if ( !! expr && expr.length) {
				var result = [];
				for (var i = 0; i < expr.length; i++) {
					result.push(options.fn(expr[i]));
				}
				return result.join('');
			}
		},
		// Implements the `with` built-in helper.
		'with': function (expr, options) {
			if ( !! expr) {
				return options.fn(expr);
			}
		}

	}, function (fn, name) {
		Mustache.registerHelper(name, fn);
	});

	// ## Registration
	// Registers Mustache with can.view.
	can.view.register({
		suffix: "mustache",

		contentType: "x-mustache-template",

		// Returns a `function` that renders the view.
		script: function (id, src) {
			return "can.Mustache(function(_CONTEXT,_VIEW) { " + new Mustache({
				text: src,
				name: id
			}).template.out + " })";
		},

		renderer: function (id, text) {
			return Mustache({
				text: text,
				name: id
			});
		}
	});


})(can, this);
// jquery.tweet.js - See http://tweet.seaofclouds.com/ or https://github.com/seaofclouds/tweet for more info
// Copyright (c) 2008-2012 Todd Matthews & Steve Purcell
(function (factory) {
  if (typeof define === 'function' && define.amd)
    define(['jquery'], factory); // AMD support for RequireJS etc.
  else
    factory(jQuery);
}(function ($) {
  $.fn.tweet = function(o){
    var s = $.extend({
      username: null,                           // [string or array] required unless using the 'query' option; one or more twitter screen names (use 'list' option for multiple names, where possible)
      list: null,                               // [string]   optional name of list belonging to username
      favorites: false,                         // [boolean]  display the user's favorites instead of his tweets
      query: null,                              // [string]   optional search query (see also: http://search.twitter.com/operators)
      avatar_size: null,                        // [integer]  height and width of avatar if displayed (48px max)
      count: 3,                                 // [integer]  how many tweets to display?
      fetch: null,                              // [integer]  how many tweets to fetch via the API (set this higher than 'count' if using the 'filter' option)
      page: 1,                                  // [integer]  which page of results to fetch (if count != fetch, you'll get unexpected results)
      retweets: true,                           // [boolean]  whether to fetch (official) retweets (not supported in all display modes)
      intro_text: null,                         // [string]   do you want text BEFORE your your tweets?
      outro_text: null,                         // [string]   do you want text AFTER your tweets?
      join_text:  null,                         // [string]   optional text in between date and tweet, try setting to "auto"
      auto_join_text_default: " I said, ",      // [string]   auto text for non verb: "I said" bullocks
      auto_join_text_ed: " I ",                 // [string]   auto text for past tense: "I" surfed
      auto_join_text_ing: " I am ",             // [string]   auto tense for present tense: "I was" surfing
      auto_join_text_reply: " I replied to ",   // [string]   auto tense for replies: "I replied to" @someone "with"
      auto_join_text_url: " I was looking at ", // [string]   auto tense for urls: "I was looking at" http:...
      loading_text: null,                       // [string]   optional loading text, displayed while tweets load
      refresh_interval: null,                   // [integer]  optional number of seconds after which to reload tweets
      twitter_url: "twitter.com",               // [string]   custom twitter url, if any (apigee, etc.)
      twitter_api_url: "api.twitter.com",       // [string]   custom twitter api url, if any (apigee, etc.)
      twitter_search_url: "search.twitter.com", // [string]   custom twitter search url, if any (apigee, etc.)
      template: "{avatar}{time}{join} {text}",  // [string or function] template used to construct each tweet <li> - see code for available vars
      comparator: function(tweet1, tweet2) {    // [function] comparator used to sort tweets (see Array.sort)
        return tweet2.tweet_time - tweet1.tweet_time;
      },
      filter: function(tweet) {                 // [function] whether or not to include a particular tweet (be sure to also set 'fetch')
        return true;
      }
      // You can attach callbacks to the following events using jQuery's standard .bind() mechanism:
      //   "loaded" -- triggered when tweets have been fetched and rendered
    }, o);

    // See http://daringfireball.net/2010/07/improved_regex_for_matching_urls
    var url_regexp = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;

    // Expand values inside simple string templates with {placeholders}
    function t(template, info) {
      if (typeof template === "string") {
        var result = template;
        for(var key in info) {
          var val = info[key];
          result = result.split('{'+key+'}').join(val === null ? '' : val);
        }
        return result;
      } else return template(info);
    }
    // Export the t function for use when passing a function as the 'template' option
    $.extend({tweet: {t: t}});

    function replacer (regex, replacement) {
      return function() {
        var returning = [];
        this.each(function() {
          returning.push(this.replace(regex, replacement));
        });
        return $(returning);
      };
    }

    function escapeHTML(s) {
      return s.replace(/</g,"&lt;").replace(/>/g,"^&gt;");
    }

    $.fn.extend({
      linkUser: replacer(/(^|[\W])@(\w+)/gi, "$1<span class=\"at\">@</span><a href=\"http://"+s.twitter_url+"/$2\">$2</a>"),
      // Support various latin1 (\u00**) and arabic (\u06**) alphanumeric chars
      linkHash: replacer(/(?:^| )[\#]+([\w\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0600-\u06ff]+)/gi,
                         ' <a href="http://'+s.twitter_search_url+'/search?q=&tag=$1&lang=all'+
                         ((s.username && s.username.length === 1 && !s.list) ? '&from='+s.username.join("%2BOR%2B") : '')+
                         '" class="tweet_hashtag">#$1</a>'),
      makeHeart: replacer(/(&lt;)+[3]/gi, "<tt class='heart'>&#x2665;</tt>")
    });

    function linkURLs(text, entities) {
      return text.replace(url_regexp, function(match) {
        var url = (/^[a-z]+:/i).test(match) ? match : "http://"+match;
        var text = match;
        for(var i = 0; i < entities.length; ++i) {
          var entity = entities[i];
          if (entity.url === url && entity.expanded_url) {
            url = entity.expanded_url;
            text = entity.display_url;
            break;
          }
        }
        return "<a href=\""+escapeHTML(url)+"\">"+escapeHTML(text)+"</a>";
      });
    }

    function parse_date(date_str) {
      // The non-search twitter APIs return inconsistently-formatted dates, which Date.parse
      // cannot handle in IE. We therefore perform the following transformation:
      // "Wed Apr 29 08:53:31 +0000 2009" => "Wed, Apr 29 2009 08:53:31 +0000"
      return Date.parse(date_str.replace(/^([a-z]{3})( [a-z]{3} \d\d?)(.*)( \d{4})$/i, '$1,$2$4$3'));
    }

    function extract_relative_time(date) {
      var toInt = function(val) { return parseInt(val, 10); };
      var relative_to = new Date();
      var delta = toInt((relative_to.getTime() - date) / 1000);
      if (delta < 1) delta = 0;
      return {
        days:    toInt(delta / 86400),
        hours:   toInt(delta / 3600),
        minutes: toInt(delta / 60),
        seconds: toInt(delta)
      };
    }

    function format_relative_time(time_ago) {
      if ( time_ago.days > 2 )     return 'about ' + time_ago.days + ' days ago';
      if ( time_ago.hours > 24 )   return 'about a day ago';
      if ( time_ago.hours > 2 )    return 'about ' + time_ago.hours + ' hours ago';
      if ( time_ago.minutes > 45 ) return 'about an hour ago';
      if ( time_ago.minutes > 2 )  return 'about ' + time_ago.minutes + ' minutes ago';
      if ( time_ago.seconds > 1 )  return 'about ' + time_ago.seconds + ' seconds ago';
      return 'just now';
    }

    function build_auto_join_text(text) {
      if (text.match(/^(@([A-Za-z0-9-_]+)) .*/i)) {
        return s.auto_join_text_reply;
      } else if (text.match(url_regexp)) {
        return s.auto_join_text_url;
      } else if (text.match(/^((\w+ed)|just) .*/im)) {
        return s.auto_join_text_ed;
      } else if (text.match(/^(\w*ing) .*/i)) {
        return s.auto_join_text_ing;
      } else {
        return s.auto_join_text_default;
      }
    }

    function build_api_url() {
      var proto = ('https:' === document.location.protocol ? 'https:' : 'http:');
      var count = (s.fetch === null) ? s.count : s.fetch;
      var common_params = '&include_entities=1&callback=?';
      if (s.list) {
        return proto+"//"+s.twitter_api_url+"/1/"+s.username[0]+"/lists/"+s.list+"/statuses.json?page="+s.page+"&per_page="+count+common_params;
      } else if (s.favorites) {
        return proto+"//"+s.twitter_api_url+"/1/favorites.json?screen_name="+s.username[0]+"&page="+s.page+"&count="+count+common_params;
      } else if (s.query === null && s.username.length === 1) {
        return proto+'//'+s.twitter_api_url+'/1/statuses/user_timeline.json?screen_name='+s.username[0]+'&count='+count+(s.retweets ? '&include_rts=1' : '')+'&page='+s.page+common_params;
      } else {
        var query = (s.query || 'from:'+s.username.join(' OR from:'));
        return proto+'//'+s.twitter_search_url+'/search.json?&q='+encodeURIComponent(query)+'&rpp='+count+'&page='+s.page+common_params;
      }
    }

    function extract_avatar_url(item, secure) {
      if (secure) {
        return ('user' in item) ?
          item.user.profile_image_url_https :
          extract_avatar_url(item, false).
            replace(/^http:\/\/[a-z0-9]{1,3}\.twimg\.com\//, "https://s3.amazonaws.com/twitter_production/");
      } else {
        return item.profile_image_url || item.user.profile_image_url;
      }
    }

    // Convert twitter API objects into data available for
    // constructing each tweet <li> using a template
    function extract_template_data(item){
      var o = {};
      o.item = item;
      o.source = item.source;
      o.screen_name = item.from_user || item.user.screen_name;
      // The actual user name is not returned by all Twitter APIs, so please do not
      // file an issue if it is empty:
      o.name = item.from_user_name || item.user.name;
      o.retweet = typeof(item.retweeted_status) != 'undefined';

      o.tweet_time = parse_date(item.created_at);
      o.join_text = s.join_text === "auto" ? build_auto_join_text(item.text) : s.join_text;
      o.tweet_id = item.id_str;
      o.twitter_base = "http://"+s.twitter_url+"/";
      o.user_url = o.twitter_base+o.screen_name;
      o.tweet_url = o.user_url+"/status/"+o.tweet_id;
      o.reply_url = o.twitter_base+"intent/tweet?in_reply_to="+o.tweet_id;
      o.retweet_url = o.twitter_base+"intent/retweet?tweet_id="+o.tweet_id;
      o.favorite_url = o.twitter_base+"intent/favorite?tweet_id="+o.tweet_id;
      o.retweeted_screen_name = o.retweet && item.retweeted_status.user.screen_name;
      o.tweet_relative_time = format_relative_time(extract_relative_time(o.tweet_time));
      o.entities = item.entities ? (item.entities.urls || []).concat(item.entities.media || []) : [];
      o.tweet_raw_text = o.retweet ? ('RT @'+o.retweeted_screen_name+' '+item.retweeted_status.text) : item.text; // avoid '...' in long retweets
      o.tweet_text = $([linkURLs(o.tweet_raw_text, o.entities)]).linkUser().linkHash()[0];
      o.retweeted_tweet_text = $([linkURLs(item.text, o.entities)]).linkUser().linkHash()[0];
      o.tweet_text_fancy = $([o.tweet_text]).makeHeart()[0];

      o.avatar_size = s.avatar_size;
      o.avatar_url = extract_avatar_url(o.retweet ? item.retweeted_status : item, (document.location.protocol === 'https:'));
      o.avatar_screen_name = o.retweet ? o.retweeted_screen_name : o.screen_name;
      o.avatar_profile_url = o.twitter_base+o.avatar_screen_name;

      // Default spans, and pre-formatted blocks for common layouts
      o.user = t('<a class="tweet_user" href="{user_url}">{screen_name}</a>', o);
      o.join = s.join_text ? t('<span class="tweet_join">{join_text}</span>', o) : '';
      o.avatar = o.avatar_size ?
        t('<a class="tweet_avatar" href="{avatar_profile_url}"><img src="{avatar_url}" height="{avatar_size}" width="{avatar_size}" alt="{avatar_screen_name}\'s avatar" title="{avatar_screen_name}\'s avatar" border="0"/></a>', o) : '';
      o.time = t('<span class="tweet_time"><a href="{tweet_url}" title="view tweet on twitter">{tweet_relative_time}</a></span>', o);
      o.text = t('<span class="tweet_text">{tweet_text_fancy}</span>', o);
      o.retweeted_text = t('<span class="tweet_text">{retweeted_tweet_text}</span>', o);
      o.reply_action = t('<a class="tweet_action tweet_reply" href="{reply_url}">reply</a>', o);
      o.retweet_action = t('<a class="tweet_action tweet_retweet" href="{retweet_url}">retweet</a>', o);
      o.favorite_action = t('<a class="tweet_action tweet_favorite" href="{favorite_url}">favorite</a>', o);
      return o;
    }

    function render_tweets(widget, tweets) {
      var list = $('<ul class="tweet_list">');
      list.append($.map(tweets, function(o) { return "<li>" + t(s.template, o) + "</li>"; }).join('')).
        children('li:first').addClass('tweet_first').end().
        children('li:odd').addClass('tweet_even').end().
        children('li:even').addClass('tweet_odd');

      $(widget).empty().append(list);
      if (s.intro_text) list.before('<p class="tweet_intro">'+s.intro_text+'</p>');
      if (s.outro_text) list.after('<p class="tweet_outro">'+s.outro_text+'</p>');

      $(widget).trigger("loaded").trigger((tweets.length === 0 ? "empty" : "full"));
      if (s.refresh_interval) {
        window.setTimeout(function() { $(widget).trigger("tweet:load"); }, 1000 * s.refresh_interval);
      }
    }

    function load(widget) {
      var loading = $('<p class="loading">'+s.loading_text+'</p>');
      if (s.loading_text) $(widget).not(":has(.tweet_list)").empty().append(loading);
      $.getJSON(build_api_url(), function(data){
        var tweets = $.map(data.results || data, extract_template_data);
        tweets = $.grep(tweets, s.filter).sort(s.comparator).slice(0, s.count);
        $(widget).trigger("tweet:retrieved", [tweets]);
      });
    }

    return this.each(function(i, widget){
      if(s.username && typeof(s.username) === "string"){
        s.username = [s.username];
      }

      $(widget).unbind("tweet:render").unbind("tweet:retrieved").unbind("tweet:load").
        bind({
          "tweet:load": function() { load(widget); },
          "tweet:retrieved": function(ev, tweets) {
            $(widget).trigger("tweet:render", [tweets]);
          },
          "tweet:render": function(ev, tweets) {
            render_tweets($(widget), tweets);
          }
        }).trigger("tweet:load");
    });
  };
}));

/* ===================================================
 * bootstrap-transition.js v2.3.0
 * http://twitter.github.com/bootstrap/javascript.html#transitions
 * ===================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

	"use strict"; // jshint ;_;


	/* CSS TRANSITION SUPPORT (http://www.modernizr.com/)
	 * ======================================================= */

	$(function () {

		$.support.transition = (function () {

			var transitionEnd = (function () {

				var el = document.createElement('bootstrap')
					, transEndEventNames = {
						'WebkitTransition' : 'webkitTransitionEnd'
						,  'MozTransition'    : 'transitionend'
						,  'OTransition'      : 'oTransitionEnd otransitionend'
						,  'transition'       : 'transitionend'
					}
					, name

				for (name in transEndEventNames){
					if (el.style[name] !== undefined) {
						return transEndEventNames[name]
					}
				}

			}())

			return transitionEnd && {
				end: transitionEnd
			}

		})()

	})

}(window.jQuery);
/* =============================================================
 * bootstrap-collapse.js v2.3.0
 * http://twitter.github.com/bootstrap/javascript.html#collapse
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function ($) {

	"use strict"; // jshint ;_;


	/* COLLAPSE PUBLIC CLASS DEFINITION
	 * ================================ */

	var Collapse = function (element, options) {
		this.$element = $(element)
		this.options = $.extend({}, $.fn.collapse.defaults, options)

		if (this.options.parent) {
			this.$parent = $(this.options.parent)
		}

		this.options.toggle && this.toggle()
	}

	Collapse.prototype = {

		constructor: Collapse

		, dimension: function () {
			var hasWidth = this.$element.hasClass('width')
			return hasWidth ? 'width' : 'height'
		}

		, show: function () {
			var dimension
				, scroll
				, actives
				, hasData

			if (this.transitioning || this.$element.hasClass('in')) return

			dimension = this.dimension()
			scroll = $.camelCase(['scroll', dimension].join('-'))
			actives = this.$parent && this.$parent.find('> .accordion-group > .in')

			if (actives && actives.length) {
				hasData = actives.data('collapse')
				if (hasData && hasData.transitioning) return
				actives.collapse('hide')
				hasData || actives.data('collapse', null)
			}

			this.$element[dimension](0)
			this.transition('addClass', $.Event('show'), 'shown')
			$.support.transition && this.$element[dimension](this.$element[0][scroll])
		}

		, hide: function () {
			var dimension
			if (this.transitioning || !this.$element.hasClass('in')) return
			dimension = this.dimension()
			this.reset(this.$element[dimension]())
			this.transition('removeClass', $.Event('hide'), 'hidden')
			this.$element[dimension](0)
		}

		, reset: function (size) {
			var dimension = this.dimension()

			this.$element
				.removeClass('collapse')
				[dimension](size || 'auto')
				[0].offsetWidth

			this.$element[size !== null ? 'addClass' : 'removeClass']('collapse')

			return this
		}

		, transition: function (method, startEvent, completeEvent) {
			var that = this
				, complete = function () {
					if (startEvent.type == 'show') that.reset()
					that.transitioning = 0
					that.$element.trigger(completeEvent)
				}

			this.$element.trigger(startEvent)

			if (startEvent.isDefaultPrevented()) return

			this.transitioning = 1

			this.$element[method]('in')

			$.support.transition && this.$element.hasClass('collapse') ?
				this.$element.one($.support.transition.end, complete) :
				complete()
		}

		, toggle: function () {
			this[this.$element.hasClass('in') ? 'hide' : 'show']()
		}

	}


	/* COLLAPSE PLUGIN DEFINITION
	 * ========================== */

	var old = $.fn.collapse

	$.fn.collapse = function (option) {
		return this.each(function () {
			var $this = $(this)
				, data = $this.data('collapse')
				, options = $.extend({}, $.fn.collapse.defaults, $this.data(), typeof option == 'object' && option)
			if (!data) $this.data('collapse', (data = new Collapse(this, options)))
			if (typeof option == 'string') data[option]()
		})
	}

	$.fn.collapse.defaults = {
		toggle: true
	}

	$.fn.collapse.Constructor = Collapse


	/* COLLAPSE NO CONFLICT
	 * ==================== */

	$.fn.collapse.noConflict = function () {
		$.fn.collapse = old
		return this
	}


	/* COLLAPSE DATA-API
	 * ================= */

	$(document).on('click.collapse.data-api', '[data-toggle=collapse]', function (e) {
		var $this = $(this), href
			, target = $this.attr('data-target')
				|| e.preventDefault()
				|| (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
			, option = $(target).data('collapse') ? 'toggle' : $this.data()
		$this[$(target).hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
		$(target).collapse(option)
	})

}(window.jQuery);
(function (namespace) {
	var ApiModel = namespace.ApiModel = can.Model({
		cache: {},
		makeRequest: function () {
			var self = this;
			var url = [this.url].concat(can.makeArray(arguments)).join('/');
			var deferred = can.Deferred();
			var cache = this.cache;

			if (cache[url]) {
				deferred.resolve(cache[url]);
			} else {
				can.ajax({
					dataType: 'jsonp',
					url: url
				}).then(function (response) {
					var error = self.errorCheck && self.errorCheck(response);
					if(error) {
						deferred.reject(error);
					} else {
						cache[url] = response;
						deferred.resolve(response);
					}
				});
			}

			return deferred;
		},
		makeParameters: function (params) {
			return '?' + can.route.param(params);
		}
	}, {});

	var MeetupModel = namespace.MeetupModel = ApiModel({
		url: 'https://api.meetup.com',
		apiKey: 'e1d87f794c310476744591e2c216b',
		errorCheck: function(response) {
			if(response.code || response.status) {
				return {
					who: 'Meetup',
					message: response.problem + ': ' + response.details,
					fallback: 'http://www.meetup.com/YYC-js'
				};
			}
			return false;
		},
		findAll: function (options) {
			var key = this.apiKey,
				parameters = this.makeParameters(can.extend({
					key: key,
					sign: true
				}, options));
			return this.makeRequest('2', this.type, parameters).pipe(function (data) {
				return data.results;
			});
		},
		findOne: function (options) {
			return this.findAll(options).pipe(function (data) {
				return data[0];
			});
		}
	}, {});

	var GitHubModel = namespace.GitHubModel = ApiModel({
		id: 'url',
		url: 'https://api.github.com',
		errorCheck: function(response) {
			if(response.meta && response.meta.status !== 200) {
				return {
					who: 'GitHub',
					message: response.data.message,
					fallback: 'http://www.github.com/yycjs'
				};
			}
			return false;
		}
	}, {});

	namespace.GitHubContent = GitHubModel({
		findAll: function (options) {
			return this.makeRequest('repos', options.user, options.repository, 'contents', options.path)
				.pipe(function (result) {
					return result.data;
				});
		},
		findOne: function(options) {
			var args = ['repos', options.user, options.repository];
			if(!options.path || options.path === 'readme') {
				args.push('readme');
			} else {
				args = args.concat(['contents', options.path]);
			}
			return this.makeRequest.apply(this, args).pipe(function(response) {
				return response.data;
			});
		}
	}, {
		html: can.compute(function() {
			var markdown = this.attr('content');
			// console.log('htmlcontent', markdown, this);
			if(!markdown) {
				return '';
			}
			markdown = window.base64.decode(markdown);
			// console.log(markdown);
			return marked(markdown);
		})
	});

	namespace.GitHubProject = GitHubModel({
		findAll: function (options) {
			return this.makeRequest('users', options.user, 'repos' + this.makeParameters({
				sort: 'updated'
			}));
		},
		findAllWithReadme: function (options) {
			var deferred = this.findAll(options);
			deferred.then(function (models) {
				models.each(function (project) {
					GitHubContent.findOne({
						user: options.user,
						repository: project.name
					}).then(function (readme) {
						project.attr('readme', readme);
					});
				});
			});
			return deferred;
		},
		findOne: function (options) {
			return this.makeRequest(['repos', options.user, options.name]).pipe(function (response) {
				return response.data;
			});
		}
	}, {});

	var MeetupGroup = namespace.MeetupGroup = MeetupModel({
		type: 'groups'
	}, {});

	var MeetupMeetups = namespace.MeetupMeetups = MeetupModel({
		type: 'events',
		findAllWithHosts: function (options) {
			var deferred = can.Deferred();
			this.findAll(can.extend({ fields: 'event_hosts' }, options)).then(function (meetups) {
				meetups.each(function (meetup) {
					var memberIds = $.map(meetup.attr('event_hosts'),function (data) {
						return data.member_id;
					}).join(',');

					MeetupMembers.findAll({
						member_id: memberIds
					}).done(function (members) {
						meetup.attr('hosts', members);
						deferred.resolve(meetups);
					});
				});
			});

			return deferred;
		}
	}, {});

	var MeetupMembers = namespace.MeetupMembers = MeetupModel({
		type: 'members'
	}, {});
})(window);
$(function () {
  /*Mustache Helpers*/
  can.Mustache.registerHelper('prettyDate', function (timestamp) {
    var date = new Date(timestamp);

    return date.toLocaleDateString();
  });

  can.Mustache.registerHelper('prettyTime', function (timestamp, duration) {
    var date = isNaN(parseInt(duration, 10)) ? new Date(timestamp) : new Date(timestamp + duration);

    return date.getHours() + ':' + date.getMinutes();
  });

  var footer = $('footer');
  var loading = function (el) {
    footer.hide();
    return el.html(can.view('views/loading.mustache', {}));
  };
  var loaded = function (frag) {
    footer.show();
    return this.html(frag).hide().fadeIn();
  };

  var errorHandler = function(error) {
    this.html(can.view('views/error.mustache', error));
    footer.show();
  };

  var Index = can.Control({
    init: function () {
      var el = loading(this.element);
      can.view('views/index.mustache', {
        upcoming: MeetupMeetups.findAllWithHosts({
          group_urlname: 'yyc-js',
          status: 'upcoming',
          page: 1
        })
      }).done(function(frag){
        footer.show();
        el.html(frag).hide().fadeIn();
        $(".tweets").tweet({
          username: "yycjs",
          join_text: "auto",
          avatar_size: 36,
          count: 10,
          auto_join_text_default: " - ",
          auto_join_text_ed: " - ",
          auto_join_text_ing: " - ",
          auto_join_text_reply: " - ",
          auto_join_text_url: " - ",
          loading_text: ""
        });
      });
    }
  });

  var Blog = can.Control({
    init: function () {
      var el = loading(this.element);
      can.view('views/blog.mustache', {
        posts: GitHubContent.findAllWithContent({
          user: 'yycjs',
          repository: 'yycjs.github.com',
          path: 'blog'
        })
      }).done(function (frag) {
        el.html(frag);
      });
    }
  });

  var Meetups = can.Control({
    init: function () {
      var el = loading(this.element);
      can.view('views/meetups.mustache', {
        upcoming: MeetupMeetups.findAllWithHosts({
          group_urlname: 'yyc-js',
          status: 'upcoming',
          page: 2
        }),
        past: MeetupMeetups.findAll({
          group_urlname: 'yyc-js',
          status: 'past',
          fields: 'event_hosts',
          page: 10,
          desc: true
        })
      }).then(can.proxy(loaded, el), can.proxy(errorHandler, el));
    }
  });

  var Projects = can.Control({
    init: function () {
      var el = loading(this.element);

      can.view('views/projects.mustache', {
        projects: GitHubProject.findAllWithReadme({ user: 'yycjs' }).fail(can.proxy(errorHandler, el))
      }).then(can.proxy(loaded, el));
    }
  });

  var About = can.Control({
    init: function () {
      var el = loading(this.element);
      MeetupGroup.findOne({
        group_urlname: 'yyc-js'
      }).then(function(group) {
        MeetupMembers.findAll({
          group_urlname: 'yyc-js'
        }).then(function(members) {
          group.attr('memberList', members);
          loaded.call(el, can.view('views/about.mustache', {
            group: group
          }));
        }, can.proxy(errorHandler, el));
      }, can.proxy(errorHandler, el));
    }
  });

  var Router = can.Control({
    defaults: {
      mappings: {
        index: Index,
        blog: Blog,
        meetups: Meetups,
        projects: Projects,
        about: About
      },
      state: can.route
    }
  }, {
    init: function () {
      this.element.html(can.view('views/index.mustache', {}));
    },
    '{state} type': function (cls, ev, val) {
      if (this.current && this.current.element) {
        this.current.destroy();
      }
      if (this.options.mappings[val]) {
        this.current = new this.options.mappings[val](this.element);
      }
    }
  });

  can.route(':type', { type: 'index' });
  can.route.ready(false);
  new Router('#content');
  can.route.ready(true);
});