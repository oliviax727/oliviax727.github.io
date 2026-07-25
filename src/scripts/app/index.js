/// <reference types="node" />
import { decideUnsafe } from "./default-modules";
import { createRSSFeed, createFeedList } from "./rss-modules.js";
const getRSS = async ([entryDataMap, feedName]) => await decideUnsafe(createRSSFeed("newsreader", feedName, entryDataMap));
const displayNewsreaderLinks = async () => await decideUnsafe(createFeedList("newsreader"));
const loadRSS = async function ([entryDataMap, feedName]) {
    try {
        console.log("Loading RSS Feed ...");
        return await getRSS([entryDataMap, feedName]);
    }
    catch (error) {
        console.log("An error occured while trying to load the bundled modules: " + error + ";");
        console.trace();
        return new HTMLElement();
    }
};
export { loadRSS, displayNewsreaderLinks };
