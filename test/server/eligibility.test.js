/* @flow */

import { FUNDING } from '@paypal/sdk-constants';

import { rememberFunding, isFundingRemembered } from '../../server';

import { getMockReq, getMockRes } from './mocks';

test('should successfully remember a funding source in the cookie', () => {
    const req = getMockReq();
    const res = getMockRes();

    rememberFunding(req, res, [ FUNDING.VENMO ]);

    const sdkCookie = JSON.parse(res.cookies.js_sdk);

    if (!sdkCookie.funding[FUNDING.VENMO].remembered) {
        throw new Error(`Expected ${ FUNDING.VENMO } to be remembered`);
    }
});

test('should successfully remember a funding source in the cookie in a new request', () => {
    const req = getMockReq();
    const res = getMockRes();

    rememberFunding(req, res, [ FUNDING.VENMO ]);

    const newReq = getMockReq({
        cookies: {
            js_sdk: res.cookies.js_sdk
        }
    });

    if (!isFundingRemembered(newReq, FUNDING.VENMO)) {
        throw new Error(`Expected ${ FUNDING.VENMO } to be remembered`);
    }
});

test('should successfully remember multiple funding sources in the cookie', () => {
    const req = getMockReq();
    const res = getMockRes();

    rememberFunding(req, res, [ FUNDING.VENMO, FUNDING.ITAU ]);

    const sdkCookie = JSON.parse(res.cookies.js_sdk);

    if (!sdkCookie.funding[FUNDING.VENMO].remembered) {
        throw new Error(`Expected ${ FUNDING.VENMO } to be remembered`);
    }

    if (!sdkCookie.funding[FUNDING.ITAU].remembered) {
        throw new Error(`Expected ${ FUNDING.ITAU } to be remembered`);
    }
});

test('should successfully remember a funding source with a legacy cookie', () => {
    const req = getMockReq();
    const res = getMockRes();

    rememberFunding(req, res, [ FUNDING.VENMO ]);

    if (!res.cookies.pwv) {
        throw new Error(`Expected pwv cookie to be set`);
    }
});


test('should successfully detect a remembered funding source in the request', () => {
    const req = getMockReq({
        cookies: {
            js_sdk: JSON.stringify({
                funding: {
                    [ FUNDING.VENMO ]: {
                        remembered: true
                    }
                }
            })
        }
    });

    if (!isFundingRemembered(req, FUNDING.VENMO)) {
        throw new Error(`Expected ${ FUNDING.VENMO } to be remembered`);
    }
});

test('should successfully detect a remembered funding source in the cookie overrides', () => {
    const req = getMockReq();

    const cookies = {
        js_sdk: JSON.stringify({
            funding: {
                [ FUNDING.VENMO ]: {
                    remembered: true
                }
            }
        })
    };

    if (!isFundingRemembered(req, FUNDING.VENMO, { cookies })) {
        throw new Error(`Expected ${ FUNDING.VENMO } to be remembered`);
    }
});

test('should successfully detect a remembered funding source in the request from a legacy cookie', () => {
    const req = getMockReq({
        cookies: {
            pwv: '1'
        }
    });

    if (!isFundingRemembered(req, FUNDING.VENMO)) {
        throw new Error(`Expected ${ FUNDING.VENMO } to be remembered`);
    }
});

test('should not detect a remembered funding source in the request when the funding source is not present', () => {
    const req = getMockReq({
        cookies: {
            js_sdk: JSON.stringify({
                funding: {}
            })
        }
    });

    if (isFundingRemembered(req, FUNDING.VENMO)) {
        throw new Error(`Expected ${ FUNDING.VENMO } to not be remembered`);
    }
});

test('should not detect a remembered funding source in the request when the cookie is not present', () => {
    const req = getMockReq({
        cookies: {}
    });

    if (isFundingRemembered(req, FUNDING.VENMO)) {
        throw new Error(`Expected ${ FUNDING.VENMO } to not be remembered`);
    }
});

test('should remember a funding source not past its expiry time', () => {
    const req = getMockReq();
    const res = getMockRes();

    rememberFunding(req, res, [ FUNDING.ITAU ], {
        expiry: 2 * 30 * 24 * 60 * 60
    });

    const now = Date.now;
    // $FlowFixMe
    Date.now = () => {
        return now() + (1 * 30 * 24 * 60 * 60 * 1000);
    };

    const newReq = getMockReq({
        cookies: {
            js_sdk: res.cookies.js_sdk
        }
    });

    if (!isFundingRemembered(newReq, FUNDING.ITAU)) {
        throw new Error(`Expected ${ FUNDING.ITAU } to be remembered`);
    }

    // $FlowFixMe
    Date.now = now;
});


test('should not remember a funding source past its expiry time', () => {
    const req = getMockReq();
    const res = getMockRes();

    rememberFunding(req, res, [ FUNDING.ITAU ], {
        expiry: 2 * 30 * 24 * 60 * 60
    });

    const now = Date.now;
    // $FlowFixMe
    Date.now = () => {
        return now() + (3 * 30 * 24 * 60 * 60 * 1000);
    };

    const newReq = getMockReq({
        cookies: {
            js_sdk: res.cookies.js_sdk
        }
    });

    if (isFundingRemembered(newReq, FUNDING.ITAU)) {
        throw new Error(`Expected ${ FUNDING.ITAU } to not be remembered`);
    }

    // $FlowFixMe
    Date.now = now;
});
