/* @flow */

import { FUNDING } from "@paypal/sdk-constants";

type CookieSettings = {
  [$Values<typeof FUNDING>]: {|
    legacyKey?: string,
    legacyRead?: boolean,
    legacyWrite?: boolean,
    expiry?: number,
  |},
};

export const COOKIE_SETTINGS: CookieSettings = {
  [FUNDING.PAYPAL]: {
    legacyKey: "login_email",
    legacyRead: true,
    legacyWrite: false,
  },
  [FUNDING.VENMO]: {
    legacyKey: "pwv",
    legacyRead: true,
    legacyWrite: true,
  },
};
