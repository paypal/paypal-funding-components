/* @flow */

module.exports = {
    'extends': '@krakenjs/eslint-config-grumbler/eslintrc-browser',

    globals: {
        __STAGE__: true,
        __VERSION__: true,

        __SDK_HOST__: true,
        __HOST__: true,
        __HOSTNAME__: true,
        __PORT__: true,
        __PATH__: true,
        __STAGE_HOST__: true,
        __SERVICE_STAGE_HOST__: true,
        __CORRELATION_ID__: true,
        __NAMESPACE__: true
    }
};