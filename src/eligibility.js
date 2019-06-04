/* @flow */

import { getClientID, getSDKMeta, getPayPalDomain, isPayPalDomain, getStorageState } from '@paypal/sdk-client/src';
import { FUNDING } from '@paypal/sdk-constants/src';
import { values, extendUrl } from 'belter/src';
import { getDomain } from 'cross-domain-utils/src';

import { REMEMBER_FUNDING_URI } from './config';
import { QUERY_PARAM } from './constants';

function dropRememberFundingFrame(fundingSources : $ReadOnlyArray<$Values<typeof FUNDING>>) {
    const frame = document.createElement('iframe');
    frame.style.display = 'none';
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('src', extendUrl(`${ getPayPalDomain() }${ REMEMBER_FUNDING_URI }`, {
        query: {
            [ QUERY_PARAM.DOMAIN ]:          getDomain(),
            [ QUERY_PARAM.CLIENT_ID ]:       getClientID(),
            [ QUERY_PARAM.SDK_META ]:        getSDKMeta(),
            [ QUERY_PARAM.FUNDING_SOURCES ]: fundingSources.join(',')
        }
    }));

    const container = document.body;

    if (!container) {
        throw new Error(`Can not find body`);
    }

    container.appendChild(frame);
}

type RememberFundingOpts = {|
    cookie : boolean
|};

const getDefaultRememberFundingOpts = () : RememberFundingOpts => {
    // $FlowFixMe
    return {};
};

export function rememberFunding(fundingSources : $ReadOnlyArray<$Values<typeof FUNDING>>, opts? : RememberFundingOpts = getDefaultRememberFundingOpts()) {
    const validFunding = values(FUNDING);
    const { cookie = true } = opts;

    if (!fundingSources || !fundingSources.length) {
        throw new Error(`Pass array of funding sources`);
    }

    for (const fundingSource of fundingSources) {
        if (validFunding.indexOf(fundingSource) === -1) {
            throw new Error(`Invalid funding source: ${ fundingSource }`);
        }
    }

    if (cookie && !isPayPalDomain()) {
        dropRememberFundingFrame(fundingSources);
    }

    getStorageState(storage => {
        storage.rememberedFunding = storage.rememberedFunding || [];
        for (const fundingSource of fundingSources) {
            if (storage.rememberedFunding.indexOf(fundingSource) === -1) {
                storage.rememberedFunding.push(fundingSource);
            }
        }
    });
}

export function getRememberedFunding() : $ReadOnlyArray<$Values<typeof FUNDING>> {
    return getStorageState(storage => {
        return storage.rememberedFunding || [];
    });
}
