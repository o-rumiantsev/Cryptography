'use strict';

const fs = require('fs');
const path = require('path');

const COMMON_PASSWORDS = fs
  .readFileSync(
    path.join(__dirname, '..', process.env.COMMON_PASSWORDS_FILE),
    'utf8'
  )
  .split('\n');

const convert = {
  stringToArray: (string, encoding) => Uint8Array.from(
    Buffer.from(string, encoding)
  ),
  arrayToString: (array, arrayEncoding, stringEncoding) =>
    Buffer.from(array, arrayEncoding).toString(stringEncoding),
};

module.exports = {
  convert,
  COMMON_PASSWORDS,
};
