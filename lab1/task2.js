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

const fs = require('fs');

const input = fs.readFileSync(__dirname + '/task3-text.txt', 'utf8');

const shiftArray = (array) => array.unshift(array.pop());

const shiftArrayLeft = (array) => array.push(array.shift());

const getBytes = (input) => Array.from(Buffer.from(input, 'hex'));

const getMatchesCount = (bytes1, bytes2) => bytes1.reduce(
  (matches, cur, i) => cur === bytes2[i] ? matches + 1 : matches,
  0
);

const getKasiskiExamination = (inputBytes) => {
  const shiftedBytes = [...inputBytes];
  const matches = []

  for (let i = 0; i < inputBytes.length; ++i) {
    const matchesCount = getMatchesCount(inputBytes, shiftedBytes);
    matches.push(matchesCount);
    shiftArray(shiftedBytes);
  }
  
  return matches;
};

const getOccurenciesAnalysis = (inputBytes) => {
  const counts = new Map();

  inputBytes.forEach(byte => {
    const count = counts.get(byte) || 0;
    counts.set(byte, count + 1);
  });

  return counts;
};

const getMostFrequentByte = (inputBytes) => {
  const frequencyAnalysis = getOccurenciesAnalysis(inputBytes);
  return [...frequencyAnalysis.entries()]
    .reduce(([byte, count], [curByte, curCount]) => 
      curCount > count ? [curByte, curCount] : [byte, count]
    )[0];
};

const repeatingKeyXOR = (bytes, key) => {
  const keyBytes = Array.from(Buffer.from(key));

  return bytes.map((byte, i) => byte ^ keyBytes[i % keyBytes.length]);
};

const getEveryNthChar = (bytes, n) => 
  bytes.filter((_, i) => i % n === 0 ? true : false);

const getKey = (inputBytes, keyLength) => {
  const bytes = [...inputBytes];
  const keyBytes = [];

  for (let i = 0; i < keyLength; ++i) {
    keyBytes.push(getMostFrequentByte(getEveryNthChar(bytes, keyLength)) ^ ' '.charCodeAt(0));
    shiftArrayLeft(bytes);
  }

  return Buffer.from(keyBytes).toString();
}

const inputBytes = getBytes(input);

console.log(getKasiskiExamination(inputBytes));
console.log(
  Buffer.from(
    repeatingKeyXOR(
      inputBytes, 
      getKey(inputBytes, 3 /* key length determined by Kasiski examination */ )
    )
  ).toString()
);
