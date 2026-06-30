"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uuidURL = exports.getProxyURL = exports.decideUnsafe = exports._stub = exports._id = exports.HTTPS404 = void 0;
var E = _interopRequireWildcard(require("fp-ts/Either"));
var TE = _interopRequireWildcard(require("fp-ts/TaskEither"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/// <reference types="node" />

// ===== TYPE EXPORTS ===== //
const HTTPS404 = exports.HTTPS404 = "https://oliviax727.github.io/404";
// ===== STANDARD HELPER FUNCTIONS ===== //
const _id = error => error;
// eslint-disable-next-line functional/functional-parameters
exports._id = _id;
const _stub = () => TE.left(new Error("Unknown Error"));
exports._stub = _stub;
const decideUnsafe = taskEither => taskEither().then(either => {
  if (E.isLeft(either)) {
    throw E.toError(either.left);
  }
  return either.right;
});
// ===== URI FUNCTIONS ===== //
exports.decideUnsafe = decideUnsafe;
const RSS_CORS_PROXY = "https://rss-proxy.oliviahrwalters.workers.dev/?url=";
// Adds the cloudfare proxy to the URL
const getProxyURL = url => RSS_CORS_PROXY + encodeURIComponent(url);
// Convert a URL into a UUID
exports.getProxyURL = getProxyURL;
const uuidURL = url => encodeIDBase64(urlToNumber(url));
exports.uuidURL = uuidURL;
const ASCII_LIST = [...Array.from({
  length: 10
}, (_e, i) => String.fromCharCode(i + 48)),
// Numbers, Base 10, 0-9
...Array.from({
  length: 26
}, (_e, i) => String.fromCharCode(i + 65)),
// Alphabet, Capitalised, A-Z
...Array.from({
  length: 26
}, (_e, i) => String.fromCharCode(i + 97)),
// Alphabet, Lowercase, a-z
// URI Query string Unreserved parameters
"-", "_"];
// Convert a URL into a UUID
const urlToNumber = url => Array.from(url).reduce((seed, char) => (seed << 7n) + BigInt(char.charCodeAt(0)), 0n);
// Encode a number into base 64, uses the BigInt class
const encodeIDBase64 = uuid => {
  const max = log64BigInt(uuid); // Must be an integer given uuid
  const base = 64n;
  const radices = Array.from({
    length: Number(max) + 1
  }, (_e, i) => BigInt(Number(max) - i));
  const initial = [uuid, ""];
  const [, encoding] = radices.reduce(function ([remainder, encoded], radix) {
    const place = base ** radix;
    const digit = remainder / place;
    const nextChar = ASCII_LIST[Number(digit)] ?? "";
    return [remainder - digit * place, encoded + nextChar];
  }, initial);
  return encoding;
};
// Takes the truncated Base-64 Logarithim of a number
const log64BigInt = n => log2BigInt(n) / log2BigInt(64n);
// Takes the truncated Base-2 Logarithim of a number
const log2BigInt = n => BigInt(n.toString(2).length - 1);