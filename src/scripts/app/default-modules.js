/// <reference types="node" />
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
// ===== TYPE EXPORTS ===== //
export const HTTPS404 = "https://oliviax727.github.io/404";
// ===== STANDARD HELPER FUNCTIONS ===== //
export const _id = (error) => error;
// eslint-disable-next-line functional/functional-parameters
export const _stub = () => TE.left(new Error("Unknown Error"));
export const decideUnsafe = (taskEither) => taskEither().then((either) => {
    if (E.isLeft(either)) {
        throw E.toError(either.left);
    }
    return either.right;
});
// ===== URI FUNCTIONS ===== //
const RSS_CORS_PROXY = "https://rss-proxy.oliviahrwalters.workers.dev/?url=";
// Adds the cloudfare proxy to the URL
export const getProxyURL = (url) => RSS_CORS_PROXY + encodeURIComponent(url);
// Convert a URL into a UUID
export const uuidURL = (url) => encodeIDBase64(urlToNumber(url));
const ASCII_LIST = [
    ...Array.from({ length: 10 }, (_e, i) => String.fromCharCode(i + 48)), // Numbers, Base 10, 0-9
    ...Array.from({ length: 26 }, (_e, i) => String.fromCharCode(i + 65)), // Alphabet, Capitalised, A-Z
    ...Array.from({ length: 26 }, (_e, i) => String.fromCharCode(i + 97)), // Alphabet, Lowercase, a-z
    // URI Query string Unreserved parameters
    "-",
    "_",
];
// Convert a URL into a UUID
const urlToNumber = (url) => Array.from(url).reduce((seed, char) => (seed << 7n) + BigInt(char.charCodeAt(0)), 0n);
// Encode a number into base 64, uses the BigInt class
const encodeIDBase64 = (uuid) => {
    const max = log64BigInt(uuid); // Must be an integer given uuid
    const base = 64n;
    const radices = Array.from({ length: Number(max) + 1 }, (_e, i) => BigInt(Number(max) - i));
    const initial = [uuid, ""];
    const [, encoding] = radices.reduce(function ([remainder, encoded], radix) {
        const place = base ** radix;
        const digit = remainder / place;
        const nextChar = ASCII_LIST[Number(digit)] ?? "";
        return [remainder - (digit * place), encoded + nextChar];
    }, initial);
    return encoding;
};
// Takes the truncated Base-64 Logarithim of a number
const log64BigInt = (n) => log2BigInt(n) / log2BigInt(64n);
// Takes the truncated Base-2 Logarithim of a number
const log2BigInt = (n) => BigInt(n.toString(2).length - 1);
