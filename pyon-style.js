"use strict";
;(function() {

  var root = this;
  var previousPyon = root.PyonStyle;
  var hasRequire = (typeof require !== "undefined");
  
  var Pyon = root.Pyon || hasRequire && require("pyon");
  if (typeof Pyon === "undefined") throw new Error("Pyon Style requires regular Pyon. If you are using script tags Pyon must come first.");
  
  var PyonStyle = root.PyonStyle = {};
  
  
  
  
  PyonStyle.noConflict = function() {
    root.PyonStyle = previousPyonStyle;
    return PyonStyle;
  }
  if (typeof exports !== "undefined") { // http://www.richardrodger.com/2013/09/27/how-to-make-simple-node-js-modules-work-in-the-browser/#.VpuIsTZh2Rs
    if (typeof module !== "undefined" && module.exports) exports = module.exports = PyonStyle;
    exports.PyonStyle = PyonStyle;
  } else root.PyonStyle = PyonStyle;
  
}).call(this);