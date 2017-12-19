# Numeric separator support for Acorn

[![NPM version](https://img.shields.io/npm/v/acorn-numeric-separator.svg)](https://www.npmjs.org/package/acorn-numeric-separator)

This is a plugin for [Acorn](http://marijnhaverbeke.nl/acorn/) - a tiny, fast JavaScript parser, written completely in JavaScript.

It implements support for numeric separators as defined in the stage 3 proposal [Numeric Separators](https://github.com/tc39/proposal-numeric-separator).

## Usage

You can use this module directly in order to get an Acorn instance with the plugin installed:

```javascript
var acorn = require('acorn-numeric-separator');
```

Or you can use `inject.js` for injecting the plugin into your own version of Acorn like this:

```javascript
var acorn = require('acorn-numeric-separator/inject')(require('./custom-acorn'));
```

Then, use the `plugins` option to enable the plugiin:

```javascript
var ast = acorn.parse(code, {
  plugins: { numericSeparator: true }
});
```

## License

This plugin is released under the [GNU Affero General Public License](./LICENSE).
