'use strict';

/**
 * Write a piece of software to attack a single-byte XOR 
 * cipher which is the same as Caesar but with xor op.
 */

const fs = require('fs');

const input = fs.readFileSync(__dirname + '/task2-text.txt', 'utf8');

const singleByteXOR = (text, key) => 
  text
    .split('')
    .map(symbol => String.fromCharCode(symbol.charCodeAt(0) ^ key))
    .join('');

for (let i = 1; i < 100; ++i) {
  console.log(i, singleByteXOR(input, i));
}
