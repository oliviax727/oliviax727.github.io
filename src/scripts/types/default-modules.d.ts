import type { TaskEither } from "fp-ts/TaskEither";
export declare const HTTPS404 = "https://oliviax727.github.io/404";
export type EntryFunction = () => Promise<void> | void;
export type OutputFunction = () => Promise<object | string> | object | string;
export declare const _id: <A>(error: A) => A;
export declare const _stub: () => TaskEither<Error, never>;
export declare const decideUnsafe: <Err, A>(taskEither: TaskEither<Err, A>) => Promise<A>;
