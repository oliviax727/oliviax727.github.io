import { _id, getProxyURL } from "./default-modules.js";
// @ts-expect-error rss-parser does not ship type declarations for dist browser entrypoint.
import RSSParser from "rss-parser/dist/rss-parser.min.js";
import * as TE from "fp-ts/TaskEither";
// Parsers
const RSSParserCtor = RSSParser;
const rssParser = new RSSParserCtor();
const domParser = new DOMParser();
// ===== HTML HANDLING ===== //
// Fetch a HTML file and return it as an element object
export const loadHTML = (file) => TE.flatMap(parseHTML)(loadHTMLText(file));
// Load a HTML file as text
const loadHTMLText = (file) => TE.tryCatch(() => fetch(file)
    .then((responseHTML) => {
    if (responseHTML.ok) {
        return responseHTML.text();
    }
    throw new Error("A error occured HTTP. Code: " + responseHTML.status.toString());
})
    .catch((reason) => {
    throw reason;
}), _id);
// Parse a string to a HTML file
export const parseHTML = (html) => TE.tryCatch(() => Promise.resolve(domParser.parseFromString(html, "text/html").body), _id);
// Parse a string to a HTML file - assume HTML is working all well
export const parseHTMLSafe = (html) => domParser.parseFromString(html, "text/html").body;
// Replace & and " to prevent breaking strings
const encodeHTMLAttributeValue = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
// Escapes all characters that are potentially dangerous for regex interpretation
const escapeRegexText = (value) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
// Takes a HTML string modifies the opening tag of the element
const setHTMLAttribute = (html, attribute, value) => {
    const openTagPattern = /^\s*<([^\s>]+)([^>]*)>/u;
    const nextAttribute = ` ${attribute}="${encodeHTMLAttributeValue(value)}"`;
    const attributePattern = new RegExp(`\\s${escapeRegexText(attribute)}="[^"]*"`, "u");
    return html.replace(openTagPattern, (_match, tagName, attributes) => {
        const nextAttributes = attributePattern.test(attributes)
            ? attributes.replace(attributePattern, nextAttribute)
            : attributes + nextAttribute;
        return `<${tagName}${nextAttributes}>`;
    });
};
// Modify a HTML Element's attributes w/o side effects
export const setHTMLAttributes = (attributeMap) => (element) => parseHTMLSafe(Object.entries(attributeMap).reduce((html, [attribute, value]) => setHTMLAttribute(html, attribute, value), element.outerHTML));
// Modify child element inner HTML w/o side effects
export const setHTMLChildInnerHTML = (childHTMLMap) => (element) => {
    const nextElement = parseHTMLSafe(element.outerHTML);
    Object.entries(childHTMLMap).forEach(([selector, html]) => {
        nextElement.querySelectorAll(selector).forEach((childElement) => {
            childElement.innerHTML = html;
        });
    });
    return nextElement;
};
// Modify child element attributes w/o side effects
export const setHTMLChildAttributes = (childAttributeMap) => (element) => {
    const nextElement = parseHTMLSafe(element.outerHTML);
    Object.entries(childAttributeMap).forEach(([selector, attributeMap]) => {
        nextElement.querySelectorAll(selector).forEach((childElement) => {
            Object.entries(attributeMap).forEach(([attribute, value]) => {
                childElement.setAttribute(attribute, value);
            });
        });
    });
    return nextElement;
};
// ===== JSON HANDLING ===== //
// Get the JSON data as a feed map
export const getFeedMap = (fileName) => TE.map((jsonModule) => {
    const protoFeed = (jsonModule.default ?? jsonModule);
    return new Map(Object.entries(protoFeed).map(([feedName, entryRecord]) => [
        feedName,
        Object.entries(entryRecord).map(([name, link]) => ({ name, link })),
    ]));
})(getJSON("./src/data/" + fileName + ".json"));
// Retreive JSON file
export const getJSON = (file) => TE.tryCatch(() => import(file, { with: { type: "json" } }), _id);
// ===== XML HANDLING ===== //
// Retreive XML RSS file
export const getXML = (file) => TE.flatMap((textXML) => TE.tryCatch(() => rssParser.parseString(textXML), _id))(TE.orElse(() => tryGetXML(getProxyURL(file)))(tryGetXML(file)));
// Attempts to get an XML file (sub-function of getXML)
const tryGetXML = (url) => TE.tryCatch(() => fetch(url)
    .then((responseXML) => {
    if (responseXML.ok) {
        return responseXML.text();
    }
    throw new Error("A error occured HTTP. Code: " + responseXML.status.toString());
})
    .catch((reason) => {
    throw reason;
}), _id);
