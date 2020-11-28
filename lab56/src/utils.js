'use strict';

const fs = require('fs');
const path = require('path');
const nacl = require('tweetnacl');

const ARGON_SALT_LENGTH = 16;
const NONCE_LENGTH = nacl.secretbox.nonceLength;
const KEY = Uint8Array.from(
  fs.readFileSync(path.join(__dirname, '..', process.env.CIPHER_KEY_FILE))
);
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
  arrayToString: (array) => Buffer.from(array).toString('hex'),
};

module.exports = {
  convert,
  ARGON_SALT_LENGTH,
  NONCE_LENGTH,
  KEY,
  COMMON_PASSWORDS,
};
