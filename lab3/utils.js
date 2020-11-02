'use strict';

const http = require('http');

/**
 * Simple HTTP GET tool
 * 
 * @param {string} url 
 * @returns {Promise<any>} response
 */
const request = (url) => new Promise(resolve => {
  let response = '';
  http.get(url, res => {
    res.on('data', (data) => response += data)
      .on('end', () => resolve(JSON.parse(response)));
  });
});

/**
 * Create account in casino
 *
 *  @returns {Promise<any>}
 */
const createAcc = (id) =>
  request(`http://95.217.177.249/casino/createacc?id=${id}`);

/**
 * Make bet on LCG machine
 * 
 * @param {string} id
 * @param {string} mode
 * @param {number} bet 
 * @param {number} number 
 * @returns {Promise<any>}
 */
const makeBet = (id, mode, bet, number) =>
  request(
    `http://95.217.177.249/casino/play${mode}?id=${id}&bet=${bet}&number=${number}`
  );

const playModes = {
  LCG: 'Lcg',
  MT: 'Mt',
};
  
module.exports = {
  createAcc,
  makeBet,
  playModes,
};
