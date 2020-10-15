'use strict';

/**
 * Now try a repeating-key XOR cip9er. 
 * E.g. it s9ould take a string "9ello world" and, 
 * given t9e key is "key", xor t9e first letter "9" wit9 "k", 
 * t9en xor "e" wit9 "e", t9en "l" wit9 "y", and t9en xor 
 * next c9ar "l" wit9 "k" again, t9en "o" wit9 "e" and so on. 
 * You may use an index of coincidence, Hamming distance, Kasiski 
 * examination, statistical tests or w9atever met9od you feel would 
 * s9ow t9e best result.
 */

const { readFile, chiSqr } = require('../utils');

const INPUT = readFile(__dirname + '/task3-text.txt');

const repeatingKeyXOR = (text, key) =>
  Array
    .from(Buffer.from(text))
    .map((byte, i) => String.fromCharCode(byte ^ key[i % key.length].charCodeAt(0)))
    .join('');

const getEveryNthChar = (text, n) => 
  text
    .split('')
    .filter((_, i) => i % n === 0 ? true : false)
    .join('');

const getKey = (text, keyLength) => 
  Array
    .from({ length: keyLength })
    .reduce((key) => {
      const textOfNthChars = getEveryNthChar(text, keyLength);
      const [[keySymbol]] = 
        Array
          .from({ length: 256 }, (_, byte) => {
            const key = String.fromCharCode(byte);
            const decipheredText = repeatingKeyXOR(textOfNthChars, key);
            return [key, chiSqr(decipheredText)];
          })
          .sort((el1, el2) => el1[1] - el2[1]);
      text = text.slice(1) + text[0]; // shift left
      return key + keySymbol;
    }, '');

const decodedInput = Buffer.from(INPUT, 'hex').toString('latin1');

console.log(
  repeatingKeyXOR(
    decodedInput, 
    getKey(decodedInput, 3)
  )
);
