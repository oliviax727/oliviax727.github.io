/// <reference types="node" />

import { HTTPS404, uuidURL } from "./default-modules.js";
import {
	getFeedMap,
	getXML,
	parseHTML,
	loadHTML,
	setHTMLAttributes,
	setHTMLChildAttributes,
	setHTMLChildInnerHTML,
} from "./file-handler-moules.js";
import type { EntryURL, FeedMap, rssData, rssItem } from "./file-handler-moules.js";
import type { TaskEither } from "fp-ts/TaskEither";
import * as TE from "fp-ts/TaskEither";
import * as M from "fp-ts/Map";

// ===== TYPE DEFINITIONS ===== //

// RSS parent data
interface ParentData {
	uuid: string;
	name: string;

	title: string;
	link: string;

	imageUrl?: string;
	imageName?: string;
}

// Entry data corresponding to each element
export interface EntryData {
	read: boolean;
	dismissed: boolean;
}

export type EntryDataMap = Readonly<Map<string, EntryData>>;

// RSS entry object
export interface Entry {
	uuid: string;

	title: string;
	link: string;
	description: string;

	date?: Date;

	parentData: ParentData;

	data: EntryData;
}

// ===== TOP-LEVEL HTML RETURNS ===== //

// Produce RSS Feed as HTML object
export const createRSSFeed = (jsonFile: string, feedName: string, entryData: EntryDataMap): TaskEither<unknown, HTMLElement> => {
	const rssObjectHTML = loadHTML("src/layout/rss-object.htm");
	const rssFeedHTML = loadHTML("src/layout/rss-feed.htm");

	return TE.flatMap((rssFeedHTML: Readonly<HTMLElement>) => TE.flatMap((rssObjectHTML: Readonly<HTMLElement>) =>
		TE.map((entries: readonly Entry[]) =>
			setHTMLChildInnerHTML({
				".feed-content": createFeedString(entries, rssObjectHTML),
			})(rssFeedHTML),
		)(createFeed(jsonFile, feedName, entryData)))(rssObjectHTML))(rssFeedHTML);
};

// Create a new feed object from the entry data
const createFeedString = (entryData: readonly Entry[], rssObjectHTML: Readonly<HTMLElement>): string =>
	entryData.map((entry: Readonly<Entry>) => createFeedObject(entry, rssObjectHTML).outerHTML).join("\n");

// Remove the body wrapper
const getTemplateRoot = (element: Readonly<HTMLElement>): HTMLElement => {
	const firstChild = element.firstElementChild;

	return element.tagName === "BODY" && firstChild instanceof HTMLElement
		? firstChild
		: element;
};

// Create a new feed object from the entry data
const createFeedObject = (entryData: Readonly<Entry>, rssHTMLObject: Readonly<HTMLElement>): HTMLElement =>
	formatFeedObjectHTML(entryData)(getTemplateRoot(rssHTMLObject));

// Format the feed object's HTML
const formatFeedObjectHTML =
	(entryData: Readonly<Entry>) =>
		(element: Readonly<HTMLElement>): HTMLElement => {
			const modifiedHeader = setHTMLAttributes({
				"data-dismissed": String(entryData.data.dismissed),
				"data-read": String(entryData.data.read),
				"data-entry-uuid": entryData.uuid,
			})(element);

			const modifiedText = setHTMLChildInnerHTML({
				".item-title": entryData.title,
				".item-channel": entryData.parentData.name,
				".item-date": entryData.date == undefined ? "no date specified" : entryData.date.toISOString().substring(0, 10),
				".item-desc": entryData.description,
				".item-dismiss": entryData.data.dismissed ? "Restore Story" : "Dismiss Story",
			})(modifiedHeader);

			const modifiedFormItems = setHTMLChildAttributes({
				".item-image": {
					src: entryData.parentData.imageUrl ?? "src/img/favicons/SN_1006.jpg",
					alt: entryData.parentData.imageName ?? entryData.parentData.name,
				},
				".item-read": {
					onclick: `ModifyFeed.changeItemState("${entryData.uuid}", true); window.open('${entryData.link}')`,
				},
				".item-dismiss": {
					onclick: `ModifyFeed.changeItemState("${entryData.uuid}", false);`,
				},
			})(modifiedText);

			return getTemplateRoot(modifiedFormItems);
		};

