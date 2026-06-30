"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRSSFeed = exports.createFeedList = void 0;
var _defaultModules = require("./default-modules.js");
var _fileHandlerMoules = require("./file-handler-moules.js");
var TE = _interopRequireWildcard(require("fp-ts/TaskEither"));
var M = _interopRequireWildcard(require("fp-ts/Map"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/// <reference types="node" />

// ===== TOP-LEVEL HTML RETURNS ===== //
// Produce RSS Feed as HTML object
const createRSSFeed = (jsonFile, feedName, entryData) => {
  const rssObjectHTML = (0, _fileHandlerMoules.loadHTML)("src/layout/rss-object.htm");
  const rssFeedHTML = (0, _fileHandlerMoules.loadHTML)("src/layout/rss-feed.htm");
  return TE.flatMap(rssFeedHTML => TE.flatMap(rssObjectHTML => TE.map(entries => (0, _fileHandlerMoules.setHTMLChildInnerHTML)({
    ".feed-content": createFeedString(entries, rssObjectHTML)
  })(rssFeedHTML))(createFeed(jsonFile, feedName, entryData)))(rssObjectHTML))(rssFeedHTML);
};
// Create a new feed object from the entry data
exports.createRSSFeed = createRSSFeed;
const createFeedString = (entryData, rssObjectHTML) => entryData.map(entry => createFeedObject(entry, rssObjectHTML).outerHTML).join("\n");
// Remove the body wrapper
const getTemplateRoot = element => {
  const firstChild = element.firstElementChild;
  return element.tagName === "BODY" && firstChild instanceof HTMLElement ? firstChild : element;
};
// Create a new feed object from the entry data
const createFeedObject = (entryData, rssHTMLObject) => formatFeedObjectHTML(entryData)(getTemplateRoot(rssHTMLObject));
// Format the feed object's HTML
const formatFeedObjectHTML = entryData => element => {
  const modifiedHeader = (0, _fileHandlerMoules.setHTMLAttributes)({
    "data-dismissed": String(entryData.data.dismissed),
    "data-read": String(entryData.data.read),
    "data-entry-uuid": entryData.uuid
  })(element);
  const modifiedText = (0, _fileHandlerMoules.setHTMLChildInnerHTML)({
    ".item-title": entryData.title,
    ".item-channel": entryData.parentData.name,
    ".item-date": entryData.date == undefined ? "no date specified" : entryData.date.toISOString().substring(0, 10),
    ".item-desc": entryData.description,
    ".item-dismiss": entryData.data.dismissed ? "Restore Story" : "Dismiss Story"
  })(modifiedHeader);
  const modifiedFormItems = (0, _fileHandlerMoules.setHTMLChildAttributes)({
    ".item-image": {
      src: entryData.parentData.imageUrl ?? "src/img/favicons/SN_1006.jpg",
      alt: entryData.parentData.imageName ?? entryData.parentData.name
    },
    ".item-read": {
      onclick: `ModifyFeed.changeItemState("${entryData.uuid}", true); window.open('${entryData.link}')`
    },
    ".item-dismiss": {
      onclick: `ModifyFeed.changeItemState("${entryData.uuid}", false);`
    }
  })(modifiedText);
  return getTemplateRoot(modifiedFormItems);
};
// Produce list of RSS feed sources as HTML object
const createFeedList = jsonFile => TE.flatMap(feedMap => {
  return (0, _fileHandlerMoules.parseHTML)(Array.from(M.map(entryUrlList => {
    return entryUrlList.reduce((acc, val) => acc + "<li><a href='" + val.link + "'>" + val.name + "</a></li>\n", "");
  })(feedMap)).reduce((acc, [key, val]) => acc + "<h4>" + key + "</h4>\n<ul>\n" + val + "</ul>\n", ""));
})((0, _fileHandlerMoules.getFeedMap)(jsonFile));
// ===== LOAD JSON INTO XML INTO RSS ===== //
// RSS Feed
exports.createFeedList = createFeedList;
const createFeed = (jsonFile, feedName, entryData) => TE.map(sortFeed)(TE.flatMap(urlList => loadXML(urlList, entryData))(loadJSON(jsonFile, feedName)));
// Load a JSON file and then return the selected feed
const loadJSON = (file, selection) => TE.flatMap(feed => {
  const selectedFeed = feed.get(selection);
  return selectedFeed !== undefined ? TE.right(selectedFeed) : TE.left(new Error("Selected feed does not exist in JSON"));
})((0, _fileHandlerMoules.getFeedMap)(file));
// Generate the collection of items based on the feed
const loadXML = (urlList, entryData) => TE.map(entries => entries.flat())(TE.traverseArray(urlEntry => TE.map(feedData => parsedXMLToEntries(feedData, urlEntry.name, entryData))((0, _fileHandlerMoules.getXML)(urlEntry.link)))(urlList));
// Sort feed array based on date
const sortFeed = entryList => [...entryList].sort((a, b) => {
  if (a.data.dismissed != b.data.dismissed) {
    return +a.data.dismissed - +b.data.dismissed;
  } else if (a.date !== undefined && b.date !== undefined) {
    return +b.date - +a.date;
  } else {
    return b.uuid.localeCompare(a.uuid);
  }
});
// ===== PARSE XML DATA ===== //
// Parsed XML data to entry
const parsedXMLToEntries = (xmlData, feedName, entryData) => xmlData.items.map(item => itemToEntry(item, channelToParentData(xmlData, feedName), entryData));
// Load parent channel data into ParentData object
const channelToParentData = (xmlData, feedName) => ({
  uuid: (0, _defaultModules.uuidURL)(xmlData.link ?? _defaultModules.HTTPS404),
  name: feedName,
  title: xmlData.title ?? "Title not found.",
  link: xmlData.link ?? _defaultModules.HTTPS404,
  imageName: xmlData.image?.title,
  imageUrl: xmlData.image?.url
});
// Create an Entry object
const itemToEntry = (xmlItem, itemParent, entryData) => {
  const uuid = (0, _defaultModules.uuidURL)(xmlItem.link ?? itemParent.link);
  return {
    uuid: uuid,
    link: xmlItem.link ?? itemParent.link,
    title: xmlItem.title ?? itemParent.title,
    description: xmlItem.contentSnippet ?? "Description not found.",
    date: typeof xmlItem.pubDate === "string" ? new Date(xmlItem.pubDate) : undefined,
    parentData: itemParent,
    data: entryData.get(uuid) ?? {
      read: false,
      dismissed: false
    }
  };
};