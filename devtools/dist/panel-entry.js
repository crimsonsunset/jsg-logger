import { options, render } from "preact";
import { defaultTheme, ThemeProvider } from "evergreen-ui";
import { useState, useEffect } from "preact/hooks";
var f = 0;
function u(e, t, n, o, i, u2) {
  t || (t = {});
  var a, c, p = t;
  if ("ref" in p) for (c in p = {}, t) "ref" == c ? a = t[c] : p[c] = t[c];
  var l = { type: e, props: p, key: n, ref: a, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f, __i: -1, __u: 0, __source: i, __self: u2 };
  if ("function" == typeof e && (a = e.defaultProps)) for (c in a) void 0 === p[c] && (p[c] = a[c]);
  return options.vnode && options.vnode(l), l;
}
function FloatingButton({ onClick, isActive, logCount = 0 }) {
  const buttonStyle = {
    position: "fixed",
    top: "50%",
    left: "20px",
    transform: "translateY(-50%)",
    width: "48px",
    height: "48px",
    borderRadius: "24px",
    backgroundColor: isActive ? "#4A90E2" : "#2C3E50",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    zIndex: "999999",
    pointerEvents: "all",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    color: "white",
    fontFamily: "system-ui, -apple-system, sans-serif",
    outline: "none"
  };
  const hoverStyle = {
    ...buttonStyle,
    transform: "translateY(-50%) scale(1.1)",
    backgroundColor: isActive ? "#5BA0F2" : "#34495E"
  };
  const badgeStyle = {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    backgroundColor: "#E74C3C",
    color: "white",
    borderRadius: "10px",
    fontSize: "10px",
    fontWeight: "bold",
    padding: "2px 6px",
    minWidth: "16px",
    textAlign: "center",
    display: logCount > 0 ? "block" : "none"
  };
  return /* @__PURE__ */ u(
    "button",
    {
      style: buttonStyle,
      onClick,
      onMouseEnter: (e) => Object.assign(e.target.style, hoverStyle),
      onMouseLeave: (e) => Object.assign(e.target.style, buttonStyle),
      title: "JSG Logger DevTools",
      children: [
        "🎛️",
        logCount > 0 && /* @__PURE__ */ u("span", { style: badgeStyle, children: logCount > 999 ? "999+" : logCount.toString() })
      ]
    }
  );
}
function ComponentFilters({ components, loggerControls, onToggle }) {
  const [componentStates, setComponentStates] = useState({});
  useEffect(() => {
    const states = {};
    components.forEach((name) => {
      var _a;
      const level = (_a = loggerControls.getLevel) == null ? void 0 : _a.call(loggerControls, name);
      states[name] = level !== "silent";
    });
    setComponentStates(states);
  }, [components, loggerControls]);
  const handleToggle = (componentName) => {
    var _a;
    const currentLevel = (_a = loggerControls.getLevel) == null ? void 0 : _a.call(loggerControls, componentName);
    const isCurrentlyOn = currentLevel !== "silent";
    setComponentStates((prev) => ({
      ...prev,
      [componentName]: !isCurrentlyOn
    }));
    onToggle(componentName, currentLevel);
  };
  const sectionStyle = {
    marginBottom: "24px"
  };
  const sectionTitleStyle = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#CCCCCC",
    marginBottom: "12px",
    borderBottom: "1px solid #333",
    paddingBottom: "8px"
  };
  const componentItemStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #2A2A2A"
  };
  const componentNameStyle = {
    fontSize: "13px",
    color: "#E0E0E0",
    fontFamily: "monospace"
  };
  const toggleStyle = (isOn) => ({
    width: "40px",
    height: "20px",
    borderRadius: "10px",
    backgroundColor: isOn ? "#4A90E2" : "#444",
    border: "none",
    cursor: "pointer",
    position: "relative",
    transition: "background-color 0.2s ease"
  });
  const toggleKnobStyle = (isOn) => ({
    position: "absolute",
    top: "2px",
    left: isOn ? "22px" : "2px",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor: "white",
    transition: "left 0.2s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
  });
  const statusTextStyle = (isOn) => ({
    fontSize: "11px",
    color: isOn ? "#4A90E2" : "#888",
    marginLeft: "8px",
    minWidth: "30px"
  });
  if (components.length === 0) {
    return /* @__PURE__ */ u("div", { style: sectionStyle, children: [
      /* @__PURE__ */ u("h3", { style: sectionTitleStyle, children: "📦 Components" }),
      /* @__PURE__ */ u("div", { style: { color: "#888", fontStyle: "italic" }, children: "No components detected" })
    ] });
  }
  return /* @__PURE__ */ u("div", { style: sectionStyle, children: [
    /* @__PURE__ */ u("h3", { style: sectionTitleStyle, children: "📦 Components" }),
    components.map((componentName) => {
      const isOn = componentStates[componentName] ?? true;
      return /* @__PURE__ */ u("div", { style: componentItemStyle, children: [
        /* @__PURE__ */ u("span", { style: componentNameStyle, children: componentName }),
        /* @__PURE__ */ u("div", { style: { display: "flex", alignItems: "center" }, children: [
          /* @__PURE__ */ u(
            "button",
            {
              style: toggleStyle(isOn),
              onClick: () => handleToggle(componentName),
              title: `Toggle ${componentName} logging`,
              children: /* @__PURE__ */ u("div", { style: toggleKnobStyle(isOn) })
            }
          ),
          /* @__PURE__ */ u("span", { style: statusTextStyle(isOn), children: isOn ? "ON" : "OFF" })
        ] })
      ] }, componentName);
    })
  ] });
}
function GlobalControls({ onDebugAll, onTraceAll, onReset, loggerControls }) {
  var _a, _b;
  const sectionStyle = {
    marginBottom: "24px"
  };
  const sectionTitleStyle = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#CCCCCC",
    marginBottom: "12px",
    borderBottom: "1px solid #333",
    paddingBottom: "8px"
  };
  const buttonRowStyle = {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
    flexWrap: "wrap"
  };
  const buttonStyle = {
    flex: "1",
    minWidth: "80px",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    textAlign: "center"
  };
  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#4A90E2",
    color: "white"
  };
  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#555",
    color: "white"
  };
  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#E74C3C",
    color: "white"
  };
  const statsStyle = {
    backgroundColor: "#2A2A2A",
    padding: "12px",
    borderRadius: "6px",
    marginTop: "12px"
  };
  const statsItemStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 0",
    fontSize: "12px",
    color: "#CCCCCC"
  };
  const handleButtonHover = (e, hoverColor) => {
    e.target.style.backgroundColor = hoverColor;
  };
  const handleButtonLeave = (e, originalColor) => {
    e.target.style.backgroundColor = originalColor;
  };
  const stats = ((_a = loggerControls.getStats) == null ? void 0 : _a.call(loggerControls)) || { total: 0, byLevel: {} };
  const configSummary = ((_b = loggerControls.getConfigSummary) == null ? void 0 : _b.call(loggerControls)) || {};
  return /* @__PURE__ */ u("div", { style: sectionStyle, children: [
    /* @__PURE__ */ u("h3", { style: sectionTitleStyle, children: "🌐 Global Controls" }),
    /* @__PURE__ */ u("div", { style: buttonRowStyle, children: [
      /* @__PURE__ */ u(
        "button",
        {
          style: primaryButtonStyle,
          onClick: onDebugAll,
          onMouseEnter: (e) => handleButtonHover(e, "#5BA0F2"),
          onMouseLeave: (e) => handleButtonLeave(e, "#4A90E2"),
          title: "Enable debug level for all components",
          children: "Debug All"
        }
      ),
      /* @__PURE__ */ u(
        "button",
        {
          style: primaryButtonStyle,
          onClick: onTraceAll,
          onMouseEnter: (e) => handleButtonHover(e, "#5BA0F2"),
          onMouseLeave: (e) => handleButtonLeave(e, "#4A90E2"),
          title: "Enable trace level for all components",
          children: "Trace All"
        }
      )
    ] }),
    /* @__PURE__ */ u("div", { style: buttonRowStyle, children: [
      /* @__PURE__ */ u(
        "button",
        {
          style: dangerButtonStyle,
          onClick: onReset,
          onMouseEnter: (e) => handleButtonHover(e, "#F85C5C"),
          onMouseLeave: (e) => handleButtonLeave(e, "#E74C3C"),
          title: "Reset all settings to defaults",
          children: "Reset All"
        }
      ),
      /* @__PURE__ */ u(
        "button",
        {
          style: secondaryButtonStyle,
          onClick: () => {
            var _a2;
            const summary = (_a2 = loggerControls.getConfigSummary) == null ? void 0 : _a2.call(loggerControls);
            console.log("[JSG-DEVTOOLS] Current Config:", summary);
            alert("Config exported to console");
          },
          onMouseEnter: (e) => handleButtonHover(e, "#666"),
          onMouseLeave: (e) => handleButtonLeave(e, "#555"),
          title: "Export current configuration to console",
          children: "Export Config"
        }
      )
    ] }),
    /* @__PURE__ */ u("div", { style: statsStyle, children: [
      /* @__PURE__ */ u("div", { style: statsItemStyle, children: [
        /* @__PURE__ */ u("span", { children: "📊 Total Logs:" }),
        /* @__PURE__ */ u("strong", { children: stats.total.toString() })
      ] }),
      stats.byLevel && Object.keys(stats.byLevel).length > 0 && /* @__PURE__ */ u("div", { style: statsItemStyle, children: [
        /* @__PURE__ */ u("span", { children: "📈 By Level:" }),
        /* @__PURE__ */ u("span", { style: { fontSize: "11px", fontFamily: "monospace" }, children: Object.entries(stats.byLevel).map(([level, count]) => `${level}:${count}`).join(" ") })
      ] }),
      configSummary.environment && /* @__PURE__ */ u("div", { style: statsItemStyle, children: [
        /* @__PURE__ */ u("span", { children: "🌍 Environment:" }),
        /* @__PURE__ */ u("strong", { children: configSummary.environment })
      ] }),
      configSummary.fileOverrides && /* @__PURE__ */ u("div", { style: statsItemStyle, children: [
        /* @__PURE__ */ u("span", { children: "📁 File Overrides:" }),
        /* @__PURE__ */ u("strong", { children: configSummary.fileOverrides.toString() })
      ] })
    ] })
  ] });
}
function PanelContainer({
  components,
  loggerControls,
  onComponentToggle,
  onGlobalDebug,
  onGlobalTrace,
  onReset,
  onClose
}) {
  const panelStyle = {
    position: "fixed",
    top: "0",
    left: "0",
    width: "300px",
    height: "100vh",
    backgroundColor: "#1E1E1E",
    color: "#FFFFFF",
    boxShadow: "4px 0 12px rgba(0,0,0,0.5)",
    zIndex: "999998",
    pointerEvents: "all",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "14px",
    overflow: "auto",
    animation: "slideIn 0.3s ease-out"
  };
  const headerStyle = {
    padding: "16px 20px",
    borderBottom: "1px solid #333",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: "0",
    backgroundColor: "#1E1E1E"
  };
  const titleStyle = {
    margin: "0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#4A90E2"
  };
  const closeButtonStyle = {
    background: "none",
    border: "none",
    color: "#888",
    cursor: "pointer",
    fontSize: "20px",
    padding: "4px",
    borderRadius: "4px"
  };
  const contentStyle = {
    padding: "0 20px 20px"
  };
  if (!document.getElementById("jsg-devtools-styles")) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "jsg-devtools-styles";
    styleSheet.textContent = `
            @keyframes slideIn {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); }
                to { transform: translateX(-100%); }
            }
        `;
    document.head.appendChild(styleSheet);
  }
  return /* @__PURE__ */ u("div", { style: panelStyle, children: [
    /* @__PURE__ */ u("div", { style: headerStyle, children: [
      /* @__PURE__ */ u("h2", { style: titleStyle, children: "🎛️ Logger Controls" }),
      /* @__PURE__ */ u(
        "button",
        {
          style: closeButtonStyle,
          onClick: onClose,
          title: "Close panel",
          onMouseEnter: (e) => e.target.style.color = "#FFF",
          onMouseLeave: (e) => e.target.style.color = "#888",
          children: "×"
        }
      )
    ] }),
    /* @__PURE__ */ u("div", { style: contentStyle, children: [
      /* @__PURE__ */ u(
        ComponentFilters,
        {
          components,
          loggerControls,
          onToggle: onComponentToggle
        }
      ),
      /* @__PURE__ */ u(
        GlobalControls,
        {
          onDebugAll: onGlobalDebug,
          onTraceAll: onGlobalTrace,
          onReset,
          loggerControls
        }
      )
    ] })
  ] });
}
function DevToolsPanel({ loggerControls }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [components, setComponents] = useState([]);
  const [loggerStats, setLoggerStats] = useState({ total: 0 });
  useEffect(() => {
    var _a, _b;
    if (loggerControls) {
      const componentList = ((_a = loggerControls.listComponents) == null ? void 0 : _a.call(loggerControls)) || [];
      setComponents(componentList);
      const stats = ((_b = loggerControls.getStats) == null ? void 0 : _b.call(loggerControls)) || { total: 0 };
      setLoggerStats(stats);
      const statsInterval = setInterval(() => {
        var _a2;
        const updatedStats = ((_a2 = loggerControls.getStats) == null ? void 0 : _a2.call(loggerControls)) || { total: 0 };
        setLoggerStats(updatedStats);
      }, 2e3);
      return () => clearInterval(statsInterval);
    }
  }, [loggerControls]);
  const handleTogglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };
  const handleComponentToggle = (componentName, currentLevel) => {
    var _a;
    const newLevel = currentLevel === "silent" ? "info" : "silent";
    (_a = loggerControls.setLevel) == null ? void 0 : _a.call(loggerControls, componentName, newLevel);
    console.log(`[JSG-DEVTOOLS] Toggled ${componentName}: ${currentLevel} → ${newLevel}`);
  };
  const handleGlobalDebug = () => {
    var _a;
    (_a = loggerControls.enableDebugMode) == null ? void 0 : _a.call(loggerControls);
    console.log("[JSG-DEVTOOLS] Enabled debug mode for all components");
  };
  const handleGlobalTrace = () => {
    var _a;
    (_a = loggerControls.enableTraceMode) == null ? void 0 : _a.call(loggerControls);
    console.log("[JSG-DEVTOOLS] Enabled trace mode for all components");
  };
  const handleReset = () => {
    var _a;
    (_a = loggerControls.reset) == null ? void 0 : _a.call(loggerControls);
    console.log("[JSG-DEVTOOLS] Reset all settings to defaults");
  };
  return /* @__PURE__ */ u("div", { children: [
    /* @__PURE__ */ u(
      FloatingButton,
      {
        onClick: handleTogglePanel,
        isActive: isPanelOpen,
        logCount: loggerStats.total
      }
    ),
    isPanelOpen && /* @__PURE__ */ u(
      PanelContainer,
      {
        components,
        loggerControls,
        onComponentToggle: handleComponentToggle,
        onGlobalDebug: handleGlobalDebug,
        onGlobalTrace: handleGlobalTrace,
        onReset: handleReset,
        onClose: () => setIsPanelOpen(false)
      }
    )
  ] });
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var lodash_merge = { exports: {} };
lodash_merge.exports;
(function(module, exports) {
  var LARGE_ARRAY_SIZE = 200;
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  var HOT_COUNT = 800, HOT_SPAN = 16;
  var MAX_SAFE_INTEGER = 9007199254740991;
  var argsTag = "[object Arguments]", arrayTag = "[object Array]", asyncTag = "[object AsyncFunction]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", nullTag = "[object Null]", objectTag = "[object Object]", proxyTag = "[object Proxy]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", undefinedTag = "[object Undefined]", weakMapTag = "[object WeakMap]";
  var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
  var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root = freeGlobal || freeSelf || Function("return this")();
  var freeExports = exports && !exports.nodeType && exports;
  var freeModule = freeExports && true && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var freeProcess = moduleExports && freeGlobal.process;
  var nodeUtil = function() {
    try {
      var types = freeModule && freeModule.require && freeModule.require("util").types;
      if (types) {
        return types;
      }
      return freeProcess && freeProcess.binding && freeProcess.binding("util");
    } catch (e) {
    }
  }();
  var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0:
        return func.call(thisArg);
      case 1:
        return func.call(thisArg, args[0]);
      case 2:
        return func.call(thisArg, args[0], args[1]);
      case 3:
        return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }
  function baseTimes(n, iteratee) {
    var index = -1, result = Array(n);
    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }
  function getValue(object, key) {
    return object == null ? void 0 : object[key];
  }
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }
  var arrayProto = Array.prototype, funcProto = Function.prototype, objectProto = Object.prototype;
  var coreJsData = root["__core-js_shared__"];
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var maskSrcKey = function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
  }();
  var nativeObjectToString = objectProto.toString;
  var objectCtorString = funcToString.call(Object);
  var reIsNative = RegExp(
    "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  );
  var Buffer = moduleExports ? root.Buffer : void 0, Symbol = root.Symbol, Uint8Array = root.Uint8Array;
  Buffer ? Buffer.allocUnsafe : void 0;
  var getPrototype = overArg(Object.getPrototypeOf, Object), objectCreate = Object.create, propertyIsEnumerable = objectProto.propertyIsEnumerable, splice = arrayProto.splice, symToStringTag = Symbol ? Symbol.toStringTag : void 0;
  var defineProperty = function() {
    try {
      var func = getNative(Object, "defineProperty");
      func({}, "", {});
      return func;
    } catch (e) {
    }
  }();
  var nativeIsBuffer = Buffer ? Buffer.isBuffer : void 0, nativeMax = Math.max, nativeNow = Date.now;
  var Map = getNative(root, "Map"), nativeCreate = getNative(Object, "create");
  var baseCreate = /* @__PURE__ */ function() {
    function object() {
    }
    return function(proto) {
      if (!isObject(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object.prototype = proto;
      var result = new object();
      object.prototype = void 0;
      return result;
    };
  }();
  function Hash(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
    this.size = 0;
  }
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? void 0 : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : void 0;
  }
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
  }
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
    return this;
  }
  Hash.prototype.clear = hashClear;
  Hash.prototype["delete"] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;
  function ListCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }
  function listCacheDelete(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }
  function listCacheGet(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    return index < 0 ? void 0 : data[index][1];
  }
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }
  function listCacheSet(key, value) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype["delete"] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;
  function MapCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      "hash": new Hash(),
      "map": new (Map || ListCache)(),
      "string": new Hash()
    };
  }
  function mapCacheDelete(key) {
    var result = getMapData(this, key)["delete"](key);
    this.size -= result ? 1 : 0;
    return result;
  }
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }
  function mapCacheSet(key, value) {
    var data = getMapData(this, key), size = data.size;
    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype["delete"] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;
  function Stack(entries) {
    var data = this.__data__ = new ListCache(entries);
    this.size = data.size;
  }
  function stackClear() {
    this.__data__ = new ListCache();
    this.size = 0;
  }
  function stackDelete(key) {
    var data = this.__data__, result = data["delete"](key);
    this.size = data.size;
    return result;
  }
  function stackGet(key) {
    return this.__data__.get(key);
  }
  function stackHas(key) {
    return this.__data__.has(key);
  }
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache) {
      var pairs = data.__data__;
      if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }
  Stack.prototype.clear = stackClear;
  Stack.prototype["delete"] = stackDelete;
  Stack.prototype.get = stackGet;
  Stack.prototype.has = stackHas;
  Stack.prototype.set = stackSet;
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
    for (var key in value) {
      if (!(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
      (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
      isIndex(key, length)))) {
        result.push(key);
      }
    }
    return result;
  }
  function assignMergeValue(object, key, value) {
    if (value !== void 0 && !eq(object[key], value) || value === void 0 && !(key in object)) {
      baseAssignValue(object, key, value);
    }
  }
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
      baseAssignValue(object, key, value);
    }
  }
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  function baseAssignValue(object, key, value) {
    if (key == "__proto__" && defineProperty) {
      defineProperty(object, key, {
        "configurable": true,
        "enumerable": true,
        "value": value,
        "writable": true
      });
    } else {
      object[key] = value;
    }
  }
  var baseFor = createBaseFor();
  function baseGetTag(value) {
    if (value == null) {
      return value === void 0 ? undefinedTag : nullTag;
    }
    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
  }
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }
  function baseIsTypedArray(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  }
  function baseKeysIn(object) {
    if (!isObject(object)) {
      return nativeKeysIn(object);
    }
    var isProto = isPrototype(object), result = [];
    for (var key in object) {
      if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }
  function baseMerge(object, source, srcIndex, customizer, stack) {
    if (object === source) {
      return;
    }
    baseFor(source, function(srcValue, key) {
      stack || (stack = new Stack());
      if (isObject(srcValue)) {
        baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
      } else {
        var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : void 0;
        if (newValue === void 0) {
          newValue = srcValue;
        }
        assignMergeValue(object, key, newValue);
      }
    }, keysIn);
  }
  function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
    var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
    if (stacked) {
      assignMergeValue(object, key, stacked);
      return;
    }
    var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : void 0;
    var isCommon = newValue === void 0;
    if (isCommon) {
      var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
      newValue = srcValue;
      if (isArr || isBuff || isTyped) {
        if (isArray(objValue)) {
          newValue = objValue;
        } else if (isArrayLikeObject(objValue)) {
          newValue = copyArray(objValue);
        } else if (isBuff) {
          isCommon = false;
          newValue = cloneBuffer(srcValue);
        } else if (isTyped) {
          isCommon = false;
          newValue = cloneTypedArray(srcValue);
        } else {
          newValue = [];
        }
      } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
        newValue = objValue;
        if (isArguments(objValue)) {
          newValue = toPlainObject(objValue);
        } else if (!isObject(objValue) || isFunction(objValue)) {
          newValue = initCloneObject(srcValue);
        }
      } else {
        isCommon = false;
      }
    }
    if (isCommon) {
      stack.set(srcValue, newValue);
      mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
      stack["delete"](srcValue);
    }
    assignMergeValue(object, key, newValue);
  }
  function baseRest(func, start) {
    return setToString(overRest(func, start, identity), func + "");
  }
  var baseSetToString = !defineProperty ? identity : function(func, string) {
    return defineProperty(func, "toString", {
      "configurable": true,
      "enumerable": false,
      "value": constant(string),
      "writable": true
    });
  };
  function cloneBuffer(buffer, isDeep) {
    {
      return buffer.slice();
    }
  }
  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new Uint8Array(result).set(new Uint8Array(arrayBuffer));
    return result;
  }
  function cloneTypedArray(typedArray, isDeep) {
    var buffer = cloneArrayBuffer(typedArray.buffer);
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }
  function copyArray(source, array) {
    var index = -1, length = source.length;
    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }
  function copyObject(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});
    var index = -1, length = props.length;
    while (++index < length) {
      var key = props[index];
      var newValue = void 0;
      if (newValue === void 0) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue(object, key, newValue);
      } else {
        assignValue(object, key, newValue);
      }
    }
    return object;
  }
  function createAssigner(assigner) {
    return baseRest(function(object, sources) {
      var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
      customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        customizer = length < 3 ? void 0 : customizer;
        length = 1;
      }
      object = Object(object);
      while (++index < length) {
        var source = sources[index];
        if (source) {
          assigner(object, source, index, customizer);
        }
      }
      return object;
    });
  }
  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
      while (length--) {
        var key = props[++index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
  }
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : void 0;
  }
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
    try {
      value[symToStringTag] = void 0;
      var unmasked = true;
    } catch (e) {
    }
    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }
  function initCloneObject(object) {
    return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
  }
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
  }
  function isIterateeCall(value, index, object) {
    if (!isObject(object)) {
      return false;
    }
    var type = typeof index;
    if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) {
      return eq(object[index], value);
    }
    return false;
  }
  function isKeyable(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
  }
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }
  function isPrototype(value) {
    var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
    return value === proto;
  }
  function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }
  function overRest(func, start, transform) {
    start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
    return function() {
      var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
      while (++index < length) {
        array[index] = args[start + index];
      }
      index = -1;
      var otherArgs = Array(start + 1);
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = transform(array);
      return apply(func, this, otherArgs);
    };
  }
  function safeGet(object, key) {
    if (key === "constructor" && typeof object[key] === "function") {
      return;
    }
    if (key == "__proto__") {
      return;
    }
    return object[key];
  }
  var setToString = shortOut(baseSetToString);
  function shortOut(func) {
    var count = 0, lastCalled = 0;
    return function() {
      var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }
      return func.apply(void 0, arguments);
    };
  }
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {
      }
      try {
        return func + "";
      } catch (e) {
      }
    }
    return "";
  }
  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }
  var isArguments = baseIsArguments(/* @__PURE__ */ function() {
    return arguments;
  }()) ? baseIsArguments : function(value) {
    return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
  };
  var isArray = Array.isArray;
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }
  function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value);
  }
  var isBuffer = nativeIsBuffer || stubFalse;
  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    }
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }
  function isLength(value) {
    return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == "object" || type == "function");
  }
  function isObjectLike(value) {
    return value != null && typeof value == "object";
  }
  function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
      return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
    return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
  }
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
  function toPlainObject(value) {
    return copyObject(value, keysIn(value));
  }
  function keysIn(object) {
    return isArrayLike(object) ? arrayLikeKeys(object) : baseKeysIn(object);
  }
  var merge2 = createAssigner(function(object, source, srcIndex) {
    baseMerge(object, source, srcIndex);
  });
  function constant(value) {
    return function() {
      return value;
    };
  }
  function identity(value) {
    return value;
  }
  function stubFalse() {
    return false;
  }
  module.exports = merge2;
})(lodash_merge, lodash_merge.exports);
var lodash_mergeExports = lodash_merge.exports;
const merge = /* @__PURE__ */ getDefaultExportFromCjs(lodash_mergeExports);
const devToolsTheme = merge({}, defaultTheme, {
  // Color system optimized for dark DevTools
  colors: {
    // Background colors
    background: {
      tint1: "#1E1E1E",
      // Main panel background
      tint2: "#2A2A2A",
      // Card/section backgrounds  
      overlay: "rgba(0,0,0,0.9)"
      // Modal overlays
    },
    // Border colors
    border: {
      default: "#333333",
      // Primary borders
      muted: "#2A2A2A"
      // Subtle borders
    },
    // Text colors
    text: {
      default: "#FFFFFF",
      // Primary text
      muted: "#CCCCCC",
      // Secondary text
      dark: "#888888"
      // Tertiary text
    },
    // Brand colors (matches JSG Logger branding)
    palette: {
      primary: {
        base: "#4A90E2",
        // Primary blue
        dark: "#357ABD",
        // Darker blue for hover
        light: "#5BA0F2"
        // Lighter blue for active
      },
      // Status colors
      success: {
        base: "#27AE60",
        // Green for success states
        dark: "#229954",
        light: "#2ECC71"
      },
      warning: {
        base: "#F39C12",
        // Orange for warning states  
        dark: "#D68910",
        light: "#F1C40F"
      },
      danger: {
        base: "#E74C3C",
        // Red for error states
        dark: "#C0392B",
        light: "#EC7063"
      },
      neutral: {
        base: "#95A5A6",
        // Gray for neutral states
        dark: "#7F8C8D",
        light: "#BDC3C7"
      }
    },
    // Intent colors (Evergreen's semantic colors)
    intent: {
      success: "#27AE60",
      warning: "#F39C12",
      danger: "#E74C3C",
      none: "#95A5A6"
    }
  },
  // Typography system
  typography: {
    fontFamilies: {
      display: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      ui: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'Monaco, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
    },
    fontSizes: {
      caption: 11,
      // Small captions
      body: 13,
      // Body text (DevTools standard)
      heading: 16,
      // Section headings
      title: 20
      // Panel title
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  // Component-specific overrides
  components: {
    // Button component customization
    Button: {
      baseStyle: {
        borderRadius: "6px",
        fontWeight: 500,
        transition: "all 0.2s ease",
        cursor: "pointer",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      },
      appearances: {
        // Primary button (Debug All, Trace All)
        primary: {
          backgroundColor: "#4A90E2",
          color: "#FFFFFF",
          border: "none",
          _hover: {
            backgroundColor: "#5BA0F2",
            transform: "translateY(-1px)",
            boxShadow: "0 2px 8px rgba(74, 144, 226, 0.3)"
          },
          _active: {
            backgroundColor: "#357ABD",
            transform: "translateY(0)",
            boxShadow: "0 1px 4px rgba(74, 144, 226, 0.3)"
          },
          _disabled: {
            backgroundColor: "#555555",
            color: "#888888",
            transform: "none",
            boxShadow: "none"
          }
        },
        // Minimal button (secondary actions)
        minimal: {
          backgroundColor: "transparent",
          color: "#CCCCCC",
          border: "1px solid #333333",
          _hover: {
            backgroundColor: "#2A2A2A",
            borderColor: "#4A90E2",
            color: "#FFFFFF"
          },
          _active: {
            backgroundColor: "#1E1E1E",
            borderColor: "#357ABD"
          }
        },
        // Danger button (Reset, destructive actions)
        default: {
          backgroundColor: "#E74C3C",
          color: "#FFFFFF",
          border: "none",
          _hover: {
            backgroundColor: "#EC7063",
            transform: "translateY(-1px)"
          },
          _active: {
            backgroundColor: "#C0392B",
            transform: "translateY(0)"
          }
        }
      },
      sizes: {
        small: {
          height: 28,
          paddingX: 12,
          fontSize: 12
        },
        medium: {
          height: 32,
          paddingX: 16,
          fontSize: 13
        },
        large: {
          height: 36,
          paddingX: 20,
          fontSize: 14
        }
      }
    },
    // Switch component (for component toggles)
    Switch: {
      baseStyle: {
        backgroundColor: "#444444"
      },
      appearances: {
        default: {
          backgroundColor: "#444444",
          _checked: {
            backgroundColor: "#4A90E2"
          },
          _hover: {
            backgroundColor: "#555555"
          },
          _checkedHover: {
            backgroundColor: "#5BA0F2"
          }
        }
      }
    },
    // Pane component (containers, panels)
    Pane: {
      baseStyle: {
        backgroundColor: "#1E1E1E",
        border: "1px solid #333333",
        borderRadius: "8px"
      }
    },
    // Card component (content cards)
    Card: {
      baseStyle: {
        backgroundColor: "#2A2A2A",
        border: "1px solid #333333",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
      }
    },
    // Text components
    Text: {
      baseStyle: {
        color: "#FFFFFF",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      },
      appearances: {
        default: {
          color: "#FFFFFF"
        },
        muted: {
          color: "#CCCCCC"
        },
        disabled: {
          color: "#888888"
        }
      }
    },
    // Heading components
    Heading: {
      baseStyle: {
        color: "#4A90E2",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 600
      }
    },
    // Badge component (for log counts)
    Badge: {
      appearances: {
        default: {
          backgroundColor: "#E74C3C",
          color: "#FFFFFF"
        }
      }
    }
  }
});
let panelInstance = null;
let isInitialized = false;
function initializePanel() {
  if (isInitialized) {
    console.log("[JSG-DEVTOOLS] Panel already initialized");
    return panelInstance;
  }
  console.log("[JSG-DEVTOOLS] Initializing DevTools panel");
  try {
    if (!window.JSG_Logger) {
      console.warn("[JSG-DEVTOOLS] JSG Logger not found on window. Make sure logger is initialized.");
      return null;
    }
    const panelContainer = document.createElement("div");
    panelContainer.id = "jsg-devtools-panel";
    panelContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            z-index: 999999;
            pointer-events: none;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
    document.body.appendChild(panelContainer);
    render(
      /* @__PURE__ */ u(ThemeProvider, { value: devToolsTheme, children: /* @__PURE__ */ u(DevToolsPanel, { loggerControls: window.JSG_Logger }) }),
      panelContainer
    );
    panelInstance = {
      container: panelContainer,
      destroy: () => destroyPanel()
    };
    isInitialized = true;
    console.log("[JSG-DEVTOOLS] Panel initialized successfully");
    return panelInstance;
  } catch (error) {
    console.error("[JSG-DEVTOOLS] Failed to initialize panel:", error);
    return null;
  }
}
function destroyPanel() {
  if (panelInstance == null ? void 0 : panelInstance.container) {
    document.body.removeChild(panelInstance.container);
    panelInstance = null;
    isInitialized = false;
    console.log("[JSG-DEVTOOLS] Panel destroyed");
  }
}
function togglePanel() {
  if (isInitialized && panelInstance) {
    const container = panelInstance.container;
    const currentDisplay = container.style.display;
    container.style.display = currentDisplay === "none" ? "block" : "none";
  }
}
if (typeof window !== "undefined") {
  window.JSG_DevTools = {
    initialize: initializePanel,
    destroy: destroyPanel,
    toggle: togglePanel
  };
}
export {
  initializePanel,
  togglePanel
};
//# sourceMappingURL=panel-entry.js.map
