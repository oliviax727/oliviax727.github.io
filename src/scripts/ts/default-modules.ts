/// <reference types="node" />

import type { Either } from "fp-ts/Either";
import type { TaskEither } from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";

// ===== TYPE EXPORTS ===== //

export const HTTPS404 = "https://oliviax727.github.io/404";

export type EntryFunction = () => Promise<void> | void;

export type OutputFunction = () => Promise<object | string> | object | string;

export const _id = <A>(error: A): A => error;

// eslint-disable-next-line functional/functional-parameters
export const _stub = (): TaskEither<Error, never> => TE.left(new Error("Unknown Error"));

export const decideUnsafe = <Err, A>(taskEither: TaskEither<Err, A>): Promise<A> =>
	taskEither().then((either: Either<Err, A>) => {
		if (E.isLeft(either)) {
			throw E.toError(either.left);
		}

		return either.right;
	});
