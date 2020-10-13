'use strict';

const shiftArray = (array) => array.unshift(array.pop());

const shiftArrayLeft = (array) => array.push(array.shift());

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

module.exports = {
  shiftArray,
  shiftArrayLeft,
  getMostOccurentByte,
};
