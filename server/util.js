/* @flow */

// eslint-disable-next-line import/no-nodejs-modules
import crypto from "crypto";

import type { ExpressRequest } from "./types";

export function getNonce(): string {
  return crypto
    .randomBytes(16)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]+/g, "");
}

export function getQuery(req: ExpressRequest): { [string]: string } {
  const result = {};
  for (const key of Object.keys(req.query)) {
    const val = req.query[key];
    if (key && val && typeof val === "string") {
      result[key] = val;
    }
  }
  return result;
}

export function buildCSP(obj: { [string]: string }): string {
  return Object.keys(obj)
    .map((key) => {
      return `${key} ${obj[key]};`;
    })
    .join("");
}

const TIME_OFFSET = 1564500000;

export function normalizeTimestamp(timestamp: number): number {
  return Math.floor(timestamp / 1000) - TIME_OFFSET;
}

export function getTimestamp(): number {
  return normalizeTimestamp(Date.now());
}

export function isIE(req: ExpressRequest): boolean {
  const userAgent = req.get("user-agent");
  return Boolean(userAgent && /Edge|MSIE|rv:10|rv:11/i.test(userAgent));
}

// eslint-disable-next-line no-unused-vars, flowtype/no-weak-types
export function safeJSON(...args: $ReadOnlyArray<any>): string {
  return JSON.stringify
    .apply(null, arguments)
    .replace(/</g, "\\u003C")
    .replace(/>/g, "\\u003E");
}
