import Parser from "rss-parser";
import type { TaskEither } from "fp-ts/TaskEither";
export interface EntryURL {
    name: string;
    link: string;
}
interface JSONModule {
    default?: unknown;
}
export type FeedMap = Map<string, EntryURL[]>;
export type rssData = Parser.Output<object>;
export type rssItem = Parser.Item;
export declare const loadHTML: (file: string) => TaskEither<unknown, HTMLElement>;
export declare const parseHTML: (html: string) => TaskEither<unknown, HTMLElement>;
export declare const parseHTMLSafe: (html: string) => HTMLElement;
export declare const setHTMLAttributes: (attributeMap: Readonly<Record<string, string>>) => (element: Readonly<HTMLElement>) => HTMLElement;
export declare const setHTMLChildInnerHTML: (childHTMLMap: Readonly<Record<string, string>>) => (element: Readonly<HTMLElement>) => HTMLElement;
export declare const setHTMLChildAttributes: (childAttributeMap: Readonly<Record<string, Readonly<Record<string, string>>>>) => (element: Readonly<HTMLElement>) => HTMLElement;
export declare const getFeedMap: (fileName: string) => TaskEither<unknown, FeedMap>;
export declare const getJSON: (file: string) => TaskEither<unknown, JSONModule>;
export declare const getXML: (file: string) => TaskEither<unknown, Parser.Output<object>>;
export {};
