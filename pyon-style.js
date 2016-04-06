/**
 * Copyright 2016 Kevin Doughty. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
 // This is a derivative work of:
 // https://github.com/web-animations/web-animations-js-legacy
 // Code has been heavily modified.

 /**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
 "use strict";
(function() {

  var root = this;
  var previousPyon = root.PyonStyle;
  var hasRequire = (typeof require !== "undefined");
  
  var Pyon = root.Pyon || hasRequire && require("pyon");
  if (typeof Pyon === "undefined") throw new Error("Pyon Style requires regular Pyon. If you are using script tags Pyon must come first.");
  
  var PyonStyle = root.PyonStyle = {};




var ASSERT_ENABLED = false;
var SVG_NS = 'http://www.w3.org/2000/svg';

function assert(check, message) {
  console.assert(ASSERT_ENABLED, 'assert should not be called when ASSERT_ENABLED is false');
  console.assert(check, message);
  // Some implementations of console.assert don't actually throw
  if (!check) { throw message; }
}

function detectFeatures() {
  var el = createDummyElement();
  el.style.cssText = 'width: calc(0px);' + 'width: -webkit-calc(0px);';
  var calcFunction = el.style.width.split('(')[0];
  var transformCandidates = [
    'transform',
    'webkitTransform',
    'msTransform'
  ];
  var transformProperty = transformCandidates.filter(function(property) {
    return property in el.style;
  })[0];
  return {
    calcFunction: calcFunction,
    transformProperty: transformProperty
  };
}

function createDummyElement() {
  return document.documentElement.namespaceURI == SVG_NS ? document.createElementNS(SVG_NS, 'g') : document.createElement('div');
}

var features = detectFeatures();
var PRIVATE = {};

var createObject = function(proto, obj) {
  var newObject = Object.create(proto);
  Object.getOwnPropertyNames(obj).forEach(function(name) {
    Object.defineProperty( newObject, name, Object.getOwnPropertyDescriptor(obj, name));
  });
  return newObject;
};

var abstractMethod = function() {
  throw 'Abstract method not implemented.';
};

var cssStyleDeclarationAttribute = {
  cssText: true,
  length: true,
  parentRule: true,
  'var': true
};

var cssStyleDeclarationMethodModifiesStyle = {
  getPropertyValue: false,
  getPropertyCSSValue: false,
  removeProperty: true,
  getPropertyPriority: false,
  setProperty: true,
  item: false
};
  
var copyInlineStyle = function(sourceStyle, destinationStyle) {
  for (var i = 0; i < sourceStyle.length; i++) {
    var property = sourceStyle[i];
    destinationStyle[property] = sourceStyle[property];
  }
};

// Configures an accessor descriptor for use with Object.defineProperty() to
// allow the property to be changed and enumerated, to match __defineGetter__()
// and __defineSetter__().
var configureDescriptor = function(descriptor) {
  descriptor.configurable = true;
  descriptor.enumerable = true;
  return descriptor;
};


function isFunction(w) {
  return w && {}.toString.call(w) === "[object Function]";
}

function isNumber(w) {
  return !isNaN(parseFloat(w)) && isFinite(w); // I want infinity for repeat count. Probably not duration
}

/*
window.Element.prototype.setDefaultPyonAnimations = function(animations) {
  ensureTargetCSSInitialized(this);
  Object.keys(animations).forEach( function(item,index) {
    this.style._controller.registerAnimatableProperty(item, animations[item]);
  });
}
window.Element.prototype.addPyonAnimation = function(animation,named) {
  ensureTargetCSSInitialized(this);
  
  // want copy: 
  //animation = animationFromDescription(animation);
  var key = animation.property;
  var type = getType(key);
  if (isFunction(type)) type = new type();
  animation.type = type;
  
  this.style._controller.addAnimation(animation,named);
}
window.Element.prototype.pyonAnimationNamed = function(name) {
  ensureTargetCSSInitialized(this);
  return this.style._controller.animationNamed(name);
}
window.Element.prototype.removePyonAnimation = function(name) {
  ensureTargetCSSInitialized(this);
  this.style._controller.removeAnimation(name);
}
window.Element.prototype.removeAllPyonAnimations = function() {
  ensureTargetCSSInitialized(this);
  this.style._controller.removeAllAnimations();
}
window.Element.prototype.pyonAnimations = function() {
  ensureTargetCSSInitialized(this);
  return this.style._controller.animations;
}
window.Element.prototype.pyonAnimationNames = function() {
  ensureTargetCSSInitialized(this);
  return this.style._controller.animationNames;
}
window.Element.prototype.presentationPyon = function() {
  ensureTargetCSSInitialized(this);
  this.style._controller.presentationLayer;
}
window.Element.prototype.modelPyon = function() {
  ensureTargetCSSInitialized(this);
  this.style._controller.modelLayer;
}
window.Element.prototype.setPyonDelegate = function(delegate, oldStyle) {
  ensureTargetCSSInitialized(this, delegate, oldStyle);
  //this.style._pyonDelegate = delegate;
}
*/

PyonStyle.addAnimation = function(element, animation, named) { // TODO: needs delegate and ensureTargetCSSInitialized
  if (typeof element === "undefined" || element === null) return;
  ensureTargetCSSInitialized(element);
  
  animation = animationFromDescription(animation);
  if (animation) {
    var key = animation.property;
    if (key) {
      var type = getType(key);
      if (isFunction(type)) type = new type();
      animation.type = type;
      if (typeof animation.from === "undefined" || animation.from === null) animation.from = type.zero();
      else animation.from = type.fromCssValue(animation.from);
      if (typeof animation.to === "undefined" || animation.to === null) animation.to = type.zero();
      else animation.to = type.fromCssValue(animation.to);
      //element.style._controller.registerAnimatableProperty(key);
      element.style._controller.addAnimation(animation, named);
    }
  }
}

PyonStyle.setDelegate = function(element, delegate, oldStyle) {
  //ensureTargetCSSInitialized(element, delegate, oldStyle); // PyonReact
  var animatedStyle = ensureTargetCSSInitialized(element, delegate, oldStyle); // PyonReact
  if (!element) return animatedStyle // PyonReact
}

function ensureTargetCSSInitialized(target, delegate, oldStyle) {
    //if (target.style._pyonInitialized) return; // PyonReact
    if (target && target.style._pyonInitialized) return; // PyonReact

//     try {
      var animatedStyle = new PyonStyleDeclaration(target, delegate, oldStyle);
      if (!target) return animatedStyle;
      Object.defineProperty(target, 'style', configureDescriptor({
        get: function() { 
          return animatedStyle;
        }
      }));
//     } catch (error) {
//       patchInlineStyleForAnimation(target.style);
//       console.log("ensure error !!!!!");
//     }
    target.style._pyonInitialized = true; // PyonReact // formerly _webAnimationsStyleInitialized
  }


function animationFromDescription(description) { // duplicate, from pyon
  var animation;
  if (description && description instanceof Pyon.Animation) {
    animation = description.copy();
  } else if (description && typeof description === "object") {
    //if (description.from && description.to) 
    //else if (description.values)
    animation = new Pyon.Animation(description);
  } else if (isNumber(description)) animation = new Pyon.Animation({duration:description});
  return animation;
}

  var PyonStyleDeclaration = function(element, delegate, oldStyle) {
    if (element && element.style instanceof PyonStyleDeclaration) throw new Error('Element must not already have an animated style attached.'); // PyonReact

    // Stores the inline style of the element on its behalf while the
    // polyfill uses the element's inline style to simulate web animations.
    // This is needed to fake regular inline style CSSOM access on the element.
    this._surrogateElement = createDummyElement();
    this._style; // PyonReact
    if (element !== null) this._style = element.style; // PyonReact
    this._length = 0;
    this._isAnimatedProperty = {};
    this._element = element;
    // Populate the surrogate element's inline style.
    if (element !== null) copyInlineStyle(this._style, this._surrogateElement.style); // PyonReact
    this._updateIndices();
    var owner = this;
    
    this._pyonDelegate = delegate;
    
    this._controller = { }
    
    this._layer = { }
    
    this._previousPresentationLayer = { }; // To remove styles when animations are complete
    
    this._delegate = {
      animationForKey: function(key,value,target) {
        if (owner._pyonDelegate && isFunction(owner._pyonDelegate.animationForKey)) {
          var animationFunction = owner._pyonDelegate.animationForKey;
          var propertyType = getType(key);
          var deserializedValue = propertyType.toCssValue(value);
          var description = owner._pyonDelegate.animationForKey.call(owner._pyonDelegate,key,deserializedValue,this._element);
          var animation = animationFromDescription(description);
          if (animation) {
            if (typeof animation.property === "undefined") animation.property = key;
            var animationType = getType(animation.property);
            animation.type = animationType;
            
            var from = animation.from;
            var to = animation.to;
            
            if (typeof from === "undefined" || from === null) {
              from = owner._layer[key];
              if (typeof from === "undefined" || from === null) from = animationType.zero();
            } else from = animationType.fromCssValue(from);
            animation.from = from;
            
//             if (typeof to === "undefined" || to === null) to = value;
//             if (typeof to !== "undefined" && to !== null) to = animationType.fromCssValue(to);
//             else to = animationType.zero();
//             animation.to = to;
            if (typeof to === "undefined" || to === null) to = value;
            else to = animationType.fromCssValue(to);
            animation.to = to;
            
            if (animation.blend !== "absolute") animation.delta = animationType.subtract(from,to);
          }
          return animation;
        }
      },
      render: function() {
        var layer = owner._controller.presentationLayer;
        
        var presentationKeys = Object.keys(layer);
        presentationKeys.forEach( function(key,index) {
          var type = getType(key);
          if (isFunction(type)) type = new type();
          owner._style[key] = type.toCssValue(layer[key]);
        });
        
        var previousKeys = Object.keys(owner._previousPresentationLayer);
        previousKeys.forEach( function(key,index) { // Must nullify properties that are no longer animated, if not on presentationLayer.
          if (presentationKeys.indexOf(key) === -1) { // FIXME: Sort & walk keys? Not too bad if animating few properties.
            owner._style[key] = "";
          }
        });
        
        owner._previousPresentationLayer = layer;
      }
    }
    
    if (oldStyle) {
      Object.keys(oldStyle).forEach( function(key,index) {
        var type = getType(key);
        if (isFunction(type)) type = new type();
        owner._layer[key] = type.fromCssValue(oldStyle[key]);
      }.bind(owner));
    }
    
    Pyon.pyonify(this._controller,this._layer,this._delegate);
    
    if (oldStyle) {
      Object.keys(oldStyle).forEach( function(key,index) {
        var value = owner._style[key];
        var type = getType(key);
        if (isFunction(type)) type = new type();
        var serializedValue = type.fromCssValue(value);
        owner._controller.registerAnimatableProperty(key);
        owner._layer[key] = serializedValue;
      }.bind(owner));
    } else if (element !== null) { // PyonReact
      for (var i = 0; i < this._style.length; i++) {
        var property = this._style[i];
        var type = getType(property);
        var value = this._style[property];
        var ugly = type.fromCssValue(value);
        this._layer[property] = ugly;
        this._controller.registerAnimatableProperty(property);
      }
    }
  };

  PyonStyleDeclaration.prototype = {
    get cssText() {
      return this._surrogateElement.style.cssText;
    },
    set cssText(text) {
      var isAffectedProperty = {};
      for (var i = 0; i < this._surrogateElement.style.length; i++) {
        isAffectedProperty[this._surrogateElement.style[i]] = true;
      }
      this._surrogateElement.style.cssText = text;
      this._updateIndices();
      for (var i = 0; i < this._surrogateElement.style.length; i++) {
        isAffectedProperty[this._surrogateElement.style[i]] = true;
      }
      for (var property in isAffectedProperty) {
        if (!this._isAnimatedProperty[property]) {
          this._style.setProperty(property, this._surrogateElement.style.getPropertyValue(property));
        }
      }
      animatedInlineStyleChanged();
    },
    get length() {
      return this._surrogateElement.style.length;
    },
    get parentRule() {
      return this._style.parentRule;
    },
    get 'var'() {
      return this._style.var; 
    },
    _updateIndices: function() {
      while (this._length < this._surrogateElement.style.length) {
        Object.defineProperty(this, this._length, {
          configurable: true,
          enumerable: false,
          get: (function(index) {
            return function() {
              return this._surrogateElement.style[index];
            };
          })(this._length)
        });
        this._length++;
      }
      while (this._length > this._surrogateElement.style.length) {
        this._length--;
        Object.defineProperty(this, this._length, {
          configurable: true,
          enumerable: false,
          value: undefined
        });
      }
    },
    _restoreProperty: function(property) { // from _clearAnimatedProperty (below)
        this._style[property] = this._surrogateElement.style[property]; // INVALIDATES STYLE but gets forced in CompositedPropertyMap captureBaseValues
    },
    _clearAnimatedProperty: function(property) {
      this._restoreProperty(property);
      this._isAnimatedProperty[property] = false;
    },
    _setAnimatedProperty: function(property, value) { // called from setValue() from CompositedPropertyMap applyAnimatedValues
      this._style[property] = value; // INVALIDATES STYLE // sets element.style when animating
      this._isAnimatedProperty[property] = true;
    }
  };

  for (var method in cssStyleDeclarationMethodModifiesStyle) {
    PyonStyleDeclaration.prototype[method] = (function(method, modifiesStyle) {
      return function() {
        var result = this._surrogateElement.style[method].apply(
            this._surrogateElement.style, arguments);
        if (modifiesStyle) {
          if (!this._isAnimatedProperty[arguments[0]]) {
            this._style[method].apply(this._style, arguments);
          }
          this._updateIndices();
          animatedInlineStyleChanged();
        }
        return result;
      }
    })(method, cssStyleDeclarationMethodModifiesStyle[method]);
  }

  for (var property in document.documentElement.style) {
    if (cssStyleDeclarationAttribute[property] || property in cssStyleDeclarationMethodModifiesStyle) {
      continue;
    }
    (function(property) {
      Object.defineProperty(PyonStyleDeclaration.prototype, property, configureDescriptor({
        get: function() {
          var value = this._surrogateElement.style[property];
          return value;
        },
        set: function(value) {

          var type = getType(property);
          if (isFunction(type)) type = new type();
          
          var ugly = type.fromCssValue(value);
          this._layer[property] = ugly; // This will produce animations from and to the ugly values, not CSS values.
          this._controller.registerAnimatableProperty(property);
          
          this._surrogateElement.style[property] = value;
          this._updateIndices();
        }
      }));
    })(property);
  }

  // This function is a fallback for when we can't replace an element's style with
  // AnimatatedCSSStyleDeclaration and must patch the existing style to behave
  // in a similar way.
  // Only the methods listed in cssStyleDeclarationMethodModifiesStyle will
  // be patched to behave in the same manner as a native implementation,
  // getter properties like style.left or style[0] will be tainted by the
  // polyfill's animation engine.
  var patchInlineStyleForAnimation = function(style) {
    var surrogateElement = document.createElement('div');
    copyInlineStyle(style, surrogateElement.style);
    var isAnimatedProperty = {};
    for (var method in cssStyleDeclarationMethodModifiesStyle) {
      if (!(method in style)) {
        continue;
      }
    
      Object.defineProperty(style, method, configureDescriptor({
        value: (function(method, originalMethod, modifiesStyle) {
          return function() {
            var result = surrogateElement.style[method].apply(
                surrogateElement.style, arguments);
            if (modifiesStyle) {
              if (!isAnimatedProperty[arguments[0]]) {
                originalMethod.apply(style, arguments);
              }
              animatedInlineStyleChanged(); //retick
            }
            return result;
          }
        })(method, style[method], cssStyleDeclarationMethodModifiesStyle[method])
      }));
    }

    style._clearAnimatedProperty = function(property) {
      this[property] = surrogateElement.style[property];
      isAnimatedProperty[property] = false;
    };

    style._setAnimatedProperty = function(property, value) {
      this[property] = value;
      isAnimatedProperty[property] = true;
    };
  };
  
  
  
  
  
  
  
  
  
