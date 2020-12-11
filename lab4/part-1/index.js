'use strict';

const fs = require('fs');
const crypto = require('crypto');
const sha1 = require('sha1');
const bcrypt = require('bcrypt');
const md5 = require('md5');
const passwordGenerator = require('./password-generator');

const PASSWORDS_COUNT = 100000;
const TOP_100_COUNT = PASSWORDS_COUNT * 0.1;
const TOP_1M_COUNT = PASSWORDS_COUNT * 0.8;
const FROM_RULES_COUNT = PASSWORDS_COUNT * 0.06;
const RANDOM_COUNT = PASSWORDS_COUNT * 0.04;

const generatePasswords = (generate, count) => {
  const passwords = [];
  for (let i = 0; i < count; ++i) {
    passwords.push(generate());
  }
  return passwords;
};

const passwordsSet = [
  ...generatePasswords(() => passwordGenerator.fromTop100Common(), TOP_100_COUNT),
  ...generatePasswords(() => passwordGenerator.fromTop1MCommon(), TOP_1M_COUNT),
  ...generatePasswords(() => passwordGenerator.fromRules(), FROM_RULES_COUNT),
  ...generatePasswords(() => passwordGenerator.reallyRandom(), RANDOM_COUNT),
].sort(() => Math.random() - 0.5);

const getSalt = () => crypto.randomBytes(16).toString('hex');

Promise.all(
  [
    /**
     * Hash SHA1
     */
    (password) => {
      const salt = getSalt();
      return [sha1(password + salt), salt].join();
    },

    /**
     * Hash bcrypt
     */
    (password) => bcrypt.hash(password, 5),

    /**
     * Hash MD5
     */
    (password) => md5(password),
  ]
    .map((hash, i) => 
      Promise
        .all(passwordsSet.map(hash))
        .then((results) => {
          const data = results.join('\n');
          return fs.promises.writeFile(`password-set-${i + 1}.csv`, data);
        })
    )
).catch(console.error);
