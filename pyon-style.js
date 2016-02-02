/**
 * Copyright 2016 Kevin Doughty. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *		 http://www.apache.org/licenses/LICENSE-2.0
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
 *		 http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
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