var interp = function(from, to, f, type) {
  if (Array.isArray(from) || Array.isArray(to)) {
    return interpArray(from, to, f, type);
  }
  var zero = type === 'scale' ? 1.0 : 0.0;
  to = isDefinedAndNotNull(to) ? to : zero;
  from = isDefinedAndNotNull(from) ? from : zero;

  return to * f + from * (1 - f);
};
  
var interpArray = function(from, to, f, type) {
  ASSERT_ENABLED && assert(Array.isArray(from) || from === null, 'From is not an array or null');
  ASSERT_ENABLED && assert( Array.isArray(to) || to === null, 'To is not an array or null');
  ASSERT_ENABLED && assert( from === null || to === null || from.length === to.length, 'Arrays differ in length ' + from + ' : ' + to);
  var length = from ? from.length : to.length;
  var result = [];
  for (var i = 0; i < length; i++) {
    result[i] = interp(from ? from[i] : null, to ? to[i] : null, f, type);
  }
  return result;
};

var isDefined = function(val) {
  return typeof val !== 'undefined';
};

var isDefinedAndNotNull = function(val) {
  return isDefined(val) && (val !== null);
};






var clamp = function(x, min, max) { // webkit only?
  return Math.max(Math.min(x, max), min);
};





var typeWithKeywords = function(keywords, type) {
  var isKeyword;
  if (keywords.length === 1) {
    var keyword = keywords[0];
    isKeyword = function(value) {
      return value === keyword;
    };
  } else {
    isKeyword = function(value) {
      return keywords.indexOf(value) >= 0;
    };
  }
  return createObject(type, {
    add: function(base, delta) {
      if (isKeyword(base) || isKeyword(delta)) {
        return delta;
      }
      return type.add(base, delta);
    },
    interpolate: function(from, to, f) {
      if (isKeyword(from) || isKeyword(to)) {
        return nonNumericType.interpolate(from, to, f);
      }
      return type.interpolate(from, to, f);
    },
    toCssValue: function(value, svgMode) {
      return isKeyword(value) ? value : type.toCssValue(value, svgMode);
    },
    fromCssValue: function(value) {
      return isKeyword(value) ? value : type.fromCssValue(value);
    }
  });
};

function NUMBER_TYPE() {}

//var numberType = {
var numberType = createObject(Pyon.ValueType, {
  toString: function() {
    return "numberType";
  },
  inverse: function(base) {
    if (base === 'auto') {
      return nonNumericType.inverse(base);
    }
    var negative = base * -1;
    return negative;
  },
  zero : function() {
    return 0; 
  },
  add: function(base, delta) {
    if (Number(base) !== base && Number(delta) !== delta) return 0;
    else if (Number(base) !== base) base = 0;
    else if (Number(delta) !== delta) delta = 0;

    // If base or delta are 'auto', we fall back to replacement.
    if (base === 'auto' || delta === 'auto') {
      return nonNumericType.add(base, delta);
    }
    
    var result = base + delta;
    return result;
  },
  subtract: function(base,delta) { // KxDx
    var inverse = this.inverse(delta);
    if (Number(base) !== base && Number(delta) !== delta) return 0;
    else if (Number(base) !== base) base = 0;
    else if (Number(delta) !== delta) delta = 0;
    return this.add(base,this.inverse(delta));
  },
  interpolate: function(from, to, f) {
    // If from or to are 'auto', we fall back to step interpolation.
    if (from === 'auto' || to === 'auto') {
      return nonNumericType.interpolate(from, to);
    }
    return interp(from, to, f);
  },
  //toCssValue: function(value) { return value + ''; }, // original
  toCssValue: function(value) { return value; }, // no strings damn it. Unknown side effects
  fromCssValue: function(value) {
    if (value === 'auto') {
      return 'auto';
    }
    var result = Number(value);
    return isNaN(result) ? undefined : result;
  }
});

var integerType = createObject(numberType, {
  interpolate: function(from, to, f) {
    // If from or to are 'auto', we fall back to step interpolation.
    if (from === 'auto' || to === 'auto') {
      return nonNumericType.interpolate(from, to);
    }
    return Math.floor(interp(from, to, f));
  }
});

//var fontWeightType = {
var fontWeightType = createObject(Pyon.ValueType, {
  toString: function() {
    return "fontWeightType";
  },
  inverse: function(value) { // KxDx
    return value * -1;
  },
  add: function(base, delta) { return base + delta; },
  subtract: function(base,delta) { // KxDx
    return this.add(base,this.inverse(delta));
  },
  interpolate: function(from, to, f) {
    return interp(from, to, f);
  },
  toCssValue: function(value) {
    value = Math.round(value / 100) * 100;
    value = clamp(value, 100, 900);
    if (value === 400) {
      return 'normal';
    }
    if (value === 700) {
      return 'bold';
    }
    return String(value);
  },
  fromCssValue: function(value) {
    // TODO: support lighter / darker ?
    var out = Number(value);
    if (isNaN(out) || out < 100 || out > 900 || out % 100 !== 0) {
      return undefined;
    }
    return out;
  }
});

// This regular expression is intentionally permissive, so that
// platform-prefixed versions of calc will still be accepted as
// input. While we are restrictive with the transform property
// name, we need to be able to read underlying calc values from
// computedStyle so can't easily restrict the input here.
var outerCalcRE = /^\s*(-webkit-)?calc\s*\(\s*([^)]*)\)/;
var valueRE = /^\s*(-?[0-9]+(\.[0-9])?[0-9]*)([a-zA-Z%]*)/;
var operatorRE = /^\s*([+-])/;
var autoRE = /^\s*auto/i;

function PERCENT_LENGTH_TYPE() {}

//var percentLengthType = {
var percentLengthType = createObject(Pyon.ValueType, {
  toString: function() {
    return "percentLengthType";
  },
  zero: function() { 
    return {px : 0}; 
  },
  add: function(base, delta) {
    if (delta === null || delta === undefined) {
      delta = {}; // bug fix / hack. transformType does this too. So should the rest. If element is removed from dom, CompositedPropertyMap can't applyAnimatedValues when additive. Lack of a transform also has this problem
    }
    if (base === null || base === undefined) {
      base = {}; // bug fix / hack. transformType does this too. So should the rest. If element is removed from dom, CompositedPropertyMap can't applyAnimatedValues when additive. Lack of a transform also has this problem
    }
    var out = {};
    for (var value in base) {
      out[value] = base[value] + (delta[value] || 0);
    }
    for (value in delta) {
      if (value in base) {
        continue;
      }
      out[value] = delta[value];
    }
    return out;
  },
  subtract: function(base,delta) {
    var inverse = this.inverse(delta);
    var sum = this.add(base,inverse);
    return sum;
  },
  interpolate: function(from, to, f) {
    var out = {};
    for (var value in from) {
      out[value] = interp(from[value], to[value], f);
    }
    for (var value in to) {
      if (value in out) {
        continue;
      }
      out[value] = interp(0, to[value], f);
    }
    return out;
  },
  toCssValue: function(value) {
    var s = '';
    var singleValue = true;
    for (var item in value) {
      if (s === '') {
        s = value[item] + item;
      } else if (singleValue) {
        if (value[item] !== 0) {
          s = features.calcFunction +
              '(' + s + ' + ' + value[item] + item + ')';
          singleValue = false;
        }
      } else if (value[item] !== 0) {
        s = s.substring(0, s.length - 1) + ' + ' + value[item] + item + ')';
      }
    }
    return s;
  },
  fromCssValue: function(value) {
    var result = percentLengthType.consumeValueFromString(value);
    if (result) {
      return result.value;
    }
    return undefined;
  },
  consumeValueFromString: function(value) {
    if (!isDefinedAndNotNull(value)) {
      return undefined;
    }
    var autoMatch = autoRE.exec(value);
    if (autoMatch) {
      return {
        value: { auto: true },
        remaining: value.substring(autoMatch[0].length)
      };
    }
    var out = {};
    var calcMatch = outerCalcRE.exec(value);
    if (!calcMatch) {
      var singleValue = valueRE.exec(value);
      if (singleValue && (singleValue.length === 4)) {
        out[singleValue[3]] = Number(singleValue[1]);
        return {
          value: out,
          remaining: value.substring(singleValue[0].length)
        };
      }
      return undefined;
    }
    var remaining = value.substring(calcMatch[0].length);
    var calcInnards = calcMatch[2];
    var firstTime = true;
    while (true) {
      var reversed = false;
      if (firstTime) {
        firstTime = false;
      } else {
        var op = operatorRE.exec(calcInnards);
        if (!op) {
          return undefined;
        }
        if (op[1] === '-') {
          reversed = true;
        }
        calcInnards = calcInnards.substring(op[0].length);
      }
      value = valueRE.exec(calcInnards);
      if (!value) {
        return undefined;
      }
      var valueUnit = value[3];
      var valueNumber = Number(value[1]);
      if (!isDefinedAndNotNull(out[valueUnit])) {
        out[valueUnit] = 0;
      }
      if (reversed) {
        out[valueUnit] -= valueNumber;
      } else {
        out[valueUnit] += valueNumber;
      }
      calcInnards = calcInnards.substring(value[0].length);
      if (/\s*/.exec(calcInnards)[0].length === calcInnards.length) {
        return {
          value: out,
          remaining: remaining
        };
      }
    }
  },
  inverse: function(value) {
    var out = {};
    for (var unit in value) {
      out[unit] = -value[unit];
    }
    return out;
  }
});

