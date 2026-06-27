/// <reference types="node" />

import * as T from "fp-ts/Task";
import * as Console from "fp-ts/Console";
import { decideUnsafe, type EntryFunction, type OutputFunction } from './default-modules';
import { loadXML } from "./rss-modules.js";

const getRSS: OutputFunction = async function () {
	const feed = await decideUnsafe(
		loadXML([
			{
				name: "W3 Test XML",
				link: "https://raw.githubusercontent.com/oliviax727/RSS-ohrw/refs/heads/main/src/data/test_feed.xml",
			},
			{
				name: "ABC News",
				link: "https://www.abc.net.au/news/feed/5313390/rss.xml",
			},
		]),
	);

	return feed;
};

const displayRSS: OutputFunction = function () { 
	return "Display RSS";
};

const dismissRSSItem: OutputFunction = function () {
	return "Dismiss RSS Item";
};

const entry: EntryFunction = async function () {
	console.log("Loading bundled modules ...");

	try {
		await T.traverseSeqArray((func: OutputFunction) => async () => {
			const output = await func();
			Console.log(output)();
		})([getRSS, displayRSS, dismissRSSItem])();
	} catch (error: unknown) {
		console.log("An error occured while trying to load the bundled modules: " + (error as string) + ";");

		if (error instanceof Error) {
			console.log("In: " + (error.stack ?? "[stack unavailable]"));
		} else {
			console.trace();
		}
	} finally {
		console.log("Modules successfully loaded and executed.");
	}
};

export default entry;
