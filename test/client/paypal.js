/* @flow */

import { setupSDK, insertMockSDKScript } from '@paypal/sdk-client/src';

import * as paypalFundingComponents from '../../src/interface'; // eslint-disable-line import/no-namespace

insertMockSDKScript();

window.mockDomain = 'mock://www.merchant.com';

setupSDK([
    {
        name:     'paypal-funding',
        requirer: () => paypalFundingComponents
    }
]);
