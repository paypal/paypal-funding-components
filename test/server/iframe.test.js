/* @flow */

import cheerio from 'cheerio';
import { FUNDING } from '@paypal/sdk-constants';

import { rememberFundingIframe } from '../../server';

import { getMockReq, getMockRes, mockSDKMeta } from './mocks';

test('should successfully remember a funding source in the cookie using an iframe', () => {
    const clientID = 'abc1234';
    const testDomain = 'https://www.foobar.com';
    const sdkUrl = 'https://www.paypal.com/sdk/js?client-id=xyz';

    const req = getMockReq();
    const res = getMockRes();

    const middleware = rememberFundingIframe({
        allowedClients: {
            [ clientID ]: {
                allowedFunding: [
                    FUNDING.VENMO
                ],
                allowedDomains: [
                    testDomain
                ]
            }
        }
    });

    req.query = {
        'client-id':       clientID,
        'funding-sources': `${ FUNDING.VENMO }`,
        'sdkMeta':         mockSDKMeta(sdkUrl),
        'domain':          testDomain
    };
    
    middleware(req, res);

    if (res._status !== 200) {
        throw new Error(`Expected status 200, got ${ res._status } ${ res.body }`);
    }

    const $ = cheerio.load(res.body);

    const script = $('script[src]');
    const src = script.attr('src');

    if (src !== sdkUrl) {
        throw new Error(`Expected to find script with src of ${ sdkUrl }, got ${ src }`);
    }

    const rememberScript = $('script:not(script[src])');
    const source = rememberScript.html().trim();

    if (source !== `paypal.rememberFunding(${ JSON.stringify([ FUNDING.VENMO ]) });`) {
        throw new Error(`Unexpected script: ${ source }`);
    }


    const sdkCookie = JSON.parse(res.cookies.js_sdk);

    if (!sdkCookie.funding[FUNDING.VENMO].remembered) {
        throw new Error(`Expected ${ FUNDING.VENMO } to be remembered`);
    }
});

test('should successfully remember multiple funding sources in the cookie using an iframe', () => {
    const clientID = 'abc1234';
    const testDomain = 'https://www.foobar.com';
    const sdkUrl = 'https://www.paypal.com/sdk/js?client-id=xyz';

    const req = getMockReq();
    const res = getMockRes();

    const middleware = rememberFundingIframe({
        allowedClients: {
            [ clientID ]: {
                allowedFunding: [
                    FUNDING.VENMO,
                    FUNDING.ITAU
                ],
                allowedDomains: [
                    testDomain
                ]
            }
        }
    });

    req.query = {
        'client-id':       clientID,
        'funding-sources': `${ FUNDING.VENMO },${ FUNDING.ITAU }`,
        'sdkMeta':         mockSDKMeta(sdkUrl),
        'domain':          testDomain
    };
    
    middleware(req, res);

    if (res._status !== 200) {
        throw new Error(`Expected status 200, got ${ res._status } ${ res.body }`);
    }

    const $ = cheerio.load(res.body);

    const script = $('script[src]');
    const src = script.attr('src');

    if (src !== sdkUrl) {
        throw new Error(`Expected to find script with src of ${ sdkUrl }, got ${ src }`);
    }

    const rememberScript = $('script:not(script[src])');
    const source = rememberScript.html().trim();

    if (source !== `paypal.rememberFunding(${ JSON.stringify([ FUNDING.VENMO, FUNDING.ITAU ]) });`) {
        throw new Error(`Unexpected script: ${ source }`);
    }

    const sdkCookie = JSON.parse(res.cookies.js_sdk);

    if (!sdkCookie.funding[FUNDING.VENMO].remembered) {
        throw new Error(`Expected ${ FUNDING.VENMO } to be remembered`);
    }

    if (!sdkCookie.funding[FUNDING.ITAU].remembered) {
        throw new Error(`Expected ${ FUNDING.ITAU } to be remembered`);
    }
});