var percentLengthAutoType = typeWithKeywords(['auto'], percentLengthType);

var positionKeywordRE = /^\s*left|^\s*center|^\s*right|^\s*top|^\s*bottom/i;
//var positionType = {
var positionType = createObject(Pyon.ValueType, {

  toString: function() {
    return "positionType";
  },
  inverse: function(base) { // KxDx
    return [
      percentLengthType.inverse(base[0]),
      percentLengthType.add(base[1])
    ];
  },
  zero: function() { return [{ px: 0 }, { px: 0 }]; },
  add: function(base, delta) {
    return [
      percentLengthType.add(base[0], delta[0]),
      percentLengthType.add(base[1], delta[1])
    ];
  },
  subtract: function(base,delta) { // KxDx
    return this.add(base,this.inverse(delta));
  },
  interpolate: function(from, to, f) {
    return [
      percentLengthType.interpolate(from[0], to[0], f),
      percentLengthType.interpolate(from[1], to[1], f)
    ];
  },
  toCssValue: function(value) {
    return value.map(percentLengthType.toCssValue).join(' ');
  },
  fromCssValue: function(value) {
    var tokens = [];
    var remaining = value;
    while (true) {
      var result = positionType.consumeTokenFromString(remaining);
      if (!result) {
        return undefined;
      }
      tokens.push(result.value);
      remaining = result.remaining;
      if (!result.remaining.trim()) {
        break;
      }
      if (tokens.length >= 4) {
        return undefined;
      }
    }

    if (tokens.length === 1) {
      var token = tokens[0];
      return (positionType.isHorizontalToken(token) ?
          [token, 'center'] : ['center', token]).map(positionType.resolveToken);
    }

    if (tokens.length === 2 &&
        positionType.isHorizontalToken(tokens[0]) &&
        positionType.isVerticalToken(tokens[1])) {
      return tokens.map(positionType.resolveToken);
    }

    if (tokens.filter(positionType.isKeyword).length !== 2) {
      return undefined;
    }

    var out = [undefined, undefined];
    var center = false;
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (!positionType.isKeyword(token)) {
        return undefined;
      }
      if (token === 'center') {
        if (center) {
          return undefined;
        }
        center = true;
        continue;
      }
      var axis = Number(positionType.isVerticalToken(token));
      if (out[axis]) {
        return undefined;
      }
      if (i === tokens.length - 1 || positionType.isKeyword(tokens[i + 1])) {
        out[axis] = positionType.resolveToken(token);
        continue;
      }
      var percentLength = tokens[++i];
      if (token === 'bottom' || token === 'right') {
        percentLength = percentLengthType.inverse(percentLength);
        percentLength['%'] = (percentLength['%'] || 0) + 100;
      }
      out[axis] = percentLength;
    }
    if (center) {
      if (!out[0]) {
        out[0] = positionType.resolveToken('center');
      } else if (!out[1]) {
        out[1] = positionType.resolveToken('center');
      } else {
        return undefined;
      }
    }
    return out.every(isDefinedAndNotNull) ? out : undefined;
  },
  consumeTokenFromString: function(value) {
    var keywordMatch = positionKeywordRE.exec(value);
    if (keywordMatch) {
      return {
        value: keywordMatch[0].trim().toLowerCase(),
        remaining: value.substring(keywordMatch[0].length)
      };
    }
    return percentLengthType.consumeValueFromString(value);
  },
  resolveToken: function(token) {
    if (typeof token === 'string') {
      return percentLengthType.fromCssValue({
        left: '0%',
        center: '50%',
        right: '100%',
        top: '0%',
        bottom: '100%'
      }[token]);
    }
    return token;
  },
  isHorizontalToken: function(token) {
    if (typeof token === 'string') {
      return token in { left: true, center: true, right: true };
    }
    return true;
  },
  isVerticalToken: function(token) {
    if (typeof token === 'string') {
      return token in { top: true, center: true, bottom: true };
    }
    return true;
  },
  isKeyword: function(token) {
    return typeof token === 'string';
  }
});

// Spec: http://dev.w3.org/csswg/css-backgrounds/#background-position
//var positionListType = {
var positionListType = createObject(Pyon.ValueType, {

  toString: function() {
    return "positionListType";
  },
  inverse: function(base) { // KxDx
    var out = [];
    var maxLength = base.length;
    for (var i = 0; i < maxLength; i++) {
      var basePosition = base[i] ? base[i] : positionType.zero();
      out.push(positionType.inverse(basePosition));
    }
    return out;
  },
  zero: function() { return [positionType.zero()]; },
  add: function(base, delta) {
    var out = [];
    var maxLength = Math.max(base.length, delta.length);
    for (var i = 0; i < maxLength; i++) {
      var basePosition = base[i] ? base[i] : positionType.zero();
      var deltaPosition = delta[i] ? delta[i] : positionType.zero();
      out.push(positionType.add(basePosition, deltaPosition));
    }
    return out;
  },
  subtract: function(base,delta) { // KxDx
    return this.add(base,this.inverse(delta));
  },
  interpolate: function(from, to, f) {
    var out = [];
    var maxLength = Math.max(from.length, to.length);
    for (var i = 0; i < maxLength; i++) {
      var fromPosition = from[i] ? from[i] : positionType.zero();
      var toPosition = to[i] ? to[i] : positionType.zero();
      out.push(positionType.interpolate(fromPosition, toPosition, f));
    }
    return out;
  },
  toCssValue: function(value) {
    return value.map(positionType.toCssValue).join(', ');
  },
  fromCssValue: function(value) {
    if (!isDefinedAndNotNull(value)) {
      return undefined;
    }
    if (!value.trim()) {
      return [positionType.fromCssValue('0% 0%')];
    }
    var positionValues = value.split(',');
    var out = positionValues.map(positionType.fromCssValue);
    return out.every(isDefinedAndNotNull) ? out : undefined;
  }
});

var rectangleRE = /rect\(([^,]+),([^,]+),([^,]+),([^)]+)\)/;
//var rectangleType = {
var rectangleType = createObject(Pyon.ValueType, {

  toString: function() {
    return "rectangleType";
  },
  inverse: function(value) { // KxDx
    return {
      top: percentLengthType.inverse(value.top),
      right: percentLengthType.inverse(value.right),
      bottom: percentLengthType.inverse(value.bottom),
      left: percentLengthType.inverse(value.left)
    }
  },
  zero: function() { return {top:0, right:0, bottom:0, left:0};},// KxDx
  add: function(base, delta) {
    return {
      top: percentLengthType.add(base.top, delta.top),
      right: percentLengthType.add(base.right, delta.right),
      bottom: percentLengthType.add(base.bottom, delta.bottom),
      left: percentLengthType.add(base.left, delta.left)
    };
  },
  subtract: function(base,delta) { // KxDx
    return this.add(base,this.inverse(delta));
  },
  interpolate: function(from, to, f) {
    return {
      top: percentLengthType.interpolate(from.top, to.top, f),
      right: percentLengthType.interpolate(from.right, to.right, f),
      bottom: percentLengthType.interpolate(from.bottom, to.bottom, f),
      left: percentLengthType.interpolate(from.left, to.left, f)
    };
  },
  toCssValue: function(value) {
    return 'rect(' +
        percentLengthType.toCssValue(value.top) + ',' +
        percentLengthType.toCssValue(value.right) + ',' +
        percentLengthType.toCssValue(value.bottom) + ',' +
        percentLengthType.toCssValue(value.left) + ')';
  },
  fromCssValue: function(value) {
    var match = rectangleRE.exec(value);
    if (!match) {
      return undefined;
    }
    var out = {
      top: percentLengthType.fromCssValue(match[1]),
      right: percentLengthType.fromCssValue(match[2]),
      bottom: percentLengthType.fromCssValue(match[3]),
      left: percentLengthType.fromCssValue(match[4])
    };
    if (out.top && out.right && out.bottom && out.left) {
      return out;
    }
    return undefined;
  }
});

