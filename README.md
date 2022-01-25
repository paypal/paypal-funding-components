PayPal Funding Components
-------------------------


[![build status][build-badge]][build]
[![code coverage][coverage-badge]][coverage]
[![npm version][version-badge]][package]
[![apache license][license-badge]][license]

[build-badge]: https://img.shields.io/github/workflow/status/paypal/paypal-funding-components/build?logo=github&style=flat-square
[build]: https://github.com/paypal/paypal-funding-components/actions?query=workflow%3Abuild
[coverage-badge]: https://img.shields.io/codecov/c/github/paypal/paypal-funding-components.svg?style=flat-square
[coverage]: https://codecov.io/github/paypal/paypal-funding-components/
[version-badge]: https://img.shields.io/npm/v/@paypal/funding-components.svg?style=flat-square
[package]: https://www.npmjs.com/package/@paypal/funding-components
[license-badge]: https://img.shields.io/npm/l/@paypal/funding-components.svg?style=flat-square
[license]: https://github.com/paypal/paypal-funding-components/blob/master/LICENSE

PayPal JavaScript SDK module to deal with funding sources and eligibility.

## Remember a funding source from the client-side

Note: your client-id and domain must be approved to call this function

```javascript
paypal.rememberFunding([ paypal.FUNDING.VENMO ]);
```

## Remember a funding source from the server-side

```javascript
import { rememberFunding } from '@paypal/funding-components';
import { FUNDING } from '@paypal/sdk-constants';

rememberFunding(req, res, [ FUNDING.VENMO ]);
```

## Check a remembered funding source from the server-side

```javascript
import { isFundingRemembered } from '@paypal/funding-components';
import { FUNDING } from '@paypal/sdk-constants';

if (isFundingRemembered(req, FUNDING.VENMO)) {
    // ...
}
```

Pass in a custom set of cookies:

```javascript
isFundingRemembered(req, FUNDING.VENMO, { cookies })
```


Quick Start
-----------

#### Installing

```bash
npm install --save @paypal/funding-components
```

#### Getting Started

- Fork the module
- Run setup: `npm run setup`
- Start editing code in `./src` and writing tests in `./tests`
- `npm run build`

#### Building

```bash
npm run build
```

#### Tests

- Edit tests in `./test/tests`
- Run the tests:

  ```bash
  npm test
  ```
