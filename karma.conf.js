/* @flow */
/* eslint import/no-default-export: off */

import { getKarmaConfig } from 'grumbler-scripts/config/karma.conf';

import { WEBPACK_CONFIG_TEST } from './webpack.config';

export default function configKarma(karma : Object) {

    const karmaConfig = getKarmaConfig(karma, {
        basePath: __dirname,
        webpack:  WEBPACK_CONFIG_TEST
    });

    karma.set({
        ...karmaConfig,

        files: [
            {
                pattern:  'test/client/paypal.js',
                included: true,
                served:   true
            },

            ...karmaConfig.files
        ],

        preprocessors: {
            ...karmaConfig.preprocessors,
            'test/client/**/*.js': [ 'webpack', 'sourcemap' ]
        },

        coverageReporter: {
            reporters: [
                {
                    type: 'lcov',
                    dir:  'coverage/karma'
                }
            ]
        }
    });
}