//var shadowType = {
var shadowType = createObject(Pyon.ValueType, {

  toString: function() {
    return "shadowType";
  },
  inverse: function(value) {
    return nonNumericType.inverse(value);
  },
  zero: function() {
    return {
      hOffset: lengthType.zero(),
      vOffset: lengthType.zero()
    };
  },
  _addSingle: function(base, delta) {
    if (base && delta && base.inset !== delta.inset) {
      return delta;
    }
    var result = {
      inset: base ? base.inset : delta.inset,
      hOffset: lengthType.add(
          base ? base.hOffset : lengthType.zero(),
          delta ? delta.hOffset : lengthType.zero()),
      vOffset: lengthType.add(
          base ? base.vOffset : lengthType.zero(),
          delta ? delta.vOffset : lengthType.zero()),
      blur: lengthType.add(
          base && base.blur || lengthType.zero(),
          delta && delta.blur || lengthType.zero())
    };
    if (base && base.spread || delta && delta.spread) {
      result.spread = lengthType.add(
          base && base.spread || lengthType.zero(),
          delta && delta.spread || lengthType.zero());
    }
    if (base && base.color || delta && delta.color) {
      result.color = colorType.add(
          base && base.color || colorType.zero(),
          delta && delta.color || colorType.zero());
    }
    return result;
  },
  add: function(base, delta) {
    var result = [];
    for (var i = 0; i < base.length || i < delta.length; i++) {
      result.push(this._addSingle(base[i], delta[i]));
    }
    return result;
  },
  subtract: function(base,delta) { // KxDx
    return this.add(base,this.inverse(delta));
  },
  _interpolateSingle: function(from, to, f) {
    if (from && to && from.inset !== to.inset) {
      return f < 0.5 ? from : to;
    }
    var result = {
      inset: from ? from.inset : to.inset,
      hOffset: lengthType.interpolate(
          from ? from.hOffset : lengthType.zero(),
          to ? to.hOffset : lengthType.zero(), f),
      vOffset: lengthType.interpolate(
          from ? from.vOffset : lengthType.zero(),
          to ? to.vOffset : lengthType.zero(), f),
      blur: lengthType.interpolate(
          from && from.blur || lengthType.zero(),
          to && to.blur || lengthType.zero(), f)
    };
    if (from && from.spread || to && to.spread) {
      result.spread = lengthType.interpolate(
          from && from.spread || lengthType.zero(),
          to && to.spread || lengthType.zero(), f);
    }
    if (from && from.color || to && to.color) {
      result.color = colorType.interpolate(
          from && from.color || colorType.zero(),
          to && to.color || colorType.zero(), f);
    }
    return result;
  },
  interpolate: function(from, to, f) {
    var result = [];
    for (var i = 0; i < from.length || i < to.length; i++) {
      result.push(this._interpolateSingle(from[i], to[i], f));
    }
    return result;
  },
  _toCssValueSingle: function(value) {
    return (value.inset ? 'inset ' : '') +
        lengthType.toCssValue(value.hOffset) + ' ' +
        lengthType.toCssValue(value.vOffset) + ' ' +
        lengthType.toCssValue(value.blur) +
        (value.spread ? ' ' + lengthType.toCssValue(value.spread) : '') +
        (value.color ? ' ' + colorType.toCssValue(value.color) : '');
  },
  toCssValue: function(value) {
    return value.map(this._toCssValueSingle).join(', ');
  },
  fromCssValue: function(value) {
    var shadowRE = /(([^(,]+(\([^)]*\))?)+)/g;
    var match;
    var shadows = [];
    while ((match = shadowRE.exec(value)) !== null) {
      shadows.push(match[0]);
    }

    var result = shadows.map(function(value) {
      if (value === 'none') {
        return shadowType.zero();
      }
      value = value.replace(/^\s+|\s+$/g, '');

      var partsRE = /([^ (]+(\([^)]*\))?)/g;
      var parts = [];
      while ((match = partsRE.exec(value)) !== null) {
        parts.push(match[0]);
      }

      if (parts.length < 2 || parts.length > 7) {
        return undefined;
      }
      var result = {
        inset: false
      };

      var lengths = [];
      while (parts.length) {
        var part = parts.shift();

        var length = lengthType.fromCssValue(part);
        if (length) {
          lengths.push(length);
          continue;
        }

        var color = colorType.fromCssValue(part);
        if (color) {
          result.color = color;
        }

        if (part === 'inset') {
          result.inset = true;
        }
      }

      if (lengths.length < 2 || lengths.length > 4) {
        return undefined;
      }
      result.hOffset = lengths[0];
      result.vOffset = lengths[1];
      if (lengths.length > 2) {
        result.blur = lengths[2];
      }
      if (lengths.length > 3) {
        result.spread = lengths[3];
      }
      return result;
    });

    return result.every(isDefined) ? result : undefined;
  }
});

//var nonNumericType = {
var nonNumericType = createObject(Pyon.ValueType, {
  toString: function() {
    return "nonNumericType";
  },
  zero: function() {
    return "";
  },
  inverse: function(value) {
    return value;
  },
  add: function(base, delta) {
    return isDefined(delta) ? delta : base;
  },
  subtract: function(base,delta) { // KxDx
    return this.add(base,this.inverse(delta));
  },
  interpolate: function(from, to, f) {
    return f < 0.5 ? from : to;
  },
  toCssValue: function(value) {
    return value;
  },
  fromCssValue: function(value) {
    return value;
  }
});

function VISIBILITY_TYPE() {}

var visibilityType = createObject(nonNumericType, {
  toString: function() {
    return "visibilityType";
  },
  interpolate: function(from, to, f) {
    if (from !== 'visible' && to !== 'visible') {
      return nonNumericType.interpolate(from, to, f);
    }
    if (f <= 0) {
      return from;
    }
    if (f >= 1) {
      return to;
    }
    return 'visible';
  },
  fromCssValue: function(value) {
    if (['visible', 'hidden', 'collapse'].indexOf(value) !== -1) {
      return value;
    }
    return undefined;
  }
});

function LENGTH_TYPE() {}

var lengthType = percentLengthType;
var lengthAutoType = typeWithKeywords(['auto'], lengthType);

var colorRE = new RegExp(
    '(hsla?|rgba?)\\(' +
    '([\\-0-9]+%?),?\\s*' +
    '([\\-0-9]+%?),?\\s*' +
    '([\\-0-9]+%?)(?:,?\\s*([\\-0-9\\.]+%?))?' +
    '\\)');
var colorHashRE = new RegExp(
    '#([0-9A-Fa-f][0-9A-Fa-f]?)' +
    '([0-9A-Fa-f][0-9A-Fa-f]?)' +
    '([0-9A-Fa-f][0-9A-Fa-f]?)');

function hsl2rgb(h, s, l) {
  // Cribbed from http://dev.w3.org/csswg/css-color/#hsl-color
  // Wrap to 0->360 degrees (IE -10 === 350) then normalize
  h = (((h % 360) + 360) % 360) / 360;
  s = s / 100;
  l = l / 100;
  function hue2rgb(m1, m2, h) {
    if (h < 0) {
      h += 1;
    }
    if (h > 1) {
      h -= 1;
    }
    if (h * 6 < 1) {
      return m1 + (m2 - m1) * h * 6;
    }
    if (h * 2 < 1) {
      return m2;
    }
    if (h * 3 < 2) {
      return m1 + (m2 - m1) * (2 / 3 - h) * 6;
    }
    return m1;
  }
  var m2;
  if (l <= 0.5) {
    m2 = l * (s + 1);
  } else {
    m2 = l + s - l * s;
  }

  var m1 = l * 2 - m2;
  var r = Math.ceil(hue2rgb(m1, m2, h + 1 / 3) * 255);
  var g = Math.ceil(hue2rgb(m1, m2, h) * 255);
  var b = Math.ceil(hue2rgb(m1, m2, h - 1 / 3) * 255);
  return [r, g, b];
}

var namedColors = {
  aliceblue: [240, 248, 255, 1],
  antiquewhite: [250, 235, 215, 1],
  aqua: [0, 255, 255, 1],
  aquamarine: [127, 255, 212, 1],
  azure: [240, 255, 255, 1],
  beige: [245, 245, 220, 1],
  bisque: [255, 228, 196, 1],
  black: [0, 0, 0, 1],
  blanchedalmond: [255, 235, 205, 1],
  blue: [0, 0, 255, 1],
  blueviolet: [138, 43, 226, 1],
  brown: [165, 42, 42, 1],
  burlywood: [222, 184, 135, 1],
  cadetblue: [95, 158, 160, 1],
  chartreuse: [127, 255, 0, 1],
  chocolate: [210, 105, 30, 1],
  coral: [255, 127, 80, 1],
  cornflowerblue: [100, 149, 237, 1],
  cornsilk: [255, 248, 220, 1],
  crimson: [220, 20, 60, 1],
  cyan: [0, 255, 255, 1],
  darkblue: [0, 0, 139, 1],
  darkcyan: [0, 139, 139, 1],
  darkgoldenrod: [184, 134, 11, 1],
  darkgray: [169, 169, 169, 1],
  darkgreen: [0, 100, 0, 1],
  darkgrey: [169, 169, 169, 1],
  darkkhaki: [189, 183, 107, 1],
  darkmagenta: [139, 0, 139, 1],
  darkolivegreen: [85, 107, 47, 1],
  darkorange: [255, 140, 0, 1],
  darkorchid: [153, 50, 204, 1],
  darkred: [139, 0, 0, 1],
  darksalmon: [233, 150, 122, 1],
  darkseagreen: [143, 188, 143, 1],
  darkslateblue: [72, 61, 139, 1],
  darkslategray: [47, 79, 79, 1],
  darkslategrey: [47, 79, 79, 1],
  darkturquoise: [0, 206, 209, 1],
  darkviolet: [148, 0, 211, 1],
  deeppink: [255, 20, 147, 1],
  deepskyblue: [0, 191, 255, 1],
  dimgray: [105, 105, 105, 1],
  dimgrey: [105, 105, 105, 1],
  dodgerblue: [30, 144, 255, 1],
  firebrick: [178, 34, 34, 1],
  floralwhite: [255, 250, 240, 1],
  forestgreen: [34, 139, 34, 1],
  fuchsia: [255, 0, 255, 1],
  gainsboro: [220, 220, 220, 1],
  ghostwhite: [248, 248, 255, 1],
  gold: [255, 215, 0, 1],
  goldenrod: [218, 165, 32, 1],
  gray: [128, 128, 128, 1],
  green: [0, 128, 0, 1],
  greenyellow: [173, 255, 47, 1],
  grey: [128, 128, 128, 1],
  honeydew: [240, 255, 240, 1],
  hotpink: [255, 105, 180, 1],
  indianred: [205, 92, 92, 1],
  indigo: [75, 0, 130, 1],
  ivory: [255, 255, 240, 1],
  khaki: [240, 230, 140, 1],
  lavender: [230, 230, 250, 1],
  lavenderblush: [255, 240, 245, 1],
  lawngreen: [124, 252, 0, 1],
  lemonchiffon: [255, 250, 205, 1],
  lightblue: [173, 216, 230, 1],
  lightcoral: [240, 128, 128, 1],
  lightcyan: [224, 255, 255, 1],
  lightgoldenrodyellow: [250, 250, 210, 1],
  lightgray: [211, 211, 211, 1],
  lightgreen: [144, 238, 144, 1],
  lightgrey: [211, 211, 211, 1],
  lightpink: [255, 182, 193, 1],
  lightsalmon: [255, 160, 122, 1],
  lightseagreen: [32, 178, 170, 1],
  lightskyblue: [135, 206, 250, 1],
  lightslategray: [119, 136, 153, 1],
  lightslategrey: [119, 136, 153, 1],
  lightsteelblue: [176, 196, 222, 1],
  lightyellow: [255, 255, 224, 1],
  lime: [0, 255, 0, 1],
  limegreen: [50, 205, 50, 1],
  linen: [250, 240, 230, 1],
  magenta: [255, 0, 255, 1],
  maroon: [128, 0, 0, 1],
  mediumaquamarine: [102, 205, 170, 1],
  mediumblue: [0, 0, 205, 1],
  mediumorchid: [186, 85, 211, 1],
  mediumpurple: [147, 112, 219, 1],
  mediumseagreen: [60, 179, 113, 1],
  mediumslateblue: [123, 104, 238, 1],
  mediumspringgreen: [0, 250, 154, 1],
  mediumturquoise: [72, 209, 204, 1],
  mediumvioletred: [199, 21, 133, 1],
  midnightblue: [25, 25, 112, 1],
  mintcream: [245, 255, 250, 1],
  mistyrose: [255, 228, 225, 1],
  moccasin: [255, 228, 181, 1],
  navajowhite: [255, 222, 173, 1],
  navy: [0, 0, 128, 1],
  oldlace: [253, 245, 230, 1],
  olive: [128, 128, 0, 1],
  olivedrab: [107, 142, 35, 1],
  orange: [255, 165, 0, 1],
  orangered: [255, 69, 0, 1],
  orchid: [218, 112, 214, 1],
  palegoldenrod: [238, 232, 170, 1],
  palegreen: [152, 251, 152, 1],
  paleturquoise: [175, 238, 238, 1],
  palevioletred: [219, 112, 147, 1],
  papayawhip: [255, 239, 213, 1],
  peachpuff: [255, 218, 185, 1],
  peru: [205, 133, 63, 1],
  pink: [255, 192, 203, 1],
  plum: [221, 160, 221, 1],
  powderblue: [176, 224, 230, 1],
  purple: [128, 0, 128, 1],
  red: [255, 0, 0, 1],
  rosybrown: [188, 143, 143, 1],
  royalblue: [65, 105, 225, 1],
  saddlebrown: [139, 69, 19, 1],
  salmon: [250, 128, 114, 1],
  sandybrown: [244, 164, 96, 1],
  seagreen: [46, 139, 87, 1],
  seashell: [255, 245, 238, 1],
  sienna: [160, 82, 45, 1],
  silver: [192, 192, 192, 1],
  skyblue: [135, 206, 235, 1],
  slateblue: [106, 90, 205, 1],
  slategray: [112, 128, 144, 1],
  slategrey: [112, 128, 144, 1],
  snow: [255, 250, 250, 1],
  springgreen: [0, 255, 127, 1],
  steelblue: [70, 130, 180, 1],
  tan: [210, 180, 140, 1],
  teal: [0, 128, 128, 1],
  thistle: [216, 191, 216, 1],
  tomato: [255, 99, 71, 1],
  transparent: [0, 0, 0, 0],
  turquoise: [64, 224, 208, 1],
  violet: [238, 130, 238, 1],
  wheat: [245, 222, 179, 1],
  white: [255, 255, 255, 1],
  whitesmoke: [245, 245, 245, 1],
  yellow: [255, 255, 0, 1],
  yellowgreen: [154, 205, 50, 1]
};

