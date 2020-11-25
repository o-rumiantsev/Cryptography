'use strict';

const fs = require('fs');

const ALPHA_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const ALPHA_UPPER = ALPHA_LOWER.toUpperCase();
const NUMERIC = '1234567890';
const SPECIAL = '!@#$_';
const CHARSET = ALPHA_LOWER + ALPHA_UPPER + NUMERIC + SPECIAL;

const MIN_RANDOM_PASSWORD_LENGTH = 8;
const MAX_RANDOM_PASSWORD_LENGTH = 16;

const commonPasswords = {
  TOP_100: fs.readFileSync(__dirname + '/10-million-password-list-top-100.txt', 'utf8').split('\n'),
  TOP_1M: fs.readFileSync(__dirname + '/10-million-password-list-top-1000000.txt', 'utf8').split('\n'),
};

const toggleCase = (character) =>
  character === character.toLowerCase() 
    ? character.toUpperCase() 
    : character.toLowerCase();

const rules = {
  lowercase(password) {
    return password.toLowerCase();
  },
  uppercase(password) {
    return password.toUpperCase();
  },
  capitalize(password) {
    return password[0].toUpperCase() + password.slice(1).toLowerCase();
  },
  invertCapitalize(password) {
    return password[0].toLowerCase() + password.slice(1).toUpperCase();
  },
  toggleCase(password) {
    return password.split('').map(toggleCase).join('');
  },
  toggleCaseN(password) {
    const n = Math.floor(Math.random() * password.length);
    return password.slice(0, n)
      + toggleCase(password[n])
      + password.slice(n + 1);
  },
  reverse(password) {
    return password.split('').reverse().join('');
  },
  duplicate(password) {
    return password.repeat(2);
  },
  duplicateN(password) {
    const n = Math.floor(Math.random() * 9);
    return password.repeat(n + 1);
  },
  reflect(password) {
    return password + this.reverse(password);
  },
  rotateLeft(password) {
    return password.slice(1) + password[0];
  },
  rotateRight(password) {
    return password.slice(-1) + password.slice(0, -1);
  },
  appendCharacter(password) {
    const character = CHARSET[Math.floor(Math.random() * CHARSET.length)];
    return password + character;
  },
  prependCharacter(password) {
    const character = CHARSET[Math.floor(Math.random() * CHARSET.length)];
    return character + password;
  },
  replace(password) {
    const characterX = CHARSET[Math.floor(Math.random() * CHARSET.length)];
    const characterY = CHARSET[Math.floor(Math.random() * CHARSET.length)];
    return password.replace(new RegExp(characterX, 'g'), characterY);
  },
  duplicateAll(password) {
    return password.split('').map(character => character.repeat(2)).join('');
  },
};

module.exports = {
  fromTop100Common() {
    const index = Math.floor(Math.random() * commonPasswords.TOP_100.length);
    return commonPasswords.TOP_100[index];
  },
  fromTop1MCommon() {
    const index = Math.floor(Math.random() * commonPasswords.TOP_1M.length);
    return commonPasswords.TOP_1M[index];
  },
  fromRules() {
    const password = this.fromTop1MCommon();
    const ruleNames = Object.keys(rules);
    const randomRuleName = ruleNames[Math.floor(Math.random() * ruleNames.length)];
    return rules[randomRuleName](password);
  },
  reallyRandom() {
    const passwordCharacters = [];
    const length = Math.round(
      Math.random() * 
      (MAX_RANDOM_PASSWORD_LENGTH - MIN_RANDOM_PASSWORD_LENGTH) +
      MIN_RANDOM_PASSWORD_LENGTH
    );

    for (let i = 0; i < length; ++i) {
      const charater = CHARSET[Math.floor(Math.random() * CHARSET.length)];
      passwordCharacters.push(charater);
    }

    return passwordCharacters.join('');
  },
};
