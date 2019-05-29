/* @flow */

// eslint-disable-next-line import/no-nodejs-modules
import crypto from 'crypto';

import type { ExpressRequest } from './types';

export function getNonce() : string {
    return crypto.randomBytes(16)
        .toString('base64').replace(/[^a-zA-Z0-9]+/g, '');
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