// Produce list of RSS feed sources as HTML object
export const createFeedList = (jsonFile: string): TaskEither<unknown, HTMLElement> =>
	TE.flatMap((feedMap: FeedMap) => {
		return parseHTML(
			Array.from(
				M.map((entryUrlList: readonly EntryURL[]) => {
					return entryUrlList.reduce(
						(acc, val) => acc + "<li><a href='" + val.link + "'>" + val.name + "</a></li>\n",
						"",
					);
				})(feedMap),
			).reduce(
				(acc, [key, val]) => acc + "<h4>" + key + "</h4>\n<ul>\n" + val + "</ul>\n",
				"",
			),
		);
	})(getFeedMap(jsonFile));

// ===== LOAD JSON INTO XML INTO RSS ===== //

// RSS Feed
const createFeed = (jsonFile: string, feedName: string, entryData: EntryDataMap): TaskEither<unknown, Entry[]> =>
	TE.map(sortFeed)(
		TE.flatMap((urlList: readonly EntryURL[]) =>
			loadXML(urlList, entryData),
		)(loadJSON(jsonFile, feedName)),
	);

// Load a JSON file and then return the selected feed
const loadJSON = (file: string, selection: string): TaskEither<unknown, EntryURL[]> =>
	TE.flatMap((feed: FeedMap) => {
		const selectedFeed = feed.get(selection);

		return selectedFeed !== undefined
			? TE.right(selectedFeed)
			: TE.left(new Error("Selected feed does not exist in JSON"));
	})(getFeedMap(file));

// Generate the collection of items based on the feed
const loadXML = (urlList: readonly EntryURL[], entryData: EntryDataMap): TaskEither<unknown, Entry[]> =>
	TE.map((entries: readonly Entry[][]) => entries.flat())(
		TE.traverseArray((urlEntry: Readonly<EntryURL>) =>
			TE.map((feedData: Readonly<rssData>) =>
				parsedXMLToEntries(feedData, urlEntry.name, entryData),
			)(getXML(urlEntry.link)),
		)(urlList),
	);

// Sort feed array based on date
const sortFeed = (entryList: readonly Entry[]): Entry[] =>
	[...entryList].sort((a: Readonly<Entry>, b: Readonly<Entry>) => {
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
const parsedXMLToEntries = (xmlData: Readonly<rssData>, feedName: string, entryData: EntryDataMap): Entry[] =>
	xmlData.items.map((item: Readonly<rssItem>) => itemToEntry(item, channelToParentData(xmlData, feedName), entryData));

// Load parent channel data into ParentData object
const channelToParentData = (xmlData: Readonly<rssData>, feedName: string): ParentData => ({
	uuid: uuidURL(xmlData.link ?? HTTPS404),
	name: feedName,
	title: xmlData.title ?? "Title not found.",
	link: xmlData.link ?? HTTPS404,
	imageName: xmlData.image?.title,
	imageUrl: xmlData.image?.url,
});

// Create an Entry object
const itemToEntry = (xmlItem: Readonly<rssItem>, itemParent: Readonly<ParentData>, entryData: EntryDataMap): Entry => {
	const uuid = uuidURL(xmlItem.link ?? itemParent.link);

	return {
		uuid: uuid,
		link: xmlItem.link ?? itemParent.link,
		title: xmlItem.title ?? itemParent.title,
		description: xmlItem.contentSnippet ?? "Description not found.",
		date: typeof xmlItem.pubDate === "string" ? new Date(xmlItem.pubDate) : undefined,
		parentData: itemParent,
		data: entryData.get(uuid) ?? { read: false, dismissed: false },
	};
};
