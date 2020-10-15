'use strict';

const fs = require('fs');

const ENGLISH_FREQUENCY = require('./english-letters-frequency.json');

const ALPHABET = Array.from(
  { length: 26 }, 
  (_, i) => String.fromCharCode('a'.charCodeAt(0) + i)
).join('');

const readFile = (filename) => fs.readFileSync(filename, 'utf8');

const shiftArray = (array) => array.unshift(array.pop());

const shiftArrayLeft = (array) => array.push(array.shift());

const chiSqr = (text) =>
  ALPHABET.split('').reduce((sum, symbol) => {
    const count = (text.match(new RegExp(symbol, 'gi')) || []).length;
    const expectedCount = text.length * ENGLISH_FREQUENCY[symbol];
    const chi = (count - expectedCount) ** 2 / expectedCount;
    return sum + chi;
  }, 0);

const getOccurenciesAnalysis = (bytes) => {
  const counts = new Map();

  bytes.forEach(byte => {
    const count = counts.get(byte) || 0;
    counts.set(byte, count + 1);
  });

  return counts;
};

const getMostOccurentByte = (bytes) => {
  const frequencyAnalysis = getOccurenciesAnalysis(bytes);
  return [...frequencyAnalysis.entries()]
    .reduce(([byte, count], [curByte, curCount]) => 
      curCount > count ? [curByte, curCount] : [byte, count]
    )[0];
};

const probably = (probability) => Math.random() < probability;

module.exports = {
  readFile,
  shiftArray,
  shiftArrayLeft,
  chiSqr,
  getMostOccurentByte,
  probably,
};
