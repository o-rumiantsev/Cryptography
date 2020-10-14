'use strict';

/**
 * Write a piece of software to attack a single-byte XOR 
 * cipher which is the same as Caesar but with xor op.
 */

const { readFile, getMostOccurentByte } = require('../utils');

const input = readFile(__dirname + '/task2-text.txt');

const singleByteXOR = (bytes, keyByte) => bytes.map(byte => byte ^ keyByte);

const getKey = (bytes) => {
  const mostOccurentByte = getMostOccurentByte(bytes);
  return mostOccurentByte ^ ' '.charCodeAt(0);
};

const bytes = Array.from(Buffer.from(input));
const decipheredBytes = singleByteXOR(bytes, getKey(bytes));

console.log(Buffer.from(decipheredBytes).toString())
