/* @flow */

export const testGlobals = {
    __PORT__:       8000,
    __STAGE_HOST__: 'msmaster.qa.paypal.com',
    __HOST__:       'test.paypal.com',
    __HOSTNAME__:   'test.paypal.com',
    __SDK_HOST__:   'test.paypal.com',
    __PATH__:       '/sdk/js',

    __PAYPAL_DOMAIN__:     'mock://www.paypal.com',
    __PAYPAL_API_DOMAIN__: 'mock://msmaster.qa.paypal.com',

    __VERSION__:        '1.0.45',
    __CORRELATION_ID__: 'abc123',
    __NAMESPACE__:      'paypal',

    __FUNDING_ELIGIBILITY__: {
        paypal: {
            eligible: true
        },
        itau: {
            eligible: false
        }
    }
};
