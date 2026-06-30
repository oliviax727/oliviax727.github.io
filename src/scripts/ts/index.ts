/// <reference types="node" />

import { decideUnsafe } from "./default-modules";
import type { OutputFunction, IOFunction } from "./default-modules";
import { createRSSFeed, createFeedList } from "./rss-modules.js";
import type { EntryDataMap } from "./rss-modules.js";

const getRSS: IOFunction<[EntryDataMap, string], HTMLElement> = async ([entryDataMap, feedName]) =>
	await decideUnsafe(createRSSFeed("newsreader", feedName, entryDataMap));

const displayNewsreaderLinks: OutputFunction<HTMLElement> = async () =>
	await decideUnsafe(createFeedList("newsreader"));

const loadRSS: IOFunction<[EntryDataMap, string], HTMLElement> = async function ([entryDataMap, feedName]) {
	try {
		console.log("Loading RSS Feed ...");
		return await getRSS([entryDataMap, feedName]);
	} catch (error: unknown) {
		console.log("An error occured while trying to load the bundled modules: " + (error as string) + ";");

		console.trace();

		return new HTMLElement();
	}
};

export { loadRSS, displayNewsreaderLinks };