test('should give a 400 error if no client-id passed', () => {
    const clientID = 'abc1234';
    const testDomain = 'https://www.foobar.com';
    const sdkUrl = 'https://www.paypal.com/sdk/js?client-id=xyz';

    const req = getMockReq();
    const res = getMockRes();

    const middleware = rememberFundingIframe({
        allowedClients: {
            [ clientID ]: {
                allowedFunding: [
                    FUNDING.VENMO
                ],
                allowedDomains: [
                    testDomain
                ]
            }
        }
    });

    req.query = {
        'funding-sources': `${ FUNDING.VENMO }`,
        'sdkMeta':         mockSDKMeta(sdkUrl),
        'domain':          testDomain
    };
    
    middleware(req, res);

    if (res._status !== 400) {
        throw new Error(`Expected status 400, got ${ res._status } ${ res.body }`);
    }
});

test('should give a 400 error if no funding-sources passed', () => {
    const clientID = 'abc1234';
    const testDomain = 'https://www.foobar.com';
    const sdkUrl = 'https://www.paypal.com/sdk/js?client-id=xyz';

    const req = getMockReq();
    const res = getMockRes();

    const middleware = rememberFundingIframe({
        allowedClients: {
            [ clientID ]: {
                allowedFunding: [
                    FUNDING.VENMO
                ],
                allowedDomains: [
                    testDomain
                ]
            }
        }
    });

    req.query = {
        'client-id':       clientID,
        'sdkMeta':         mockSDKMeta(sdkUrl),
        'domain':          testDomain
    };
    
    middleware(req, res);

    if (res._status !== 400) {
        throw new Error(`Expected status 400, got ${ res._status } ${ res.body }`);
    }
});

test('should give a 400 error if no sdkMeta passed', () => {
    const clientID = 'abc1234';
    const testDomain = 'https://www.foobar.com';

    const req = getMockReq();
    const res = getMockRes();

    const middleware = rememberFundingIframe({
        allowedClients: {
            [ clientID ]: {
                allowedFunding: [
                    FUNDING.VENMO
                ],
                allowedDomains: [
                    testDomain
                ]
            }
        }
    });

    req.query = {
        'client-id':       clientID,
        'funding-sources': `${ FUNDING.VENMO }`,
        'domain':          testDomain
    };
    
    middleware(req, res);

    if (res._status !== 400) {
        throw new Error(`Expected status 400, got ${ res._status } ${ res.body }`);
    }
});

test('should give a 400 error if invalid sdkMeta passed', () => {
    const clientID = 'abc1234';
    const testDomain = 'https://www.foobar.com';

    const req = getMockReq();
    const res = getMockRes();

    const middleware = rememberFundingIframe({
        allowedClients: {
            [ clientID ]: {
                allowedFunding: [
                    FUNDING.VENMO
                ],
                allowedDomains: [
                    testDomain
                ]
            }
        }
    });

    req.query = {
        'client-id':       clientID,
        'funding-sources': `${ FUNDING.VENMO }`,
        'domain':          testDomain,
        'sdkMeta':         'abc1234'
    };
    
    middleware(req, res);

    if (res._status !== 400) {
        throw new Error(`Expected status 400, got ${ res._status } ${ res.body }`);
    }
});

test('should give a 400 error if no domain passed', () => {
    const clientID = 'abc1234';
    const testDomain = 'https://www.foobar.com';
    const sdkUrl = 'https://www.paypal.com/sdk/js?client-id=xyz';

    const req = getMockReq();
    const res = getMockRes();

    const middleware = rememberFundingIframe({
        allowedClients: {
            [ clientID ]: {
                allowedFunding: [
                    FUNDING.VENMO
                ],
                allowedDomains: [
                    testDomain
                ]
            }
        }
    });

    req.query = {
        'client-id':       clientID,
        'funding-sources': `${ FUNDING.VENMO }`,
        'sdkMeta':         mockSDKMeta(sdkUrl)
    };
    
    middleware(req, res);

    if (res._status !== 400) {
        throw new Error(`Expected status 400, got ${ res._status } ${ res.body }`);
    }
});

