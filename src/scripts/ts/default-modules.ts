/// <reference types="node" />

import type { Either } from "fp-ts/Either";
import type { TaskEither } from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";

// ===== TYPE EXPORTS ===== //

export const HTTPS404 = "https://oliviax727.github.io/404";

// eslint-disable-next-line no-unused-vars
export type IOFunction<I, O> = (i: I) => Promise<O> | O;

export type OutputFunction<O> = IOFunction<void, O>;

export type EntryFunction<I> = IOFunction<I, void>;

// ===== STANDARD HELPER FUNCTIONS ===== //

export const _id = <A>(error: A): A => error;

// eslint-disable-next-line functional/functional-parameters
export const _stub = (): TaskEither<Error, never> =>
	TE.left(new Error("Unknown Error"));

export const decideUnsafe = <Err, A>(taskEither: TaskEither<Err, A>): Promise<A> =>
	taskEither().then((either: Either<Err, A>) => {
		if (E.isLeft(either)) {
			throw E.toError(either.left);
		}

		return either.right;
	});

// ===== URI FUNCTIONS ===== //

const RSS_CORS_PROXY = "https://rss-proxy.oliviahrwalters.workers.dev/?url=";

// Adds the cloudfare proxy to the URL
export const getProxyURL = (url: string): string =>
	RSS_CORS_PROXY + encodeURIComponent(url);

// Convert a URL into a UUID
export const uuidURL = (url: string): string =>
	encodeIDBase64(urlToNumber(url));

const ASCII_LIST = [
	...Array.from({ length: 10 }, (_e, i) => String.fromCharCode(i + 48)), // Numbers, Base 10, 0-9
	...Array.from({ length: 26 }, (_e, i) => String.fromCharCode(i + 65)), // Alphabet, Capitalised, A-Z
	...Array.from({ length: 26 }, (_e, i) => String.fromCharCode(i + 97)), // Alphabet, Lowercase, a-z
	// URI Query string Unreserved parameters
	"-",
	"_",
];

// Convert a URL into a UUID
const urlToNumber = (url: string): bigint =>
	Array.from(url).reduce(
		(seed: bigint, char: string) => (seed << 7n) +  BigInt(char.charCodeAt(0)),
		0n,
	);

// Encode a number into base 64, uses the BigInt class
const encodeIDBase64 = (uuid: bigint): string => {
	const max = log64BigInt(uuid); // Must be an integer given uuid
	const base = 64n;
	const radices = Array.from(
		{ length: Number(max) + 1 },
		(_e, i) => BigInt(Number(max) - i),
	);

	const initial: readonly [bigint, string] = [uuid, ""];

	const [, encoding] = radices.reduce<readonly [bigint, string]>(
		function ([remainder, encoded]: readonly [bigint, string],
			radix: bigint): readonly [bigint, string] {
			const place = base ** radix;

			const digit = remainder / place;

			const nextChar = ASCII_LIST[Number(digit)] ?? "";

			return [remainder - (digit * place), encoded + nextChar] as const;
		},
		initial,
	);

	return encoding;
};

// Takes the truncated Base-64 Logarithim of a number
const log64BigInt = (n: bigint): bigint => log2BigInt(n) / log2BigInt(64n);

// Takes the truncated Base-2 Logarithim of a number
const log2BigInt = (n: bigint): bigint => BigInt(n.toString(2).length - 1);
