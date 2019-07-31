/* @flow */

import { getClientID, getSDKMeta, getPayPalDomain, isPayPalDomain, getStorageState } from '@paypal/sdk-client/src';
import { FUNDING } from '@paypal/sdk-constants/src';
import { values, extendUrl } from 'belter/src';
import { getDomain } from 'cross-domain-utils/src';

import { REMEMBER_FUNDING_URI } from './config';
import { QUERY_PARAM } from './constants';

// eslint-disable-next-line flowtype/require-exact-type
type RememberedFundingFrameOpts = {
    expiry? : number
};

function dropRememberFundingFrame(fundingSources : $ReadOnlyArray<$Values<typeof FUNDING>>, opts? : RememberedFundingFrameOpts = {}) {
    const { expiry } = opts;

    const frame = document.createElement('iframe');
    frame.style.display = 'none';
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('src', extendUrl(`${ getPayPalDomain() }${ REMEMBER_FUNDING_URI }`, {
        query: {
            [ QUERY_PARAM.DOMAIN ]:          getDomain(),
            [ QUERY_PARAM.CLIENT_ID ]:       getClientID(),
            [ QUERY_PARAM.SDK_META ]:        getSDKMeta(),
            [ QUERY_PARAM.FUNDING_SOURCES ]: fundingSources.join(','),
            [ QUERY_PARAM.EXPIRY ]:          (expiry || '').toString()
        }
    }));

    const container = document.body;

    if (!container) {
        throw new Error(`Can not find body`);
    }

    container.appendChild(frame);
}

type RememberFundingOpts = {|
    cookie? : boolean,
    expiry? : number
|};

const getDefaultRememberFundingOpts = () : RememberFundingOpts => {
    // $FlowFixMe
    return {};
};

export function rememberFunding(fundingSources : $ReadOnlyArray<$Values<typeof FUNDING>>, opts? : RememberFundingOpts = getDefaultRememberFundingOpts()) {
    const validFunding = values(FUNDING);
    const { cookie = true, expiry } = opts;

    if (!fundingSources || !fundingSources.length) {
        throw new Error(`Pass array of funding sources`);
    }

    for (const fundingSource of fundingSources) {
        if (validFunding.indexOf(fundingSource) === -1) {
            throw new Error(`Invalid funding source: ${ fundingSource }`);
        }
    }

    if (cookie && !isPayPalDomain()) {
        dropRememberFundingFrame(fundingSources, { expiry });
    }

    getStorageState(storage => {
        storage.funding = storage.fundingConfig || {};
        for (const fundingSource of fundingSources) {
            const fundingStorage = storage.funding[fundingSource] = storage.funding[fundingSource] || {};
            fundingStorage.remembered = true;

            if (expiry) {
                fundingStorage.expiry = Date.now() + (expiry * 1000);
            }
        }
    });
}

export function getRememberedFunding() : $ReadOnlyArray<$Values<typeof FUNDING>> {
    return getStorageState(storage => {
        storage.funding = storage.funding || {};
        // $FlowFixMe
        return Object.keys(storage.funding).filter(fundingSource => {
            const fundingStorage = storage.funding[fundingSource];

            if (fundingStorage.expiry && (Date.now() > fundingStorage.expiry)) {
                return false;
            }

            if (storage.funding[fundingSource].remembered) {
                return true;
            }
            
            return false;
        });
    });
}
