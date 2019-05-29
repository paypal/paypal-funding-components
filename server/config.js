/* @flow */

import { FUNDING } from '@paypal/sdk-constants';

export const LEGACY_COOKIES : { [$Values<typeof FUNDING>] : string } = {
    [ FUNDING.VENMO ]: 'pwv'
};
