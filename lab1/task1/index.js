'use strict';

/**
 * Write a piece of software to attack a single-byte XOR 
 * cipher which is the same as Caesar but with xor op.
 */

const { readFile, chiSqr } = require('../utils');

const INPUT = readFile(__dirname + '/task2-text.txt');

const singleByteXOR = (text, key) =>
  Array
    .from(Buffer.from(text))
    .map(byte => String.fromCharCode(byte ^ key.charCodeAt(0)))
    .join('');

const [[key]] = 
  Array
    .from({ length: 256 }, (_, byte) => {
      const key = String.fromCharCode(byte);
      const decipheredText = singleByteXOR(INPUT, key);
      return [key, chiSqr(decipheredText)];
    })
    .sort((el1, el2) => el1[1] - el2[1]);

console.log(singleByteXOR(INPUT, key));