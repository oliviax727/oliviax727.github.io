"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setHTMLChildInnerHTML = exports.setHTMLChildAttributes = exports.setHTMLAttributes = exports.parseHTMLSafe = exports.parseHTML = exports.loadHTML = exports.getXML = exports.getJSON = exports.getFeedMap = void 0;
var _defaultModules = require("./default-modules.js");
var _rssParser = _interopRequireDefault(require("rss-parser"));
var TE = _interopRequireWildcard(require("fp-ts/TaskEither"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Parsers
const rssParser = new _rssParser.default();
const domParser = new DOMParser();
// ===== HTML HANDLING ===== //
// Fetch a HTML file and return it as an element object
const loadHTML = file => TE.flatMap(parseHTML)(loadHTMLText(file));
// Load a HTML file as text
exports.loadHTML = loadHTML;
const loadHTMLText = file => TE.tryCatch(() => fetch(file).then(responseHTML => {
  if (responseHTML.ok) {
    return responseHTML.text();
  }
  throw new Error("A error occured HTTP. Code: " + responseHTML.status.toString());
}).catch(reason => {
  throw reason;
}), _defaultModules._id);
// Parse a string to a HTML file
const parseHTML = html => TE.tryCatch(() => Promise.resolve(domParser.parseFromString(html, "text/html").body), _defaultModules._id);
// Parse a string to a HTML file - assume HTML is working all well
exports.parseHTML = parseHTML;
const parseHTMLSafe = html => domParser.parseFromString(html, "text/html").body;
// Replace & and " to prevent breaking strings
exports.parseHTMLSafe = parseHTMLSafe;
const encodeHTMLAttributeValue = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
// Escapes all characters that are potentially dangerous for regex interpretation
const escapeRegexText = value => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
// Takes a HTML string modifies the opening tag of the element
const setHTMLAttribute = (html, attribute, value) => {
  const openTagPattern = /^\s*<([^\s>]+)([^>]*)>/u;
  const nextAttribute = ` ${attribute}="${encodeHTMLAttributeValue(value)}"`;
  const attributePattern = new RegExp(`\\s${escapeRegexText(attribute)}="[^"]*"`, "u");
  return html.replace(openTagPattern, (_match, tagName, attributes) => {
    const nextAttributes = attributePattern.test(attributes) ? attributes.replace(attributePattern, nextAttribute) : attributes + nextAttribute;
    return `<${tagName}${nextAttributes}>`;
  });
};
// Modify a HTML Element's attributes w/o side effects
const setHTMLAttributes = attributeMap => element => parseHTMLSafe(Object.entries(attributeMap).reduce((html, [attribute, value]) => setHTMLAttribute(html, attribute, value), element.outerHTML));
// Modify child element inner HTML w/o side effects
exports.setHTMLAttributes = setHTMLAttributes;
const setHTMLChildInnerHTML = childHTMLMap => element => {
  const nextElement = parseHTMLSafe(element.outerHTML);
  Object.entries(childHTMLMap).forEach(([selector, html]) => {
    nextElement.querySelectorAll(selector).forEach(childElement => {
      childElement.innerHTML = html;
    });
  });
  return nextElement;
};
// Modify child element attributes w/o side effects
exports.setHTMLChildInnerHTML = setHTMLChildInnerHTML;
const setHTMLChildAttributes = childAttributeMap => element => {
  const nextElement = parseHTMLSafe(element.outerHTML);
  Object.entries(childAttributeMap).forEach(([selector, attributeMap]) => {
    nextElement.querySelectorAll(selector).forEach(childElement => {
      Object.entries(attributeMap).forEach(([attribute, value]) => {
        childElement.setAttribute(attribute, value);
      });
    });
  });
  return nextElement;
};
// ===== JSON HANDLING ===== //
// Get the JSON data as a feed map
exports.setHTMLChildAttributes = setHTMLChildAttributes;
const getFeedMap = fileName => TE.map(jsonModule => {
  const protoFeed = jsonModule.default ?? jsonModule;
  return new Map(Object.entries(protoFeed).map(([feedName, entryRecord]) => [feedName, Object.entries(entryRecord).map(([name, link]) => ({
    name,
    link
  }))]));
})(getJSON("./src/data/" + fileName + ".json"));
// Retreive JSON file
exports.getFeedMap = getFeedMap;
const getJSON = file => TE.tryCatch(() => import(file, {
  with: {
    type: "json"
  }
}), _defaultModules._id);
// ===== XML HANDLING ===== //
// Retreive XML RSS file
exports.getJSON = getJSON;
const getXML = file => TE.flatMap(textXML => TE.tryCatch(() => rssParser.parseString(textXML), _defaultModules._id))(TE.orElse(() => tryGetXML((0, _defaultModules.getProxyURL)(file)))(tryGetXML(file)));
// Attempts to get an XML file (sub-function of getXML)
exports.getXML = getXML;
const tryGetXML = url => TE.tryCatch(() => fetch(url).then(responseXML => {
  if (responseXML.ok) {
    return responseXML.text();
  }
  throw new Error("A error occured HTTP. Code: " + responseXML.status.toString());
}).catch(reason => {
  throw reason;
}), _defaultModules._id);