function COLOR_TYPE() {}

//var colorType = typeWithKeywords(['currentColor'], {
var colorType = typeWithKeywords(['currentColor'], createObject(Pyon.ValueType, {

  inverse: function(value) { // KxDx
    return nonNumericType.inverse(value); // this can't be right
  },
  zero: function() { return [0, 0, 0, 0]; },
  _premultiply: function(value) {
    var alpha = value[3];
    return [value[0] * alpha, value[1] * alpha, value[2] * alpha];
  },
  add: function(base, delta) {
    var alpha = Math.min(base[3] + delta[3], 1);
    if (alpha === 0) {
      return [0, 0, 0, 0];
    }
    base = this._premultiply(base);
    delta = this._premultiply(delta);
    return [(base[0] + delta[0]) / alpha, (base[1] + delta[1]) / alpha,
            (base[2] + delta[2]) / alpha, alpha];
  },
  subtract: function(base,delta) { // KxDx
    return this.add(base,this.inverse(delta));
  },
  interpolate: function(from, to, f) {
    var alpha = clamp(interp(from[3], to[3], f), 0, 1);
    if (alpha === 0) {
      return [0, 0, 0, 0];
    }
    from = this._premultiply(from);
    to = this._premultiply(to);
    return [interp(from[0], to[0], f) / alpha,
            interp(from[1], to[1], f) / alpha,
            interp(from[2], to[2], f) / alpha, alpha];
  },
  toCssValue: function(value) {
    return 'rgba(' + Math.round(value[0]) + ', ' + Math.round(value[1]) +
        ', ' + Math.round(value[2]) + ', ' + value[3] + ')';
  },
  fromCssValue: function(value) {
    // http://dev.w3.org/csswg/css-color/#color
    var out = [];

    var regexResult = colorHashRE.exec(value);
    if (regexResult) {
      if (value.length !== 4 && value.length !== 7) {
        return undefined;
      }
      var out = [];
      regexResult.shift();
      for (var i = 0; i < 3; i++) {
        if (regexResult[i].length === 1) {
          regexResult[i] = regexResult[i] + regexResult[i];
        }
        var v = Math.max(Math.min(parseInt(regexResult[i], 16), 255), 0);
        out[i] = v;
      }
      out.push(1.0);
    }

    var regexResult = colorRE.exec(value);
    if (regexResult) {
      regexResult.shift();
      var type = regexResult.shift().substr(0, 3);
      for (var i = 0; i < 3; i++) {
        var m = 1;
        if (regexResult[i][regexResult[i].length - 1] === '%') {
          regexResult[i] = regexResult[i].substr(0, regexResult[i].length - 1);
          m = 255.0 / 100.0;
        }
        if (type === 'rgb') {
          out[i] = clamp(Math.round(parseInt(regexResult[i], 10) * m), 0, 255);
        } else {
          out[i] = parseInt(regexResult[i], 10);
        }
      }

      // Convert hsl values to rgb value
      if (type === 'hsl') {
        out = hsl2rgb.apply(null, out);
      }

      if (typeof regexResult[3] !== 'undefined') {
        out[3] = Math.max(Math.min(parseFloat(regexResult[3]), 1.0), 0.0);
      } else {
        out.push(1.0);
      }
    }

    if (out.some(isNaN)) {
      return undefined;
    }
    if (out.length > 0) {
      return out;
    }
    return namedColors[value];
  }
}));


function T_R_A_N_S_F_O_R_M() {

}

var convertToDeg = function(num, type) {
  switch (type) {
    case 'grad':
      return num / 400 * 360;
    case 'rad':
      return num / 2 / Math.PI * 360;
    case 'turn':
      return num * 360;
    default:
      return num;
  }
};

var extractValue = function(values, pos, hasUnits) {
  var value = Number(values[pos]);
  if (!hasUnits) {
    return value;
  }
  var type = values[pos + 1];
  if (type === '') { type = 'px'; }
  var result = {};
  result[type] = value;
  return result;
};

var extractValues = function(values, numValues, hasOptionalValue,
    hasUnits) {
  var result = [];
  for (var i = 0; i < numValues; i++) {
    result.push(extractValue(values, 1 + 2 * i, hasUnits));
  }
  if (hasOptionalValue && values[1 + 2 * numValues]) {
    result.push(extractValue(values, 1 + 2 * numValues, hasUnits));
  }
  return result;
};

var SPACES = '\\s*';
var NUMBER = '[+-]?(?:\\d+|\\d*\\.\\d+)';
var RAW_OPEN_BRACKET = '\\(';
var RAW_CLOSE_BRACKET = '\\)';
var RAW_COMMA = ',';
var UNIT = '[a-zA-Z%]*';
var START = '^';

function capture(x) { return '(' + x + ')'; }
function optional(x) { return '(?:' + x + ')?'; }

var OPEN_BRACKET = [SPACES, RAW_OPEN_BRACKET, SPACES].join('');
var CLOSE_BRACKET = [SPACES, RAW_CLOSE_BRACKET, SPACES].join('');
var COMMA = [SPACES, RAW_COMMA, SPACES].join('');
var UNIT_NUMBER = [capture(NUMBER), capture(UNIT)].join('');

function transformRE(name, numParms, hasOptionalParm) {
  var tokenList = [START, SPACES, name, OPEN_BRACKET];
  for (var i = 0; i < numParms - 1; i++) {
    tokenList.push(UNIT_NUMBER);
    tokenList.push(COMMA);
  }
  tokenList.push(UNIT_NUMBER);
  if (hasOptionalParm) {
    tokenList.push(optional([COMMA, UNIT_NUMBER].join('')));
  }
  tokenList.push(CLOSE_BRACKET);
  return new RegExp(tokenList.join(''));
}

function buildMatcher(name, numValues, hasOptionalValue, hasUnits, baseValue) {
  var baseName = name;
  if (baseValue) {
    if (name[name.length - 1] === 'X' || name[name.length - 1] === 'Y') {
      baseName = name.substring(0, name.length - 1);
    } else if (name[name.length - 1] === 'Z') {
      baseName = name.substring(0, name.length - 1) + '3d';
    }
  }

  var f = function(x) {
    var r = extractValues(x, numValues, hasOptionalValue, hasUnits);
    if (baseValue !== undefined) {
      if (name[name.length - 1] === 'X') {
        r.push(baseValue);
      } else if (name[name.length - 1] === 'Y') {
        r = [baseValue].concat(r);
      } else if (name[name.length - 1] === 'Z') {
        r = [baseValue, baseValue].concat(r);
      } else if (hasOptionalValue) {
        while (r.length < 2) {
          if (baseValue === 'copy') {
            r.push(r[0]);
          } else {
            r.push(baseValue);
          }
        }
      }
    }
    return r;
  };
  return [transformRE(name, numValues, hasOptionalValue), f, baseName];
}

function buildRotationMatcher(name, numValues, hasOptionalValue, baseValue) {
  var m = buildMatcher(name, numValues, hasOptionalValue, true, baseValue);
  var f = function(x) {
      var r = m[1](x);
      return r.map(function(v) {
      var result = 0;
      for (var type in v) {
        result += convertToDeg(v[type], type);
      }
      return result;
    });  
  };
    return [m[0], f, m[2]];
}

function build3DRotationMatcher() {
  var m = buildMatcher('rotate3d', 4, false, true);
  var f = function(x) {
    var r = m[1](x);
    var out = [];
    for (var i = 0; i < 3; i++) {
      out.push(r[i].px);
    }
    out.push(r[3]);
    return out;
  };
  return [m[0], f, m[2]];
}

var transformREs = [
  buildRotationMatcher('rotate', 1, false),
  buildRotationMatcher('rotateX', 1, false),
  buildRotationMatcher('rotateY', 1, false),
  buildRotationMatcher('rotateZ', 1, false),
  build3DRotationMatcher(),
  buildRotationMatcher('skew', 1, true, 0),
  buildRotationMatcher('skewX', 1, false),
  buildRotationMatcher('skewY', 1, false),
  buildMatcher('translateX', 1, false, true, {px: 0}),
  buildMatcher('translateY', 1, false, true, {px: 0}),
  buildMatcher('translateZ', 1, false, true, {px: 0}),
  buildMatcher('translate', 1, true, true, {px: 0}),
  buildMatcher('translate3d', 3, false, true),
  buildMatcher('scale', 1, true, false, 'copy'),
  buildMatcher('scaleX', 1, false, false, 1),
  buildMatcher('scaleY', 1, false, false, 1),
  buildMatcher('scaleZ', 1, false, false, 1),
  buildMatcher('scale3d', 3, false, false),
  buildMatcher('perspective', 1, false, true),
  buildMatcher('matrix', 6, false, false)
];

