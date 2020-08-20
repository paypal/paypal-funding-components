/* @flow */

import { unpackSDKMeta } from '@paypal/sdk-client';
import { FUNDING } from '@paypal/sdk-constants';

import type { ExpressRequest, ExpressResponse } from './types';
import { QUERY_PARAM, HTTP_RESPONSE_HEADER } from './constants';
import { getSDKCookie, writeSDKCookie, type CookiesType } from './cookie';
import { getNonce, getQuery, buildCSP, getTimestamp, isIE, safeJSON } from './util';
import { COOKIE_SETTINGS } from './config';

type IsFundingRememberedOptions = {|
    cookies? : CookiesType
|};

const getDefaultIsFundingRememberedOptions = () : IsFundingRememberedOptions => {
    // $FlowFixMe
    return {};
};

export function isFundingRemembered(req : ExpressRequest, fundingSource : $Values<typeof FUNDING>, opts? : IsFundingRememberedOptions = getDefaultIsFundingRememberedOptions()) : boolean {
    const cookies = opts.cookies || req.cookies || {};
    const cookieSettings = COOKIE_SETTINGS[fundingSource] || {};

    if (cookieSettings.legacyRead && cookieSettings.legacyKey && cookies[cookieSettings.legacyKey]) {
        return true;
    }
    
    const sdkCookie = getSDKCookie(req, cookies);
    const funding = sdkCookie.funding || {};
    const fundingConfig = funding[fundingSource] || {};

    if (fundingConfig.expiry && fundingConfig.expiry < getTimestamp()) {
        return false;
    }

    return Boolean(fundingConfig.remembered);
}

// eslint-disable-next-line flowtype/require-exact-type
type RememberFundingOptions = {
    expiry? : number
};

export function rememberFunding(req : ExpressRequest, res : ExpressResponse, fundingSources : $ReadOnlyArray<$Values<typeof FUNDING>>, opts? : RememberFundingOptions = {}) {
    const { expiry } = opts;

    const sdkCookie = getSDKCookie(req);
    const funding = sdkCookie.funding = sdkCookie.funding || {};

    for (const fundingSource of fundingSources) {
        const fundingConfig =  funding[fundingSource] = sdkCookie.funding[fundingSource] || {};
        fundingConfig.remembered = true;

        const cookieSettings = COOKIE_SETTINGS[fundingSource] || {};
        if (cookieSettings.legacyWrite && cookieSettings.legacyKey) {
            res.cookie(cookieSettings.legacyKey, '1');
        }

        if (expiry) {
            fundingConfig.expiry = getTimestamp() + expiry;
        }
    }

    writeSDKCookie(res, sdkCookie);
}

type RememberFundingMiddleware = (ExpressRequest, ExpressResponse) => void | ExpressResponse;

function parseFundingSources(commaSeparatedFundingSources) : $ReadOnlyArray<$Values<typeof FUNDING>> {
    return commaSeparatedFundingSources.split(',');
}

function setSecurityHeaders(req : ExpressRequest, res : ExpressResponse, { nonce, domain } : {| nonce : string, domain : string |}) {
    const cspHeader = isIE(req)
        ? HTTP_RESPONSE_HEADER.X_CONTENT_SECURITY_POLICY
        : HTTP_RESPONSE_HEADER.CONTENT_SECURITY_POLICY;

    res.setHeader(cspHeader, buildCSP({
        'script-src':      `'self' https://*.paypal.com:* 'nonce-${ nonce }'`,
        'connect-src':     `'self' https://*.paypal.com:*`,
        'frame-ancestors': `${ domain }`,
        'img-src':         `data:`,
        'style-src':       `'none'`,
        'frame-src':       `'none'`,
        'font-src':        `'none'`,
        'object-src':      `'none'`,
        'media-src':       `'none'`
    }));

    res.setHeader(HTTP_RESPONSE_HEADER.ACCESS_CONTROL_ALLOW_ORIGIN, domain);
}

type RememberFundingIframeOptions = {|
    allowedClients : {
        [string] : {|
            allowedFunding : $ReadOnlyArray<$Values<typeof FUNDING>>,
            allowedDomains : $ReadOnlyArray<string>
        |}
    }
|};

export function rememberFundingIframe({ allowedClients = {} } : RememberFundingIframeOptions) : RememberFundingMiddleware {
    return (req, res) => {
        const {
            [ QUERY_PARAM.DOMAIN ]:          domain,
            [ QUERY_PARAM.FUNDING_SOURCES ]: commaSeparatedFundingSources,
            [ QUERY_PARAM.SDK_META ]:        sdkMeta,
            [ QUERY_PARAM.CLIENT_ID ]:       clientID,
            [ QUERY_PARAM.EXPIRY ]:          expiryTime
        } = getQuery(req);

        if (!commaSeparatedFundingSources) {
            return res.status(400).send(`Expected ${ QUERY_PARAM.FUNDING_SOURCES } query param`);
        }

        if (!sdkMeta) {
            return res.status(400).send(`Expected ${ QUERY_PARAM.SDK_META } query param`);
        }

        if (!clientID) {
            return res.status(400).send(`Expected ${ QUERY_PARAM.CLIENT_ID } query param`);
        }

        if (!domain || !domain.match(/^https?:\/\/[a-zA-Z_0-9.-]+$/)) {
            return res.status(400).send(`Expected ${ QUERY_PARAM.DOMAIN } query param`);
        }

        if (expiryTime && !expiryTime.match(/^\d+$/)) {
            return res.status(400).send(`Expected ${ QUERY_PARAM.EXPIRY } query param to be a number`);
        }

        let expiry;
        if (expiryTime) {
            expiry = parseInt(expiryTime, 10);
        }

        const clientConfig = allowedClients[clientID];

        if (!clientConfig) {
            return res.status(400).send(`Invalid client id`);
        }

        const { allowedFunding, allowedDomains } = clientConfig;
        const fundingSources = parseFundingSources(commaSeparatedFundingSources);
        const validFunding = Object.values(FUNDING);
    
        for (const fundingSource of fundingSources) {
            if (validFunding.indexOf(fundingSource) === -1) {
                return res.status(400).send(`Invalid funding source`);
            }

            if (allowedFunding.indexOf(fundingSource) === -1) {
                return res.status(400).send(`Funding source not allowed for client`);
            }
        }

        if (allowedDomains.indexOf(domain) === -1) {
            return res.status(400).send(`Domain not allowed for client`);
        }

        let meta;

        try {
            meta = unpackSDKMeta(req.query.sdkMeta);
        } catch (err) {
            return res.status(400).send(`Invalid sdk meta`);
        }

        rememberFunding(req, res, fundingSources, { expiry });

        const nonce = getNonce();
        const { getSDKLoader } = meta;

        setSecurityHeaders(req, res, { domain, nonce });

        res.status(200).send(`
            <!DOCTYPE html>
            <head>
                <link rel="icon" href="data:;base64,=">
                ${ getSDKLoader({ nonce }) }
                <script nonce="${ nonce }">
                    paypal.rememberFunding(${ safeJSON(fundingSources) }, ${ safeJSON({ expiry }) });
                </script>
            </head>
        `);
    };
}
