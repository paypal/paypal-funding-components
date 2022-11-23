/* @flow */
/* eslint import/no-nodejs-modules: off */

import type { WebpackConfig } from "@krakenjs/webpack-config-grumbler/index.flow";
import { getWebpackConfig } from "@krakenjs/webpack-config-grumbler";

import { testGlobals } from './test/client/test-globals';

export const WEBPACK_CONFIG_TEST : WebpackConfig = getWebpackConfig({
    test:       true,
    vars:       {
        ...testGlobals
    }
});