var decomposeMatrix = (function() {
  // this is only ever used on the perspective matrix, which has 0, 0, 0, 1 as
  // last column
  
  function determinant(m) {
    return m[0][0] * m[1][1] * m[2][2] +
           m[1][0] * m[2][1] * m[0][2] +
           m[2][0] * m[0][1] * m[1][2] -
           m[0][2] * m[1][1] * m[2][0] -
           m[1][2] * m[2][1] * m[0][0] -
           m[2][2] * m[0][1] * m[1][0];
  }

  // this is only ever used on the perspective matrix, which has 0, 0, 0, 1 as
  // last column
  //
  // from Wikipedia:
  //
  // [A B]^-1 = [A^-1 + A^-1B(D - CA^-1B)^-1CA^-1     -A^-1B(D - CA^-1B)^-1]
  // [C D]      [-(D - CA^-1B)^-1CA^-1                (D - CA^-1B)^-1      ]
  //
  // Therefore
  //
  // [A [0]]^-1 = [A^-1       [0]]
  // [C  1 ]      [ -CA^-1     1 ]
  function inverse(m) {
    var iDet = 1 / determinant(m);
    var a = m[0][0], b = m[0][1], c = m[0][2];
    var d = m[1][0], e = m[1][1], f = m[1][2];
    var g = m[2][0], h = m[2][1], k = m[2][2];
    var Ainv = [
      [(e * k - f * h) * iDet, (c * h - b * k) * iDet,
       (b * f - c * e) * iDet, 0],
      [(f * g - d * k) * iDet, (a * k - c * g) * iDet,
       (c * d - a * f) * iDet, 0],
      [(d * h - e * g) * iDet, (g * b - a * h) * iDet,
       (a * e - b * d) * iDet, 0]
    ];
    var lastRow = [];
    for (var i = 0; i < 3; i++) {
      var val = 0;
      for (var j = 0; j < 3; j++) {
        val += m[3][j] * Ainv[j][i];
      }
      lastRow.push(val);
    }
    lastRow.push(1);
    Ainv.push(lastRow);
    return Ainv;
  }

  function transposeMatrix4(m) {
    return [[m[0][0], m[1][0], m[2][0], m[3][0]],
            [m[0][1], m[1][1], m[2][1], m[3][1]],
            [m[0][2], m[1][2], m[2][2], m[3][2]],
            [m[0][3], m[1][3], m[2][3], m[3][3]]];
  }

  function multVecMatrix(v, m) {
    var result = [];
    for (var i = 0; i < 4; i++) {
      var val = 0;
      for (var j = 0; j < 4; j++) {
        val += v[j] * m[j][i];
      }
      result.push(val);
    }
    return result;
  }

  function normalize(v) {
    var len = length(v);
    return [v[0] / len, v[1] / len, v[2] / len];
  }

  function length(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  }

  function combine(v1, v2, v1s, v2s) {
    return [v1s * v1[0] + v2s * v2[0], v1s * v1[1] + v2s * v2[1],
            v1s * v1[2] + v2s * v2[2]];
  }

  function cross(v1, v2) {
    return [v1[1] * v2[2] - v1[2] * v2[1],
            v1[2] * v2[0] - v1[0] * v2[2],
            v1[0] * v2[1] - v1[1] * v2[0]];
  }

  function decomposeMatrix(matrix) {
    var m3d = [[matrix[0], matrix[1], 0, 0],
               [matrix[2], matrix[3], 0, 0],
               [0, 0, 1, 0],
               [matrix[4], matrix[5], 0, 1]];

    // skip normalization step as m3d[3][3] should always be 1
    if (m3d[3][3] !== 1) {
      throw 'attempt to decompose non-normalized matrix';
    }

    var perspectiveMatrix = m3d.concat(); // copy m3d
    for (var i = 0; i < 3; i++) {
      perspectiveMatrix[i][3] = 0;
    }

    if (determinant(perspectiveMatrix) === 0) {
      return false;
    }

    var rhs = [];

    var perspective;
    if (m3d[0][3] !== 0 || m3d[1][3] !== 0 || m3d[2][3] !== 0) {
      rhs.push(m3d[0][3]);
      rhs.push(m3d[1][3]);
      rhs.push(m3d[2][3]);
      rhs.push(m3d[3][3]);

      var inversePerspectiveMatrix = inverse(perspectiveMatrix);
      var transposedInversePerspectiveMatrix =
          transposeMatrix4(inversePerspectiveMatrix);
      perspective = multVecMatrix(rhs, transposedInversePerspectiveMatrix);
    } else {
      perspective = [0, 0, 0, 1];
    }

    var translate = m3d[3].slice(0, 3);

    var row = [];
    row.push(m3d[0].slice(0, 3));
    var scale = [];
    scale.push(length(row[0]));
    row[0] = normalize(row[0]);

    var skew = [];
    row.push(m3d[1].slice(0, 3));
    skew.push(dot(row[0], row[1]));
    row[1] = combine(row[1], row[0], 1.0, -skew[0]);

    scale.push(length(row[1]));
    row[1] = normalize(row[1]);
    skew[0] /= scale[1];

    row.push(m3d[2].slice(0, 3));
    skew.push(dot(row[0], row[2]));
    row[2] = combine(row[2], row[0], 1.0, -skew[1]);
    skew.push(dot(row[1], row[2]));
    row[2] = combine(row[2], row[1], 1.0, -skew[2]);

    scale.push(length(row[2]));
    row[2] = normalize(row[2]);
    skew[1] /= scale[2];
    skew[2] /= scale[2];

    var pdum3 = cross(row[1], row[2]);
    if (dot(row[0], pdum3) < 0) {
      for (var i = 0; i < 3; i++) {
        scale[i] *= -1;
        row[i][0] *= -1;
        row[i][1] *= -1;
        row[i][2] *= -1;
      }
    }

    var t = row[0][0] + row[1][1] + row[2][2] + 1;
    var s;
    var quaternion;

    if (t > 1e-4) {
      s = 0.5 / Math.sqrt(t);
      quaternion = [
        (row[2][1] - row[1][2]) * s,
        (row[0][2] - row[2][0]) * s,
        (row[1][0] - row[0][1]) * s,
        0.25 / s
      ];
    } else if (row[0][0] > row[1][1] && row[0][0] > row[2][2]) {
      s = Math.sqrt(1 + row[0][0] - row[1][1] - row[2][2]) * 2.0;
      quaternion = [
        0.25 * s,
        (row[0][1] + row[1][0]) / s,
        (row[0][2] + row[2][0]) / s,
        (row[2][1] - row[1][2]) / s
      ];
    } else if (row[1][1] > row[2][2]) {
      s = Math.sqrt(1.0 + row[1][1] - row[0][0] - row[2][2]) * 2.0;
      quaternion = [
        (row[0][1] + row[1][0]) / s,
        0.25 * s,
        (row[1][2] + row[2][1]) / s,
        (row[0][2] - row[2][0]) / s
      ];
    } else {
      s = Math.sqrt(1.0 + row[2][2] - row[0][0] - row[1][1]) * 2.0;
      quaternion = [
        (row[0][2] + row[2][0]) / s,
        (row[1][2] + row[2][1]) / s,
        0.25 * s,
        (row[1][0] - row[0][1]) / s
      ];
    }

    return {
      translate: translate, scale: scale, skew: skew,
      quaternion: quaternion, perspective: perspective
    };
  }
  return decomposeMatrix;
})();

function dot(v1, v2) {
  var result = 0;
  for (var i = 0; i < v1.length; i++) {
    result += v1[i] * v2[i];
  }
  return result;
}

function multiplyMatrices(a, b) {
  return [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
          a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
          a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
}

function convertItemToMatrix(item) { // !!!
  switch (item.t) {
    case 'rotate':
      var amount = item.d * Math.PI / 180;
      return [Math.cos(amount), Math.sin(amount),
              -Math.sin(amount), Math.cos(amount), 0, 0];
    case 'scale':
      return [item.d[0], 0, 0, item.d[1], 0, 0];
    // TODO: Work out what to do with non-px values.
    case 'translate':
      return [1, 0, 0, 1, item.d[0].px, item.d[1].px];
    case 'matrix':
      return item.d;
  }
}

function convertToMatrix(transformList) {
  return transformList.map(convertItemToMatrix).reduce(multiplyMatrices);
}

var composeMatrix = (function() {
  function multiply(a, b) {
    var result = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        for (var k = 0; k < 4; k++) {
          result[i][j] += b[i][k] * a[k][j];
        }
      }
    }
    return result;
  }

  function composeMatrix(translate, scale, skew, quat, perspective) {
    var matrix = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];

    for (var i = 0; i < 4; i++) {
      matrix[i][3] = perspective[i];
    }

    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        matrix[3][i] += translate[j] * matrix[j][i];
      }
    }

    var x = quat[0], y = quat[1], z = quat[2], w = quat[3];

    var rotMatrix = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];

    rotMatrix[0][0] = 1 - 2 * (y * y + z * z);
    rotMatrix[0][1] = 2 * (x * y - z * w);
    rotMatrix[0][2] = 2 * (x * z + y * w);
    rotMatrix[1][0] = 2 * (x * y + z * w);
    rotMatrix[1][1] = 1 - 2 * (x * x + z * z);
    rotMatrix[1][2] = 2 * (y * z - x * w);
    rotMatrix[2][0] = 2 * (x * z - y * w);
    rotMatrix[2][1] = 2 * (y * z + x * w);
    rotMatrix[2][2] = 1 - 2 * (x * x + y * y);

    matrix = multiply(matrix, rotMatrix);

    var temp = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    if (skew[2]) {
      temp[2][1] = skew[2];
      matrix = multiply(matrix, temp);
    }

    if (skew[1]) {
      temp[2][1] = 0;
      temp[2][0] = skew[0];
      matrix = multiply(matrix, temp);
    }

    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        matrix[i][j] *= scale[i];
      }
    }

    return {t: 'matrix', d: [matrix[0][0], matrix[0][1],
                             matrix[1][0], matrix[1][1],
                             matrix[3][0], matrix[3][1]]};
  }
  return composeMatrix;
})();

function interpolateTransformsWithMatrices(from, to, f) {
  var fromM = decomposeMatrix(convertToMatrix(from));
  var toM = decomposeMatrix(convertToMatrix(to));

  var product = dot(fromM.quaternion, toM.quaternion);
  product = clamp(product, -1.0, 1.0);

  var quat = [];
  if (product === 1.0) {
    quat = fromM.quaternion;
  } else {
    var theta = Math.acos(product);
    var w = Math.sin(f * theta) * 1 / Math.sqrt(1 - product * product);

    for (var i = 0; i < 4; i++) {
      quat.push(fromM.quaternion[i] * (Math.cos(f * theta) - product * w) +
                toM.quaternion[i] * w);
    }
  }

  var translate = interp(fromM.translate, toM.translate, f);
  var scale = interp(fromM.scale, toM.scale, f);
  var skew = interp(fromM.skew, toM.skew, f);
  var perspective = interp(fromM.perspective, toM.perspective, f);

  return composeMatrix(translate, scale, skew, quat, perspective);
}

function interpTransformValue(from, to, f) {
  var type = from.t ? from.t : to.t;
  switch (type) {
    // Transforms with unitless parameters.
    case 'rotate':
    case 'rotateX':
    case 'rotateY':
    case 'rotateZ':
    case 'scale':
    case 'scaleX':
    case 'scaleY':
    case 'scaleZ':
    case 'scale3d':
    case 'skew':
    case 'skewX':
    case 'skewY':
    case 'matrix':
      return {t: type, d: interp(from.d, to.d, f, type)}; // are rotate and skew ok here? should be wrapped in an array. and rotate is not unitless...
    default:
      // Transforms with lengthType parameters.
      var result = [];
      var maxVal;
      if (from.d && to.d) {
        maxVal = Math.max(from.d.length, to.d.length);
      } else if (from.d) {
        maxVal = from.d.length;
      } else {
        maxVal = to.d.length;
      }
      for (var j = 0; j < maxVal; j++) {
        var fromVal = from.d ? from.d[j] : {};
        var toVal = to.d ? to.d[j] : {};
        result.push(lengthType.interpolate(fromVal, toVal, f));
      }
      return {t: type, d: result};
  }
}

// The CSSWG decided to disallow scientific notation in CSS property strings
// (see http://lists.w3.org/Archives/Public/www-style/2010Feb/0050.html).
// We need this function to hakonitize all numbers before adding them to
// property strings.
// TODO: Apply this function to all property strings
function n(num) {
  return Number(num).toFixed(4);
}

function T_R_A_N_S_F_O_R_M___T_Y_P_E() {

}



