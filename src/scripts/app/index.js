"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadRSS = exports.displayNewsreaderLinks = void 0;
var _defaultModules = require("./default-modules");
var _rssModules = require("./rss-modules.js");
/// <reference types="node" />

const getRSS = async ([entryDataMap, feedName]) => await (0, _defaultModules.decideUnsafe)((0, _rssModules.createRSSFeed)("newsreader", feedName, entryDataMap));
const displayNewsreaderLinks = async () => await (0, _defaultModules.decideUnsafe)((0, _rssModules.createFeedList)("newsreader"));
exports.displayNewsreaderLinks = displayNewsreaderLinks;
const loadRSS = async function ([entryDataMap, feedName]) {
  try {
    console.log("Loading RSS Feed ...");
    return await getRSS([entryDataMap, feedName]);
  } catch (error) {
    console.log("An error occured while trying to load the bundled modules: " + error + ";");
    console.trace();
    return new HTMLElement();
  }
};
exports.loadRSS = loadRSS;