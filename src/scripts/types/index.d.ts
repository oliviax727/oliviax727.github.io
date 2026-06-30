import type { OutputFunction, IOFunction } from "./default-modules";
import type { EntryDataMap } from "./rss-modules.js";
declare const displayNewsreaderLinks: OutputFunction<HTMLElement>;
declare const loadRSS: IOFunction<[EntryDataMap, string], HTMLElement>;
export { loadRSS, displayNewsreaderLinks };
