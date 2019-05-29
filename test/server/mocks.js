/* @flow */

export function getMockReq(overrides? : Object) : Object {
    const cookies = {};
    const query = {};
    const req = {
        query,
        cookies,
        ...overrides
    };
    return req;
}

export function getMockRes(overrides? : Object) : Object {
    const _status = 0;
    const body = '';
    const cookies = {};
    const headers = {};
    const res = {
        _status,
        body,
        cookies,
        headers,
        cookie: (key, value) => {
            res.cookies[key] = value;
            return res;
        },
        status: (val) => {
            res._status = val;
            return res;
        },
        send: (val) => {
            res.body = val;
            return res;
        },
        setHeader: (key, val) => {
            headers[key] = val;
            return res;
        },
        ...overrides
    };
    return res;
}

export function mockSDKMeta(url : string) : string {
    return Buffer.from(JSON.stringify({ url })).toString('base64');
}
