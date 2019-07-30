/* @flow */

import { FUNDING } from '@paypal/sdk-constants';

import type { ExpressRequest, ExpressResponse } from './types';
import { JS_SDK_COOKIE } from './constants';

export type CookiesType = {
    [string] : string
};

type SDKCookie = {|
    funding? : {
        [ $Values<typeof FUNDING> ] : {|
            remembered? : boolean,
            expiry? : number
        |}
    }
|};

function getDefaultSDKCookie() : SDKCookie {
    // $FlowFixMe
    return {};
}

export function getSDKCookie(req : ExpressRequest, cookiesOverride? : ?CookiesType) : SDKCookie {
    const cookies = cookiesOverride || req.cookies;

    if (!cookies) {
        throw new Error(`No cookies found or passed`);
    }

    return cookies[JS_SDK_COOKIE]
        ? JSON.parse(cookies[JS_SDK_COOKIE])
        : getDefaultSDKCookie();
}

export function writeSDKCookie(res : ExpressResponse, sdkCookie : SDKCookie) {
    const expires = new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 365 * 10));
    res.cookie(JS_SDK_COOKIE, JSON.stringify(sdkCookie), { expires });
}