test('should give a 400 error if disallowed client-id passed', () => {
    const clientID = 'abc1234';
    const testDomain = 'https://www.foobar.com';
    const sdkUrl = 'https://www.paypal.com/sdk/js?client-id=xyz';

    const req = getMockReq();
    const res = getMockRes();

    const middleware = rememberFundingIframe({
        allowedClients: {
            'xyz1234': {
                allowedFunding: [
                    FUNDING.VENMO
                ],
                allowedDomains: [
                    testDomain
                ]
            }
        }
    });

    req.query = {
        'client-id':       clientID,
        'funding-sources': `${ FUNDING.VENMO }`,
        'sdkMeta':         mockSDKMeta(sdkUrl),
        'domain':          testDomain
    };
    
    middleware(req, res);

    if (res._status !== 400) {
        throw new Error(`Expected status 400, got ${ res._status } ${ res.body }`);
    }
});

test('should give a 400 error if disallowed domain passed', () => {
    const clientID = 'abc1234';
    const testDomain = 'https://www.foobar.com';
    const sdkUrl = 'https://www.paypal.com/sdk/js?client-id=xyz';

    const req = getMockReq();
    const res = getMockRes();

    const middleware = rememberFundingIframe({
        allowedClients: {
            [ clientID ]: {
                allowedFunding: [
                    FUNDING.VENMO
                ],
                allowedDomains: [
                    'https://www.zombo.com'
                ]
            }
        }
    });

    req.query = {
        'client-id':       clientID,
        'funding-sources': `${ FUNDING.VENMO }`,
        'sdkMeta':         mockSDKMeta(sdkUrl),
        'domain':          testDomain
    };
    
    middleware(req, res);

    if (res._status !== 400) {
        throw new Error(`Expected status 400, got ${ res._status } ${ res.body }`);
    }
});

test('should give a 400 error if invalid funding source passed', () => {
    const clientID = 'abc1234';
    const testDomain = 'https://www.foobar.com';
    const sdkUrl = 'https://www.paypal.com/sdk/js?client-id=xyz';

    const req = getMockReq();
    const res = getMockRes();

    const middleware = rememberFundingIframe({
        allowedClients: {
            [ clientID ]: {
                allowedFunding: [
                    FUNDING.VENMO
                ],
                allowedDomains: [
                    testDomain
                ]
            }
        }
    });

    req.query = {
        'client-id':       clientID,
        'funding-sources': `foopay`,
        'sdkMeta':         mockSDKMeta(sdkUrl),
        'domain':          testDomain
    };
    
    middleware(req, res);

    if (res._status !== 400) {
        throw new Error(`Expected status 400, got ${ res._status } ${ res.body }`);
    }
});

test('should give a 400 error if disallowed funding-source passed', () => {
    const clientID = 'abc1234';
    const testDomain = 'https://www.foobar.com';
    const sdkUrl = 'https://www.paypal.com/sdk/js?client-id=xyz';

    const req = getMockReq();
    const res = getMockRes();

    const middleware = rememberFundingIframe({
        allowedClients: {
            [ clientID ]: {
                allowedFunding: [
                    FUNDING.VENMO
                ],
                allowedDomains: [
                    testDomain
                ]
            }
        }
    });

    req.query = {
        'client-id':       clientID,
        'funding-sources': `${ FUNDING.ITAU }`,
        'sdkMeta':         mockSDKMeta(sdkUrl),
        'domain':          testDomain
    };
    
    middleware(req, res);

    if (res._status !== 400) {
        throw new Error(`Expected status 400, got ${ res._status } ${ res.body }`);
    }
});
