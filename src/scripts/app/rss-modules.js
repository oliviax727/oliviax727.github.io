"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createFeed = createFeed;
exports.loadXML = loadXML;
var _defaultModules = require("./default-modules");
var _rssParser = _interopRequireDefault(require("rss-parser"));
var TE = _interopRequireWildcard(require("fp-ts/TaskEither"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/// <reference types="node" />

// RSS Feed
function createFeed(jsonFile, feedName) {
  return TE.map(sortFeed)(TE.flatMap(loadXML)(loadJSON(jsonFile, feedName)));
}
/* eslint-disable */
function loadJSON(file, selection) {
  return (0, _defaultModules._stub)();
}
/* eslint-enable */
// Generate the collection of items based on the feed
function loadXML(urlList) {
  return TE.map(entries => entries.flat())(TE.traverseArray(urlEntry => TE.map(feedData => parsedXMLToEntries(feedData, urlEntry.name))(getXML(urlEntry.link)))(urlList));
}
// Sort feed array based on date
function sortFeed(entryList) {
  return [...entryList].sort((a, b) => {
    if (a.dismissed != b.dismissed) {
      return +a.dismissed - +b.dismissed;
    } else if (a.date !== undefined && b.date !== undefined) {
      return +b.date - +a.date;
    } else {
      return b.uuid - a.uuid;
    }
  });
}
// Parsed XML data to entry
function parsedXMLToEntries(xmlData, feedName) {
  return xmlData.items.map(item => itemToEntry(item, channelToParentData(xmlData, feedName)));
}
// Load parent channel data into ParentData object
function channelToParentData(xmlData, feedName) {
  return {
    uuid: uuidURL(xmlData.link ?? _defaultModules.HTTPS404),
    name: feedName,
    title: xmlData.title ?? "Title not found.",
    link: xmlData.link ?? _defaultModules.HTTPS404,
    imageName: xmlData.image?.title,
    imageUrl: xmlData.image?.url
  };
}
function itemToEntry(xmlItem, itemParent) {
  return {
    uuid: uuidURL(xmlItem.link ?? itemParent.link),
    link: xmlItem.link ?? itemParent.link,
    title: xmlItem.title ?? itemParent.title,
    description: xmlItem.contentSnippet ?? "Description not found.",
    date: typeof xmlItem.pubDate === "string" ? new Date(xmlItem.pubDate) : undefined,
    parentData: itemParent,
    read: false,
    dismissed: false
  };
}
// ===== FILE AND FETCH HANDLING ===== //
const rssParser = new _rssParser.default();
function uuidURL(url, seed = 5381) {
  return Array.from(url).reduce(
  // hash * 33 + charCode (bitwise shift for efficiency: hash << 5 is hash * 32)
  (seed, char) => (seed << 5) + seed + char.charCodeAt(0), seed) >>> 0;
}
// Retreive XML file
function getXML(url) {
  return TE.flatMap(textXML => TE.tryCatch(() => rssParser.parseString(textXML), _defaultModules._id))(TE.tryCatch(() => fetch(url).then(responseXML => {
    if (responseXML.ok) {
      return responseXML.text();
    } else {
      throw new Error("A error occured HTTP. Code: " + responseXML.status.toString());
    }
  }), _defaultModules._id));
}