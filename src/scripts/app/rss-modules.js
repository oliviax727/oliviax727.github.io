/// <reference types="node" />
import { HTTPS404, uuidURL } from "./default-modules.js";
import { getFeedMap, getXML, parseHTML, loadHTML, setHTMLAttributes, setHTMLChildAttributes, setHTMLChildInnerHTML, } from "./file-handler-moules.js";
import * as TE from "fp-ts/TaskEither";
import * as M from "fp-ts/Map";
// ===== TOP-LEVEL HTML RETURNS ===== //
// Produce RSS Feed as HTML object
export const createRSSFeed = (jsonFile, feedName, entryData) => {
    const rssObjectHTML = loadHTML("src/layout/rss-object.htm");
    const rssFeedHTML = loadHTML("src/layout/rss-feed.htm");
    return TE.flatMap((rssFeedHTML) => TE.flatMap((rssObjectHTML) => TE.map((entries) => setHTMLChildInnerHTML({
        ".feed-content": createFeedString(entries, rssObjectHTML),
    })(rssFeedHTML))(createFeed(jsonFile, feedName, entryData)))(rssObjectHTML))(rssFeedHTML);
};
// Create a new feed object from the entry data
const createFeedString = (entryData, rssObjectHTML) => entryData.map((entry) => createFeedObject(entry, rssObjectHTML).outerHTML).join("\n");
// Remove the body wrapper
const getTemplateRoot = (element) => {
    const firstChild = element.firstElementChild;
    return element.tagName === "BODY" && firstChild instanceof HTMLElement
        ? firstChild
        : element;
};
// Create a new feed object from the entry data
const createFeedObject = (entryData, rssHTMLObject) => formatFeedObjectHTML(entryData)(getTemplateRoot(rssHTMLObject));
// Format the feed object's HTML
const formatFeedObjectHTML = (entryData) => (element) => {
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
export const createFeedList = (jsonFile) => TE.flatMap((feedMap) => {
    return parseHTML(Array.from(M.map((entryUrlList) => {
        return entryUrlList.reduce((acc, val) => acc + "<li><a href='" + val.link + "'>" + val.name + "</a></li>\n", "");
    })(feedMap)).reduce((acc, [key, val]) => acc + "<h4>" + key + "</h4>\n<ul>\n" + val + "</ul>\n", ""));
})(getFeedMap(jsonFile));
// ===== LOAD JSON INTO XML INTO RSS ===== //
// RSS Feed
const createFeed = (jsonFile, feedName, entryData) => TE.map(sortFeed)(TE.flatMap((urlList) => loadXML(urlList, entryData))(loadJSON(jsonFile, feedName)));
// Load a JSON file and then return the selected feed
const loadJSON = (file, selection) => TE.flatMap((feed) => {
    const selectedFeed = feed.get(selection);
    return selectedFeed !== undefined
        ? TE.right(selectedFeed)
        : TE.left(new Error("Selected feed does not exist in JSON"));
})(getFeedMap(file));
// Generate the collection of items based on the feed
const loadXML = (urlList, entryData) => TE.map((entries) => entries.flat())(TE.traverseArray((urlEntry) => TE.map((feedData) => parsedXMLToEntries(feedData, urlEntry.name, entryData))(getXML(urlEntry.link)))(urlList));
// Sort feed array based on date
const sortFeed = (entryList) => [...entryList].sort((a, b) => {
    if (a.data.dismissed != b.data.dismissed) {
        return +a.data.dismissed - +b.data.dismissed;
    }
    else if (a.date !== undefined && b.date !== undefined) {
        return +b.date - +a.date;
    }
    else {
        return b.uuid.localeCompare(a.uuid);
    }
});
// ===== PARSE XML DATA ===== //
// Parsed XML data to entry
const parsedXMLToEntries = (xmlData, feedName, entryData) => xmlData.items.map((item) => itemToEntry(item, channelToParentData(xmlData, feedName), entryData));
// Load parent channel data into ParentData object
const channelToParentData = (xmlData, feedName) => ({
    uuid: uuidURL(xmlData.link ?? HTTPS404),
    name: feedName,
    title: xmlData.title ?? "Title not found.",
    link: xmlData.link ?? HTTPS404,
    imageName: xmlData.image?.title,
    imageUrl: xmlData.image?.url,
});
// Create an Entry object
const itemToEntry = (xmlItem, itemParent, entryData) => {
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
