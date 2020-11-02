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
    const count = (text.match(new RegExp(symbol, 'g')) || []).length;
    const expectedCount = text.length * ENGLISH_FREQUENCY[symbol];
    const chi = (count - expectedCount) ** 2 / expectedCount;
    return sum + chi;
  }, 0);

const probably = (probability) => Math.random() < probability;

const getTrigrams = (text) => {
  const trigrams = {};
  let overallTrigramsOccurrences = 0;

  for (let i = 0; i < text.length - 2; ++i) {
    const trigram = text.slice(i, i + 3);
    if (!trigrams.hasOwnProperty(trigram)) {
      const occurrencesCount = text.match(new RegExp(trigram, 'ig')).length;
      trigrams[trigram] = occurrencesCount;
      overallTrigramsOccurrences += occurrencesCount;
    }
  }

  for (const trigram in trigrams) {
    trigrams[trigram] = trigrams[trigram] / overallTrigramsOccurrences * 100;
  }

  return trigrams;
};

const TRIGRAMS = Object.fromEntries(
  readFile(__dirname + '/english_trigrams.csv')
    .split('\n')
    .map(line => line.split(','))
    .map(entry => [entry[0], parseFloat(entry[1])])
);

const getMatchesCount = (s1, s2) => s1.split('').reduce(
  (matches, cur, i) => cur === s2[i] ? matches + 1 : matches,
  0
);

const getIndicesOfCoincdence = (text) => {
  const matches = []
  for (let i = 1; i < text.length; ++i) {
    const shifted = text.slice(i) + text.slice(0, i);
    const matchesCount = getMatchesCount(text, shifted);
    matches.push(matchesCount / text.length);
  }
  return matches;
};

const getKeyLength = (text) => {
  const iocs = getIndicesOfCoincdence(text);
  const sum = iocs.reduce((s, i) => s + i);
  const mean = sum / iocs.length;
  return iocs.map((ioc, i) => ioc > mean ? i + 1 : null).filter(Boolean)[0];
};

module.exports = {
  readFile,
  shiftArray,
  shiftArrayLeft,
  chiSqr,
  probably,
  getTrigrams,
  getKeyLength,
  getIndicesOfCoincdence,
  TRIGRAMS,
};
