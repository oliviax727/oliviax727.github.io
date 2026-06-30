import type { TaskEither } from "fp-ts/TaskEither";
interface ParentData {
    uuid: string;
    name: string;
    title: string;
    link: string;
    imageUrl?: string;
    imageName?: string;
}
export interface EntryData {
    read: boolean;
    dismissed: boolean;
}
export type EntryDataMap = Readonly<Map<string, EntryData>>;
export interface Entry {
    uuid: string;
    title: string;
    link: string;
    description: string;
    date?: Date;
    parentData: ParentData;
    data: EntryData;
}
export declare const createRSSFeed: (jsonFile: string, feedName: string, entryData: EntryDataMap) => TaskEither<unknown, HTMLElement>;
export declare const createFeedList: (jsonFile: string) => TaskEither<unknown, HTMLElement>;
export {};
