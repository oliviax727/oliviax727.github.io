"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decideUnsafe = exports._stub = exports._id = exports.HTTPS404 = void 0;
var E = _interopRequireWildcard(require("fp-ts/Either"));
var TE = _interopRequireWildcard(require("fp-ts/TaskEither"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/// <reference types="node" />

// ===== TYPE EXPORTS ===== //
const HTTPS404 = exports.HTTPS404 = "https://oliviax727.github.io/404";
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
exports.decideUnsafe = decideUnsafe;