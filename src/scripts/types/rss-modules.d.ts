import type { TaskEither } from "fp-ts/TaskEither";
interface EntryURL {
    name: string;
    link: string;
}
interface ParentData {
    uuid: number;
    name: string;
    title: string;
    link: string;
    imageUrl?: string;
    imageName?: string;
}
interface Entry {
    uuid: number;
    title: string;
    link: string;
    description: string;
    date?: Date;
    parentData: ParentData;
    read: boolean;
    dismissed: boolean;
}
export declare function createFeed(jsonFile: string, feedName: string): TaskEither<unknown, Entry[]>;
export declare function loadXML(urlList: readonly EntryURL[]): TaskEither<unknown, Entry[]>;
export {};
