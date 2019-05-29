/* @flow */

import { FUNDING } from '@paypal/sdk-constants/src';
import { parseQuery } from 'belter/src';
import { getDomain } from 'cross-domain-utils/src';
import { getClientID, getSDKMeta } from '@paypal/sdk-client/src';

import { rememberFunding } from '../../src';

describe(`eligibility cases`, () => {
    beforeEach(() => {
        for (const frame of document.querySelectorAll('iframe')) {
            if (frame.parentNode) {
                frame.parentNode.removeChild(frame);
            }
        }
    });

    it('should successfully remember a funding source', () => {
        rememberFunding([ FUNDING.VENMO ]);

        const iframe = document.querySelector('iframe');

        if (!iframe) {
            throw new Error(`Expected iframe to be dropped on page`);
        }

        const src = iframe.getAttribute('src');

        if (!src) {
            throw new Error(`Expected iframe to have src`);
        }

        const query = parseQuery(src.split('?')[1]);

        if (query.domain !== getDomain()) {
            throw new Error(`Expected domain to be ${ getDomain() }, got ${ query.domain }`);
        }

        if (query.sdkMeta !== getSDKMeta()) {
            throw new Error(`Expected sdkMeta to be ${ getSDKMeta() }, got ${ query.sdkMeta }`);
        }

        if (query['client-id'] !== getClientID()) {
            throw new Error(`Expected client-id to be ${ getClientID() }, got ${ query['client-id']  }`);
        }

        if (query['funding-sources'] !== [ FUNDING.VENMO ].join(',')) {
            throw new Error(`Expected funding-sources to be ${ [ FUNDING.VENMO ].join(',') }, got ${ query['funding-sources']  }`);
        }
    });

    it('should remember multiple funding sources', () => {
        rememberFunding([ FUNDING.VENMO, FUNDING.ITAU ]);

        const iframe = document.querySelector('iframe');

        if (!iframe) {
            throw new Error(`Expected iframe to be dropped on page`);
        }

        const src = iframe.getAttribute('src');

        if (!src) {
            throw new Error(`Expected iframe to have src`);
        }

        const query = parseQuery(src.split('?')[1]);

        if (query['funding-sources'] !== [ FUNDING.VENMO, FUNDING.ITAU ].join(',')) {
            throw new Error(`Expected funding-sources to be ${ [ FUNDING.VENMO, FUNDING.ITAU ].join(',') }, got ${ query['funding-sources']  }`);
        }
    });

    it('should error out if no funding sources passed', () => {
        let error;

        try {
            // $FlowFixMe
            rememberFunding();
        } catch (err) {
            error = err;
        }

        if (!error) {
            throw new Error(`Expected error to be thrown`);
        }
    });

    it('should error out if empty funding sources passed', () => {
        let error;

        try {
            rememberFunding([]);
        } catch (err) {
            error = err;
        }

        if (!error) {
            throw new Error(`Expected error to be thrown`);
        }
    });

    it('should error out if invalid funding source passed', () => {
        let error;

        try {
            // $FlowFixMe
            rememberFunding([ 'foo' ]);
        } catch (err) {
            error = err;
        }

        if (!error) {
            throw new Error(`Expected error to be thrown`);
        }
    });
});