//var transformType = {
var transformType = createObject(Pyon.ValueType, {
  toString: function() {
    return "transformType";
  },
  inverse: function(value) { // KxDx // TODO: SVG mode! see toCssValue // Using numberType not lengthType for transforms and perspective, probably should revert back
    // TODO: fix this :) matrix is way off // need SVG mode! see toCssValue // Using numberType not lengthType for transforms and perspective, probably should revert back
    var delta = this.zero(value);
    var out = [];
    for (var i = 0; i < value.length; i++) {
      ASSERT_ENABLED && assert( value[i].t, 'transform type should be resolved by now');
      
      switch (value[i].t) {
        case 'rotate':
        case 'rotateX':
        case 'rotateY':
        case 'rotateZ':
        case 'skewX':
        case 'skewY':
          out.push({t : value[i].t, d : [numberType.inverse(value[i].d[0])]}); // new style, have to unwrap then re-wrap
          break;
        case 'skew':
          out.push({ t : value[i].t, d : [numberType.inverse(value[i].d[0]), numberType.inverse(value[i].d[1])] });
          break;
        case 'translateX':
        case 'translateY':
        case 'translateZ':
        case 'perspective':
          out.push({t : value[i].t, d : [numberType.inverse(value[i].d[0])]  });
          break;
        case 'translate':
         out.push({t : value[i].t, d : [{px : numberType.inverse(value[i].d[0].px)}, {px : numberType.inverse(value[i].d[1].px)}] });
          break;
        case 'translate3d':
          out.push({t : value[i].t, d : [{px : numberType.inverse(value[i].d[0].px)}, {px : numberType.inverse(value[i].d[1].px)}, {px : numberType.inverse(value[i].d[2].px)}   ] });
          break;
        case 'scale':
          out.push({ t : value[i].t, d : [delta[i].d[0]/value[i].d[0], delta[i].d[1]/value[i].d[1]] }); // inverse of 2 is 1/2
          break;
        case 'scaleX':
        case 'scaleY':
        case 'scaleZ':
          out.push({t : value[i].t, d : [ delta[i].d[0]/value[i].d[0]]}); // inverse of 2 is 1/2
          break;
        case 'scale3d':
          out.push({ t : value[i].t, d : [ delta[i].d[0]/value[i].d[0], delta[i].d[1]/value[i].d[1], -1/value[i].d[2]] }); // inverse of 2 is 1/2
          break;
        case 'matrix':
          out.push({ t : value[i].t, d : [numberType.inverse(value[i].d[0]), numberType.inverse(value[i].d[1]), numberType.inverse(value[i].d[2]), numberType.inverse(value[i].d[3]), numberType.inverse(value[i].d[4]), numberType.inverse(value[i].d[5])] });
          break;
      }
    }
    return out;
  },
  
  add: function(base, delta) {
    if (!base) { // This happens often...
      //throw("transformType add with no base!");
      base = [];
    }
    var baseLength = base.length;
    var deltaLength = delta.length;
    
    if (baseLength && deltaLength && baseLength >= deltaLength) {
      var diff = baseLength - deltaLength;
      var out = [];
      var match = true;
      var j = 0;
      for (var i = diff; i < baseLength; i++) {
        if (base[i].t != delta[j].t) {
        match = false;
        break;
      }
        j++;
      }
      if (match) return this.sum(base,delta);
    }
    return base.concat(delta); 
  },
  
  
  sum: function(value,delta) { // add is for the full values, sum is for their components // need SVG mode! see toCssValue // Using numberType not lengthType for transforms and perspective, probably should revert back
    // TODO: fix this :) matrix is way off // need SVG mode! see toCssValue // Using numberType not lengthType for transforms and perspective, probably should revert back
    var out = [];
    var valueLength = value.length;
    var deltaLength = delta.length;
    var diff = valueLength-deltaLength;
    var j = 0;
    for (var i = 0; i < valueLength; i++) {
      ASSERT_ENABLED && assert(value[i].t, 'transform type should be resolved by now');
      if (i < diff) {
        out.push(value[i])
      } else {
        switch (value[i].t) {
          // TODO: rotate3d(1, 2.0, 3.0, 10deg);
          case 'rotate':
          case 'rotateX':
          case 'rotateY':
          case 'rotateZ':
          case 'skewX':
          case 'skewY':
            out.push({t : value[i].t, d : [numberType.add(value[i].d[0],delta[j].d[0])]}); // new style, have to unwrap then re-wrap
            break;
          case 'skew':
            out.push({ t : value[i].t, d : [numberType.add(value[i].d[0],delta[j].d[0]), numberType.add(value[i].d[1],delta[j].d[1])] });
            break;
          case 'translateX':
          case 'translateY':
          case 'translateZ':
          case 'perspective':
            out.push({t : value[i].t, d : [numberType.add(value[i].d[0],delta[j].d[0])]  });
            break;
          case 'translate': 
            out.push({t : value[i].t, d : [{px : numberType.add(value[i].d[0].px,delta[j].d[0].px)}, {px : numberType.add(value[i].d[1].px,delta[j].d[1].px)}] });
            break;
          case 'translate3d':
            out.push({t : value[i].t, d : [{px : numberType.add(value[i].d[0].px,delta[j].d[0].px)}, {px : numberType.add(value[i].d[1].px,delta[j].d[1].px)}, {px : numberType.add(value[i].d[2].px,delta[j].d[2].px)}   ] });
            break;
          case 'scale':
            out.push({ t : value[i].t, d : [value[i].d[0] * delta[j].d[0], value[i].d[1] * delta[j].d[1]] });
            break;
          case 'scaleX':
          case 'scaleY':
          case 'scaleZ':
            out.push({t : value[i].t, d : [value[i].d[0] * delta[j].d[0]]});
            break;
          case 'scale3d':
            out.push({ t : value[i].t, d : [value[i].d[0] * delta[j].d[0], value[i].d[1] * delta[j].d[1], value[i].d[2] * delta[j].d[2]] });
            break;
          case 'matrix':
            out.push({ t : value[i].t, d : [numberType.add(value[i].d[0],delta[j].d[0]), numberType.add(value[i].d[1],delta[j].d[1]), numberType.add(value[i].d[2],delta[j].d[2]), numberType.add(value[i].d[3],delta[j].d[3]), numberType.add(value[i].d[4],delta[j].d[4]), numberType.add(value[i].d[5],delta[j].d[5])] });
            break;
          case "matrix3d":
            console.warn("TransformType sum matrix3d not supported");
          default:
            throw new Error("TransformType sum no type?");
        }
        j++;
      }
    }
    return out;
  },
  
  zero: function(value) { // KxDx // requires an old value for type // need SVG mode! see toCssValue // Using numberType not lengthType for transforms and perspective, probably should revert back
    // TODO: fix this :) matrix is way off // need SVG mode! see toCssValue // Using numberType not lengthType for transforms and perspective, probably should revert back
    var identity2dMatrix = [1, 0, 0, 1, 0 ,0];
    if (!value) return [{ t : "matrix", d : identity2dMatrix }];
    var out = [];
    //var i = 0;
    for (var i = 0; i < value.length; i++) {
      ASSERT_ENABLED && assert(
          value[i].t, 'transform type should be resolved by now');
      
      switch (value[i].t) {
        // TODO: rotate3d(1, 2.0, 3.0, 10deg);
        case 'rotate':
        case 'rotateX':
        case 'rotateY':
        case 'rotateZ':
        case 'skewX':
        case 'skewY':
          out.push({t : value[i].t, d : [0]}); // new style
          break;
        case 'skew':
          out.push({ t : value[i].t, d : [0,0] });
          break;
        case 'translateX':
        case 'translateY':
        case 'translateZ':
        case 'perspective':
          out.push({t : value[i].t, d : [0]  });
          break;
        case 'translate':
          out.push({t : value[i].t, d : [{px : 0}, {px : 0}] });
          break;
        case 'translate3d':
          out.push({t : value[i].t, d : [{px : 0}, {px : 0}, {px : 0}   ] });
          break;
        case 'scale':
          out.push({ t : value[i].t, d : [1, 1] });
          break;
        case 'scaleX':
        case 'scaleY':
        case 'scaleZ':
          out.push({t : value[i].t, d : [1]});
          break;
        case 'scale3d':
          out.push({ t : value[i].t, d : [1, 1, 1] });
          break;
        case 'matrix':
          out.push({ t : value[i].t, d : identity2dMatrix });
          break;
      }
    }
    return out;
  },
  
  
  
  subtract: function(base,delta) {
    var inverse = this.inverse(delta);
    return this.add(base,inverse);
  },
  
  
  interpolate: function(from, to, f) {
    var out = [];
    for (var i = 0; i < Math.min(from.length, to.length); i++) {
      if (from[i].t !== to[i].t) {
        break;
      }
      out.push(interpTransformValue(from[i], to[i], f));
    }
    if (i < Math.min(from.length, to.length)) {
      out.push(interpolateTransformsWithMatrices(from.slice(i), to.slice(i), f));
      return out;
    }

    for (; i < from.length; i++) {
      out.push(interpTransformValue(from[i], {t: null, d: null}, f));
    }
    for (; i < to.length; i++) {
      out.push(interpTransformValue({t: null, d: null}, to[i], f));
    }
    return out;
  },
  
  toCssValue: function(value, svgMode) {
    // TODO: fix this :)
    var out = '';
    for (var i = 0; i < value.length; i++) {
      ASSERT_ENABLED && assert( value[i].t, 'transform type should be resolved by now');
          
      switch (value[i].t) {
        // TODO: rotate3d(1, 2.0, 3.0, 10deg);
        case 'rotate':
        case 'rotateX':
        case 'rotateY':
        case 'rotateZ':
        case 'skewX':
        case 'skewY':
          var unit = svgMode ? '' : 'deg';
          out += value[i].t + '(' + value[i].d[0] + unit + ') '; // modified. value[i].d is wrapped in an array, converting array to string worked previously but this is correct. If you don't like it, fix fromCssValue and change inverse, sum, and zero
          break;
        case 'skew':
          var unit = svgMode ? '' : 'deg';
          out += value[i].t + '(' + value[i].d[0] + unit;
          if (value[i].d[1] === 0) {
            out += ') ';
          } else {
            out += ', ' + value[i].d[1] + unit + ') ';
          }
          break;
        case 'translateX':
        case 'translateY':
        case 'translateZ':
        case 'perspective':
          out += value[i].t + '(' + lengthType.toCssValue(value[i].d[0]) +
              ') ';
          break;
        case 'translate':
          if (svgMode) {
            if (value[i].d[1] === undefined) {
              out += value[i].t + '(' + value[i].d[0].px + ') ';
            } else {
              out += value[i].t + '(' + value[i].d[0].px + ', ' + value[i].d[1].px + ') ';
            }
            break;
          }
          if (value[i].d[1] === undefined) {
            out += value[i].t + '(' + lengthType.toCssValue(value[i].d[0]) + ') ';
          } else {
            out += value[i].t + '(' + lengthType.toCssValue(value[i].d[0]) + ', ' + lengthType.toCssValue(value[i].d[1]) + ') ';
          }
          break;
        case 'translate3d':
          var values = value[i].d.map(lengthType.toCssValue);
          out += value[i].t + '(' + values[0] + ', ' + values[1] + ', ' + values[2] + ') ';
          break;
        case 'scale':
          if (value[i].d[0] === value[i].d[1]) {
            out += value[i].t + '(' + value[i].d[0] + ') ';
          } else {
            out += value[i].t + '(' + value[i].d[0] + ', ' + value[i].d[1] + ') ';
          }
          break;
        case 'scaleX':
        case 'scaleY':
        case 'scaleZ':
          out += value[i].t + '(' + value[i].d[0] + ') ';
          break;
        case 'scale3d':
          out += value[i].t + '(' + value[i].d[0] + ', ' +
          value[i].d[1] + ', ' + value[i].d[2] + ') ';
          break;
        case 'matrix':
          out += value[i].t + '(' +
          n(value[i].d[0]) + ', ' + n(value[i].d[1]) + ', ' +
          n(value[i].d[2]) + ', ' + n(value[i].d[3]) + ', ' +
          n(value[i].d[4]) + ', ' + n(value[i].d[5]) + ') ';
          break;
      }
    }
    return out.substring(0, out.length - 1);
  },
  
  fromCssValue: function(value) {
    // TODO: fix this :)
    // TODO: need rotate3d(1, 2.0, 3.0, 10deg);
    // TODO: still need matrix3d
    if (value === undefined) {
      return undefined;
    }
    var result = [];
    while (value.length > 0) {
      var r;
      for (var i = 0; i < transformREs.length; i++) {
        var reSpec = transformREs[i];
        r = reSpec[0].exec(value);
        if (r) {
          result.push({t: reSpec[2], d: reSpec[1](r)});
          value = value.substring(r[0].length);
          break;
        }
      }
      if (!isDefinedAndNotNull(r)) {
        return result;
      }
    }
    return result;
  }
});

