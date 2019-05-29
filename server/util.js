/* @flow */

import type { ExpressRequest, ExpressResponse } from './types';

export function getNonce(res : ExpressResponse) : string {
    const nonce = res.locals && res.locals.nonce;
    return (nonce && typeof nonce === 'string') ? nonce : '';
}

export function getQuery(req : ExpressRequest) : { [string] : string }  {
    const result = {};
    for (const key of Object.keys(req.query)) {
        const val = req.query[key];
        if (key && val && typeof val === 'string') {
            result[key] = val;
        }
    }
    return result;
}

export function buildCSP(obj : { [string] : string }) : string {
    return Object.keys(obj).map(key => {
        return `${ key } ${ obj[key] };`;
    }).join('');
}
