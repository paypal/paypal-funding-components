/* @flow */

import { FUNDING } from '@paypal/sdk-constants';

type LegacyCookies = {
    [$Values<typeof FUNDING>] : {|
        key : string,
        read : boolean,
        write : boolean
    |}
};

export const LEGACY_COOKIES : LegacyCookies = {
    [ FUNDING.PAYPAL ]: {
        key:   'login_email',
        read:  true,
        write: false
    },
    [ FUNDING.VENMO ]: {
        key:   'pwv',
        read:  true,
        write: true
    }
};