var propertyTypes = {
  backgroundColor: colorType,
  backgroundPosition: positionListType,
  borderBottomColor: colorType,
  borderBottomLeftRadius: percentLengthType,
  borderBottomRightRadius: percentLengthType,
  borderBottomWidth: lengthType,
  borderLeftColor: colorType,
  borderLeftWidth: lengthType,
  borderRightColor: colorType,
  borderRightWidth: lengthType,
  borderSpacing: lengthType,
  borderTopColor: colorType,
  borderTopLeftRadius: percentLengthType,
  borderTopRightRadius: percentLengthType,
  borderTopWidth: lengthType,
  bottom: percentLengthAutoType,
  boxShadow: shadowType,
  clip: typeWithKeywords(['auto'], rectangleType),
  color: colorType,
  cx: lengthType,

  // TODO: Handle these keywords properly.
  fontSize: typeWithKeywords(['smaller', 'larger'], percentLengthType),
  fontWeight: typeWithKeywords(['lighter', 'bolder'], fontWeightType),

  height: percentLengthAutoType,
  left: percentLengthAutoType,
  letterSpacing: typeWithKeywords(['normal'], lengthType),
  lineHeight: percentLengthType, // TODO: Should support numberType as well.
  marginBottom: lengthAutoType,
  marginLeft: lengthAutoType,
  marginRight: lengthAutoType,
  marginTop: lengthAutoType,
  maxHeight: typeWithKeywords(
      ['none', 'max-content', 'min-content', 'fill-available', 'fit-content'],
      percentLengthType),
  maxWidth: typeWithKeywords(
      ['none', 'max-content', 'min-content', 'fill-available', 'fit-content'],
      percentLengthType),
  minHeight: typeWithKeywords(
      ['max-content', 'min-content', 'fill-available', 'fit-content'],
      percentLengthType),
  minWidth: typeWithKeywords(
      ['max-content', 'min-content', 'fill-available', 'fit-content'],
      percentLengthType),
  opacity: numberType,
  outlineColor: typeWithKeywords(['invert'], colorType),
  outlineOffset: lengthType,
  outlineWidth: lengthType,
  paddingBottom: lengthType,
  paddingLeft: lengthType,
  paddingRight: lengthType,
  paddingTop: lengthType,
  right: percentLengthAutoType,
  textIndent: typeWithKeywords(['each-line', 'hanging'], percentLengthType),
  textShadow: shadowType,
  top: percentLengthAutoType,
  transform: transformType,
  WebkitTransform: transformType, // React?
  webkitTransform: transformType, // temporary
  msTransform: transformType, // temporary
  
  verticalAlign: typeWithKeywords([
    'baseline',
    'sub',
    'super',
    'text-top',
    'text-bottom',
    'middle',
    'top',
    'bottom'
  ], percentLengthType),
  visibility: visibilityType,
  width: typeWithKeywords([
    'border-box',
    'content-box',
    'auto',
    'max-content',
    'min-content',
    'available',
    'fit-content'
  ], percentLengthType),
  wordSpacing: typeWithKeywords(['normal'], percentLengthType),
  x: lengthType,
  y: lengthType,
  zIndex: typeWithKeywords(['auto'], integerType)
};

var svgProperties = {
  'cx': 1,
  'width': 1,
  'x': 1,
  'y': 1
};

var borderWidthAliases = {
  initial: '3px',
  thin: '1px',
  medium: '3px',
  thick: '5px'
};

var propertyValueAliases = {
  backgroundColor: { initial: 'transparent' },
  backgroundPosition: { initial: '0% 0%' },
  borderBottomColor: { initial: 'currentColor' },
  borderBottomLeftRadius: { initial: '0px' },
  borderBottomRightRadius: { initial: '0px' },
  borderBottomWidth: borderWidthAliases,
  borderLeftColor: { initial: 'currentColor' },
  borderLeftWidth: borderWidthAliases,
  borderRightColor: { initial: 'currentColor' },
  borderRightWidth: borderWidthAliases,
  // Spec says this should be 0 but in practise it is 2px.
  borderSpacing: { initial: '2px' },
  borderTopColor: { initial: 'currentColor' },
  borderTopLeftRadius: { initial: '0px' },
  borderTopRightRadius: { initial: '0px' },
  borderTopWidth: borderWidthAliases,
  bottom: { initial: 'auto' },
  clip: { initial: 'rect(0px, 0px, 0px, 0px)' },
  color: { initial: 'black' }, // Depends on user agent.
  fontSize: {
    initial: '100%',
    'xx-small': '60%',
    'x-small': '75%',
    'small': '89%',
    'medium': '100%',
    'large': '120%',
    'x-large': '150%',
    'xx-large': '200%'
  },
  fontWeight: {
    initial: '400',
    normal: '400',
    bold: '700'
  },
  height: { initial: 'auto' },
  left: { initial: 'auto' },
  letterSpacing: { initial: 'normal' },
  lineHeight: {
    initial: '120%',
    normal: '120%'
  },
  marginBottom: { initial: '0px' },
  marginLeft: { initial: '0px' },
  marginRight: { initial: '0px' },
  marginTop: { initial: '0px' },
  maxHeight: { initial: 'none' },
  maxWidth: { initial: 'none' },
  minHeight: { initial: '0px' },
  minWidth: { initial: '0px' },
  opacity: { initial: '1.0' },
  outlineColor: { initial: 'invert' },
  outlineOffset: { initial: '0px' },
  outlineWidth: borderWidthAliases,
  paddingBottom: { initial: '0px' },
  paddingLeft: { initial: '0px' },
  paddingRight: { initial: '0px' },
  paddingTop: { initial: '0px' },
  right: { initial: 'auto' },
  textIndent: { initial: '0px' },
  textShadow: {
    initial: '0px 0px 0px transparent',
    none: '0px 0px 0px transparent'
  },
  top: { initial: 'auto' },
  transform: {
    initial: "matrix(1, 0, 0, 1, 0, 0)",
    none: "matrix(1, 0, 0, 1, 0, 0)"
  },
  verticalAlign: { initial: '0px' },
  visibility: { initial: 'visible' },
  width: { initial: 'auto' },
  wordSpacing: { initial: 'normal' },
  zIndex: { initial: 'auto' }
};

var propertyIsSVGAttrib = function(property, target) {
  return target.namespaceURI === 'http://www.w3.org/2000/svg' &&
      property in svgProperties;
};

var getType = function(property) {
  return propertyTypes[property] || nonNumericType;
};
var getCssOnlyType = function(property) {
  return propertyTypes[property] || nonNumericType;
};



var add = function(property, base, delta, typeObject) { // Called from AddReplaceCompositableValue compositeOnto // transform is an array of rawValues, borderTopWidth is a rawValue, opacity is just a number
  if (delta === rawNeutralValue) return base;
  if (base === 'inherit' || delta === 'inherit') return nonNumericType.add(base, delta);
  return typeObject.add(base, delta);

};


/**
 * Interpolate the given property name (f*100)% of the way from 'from' to 'to'.
 * 'from' and 'to' are both raw values already converted from CSS value
 * strings. Requires the target element to be able to determine whether the
 * given property is an SVG attribute or not, as this impacts the conversion of
 * the interpolated value back into a CSS value string for transform
 * translations.
 *
 * e.g. interpolate('transform', 'rotate(40deg)', 'rotate(50deg)', 0.3);
 *   will return 'rotate(43deg)'.
 */
var interpolate = function(property, from, to, f) { // getType problem. values are rawValues not cssValues. Only works because property. Arbitrary types will fail. Called from BlendedCompositableValue compositeOnto:
  ASSERT_ENABLED && assert(isDefinedAndNotNull(from) && isDefinedAndNotNull(to), 'Both to and from values should be specified for interpolation');
  if (from === 'inherit' || to === 'inherit') {
    return nonNumericType.interpolate(from, to, f);
  }
  if (f === 0) {
    return from;
  }
  if (f === 1) {
    return to;
  }
  return getType(property,to).interpolate(from, to, f); // to is a rawValue, not CSS value. will work for numbers but not arrays or objects
};


/**
 * Convert the provided interpolable value for the provided property to a CSS
 * value string. Note that SVG transforms do not require units for translate
 * or rotate values while CSS properties require 'px' or 'deg' units.
 */
var toCssValue = function(property, value, svgMode) {
  if (value === 'inherit') return value;
  return getCssOnlyType(property,value).toCssValue(value, svgMode);
};

var fromCssValue = function(property, cssValue) {
  if (cssValue === cssNeutralValue) return rawNeutralValue;
  if (cssValue === 'inherit') return value;
  if (property in propertyValueAliases && cssValue in propertyValueAliases[property]) {
    cssValue = propertyValueAliases[property][cssValue];
  }
  var result = getType(property,cssValue).fromCssValue(cssValue);
  // Currently we'll hit this assert if input to the API is bad. To avoid this,
  // we should eliminate invalid values when normalizing the list of keyframes.
  // See the TODO in isSupportedPropertyValue().
  ASSERT_ENABLED && assert(isDefinedAndNotNull(result), 'Invalid property value "' + cssValue + '" for property "' + property + '"');
  return result;
};

// Sentinel values
var cssNeutralValue = {};
var rawNeutralValue = {};





/*
addStyleAnimation
styleAnimationNamed
removeStyleAnimation
removeAllStyleAnimations
styleAnimations
styleAnimationNames
presentationStyle
modelStyle
*/

/*
window.Element.prototype.hypermatic = hypermatic;
window.Element.prototype.hyperAnimate = hypermatic;
window.Element.prototype.hyperStyle = hypermatic;
window.Element.prototype.hyperAnimateStyle = hypermatic;

window.Element.prototype.hyperPlayer = function() {
  var player = this._hyperPlayer;
  if (player === undefined) {
    player = new Player(PRIVATE, HYPERMATIC_TIMELINE, this);
    this._hyperPlayer = player;
  }
  return player;
}
  

window.Element.prototype.hyperDefaultAnimations = function() {
  var animations = this._hyperDefaultAnimations;
  if (!animations) return {};
  return animations;
}
window.Element.prototype.setHyperDefaultAnimations = function(animations) {
  this._hyperDefaultAnimations = animations;
  ensureTargetCSSInitialized(this); 
}
window.Element.prototype.hyperAnimationDelegate = function() {
  // this should be a property
  return this._hyperAnimationDelegate;
}
window.Element.prototype.setHyperAnimationDelegate = function(delegate) { 
  // this should be a property
  if (isFunction(delegate.hyperAnimationForKey)) {
    this._hyperAnimationDelegate = delegate;
    ensureTargetCSSInitialized(this); 
  } else {
    console.warn("must implement hyperAnimationForKey");
  }
}

var hyperAnimations = function() {
  return this.hyperPlayer()._animations.slice(0);
}  
var hyperStyleAnimations = function() {
  return this.hyperPlayer()._animations.slice(0);
};
var hyperStateAnimations = function() {
  return this.hyperPlayer()._animations.slice(0);
};

window.Element.prototype.hyperAnimations = hyperAnimations;
window.Element.prototype.hyperStyleAnimations = hyperAnimations;

window.Element.prototype.removeAllHyperAnimations = function() {

}

var hyperAnimationNamed = function(key) {
  var animation = this.hyperPlayer()._animationNamed(key);
  if (animation) return kxdxAnimationFromDescription(animation.settings);
  return null;
}
window.Element.prototype.hyperAnimationNamed = hyperAnimationNamed;

window.Element.prototype.hyperRemoveAnimationNamed = function(key) {
  return this.hyperPlayer()._removeAnimationNamed(key);
}

*/
  
  
  PyonStyle.noConflict = function() {
    root.PyonStyle = previousPyonStyle;
    return PyonStyle;
  }
  if (typeof exports !== "undefined") { // http://www.richardrodger.com/2013/09/27/how-to-make-simple-node-js-modules-work-in-the-browser/
    if (typeof module !== "undefined" && module.exports) exports = module.exports = PyonStyle;
    exports.PyonStyle = PyonStyle;
  } else root.PyonStyle = PyonStyle;
  
}).call(this);