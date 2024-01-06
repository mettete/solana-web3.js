[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/web3.js.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/web3.js.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/web3.js
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# Solana JavaScript SDK - Interact with the Solana Blockchain

Use this to interact with accounts and programs on the Solana network through the Solana [JSON RPC API](https://docs.solana.com/apps/jsonrpc-api).

## Installation

### Installation for Node.js or Web Applications

```
$ npm install --save @solana/web3.js
```

### For use in a browser, without a build system

```html
<!-- Development (un-minified) -->
<script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.js"></script>

<!-- Production (minified) -->
<script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js"></script>
```

## Documentation and Examples

- Explore [The Solana Cookbook](https://solanacookbook.com/) for comprehensive task-based documentation and practical examples using this library.
- For more detail on individual functions, see the [latest API Documentation](https://solana-labs.github.io/solana-web3.js)

## Getting Help

Have a question or a problem? Check the [Solana Stack Exchange](https://solana.stackexchange.com) to see if anyone else is having the same one. If not, [post a new question](https://solana.stackexchange.com/questions/ask).

Include:

- A detailed description of what you're trying to achieve
- Source code, if possible
- The text of any errors you encountered, with stacktraces if available

## Compatibility

Ensure your JavaScript runtime environment supports [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) and the [exponentiation operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Exponentiation). Both are supported in the following runtimes:

- Browsers, by [release date](https://caniuse.com/bigint):
    - Chrome: May 2018
    - Firefox: July 2019
    - Safari: September 2020
    - Mobile Safari: September 2020
    - Edge: January 2020
    - Opera: June 2018
    - Samsung Internet: April 2019
- Runtimes, [by version](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt):
    - Deno: >=1.0
    - Node: >=10.4.0
- React Native:
    - >=0.7.0 using the [Hermes](https://reactnative.dev/blog/2022/07/08/hermes-as-the-default) engine ([integration guide](https://solanacookbook.com/integrations/react-native.html#how-to-use-solana-web3-js-in-a-react-native-app)):

## Development Environment Setup

### Testing

#### Unit Tests

To run the full suite of unit tests, execute the following in the root:

```shell
$ npm test
```

#### Integration Tests

Integration tests require a validator client running on your machine.

To install a test validator:

```shell
$ npm run test:live-with-test-validator:setup
```

To start the test validator and run all of the integration tests in live mode:

```shell
$ cd packages/library-legacy
$ npm run test:live-with-test-validator
```

### Speed Up Build Times with Remote Caching

Cache build artifacts remotely so that you, others, and the CI server can take advantage of each others' build efforts.

1. Log the Turborepo CLI into the Solana Vercel account
    ```shell
    pnpm turbo login
    ```
2. Link the repository to the remote cache
    ```shell
    pnpm turbo link
    ```

## Contributing

Found a bug or have a feature request? [File an issue](https://github.com/solana-labs/solana-web3.js/issues/new) to let us know. If, based on the discussion on an issue you would like to offer a code change, please make a [pull request](https://github.com/solana-labs/solana-web3.js/compare). If neither of these describes what you would like to contribute, read the [getting help](#getting-help) section above.

## Disclaimer

All claims, content, designs, algorithms, estimates, roadmaps,
specifications, and performance measurements described in this project
are done with the Solana Foundation's ("SF") best efforts. It is up to
the reader to check and validate their accuracy and truthfulness.
Furthermore, nothing in this project constitutes a solicitation for
investment.

Any content produced by SF or developer resources that SF provides, are
for educational and inspiration purposes only. SF does not encourage,
induce or sanction the deployment, integration or use of any such
applications (including the code comprising the Solana blockchain
protocol) in violation of applicable laws or regulations and hereby
prohibits any such deployment, integration or use. This includes use of
any such applications by the reader (a) in violation of export control
or sanctions laws of the United States or any other applicable
jurisdiction, (b) if the reader is located in or ordinarily resident in
a country or territory subject to comprehensive sanctions administered
by the U.S. Office of Foreign Assets Control (OFAC), or (c) if the
reader is or is working on behalf of a Specially Designated National
(SDN) or a person subject to similar blocking or denied party
prohibitions.

The reader should be aware that U.S. export control and sanctions laws
prohibit U.S. persons (and other persons that are subject to such laws)
from transacting with persons in certain countries and territories or
that are on the SDN list. As a project based primarily on open-source
software, it is possible that such sanctioned persons may nevertheless
bypass prohibitions, obtain the code comprising the Solana blockchain
protocol (or other project code or applications) and deploy, integrate,
or otherwise use it.
