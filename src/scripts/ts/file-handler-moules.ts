import { _id, getProxyURL } from "./default-modules.js";
import Parser from "rss-parser";
import type { TaskEither } from "fp-ts/TaskEither";
import * as TE from "fp-ts/TaskEither";

// ===== IMPORTANT TYPES AND CONSTANTS ===== //

// JSON File Data
export interface EntryURL {
  name: string;
  link: string;
}

// JSON Module types
interface JSONModule {
  default?: unknown;
}

// JSON RSS Feed Record and corresponding map
type JSONFeedRecord = Readonly<
  Record<string, Readonly<Record<string, string>>>
>;
export type FeedMap = Map<string, EntryURL[]>;

// Parsers
const rssParser = new Parser<object, object>();
const domParser = new DOMParser();

// RSS Parser return data
export type rssData = Parser.Output<object>;
export type rssItem = Parser.Item;

// ===== HTML HANDLING ===== //

// Fetch a HTML file and return it as an element object
export const loadHTML = (file: string): TaskEither<unknown, HTMLElement> =>
	TE.flatMap(parseHTML)(loadHTMLText(file));

// Load a HTML file as text
const loadHTMLText = (file: string): TaskEither<unknown, string> =>
	TE.tryCatch(
		() =>
			fetch(file)
				.then((responseHTML: Response) => {
					if (responseHTML.ok) {
						return responseHTML.text();
					}

					throw new Error(
						"A error occured HTTP. Code: " + responseHTML.status.toString(),
					);
				})
				.catch((reason: unknown) => {
					throw reason;
				}),
		_id
	);

// Parse a string to a HTML file
export const parseHTML = (html: string): TaskEither<unknown, HTMLElement> =>
	TE.tryCatch(
		() => Promise.resolve(domParser.parseFromString(html, "text/html").body),
		_id
	);

// Parse a string to a HTML file - assume HTML is working all well
export const parseHTMLSafe = (html: string): HTMLElement =>
	domParser.parseFromString(html, "text/html").body;

// Replace & and " to prevent breaking strings
const encodeHTMLAttributeValue = (value: string): string =>
	value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

// Escapes all characters that are potentially dangerous for regex interpretation
const escapeRegexText = (value: string): string =>
	value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

// Takes a HTML string modifies the opening tag of the element
const setHTMLAttribute = (
	html: string,
	attribute: string,
	value: string,
): string => {
	const openTagPattern = /^\s*<([^\s>]+)([^>]*)>/u;
	const nextAttribute = ` ${attribute}="${encodeHTMLAttributeValue(value)}"`;
	const attributePattern = new RegExp(`\\s${escapeRegexText(attribute)}="[^"]*"`, "u");

	return html.replace(
		openTagPattern,
		(_match: string, tagName: string, attributes: string) => {
			const nextAttributes = attributePattern.test(attributes)
				? attributes.replace(attributePattern, nextAttribute)
				: attributes + nextAttribute;

			return `<${tagName}${nextAttributes}>`;
		},
	);
};

// Modify a HTML Element's attributes w/o side effects
export const setHTMLAttributes =
  (attributeMap: Readonly<Record<string, string>>) =>
  	(element: Readonly<HTMLElement>): HTMLElement =>
  		parseHTMLSafe(
  			Object.entries(attributeMap).reduce(
  				(html: string, [attribute, value]: readonly [string, string]) =>
  					setHTMLAttribute(html, attribute, value),
  				element.outerHTML,
  			),
  		);

// Modify child element inner HTML w/o side effects
export const setHTMLChildInnerHTML =
  (childHTMLMap: Readonly<Record<string, string>>) =>
  	(element: Readonly<HTMLElement>): HTMLElement => {
  		const nextElement = parseHTMLSafe(element.outerHTML);

  		Object.entries(childHTMLMap).forEach(
  			([selector, html]: readonly [string, string]) => {
  				nextElement.querySelectorAll(selector).forEach((childElement: Element) => {
  					childElement.innerHTML = html;
  				});
  			},
  		);

  		return nextElement;
  	};

// Modify child element attributes w/o side effects
export const setHTMLChildAttributes =
  (childAttributeMap: Readonly<Record<string, Readonly<Record<string, string>>>>) =>
  	(element: Readonly<HTMLElement>): HTMLElement => {
  		const nextElement = parseHTMLSafe(element.outerHTML);

  		Object.entries(childAttributeMap).forEach(
  			([selector, attributeMap]: readonly [string, Readonly<Record<string, string>>]) => {
  				nextElement.querySelectorAll(selector).forEach((childElement) => {
  					Object.entries(attributeMap).forEach(
  						([attribute, value]: readonly [string, string]) => {
  							childElement.setAttribute(attribute, value);
  						},
  					);
  				});
  			},
  		);

  		return nextElement;
  	};

// ===== JSON HANDLING ===== //

// Get the JSON data as a feed map
export const getFeedMap = (fileName: string): TaskEither<unknown, FeedMap> =>
	TE.map((jsonModule: Readonly<JSONModule>) => {
		const protoFeed = (jsonModule.default ?? jsonModule) as JSONFeedRecord;

		return new Map(
			Object.entries(protoFeed).map(([feedName, entryRecord]) => [
				feedName,
				Object.entries(entryRecord).map(([name, link]) => ({ name, link })),
			]),
		);
	})(getJSON("./src/data/" + fileName + ".json"));

// Retreive JSON file
export const getJSON = (file: string): TaskEither<unknown, JSONModule> =>
	TE.tryCatch(
		() => import(file, { with: { type: "json" } }) as Promise<JSONModule>,
		_id,
	);

// ===== XML HANDLING ===== //

// Retreive XML RSS file
export const getXML = (file: string): TaskEither<unknown, Parser.Output<object>> =>
	TE.flatMap(
		(textXML: string) => TE.tryCatch(() => rssParser.parseString(textXML), _id)
	)(TE.orElse(() => tryGetXML(getProxyURL(file)))(tryGetXML(file)));

// Attempts to get an XML file (sub-function of getXML)
const tryGetXML = (url: string): TaskEither<unknown, string> =>
	TE.tryCatch(
		() =>
			fetch(url)
				.then((responseXML: Response) => {
					if (responseXML.ok) {
						return responseXML.text();
					}

					throw new Error(
						"A error occured HTTP. Code: " + responseXML.status.toString(),
					);
				})
				.catch((reason: unknown) => {
					throw reason;
				}),
		_id
	);
